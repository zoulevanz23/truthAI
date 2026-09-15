# ADR-006: Fetch + AbortController over Axios

## Status: Accepted — 2026-09-07

## Context
`src/lib/api.ts:1` used `axios` with 30s timeout via config. `checkServerHealth` did 8s + 1.5s wait + 15s = 24.5s worst case, no cache, hammered cold-start backends.

## Decision
Replace hot path with native `fetch` + `AbortController` + `setTimeout abort 30s`. `checkServerHealth` now 6s + 1.2s wait + 10s with 30s `healthCache` TTL. Keep `axios` in `package.json` for compat but not used in `src/lib/api.ts`.

## Consequences
- Positive: -12kb bundle, explicit abort semantics, fewer deps.
- Negative: manual `res.json()` + status handling.
