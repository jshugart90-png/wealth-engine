# Access needed to hit $500/month in 30 days

The pipeline below is built and runs automatically **once these are connected**. Without them, revenue stays near $0–20/mo.

## Required (blocking real scale)

| # | What | Why | How to provide |
|---|------|-----|----------------|
| 1 | **Custom domain** | localtunnel URLs don't rank or convert | Buy domain (~$12/yr) or use subdomain of horseshoeroundme.com |
| 2 | **DNS → Render/cloud host** | 24/7 uptime, Stripe webhooks stay valid | CNAME to Render service (script ready in `deploy/render-create-service.ps1`) |
| 3 | **GitHub repo `wealth-engine`** | Render deploys from git | Create empty repo at github.com/jshugart90-png/wealth-engine — I'll push |
| 4 | **Update `.env`** | Webhooks + emails break on URL change | Set `PUBLIC_BASE_URL`, `STRIPE_SUCCESS_URL` to your domain |
| 5 | **Google Ads account + billing** | Organic alone won't hit $500 in 30 days | ads.google.com — import CSV from `D:\wealth-engine-data\marketing\google-ads-import.csv` |
| 6 | **Ad budget ~$250–400** | Math: ~2,500 clicks × 2.5% conv × $8 AOV ≈ $500 | You control spend; pipeline generates campaigns |

## Strongly recommended (2–3× conversion)

| # | What | Why |
|---|------|-----|
| 7 | **Google Search Console** | Verify domain, submit sitemap, see queries |
| 8 | **Microsoft Ads** | Import same CSV — often cheaper CPC for B2B tools |
| 9 | **Stripe webhook URL update** | Point to `https://YOUR_DOMAIN/webhooks/stripe` after deploy |

## Optional (already wired if you have them)

| # | What | Status |
|---|------|--------|
| 10 | Resend (`RESEND_API_KEY`) | ✅ Patched from Horseshoe hub |
| 11 | Stripe secret | ✅ In `.env` |
| 12 | Render API | ✅ Found in `~/.render/cli.yaml` |

## One message to unlock everything

Reply with:

1. Domain you want to use (e.g. `tools.horseshoeroundme.com` or new domain)
2. Confirm GitHub repo created (or say "create it for me" with gh token)
3. Google Ads: "I'll import the CSV" or share manager account access
4. Monthly ad budget cap (e.g. `$300`)

I'll deploy, re-point webhooks, push cross-traffic from your Horseshoe site, and start the ramp daemon.

## Money Machine agents

The 11-agent Cursor loop lives in `board/` + `.cursor/rules/`. See [MONEY_MACHINE.md](MONEY_MACHINE.md).

Tier-2 approval notifications (optional):

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
# or SLACK_WEBHOOK_URL=...
```

Run `node scripts/notify-approval.mjs --pending` to ping pending AP-* items.
