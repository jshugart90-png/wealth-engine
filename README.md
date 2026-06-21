# Wealth Engine

**Autonomous multi-venture wealth machine** — completely separate from social media. Six independent revenue channels, one orchestrator, your Stripe account.

## Quick start

```powershell
cd C:\Users\jshug\wealth-engine
copy .env.example .env
# Edit .env — add STRIPE_SECRET_KEY from https://dashboard.stripe.com/apikeys
npm install
npm run run:daemon
```

Open http://localhost:8787 — portfolio hub with all ventures.

## Run while away

**Option A — Local (PC stays on):**
```powershell
npm run install:task   # starts daemon at Windows logon
```

**Option B — Cloud (PC off):**
Deploy to [Render](https://render.com) using `deploy/render.yaml`. Set env vars in dashboard. Point Stripe webhook to `https://your-app.onrender.com/webhooks/stripe`.

## Commands

| Command | What it does |
|---------|--------------|
| `npm run run:daemon` | Server + auto cycle every 6h (configurable) |
| `npm run run` | Single orchestrator cycle |
| `npm run stripe:sync` | Create all Stripe products + payment links |
| `npm run build` | Build all venture sites to `dist/` |
| `npm run health` | Verify DB, env, links, build |

## Ventures

See [docs/REVENUE_MAP.md](docs/REVENUE_MAP.md) for full strategy.

1. **PipeKit API** — developer micro-APIs (subscription)
2. **BillSnap** — invoice PDF generator (pay-per-use)
3. **LeaseLens** — lease red-flag analyzer (one-time)
4. **TemplateForge** — business document kits (digital)
5. **CompareStack** — SEO comparison pages (feeds your products)
6. **StatusPing** — uptime monitoring (subscription)

## Autonomous loop (every 6 hours)

- Sync Stripe payment links
- Regenerate SEO comparison pages
- Refresh PDF product catalog
- Run uptime checks for StatusPing customers
- Rebuild static sites with live checkout URLs
- Write `data/status-report.json`

## Stripe webhook events

Configure in Stripe Dashboard → Webhooks → `checkout.session.completed`

Fulfillment is automatic:
- **PipeKit** → API key generated
- **BillSnap / LeaseLens / TemplateForge** → license code `WE-...`
- **StatusPing** → monitor slots activated

## Required env

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PUBLIC_BASE_URL=https://your-domain.com
```

Optional: `RESEND_API_KEY` for email delivery of license codes.
