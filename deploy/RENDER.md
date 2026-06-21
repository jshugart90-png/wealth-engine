# Render deployment

Wealth Engine deploys as a single **Node web service** running the daemon (HTTP server + orchestrator loop).

## Blueprint

`deploy/render.yaml` defines:

| Setting | Value |
|---------|--------|
| Build | `npm install && npm run build` |
| Start | `npm run run:daemon` |
| Health | `/api/health` |
| Cycle interval | 180 min (`RUN_INTERVAL_MINUTES`) |

## Setup

1. Create GitHub repo and push `wealth-engine` (see `docs/ACCESS_NEEDED.md`)
2. Render Dashboard → New → Blueprint → connect repo → select `deploy/render.yaml`
3. Or run `deploy/render-create-service.ps1` if Render CLI is configured
4. Set secrets in Render dashboard (never commit):

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
PUBLIC_BASE_URL=https://your-service.onrender.com
STRIPE_SUCCESS_URL=https://your-service.onrender.com/thanks
STRIPE_CANCEL_URL=https://your-service.onrender.com/
ADMIN_TOKEN=<random>
RESEND_API_KEY= (optional)
```

5. Stripe Dashboard → Webhooks → `https://YOUR_DOMAIN/webhooks/stripe`
6. Add **Deploy Hook** URL to GitHub secret `RENDER_DEPLOY_HOOK_URL` for CI staging deploys

## CI integration

- **Staging:** `.github/workflows/ci.yml` POSTs to `RENDER_DEPLOY_HOOK_URL` on push to `main`
- **Production:** `.github/workflows/deploy-prod.yml` — **manual workflow_dispatch only** (Tier 2)

Prod requires GitHub secret `RENDER_PROD_DEPLOY_HOOK_URL` and approval logged in `board/APPROVALS.md`.

## Data persistence

Local Windows uses `D:\wealth-engine-data`. On Render:

- Attach a **disk** and set `WEALTH_DATA_ROOT=/var/data` (or similar mount path)
- Without disk, SQLite + marketing artifacts use ephemeral filesystem (fine for staging, not prod)

## Verify

```bash
curl https://your-service.onrender.com/api/health
```

Expect `{"ok":true,...}`.

## Custom domain (GoDaddy + Render)

**Full guide:** [`deploy/GODADDY_DNS.md`](GODADDY_DNS.md)

Quick steps:

1. Render → Settings → Custom Domains → add `tools.horseshoeroundme.com`
2. GoDaddy DNS → CNAME `tools` → `wealth-engine-0qlj.onrender.com`
3. Update env: `PUBLIC_BASE_URL`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`
4. Stripe webhook → new domain URL
5. Re-run orchestrator to refresh ads CSV

**Skip Netlify** — Horseshoe site uploads via GoDaddy file manager.

## Local equivalent

```powershell
npm run run:daemon
# http://localhost:8787
```
