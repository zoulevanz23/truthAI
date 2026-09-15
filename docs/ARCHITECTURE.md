# TruthCheck AI — Architecture

## 1. Overview
TruthCheck AI is a privacy-first verification tool. User pastes a message/link/article/document → backend runs heuristic URL checks + LLM structured analysis → returns `verdict + confidence + explanation + signals`.

**Principles:**
- No storage (stateless, PII discarded after response)
- Deterministic where possible, LLM where necessary
- Fail open with heuristics if LLM unavailable
- Small, auditable surface area

## 2. System Diagram

```
[Browser SPA] ──HTTPS──> [Vercel Edge (static + rewrites)] ──HTTPS──> [Express API (Render/Railway)]
     │                              │                                         │
     │ localStorage                 │ CDN cache /health                        │  ┌─ heuristics.service
     │ (history, no server store)   │                                          ├─► reputation.service (opt-in)
     │                              │                                          │  └─ gemini.service (cache 6h)
     │                              │                                          └─► /scam-advisories (curated, future: cron fetch)
     └─ fetch 30s timeout + AbortController
```

## 3. Frontend

**Stack:** Vite 5 + React 18 + TypeScript `strict:true` + React Router 7 (lazy) + Tailwind + Framer Motion + Lucide

**Key decisions:**
- `src/App.tsx:1` — routes are `lazy()` + `Suspense` with `manualChunks: {vendor, motion}` in `vite.config.ts:8` → initial 26kb vs previous 369kb monolith
- `src/config/api.ts:1` — `VITE_API_BASE_URL` required in prod, fails loud if empty; dev falls back to `http://localhost:5000` + Vite proxy
- `src/lib/api.ts:1` — native `fetch` + `AbortController` (removed `axios` from hot path), typed `Verdict` union, `checkServerHealth` cached 30s + 6s/10s retry for Render cold start
- `src/pages/HomePage.tsx` — editorial SaaS layout, no cyberpunk
- No global state needed (form local state + `ResultCard`). If needed later: Zustand.

**Build output (prod):**
- `vendor` 175kb/57kb gzip, `motion` 98kb/33kb, `index` 26kb, per-route 0.3–14kb. Total <320kb vs 369kb before.

## 4. Backend

**Stack:** Node 20 + Express 4 + TypeScript + Zod + Pino + Helmet + express-rate-limit

**Structure:**
```
server/src/
  config/env.ts        // zod env validation, allowedOrigins
  utils/logger.ts       // pino + pino-pretty in dev
  services/heuristics.service.ts  // pure, testable, no I/O
  services/reputation.service.ts  // 4s timeout, opt-in
  services/gemini.service.ts      // systemInstruction, cache, 12s timeout, model fallback
  middleware/validate.ts          // zod + legacy prompt compat
  routes/health.route.ts
  routes/advisories.route.ts
  routes/analyze.route.ts         // 10/min rate limit, heuristic pre-check
  app.ts               // createApp() — testable, no listen
  server.ts            // listen 0.0.0.0:$PORT
```

**Legacy compat:** `server/index.js` preserved, `npm run start:legacy` still works. New path is `npm run build && npm start` (dist).

**Request flow `/analyze`:**
1. `validateAnalyze` → zod `content 1..10000`, `type enum`, maps legacy `{prompt}` → `{content,type}`
2. If `type==='link'` → `analyzeUrlHeuristics` + `checkDomainReputation` (if enabled) → `preSignals, preRiskScore`
3. `callGemini(content, type)` → `systemInstruction` (fixed) + `user` role (untrusted). Never concatenates prompt.
4. Merge signals `[...preSignals, ...llm.signals].slice(0,12)`, bias `SAFE` → `SUSPICIOUS` if `risk>=20`
5. LRU cache (500 entries, 6h) on `hash(content)` — avoids quota burn

**Security:**
- CORS strict in prod (`server/src/app.ts:20`), permissive in dev for DX
- Helmet CSP including `generativelanguage.googleapis.com` connectSrc
- Body limit `20kb` (was `10mb`)
- Rate limit global 100/15m + analyze 10/min (memory store; swap to Redis for multi-instance)
- Validation via `zod` not manual `typeof`

**Observability:**
- Pino structured logs, `LOG_LEVEL` env
- 404 + error middleware with `details` only in `development`
- Health `GET /health` returns `environment, version, timestamp` — used by `Header.tsx` dot

## 5. Data Flow & Contracts

**Request:**
```json
POST /analyze
{ "content": "https://evil.zip/login?verify=1", "type": "link" }
```

**Response:**
```json
{
  "result": { "verdict": "SUSPICIOUS", "confidence": 72, "explanation": "...", "signals": ["Suspicious TLD .zip", "..."], "rawText": "..." },
  "timestamp": "2026-09-07T..."
}
```

Legacy `{ "prompt": "Context: URL/Link\nINPUT:\nhttps://..." }` still accepted via `validate.ts` mapping.

**Verdicts:** `SAFE | SUSPICIOUS | SCAM | TRUSTWORTHY | QUESTIONABLE | LIKELY_FAKE` — UI maps to 3 tones (green/amber/red) in `ResultCard.tsx:10`.

## 6. Deployment

- Frontend: Vercel `vercel.json:3` rewrites `/health,/analyze,/scam-advisories` → `YOUR_BACKEND_URL` (set once). Or set `VITE_API_BASE_URL` and skip rewrites.
- Backend: Render/Railway `server/Dockerfile` multi-stage, `HEALTHCHECK /health`, Node 20, `PORT` from env, binds `0.0.0.0`
- Env: `.env.example` files at root + `server/.env.example` — never commit `.env`

## 7. Non-Goals / Out of Scope

- No DB (history in `localStorage` only). If analytics needed later: Postgres `analysis_logs` storing hash not raw PII.
- No auth (rate-limit by IP). Add Clerk anon key if abuse grows.
- Advisories currently curated; future: daily cron fetch FTC/IC3 → Redis cache.

## 8. Future Scaling

- Replace memory rate-limit + LRU cache with Redis
- Add BullMQ queue for `/analyze` → `202 {jobId}` when Gemini 503, poll `GET /jobs/:id`
- Add OpenTelemetry tracing (Gemini latency p95)
