# ADR-007: In-Memory LRU Cache for Gemini

## Status: Accepted — 2026-09-07

## Context
Every identical paste hit Gemini, burning quota and latency (2–5s). No cache. Sequential model fallback `server/index.js:361` retried 5 models with no timeout.

## Decision
`server/src/services/gemini.service.ts` — LRU `Map` 500 entries, 6h TTL, key `model::type::hash(content)`, 12s `AbortController` per model, `temperature:0.3`. Hit logs `gemini cache hit`. Future: swap to Redis for multi-instance.

## Consequences
- Positive: 30–80% quota saving on repeated checks.
- Negative: memory cache not shared across instances; stale 6h if model improves.
