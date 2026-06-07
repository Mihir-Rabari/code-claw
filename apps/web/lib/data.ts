export const overviewMetrics = [
  {
    label: 'Installed repos',
    value: '14',
    note: 'GitHub installations currently linked to CodeClaw.',
  },
  {
    label: 'Memory docs',
    value: '32',
    note: 'Repository-owned markdown files indexed from .codeclaw/.',
  },
  {
    label: 'Open reviews',
    value: '6',
    note: 'Review items waiting on a follow-up or fresh sync.',
  },
  {
    label: 'Freshness',
    value: '8m',
    note: 'Time since the last successful sync completed.',
  },
] as const;

export const installationStatus = [
  {
    label: 'GitHub app installation',
    tone: 'success' as const,
    summary: 'Connected to the organization and scoped to selected repositories.',
    detail: 'Permissions look healthy. Webhook delivery is current.',
  },
  {
    label: 'Repository memory index',
    tone: 'success' as const,
    summary: 'Markdown memory documents are being discovered from .codeclaw/.',
    detail: '32 files indexed across architecture, process, and decision notes.',
  },
  {
    label: 'Review ingestion',
    tone: 'warn' as const,
    summary: 'Two repositories have pending review acknowledgements.',
    detail: 'The latest sync completed, but follow-up comments still need triage.',
  },
  {
    label: 'Observability',
    tone: 'neutral' as const,
    summary: 'Basic health checks are in place for sync and webhook events.',
    detail: 'No incidents reported in the last 24 hours.',
  },
] as const;

export const repositoryMemory = [
  {
    repo: 'acme/web',
    file: '.codeclaw/memory/frontend-architecture.md',
    title: 'Frontend architecture notes',
    excerpt:
      'App router boundaries, shared UI expectations, and the current ownership map for the web client.',
    updated: '2h ago',
    tone: 'success' as const,
  },
  {
    repo: 'acme/api',
    file: '.codeclaw/memory/operational-rules.md',
    title: 'Operational rules',
    excerpt:
      'Preferred deployment order, safe rollback steps, and the guardrails used for production changes.',
    updated: '5h ago',
    tone: 'neutral' as const,
  },
  {
    repo: 'acme/mobile',
    file: '.codeclaw/memory/auth-flow.md',
    title: 'Auth flow memory',
    excerpt:
      'Known sign-in behavior, token refresh expectations, and the last reviewed edge cases.',
    updated: 'Yesterday',
    tone: 'warn' as const,
  },
  {
    repo: 'acme/infra',
    file: '.codeclaw/memory/runbooks.md',
    title: 'Runbook index',
    excerpt:
      'The most useful operational runbooks and where they sit in the repository memory tree.',
    updated: '2d ago',
    tone: 'neutral' as const,
  },
] as const;

export const reviewHistory = [
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
] as const;

export const observations = [
  {
    tone: 'warn' as const,
    tag: 'Attention',
    title: 'Two repos are a sync behind',
    body: 'Their repository memory is still within an acceptable window, but the index is older than the rest of the fleet.',
  },
  {
    tone: 'neutral' as const,
    tag: 'Pattern',
    title: 'Review notes are short and actionable',
    body: 'Most recent review comments are concise and map cleanly to repository-owned memory files.',
  },
  {
    tone: 'success' as const,
    tag: 'Healthy',
    title: 'Webhook delivery has stayed stable',
    body: 'There are no recent retries or queue backlogs in the current view.',
  },
] as const;
