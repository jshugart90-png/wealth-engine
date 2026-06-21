# Manual App Store Steps — Remaining Human Gates

Everything else is automated (Capacitor project, metadata, Fastlane lanes, CI AAB build, preflight QC, itch zips).

**Apple Developer Program:** ✅ **DONE** — account active (fee already paid).  
**Next iOS milestone:** App Store Connect app record → signing → **TestFlight upload** (requires macOS + Xcode).

**Do not pay Google Play $25 until ready to publish on Android.** Current budget: $0 for new fees.

---

## Google Play — $25 one-time (still blocked)

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
4. Add yourself as tester → install → verify all 8 games load

### 5. AdMob link (after app created)

1. [AdMob](https://admob.google.com/) → Apps → Add app → link to Play listing
2. Create banner + rewarded ad units
3. Copy IDs to `mobile/.env` (see `mobile/.env.example`)
4. Rebuild: `npm run build && node mobile/sync-www.mjs games`
5. Run `npm run mobile:preflight` — check #8 should PASS

### 6. Fastlane upload (optional, after service account)

1. Play Console → **Setup → API access** → link Google Cloud project
2. Create service account → grant **Release manager**
3. Download JSON → save as `mobile/play-service-account.json` (gitignored)
4. Set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` in `mobile/.env`
5. Run: `cd mobile && bundle exec fastlane android beta`

---

## Apple App Store — TestFlight (account ✅ DONE)

> **This Windows machine cannot build or upload iOS.** Use a Mac with Xcode (local or cloud Mac). Steps below are exact; no additional Apple fees required.

### ✅ 1. Apple Developer Program — DONE

- Account is active. Skip enrollment / $99 payment.

### 2. Register App ID & certificates (Mac or developer.apple.com)

1. [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. **Identifiers → + → App IDs** → Bundle ID: `com.wealthengine.gameshub`
3. Enable **App Groups** / capabilities only if needed (games hub uses WebView — usually none)
4. **Certificates → + → Apple Distribution** (for App Store / TestFlight)
5. **Profiles → + → App Store** → select App ID + distribution cert → download `.mobileprovision`

### 3. App Store Connect app record

1. [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps** → **+** → **New App**
2. Platform: **iOS**
3. Name: **Horseshoe Games Hub**
4. Primary language: **English (U.S.)**
5. Bundle ID: `com.wealthengine.gameshub` (must match step 2)
6. SKU: `gameshub-001`
7. User access: **Full Access**

### 4. Store listing (can finish while build processes)

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

Category: **Games → Casual**  
Age rating: use `mobile/store-metadata/AGE_RATING.md` → Apple section. Expected: **4+**.

### 5. App Store Connect API key (for Fastlane — recommended)

1. App Store Connect → **Users and Access → Integrations → App Store Connect API**
2. **+** → name: `wealth-engine-fastlane` → access: **App Manager** (or Admin)
3. Download **`.p8` key once** — store outside git (e.g. `~/secrets/AuthKey_XXXXXX.p8`)
4. Note **Key ID** and **Issuer ID**
5. Copy `mobile/fastlane/.env.example` → `mobile/fastlane/.env` (gitignored) and fill:
   ```env
   APP_STORE_CONNECT_API_KEY_ID=XXXXXXXXXX
   APP_STORE_CONNECT_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   APP_STORE_CONNECT_API_KEY_PATH=/absolute/path/to/AuthKey_XXXXXX.p8
   ```
6. Uncomment and fill `mobile/fastlane/Appfile` (`apple_id`, `team_id`)

### 6. Build & upload to TestFlight

**Preflight on any OS (already run before Mac work):**
```bash
npm run mobile:preflight
```
Expected: **15 PASS**, **0 FAIL**, **1 WARN** (AdMob test IDs until production).

#### Option A — Fastlane (recommended on Mac)

```bash
# On Mac — clone/sync repo, then:
cd mobile
npm install
npm run sync:games
cd games && npx cap sync ios
cd ..
bundle install
# Load API key env (from mobile/fastlane/.env — never commit)
export $(grep -v '^#' fastlane/.env | xargs)
bundle exec fastlane ios beta
```

Lane `ios beta` in `mobile/fastlane/Fastfile`:
1. Builds archive from `games/ios/App/App.xcworkspace`
2. Uploads to TestFlight via App Store Connect API
3. Skips waiting for processing (`skip_waiting_for_build_processing: true`)

#### Option B — Xcode GUI (no Fastlane)

```bash
cd mobile && npm run sync:games
cd games && npx cap sync ios
npx cap open ios
```

In Xcode:
1. Select project **App** → **Signing & Capabilities** → Team = your Apple Developer team
2. Bundle Identifier = `com.wealthengine.gameshub`
3. Destination: **Any iOS Device (arm64)** (not simulator)
4. **Product → Archive**
5. Organizer opens → **Distribute App**
6. **App Store Connect** → **Upload**
7. Leave defaults (bitcode/symbols) → **Upload**
8. Wait for email: “App Store Connect: Your build has completed processing”

### 7. TestFlight → internal test → App Store

1. App Store Connect → **TestFlight** tab → select build (processing ~5–30 min)
2. **Internal Testing** → add yourself → install **TestFlight** app on iPhone/iPad
3. Verify all **8 games** load in the hub WebView
4. When ready for public beta: **External Testing** (optional Apple review of beta info)
5. **App Store release:** swap AdMob test IDs → production (see `docs/MONETIZATION_MATRIX.md`) → Submit for Review

---

## What you do NOT need to do manually

- Capacitor project setup (`mobile/`)
- Store copy / keywords (`mobile/store-metadata/`)
- Age rating reference answers (`AGE_RATING.md`)
- Preflight QC (`npm run mobile:preflight`)
- itch.io zips (`npm run mobile:itch` → `D:\wealth-engine-data\mobile\itch\` — 8 games + hub)
- PWA manifest + service worker (live on Render after deploy)
- Android AAB CI build (`.github/workflows/mobile-build.yml`)
- Apple Developer $99 fee (already paid)

---

## After both stores live

1. Swap AdMob test IDs → production (see `docs/MONETIZATION_MATRIX.md`)
2. Update `board/APPS.md` status to **LIVE**
3. Optional: submit **Freelancer Tools** app (`com.wealthengine.freelancertools`) using `mobile/store-metadata/tools/`
