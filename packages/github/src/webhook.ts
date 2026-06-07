import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyGithubWebhookSignature(
  body: string | Buffer,
  signature256: string | undefined,
  secret: string,
): boolean {
  if (!signature256 || !signature256.startsWith('sha256=')) {
    return false;
  }

  const actual = Buffer.from(signature256.slice('sha256='.length), 'hex');
  const expected = Buffer.from(createHmac('sha256', secret).update(body).digest('hex'), 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function parseGithubWebhookEvent<TPayload = Record<string, unknown>>(body: string): TPayload {
  return JSON.parse(body) as TPayload;
}
