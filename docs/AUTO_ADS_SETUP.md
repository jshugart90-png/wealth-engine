# Google Ads — one-click import guide

**Status:** Ready to import (AP-001 approved, budget cap **$300/mo**).

Campaign CSV: `D:\wealth-engine-data\marketing\ads\google-ads-import.csv`

Microsoft Ads mirror: `D:\wealth-engine-data\marketing\ads\microsoft-ads-import.csv`

---

## Before you import

1. Confirm **PUBLIC_BASE_URL** in `.env` matches your live site (Render URL or custom domain).
2. Re-run ads export so Final URLs are correct:
   ```powershell
   cd C:\Users\jshug\wealth-engine
   npm run run
   ```
   (orchestrator regenerates CSV from current `PUBLIC_BASE_URL`)

---

## Google Ads — import steps (~5 min)

1. Open [Google Ads](https://ads.google.com) → sign in with billing enabled.
2. **Tools & settings** (wrench) → **Bulk actions** → **Uploads**.
3. Click **+** → **Upload a file**.
4. Choose **Add** (new campaigns) or **Edit** if updating.
5. Select `D:\wealth-engine-data\marketing\ads\google-ads-import.csv`.
6. Review preview — expect **3 campaigns**:
   - WE - Invoice Generator (~$12/day suggested)
   - WE - Lease Analyzer (~$8/day)
   - WE - Uptime Monitor (~$6/day)
7. Fix any URL errors (must be `https://` and match live domain).
8. **Apply** → set account-level daily budget cap so total ≤ **$10/day** (~$300/mo).
9. Enable campaigns when ready.

### Post-import checklist

- [ ] Conversion tracking: Stripe checkout success → optional Google tag on `/thanks` page
- [ ] Search Console: verify domain, submit sitemap at `{PUBLIC_BASE_URL}/sitemap.xml`
- [ ] Pause underperforming keywords after 7 days (CPC > $0.80, 0 conversions)

---

## Microsoft Ads (optional, often cheaper B2B CPC)

1. [Microsoft Advertising](https://ads.microsoft.com) → **Import** → **Import from Google Ads**.
2. Or upload `microsoft-ads-import.csv` via **Campaigns** → **Import**.

---

## Budget math (Money Math Guy)

| Assumption | Value |
|------------|-------|
| Daily budget (all campaigns) | ~$8–10/day |
| Avg CPC | $0.35–0.55 |
| Landing → checkout | 2–4% |
| AOV | ~$8 |
| **30-day target** | ~$500 revenue at ~$300 ad spend |

---

## API automation (not configured)

No Google Ads API OAuth credentials found. Campaigns are **CSV-ready**; spend requires manual import + billing in Google Ads UI.

To enable API later: [Google Ads API setup](https://developers.google.com/google-ads/api/docs/first-call/overview) → add credentials to `.env` as `GOOGLE_ADS_*`.
