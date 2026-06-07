import type { GitHubIssueRef, GitHubPullRequestRef, GitHubRepositoryRef } from "./github.js";

export interface CodeClawMemoryEntry {
  id: string;
  title: string;
  body: string;
  source: "manual" | "github" | "system";
  createdAt: string;
  updatedAt: string;
}

export interface CodeClawProject {
  id: string;
  name: string;
  repository: GitHubRepositoryRef;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CodeClawSyncCheckpoint {
  repository: GitHubRepositoryRef;
  lastIssue?: GitHubIssueRef;
  lastPullRequest?: GitHubPullRequestRef;
  syncedAt: string;
}

export type CodeClawTone = 'neutral' | 'success' | 'warn' | 'danger';

export interface CodeClawDashboardMetric {
  label: string;
  value: string;
  note: string;
}

export interface CodeClawInstallationStatus {
  label: string;
  tone: CodeClawTone;
  summary: string;
  detail: string;
}

export interface CodeClawRepositoryMemoryItem {
  repo: string;
  file: string;
  title: string;
  excerpt: string;
  updated: string;
  tone: CodeClawTone;
}

export interface CodeClawReviewRecord {
  repo: string;
  pr: string;
  outcome: string;
  reviewer: string;
  summary: string;
  time: string;
}

export interface CodeClawObservationRecord {
  id: string;
  repo: string;
  tag: string;
  title: string;
  body: string;
  tone: CodeClawTone;
  createdAt: string;
}

export interface CodeClawMemoryProposalRecord {
  id: string;
  repo: string;
  title: string;
  pattern: string;
  status: 'pending' | 'merged' | 'rejected';
  reason: string;
  createdAt: string;
  prUrl?: string;
}

export interface CodeClawDashboardSnapshot {
  overviewMetrics: CodeClawDashboardMetric[];
  installationStatus: CodeClawInstallationStatus[];
  repositoryMemory: CodeClawRepositoryMemoryItem[];
  reviewHistory: CodeClawReviewRecord[];
  observations: CodeClawObservationRecord[];
  memoryProposals: CodeClawMemoryProposalRecord[];
}
