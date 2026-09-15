# ADR-009: Curated Advisories (Future Live Feed)

## Status: Accepted — 2026-09-07

## Context
`server/index.js:221` returned 5 hardcoded 2024 advisories. Calling it "latest" misleads.

## Decision
Keep `server/src/routes/advisories.route.ts` curated but add `Cache-Control: public, max-age=3600` and doc that future is cron fetch FTC/IC3 → Redis. Don't block launch on live scrapers.

## Consequences
- Positive: honest, cacheable, no external fetch failure mode.
- Negative: stale until cron implemented.
