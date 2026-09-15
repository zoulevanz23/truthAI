# Tech Stack — TruthCheck AI

## Frontend

| Layer | Choice | Version | Why | Alternative Considered |
|---|---|---|---|---|
| Build | Vite | 5.4 | Fast HMR, native ESM, proven | Next.js (overkill for SPA) |
| Language | TypeScript | 5.2 | `strict:true`, catch 30% bugs at compile | JS (rejected) |
| UI | React | 18.2 | Ecosystem, hooks | Vue/Svelte (smaller hiring pool) |
| Router | React Router | 7.6 | `lazy()` code-split per route | TanStack Router (heavier) |
| Styling | Tailwind | 3.4 | Utility, design tokens in `tokens.css` | Styled-components (runtime cost) |
| Animation | Framer Motion | 10.16 | `easeStandard [0.16,1,0.3,1]`, `prefers-reduced-motion` | CSS only (less control) |
| Icons | Lucide React | 0.525 | Consistent 16/18px stroke, no emoji | Heroicons |
| HTTP | `fetch` + `AbortController` | native | No extra dep, 30s timeout | Axios 1.6 (removed from hot path, still in deps for compat) |
| Toast | react-hot-toast | 2.4 | Minimal | Sonner |
| Fonts | Inter + JetBrains Mono | — | `tokens.css` editorial SaaS | — |

**Bundle:** `vite.config.ts` manualChunks `vendor` + `motion` → initial 26kb vs 369kb before.

## Backend

| Layer | Choice | Version | Why |
|---|---|---|---|
| Runtime | Node.js | 20 | LTS, `fetch` native, `AbortSignal.timeout` |
| Framework | Express | 4.18 | Minimal, well-known. Fastify considered (faster) but Express kept for compat |
| Language | TypeScript | 5.3 | `server/tsconfig.json` strict |
| Validation | Zod | 3.22 | `env.ts` + `validate.ts` schemas, inferred types |
| Logging | Pino + pino-pretty | 9.0 / 11.0 | Structured JSON in prod, pretty in dev |
| Security | Helmet 7.1 | CSP, HSTS | `app.ts` CSP directives |
| Rate limit | express-rate-limit 7.1 | Global 100/15m + analyze 10/min | Memory store (swap to `rate-limit-redis` later) |
| AI | Google Generative Language `v1beta` | `gemini-2.5-flash` default | `gemini.service.ts` `systemInstruction` + model fallback |
| Reputation | phish.sinking.yachts v2 | opt-in `ENABLE_REPUTATION_CHECKS=1` | 4s timeout, non-fatal |

**Not used (intentionally):**
- No DB — stateless, `localStorage` history only
- No ORM — add Prisma if DB needed
- No queue yet — add BullMQ+Redis when scaling

## Infra & DevOps

| Tool | Purpose |
|---|---|
| Vercel | Frontend static + `vercel.json` rewrites to backend |
| Render / Railway | Backend Node service, `server/Dockerfile` multi-stage, `HEALTHCHECK /health` |
| GitHub Actions | `ci.yml` — lint, typecheck, test, build on PR |
| Vitest 1.2 | `server/tests/*.test.ts` — heuristics + validate |
| Docker | `server/Dockerfile` builder → runner |

## Version Pinning

- Frontend `package.json:12` exact deps, `package-lock.json` committed
- Backend `server/package.json:15` same
- `engines: node >=18` (server), actual `20` in Dockerfile/CI

## When to Change Stack

- Need SSR/SEO → migrate to Next.js (keep components)
- Need real-time → add WebSocket/SSE, not polling
- >1k rps → replace Express with Fastify, add Redis + BullMQ
