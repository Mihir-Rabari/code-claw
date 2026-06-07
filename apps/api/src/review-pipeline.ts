import type { Octokit } from 'octokit';
import { createGithubInstallationOctokit } from '@codeclaw/github';

import { callLlm } from './llm.js';
import { registerObservationFromText, recordReview } from './store.js';

export interface ReviewPipelineInput {
  installationId: number;
  owner: string;
  repo: string;
  prNumber: number;
}

export interface ReviewPipelineResult {
  prNumber: number;
  repoFullName: string;
  commentsPosted: number;
  observationsRecorded: string[];
  proposalTriggered: boolean;
}

interface MemoryContext {
  claw: string;
  index: string;
  relevantFiles: { path: string; content: string }[];
}

interface ParsedReviewPayload {
  summary: string;
  comments: { path: string; line: number; body: string }[];
  observations: string[];
}

function decodeBase64(content: string): string {
  return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf-8');
}

function extractMarkdownLinks(markdown: string): string[] {
  const links: string[] = [];
  const re = /\[[^\]]+\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const target = (match[1] ?? '').trim();
    if (!target || target.startsWith('http://') || target.startsWith('https://')) continue;
    links.push(target.replace(/^\.\//, '').replace(/^\/+/, ''));
  }
  return links;
}

function tokenizePath(path: string): string[] {
  return path
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function pickRelevantFiles(links: string[], diffFilenames: string[]): string[] {
  const diffTokens = new Set<string>();
  for (const filename of diffFilenames) {
    for (const token of tokenizePath(filename)) diffTokens.add(token);
  }

  const scored = links.map((link) => {
    const tokens = tokenizePath(link);
    let score = 0;
    for (const token of tokens) if (diffTokens.has(token)) score += 1;
    return { link, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.link)
    .slice(0, 8);
}

async function fetchMemoryContext(
  octokit: Octokit,
  owner: string,
  repo: string,
  diffFilenames: string[],
): Promise<MemoryContext> {
  let claw = '';
  let index = '';

  try {
    const clawRes = await octokit.rest.repos.getContent({ owner, repo, path: '.codeclaw/CLAW.md' });
    const data = clawRes.data;
    if (!Array.isArray(data) && 'content' in data && typeof data.content === 'string') {
      claw = decodeBase64(data.content);
    }
  } catch {
    claw = '';
  }

  try {
    const indexRes = await octokit.rest.repos.getContent({ owner, repo, path: '.codeclaw/INDEX.md' });
    const data = indexRes.data;
    if (!Array.isArray(data) && 'content' in data && typeof data.content === 'string') {
      index = decodeBase64(data.content);
    }
  } catch {
    index = '';
  }

  const links = index ? extractMarkdownLinks(index) : [];
  const relevant = pickRelevantFiles(links, diffFilenames);

  const relevantFiles: { path: string; content: string }[] = [];
  for (const path of relevant) {
    try {
      const res = await octokit.rest.repos.getContent({ owner, repo, path });
      const data = res.data;
      if (Array.isArray(data) || !('content' in data) || typeof data.content !== 'string') continue;
      relevantFiles.push({ path, content: decodeBase64(data.content) });
    } catch {
      // skip files we cannot read
    }
  }

  return { claw, index, relevantFiles };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n...[truncated]`;
}

function buildSystemPrompt(memory: MemoryContext): string {
  const clawSection = memory.claw
    ? `Repository memory (CLAW.md):\n${truncate(memory.claw, 2000)}`
    : 'Repository memory (CLAW.md) was not found.';

  const filesSection = memory.relevantFiles.length
    ? memory.relevantFiles
        .map((file) => `--- ${file.path} ---\n${truncate(file.content, 2000)}`)
        .join('\n\n')
    : 'No relevant memory files were found.';

  return `You are CodeClaw. Reviews must be grounded in the repository's own memory files. Do not give generic advice. If you cite a rule, cite the file path. Output strict JSON.

${clawSection}

Index of repository memory:
${truncate(memory.index, 1000) || '(no INDEX.md)'}

Relevant repository memory files:
${filesSection}`;
}

function buildUserPrompt(input: {
  title: string;
  body: string | null;
  files: { filename: string; status: string; additions: number; deletions: number; patch?: string }[];
}): string {
  const fileSummaries = input.files
    .map((file) => {
      const patch = file.patch ? `\nPatch:\n${truncate(file.patch, 2000)}` : '\nPatch: (none)';
      return `File: ${file.filename}\nStatus: ${file.status}\nAdditions: ${file.additions}, Deletions: ${file.deletions}${patch}`;
    })
    .join('\n\n');

  return `Review the following pull request.

PR Title: ${input.title}
PR Body:
${input.body ?? '(no body)'}

Files changed:
${fileSummaries || '(no files)'}

Respond with strict JSON of the shape:
{
  "summary": "One-paragraph overall review grounded in repo memory.",
  "comments": [{ "path": "src/foo.ts", "line": 42, "body": "Markdown. Must cite a .codeclaw file or say 'no relevant memory found'." }],
  "observations": ["Short pattern string, e.g. 'introduces redis cache for sessions'"]
}

Only include inline comments when you can point to a specific path and line in the diff. Otherwise, fold the feedback into the summary.`;
}

function parseLlmJson(raw: string): ParsedReviewPayload | null {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] ?? trimmed : trimmed;

  try {
    const parsed = JSON.parse(candidate) as Partial<ParsedReviewPayload>;
    if (!parsed || typeof parsed !== 'object') return null;

    const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    const comments = Array.isArray(parsed.comments)
      ? parsed.comments
          .filter((item): item is { path: string; line: number; body: string } => {
            if (!item || typeof item !== 'object') return false;
            const candidate = item as { path?: unknown; line?: unknown; body?: unknown };
            return (
              typeof candidate.path === 'string' &&
              typeof candidate.line === 'number' &&
              typeof candidate.body === 'string'
            );
          })
          .map((item) => ({ path: item.path, line: item.line, body: item.body }))
      : [];
    const observations = Array.isArray(parsed.observations)
      ? parsed.observations.filter((item): item is string => typeof item === 'string')
      : [];

    return { summary, comments, observations };
  } catch {
    return null;
  }
}

export async function runRealReview(input: ReviewPipelineInput): Promise<ReviewPipelineResult> {
  const octokit = createGithubInstallationOctokit(input.installationId);

  const pr = await octokit.rest.pulls.get({
    owner: input.owner,
    repo: input.repo,
    pull_number: input.prNumber,
  });

  const headSha = pr.data.head.sha;
  const title = pr.data.title ?? '';
  const body = pr.data.body ?? null;

  const filesRes = await octokit.rest.pulls.listFiles({
    owner: input.owner,
    repo: input.repo,
    pull_number: input.prNumber,
    per_page: 100,
  });

  const files = filesRes.data.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    ...(file.patch ? { patch: file.patch } : {}),
  }));

  const memory = await fetchMemoryContext(octokit, input.owner, input.repo, files.map((f) => f.filename));

  let commentsPosted = 0;
  const observationsRecorded: string[] = [];
  let proposalTriggered = false;

  const systemPrompt = buildSystemPrompt(memory);
  const userPrompt = buildUserPrompt({ title, body, files });

  let parsed: ParsedReviewPayload | null = null;
  try {
    const raw = await callLlm([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    parsed = parseLlmJson(raw);
  } catch (error) {
    console.error('LLM call failed during review:', error);
    parsed = null;
  }

  if (!parsed) {
    const fallback = `CodeClaw could not produce a structured review for this PR. The diff and repository memory were inspected but the LLM response could not be parsed.\n\nPR: #${input.prNumber} in ${input.owner}/${input.repo}.`;
    await octokit.rest.issues.createComment({
      owner: input.owner,
      repo: input.repo,
      issue_number: input.prNumber,
      body: fallback,
    });
    commentsPosted += 1;
  } else {
    const summaryBody = parsed.summary || 'CodeClaw review summary could not be produced.';
    try {
      await octokit.rest.issues.createComment({
        owner: input.owner,
        repo: input.repo,
        issue_number: input.prNumber,
        body: summaryBody,
      });
      commentsPosted += 1;
    } catch (error) {
      console.error('Failed to post summary comment:', error);
    }

    for (const comment of parsed.comments) {
      try {
        await octokit.rest.pulls.createReviewComment({
          owner: input.owner,
          repo: input.repo,
          pull_number: input.prNumber,
          body: comment.body,
          path: comment.path,
          line: comment.line,
          side: 'RIGHT',
          commit_id: headSha,
        });
        commentsPosted += 1;
      } catch (error) {
        console.error('Failed to post inline review comment:', error);
      }
    }
  }

  if (parsed) {
    for (const observation of parsed.observations) {
      if (!observation.trim()) continue;
      const result = registerObservationFromText({
        repoFullName: `${input.owner}/${input.repo}`,
        tag: 'Review',
        title: observation,
        body: observation,
        tone: 'neutral',
        source: 'review-pipeline',
      });
      observationsRecorded.push(observation);
      if (result.proposal) proposalTriggered = true;
    }
  }

  const reviewSummary = parsed?.summary
    ? truncate(parsed.summary, 240)
    : `Reviewed PR #${input.prNumber} in ${input.owner}/${input.repo}.`;

  recordReview({
    repo: `${input.owner}/${input.repo}`,
    pr: `#${input.prNumber}`,
    outcome: 'Posted by CodeClaw',
    reviewer: 'CodeClaw',
    summary: reviewSummary,
    time: 'Just now',
  });

  return {
    prNumber: input.prNumber,
    repoFullName: `${input.owner}/${input.repo}`,
    commentsPosted,
    observationsRecorded,
    proposalTriggered,
  };
}
