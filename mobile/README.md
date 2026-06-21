# Wealth Engine Mobile

Capacitor wrappers for store distribution. **$0 automated** until Apple/Google fees.

## Apps

| Folder | App | Bundle ID |
|--------|-----|-----------|
| `games/` | Horseshoe Games Hub | `com.wealthengine.gameshub` |
| `tools/` | Freelancer Tools | `com.wealthengine.freelancertools` |

## Quick commands

```powershell
npm run build                    # Build dist/ first
cd mobile
npm install
npm run sync:games               # Copy dist/games → games/www + cap sync
npm run open:android:games       # Open Android Studio
```

## CI

GitHub Actions: `.github/workflows/mobile-build.yml` (workflow_dispatch → AAB artifact)

## Store submission

- Metadata: `store-metadata/games/`
- Fastlane: `fastlane/Fastfile`
- QC: `node ../scripts/app-store-preflight.mjs --app games`
- **Manual fees only:** `APP_STORE_MANUAL_STEPS.md`

## Remote vs bundled mode

Default: **remote URL** loads live `/games/` from Render (zero-rebuild updates).

Set `CAPACITOR_SERVER_URL` in `.env` or unset for bundled `www/` offline mode.
