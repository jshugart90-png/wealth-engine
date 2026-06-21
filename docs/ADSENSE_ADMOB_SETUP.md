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

## AdMob — mobile apps only

AdMob requires a **published mobile app** (Android APK/AAB or iOS). Wealth Engine is web-first.

### Fastest AdMob path (if you want mobile ads)

1. Wrap `dist/tools/tip-calculator.html` as a **Trusted Web Activity (TWA)** or **Capacitor** Android shell
2. Create app in [Google Play Console](https://play.google.com/console) ($25 one-time)
3. Register app in [AdMob](https://admob.google.com/) → link to Play app
4. Add banner/interstitial units to the WebView shell

**Estimated timeline:** 3–7 days (Play review). Not required for $500/mo goal — Google Search Ads + Stripe is faster.

---

## PWA option (documented, not built)

MeetingCost and Tip Calculator work as installable PWAs:

1. Add `manifest.json` + service worker to tool pages
2. Users "Add to Home Screen" on Android
3. Still uses **AdSense** in the WebView/browser — not AdMob unless wrapped as native app

See `ventures/ad-tools/` for source pages.

---

## Do not confuse with Google Ads

| Product | Purpose | Status |
|---------|---------|--------|
| **Google Ads** (Search) | Paid traffic → Stripe checkout | CSV ready — see `ADS_IMPORT_CHECKLIST.md` |
| **AdSense** | Display ads on free pages | Apply after privacy page live |
| **AdMob** | In-app ads | Requires Android/iOS app |
