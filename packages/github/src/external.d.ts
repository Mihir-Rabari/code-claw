declare module 'octokit' {
  export interface OctokitCommentResponse {
    data: unknown;
  }

  export interface OctokitRefResponse {
    data: {
      object: {
        sha: string;
      };
    };
  }

  export interface OctokitPullRequestResponse {
    data: {
      number: number;
      html_url: string;
    };
  }

  export interface OctokitRestIssues {
    createComment(params: {
      owner: string;
      repo: string;
      issue_number: number;
      body: string;
    }): Promise<OctokitCommentResponse>;
    addLabels(params: {
      owner: string;
      repo: string;
      issue_number: number;
      labels: string[];
    }): Promise<OctokitCommentResponse>;
  }

  export interface OctokitRestRepos {
    get(params: {
      owner: string;
      repo: string;
    }): Promise<{ data: { default_branch?: string } }>;
    createOrUpdateFileContents(params: {
      owner: string;
      repo: string;
      path: string;
      message: string;
      content: string;
      branch: string;
    }): Promise<unknown>;
  }

  export interface OctokitRestGit {
    getRef(params: {
      owner: string;
      repo: string;
      ref: string;
    }): Promise<OctokitRefResponse>;
    createRef(params: {
      owner: string;
      repo: string;
      ref: string;
      sha: string;
    }): Promise<unknown>;
  }

  export interface OctokitRestPulls {
    create(params: {
      owner: string;
      repo: string;
      head: string;
      base: string;
      title: string;
      body: string;
    }): Promise<OctokitPullRequestResponse>;
  }

  export class Octokit {
    constructor(options?: {
      authStrategy?: unknown;
      auth?: unknown;
      baseUrl?: string;
      userAgent?: string;
    });

    rest: {
      issues: OctokitRestIssues;
      repos: OctokitRestRepos;
      git: OctokitRestGit;
      pulls: OctokitRestPulls;
    };
  }
}

declare module '@octokit/auth-app' {
  export const createAppAuth: unknown;
}

declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'node:crypto' {
  export function createHmac(
    algorithm: string,
    key: string,
  ): {
    update(data: string): { digest(encoding: 'hex'): string };
  };
}
