# Build Queue (Final Boss owned)

Status: `todo` | `in_progress` | `blocked` | `done`

**Goal:** $500/mo · **Current Stripe products:** 14 · **Data:** `D:\wealth-engine-data`

| # | Task | Owner agent | Status | Blocker |
|---|------|-------------|--------|---------|
| T-001 | Deploy wealth-engine to Render; verify `/api/health` | Deploy Guy | todo | Prod live; `/go/nda.html` + ad tools verified 200 (2026-06-21) |
| T-002 | Point custom domain + update `PUBLIC_BASE_URL` + Stripe webhook | Deploy Guy | blocked | Human: CNAME `tools.horseshoeroundme.com` → Render (see deploy/GODADDY_DNS.md) |
| T-003 | Import `google-ads-import.csv` from `D:\wealth-engine-data\marketing\ads\` | Marketing Guy | blocked | Human: 5-min import — see ADS_IMPORT_CHECKLIST.md |
| T-004 | Optimize BillSnap `/go/invoice` landing + LAUNCH25 coupon in ads copy | Marketing Guy + Code Cracker Guy | in_progress | 15 /go/* landings, $16/day ads budget, stack SKU live |
| T-005 | Run orchestrator on 180m interval; confirm ramp-report.json updates | Final Boss | in_progress | Render daemon + local MM daemon running |
| T-006 | Deploy horseshoeroundme.com cross-promo bar | Marketing Guy | in_progress | Promo bar in Website/index.html — upload to GoDaddy (NOT Netlify) |
| T-007 | AdSense free tools + privacy page | Code Cracker Guy | done | 4 free tools + /privacy.html |
| T-009 | Build pipeline ships SEO/bundles/sitemap on `npm run build` | Code Cracker Guy | done | dist/p/*, bundles, sitemap in build |
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
| — | Cycle 1: 6 /go landings, 4 ad tools, build ships SEO+bundles, 7 new SEO keywords | 2026-06-21 |
| — | Cycle 2: Render API deploy (7 commits), 5 SEO keywords, ads CSV regen | 2026-06-21 |
| — | Build/QC Cycle 1: 3 go landings, 2 tools, 5 SEO, invoice conversion | 2026-06-21 |
| — | Build/QC Cycle 2: Freelancer Stack SKU, HookRelay DLQ Pro, 13 SEO, /go/stack | 2026-06-21 |
