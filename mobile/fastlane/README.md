# Fastlane — TestFlight & Play internal testing

**Prerequisites:** Apple Developer account ✅ (active). iOS uploads require **macOS + Xcode** — cannot run on Windows.

## Quick start (TestFlight on Mac)

```bash
cd mobile
npm install
npm run sync:games
cd games && npx cap sync ios && cd ..
bundle install

cp fastlane/.env.example fastlane/.env
# Edit fastlane/.env with your API key ID, Issuer ID, and .p8 path

# Uncomment apple_id + team_id in fastlane/Appfile

export $(grep -v '^#' fastlane/.env | xargs)   # macOS/Linux
bundle exec fastlane ios beta
```

## App Store Connect API key setup

1. [App Store Connect](https://appstoreconnect.apple.com/) → **Users and Access**
2. **Integrations** tab → **App Store Connect API** → **Generate API Key**
3. Name: `wealth-engine-fastlane` · Role: **App Manager**
4. Download `.p8` **once** → store at e.g. `~/secrets/AuthKey_ABC123.p8`
5. Copy **Key ID** and **Issuer ID** into `fastlane/.env`

Never commit `.p8`, `.env`, or keystore files. All are gitignored.

## Lanes

| Lane | Platform | What it does |
|------|----------|--------------|
| `ios beta` | iOS | Archive + upload to **TestFlight** |
| `ios release` | iOS | TestFlight upload + App Store metadata (no auto-submit) |
| `android beta` | Android | Build AAB + upload to Play **internal** track |
| `android release` | Android | Promote to **production** |

## ios beta — step-by-step

1. **Preflight** (any OS): `npm run mobile:preflight` from repo root
2. **Sync Capacitor iOS** (Mac): `npm run sync:games && cd games && npx cap sync ios`
3. **Signing**: Open Xcode once (`npx cap open ios`) → set Team + bundle ID `com.wealthengine.gameshub`
4. **Env**: Fill `fastlane/.env` from `.env.example`
5. **Run**: `bundle exec fastlane ios beta`
6. **Verify**: App Store Connect → TestFlight → install on device

If Fastlane fails on signing, fix certificates in [developer.apple.com](https://developer.apple.com/account/resources) then retry.

## Xcode-only upload (no Fastlane)

See `mobile/APP_STORE_MANUAL_STEPS.md` § **Option B — Xcode GUI**.

## Android notes

Requires Google Play Console ($25) + service account JSON. Set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` in `mobile/.env` or `fastlane/.env`.
