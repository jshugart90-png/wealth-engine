# Wealth Engine

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://wealth-engine-0qlj.onrender.com)
[![Products](https://img.shields.io/badge/products-9-blue)](#ventures)
[![SEO Pages](https://img.shields.io/badge/SEO_pages-220+-informational)](#autonomous-loop-every-6-hours)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

**Autonomous multi-venture wealth machine** Ã¢â‚¬â€ 9 self-serve micro-SaaS products, one orchestrator, your Stripe account. No sales calls.

**Live portfolio:** https://wealth-engine-0qlj.onrender.com Ã‚Â· **Launch coupon:** `LAUNCH25` (25% off)

### Quick links

| Product | Try free | Landing |
|---------|----------|---------|
| BillSnap Ã¢â‚¬â€ invoice PDFs | [Preview](https://wealth-engine-0qlj.onrender.com/billsnap/index.html) | [/go/invoice.html](https://wealth-engine-0qlj.onrender.com/go/invoice.html) |
| StatusPing Ã¢â‚¬â€ uptime | [Monitor](https://wealth-engine-0qlj.onrender.com/statusping/index.html) | [/go/uptime.html](https://wealth-engine-0qlj.onrender.com/go/uptime.html) |
| HookRelay Ã¢â‚¬â€ webhooks | [Relay](https://wealth-engine-0qlj.onrender.com/hookrelay/index.html) | [/go/webhook.html](https://wealth-engine-0qlj.onrender.com/go/webhook.html) |
| NDAGen Ã¢â‚¬â€ NDA PDFs | [Generate](https://wealth-engine-0qlj.onrender.com/ndagen/index.html) | [/go/nda.html](https://wealth-engine-0qlj.onrender.com/go/nda.html) |
| Freelancer Stack $29/mo | [Bundle](https://wealth-engine-0qlj.onrender.com/bundles/freelancer-stack.html) | [/go/freelancer.html](https://wealth-engine-0qlj.onrender.com/go/freelancer.html) |
| Free calculators | [10+ tools](https://wealth-engine-0qlj.onrender.com/tools/index.html) | Ã¢â‚¬â€ |
| Partner program | [Portal](https://wealth-engine-0qlj.onrender.com/partners/index.html) Â· [Refer](https://wealth-engine-0qlj.onrender.com/refer.html) Â· [Join](https://wealth-engine-0qlj.onrender.com/join.html) | â€” |

**GitHub topics to add:** `micro-saas`, `freelancer-tools`, `invoice-generator`, `uptime-monitoring`, `webhook-relay`, `stripe`, `indie-hacker`, `side-project`, `seo`, `autonomous-agent`

## Quick start

```powershell
cd C:\Users\jshug\wealth-engine
copy .env.example .env
# Edit .env Ã¢â‚¬â€ add STRIPE_SECRET_KEY from https://dashboard.stripe.com/apikeys
npm install
npm run run:daemon
```

Open http://localhost:8787 Ã¢â‚¬â€ portfolio hub with all ventures.

## Run while away

**Option A Ã¢â‚¬â€ Local (PC stays on):**
```powershell
npm run install:task   # starts daemon at Windows logon
```

**Option B Ã¢â‚¬â€ Cloud (PC off):**
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

1. **PipeKit API** Ã¢â‚¬â€ developer micro-APIs (subscription)
2. **BillSnap** Ã¢â‚¬â€ invoice PDF generator (pay-per-use)
3. **LeaseLens** Ã¢â‚¬â€ lease red-flag analyzer (one-time)
4. **TemplateForge** Ã¢â‚¬â€ business document kits (digital)
5. **CompareStack** Ã¢â‚¬â€ SEO comparison pages (feeds your products)
6. **StatusPing** Ã¢â‚¬â€ uptime monitoring (subscription)

## Autonomous loop (every 6 hours)

- Sync Stripe payment links
- Regenerate SEO comparison pages
- Refresh PDF product catalog
- Run uptime checks for StatusPing customers
- Rebuild static sites with live checkout URLs
- Write `data/status-report.json`

## Stripe webhook events

Configure in Stripe Dashboard Ã¢â€ â€™ Webhooks Ã¢â€ â€™ `checkout.session.completed`

Fulfillment is automatic:
- **PipeKit** Ã¢â€ â€™ API key generated
- **BillSnap / LeaseLens / TemplateForge** Ã¢â€ â€™ license code `WE-...`
- **StatusPing** Ã¢â€ â€™ monitor slots activated

## Required env

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PUBLIC_BASE_URL=https://your-domain.com
```

Optional: `RESEND_API_KEY` for email delivery of license codes.

