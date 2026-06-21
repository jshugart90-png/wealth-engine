# Wealth Engine — Revenue Map

Six **independent** ventures. Zero dependency on your social media. Each channel is designed for autonomous discovery and checkout.

## Venture portfolio

| Venture | Model | Discovery (no social) | Autonomous mechanics |
|---------|-------|----------------------|----------------------|
| **PipeKit API** | SaaS $9–29/mo | SEO, API directories, dev forums | API keys via Stripe webhook, rate limits |
| **BillSnap** | $3/export or $12/mo | Google SEO "invoice generator" | Preview free → license unlocks PDF |
| **LeaseLens** | $7/report | SEO "lease analyzer", tenant forums | Rule engine, instant report |
| **TemplateForge** | $12–19 kits | SEO "business templates" | Catalog auto-regenerates |
| **CompareStack** | Affiliate/owned | Programmatic SEO comparison pages | Pages auto-refresh, link to your Stripe |
| **StatusPing** | $5–19/mo | Comparison pages, indie dev SEO | Background uptime daemon |

## Wealth flywheel

```
SEO / directories / comparisons
        ↓
   Free tier or preview
        ↓
   Stripe checkout (your account)
        ↓
   Webhook → license/API key (automatic)
        ↓
   Deliverable / service runs on daemon
        ↓
   Orchestrator rebuilds + syncs catalog (every 6h)
```

## What runs while you're away

1. **`npm run run:daemon`** — HTTP server + orchestrator loop (default every 6 hours)
2. **Windows Scheduled Task** — starts daemon at login (`npm run install:task`)
3. **Orchestrator cycle** — Stripe sync, SEO page refresh, PDF catalog, uptime checks, site rebuild
4. **Stripe webhooks** — `/webhooks/stripe` creates licenses and API keys without you

## One-time setup (~10 min)

```powershell
cd C:\Users\jshug\wealth-engine
copy .env.example .env
# Add STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET from dashboard.stripe.com
npm install
npm run run
```

Point Stripe webhook to: `https://YOUR_DOMAIN/webhooks/stripe`

Deploy `dist/` + server to Render/Railway/Fly.io (see `deploy/render.yaml`).

## Revenue diversification (why this isn't "one bet")

- **B2B dev tools** (PipeKit) — recurring
- **Freelancer utilities** (BillSnap) — high volume low ticket
- **Consumer utility** (LeaseLens) — seasonal search traffic
- **Digital goods** (TemplateForge) — passive catalog
- **SEO arbitrage** (CompareStack) — compounds over months
- **Infrastructure SaaS** (StatusPing) — sticky subscriptions

## Legal

All ventures sell original software/templates. CompareStack discloses owned products. LeaseLens/BillSnap disclaim legal advice. Stripe TOS compliant categories only.
