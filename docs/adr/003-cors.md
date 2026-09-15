# ADR-003: Strict CORS in Production

## Status: Accepted — 2026-09-07

## Context
`server/index.js:164` checked `allowedOrigins` but both branches did `callback(null,true)` — effectively `*`. Comment said "Allow all for now; tighten in production" but never tightened.

## Decision
`server/src/app.ts:20` — strict in prod: unknown origin → `cb(new Error('Not allowed by CORS'))` → 403. In dev, allow all with warning for DX. `allowedOrigins` from `ALLOWED_ORIGINS || FRONTEND_URL` validated by `env.ts`.

## Consequences
- Positive: real origin check in prod.
- Negative: misconfigured `ALLOWED_ORIGINS` breaks prod; must set `FRONTEND_URL` correctly.
