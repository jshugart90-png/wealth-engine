# iOS Entitlements — All Wealth Engine Capacitor Apps

Each app uses a standard Capacitor WebView shell. Enable only capabilities you need in Xcode → Signing & Capabilities.

## Default (all 40 apps)

| Capability | Required | Notes |
|------------|----------|-------|
| **In-App Purchase** | Yes (games + pro utilities) | App Store Connect → App ID → In-App Purchase |
| **Push Notifications** | Optional | **1099 Deadline Suite only** — local Jan 15/25/31 deadline reminders via `@capacitor/local-notifications` |
| **App Groups** | No | Not used |
| **Associated Domains** | Optional | For universal links to `wealth-engine-0qlj.onrender.com` |

## In-App Purchase entitlement

1. [developer.apple.com](https://developer.apple.com/account/resources/identifiers/list) → select App ID (`com.wealthengine.*`)
2. Enable **In-App Purchase**
3. Regenerate provisioning profile after change
4. In Xcode: Target → Signing & Capabilities → **+ Capability** → **In-App Purchase** (auto when profile includes IAP)

## RevenueCat (recommended)

After App Store Connect products are live:

```bash
cd mobile/<app-slug>
npm install @revenuecat/purchases-capacitor
npx cap sync ios
```

Configure `Purchases.configure({ apiKey: 'appl_...' })` in native iOS `AppDelegate` or via Capacitor plugin init — see `mobile/APP_STORE_CONNECT_IAP_SETUP.md`.

## StoreKit Testing (local)

1. Open `mobile/storekit/Products.storekit` in Xcode
2. Edit Scheme → Run → Options → **StoreKit Configuration** → Products.storekit
3. Sandbox purchases work without App Store Connect products (local catalog)

## Per-app bundle IDs

See `mobile/TESTFLIGHT_ALL_APPS.md` — one App ID per Capacitor wrapper (40 total).
