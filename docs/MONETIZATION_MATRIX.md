# Monetization Matrix — Wealth Engine

**Prod:** https://wealth-engine-0qlj.onrender.com · **Budget:** $0 for new fees (Apple Dev ✅ active)  
**Updated:** 2026-06-21

## Channel overview

| Channel | Product | Cost to ship | Revenue model | Status | Automation |
|---------|---------|--------------|---------------|--------|------------|
| **Stripe checkout** | 21 SKUs (BillSnap, PipeKit, stacks, etc.) | $0 | One-time + subscription | **LIVE** | Webhook → license/API key |
| **Google Search Ads** | 7 campaigns → `/go/*` | AP-001 ($300/mo cap) | Paid traffic → Stripe | CSV ready, import blocked | `core/pipeline/ads-export.mjs` |
| **AdSense (web)** | Free tools + games hub | $0 | Display CPM | Placeholders live | Apply after privacy page |
| **AdMob (mobile/web games)** | Games hub + 8 games | $0 (test IDs) | Banner + rewarded | **TEST MODE** | Swap env → rebuild |
| **PWA install** | Full site + games hub | $0 | AdSense in browser shell | **LIVE** | `manifest.json` + `sw.js` on Render |
| **itch.io** | 8 games + hub zip | $0 | Free / pay-what-you-want | **PACKAGED** | `npm run mobile:itch` |
| **Google Play** | Horseshoe Games Hub (Capacitor) | **$25 one-time** | AdMob + cross-sell | **BLOCKED (fee)** | CI AAB → manual upload |
| **Apple App Store** | Horseshoe Games Hub (Capacitor) | **$0** (Dev account ✅) | AdMob + cross-sell | **READY → TestFlight** | macOS + Xcode + Fastlane on Mac |
| **Affiliate** | `/partners/` portal | $0 | 25% recurring commission | **LIVE** | Stripe webhook commissions |
| **Organic SEO** | 298 URLs (pSEO, tools, compare) | $0 | Stripe + affiliate | **LIVE** | Orchestrator rebuild 6h |
| **Freelancer Tools app** | Capacitor shell (BillSnap + tools) | Play $25 | Stripe IAP via browser | **SCaffold** | Play fee; iOS after games ship |

## Stripe SKU map (primary revenue)

| Venture | Entry SKU | Price | Landing |
|---------|-----------|-------|---------|
| BillSnap | pro-pdf | $3 | `/go/invoice.html` |
| BillSnap | unlimited-month | $29/mo | `/go/billsnap-pro.html` |
| LeaseLens | report | $7 | `/go/lease.html` |
| StatusPing | starter | $5/mo | `/go/uptime.html` |
| NDAGen | single | $4 | `/go/nda.html` |
| Freelancer Stack | bundle | $29/mo | `/go/freelancer.html` |
| HookRelay DLQ | pro | $29/mo | `/go/hookrelay-dlq.html` |
| DevWatch | bundle | $39/mo | `/go/devwatch.html` |
| Revenue Stack | all-access | $29/mo | `/go/stack.html` |

Full catalog: `config/ventures.json` + `payment-links.json`.

## AdMob test → production swap

Games and hub inject `window.WE_ADMOB` at build time via `core/marketing/monetization.mjs`.

| Env var | Test value (default) | Production |
|---------|---------------------|------------|
| `ADMOB_APP_ID` | `ca-app-pub-3940256099942544~3347511713` | AdMob console app ID |
| `ADMOB_BANNER_ID` | `ca-app-pub-3940256099942544/6300978111` | Banner unit ID |
| `ADMOB_REWARDED_ID` | `ca-app-pub-3940256099942544/5224354917` | Rewarded unit ID |

**Steps:** Set vars in `.env` → `npm run build` → verify `testMode:false` in built HTML → run preflight check #8 PASS.

See `docs/ADSENSE_ADMOB_SETUP.md` and `mobile/.env.example`.

## Games monetization stack

| Layer | Mechanism | Notes |
|-------|-----------|-------|
| In-game ads | AdMob test banners on `.ad` slots | Rewarded unlocks LAUNCH25 codes |
| Cross-sell | CTAs to BillSnap, StatusPing, Freelancer Stack | Hardcoded in game HTML |
| Distribution | PWA, itch.io, future Play/App Store | No IAP in games app |
| Analytics | `/api/funnel/visit` | Optional ref attribution |

## Mobile app packaging

| App | Bundle ID | Wrapper | Content source |
|-----|-----------|---------|----------------|
| Horseshoe Games Hub | `com.wealthengine.gameshub` | Capacitor 6 | `/games/` (bundled or live URL) |
| Freelancer Tools | `com.wealthengine.freelancertools` | Capacitor 6 | Live Render URL |

Build: `cd mobile && npm run sync:games` → `npx cap open android`  
CI AAB: `.github/workflows/mobile-build.yml`  
QC: `node scripts/app-store-preflight.mjs`

## $0 budget blockers (manual only)

| Blocker | Cost | Doc |
|---------|------|-----|
| Google Play Console | $25 one-time | `mobile/APP_STORE_MANUAL_STEPS.md` |
| iOS TestFlight upload | $0 (needs Mac) | `mobile/fastlane/README.md` |
| Google Ads import | $300/mo cap | `board/APPROVALS.md` AP-001 |
| AdSense approval | $0 | Apply at google.com/adsense |

**Apple Developer Program:** ✅ active — not a blocker.

## Revenue priority (Money Math)

1. **Stripe checkout** — highest margin, already live  
2. **Organic SEO** — compounding, 298 URLs indexed  
3. **Google Search Ads** — when AP-001 approved  
4. **AdSense** — passive on free tools  
5. **AdMob** — after Play/App publish  
6. **itch.io** — discovery + portfolio link, no fee
