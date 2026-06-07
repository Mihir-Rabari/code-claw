declare const process: { env: Record<string, string | undefined> };

const defaultApiBaseUrl = process.env.NEXT_PUBLIC_CODECLAW_API_URL ?? process.env.CODECLAW_API_URL ?? 'http://localhost:3001';

export function getApiBaseUrl() {
  return defaultApiBaseUrl.replace(/\/$/, '');
}

export async function fetchApiJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
