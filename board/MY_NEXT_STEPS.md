# My Next Steps — Personal Assistant

**Updated:** 2026-06-21 · **Mode:** $0 budget only · **Revenue:** $0 / $500  
**Prod:** https://wealth-engine-0qlj.onrender.com · **Coupon:** LAUNCH25 (25% off)

> Personal Assistant reads this file first on every chat. Say **"done with [task]"** to mark complete and get the next priority.

---

## Today's briefing — path to first dollar ($0)

Overnight work shipped **298 sitemap URLs**, **14 Stripe products**, **8 games**, affiliate portal, and **13 Reddit drafts** (10 `READY_FOR_REVIEW`). Reddit account **u/WealthEngineDev** is live. Apple Developer is **ACTIVE** — TestFlight waits on Mac access. GSC is **verified** with sitemap submitted. **BingSiteAuth.xml** is deployed on prod — finish Bing verify in Webmaster, then IndexNow.

**Best 30-minute path today (no Mac):** Bing Webmaster **Verify** (2 min) → submit sitemap (2 min) → IndexNow (1 min) → one Reddit post (10 min). Optional: itch.io upload (15 min). That unlocks search discovery for 298 URLs plus direct traffic to Stripe checkout.

**If you have a Mac today:** swap step 3 for TestFlight upload first (`mobile/fastlane/README.md`, 30–45 min) — iOS distribution at $0 marginal cost.

---

﻿## Do right now

Top 3 actions (~15 min each, $0 budget). Do in order. (GSC verify + sitemap: **done** 2026-06-21.)

### 1. Verify site in Bing Webmaster Tools

| | |
|---|---|
| **Time** | ~5 min |
| **Cost** | $0 |
| **Guide** | `C:\Users\jshug\wealth-engine\deploy\SEARCH_CONSOLE_BING_FREE_SETUP.md` § step 2 |
| **Verify file (LIVE)** | https://wealth-engine-0qlj.onrender.com/BingSiteAuth.xml |

**Steps:**

1. Open https://www.bing.com/webmasters
2. Add or open site `wealth-engine-0qlj.onrender.com` (or **Import from Google Search Console** if not added yet)
3. Choose **XML file** verification → confirm file is live at `/BingSiteAuth.xml` (deployed via `core/build-all.mjs`)
4. Click **Verify** in Bing Webmaster
5. Go to **Sitemaps** → submit: `https://wealth-engine-0qlj.onrender.com/sitemap.xml`
6. Confirm site shows as **Verified**

**Expected outcome:** Bing Webmaster shows verified site with sitemap submitted.

**Unlocks:** IndexNow re-run (Do today #4) — currently returns **403** until verify completes. Pings ~291 URLs to Bing/Yandex instantly.

---

### 2. Post first Reddit thread (BillSnap Pro — r/freelance)

| | |
|---|---|
| **Time** | ~10 min |
| **Cost** | $0 |
| **Account** | https://reddit.com/user/WealthEngineDev (live) |
| **Draft** | `D:\wealth-engine-data\marketing\reddit-drafts\2026-06-21-2-freelance.md` |
| **Workflow** | `C:\Users\jshug\wealth-engine\board\REDDIT_WORKFLOW.md` |

**Steps:**

1. Open the draft file above — status is `READY_FOR_REVIEW`
2. Read title and body; edit if you want (optional)
3. Log in to Reddit as **u/WealthEngineDev**
4. Go to https://reddit.com/r/freelance/submit
5. Paste **Title** and **Body** from the draft (lines under `# Title` and `# Body`)
6. Submit the post
7. Stay in comments **30+ min** — reply to questions honestly
8. Copy the post URL → update draft frontmatter: `status: PUBLISHED` and `published_url: https://reddit.com/r/freelance/comments/...`
9. Say **"done with Reddit freelance post"** in chat so assistant marks it complete

**Expected outcome:** Live Reddit post driving traffic to `https://wealth-engine-0qlj.onrender.com/go/billsnap-pro.html` with LAUNCH25 coupon.

**Unlocks:** Direct Stripe checkout traffic; credibility for follow-up posts in r/smallbusiness, r/webdev (9 more drafts ready). Monitor Stripe dashboard for first LAUNCH25 sale.

**Best time:** Tue–Thu 9–11 AM CT (draft `suggested_time`). OK to post now for first test.

---

### 3. Optional: Upload one game to itch.io (Horseshoe Toss)

| | |
|---|---|
| **Time** | ~15 min |
| **Cost** | $0 |
| **Zip** | `D:\wealth-engine-data\mobile\itch\horseshoe-toss.zip` |
| **URL** | https://itch.io/game/new |

**Steps:**

1. Open https://itch.io/game/new
2. Upload `horseshoe-toss.zip` (HTML project → set main file to `index.html` inside zip)
3. Add title, short description, and link to https://wealth-engine-0qlj.onrender.com/games/
4. Publish (free)

**Expected outcome:** One game live on itch.io for discovery; 7 more zips ready in same folder.

**Unlocks:** MC-GAMES-001 game distribution channel at $0.

---

## Do today

30–60 min total beyond the top 3.

### 4. Re-run IndexNow (after Bing verified)

| | |
|---|---|
| **Time** | ~1 min |
| **Cost** | $0 |
| **Prerequisite** | GSC done; Bing verify (Do right now #1) complete |
| **Key file (already LIVE)** | https://wealth-engine-0qlj.onrender.com/wealth-engine-0qlj-onrender-com-indexnow.txt |

IndexNow key file is built on every `npm run build` (`core/marketing/indexnow.mjs`). No redeploy needed for the key — only re-run submit after Bing shows **Verified**.

**Steps:**

```powershell
cd C:\Users\jshug\wealth-engine
node -e "import('./core/marketing/indexnow.mjs').then(m => m.submitIndexNow().then(console.log))"
```

**Check log:** `D:\wealth-engine-data\marketing\indexnow-log.json` — expect `ok: true`, not HTTP 403.

**Unlocks:** Instant ping of ~291 URLs to Bing/Yandex search indexes.

---

### 5. Upload Horseshoe promo bar to GoDaddy

| | |
|---|---|
| **Time** | ~10 min |
| **Cost** | $0 |
| **Source file** | `C:\Users\jshug\Website\index.html` |
| **Guide** | `C:\Users\jshug\wealth-engine\deploy\GODADDY_DNS.md` § Step 2 |

**Steps:**

1. GoDaddy → **My Products** → `horseshoeroundme.com` → **Manage**
2. If **cPanel File Manager**: upload/replace `public_html/index.html` from `C:\Users\jshug\Website\index.html`
3. If **Website Builder**: paste promo bar HTML at top of homepage (see line ~141 in source file)
4. Visit https://horseshoeroundme.com — confirm dark promo bar with links to Invoice PDF, Meeting Cost, etc.
5. Click a promo link — should open `https://wealth-engine-0qlj.onrender.com/go/...`

**Expected outcome:** Horseshoe site cross-promotes Wealth Engine tools (MC-005 live).

**Unlocks:** Free traffic from existing Horseshoe audience; pairs with T-006 in `board/TASKS.md`.

---

### 6. Affiliate launch post on Indie Hackers

| | |
|---|---|
| **Time** | ~7 min |
| **Cost** | $0 |
| **Copy** | `D:\wealth-engine-data\marketing\outreach\AFFILIATE_LAUNCH_2026-06-21.md` |

**Steps:**

1. Open the file above → find **Indie Hackers** section
2. Go to https://www.indiehackers.com/post/new
3. Paste title + body from the doc
4. Include partner portal link: https://wealth-engine-0qlj.onrender.com/join.html
5. Publish

**Expected outcome:** Partner recruitment post live (25% × 12mo recurring commission).

**Unlocks:** MC-012 affiliate channel; partners drive attributed sales at $0 ad spend.

---

## Do this week

| # | Task | Time | File / URL | Unlocks |
|---|------|-----:|------------|---------|
| 7 | **GoDaddy DNS CNAME** `tools` → Render | 15 min | `deploy/GODADDY_DNS.md` | Custom domain `tools.horseshoeroundme.com`, T-002 |
| 8 | **Post 2 more Reddit drafts** | 20 min | `D:\wealth-engine-data\marketing\reddit-drafts\` (10 READY) | More community traffic |
| 9 | **itch.io upload** — 1 game to start | 15 min | `D:\wealth-engine-data\mobile\itch\horseshoe-toss.zip` → https://itch.io/game/new | MC-GAMES-001, game discovery |
| 10 | **dev.to article paste** | 10 min | `D:\wealth-engine-data\marketing\outreach\articles\invoice-without-subscription-2026-06-21.md` | SEO + dev audience |
| 11 | **Directory blitz** — Peerlist + Uneed | 20 min | `D:\wealth-engine-data\marketing\directory-submissions\DIRECTORY_PACK_2026-06-21.md` | Backlinks + launch visibility |
| 12 | **Update Stripe webhook** after custom domain | 5 min | Stripe Dashboard → Webhooks | T-002 completion |

---

## Blocked until you provide

| Blocker | What you need | Workaround ($0) |
|---------|---------------|-----------------|
| **TestFlight upload** | Mac with Xcode + App Store Connect API key | PWA at `/games/` + itch.io uploads |
| **Google Play** | $25 one-time Play Console fee | Web Stripe checkout + PWA |
| **Google Ads** | Ad budget approval | Organic + Reddit + directories |
| **Microsoft Ads** | Ad budget approval | Same as above |
| **Custom domain SSL** | Complete CNAME step 7 above | Render URL works today |
| **Auto email outreach** | `RESEND_API_KEY` in `.env` | Manual Gmail from cold templates |
| **dev.to API** | `DEVTO_API_KEY` | Manual paste (step 10) |

### TestFlight details (when Mac available)

| | |
|---|---|
| **Apple Dev** | ACTIVE (confirmed 2026-06-21) |
| **Guide** | `mobile/fastlane/README.md` + `mobile/APP_STORE_MANUAL_STEPS.md` |
| **Command** | `bundle exec fastlane ios beta` (from `mobile/`) |
| **After upload** | Post from `D:\wealth-engine-data\marketing\outreach\TESTFLIGHT_LAUNCH_2026-06-21.md` |

---

## Completed

- [x] Deploy to Render — prod healthy (`T-001`) — 2026-06-21
- [x] Stripe live sync (14 products) + webhook — 2026-06-21
- [x] Reddit signup — **u/WealthEngineDev** live — 2026-06-21
- [x] Apple Developer account — **ACTIVE** — 2026-06-21
- [x] PWA manifest + service worker — verified 200 on prod — 2026-06-21
- [x] 13 Reddit drafts generated (10 READY_FOR_REVIEW) — 2026-06-21
- [x] 8 games shipped + itch.io zips packaged — 2026-06-21
- [x] 298 sitemap URLs on prod — 2026-06-21
- [x] Affiliate portal live (`/join.html`, `/refer.html`) — 2026-06-21
- [x] Horseshoe promo bar coded in `C:\Users\jshug\Website\index.html` — pending GoDaddy upload
- [x] GSC HTML verification meta tag deployed to Render prod — 2026-06-21
- [x] Google Search Console verify + sitemap submit (298 URLs) — 2026-06-21
- [x] BingSiteAuth.xml deployed to prod (`/BingSiteAuth.xml`) — pending user **Verify** click in Bing Webmaster — 2026-06-21

---

## Quick wins

Small actions if you have 5–15 spare minutes.

| Win | Time | How | Payoff |
|-----|-----:|-----|--------|
| **itch.io — one game** | 15 min | Upload `D:\wealth-engine-data\mobile\itch\horseshoe-toss.zip` at https://itch.io/game/new → HTML → index `index.html` | Free game distribution; 8 more zips ready |
| **One Reddit post** | 10 min | Pick any `READY_FOR_REVIEW` draft in `D:\wealth-engine-data\marketing\reddit-drafts\` | Direct traffic → Stripe |
| **Join subreddits** | 2 min | r/freelance, r/smallbusiness, r/webdev, r/SaaS, r/startups | Required before posting |
| **Share PWA link** | 1 min | Send https://wealth-engine-0qlj.onrender.com/games/ → "Add to Home Screen" | Free mobile install |
| **Stripe dashboard check** | 2 min | https://dashboard.stripe.com — watch for LAUNCH25 checkouts | Confirms post → sale funnel |

---

## Reference

| Item | Path |
|------|------|
| First dollar checklist | `board/USER_FIRST_DOLLAR.md` |
| Build queue | `board/TASKS.md` |
| Marketing campaigns | `board/MARKETING.md` |
| Reddit workflow | `board/REDDIT_WORKFLOW.md` |
| Personal assistant playbook | `docs/PERSONAL_ASSISTANT_PLAYBOOK.md` |
| Products (79 SKUs) | `D:\wealth-engine-data\reports\WEALTH_ENGINE_PRODUCTS_2026-06-21.xlsx` |
| Agent rule | `.cursor/rules/personal-assistant.mdc` |
