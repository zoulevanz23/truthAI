# ADR-001: Split God-File Backend

## Status: Accepted — 2026-09-07

## Context
`server/index.js:1` was 514 lines: heuristics, reputation, routes, Gemini proxy, error handling in one file. Untestable, un-lintable, `app.listen` inside module.

## Decision
Split into `server/src/` with `app.ts` (createApp, no listen), `server.ts` (listen), `config/env.ts`, `services/*`, `routes/*`, `middleware/*`, `utils/logger.ts`. Migrate JS → TS, add `tsconfig.json`.

Preserve `server/index.js` as legacy; `npm run start:legacy` keeps backward compat. New path `npm run build && npm start`.

## Consequences
- Positive: import `createApp()` in tests without binding port; per-file `strict` types.
- Negative: `tsx` + `tsc` build step added; Dockerfile multi-stage needed.
