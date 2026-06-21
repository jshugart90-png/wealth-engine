# User First Dollar  -  Morning Handoff

**Prepared:** 2026-06-21T05:32:07Z (8 AM CT review)  
**Mode:** $0 budget only  -  no product rebuilds  
**Production:** https://wealth-engine-0qlj.onrender.com  
**Revenue:** $0 / $500 (0%) Ãƒâ€šÃ‚Â· **Coupon:** LAUNCH25 (25% off)

Consolidates overnight work from `board/MORNING_SUMMARY.md`, `board/APPS.md`, `D:\wealth-engine-data\reports\WEALTH_STATUS_2026-06-21.md`, `D:\wealth-engine-data\marketing\ZERO_BUDGET_PLAYBOOK.md`, `deploy/SEARCH_CONSOLE_BING_FREE_SETUP.md`, `board/GAMES.md`.

**8 AM deliverables (verified & timestamps refreshed):**

| Artifact | Path | Status |
|----------|------|--------|
| Morning summary | `C:\Users\jshug\wealth-engine\board\MORNING_SUMMARY.md` | OK Ãƒâ€šÃ‚Â· refreshed |
| Wealth status | `D:\wealth-engine-data\reports\WEALTH_STATUS_2026-06-21.md` | OK Ãƒâ€šÃ‚Â· refreshed |
| Overnight report | `D:\wealth-engine-data\reports\OVERNIGHT_SUMMARY_2026-06-21.md` | OK Ãƒâ€šÃ‚Â· refreshed |
| Scheduled task | `npm run install:8am-summary`  ->  daily `write-overnight-summary.mjs` | Documented |

---

## 1. What's live

| Surface | Count | Notes |
|---------|------:|-------|
| **Sitemap URLs** | **298** | `sitemap.xml` on prod; `lastmod` on build |
| **Programmatic SEO (`/p/*`)** | **214** pages (local dist) Ãƒâ€šÃ‚Â· **134+** keywords in rotation | Organic lag 2ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“4 weeks |
| **`/go/*` ad landings** | **22** HTML routes | BillSnap, HookRelay, stacks, compare, etc. |
| **Free tools (`/tools/*`)** | **26** pages + hub | Lead magnet; AdSense low priority |
| **Games (`/games/*`)** | **8** shipped, 5/5 QC each | All **NEEDS_PROMO**  -  see `board/GAMES.md` |
| **Stripe checkout** | **14 products** | Self-serve; webhook on Render |
| **Ventures on prod** | **9+** | BillSnap, StatusPing, NDAGen, PipeKit, HookRelay, CompareStack, bundles, partners |
| **Affiliate portal** | Live | `/partners/`, `/join.html`, `/refer.html` |
| **Google Ads CSV** | 6ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“7 campaigns | **Not imported**  -  paid; parked under zero budget |

**Health:** `/api/health` OK Ãƒâ€šÃ‚Â· **Deploy:** Render + `scripts/trigger-render-deploy.mjs`

---

## 2. $0 budget ONLY  -  ranked actions (~30 min total)

**Have a Mac?** Start with **#1 TestFlight** (Apple Dev ACTIVE, user confirmed 2026-06-21). **No Mac?** Start with **#2** below.

Do in order. Stop when 30 minutes are up; everything here is free (TestFlight upload is $0 beyond the paid Apple account).

| # | Action | Time | Why (first dollar) |
|---|--------|-----:|---------------------|
| 1 | **TestFlight upload (Mac only)** — Games Hub 8 games: `mobile/fastlane/README.md` → `bundle exec fastlane ios beta`; social drafts when live: `D:\wealth-engine-data\marketing\outreach\TESTFLIGHT_LAUNCH_2026-06-21.md` | 30–45 min | iOS distribution at $0 marginal cost; Apple Dev unblocked 2026-06-21 |
| 2 | **Google Search Console** — URL prefix `https://wealth-engine-0qlj.onrender.com/`, verify, submit `sitemap.xml` | 5 min | Unblocks discovery for 298 URLs |
| 3 | **Bing Webmaster** — Import from GSC, submit same sitemap | 5 min | Required before IndexNow works |
| 4 | **Re-run IndexNow** (after Bing verified) — see `deploy/SEARCH_CONSOLE_BING_FREE_SETUP.md` | 1 min | Pings ~291 URLs; was **403** until step 3 |
| 5 | **Reddit signup** — follow `D:\wealth-engine-data\marketing\REDDIT_SIGNUP_READY.md` | 2 min | Unblocks highest-intent community posts |
| 6 | **Post one thread** — `D:\wealth-engine-data\marketing\outreach\POST_TODAY.md` (HookRelay) or r/freelance copy in `FREE_POSTS_batch1.md` | 10 min | Direct traffic → Stripe |
| 7 | **Affiliate launch post** — paste Indie Hackers section from `D:\wealth-engine-data\marketing\outreach\AFFILIATE_LAUNCH_2026-06-21.md` | 7 min | Partners drive attributed sales at $0 |

**Optional if time left today (still $0):** itch.io upload (section 4), dev.to paste, Peerlist from `directory-submissions/DIRECTORY_PACK_2026-06-21.md`.

---

## 3. Blocked until you spend

| Spend | Item | Why blocked | Zero-budget alternative |
|-------|------|-------------|-------------------------|
| **Ad budget** | **Google Ads** CSV import (`D:\wealth-engine-data\marketing\ads\google-ads-import.csv`) | `BLOCKED_NO_BUDGET` in `board/MARKETING.md` | Organic + community posts above |
| **Ad budget** | **Microsoft Ads** | Same policy | Directories + SEO |
| **$25** | **Google Play Console** | Preflight + CI AAB ready; blocked on one-time fee | PWA + itch.io + web Stripe (`/go/*`, LAUNCH25) |

**Apple Developer:** **ACTIVE** (user confirmed **2026-06-21**). iOS is **not** blocked on payment — next step is **TestFlight upload on a Mac** (see mobile/APP_STORE_MANUAL_STEPS.md, campaign **MC-IOS-TESTFLIGHT**).

Do **not** import paid ads while running zero-budget mode unless you explicitly approve spend.

---

## 4. Free paths (reference)

| Path | Doc / asset | Your action |
|------|-------------|-------------|
| **GSC + Bing verify** | `C:\Users\jshug\wealth-engine\deploy\SEARCH_CONSOLE_BING_FREE_SETUP.md` | section 2 steps 1ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“3 |
| **itch.io (8 games)** | `npm run mobile:itch`  ->  `D:\wealth-engine-data\mobile\itch\{slug}.zip` | One HTML project each at https://itch.io/game/new  -  index `index.html`; slugs: horseshoe-toss, invoice-stack, uptime-defender, freelancer-memory, color-switch-snake, word-scramble-biz, receipt-rush, webhook-whack |
| **Affiliate launch post** | `D:\wealth-engine-data\marketing\outreach\AFFILIATE_LAUNCH_2026-06-21.md` | IH + dev.to channels in doc (no paid ads) |
| **dev.to paste** | `D:\wealth-engine-data\marketing\outreach\articles\invoice-without-subscription-2026-06-21.md` | Manual paste (no `DEVTO_API_KEY`) |
| **Partners recruitment** | Portal https://wealth-engine-0qlj.onrender.com/join.html Ãƒâ€šÃ‚Â· MC-012 in MARKETING | Share affiliate offer; 25% ÃƒÆ’Ã¢â‚¬â€ 12mo recurring |
| **Directory blitz** | `D:\wealth-engine-data\marketing\directory-submissions\DIRECTORY_PACK_2026-06-21.md` | Peerlist, Uneed, AltTo  -  10ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“15 min each |
| **Horseshoe cross-promo** | Upload `C:\Users\jshug\Website\index.html` to GoDaddy | Free hosting; promo bar to tools |

---

## 5. Reddit

**Signup (human-only, ~2 min):** [REDDIT_SIGNUP_READY.md](file:///D:/wealth-engine-data/marketing/REDDIT_SIGNUP_READY.md)  
Path: `D:\wealth-engine-data\marketing\REDDIT_SIGNUP_READY.md`

- Agent cannot complete email/phone OTP.
- After signup: join r/freelance, r/smallbusiness, r/webdev, r/SaaS, r/startups.
- First post priority: MC-010 BillSnap  -  `POST_2026-06-21_batch10.md` (TueÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Thu 9ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“11 AM CT).
- **12+** ready Reddit drafts across outreach batches.

---

## 6. Mobile & Games ($0 paths)

| Path | Detail |
|------|--------|
| **PWA install (share this)** | **LIVE on prod** - install works: https://wealth-engine-0qlj.onrender.com/games/ - Chrome menu -> **Add to Home Screen** (Games Hub shortcut) |
| **itch.io zips (free upload)** | `D:\wealth-engine-data\mobile\itch\` - `{slug}.zip` + `horseshoe-games-hub.zip`; pack: `node scripts/package-games-itch.mjs` |
| **Store preflight** | `npm run mobile:preflight` - Capacitor games app QC (15 PASS expected) |
| **Apple TestFlight (Mac required)** | mobile/APP_STORE_MANUAL_STEPS.md + mobile/fastlane/README.md — Apple Dev **ACTIVE** (2026-06-21); upload on Mac |
| **Google Play $25 (when ready)** | `mobile/APP_STORE_MANUAL_STEPS.md` Ãƒâ€šÃ‚Â§ Play - one-time fee only |
| **Tracker** | `board/APPS.md` - PWA, Capacitor apps, itch status |

**Prod PWA (LIVE, verified 2026-06-21 after commit `9dfe869`):** PWA install works; `GET /manifest.json` -> **200**; `GET /sw.js` -> **200**; `/games/` -> **200** (manifest/sw were **404** before static-path fix in `core/server.mjs`). See `board/APPS.md`.

**Capacitor workspace:** mobile/ exists (games hub **READY**, tools scaffold). **Apple:** ACTIVE (2026-06-21) → TestFlight on Mac. **Play:** \ still in section 3.

---

## 7. Files to open today

1. `C:\Users\jshug\wealth-engine\board\USER_FIRST_DOLLAR.md` - this checklist  
2. `C:\Users\jshug\wealth-engine\deploy\SEARCH_CONSOLE_BING_FREE_SETUP.md` - GSC/Bing/IndexNow  
3. `D:\wealth-engine-data\marketing\REDDIT_SIGNUP_READY.md` - Reddit account + first post  
4. `D:\wealth-engine-data\marketing\outreach\AFFILIATE_LAUNCH_2026-06-21.md` - partner + IH post  
5. `C:\Users\jshug\wealth-engine\board\GAMES.md` - live games + itch.io promo queue  
6. `C:\Users\jshug\wealth-engine\board\APPS.md` - mobile/PWA/itch pipeline tracker  
7. `C:\Users\jshug\wealth-engine\docs\MONETIZATION_MATRIX.md` - channel map (web, PWA, stores, ads)  

---

## Overnight wins (context only)

- **64 commits** after `bff97dc`; Render prod verified  
- **6 games** shipped with CTAs to paid SKUs  
- Partner portal, 16+ tools, bundles, CompareStack, compliance pSEO pilots  
- IndexNow key file live; **403** until Bing verification  
- **First dollar gate:** your ~30 min on section 2 (search consoles + one post), not more code tonight  

**Monitor:** Stripe dashboard for first LAUNCH25 checkout after posts go live.


