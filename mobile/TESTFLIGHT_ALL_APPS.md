# TestFlight Master Checklist — All 27 Apps

**Updated:** 2026-06-22  
**Repo:** github.com/jshugart90-png/wealth-engine  
**Preflight:** `npm run mobile:preflight:<slug>` from repo root  
**Upload (Mac):** `cd mobile && bundle exec fastlane ios <lane>`

## Quick status

| # | App | Bundle ID | Version | Fastlane lane | Preflight | Status |
|---|-----|-----------|---------|---------------|-----------|--------|
| 1 | Horseshoe Games Hub | `com.wealthengine.gameshub` | 1.0.1 | `beta` | `mobile:preflight` | READY |
| 2 | Freelancer Tools | `com.wealthengine.freelancertools` | 1.0.0 | `beta_freelancer_tools` | `mobile:preflight:tools` | READY |
| 3 | Receipt Rush | `com.wealthengine.receiptrush` | 1.0.0 | `beta_receipt_rush` | `mobile:preflight:receipt-rush` | READY |
| 4 | Webhook Whack | `com.wealthengine.webhookwhack` | 1.0.0 | `beta_webhook_whack` | `mobile:preflight:webhook-whack` | READY |
| 5 | Invoice Stack | `com.wealthengine.invoicestack` | 1.0.0 | `beta_invoice_stack` | `mobile:preflight:invoice-stack` | READY |
| 6 | Horseshoe Toss | `com.wealthengine.horseshoetoss` | 1.0.0 | `beta_horseshoe_toss` | `mobile:preflight:horseshoe-toss` | READY |
| 7 | Uptime Defender | `com.wealthengine.uptimedefender` | 1.0.0 | `beta_uptime_defender` | `mobile:preflight:uptime-defender` | READY |
| 8 | Freelancer Memory | `com.wealthengine.freelancermemory` | 1.0.0 | `beta_freelancer_memory` | `mobile:preflight:freelancer-memory` | READY |
| 9 | Color Switch Snake | `com.wealthengine.colorswitchsnake` | 1.0.0 | `beta_color_switch_snake` | `mobile:preflight:color-switch-snake` | READY |
| 10 | Word Scramble Biz | `com.wealthengine.wordscramblebiz` | 1.0.0 | `beta_word_scramble_biz` | `mobile:preflight:word-scramble-biz` | READY |
| 11 | Net-30 Ninja | `com.wealthengine.net30ninja` | 1.0.0 | `beta_net_30_ninja` | `mobile:preflight:net-30-ninja` | READY |
| 12 | SSL Shield | `com.wealthengine.sslshield` | 1.0.0 | `beta_ssl_shield` | `mobile:preflight:ssl-shield` | READY |
| 13 | NDA Speed Sign | `com.wealthengine.ndaspeedsign` | 1.0.0 | `beta_nda_speed_sign` | `mobile:preflight:nda-speed-sign` | READY |
| 14 | BillSnap | `com.wealthengine.billsnap` | 1.0.0 | `beta_billsnap` | `mobile:preflight:billsnap` | READY |
| 15 | StatusPing Lite | `com.wealthengine.statuspinglite` | 1.0.0 | `beta_statusping_lite` | `mobile:preflight:statusping-lite` | READY |
| 16 | LeaseLens | `com.wealthengine.leaselens` | 1.0.0 | `beta_leaselens` | `mobile:preflight:leaselens` | READY |
| 17 | NDAGen | `com.wealthengine.ndagen` | 1.0.0 | `beta_ndagen` | `mobile:preflight:ndagen` | READY |
| 18 | HookRelay | `com.wealthengine.hookrelay` | 1.0.0 | `beta_hookrelay` | `mobile:preflight:hookrelay` | READY |
| 19 | PipeKit | `com.wealthengine.pipekit` | 1.0.0 | `beta_pipekit` | `mobile:preflight:pipekit` | READY |
| 20 | MeetingCost | `com.wealthengine.meetingcost` | 1.0.0 | `beta_meetingcost` | `mobile:preflight:meetingcost` | READY |
| 21 | TemplateForge | `com.wealthengine.templateforge` | 1.0.0 | `beta_templateforge` | `mobile:preflight:templateforge` | READY |
| 22 | CompareStack | `com.wealthengine.comparestack` | 1.0.0 | `beta_comparestack` | `mobile:preflight:comparestack` | READY |
| 23 | Tip Calculator Pro | `com.wealthengine.tipcalculatorpro` | 1.0.0 | `beta_tip_calculator_pro` | `mobile:preflight:tip-calculator-pro` | READY |
| 24 | Hourly Rate Calculator Pro | `com.wealthengine.hourlyratecalculatorpro` | 1.0.0 | `beta_hourly_rate_calculator_pro` | `mobile:preflight:hourly-rate-calculator-pro` | READY |
| 25 | Freelancer Tax Estimator Pro | `com.wealthengine.freelancertaxestimatorpro` | 1.0.0 | `beta_freelancer_tax_estimator_pro` | `mobile:preflight:freelancer-tax-estimator` | READY |
| 26 | 1099 Threshold Tracker Pro | `com.wealthengine.thresholdtrackerpro` | 1.0.0 | `beta_1099_threshold_tracker_pro` | `mobile:preflight:1099-threshold-tracker-pro` | READY |
| 27 | Quarterly Tax Deadline Pro | `com.wealthengine.quarterlytaxdeadlinepro` | 1.0.0 | `beta_quarterly_tax_deadline_pro` | `mobile:preflight:quarterly-tax-deadline-pro` | READY |

## Per-app upload commands (Mac)

```bash
# Setup (once per machine)
git clone https://github.com/jshugart90-png/wealth-engine.git && cd wealth-engine
npm ci && npm run build
cp mobile/fastlane/.env.example mobile/fastlane/.env  # fill API key paths
cd mobile && bundle install

# Per app — sync www, add iOS if missing, upload
npm run mobile:sync:<slug>          # from repo root
cd mobile/<slug> && npm install
npx cap add ios                     # first time only
npx cap sync ios
cd .. && bundle exec fastlane ios beta_<lane>
```

### Slug → directory mapping

| Slug | Capacitor dir | Prod URL |
|------|---------------|----------|
| games | `mobile/games/` | `/games/` |
| tools | `mobile/tools/` | site root |
| receipt-rush | `mobile/receipt-rush/` | `/games/receipt-rush/` |
| webhook-whack | `mobile/webhook-whack/` | `/games/webhook-whack/` |
| invoice-stack | `mobile/invoice-stack/` | `/games/invoice-stack/` |
| horseshoe-toss | `mobile/horseshoe-toss/` | `/games/horseshoe-toss/` |
| uptime-defender | `mobile/uptime-defender/` | `/games/uptime-defender/` |
| freelancer-memory | `mobile/freelancer-memory/` | `/games/freelancer-memory/` |
| color-switch-snake | `mobile/color-switch-snake/` | `/games/color-switch-snake/` |
| word-scramble-biz | `mobile/word-scramble-biz/` | `/games/word-scramble-biz/` |
| net-30-ninja | `mobile/net-30-ninja/` | `/games/net-30-ninja/` |
| ssl-shield | `mobile/ssl-shield/` | `/games/ssl-shield/` |
| nda-speed-sign | `mobile/nda-speed-sign/` | `/games/nda-speed-sign/` |
| billsnap | `mobile/billsnap/` | `/billsnap/` |
| statusping-lite | `mobile/statusping-lite/` | `/statusping/` |
| leaselens | `mobile/leaselens/` | `/leaselens/` |
| ndagen | `mobile/ndagen/` | `/ndagen/` |
| hookrelay | `mobile/hookrelay/` | `/hookrelay/` |
| pipekit | `mobile/pipekit/` | `/pipekit/` |
| meetingcost | `mobile/meetingcost/` | `/meetingcost/` |
| templateforge | `mobile/templateforge/` | `/templateforge/` |
| comparestack | `mobile/comparestack/` | `/comparestack/` |
| tip-calculator-pro | `mobile/tip-calculator-pro/` | `/tip-calculator-pro/` |
| hourly-rate-calculator-pro | `mobile/hourly-rate-calculator-pro/` | `/hourly-rate-calculator-pro/` |
| freelancer-tax-estimator | `mobile/freelancer-tax-estimator/` | `/freelancer-tax-estimator/` |
| 1099-threshold-tracker-pro | `mobile/1099-threshold-tracker-pro/` | `/1099-threshold-tracker-pro/` |
| quarterly-tax-deadline-pro | `mobile/quarterly-tax-deadline-pro/` | `/quarterly-tax-deadline-pro/` |

## Global blockers

- **iOS TestFlight:** macOS + Xcode required (Windows cannot build/upload)
- **Apple Developer:** account active — no fee step
- **Google Play:** $25 one-time + service account JSON (Android track)
- **Fastlane env:** `mobile/fastlane/.env` with App Store Connect API key (see `.env.example`)

## Batch preflight (all utility apps)

```bash
npm run mobile:preflight:templateforge   # expect 17 PASS, 0 FAIL
npm run mobile:preflight:comparestack    # expect 17 PASS, 0 FAIL
npm run mobile:preflight:tip-calculator-pro  # expect 17 PASS, 0 FAIL
npm run mobile:preflight:hourly-rate-calculator-pro  # expect 17 PASS, 0 FAIL
npm run mobile:preflight:freelancer-tax-estimator  # expect 17 PASS, 0 FAIL
npm run mobile:preflight:1099-threshold-tracker-pro  # expect 17 PASS, 0 FAIL
npm run mobile:preflight:quarterly-tax-deadline-pro  # expect 17 PASS, 0 FAIL
```

See `board/APP_DEV.md` for per-app features and device checklist (`mobile/DEVICE_TEST_CHECKLIST.md`).
