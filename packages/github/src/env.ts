import type { GithubAppEnv, GithubAppEnvInput } from './types';

function required(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required GitHub env var: ${name}`);
  }

  return value;
}

function parseAppId(rawAppId: string): number {
  const parsed = Number(rawAppId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('GITHUB_APP_ID must be a positive integer');
  }

  return parsed;
}

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, '\n').trim();
}

export function loadGithubAppEnv(env: GithubAppEnvInput = process.env): GithubAppEnv {
  return {
    appId: parseAppId(required(env.GITHUB_APP_ID, 'GITHUB_APP_ID')),
    privateKey: normalizePrivateKey(required(env.GITHUB_PRIVATE_KEY, 'GITHUB_PRIVATE_KEY')),
    webhookSecret: required(env.GITHUB_WEBHOOK_SECRET, 'GITHUB_WEBHOOK_SECRET'),
    apiBaseUrl: env.GITHUB_API_BASE_URL?.trim() || undefined,
    userAgent: env.GITHUB_USER_AGENT?.trim() || undefined,
  };
}
