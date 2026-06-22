# Manual Device Test Checklist

Run on a physical device (Android debug APK or iOS TestFlight) after `npm run mobile:sync`.

## Horseshoe Games Hub (`com.wealthengine.gameshub`)

### Launch

- [ ] App icon and splash screen display (purple `#6366f1`, no spinner hang)
- [ ] Games hub loads within 5s on Wi‑Fi
- [ ] Offline banner appears when airplane mode enabled (after first load)

### Hub

- [ ] All **9** game cards visible and tappable
- [ ] Recently played section updates after opening a game
- [ ] Promo links (Wealth Engine, BillSnap, tools) open in browser or in-app WebView
- [ ] AdMob test banner placeholders render (no crash)

### Per game (spot-check all 9)

| Game | Loads | Touch works | Score/state persists |
|------|-------|-------------|----------------------|
| horseshoe-toss | | | |
| invoice-stack | | | |
| uptime-defender | | | |
| freelancer-memory | | | |
| color-switch-snake | | | |
| color-switch-snake | | | |
| word-scramble-biz | | | |
| receipt-rush | | | |
| webhook-whack | | | |
| net-30-ninja | | | |

### Regression

- [ ] Back navigation returns to hub
- [ ] No JS console errors on hub or sample games
- [ ] Rotate portrait/landscape — layout usable
- [ ] Background/foreground — app resumes without blank WebView

### Store readiness

- [ ] `npm run mobile:preflight` → 0 FAIL on dev machine
- [ ] Version matches `mobile/store-metadata/games/metadata.json`
- [ ] Privacy URL opens: https://wealth-engine-0qlj.onrender.com/privacy.html

## Freelancer Tools (when built)

- [ ] Hub lists BillSnap + top calculators
- [ ] BillSnap PDF flow works on device
- [ ] Privacy link works
