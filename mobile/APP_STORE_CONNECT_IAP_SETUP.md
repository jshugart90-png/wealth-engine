# App Store Connect — IAP & TestFlight Setup

**Repo:** github.com/jshugart90-png/wealth-engine  
**Apple Developer:** ✅ Active  
**IAP catalog:** `config/mobile-iap-products.json` (56 products across 32 apps)  
**Local StoreKit test:** `mobile/storekit/Products.storekit`

---

## Overview

Each Capacitor wrapper is a **separate App Store Connect app record** with its own bundle ID. This monorepo uses one Fastlane lane per app (`beta_<slug>`) — see `mobile/TESTFLIGHT_ALL_APPS.md`.

**Dual monetization:** Mobile IAP (App Store) + Stripe checkout (web). Stripe SKU links are in `config/mobile-iap-products.json` → `stripeSku` field. Users can pay on web or in-app; license sync is manual until RevenueCat + backend webhook is wired.

---

## Step 1 — Register App IDs (developer.apple.com)

For each bundle ID in the table below:

1. **Identifiers → + → App IDs → App**
2. Bundle ID: exact match (e.g. `com.wealthengine.receiptrush`)
3. Enable **In-App Purchase**
4. Save

Repeat for all 32 apps (or prioritize games first).

---

## Step 2 — Create App Store Connect app records

1. [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps → +**
2. **New App** → iOS → name from `mobile/store-metadata/<slug>/metadata.json`
3. Bundle ID: select registered ID
4. SKU: `we-<slug>` (e.g. `we-receipt-rush`)
5. User Access: Full Access

Copy metadata from `mobile/store-metadata/<slug>/`:
- **description.txt** → Description
- **keywords.txt** → Keywords
- **metadata.json** → URLs, category, age rating

---

## Step 3 — Create IAP products (per app)

For each app → **Features → In-App Purchases → +**

### Games (12 standalone + Games Hub)

| Product key | Type | Price | Product ID pattern |
|-------------|------|-------|-------------------|
| `remove_ads` | Non-Consumable | $2.99 | `{bundleId}.remove_ads` |
| `premium_unlock` | Non-Consumable | $4.99 | `{bundleId}.premium_unlock` |
| `tip_jar` | Consumable | $0.99 | `{bundleId}.tip_jar` |

### Utility / Pro apps

| Product key | Type | Price | Product ID pattern |
|-------------|------|-------|-------------------|
| `pro_unlock` | Non-Consumable | $4.99 | `{bundleId}.pro_unlock` |

**Reference name:** `{App Name} {Product Title}`  
**Review screenshot:** Required — capture IAP sheet from TestFlight build.

---

## Step 4 — Product ID master table

Run for full JSON:

```bash
node -e "import c from './config/mobile-iap-products.json' with {type:'json'}; console.log(JSON.stringify(c.apps,null,2))"
```

| # | App | Bundle ID | IAP count | Products |
|---|-----|-----------|-----------|----------|
| 1 | Horseshoe Games Hub | `com.wealthengine.gameshub` | 3 | remove_ads, premium_unlock, tip_jar |
| 2 | Freelancer Tools | `com.wealthengine.freelancertools` | 1 | pro_unlock |
| 3 | Receipt Rush | `com.wealthengine.receiptrush` | 3 | remove_ads, premium_unlock, tip_jar |
| 4 | Webhook Whack | `com.wealthengine.webhookwhack` | 3 | remove_ads, premium_unlock, tip_jar |
| 5 | Invoice Stack | `com.wealthengine.invoicestack` | 3 | remove_ads, premium_unlock, tip_jar |
| 6 | Horseshoe Toss | `com.wealthengine.horseshoetoss` | 3 | remove_ads, premium_unlock, tip_jar |
| 7 | Uptime Defender | `com.wealthengine.uptimedefender` | 3 | remove_ads, premium_unlock, tip_jar |
| 8 | Freelancer Memory | `com.wealthengine.freelancermemory` | 3 | remove_ads, premium_unlock, tip_jar |
| 9 | Color Switch Snake | `com.wealthengine.colorswitchsnake` | 3 | remove_ads, premium_unlock, tip_jar |
| 10 | Word Scramble Biz | `com.wealthengine.wordscramblebiz` | 3 | remove_ads, premium_unlock, tip_jar |
| 11 | Net-30 Ninja | `com.wealthengine.net30ninja` | 3 | remove_ads, premium_unlock, tip_jar |
| 12 | SSL Shield | `com.wealthengine.sslshield` | 3 | remove_ads, premium_unlock, tip_jar |
| 13 | NDA Speed Sign | `com.wealthengine.ndaspeedsign` | 3 | remove_ads, premium_unlock, tip_jar |
| 14 | BillSnap | `com.wealthengine.billsnap` | 1 | pro_unlock (Stripe: pro-pdf) |
| 15 | StatusPing Lite | `com.wealthengine.statuspinglite` | 1 | pro_unlock (Stripe: starter) |
| 16 | LeaseLens | `com.wealthengine.leaselens` | 1 | pro_unlock (Stripe: report) |
| 17 | NDAGen | `com.wealthengine.ndagen` | 1 | pro_unlock (Stripe: pdf) |
| 18 | HookRelay | `com.wealthengine.hookrelay` | 1 | pro_unlock (Stripe: monthly) |
| 19 | PipeKit | `com.wealthengine.pipekit` | 1 | pro_unlock (Stripe: starter) |
| 20 | MeetingCost | `com.wealthengine.meetingcost` | 1 | pro_unlock (Stripe: pro) |
| 21 | TemplateForge | `com.wealthengine.templateforge` | 1 | pro_unlock |
| 22 | CompareStack | `com.wealthengine.comparestack` | 1 | pro_unlock |
| 23–32 | Calculator Pro apps + stacks | `com.wealthengine.*` | 1 each | pro_unlock |

**Total:** 56 IAP products (36 game + 20 utility).

Full product IDs: `com.wealthengine.{bundleSuffix}.{productKey}` — see `config/mobile-iap-products.json`.

---

## Step 5 — Sandbox testers

1. App Store Connect → **Users and Access → Sandbox → Testers**
2. **+** → add email (not an existing Apple ID)
3. On device: Settings → App Store → Sandbox Account → sign in
4. Install via TestFlight → purchase IAP → verify sandbox receipt

---

## Step 6 — RevenueCat (optional, recommended)

1. [RevenueCat](https://www.revenuecat.com/) → New Project
2. Add iOS app per bundle ID (or one project with multiple apps)
3. Import product IDs from `config/mobile-iap-products.json`
4. Install plugin per app:

```bash
cd mobile/<slug>
npm install @revenuecat/purchases-capacitor
npx cap sync ios
```

5. Replace sandbox confirm dialog in `mobile/shared/iap.mjs` client bridge with native `Purchases.purchaseProduct()` once API key is set.

---

## Step 7 — TestFlight upload (Mac only)

```bash
git clone https://github.com/jshugart90-png/wealth-engine.git && cd wealth-engine
npm ci && npm run build
cp mobile/fastlane/.env.example mobile/fastlane/.env   # API key paths
cd mobile && bundle install

# Per app
npm run mobile:sync:receipt-rush          # from repo root
cd mobile/receipt-rush && npm install
npx cap add ios                           # first time only
npx cap sync ios
cd .. && bundle exec fastlane ios beta_receipt_rush
```

Validate before upload:

```bash
npm run mobile:ios-checklist              # all apps
npm run mobile:preflight:receipt-rush     # per-app QC
```

---

## Step 8 — Monorepo upload guide

| Approach | When to use |
|----------|-------------|
| **One app record per bundle ID** | Production — required for separate store listings |
| **TestFlight internal only** | Upload hub + top games first (games, receipt-rush, billsnap) |
| **Batch script on Mac** | Loop `bundle exec fastlane ios beta_*` after `cap sync` each app |

CI: `.github/workflows/ios-testflight.yml` — manual `workflow_dispatch`, builds on `macos-latest` (requires secrets).

---

## Manual blockers (user action required)

| Blocker | Owner |
|---------|-------|
| Create 32 App Store Connect app records | User |
| Create 56 IAP products in App Store Connect | User |
| Mac + Xcode for archive/upload | User |
| App Store Connect API key in `mobile/fastlane/.env` | User |
| RevenueCat API keys (optional) | User |
| Production AdMob IDs before App Store ads | User |

Windows cannot run `xcodebuild` or Fastlane iOS upload — use Mac or GitHub Actions macOS runner with secrets.
