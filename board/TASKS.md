# Build Queue (Final Boss owned)

Status: `todo` | `in_progress` | `blocked` | `done`

**Goal:** $500/mo · **Current Stripe products:** 14 · **Data:** `D:\wealth-engine-data`

| # | Task | Owner agent | Status | Blocker |
|---|------|-------------|--------|---------|
| T-001 | Deploy wealth-engine to Render; verify `/api/health` | Deploy Guy | todo | Live: https://wealth-engine-0qlj.onrender.com |
| T-002 | Point custom domain + update `PUBLIC_BASE_URL` + Stripe webhook | Deploy Guy | blocked | Human: CNAME `tools.horseshoeroundme.com` → Render (see deploy/GODADDY_DNS.md) |
| T-003 | Import `google-ads-import.csv` from `D:\wealth-engine-data\marketing\ads\` | Marketing Guy | blocked | Human: 5-min import — see ADS_IMPORT_CHECKLIST.md |
| T-004 | Optimize BillSnap `/go/invoice` landing + LAUNCH25 coupon in ads copy | Marketing Guy + Code Cracker Guy | in_progress | Ads CSV points to /go/* landings with improved copy |
| T-005 | Run orchestrator on 180m interval; confirm ramp-report.json updates | Final Boss | in_progress | Render daemon + local MM daemon running |
| T-006 | Deploy horseshoeroundme.com cross-promo bar | Marketing Guy | in_progress | Promo bar in Website/index.html — upload to GoDaddy (NOT Netlify) |
| T-007 | AdSense free tools + privacy page | Code Cracker Guy | done | /tools/tip-calculator, /privacy.html — see docs/ADSENSE_ADMOB_SETUP.md |
| T-008 | 8 AM summary scheduled task | Final Boss | done | `npm run install:8am-summary` + summary written overnight |

## Completed

| # | Task | Done |
|---|------|------|
| — | Seed Money Machine board + 11 agent rules | 2026-06-20 |
| — | Fix orchestrator uptime step (runUptimeChecks) | 2026-06-20 |
| — | AP-001/002/003 approved; GitHub repo + Render prod live | 2026-06-21 |
| — | Stripe live sync (14 products) + webhook on Render URL | 2026-06-21 |
| — | Google Ads CSV updated to Render URLs | 2026-06-21 |
| — | Full agent chain + growth ramp executed | 2026-06-21 |
| — | Overnight sprint: GoDaddy DNS docs, ads checklist, ad tools, funnel API, thanks page | 2026-06-21 |
