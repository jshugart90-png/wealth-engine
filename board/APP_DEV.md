# App Development Pipeline

**Agent:** App Developer · **Updated:** 2026-06-22  
**GitHub:** github.com/jshugart90-png/wealth-engine  
**TestFlight target:** iOS first (Apple Developer ACTIVE)

## Pipeline

| App | Bundle ID | Phase | Tests | GitHub | TestFlight |
|-----|-----------|-------|-------|--------|------------|
| **Horseshoe Games Hub** | `com.wealthengine.gameshub` | **TestFlight prep** | 15 PASS, 0 FAIL, 1 WARN | `99180a7` pushed | **READY** (Mac upload) |
| **Freelancer Tools** | `com.wealthengine.freelancertools` | Queued | — | — | — |
| App 3+ | TBD | Queued | — | — | — |

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

## App 2 — Freelancer Tools (next)

| Field | Value |
|-------|-------|
| Shell | `mobile/tools/` |
| Core tools | BillSnap, tip calculator, meeting cost, net-30, hourly rate, 1099 estimator |
| Status | Scaffold exists — build after Games Hub TestFlight READY |

## App 3+ queue

From `board/GAMES.md` or new simple utilities (calculators, timers) as standalone Capacitor shells.

## GitHub policy

- Commit per app milestone with clear message
- Push `origin main` after each app reaches TestFlight READY
- **If push/auth fails: STOP and report to user** — no local-only workarounds
