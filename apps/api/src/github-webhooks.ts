import { createGithubEventRouter, loadGithubAppEnv, parseGithubWebhookEvent, verifyGithubWebhookSignature } from '@codeclaw/github';

import { openMemoryProposalForRepo } from './proposal-prs.js';
import { handleMemoryProposalPRClosed, handleMemoryProposalPRReview, recordWebhookEvent } from './store.js';
import { runReview } from './review-engine.js';

export function createWebhookRouter() {
  return createGithubEventRouter({
    installation: async ({ action, payload }) => {
      const result = recordWebhookEvent('installation', action, payload);
      return {
        handled: true,
        eventName: 'installation',
        ...(action ? { action } : {}),
        handler: 'installation',
        message: result.reason ?? 'installation recorded',
      };
    },
    pull_request: async ({ action, payload }) => {
      const pullRequest = payload as {
        installation?: { id?: number };
        repository?: { owner?: { login?: string }; name?: string; full_name?: string; default_branch?: string };
        pull_request?: { title?: string; body?: string; html_url?: string; merged?: boolean };
      };

      if (action === 'closed' && pullRequest.pull_request?.html_url) {
        const prUrl = pullRequest.pull_request.html_url;
        const merged = Boolean(pullRequest.pull_request.merged);
        const proposal = handleMemoryProposalPRClosed(prUrl, merged);
        if (proposal) {
          return {
            handled: true,
            eventName: 'pull_request',
            ...(action ? { action } : {}),
            handler: 'pull_request',
            message: merged
              ? `Memory proposal approved and promoted to concepts: ${proposal.title}`
              : `Memory proposal rejected: ${proposal.title}`,
          };
        }
      }

      const repoFullName = pullRequest.repository?.full_name ?? 'acme/unknown';
      const title = pullRequest.pull_request?.title ?? 'Pull request';
      const body = pullRequest.pull_request?.body;
      const reviewResult = runReview({
        repoFullName,
        title,
        ...(body ? { body } : {}),
        eventName: 'pull_request',
        ...(action ? { action } : {}),
      });

      if (reviewResult.proposal && pullRequest.installation?.id && pullRequest.repository?.owner?.login && pullRequest.repository?.name) {
        await openMemoryProposalForRepo({
          installationId: pullRequest.installation.id,
          repo: {
            owner: pullRequest.repository.owner.login,
            name: pullRequest.repository.name,
            fullName: pullRequest.repository.full_name ?? repoFullName,
            defaultBranch: pullRequest.repository.default_branch ?? 'main',
          },
          proposal: reviewResult.proposal,
        });
      }

      return {
        handled: true,
        eventName: 'pull_request',
        ...(action ? { action } : {}),
        handler: 'pull_request',
        message: reviewResult.proposal ? 'review stored; proposal PR opened or pending' : 'review stored',
      };
    },
    pull_request_review: async ({ action, payload }) => {
      const reviewPayload = payload as {
        pull_request?: { html_url?: string };
        review?: { state?: 'approved' | 'changes_requested' | 'commented'; body?: string | null };
      };

      if (action === 'submitted' && reviewPayload.pull_request?.html_url && reviewPayload.review?.state) {
        const prUrl = reviewPayload.pull_request.html_url;
        const state = reviewPayload.review.state;
        const body = reviewPayload.review.body ?? null;
        const proposal = handleMemoryProposalPRReview(prUrl, state, body);
        if (proposal) {
          return {
            handled: true,
            eventName: 'pull_request_review',
            ...(action ? { action } : {}),
            handler: 'pull_request_review',
            message: state === 'changes_requested'
              ? `Memory proposal transitioned to debate: ${proposal.title}`
              : `Review processed for memory proposal: ${proposal.title}`,
          };
        }
      }

      return {
        handled: true,
        eventName: 'pull_request_review',
        ...(action ? { action } : {}),
        handler: 'pull_request_review',
        message: 'review processed',
      };
    },
    issue_comment: async ({ action, payload }) => {
      const result = recordWebhookEvent('issue_comment', action, payload);
      return {
        handled: true,
        eventName: 'issue_comment',
        ...(action ? { action } : {}),
        handler: 'issue_comment',
        message: result.reason ?? 'comment recorded',
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
