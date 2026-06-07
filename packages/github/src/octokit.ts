import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from 'octokit';

import type { GithubAppEnv } from './types.js';

export interface CreateGithubOctokitOptions {
  env: GithubAppEnv;
  installationId?: number;
}

export function createGithubOctokit({ env, installationId }: CreateGithubOctokitOptions): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.appId,
      privateKey: env.privateKey,
      installationId,
    },
    ...(env.apiBaseUrl ? { baseUrl: env.apiBaseUrl } : {}),
    ...(env.userAgent ? { userAgent: env.userAgent } : { userAgent: 'codeclaw-github' }),
  });
}
