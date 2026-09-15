# ADR-008: No Database (Stateless)

## Status: Accepted — 2026-09-07

## Context
Product promises "No data stored" `src/pages/AnalyzerPage.tsx:10`. Adding DB adds PII risk, GDPR scope.

## Decision
Stay stateless: no DB. History stays in `localStorage` on client. If analytics needed later, add Postgres `analysis_logs` storing `hash(content)` not raw content, with 7-day TTL.

## Consequences
- Positive: zero PII at rest, simpler ops.
- Negative: no cross-device history, no server-side analytics.
