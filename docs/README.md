# Docs Index

- [Architecture](ARCHITECTURE.md) — system diagram, frontend/backend, data flow, deployment
- [Tech Stack](TECH_STACK.md) — choices, versions, trade-offs, when to change
- [Decisions](DECISIONS.md) — ADR index
- [ADRs](adr/) — per-decision records

Quick links:
- Env templates: `/.env.example`, `/server/.env.example`
- CI: `.github/workflows/ci.yml`
- Backend entry: `server/src/server.ts` (new) vs `server/index.js` (legacy)
- Frontend entry: `src/main.tsx`

## Local Dev

```bash
# backend (new TS)
cd server && npm install && npm run dev  # tsx watch src/server.ts :5000
# or legacy
cd server && npm run start:legacy

# frontend
npm install && npm run dev  # vite :3000 proxy /analyze -> :5000
```

## Prod Build

```bash
npm run build            # frontend dist/
cd server && npm run build && npm start  # backend dist/server.js
```
