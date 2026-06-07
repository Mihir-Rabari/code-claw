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
