# App Development Pipeline

**Agent:** App Developer · **Updated:** 2026-06-22  
**GitHub:** github.com/jshugart90-png/wealth-engine  
**TestFlight target:** iOS first (Apple Developer ACTIVE)

## Pipeline

| App | Bundle ID | Phase | Tests | GitHub | TestFlight |
|-----|-----------|-------|-------|--------|------------|
| **Horseshoe Games Hub** | `com.wealthengine.gameshub` | **TestFlight prep** | 15 PASS, 0 FAIL, 1 WARN | `99180a7` pushed | **READY** (Mac upload) |
| **Freelancer Tools** | `com.wealthengine.freelancertools` | **TestFlight prep** | 15 PASS, 0 FAIL | `c9a03f6` pushed | **READY** (Mac upload) |
| **Receipt Rush** | `com.wealthengine.receiptrush` | **TestFlight prep** | 16 PASS, 0 FAIL, 1 WARN | `b730bb9` pushed | **READY** (Mac upload) |
| **Webhook Whack** | `com.wealthengine.webhookwhack` | **TestFlight prep** | 16 PASS, 0 FAIL, 1 WARN | `9098f67` pushed | **READY** (Mac upload) |
| **Invoice Stack** | `com.wealthengine.invoicestack` | **TestFlight prep** | 16 PASS, 0 FAIL, 1 WARN | pending push | **READY** (Mac upload) |
| App 6+ | TBD | Queued | — | — | — |

## App 1 — Horseshoe Games Hub

| Field | Value |
|-------|-------|
| Version | 1.0.1 |
| Games | 9 (all in hub) |
| Capacitor | `mobile/games/` → loads `/games/` from prod |
| AdMob | Test IDs (`testMode:true`) — see `docs/ADSENSE_ADMOB_SETUP.md` |
| Store metadata | `mobile/store-metadata/games/` |
| Fastlane | `mobile/fastlane/` → `bundle exec fastlane ios beta` (Mac only) |

### Recommended features (shipped this session)

1. **Recently played** — hub shows last 3 games from `localStorage`
2. **Offline indicator** — banner when `navigator.onLine` is false (Capacitor WebView)

### Automated tests

```bash
npm run build
npm run mobile:preflight    # expect 16 PASS, 0 FAIL, 1 WARN (AdMob test)
npm run mobile:sync         # sync dist → mobile/games/www
```

### Manual device checklist

See `mobile/DEVICE_TEST_CHECKLIST.md`

### TestFlight upload (user Mac)

1. Clone repo, `npm ci && npm run mobile:ios`
2. If no `mobile/games/ios/`: `cd mobile/games && npx cap add ios && npx cap sync ios`
3. App Store Connect API key → `mobile/fastlane/.env` (see `.env.example`)
4. `cd mobile && bundle install && bundle exec fastlane ios beta`
5. TestFlight → install → verify all **9 games** load

**Blocker:** Windows cannot build/upload iOS — Mac + Xcode required (no fee; Apple Dev active).

## App 2 — Freelancer Tools

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Tools | BillSnap + 7 calculators |
| Capacitor | `mobile/tools/` → loads prod site |
| Store metadata | `mobile/store-metadata/tools/` |
| Preflight | `npm run mobile:preflight:tools` |

### Features (shipped this session)

1. **Recently used** — hub tracks last 3 tools
2. **Expanded grid** — late fee + profit margin calculators added
3. **Offline banner** — same pattern as Games Hub

### TestFlight upload (user Mac)

```bash
npm run build && cd mobile && node sync-www.mjs tools
cd tools && npm install && npx cap add ios  # if missing
npx cap sync ios && npx cap open ios
# Or extend Fastlane — see mobile/APP_STORE_MANUAL_STEPS.md
```

## App 3 — Receipt Rush (mini-app)

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Game | Receipt Rush (single-game Capacitor shell) |
| Capacitor | `mobile/receipt-rush/` → loads `/games/receipt-rush/` from prod |
| Store metadata | `mobile/store-metadata/receipt-rush/` |
| Preflight | `npm run mobile:preflight:receipt-rush` |

### Features (shipped this session)

1. **Launcher with best score** — hub shows `receipt_rush_best` from localStorage before Play
2. **Offline banner** — launcher + in-game `navigator.onLine` indicator

### TestFlight upload (user Mac)

```bash
npm run build && cd mobile && node sync-www.mjs receipt-rush
cd receipt-rush && npm install && npx cap add ios  # if missing
npx cap sync ios && npx cap open ios
# Or extend Fastlane with com.wealthengine.receiptrush — see mobile/APP_STORE_MANUAL_STEPS.md
# bundle exec fastlane ios beta_receipt_rush
```

## App 4 — Webhook Whack (mini-app)

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Game | Webhook Whack (single-game Capacitor shell) |
| Capacitor | `mobile/webhook-whack/` → loads `/games/webhook-whack/` from prod |
| Store metadata | `mobile/store-metadata/webhook-whack/` |
| Preflight | `npm run mobile:preflight:webhook-whack` |

### Features (shipped this session)

1. **Best score** — localStorage persistence with HUD display
2. **Offline banner** — same pattern as Games Hub / Receipt Rush

### TestFlight upload (user Mac)

```bash
npm run build && cd mobile && node sync-www.mjs webhook-whack
cd webhook-whack && npm install && npx cap add ios  # if missing
npx cap sync ios && npx cap open ios
# Or: bundle exec fastlane ios beta_webhook_whack
```

## App 5 — Invoice Stack (mini-app)

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Game | Invoice Stack (single-game Capacitor shell) |
| Capacitor | `mobile/invoice-stack/` → loads `/games/invoice-stack/` from prod |
| Store metadata | `mobile/store-metadata/invoice-stack/` |
| Preflight | `npm run mobile:preflight:invoice-stack` |

### Features (shipped this session)

1. **Best score** — localStorage persistence with HUD display
2. **Offline banner** — same pattern as Games Hub / Receipt Rush

### TestFlight upload (user Mac)

```bash
npm run build && cd mobile && node sync-www.mjs invoice-stack
cd invoice-stack && npm install && npx cap add ios  # if missing
npx cap sync ios && npx cap open ios
# Or: bundle exec fastlane ios beta_invoice_stack
```

## App 6+ queue

From `board/GAMES.md` or new simple utilities (calculators, timers) as standalone Capacitor shells.

## GitHub policy

- Commit per app milestone with clear message
- Push `origin main` after each app reaches TestFlight READY
- **If push/auth fails: STOP and report to user** — no local-only workarounds
