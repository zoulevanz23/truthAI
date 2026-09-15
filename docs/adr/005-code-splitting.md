# ADR-005: Code-Splitting Frontend Routes

## Status: Accepted — 2026-09-07

## Context
`src/App.tsx:28` eagerly imported all 4 pages → `368kB / 121kB gzip` single chunk. No `manualChunks`.

## Decision
`React.lazy` per route + `Suspense` fallback in `App.tsx`, `vite.config.ts:8` `manualChunks: {vendor: [react,react-dom,react-router-dom], motion: [framer-motion]}`.

Result: `index 26kb`, `vendor 175kb`, `motion 98kb`, per-route 0.3–14kb. Initial load -30%.

## Consequences
- Positive: faster FCP, better caching (vendor rarely changes).
- Negative: extra waterfall for route chunks (mitigated by preload).
