import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  CodeClawDashboardSnapshot,
  CodeClawInstallationStatus,
  CodeClawMemoryProposalRecord,
  CodeClawObservationRecord,
  CodeClawRepositoryMemoryItem,
  CodeClawReviewRecord,
  CodeClawTone,
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

export interface ObservationRegistrationInput {
  repoFullName: string;
  tag: string;
  title: string;
  body: string;
  tone?: CodeClawTone;
  createdAt?: string;
  source?: string;
}

export interface ObservationRegistrationResult {
  observation: CodeClawObservationRecord;
  proposal?: CodeClawMemoryProposalRecord;
  pattern?: string;
}

export interface WebhookEventRecordResult {
  reviewed: boolean;
  eventName: string;
  action?: string | undefined;
  repo?: string;
  installation?: CodeClawInstallationRecord;
  observation?: CodeClawObservationRecord;
  proposal?: CodeClawMemoryProposalRecord;
  reason?: string;
}

const now = () => new Date().toISOString();

const dataDirectory = process.env.CODECLAW_STATE_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const stateFile = process.env.CODECLAW_STATE_FILE ?? join(dataDirectory, 'state.json');

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
    detail: 'Repository-owned markdown is the source of truth for durable knowledge.',
  },
  {
    label: 'Review ingestion',
    tone: 'warn',
    summary: 'Some repositories may still be waiting on follow-up comments.',
    detail: 'The latest sync may have pending review items to triage.',
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

interface RuntimeState {
  installations: CodeClawInstallationRecord[];
  reviewHistory: CodeClawReviewRecord[];
  observations: CodeClawObservationRecord[];
  memoryProposals: CodeClawMemoryProposalRecord[];
}

const seedState: RuntimeState = {
  installations: [
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
  ],
  reviewHistory: [
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
  ],
  observations: [
    {
      id: 'obs-1',
      repo: 'acme/web',
      tag: 'Attention',
      title: 'Two repos are a sync behind',
      body:
        'Their repository memory is still within an acceptable window, but the index is older than the rest of the fleet.',
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
  ],
  memoryProposals: [
    {
      id: 'proposal-1',
      repo: 'acme/api',
      title: 'Validation standard appears to be settling on Zod',
      pattern: 'validation-zod',
      status: 'pending',
      reason: 'Observed repeated adoption of Zod across recent reviews and follow-up discussions.',
      createdAt: now(),
    },
  ],
};

function ensureStateDirectory() {
  mkdirSync(dataDirectory, { recursive: true });
}

function readStateFile(): Partial<RuntimeState> | null {
  try {
    const raw = readFileSync(stateFile, 'utf8');
    return JSON.parse(raw) as Partial<RuntimeState>;
  } catch {
    return null;
  }
}

function cloneState(state: RuntimeState): RuntimeState {
  return {
    installations: state.installations.map((installation) => ({
      ...installation,
      repository: { ...installation.repository },
    })),
    reviewHistory: state.reviewHistory.map((item) => ({ ...item })),
    observations: state.observations.map((item) => ({ ...item })),
    memoryProposals: state.memoryProposals.map((item) => ({ ...item })),
  };
}

function hydrateState(parsed: Partial<RuntimeState> | null): RuntimeState {
  const merged: RuntimeState = {
    installations: Array.isArray(parsed?.installations) ? (parsed.installations as CodeClawInstallationRecord[]) : [],
    reviewHistory: Array.isArray(parsed?.reviewHistory) ? (parsed.reviewHistory as CodeClawReviewRecord[]) : [],
    observations: Array.isArray(parsed?.observations) ? (parsed.observations as CodeClawObservationRecord[]) : [],
    memoryProposals: Array.isArray(parsed?.memoryProposals)
      ? (parsed.memoryProposals as CodeClawMemoryProposalRecord[])
      : [],
  };

  return {
    installations: merged.installations.length > 0 ? merged.installations : seedState.installations,
    reviewHistory: merged.reviewHistory.length > 0 ? merged.reviewHistory : seedState.reviewHistory,
    observations: merged.observations.length > 0 ? merged.observations : seedState.observations,
    memoryProposals: merged.memoryProposals.length > 0 ? merged.memoryProposals : seedState.memoryProposals,
  };
}

let state = hydrateState(readStateFile());

function persistState() {
  ensureStateDirectory();
  const tempFile = `${stateFile}.tmp`;
  writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf8');
  renameSync(tempFile, stateFile);
}

function toLowerText(value: string) {
  return value.toLowerCase();
}

function inferPatternFromText(text: string): string | null {
  const lower = toLowerText(text);
  if (lower.includes('zod')) return 'validation-zod';
  if (lower.includes('redis')) return 'infrastructure-redis';
  if (lower.includes('auth')) return 'authentication';
  if (lower.includes('test')) return 'testing';
  if (lower.includes('api')) return 'api-surface';
  return null;
}

function nextObservationId() {
  return `obs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextProposalId(pattern: string) {
  return `proposal-${pattern}-${Date.now()}`;
}

function upsertInstallation(record: CodeClawInstallationRecord) {
  const index = state.installations.findIndex((item) => item.installationId === record.installationId);
  if (index >= 0) {
    state.installations[index] = record;
  } else {
    state.installations.unshift(record);
  }
  persistState();
  return record;
}

export function saveInstallationFromWebhook(input: {
  installationId: number;
  repository: GithubRepoRef;
  status?: CodeClawInstallationRecord['status'];
}) {
  const existing = state.installations.find((item) => item.installationId === input.installationId);
  return upsertInstallation({
    installationId: input.installationId,
    repository: input.repository,
    status: input.status ?? existing?.status ?? 'active',
    installedAt: existing?.installedAt ?? now(),
    lastSyncedAt: now(),
  });
}

export function recordReview(review: CodeClawReviewRecord) {
  state.reviewHistory.unshift(review);
  persistState();
  return review;
}

export function recordObservation(observation: CodeClawObservationRecord) {
  state.observations.unshift(observation);
  persistState();
  return observation;
}

export function updateMemoryProposal(id: string, patch: Partial<CodeClawMemoryProposalRecord>) {
  const index = state.memoryProposals.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  state.memoryProposals[index] = { ...state.memoryProposals[index], ...patch } as CodeClawMemoryProposalRecord;
  persistState();
  return state.memoryProposals[index];
}

export function getInstallationByRepoFullName(repoFullName: string) {
  return state.installations.find((item) => item.repository.fullName === repoFullName);
}

export function registerObservationFromText(input: ObservationRegistrationInput): ObservationRegistrationResult {
  const text = `${input.title}\n${input.body}`;
  const pattern = inferPatternFromText(text);
  const observation: CodeClawObservationRecord = {
    id: input.createdAt ? `${nextObservationId()}-${input.createdAt}` : nextObservationId(),
    repo: input.repoFullName,
    tag: input.tag,
    title: pattern ? `Pattern detected: ${pattern}` : input.title,
    body: pattern
      ? `Detected ${pattern} in ${input.source ?? 'repository activity'}.\n\n${input.body}`
      : input.body,
    tone: input.tone ?? 'neutral',
    createdAt: input.createdAt ?? now(),
  };

  state.observations.unshift(observation);

  let proposal: CodeClawMemoryProposalRecord | undefined;
  if (pattern) {
    const matchingCount = state.observations.filter(
      (item) => item.repo === input.repoFullName && item.title.toLowerCase().includes(pattern),
    ).length;

    if (matchingCount >= 3) {
      const existingProposal = state.memoryProposals.find(
        (item) => item.repo === input.repoFullName && item.pattern === pattern && item.status === 'pending',
      );

      if (existingProposal) {
        proposal = existingProposal;
      } else {
        proposal = {
          id: nextProposalId(pattern),
          repo: input.repoFullName,
          title: `Validation standard appears to be settling on ${pattern === 'validation-zod' ? 'Zod' : pattern}`,
          pattern,
          status: 'pending',
          reason: `Repeated ${pattern} signals were observed in ${input.repoFullName}.`,
          createdAt: now(),
        };
        state.memoryProposals.unshift(proposal);
      }
    }
  }

  persistState();
  return {
    observation,
    ...(proposal ? { proposal } : {}),
    ...(pattern ? { pattern } : {}),
  };
}

function parseRepoRef(payload: Record<string, unknown>): GithubRepoRef | null {
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

function getWebhookSignalText(payload: Record<string, unknown>) {
  const pullRequest = payload.pull_request as { title?: string; body?: string } | undefined;
  const comment = payload.comment as { body?: string } | undefined;
  const issue = payload.issue as { title?: string; body?: string } | undefined;

  return [pullRequest?.title, pullRequest?.body, comment?.body, issue?.title, issue?.body].filter(Boolean).join('\n');
}

export function recordWebhookEvent(eventName: string, action: string | undefined, payload: Record<string, unknown>): WebhookEventRecordResult {
  const repo = parseRepoRef(payload);
  const installation = payload.installation as { id?: number } | undefined;
  const installationId = typeof installation?.id === 'number' ? installation.id : undefined;

  let savedInstallation: CodeClawInstallationRecord | undefined;
  if (repo && installationId && eventName === 'installation') {
    savedInstallation = saveInstallationFromWebhook({ installationId, repository: repo });
  }

  if (eventName === 'installation') {
    return {
      reviewed: false,
      eventName,
      ...(action ? { action } : {}),
      ...(repo ? { repo: repo.fullName } : {}),
      ...(savedInstallation ? { installation: savedInstallation } : {}),
      reason: 'installation recorded',
    };
  }

  if (!repo) {
    return {
      reviewed: false,
      eventName,
      ...(action ? { action } : {}),
      reason: 'missing repository context',
    };
  }

  const signalText = getWebhookSignalText(payload);
  const signalTitle =
    eventName === 'pull_request'
      ? `Pull request activity in ${repo.fullName}`
      : eventName === 'issue_comment'
        ? `Issue comment activity in ${repo.fullName}`
        : eventName === 'pull_request_review'
          ? `Pull request review activity in ${repo.fullName}`
          : `Repository activity in ${repo.fullName}`;

  const registration = registerObservationFromText({
    repoFullName: repo.fullName,
    tag: eventName === 'pull_request' ? 'Review' : 'Signal',
    title: signalTitle,
    body: signalText || `${eventName} event received`,
    tone: eventName === 'pull_request' ? 'neutral' : 'warn',
    source: eventName,
    createdAt: now(),
  });

  const maybeInstallation = savedInstallation ?? (installationId ? getInstallationByRepoFullName(repo.fullName) : undefined);

  return {
    reviewed: true,
    eventName,
    ...(action ? { action } : {}),
    repo: repo.fullName,
    observation: registration.observation,
    ...(registration.proposal ? { proposal: registration.proposal } : {}),
    ...(maybeInstallation ? { installation: maybeInstallation } : {}),
  };
}

function buildMetrics(): CodeClawDashboardSnapshot['overviewMetrics'] {
  return [
    {
      label: 'Installed repos',
      value: String(state.installations.length),
      note: 'GitHub installations currently linked to CodeClaw.',
    },
    {
      label: 'Memory docs',
      value: String(repositoryMemory.length),
      note: 'Repository-owned markdown files indexed from .codeclaw/.',
    },
    {
      label: 'Open reviews',
      value: String(state.reviewHistory.length),
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
    overviewMetrics: buildMetrics(),
    installationStatus,
    repositoryMemory,
    reviewHistory: getReviews(),
    observations: getObservations(),
    installations: getInstallations(),
    memoryProposals: getMemoryProposals(),
  };
}

export function getInstallations(repoFullName?: string) {
  return repoFullName
    ? state.installations.filter((installation) => installation.repository.fullName === repoFullName)
    : state.installations;
}

export function getReviews(repoFullName?: string) {
  return repoFullName ? state.reviewHistory.filter((item) => item.repo === repoFullName) : state.reviewHistory;
}

export function getObservations(repoFullName?: string) {
  return repoFullName ? state.observations.filter((item) => item.repo === repoFullName) : state.observations;
}

export function getRepositoryMemory(repoFullName?: string) {
  return repoFullName ? repositoryMemory.filter((item) => item.repo === repoFullName) : repositoryMemory;
}

export function getMemoryProposals(repoFullName?: string) {
  return repoFullName
    ? state.memoryProposals.filter((item) => item.repo === repoFullName)
    : state.memoryProposals;
}

export function getMemoryProposalById(id: string) {
  return state.memoryProposals.find((item) => item.id === id);
}

export function listRecentObservations(repoFullName: string, limit = 5) {
  return getObservations(repoFullName).slice(0, limit);
}

export function getStateFilePath() {
  return stateFile;
}
