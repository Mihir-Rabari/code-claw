declare module 'octokit' {
  export interface OctokitCommentResponse {
    data: unknown;
  }

  export interface OctokitRestIssues {
    createComment(params: {
      owner: string;
      repo: string;
      issue_number: number;
      body: string;
    }): Promise<OctokitCommentResponse>;
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
