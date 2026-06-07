import { loadGithubAppEnv } from './env.js';
import { createGithubOctokit } from './octokit.js';
import type { GithubAppEnv } from './types.js';

export function createGithubInstallationOctokit(installationId: number, env: GithubAppEnv = loadGithubAppEnv()) {
  return createGithubOctokit({ env, installationId });
}
