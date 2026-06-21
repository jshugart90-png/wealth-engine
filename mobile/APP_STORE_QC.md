# App Store QC — 5-pass checklist

Run before every store submission. Mirror the game pipeline QC in `board/GAMES.md`.

**Preflight automation:** `node scripts/app-store-preflight.mjs --app games`

---

## Horseshoe Games Hub (`com.wealthengine.gameshub`)

### Pass 1/5 — Build & load
- [ ] `npm run build && npm run mobile:sync` completes without errors
- [ ] `mobile/games/www/index.html` lists all 6 games
- [ ] Capacitor sync succeeds (`cd mobile && npm run sync:games`)
- [ ] App opens to games hub (bundled or production URL)

### Pass 2/5 — Functionality
- [ ] Each game loads and renders (canvas/DOM)
- [ ] Score persistence works (localStorage)
- [ ] Play again / restart flows work
- [ ] External CTAs open correct URLs (BillSnap, StatusPing)

### Pass 3/5 — Mobile UX
- [ ] Touch controls respond on all games
- [ ] No horizontal scroll / viewport overflow
- [ ] Splash screen shows and hides
- [ ] Back button (Android) returns to hub

### Pass 4/5 — Monetization & compliance
- [ ] AdMob placeholders render (test mode OK for QC)
- [ ] Privacy link works: `/privacy.html`
- [ ] No broken `#checkout-pending` links in bundled www
- [ ] Rewarded ad test unlocks discount code (localStorage `we_game_reward`)

### Pass 5/5 — Store metadata
- [ ] `mobile/store-metadata/games/metadata.json` matches build version
- [ ] Screenshots captured per `SCREENSHOT_SPEC.md`
- [ ] Age rating answers match `AGE_RATING.md`
- [ ] Preflight script passes (or only WARN on test AdMob)

---

## Freelancer Tools (`com.wealthengine.freelancertools`) — optional app

### Pass 1/5 — Build & load
- [ ] `npm run mobile:sync:tools` completes
- [ ] Hub lists BillSnap + 5 calculators
- [ ] BillSnap preview loads

### Pass 2/5 — Functionality
- [ ] Calculators compute correctly
- [ ] Stripe checkout links open in browser
- [ ] Checkout click tracking fires (`/api/funnel/checkout_click`)

### Pass 3/5 — Mobile UX
- [ ] Forms usable on phone keyboard
- [ ] No layout breaks at 320px width

### Pass 4/5 — Monetization & compliance
- [ ] Privacy policy linked
- [ ] Payment links verified: `node scripts/verify-payment-links.mjs`
- [ ] Upsell CTAs present on tool pages

### Pass 5/5 — Store metadata
- [ ] Tools metadata + screenshots complete
- [ ] Preflight: `node scripts/app-store-preflight.mjs --app tools`

---

## Sign-off

| App | QC passes | Preflight | Reviewer | Date |
|-----|-----------|-----------|----------|------|
| Games Hub | /5 | PASS/WARN/FAIL | | |
| Freelancer Tools | /5 | PASS/WARN/FAIL | | |

**Store submission blocked until:** Apple Developer ($99/yr) OR Google Play ($25) account funded.
