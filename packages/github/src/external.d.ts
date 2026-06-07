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
