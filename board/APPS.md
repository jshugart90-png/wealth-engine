# Mobile & PWA Apps Tracker

**Agent:** App Store Pipeline · **Updated:** 2026-06-21  
**Prod base:** https://wealth-engine-0qlj.onrender.com  
**Budget:** $0 — automated through store login/payment gates

## Apps

| App | Bundle ID | Channel | Status | Live URL / artifact | Blocker |
|-----|-----------|---------|--------|---------------------|---------|
| **Wealth Engine PWA** | — (web) | PWA | **LIVE verified** | [manifest](https://wealth-engine-0qlj.onrender.com/manifest.json) · [sw.js](https://wealth-engine-0qlj.onrender.com/sw.js) · prod **200** (2026-06-21) | None |
| **Games Hub PWA** | — (web) | PWA shortcut | **LIVE** | https://wealth-engine-0qlj.onrender.com/games/ | None |
| **Horseshoe Games Hub** | `com.wealthengine.gameshub` | Capacitor → Play/App | **READY (preflight)** | `mobile/games/` · CI AAB artifact | Apple $99 · Play $25 |
| **Freelancer Tools** | `com.wealthengine.freelancertools` | Capacitor → Play/App | **SCaffold** | `mobile/tools/` | Same store fees |
| **itch.io packs** | — | HTML zip | **PACKAGED** | `D:\wealth-engine-data\mobile\itch\*.zip` | Manual upload (free) |

## Shipped games (6) — in all channels

| Slug | Live | itch zip |
|------|------|----------|
| horseshoe-toss | `/games/horseshoe-toss/` | `horseshoe-toss.zip` |
| invoice-stack | `/games/invoice-stack/` | `invoice-stack.zip` |
| uptime-defender | `/games/uptime-defender/` | `uptime-defender.zip` |
| freelancer-memory | `/games/freelancer-memory/` | `freelancer-memory.zip` |
| color-switch-snake | `/games/color-switch-snake/` | `color-switch-snake.zip` |
| word-scramble-biz | `/games/word-scramble-biz/` | `word-scramble-biz.zip` |

Hub bundle: `horseshoe-games-hub.zip` (all 6 + index)

## Pipeline checklist

| Step | Script / path | Status |
|------|---------------|--------|
| Monetization matrix | `docs/MONETIZATION_MATRIX.md` | ✅ |
| Capacitor project | `mobile/` | ✅ |
| PWA manifest + SW | `dist/manifest.json`, `dist/sw.js` | ✅ LIVE verified prod 200 |
| itch packaging | `scripts/package-games-itch.mjs` | ✅ |
| Store metadata | `mobile/store-metadata/games/` | ✅ |
| Fastlane skeleton | `mobile/fastlane/` | ✅ |
| Android CI AAB | `.github/workflows/mobile-build.yml` | ✅ |
| Preflight QC | `scripts/app-store-preflight.mjs` | ✅ |
| Manual store steps | `mobile/APP_STORE_MANUAL_STEPS.md` | ✅ |
| AdMob test IDs | `core/marketing/monetization.mjs` | ✅ TEST MODE |

## Preflight (last run)

Run: `node scripts/app-store-preflight.mjs --app games`

Expected: **14–15 PASS**, **0 FAIL**, **1–2 WARN** (AdMob test IDs until production).

## Next actions (user / Tier-2)

1. **itch.io** — upload zips from `D:\wealth-engine-data\mobile\itch\` (free, no blocker)
2. **Google Play** — pay $25 → follow `mobile/APP_STORE_MANUAL_STEPS.md` § Play
3. **App Store** — pay $99/yr → follow `mobile/APP_STORE_MANUAL_STEPS.md` § Apple
4. **AdMob production** — create units → set `.env` → rebuild → preflight check #8 PASS
5. **PWA install prompt** — share `/games/` link; Android Chrome → Add to Home Screen

## Related docs

- `docs/MONETIZATION_MATRIX.md` — full channel map
- `board/GAMES.md` — game QC log
- `mobile/store-metadata/AGE_RATING.md` — store questionnaire answers
- `mobile/store-metadata/SCREENSHOT_SPEC.md` — screenshot sizes
