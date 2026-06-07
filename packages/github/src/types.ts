export interface GithubAppEnv {
  appId: number;
  privateKey: string;
  webhookSecret: string;
  apiBaseUrl?: string | undefined;
  userAgent?: string | undefined;
}

export interface GithubAppEnvInput {
  GITHUB_APP_ID?: string;
  GITHUB_PRIVATE_KEY?: string;
  GITHUB_WEBHOOK_SECRET?: string;
  GITHUB_API_BASE_URL?: string;
  GITHUB_USER_AGENT?: string;
}

export interface GithubWebhookContext<TPayload = Record<string, unknown>> {
  eventName: string;
  action?: string | undefined;
  payload: TPayload;
  deliveryId?: string | undefined;
}

export interface GithubRouteResult {
  handled: boolean;
  eventName: string;
  action?: string | undefined;
  handler?: string | undefined;
  message?: string | undefined;
}

export type GithubWebhookHandler<TPayload extends Record<string, unknown> = Record<string, unknown>> = (
  context: GithubWebhookContext<TPayload>,
) => Promise<GithubRouteResult | void> | GithubRouteResult | void;

export interface GithubEventHandlers {
  ping?: GithubWebhookHandler<{ zen?: string }>;
  installation?: GithubWebhookHandler;
  issue_comment?: GithubWebhookHandler;
  pull_request?: GithubWebhookHandler;
}

export interface GithubCommentTarget {
  owner: string;
  repo: string;
  issueNumber: number;
}

export interface GithubPullRequestCommentTarget {
  owner: string;
  repo: string;
  pullNumber: number;
}
