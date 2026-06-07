import type {
  CodeClawDashboardSnapshot,
  CodeClawInstallationStatus,
  CodeClawMemoryProposalRecord,
  CodeClawObservationRecord,
  CodeClawRepositoryMemoryItem,
  CodeClawReviewRecord,
} from '@codeclaw/types';

export interface GithubRepoRef {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
}

export interface CodeClawInstallationRecord {
  installationId: number;
  repository: GithubRepoRef;
  status: 'active' | 'warning' | 'error';
  installedAt: string;
  lastSyncedAt: string;
}

export interface CodeClawDashboardData extends CodeClawDashboardSnapshot {
  installations: CodeClawInstallationRecord[];
}

const now = () => new Date().toISOString();

const installations: CodeClawInstallationRecord[] = [
  {
    installationId: 101,
    repository: {
      owner: 'acme',
      name: 'web',
      fullName: 'acme/web',
      defaultBranch: 'main',
    },
    status: 'active',
    installedAt: now(),
    lastSyncedAt: now(),
  },
  {
    installationId: 102,
    repository: {
      owner: 'acme',
      name: 'api',
      fullName: 'acme/api',
      defaultBranch: 'main',
    },
    status: 'warning',
    installedAt: now(),
    lastSyncedAt: now(),
  },
];

const installationStatus: CodeClawInstallationStatus[] = [
  {
    label: 'GitHub app installation',
    tone: 'success',
    summary: 'Connected to the organization and scoped to selected repositories.',
    detail: 'Permissions look healthy. Webhook delivery is current.',
  },
  {
    label: 'Repository memory index',
    tone: 'success',
    summary: 'Markdown memory documents are being discovered from .codeclaw/.',
    detail: '32 files indexed across architecture, process, and decision notes.',
  },
  {
    label: 'Review ingestion',
    tone: 'warn',
    summary: 'Two repositories have pending review acknowledgements.',
    detail: 'The latest sync completed, but follow-up comments still need triage.',
  },
  {
    label: 'Observability',
    tone: 'neutral',
    summary: 'Basic health checks are in place for sync and webhook events.',
    detail: 'No incidents reported in the last 24 hours.',
  },
];

const repositoryMemory: CodeClawRepositoryMemoryItem[] = [
  {
    repo: 'acme/web',
    file: '.codeclaw/concepts/frontend-architecture.md',
    title: 'Frontend architecture notes',
    excerpt:
      'App router boundaries, shared UI expectations, and the current ownership map for the web client.',
    updated: '2h ago',
    tone: 'success',
  },
  {
    repo: 'acme/api',
    file: '.codeclaw/decisions/adr-001-use-zod.md',
    title: 'Validation standard',
    excerpt:
      'Preferred validation approach, where it applies, and the cases where lighter checks are still okay.',
    updated: '5h ago',
    tone: 'neutral',
  },
  {
    repo: 'acme/mobile',
    file: '.codeclaw/debates/auth-flow.md',
    title: 'Auth flow debate',
    excerpt:
      'Known sign-in behavior, token refresh expectations, and the last reviewed edge cases.',
    updated: 'Yesterday',
    tone: 'warn',
  },
  {
    repo: 'acme/infra',
    file: '.codeclaw/observations/runbooks.md',
    title: 'Runbook index',
    excerpt:
      'The most useful operational runbooks and where they sit in the repository memory tree.',
    updated: '2d ago',
    tone: 'neutral',
  },
];

const reviewHistory: CodeClawReviewRecord[] = [
  {
    repo: 'acme/web',
    pr: '#184',
    outcome: 'Approved with notes',
    reviewer: 'Atlas',
    time: 'Today',
    summary: 'Requested one accessibility pass and a tighter button label.',
  },
  {
    repo: 'acme/api',
    pr: '#391',
    outcome: 'Changes requested',
    reviewer: 'Mina',
    time: 'Today',
    summary: 'Suggested a smaller refactor and a clearer migration path.',
  },
  {
    repo: 'acme/mobile',
    pr: '#88',
    outcome: 'Merged',
    reviewer: 'Jordan',
    time: 'Yesterday',
    summary: 'Review closed cleanly after a short follow-up on async errors.',
  },
];

const observations: CodeClawObservationRecord[] = [
  {
    id: 'obs-1',
    repo: 'acme/web',
    tag: 'Attention',
    title: 'Two repos are a sync behind',
    body: 'Their repository memory is still within an acceptable window, but the index is older than the rest of the fleet.',
    tone: 'warn',
    createdAt: now(),
  },
  {
    id: 'obs-2',
    repo: 'acme/api',
    tag: 'Pattern',
    title: 'Review notes are short and actionable',
    body: 'Most recent review comments are concise and map cleanly to repository-owned memory files.',
    tone: 'neutral',
    createdAt: now(),
  },
  {
    id: 'obs-3',
    repo: 'acme/infra',
    tag: 'Healthy',
    title: 'Webhook delivery has stayed stable',
    body: 'There are no recent retries or queue backlogs in the current view.',
    tone: 'success',
    createdAt: now(),
  },
];

const memoryProposals: CodeClawMemoryProposalRecord[] = [
  {
    id: 'proposal-1',
    repo: 'acme/api',
    title: 'Validation standard appears to be settling on Zod',
    pattern: 'validation-zod',
    status: 'pending',
    reason: 'Observed repeated adoption of Zod across recent reviews and follow-up discussions.',
    createdAt: now(),
  },
];

function countMetrics(): CodeClawDashboardSnapshot['overviewMetrics'] {
  return [
    {
      label: 'Installed repos',
      value: String(installations.length),
      note: 'GitHub installations currently linked to CodeClaw.',
    },
    {
      label: 'Memory docs',
      value: String(repositoryMemory.length),
      note: 'Repository-owned markdown files indexed from .codeclaw/.',
    },
    {
      label: 'Open reviews',
      value: String(reviewHistory.length),
      note: 'Review items waiting on a follow-up or fresh sync.',
    },
    {
      label: 'Freshness',
      value: '8m',
      note: 'Time since the last successful sync completed.',
    },
  ];
}

export function getDashboardSnapshot(): CodeClawDashboardData {
  return {
    overviewMetrics: countMetrics(),
    installationStatus,
    repositoryMemory,
    reviewHistory,
    observations,
    installations,
    memoryProposals,
  };
}

export function getInstallations() {
  return installations;
}

export function getReviews(repoFullName?: string) {
  return repoFullName ? reviewHistory.filter((item) => item.repo === repoFullName) : reviewHistory;
}

export function getObservations(repoFullName?: string) {
  return repoFullName ? observations.filter((item) => item.repo === repoFullName) : observations;
}

export function getRepositoryMemory(repoFullName?: string) {
  return repoFullName ? repositoryMemory.filter((item) => item.repo === repoFullName) : repositoryMemory;
}

export function getMemoryProposals(repoFullName?: string) {
  return repoFullName ? memoryProposals.filter((item) => item.repo === repoFullName) : memoryProposals;
}

function resolveRepoFromWebhook(payload: Record<string, unknown>): GithubRepoRef | null {
  const repository = payload.repository as Record<string, unknown> | undefined;
  if (!repository) return null;

  const owner = repository.owner as Record<string, unknown> | undefined;
  const name = repository.name;
  const fullName = repository.full_name ?? repository.fullName;
  const defaultBranch = repository.default_branch ?? repository.defaultBranch ?? 'main';

  if (typeof name !== 'string' || typeof fullName !== 'string' || !owner || typeof owner.login !== 'string') {
    return null;
  }

  return {
    owner: owner.login,
    name,
    fullName,
    defaultBranch: typeof defaultBranch === 'string' ? defaultBranch : 'main',
  };
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function inferPatternFromText(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('zod')) return 'validation-zod';
  if (lower.includes('redis')) return 'infrastructure-redis';
  if (lower.includes('auth')) return 'authentication';
  if (lower.includes('test')) return 'testing';
  if (lower.includes('api')) return 'api-surface';
  return null;
}

export function recordWebhookEvent(eventName: string, action: string | undefined, payload: Record<string, unknown>) {
  const repo = resolveRepoFromWebhook(payload);
  if (!repo) {
    return { reviewed: false, reason: 'missing repository context' };
  }

  const seedText = [
    toText((payload as { pull_request?: { title?: string; body?: string } }).pull_request?.title),
    toText((payload as { pull_request?: { title?: string; body?: string } }).pull_request?.body),
    toText((payload as { comment?: { body?: string } }).comment?.body),
    toText((payload as { issue?: { title?: string; body?: string } }).issue?.title),
    toText((payload as { issue?: { title?: string; body?: string } }).issue?.body),
  ].join(' ');

  const pattern = inferPatternFromText(seedText);
  if (!pattern) {
    return { reviewed: false, reason: 'no obvious pattern detected', repo: repo.fullName, eventName, action };
  }

  const existingObservationCount = observations.filter((item) => item.repo === repo.fullName && item.id.includes(pattern)).length;
  const observation: CodeClawObservationRecord = {
    id: `${pattern}-${Date.now()}`,
    repo: repo.fullName,
    tag: 'Pattern',
    title: `Pattern detected: ${pattern}`,
    body: `Detected ${pattern} from ${eventName}${action ? ` (${action})` : ''}.`,
    tone: 'neutral',
    createdAt: now(),
  };
  observations.unshift(observation);

  const shouldOpenProposal = existingObservationCount + 1 >= 3;
  if (shouldOpenProposal) {
    const proposalExists = memoryProposals.some((item) => item.repo === repo.fullName && item.pattern === pattern && item.status === 'pending');
    if (!proposalExists) {
      memoryProposals.unshift({
        id: `${pattern}-${Date.now()}`,
        repo: repo.fullName,
        title: `Memory proposal for ${pattern}`,
        pattern,
        status: 'pending',
        reason: `Repeated ${pattern} signals appear to be standardizing in ${repo.fullName}.`,
        createdAt: now(),
      });
    }
  }

  return { reviewed: true, repo: repo.fullName, pattern, eventName, action };
}
