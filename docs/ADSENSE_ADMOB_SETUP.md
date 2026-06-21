# Google AdSense (web) + AdMob (mobile) setup

Wealth Engine monetizes via **Stripe checkout** (primary) and **display ads** on free utility pages (secondary).

---

## AdSense — web (recommended first)

AdSense works on static HTML pages served from Render. Placeholder slots are in:

- `dist/tools/tip-calculator.html`
- `dist/tools/meeting-cost-free.html`

### Approval checklist

1. **Live site with real content** — Render URL or `tools.horseshoeroundme.com`
2. **Privacy policy page** — add `/privacy.html` (required for AdSense review)
3. **Original utility content** — calculators/tools with user value (not thin affiliate pages)
4. **Apply:** [Google AdSense](https://www.google.com/adsense/) → Add site URL
5. **After approval:** Replace placeholder divs:

```html
<!-- Replace this placeholder -->
<div class="ad-slot" data-adsense-placeholder="728x90">
  <!-- paste AdSense script + ins tag here -->
</div>
```

6. Paste your publisher ID into `.env`:

```
GOOGLE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
```

Re-run `npm run build && npm run run` to inject client ID into tool pages.

### Expected revenue

AdSense on free tools: **$1–15/mo** at low traffic. Primary revenue remains Stripe + Google Ads search campaigns.

---

## AdMob — games + mobile apps

AdMob test IDs are **injected at build time** into all `/games/*` pages and the games hub via `core/marketing/monetization.mjs`.

### Test IDs (default — safe for dev/store review)

| Unit | ID |
|------|-----|
| App | `ca-app-pub-3940256099942544~3347511713` |
| Banner | `ca-app-pub-3940256099942544/6300978111` |
| Rewarded | `ca-app-pub-3940256099942544/5224354917` |

Built pages expose `window.WE_ADMOB` with `testMode:true`. Preflight warns until production IDs are set.

### Production swap (before monetizing ads)

1. Create app + ad units in [AdMob](https://admob.google.com/)
2. Add to `.env` (see `mobile/.env.example`):

```
ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
ADMOB_REWARDED_ID=ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW
```

3. Rebuild and redeploy:

```bash
npm run build
npm run deploy:render   # or push to main
```

4. Verify: `node scripts/app-store-preflight.mjs` — check #8 should PASS (no test IDs in dist)

5. For native Capacitor builds, wire `@capacitor-community/admob` after Play Console setup (see `mobile/APP_STORE_MANUAL_STEPS.md`)

**Estimated timeline:** 3–7 days after Play/App publish. Not required for $500/mo goal — Stripe + Search Ads first.

---

## PWA (live on Render)

Installable web app is **built and deployed**:

- `dist/manifest.json` — shortcuts to games, BillSnap, tools
- `dist/games/manifest.json` — Games Hub standalone install
- `dist/sw.js` — offline shell cache
- Injected on hub + games via `pwaHeadTags()` in `core/build-all.mjs`

**Install:** Open https://wealth-engine-0qlj.onrender.com/games/ → Chrome menu → Add to Home Screen.

PWA uses **AdSense/AdMob placeholders in browser** — native AdMob requires Capacitor wrapper + store publish.

---

## Do not confuse with Google Ads

| Product | Purpose | Status |
|---------|---------|--------|
| **Google Ads** (Search) | Paid traffic → Stripe checkout | CSV ready — see `ADS_IMPORT_CHECKLIST.md` |
| **AdSense** | Display ads on free pages | Apply after privacy page live |
| **AdMob** | In-app ads | Requires Android/iOS app |
