# Info.plist Template — Capacitor iOS Apps

Capacitor generates `ios/App/App/Info.plist` on `npx cap add ios`. Override or verify these keys per app before TestFlight upload.

## Required keys (all apps)

```xml
<key>CFBundleIdentifier</key>
<string>com.wealthengine.EXAMPLE</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>CFBundleDisplayName</key>
<string>App Display Name</string>
<key>CFBundleName</key>
<string>App Name</string>
<key>LSRequiresIPhoneOS</key>
<true/>
<key>UILaunchStoryboardName</key>
<string>LaunchScreen</string>
```

## Privacy (App Store review)

```xml
<key>NSUserTrackingUsageDescription</key>
<string>We use ads to support free games. You can remove ads with an in-app purchase.</string>
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

Set `ITSAppUsesNonExemptEncryption` to `false` if app only uses HTTPS (standard for Capacitor WebView).

## AdMob (games with ads)

Add GADApplicationIdentifier after linking Google Mobile Ads SDK (optional until production AdMob IDs):

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~3347511713</string>
```

Replace with production AdMob App ID from `docs/ADSENSE_ADMOB_SETUP.md` before App Store release.

## Version bump workflow

1. Update `mobile/store-metadata/<slug>/metadata.json` → `version`
2. Update `mobile/<slug>/package.json` → `version` (if present)
3. On Mac after `npx cap sync ios`: bump **Build** in Xcode or set in `ios/App/App.xcodeproj`
4. Fastlane `build_app` uses Xcode project settings

## Monorepo note

Each Capacitor app lives in `mobile/<slug>/ios/`. Run sync from repo root:

```bash
npm run mobile:sync:<slug>
cd mobile/<slug> && npx cap sync ios
```

See `mobile/APP_STORE_CONNECT_IAP_SETUP.md` for one-app-record-per-bundle-ID setup.
