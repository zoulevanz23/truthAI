# Backend Deployment Checklist (Render / Railway)

This guide helps you run your existing Express server (`server/index.js`) on a proper long‑running host and keep the React app on Vercel. We will proxy `/api/*` requests from Vercel to your backend so your frontend code stays the same.

---

## 1) Prepare the backend repository

- Ensure your backend lives under `server/` and has its own `package.json` with `start` script (`node index.js`).
- Confirm it binds to `process.env.PORT` and host `0.0.0.0` (already done in `server/index.js`).
- Optional: Move `server/` to its own repo for cleaner deployment (or point the platform to the subdirectory).

---

## 2) Environment variables (both platforms)

Required:
- `GEMINI_API_KEY`: Your Google Generative Language API key.
- `NODE_ENV`: `production`

Optional:
- `ENABLE_REPUTATION_CHECKS`: `1` to enable the phishing database check.
- `FRONTEND_URL`: Your Vercel site, e.g. `https://truthcheck-ai.vercel.app`

---

## 3) Render setup (Web Service)

- Create a new Web Service on Render.
- Connect your repo (or monorepo with root pointing at `server/`).
- Runtime: Node 18+.
- Build Command: leave empty (Render will run `npm install`).
- Start Command: `node index.js`
- Root Directory: `server`
- Instance Type: Start with Free or Basic.
- Add Environment Variables from step 2.
- Health check:
  - Render path: `/health` (your server exposes it).
  - Should return 200 with JSON.

When deployed, you will get a URL like `https://your-backend.onrender.com`.

---

## 4) Railway setup (Service)

- Create a new Node.js service on Railway.
- Connect your repo; set the service root to `server/`.
- Node Version: 18+.
- Start Command: `node index.js`.
- Add Environment Variables from step 2.
- Expose the service on the default port (Railway sets `PORT`).
- After deploy, you’ll get a URL like `https://your-backend.up.railway.app`.

---

## 5) Configure Vercel to proxy /api/* to backend

Replace the current serverless functions with a rewrite proxy to your backend.

Create or replace `vercel.json` at the project root:

```
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-BASE-URL/$1"
    }
  ]
}
```

- Example destination: `https://your-backend.onrender.com/$1` (Render) or `https://your-backend.up.railway.app/$1` (Railway).
- Commit and redeploy Vercel app. Your frontend continues calling `/api/*` with no code changes.

---

## 6) Local development options

Option A: Run only the frontend locally and hit the hosted backend
- Set `VITE_API_BASE_URL` to empty string in `.env` (default) so `/api/*` hits Vercel rewrites.

Option B: Run both locally
- Start Express locally: `cd server && npm start` (listens on 5000).
- Create a local proxy in Vite or set `VITE_API_BASE_URL=http://localhost:5000`.

---

## 7) Smoke tests

After deploying backend:
- GET `https://YOUR-BACKEND-BASE-URL/health` → 200 JSON.
- POST `https://YOUR-BACKEND-BASE-URL/analyze` with `{ "prompt": "hello" }` → 200 JSON or meaningful error if GEMINI_API_KEY missing.

After adding Vercel rewrites:
- GET `https://YOUR-FRONTEND.vercel.app/api/health` → 200 JSON.
- Use the app Analyzer → responses should flow via proxy to backend.

---

## 8) Notes

- Keep Express rate limiting and security middleware as is.
- CORS: When proxying via Vercel rewrites, requests originate from the frontend domain, so CORS is not needed for the browser. You can keep your current CORS config with `origin: FRONTEND_URL` without harm.
- If you change the backend base URL, update it in `vercel.json` and redeploy the frontend.
