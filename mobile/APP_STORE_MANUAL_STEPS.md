# Manual App Store Steps — Payment Blockers Only

Everything else is automated (Capacitor project, metadata, Fastlane skeleton, CI AAB build, preflight QC, itch zips).

**Do not pay these fees until ready to publish.** Current budget: $0.

---

## Google Play — $25 one-time

### 1. Create developer account

1. Go to [Google Play Console](https://play.google.com/console/signup)
2. Pay **$25 USD** one-time registration fee
3. Complete identity verification (can take 24–48h)

### 2. Create app

1. **Create app** → name: **Horseshoe Games Hub**
2. Package name: `com.wealthengine.gameshub` (must match `mobile/games/capacitor.config.ts`)
3. Category: **Game → Casual**
4. Complete **Store listing** using files in `mobile/store-metadata/games/`:
   - `description.txt` → Full description
   - `keywords.txt` → Short description / tags
   - `metadata.json` → URLs, category, rating hints
5. Upload **screenshots** per `mobile/store-metadata/SCREENSHOT_SPEC.md`

### 3. Content rating

1. Start **Questionnaire** → use answers in `mobile/store-metadata/AGE_RATING.md`
2. Expected: **Everyone**

### 4. App signing & upload

1. Enable **Play App Signing** (recommended)
2. Download AAB from GitHub Actions artifact (`mobile-build` workflow) or build locally:
   ```bash
   cd mobile && npm run sync:games
   cd games && npx cap sync android
   cd android && ./gradlew bundleRelease
   ```
3. Upload `app-release.aab` to **Internal testing** track first
4. Add yourself as tester → install → verify all 6 games load

### 5. AdMob link (after app created)

1. [AdMob](https://admob.google.com/) → Apps → Add app → link to Play listing
2. Create banner + rewarded ad units
3. Copy IDs to `mobile/.env` (see `mobile/.env.example`)
4. Rebuild: `npm run build && node mobile/sync-www.mjs games`
5. Run `node scripts/app-store-preflight.mjs` — check #8 should PASS

### 6. Fastlane upload (optional, after service account)

1. Play Console → **Setup → API access** → link Google Cloud project
2. Create service account → grant **Release manager**
3. Download JSON → save as `mobile/play-service-account.json` (gitignored)
4. Set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` in `mobile/.env`
5. Run: `cd mobile && bundle exec fastlane android beta`

---

## Apple App Store — $99/year

### 1. Enroll in Apple Developer Program

1. Go to [Apple Developer](https://developer.apple.com/programs/enroll/)
2. Pay **$99 USD/year**
3. Wait for approval (usually 24–48h)

### 2. App Store Connect setup

1. [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps** → **+**
2. Name: **Horseshoe Games Hub**
3. Bundle ID: `com.wealthengine.gameshub` (register in Certificates, Identifiers & Profiles first)
4. SKU: `gameshub-001`
5. Category: **Games → Casual**

### 3. Store listing

Copy from `mobile/store-metadata/games/`:

| Field | Source |
|-------|--------|
| Name | `metadata.json` → `appName` |
| Subtitle | `metadata.json` → `subtitle` |
| Description | `description.txt` |
| Keywords | `keywords.txt` |
| Support URL | `metadata.json` → `supportUrl` |
| Privacy URL | `metadata.json` → `privacyPolicyUrl` |
| Screenshots | `mobile/store-metadata/games/screenshots/` (capture per SCREENSHOT_SPEC.md) |

### 4. Age rating

Use `mobile/store-metadata/AGE_RATING.md` → Apple section. Expected: **4+**.

### 5. Build & upload (requires macOS)

iOS builds **cannot run on Windows or Linux CI** without a Mac runner.

1. On a Mac with Xcode installed:
   ```bash
   cd mobile && npm run sync:games
   cd games && npx cap sync ios
   npx cap open ios
   ```
2. Xcode → select team → **Product → Archive**
3. **Distribute App** → App Store Connect → Upload

**Or** with Fastlane (after API key):

1. App Store Connect → **Users and Access → Keys** → generate API key (.p8)
2. Set in `mobile/.env`: `APP_STORE_CONNECT_API_KEY_ID`, `ISSUER_ID`, `API_KEY_PATH`
3. `cd mobile && bundle exec fastlane ios beta`

### 6. TestFlight → production

1. Wait for processing in App Store Connect
2. Add internal testers → verify games on device
3. Submit for review when AdMob production IDs are set (if showing ads)

---

## What you do NOT need to do manually

- Capacitor project setup (`mobile/`)
- Store copy / keywords (`mobile/store-metadata/`)
- Age rating reference answers (`AGE_RATING.md`)
- Preflight QC (`scripts/app-store-preflight.mjs`)
- itch.io zips (`scripts/package-games-itch.mjs` → `D:\wealth-engine-data\mobile\itch\`)
- PWA manifest + service worker (live on Render after deploy)
- Android AAB CI build (`.github/workflows/mobile-build.yml`)

---

## After both stores live

1. Swap AdMob test IDs → production (see `docs/MONETIZATION_MATRIX.md`)
2. Update `board/APPS.md` status to **LIVE**
3. Optional: submit **Freelancer Tools** app (`com.wealthengine.freelancertools`) using `mobile/store-metadata/tools/`
