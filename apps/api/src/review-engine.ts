import type { CodeClawObservationRecord, CodeClawReviewRecord } from '@codeclaw/types';

import { getObservations, getReviews, recordWebhookEvent } from './store.js';

export interface ReviewInput {
  repoFullName: string;
  title: string;
  body?: string | undefined;
  eventName: string;
  action?: string | undefined;
}

export interface ReviewResult {
  review: CodeClawReviewRecord;
  observation?: CodeClawObservationRecord;
  memoryProposalTriggered: boolean;
}

function inferOutcome(title: string, body: string | undefined) {
  const text = `${title} ${body ?? ''}`.toLowerCase();
  if (text.includes('zod')) return 'Approved with notes';
  if (text.includes('redis')) return 'Changes requested';
  if (text.includes('auth')) return 'Approved with notes';
  if (text.includes('test')) return 'Merged';
  return 'Approved';
}

function inferReviewer(repoFullName: string) {
  if (repoFullName.includes('web')) return 'Atlas';
  if (repoFullName.includes('api')) return 'Mina';
  if (repoFullName.includes('mobile')) return 'Jordan';
  return 'CodeClaw';
}

export function runReview(input: ReviewInput): ReviewResult {
  const review: CodeClawReviewRecord = {
    repo: input.repoFullName,
    pr: `#${Math.floor(Math.random() * 400 + 1)}`,
    outcome: inferOutcome(input.title, input.body),
    reviewer: inferReviewer(input.repoFullName),
    time: 'Just now',
    summary: `Reviewed ${input.eventName}${input.action ? ` (${input.action})` : ''}: ${input.title}`,
  };

  const observation: CodeClawObservationRecord = {
    id: `obs-${Date.now()}`,
    repo: input.repoFullName,
    tag: 'Review',
    title: `Review processed for ${input.repoFullName}`,
    body: review.summary,
    tone: 'neutral',
    createdAt: new Date().toISOString(),
  };

  const trigger = recordWebhookEvent(input.eventName, input.action, {
    repository: {
      full_name: input.repoFullName,
      name: input.repoFullName.split('/')[1] ?? input.repoFullName,
      owner: { login: input.repoFullName.split('/')[0] ?? 'acme' },
      default_branch: 'main',
    },
    pull_request: {
      title: input.title,
      body: input.body,
    },
  });

  return {
    review,
    observation,
    memoryProposalTriggered: Boolean(trigger.reviewed),
  };
}

export function getReviewSummary(repoFullName: string) {
  return {
    reviewCount: getReviews(repoFullName).length,
    observationCount: getObservations(repoFullName).length,
  };
}
