import { createGithubEventRouter, loadGithubAppEnv, parseGithubWebhookEvent, verifyGithubWebhookSignature } from '@codeclaw/github';

import { openMemoryProposalForRepo } from './proposal-prs.js';
import { runRealReview } from './review-pipeline.js';
import { handleMemoryProposalPRClosed, handleMemoryProposalPRReview, recordWebhookEvent, getMemoryProposals } from './store.js';

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
        pull_request?: { title?: string; body?: string; html_url?: string; merged?: boolean; number?: number };
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
      const installationId = pullRequest.installation?.id;
      const ownerLogin = pullRequest.repository?.owner?.login;
      const repoName = pullRequest.repository?.name;
      const prNumber = pullRequest.pull_request?.number ?? 0;

      let pipelineResult: { proposalTriggered: boolean; commentsPosted: number; observationsRecorded: string[] } | null = null;
      if (installationId && ownerLogin && repoName && prNumber) {
        try {
          pipelineResult = await runRealReview({
            installationId,
            owner: ownerLogin,
            repo: repoName,
            prNumber,
          });
        } catch (error) {
          console.error('Review pipeline failed:', error);
        }
      }

      if (pipelineResult?.proposalTriggered && installationId && ownerLogin && repoName) {
        const proposals = getMemoryProposals(repoFullName);
        const pending = proposals.find((item) => item.status === 'pending' && !item.prUrl);
        if (pending) {
          await openMemoryProposalForRepo({
            installationId,
            repo: {
              owner: ownerLogin,
              name: repoName,
              fullName: pullRequest.repository?.full_name ?? repoFullName,
              defaultBranch: pullRequest.repository?.default_branch ?? 'main',
            },
            proposal: pending,
          });
        }
      }

      return {
        handled: true,
        eventName: 'pull_request',
        ...(action ? { action } : {}),
        handler: 'pull_request',
        message: pipelineResult
          ? `review posted (${pipelineResult.commentsPosted} comment(s), ${pipelineResult.observationsRecorded.length} observation(s))`
          : 'review skipped (missing installation/repository context)',
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
