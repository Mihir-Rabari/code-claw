import type { CodeClawMemoryProposalRecord } from '@codeclaw/types';

import { loadGithubAppEnv, openMemoryProposalPullRequest } from '@codeclaw/github';

import { getObservations, updateMemoryProposal } from './store.js';

export interface MemoryProposalRepoRef {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
}

export interface OpenMemoryProposalOptions {
  installationId: number;
  repo: MemoryProposalRepoRef;
  proposal: CodeClawMemoryProposalRecord;
}

function buildProposalMarkdown(proposal: CodeClawMemoryProposalRecord, repo: MemoryProposalRepoRef) {
  const evidence = getObservations(repo.fullName)
    .filter((item) => item.title.toLowerCase().includes(proposal.pattern) || item.body.toLowerCase().includes(proposal.pattern))
    .slice(0, 5)
    .map((item) => `- ${item.title} — ${item.body}`)
    .join('\n');

  return `# ${proposal.title}

Repository: ${repo.fullName}

Pattern: ${proposal.pattern}

Reasoning:
${proposal.reason}

Evidence:
${evidence || '- No additional evidence captured yet.'}

Suggested action:
- Review the pattern with the team.
- Merge only if this reflects the repo’s current engineering standard.
`;
}

function buildProposalPullRequestBody(proposal: CodeClawMemoryProposalRecord, repo: MemoryProposalRepoRef, evidenceCount: number) {
  return `## Memory proposal for ${repo.fullName}

CodeClaw observed a repeated pattern and is opening this proposal for human review.

### Pattern
${proposal.pattern}

### Reason
${proposal.reason}

### Evidence
${evidenceCount} observation(s) were gathered from recent repository activity.

### What this PR contains
A markdown proposal file in .codeclaw/memory-proposals/ so the team can review the recommendation before it is promoted.
`;
}

export async function openMemoryProposalForRepo(options: OpenMemoryProposalOptions) {
  if (options.proposal.prUrl) {
    return { url: options.proposal.prUrl, number: undefined, branchName: undefined };
  }

  const env = loadGithubAppEnv();
  const evidence = getObservations(options.repo.fullName)
    .filter((item) => item.title.toLowerCase().includes(options.proposal.pattern) || item.body.toLowerCase().includes(options.proposal.pattern))
    .slice(0, 5);

  const proposalFilePath = `.codeclaw/memory-proposals/${options.proposal.pattern}-${Date.now()}.md`;
  const result = await openMemoryProposalPullRequest({
    env,
    installationId: options.installationId,
    owner: options.repo.owner,
    repo: options.repo.name,
    defaultBranch: options.repo.defaultBranch,
    proposalFilePath,
    proposalMarkdown: buildProposalMarkdown(options.proposal, options.repo),
    pullRequestTitle: `🧠 Memory Update: ${options.proposal.title}`,
    pullRequestBody: buildProposalPullRequestBody(options.proposal, options.repo, evidence.length),
    label: 'codeclaw-memory',
  });

  updateMemoryProposal(options.proposal.id, {
    status: 'pending',
    prUrl: result.url,
  });

  return result;
}
