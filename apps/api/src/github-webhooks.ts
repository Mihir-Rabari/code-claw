import { createGithubEventRouter, loadGithubAppEnv, parseGithubWebhookEvent, verifyGithubWebhookSignature } from '@codeclaw/github';

import { recordWebhookEvent } from './store.js';
import { runReview } from './review-engine.js';

export function createWebhookRouter() {
  return createGithubEventRouter({
    installation: async ({ action, payload }) => {
      recordWebhookEvent('installation', action, payload);
      return {
        handled: true,
        eventName: 'installation',
        ...(action ? { action } : {}),
        handler: 'installation',
        message: 'installation recorded',
      };
    },
    pull_request: async ({ action, payload }) => {
      const pullRequest = payload as { repository?: { full_name?: string }; pull_request?: { title?: string; body?: string } };
      const repoFullName = pullRequest.repository?.full_name ?? 'acme/unknown';
      const title = pullRequest.pull_request?.title ?? 'Pull request';
      const body = pullRequest.pull_request?.body;
      const result = runReview({
        repoFullName,
        title,
        ...(body ? { body } : {}),
        eventName: 'pull_request',
        ...(action ? { action } : {}),
      });

      return {
        handled: true,
        eventName: 'pull_request',
        ...(action ? { action } : {}),
        handler: 'pull_request',
        message: result.memoryProposalTriggered ? 'review stored; proposal may be pending' : 'review stored',
      };
    },
    issue_comment: async ({ action, payload }) => {
      recordWebhookEvent('issue_comment', action, payload);
      return {
        handled: true,
        eventName: 'issue_comment',
        ...(action ? { action } : {}),
        handler: 'issue_comment',
        message: 'comment recorded',
      };
    },
  });
}

export function handleWebhookRequest(rawBody: string, signature: string | undefined, eventName: string, action: string | undefined) {
  const env = loadGithubAppEnv();
  if (!verifyGithubWebhookSignature(rawBody, signature, env.webhookSecret)) {
    return { status: 401, body: { error: 'Invalid GitHub signature' } };
  }

  const payload = parseGithubWebhookEvent<Record<string, unknown>>(rawBody);
  const route = createWebhookRouter();
  const resolvedAction = action ?? (typeof payload.action === 'string' ? payload.action : undefined);
  return route({ eventName, ...(resolvedAction ? { action: resolvedAction } : {}), payload });
}
