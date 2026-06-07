import type { GithubAppEnv } from './types.js';
import { createGithubInstallationOctokit } from './auth.js';

export interface OpenMemoryProposalPullRequestInput {
  env: GithubAppEnv;
  installationId: number;
  owner: string;
  repo: string;
  defaultBranch: string;
  proposalFilePath: string;
  proposalMarkdown: string;
  pullRequestTitle: string;
  pullRequestBody: string;
  label?: string;
  branchPrefix?: string;
}

function encodeMarkdown(markdown: string): string {
  const bytes = new TextEncoder().encode(markdown);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function createBranchName(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export async function openMemoryProposalPullRequest(input: OpenMemoryProposalPullRequestInput) {
  const octokit = createGithubInstallationOctokit(input.installationId, input.env);
  const branchName = createBranchName(input.branchPrefix ?? 'codeclaw/memory-proposal');

  const ref = await octokit.rest.git.getRef({
    owner: input.owner,
    repo: input.repo,
    ref: `heads/${input.defaultBranch}`,
  });

  await octokit.rest.git.createRef({
    owner: input.owner,
    repo: input.repo,
    ref: `refs/heads/${branchName}`,
    sha: ref.data.object.sha,
  });

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: input.owner,
    repo: input.repo,
    path: input.proposalFilePath,
    message: input.pullRequestTitle,
    content: encodeMarkdown(input.proposalMarkdown),
    branch: branchName,
  });

  const pullRequest = await octokit.rest.pulls.create({
    owner: input.owner,
    repo: input.repo,
    head: branchName,
    base: input.defaultBranch,
    title: input.pullRequestTitle,
    body: input.pullRequestBody,
  });

  if (input.label) {
    try {
      await octokit.rest.issues.addLabels({
        owner: input.owner,
        repo: input.repo,
        issue_number: pullRequest.data.number,
        labels: [input.label],
      });
    } catch {
      // Labeling is optional for the hackathon flow.
    }
  }

  return {
    number: pullRequest.data.number,
    url: pullRequest.data.html_url,
    branchName,
  };
}
