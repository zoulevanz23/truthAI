# ADR-004: Zod Validation + Legacy Prompt Compat

## Status: Accepted — 2026-09-07

## Context
Manual `if (!prompt || typeof prompt !== 'string')` `server/index.js:272` plus `10mb` body limit. No schema, no inferred types.

## Decision
`server/src/middleware/validate.ts` — `zod` schema `content 1..10000`, `type enum`. Maps legacy `{prompt: "Context: URL/Link\nINPUT:\n..."}` → `{content,type}` so old clients keep working. Body limit `20kb` in `app.ts`.

`server/src/config/env.ts` also uses zod — fail fast on missing `GEMINI_API_KEY` (warn + placeholder in dev, throw in prod).

## Consequences
- Positive: single source of truth, auto docs.
- Negative: zod adds 12kb to bundle.
