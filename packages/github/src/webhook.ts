import { createHmac } from 'node:crypto';

export function verifyGithubWebhookSignature(
  body: string,
  signature256: string | undefined,
  secret: string,
): boolean {
  if (!signature256 || !signature256.startsWith('sha256=')) {
    return false;
  }

  const actual = signature256.slice('sha256='.length);
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return actual.length === expected.length && actual === expected;
}

export function parseGithubWebhookEvent<TPayload = Record<string, unknown>>(body: string): TPayload {
  return JSON.parse(body) as TPayload;
}
