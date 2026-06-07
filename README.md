# code-claw

Minimal monorepo scaffold for the CodeClaw app.

## Workspace layout

- `apps/api` — Node API and webhook server
- `apps/web` — Next.js dashboard
- `packages/github` — GitHub App helpers
- `packages/types` — shared GitHub/CodeClaw data models

## Scripts

- `npm run build`
- `npm run typecheck`
- `npm run dev:api`
- `npm run dev:web`

## API

- `GET /health`
- `GET /api/dashboard`
- `GET /api/installations`
- `GET /api/reviews/:repoFullName`
- `GET /api/observations/:repoFullName`
- `GET /api/memory/:repoFullName`
- `POST /webhooks/github`

## Environment

Copy `.env.example` to `.env` and fill in the GitHub integration values when you are ready.
