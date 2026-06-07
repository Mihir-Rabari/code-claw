export type GitHubNodeId = string;

export interface GitHubAccount {
  login: string;
  id: number;
  nodeId?: GitHubNodeId;
  avatarUrl?: string;
  htmlUrl?: string;
}

export interface GitHubRepositoryRef {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl?: string;
  defaultBranch?: string;
}

export interface GitHubIssueRef {
  number: number;
  title: string;
  state: "open" | "closed";
  url?: string;
  author?: GitHubAccount;
}

export interface GitHubPullRequestRef extends GitHubIssueRef {
  merged?: boolean;
  headRef?: string;
  baseRef?: string;
}
