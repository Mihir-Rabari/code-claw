import http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { CodeClawDashboardSnapshot } from '@codeclaw/types';

import { handleWebhookRequest } from './github-webhooks.js';
import {
  getDashboardSnapshot,
  getInstallations,
  getMemoryProposals,
  getObservations,
  getRepositoryMemory,
  getReviews,
} from './store.js';

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const decoder = new TextDecoder();
    let body = '';

    request.on('data', (chunk: string | Uint8Array) => {
      body += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
    });
    request.on('end', () => {
      body += decoder.decode();
      resolve(body);
    });
    request.on('error', reject);
  });
}

function toRepoFullName(pathname: string) {
  return decodeURIComponent(pathname.replace('/api/reviews/', '').replace('/api/observations/', '').replace('/api/memory/', ''));
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true, service: 'api' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/dashboard') {
    sendJson(response, 200, getDashboardSnapshot());
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/installations') {
    sendJson(response, 200, getInstallations());
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/reviews/')) {
    sendJson(response, 200, getReviews(toRepoFullName(url.pathname)));
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/observations/')) {
    sendJson(response, 200, getObservations(toRepoFullName(url.pathname)));
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/memory/')) {
    sendJson(response, 200, getRepositoryMemory(toRepoFullName(url.pathname)));
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/memory-proposals/')) {
    sendJson(response, 200, getMemoryProposals(toRepoFullName(url.pathname)));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/webhooks/github') {
    const rawBody = await readRequestBody(request);
    const eventName = request.headers['x-github-event'];
    const signature = request.headers['x-hub-signature-256'];
    const delivery = request.headers['x-github-delivery'];
    if (typeof eventName !== 'string') {
      sendJson(response, 400, { error: 'Missing x-github-event header' });
      return;
    }

    const result = await handleWebhookRequest(
      rawBody,
      typeof signature === 'string' ? signature : undefined,
      eventName,
      undefined,
    );

    if ('status' in result) {
      sendJson(response, result.status, result.body);
      return;
    }

    sendJson(response, 200, {
      ok: true,
      delivery: typeof delivery === 'string' ? delivery : undefined,
      result,
    });
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`CodeClaw API listening on http://localhost:${port}`);
});
