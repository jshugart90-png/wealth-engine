/**
 * Client IAP bridge reference — generated at build time via mobile/shared/iap.mjs.
 * This file documents the runtime API surface for Capacitor WebView apps.
 *
 * Native integration:
 *   npm install @revenuecat/purchases-capacitor
 *   npx cap sync ios
 *   Configure RevenueCat API key + entitlements in Xcode
 *
 * Runtime global: window.WE_IAP
 *   - owns(key)           → boolean (localStorage + receipt verify placeholder)
 *   - shouldShowAds()     → boolean (false when remove_ads owned)
 *   - purchase(key)       → Promise
 *   - restore()           → Promise
 *   - refresh()           → void (sync UI + hide ad slots)
 */
export const WE_IAP_API = {
  owns: "(productKey: string) => boolean",
  shouldShowAds: "() => boolean",
  purchase: "(productKey: string) => Promise<{ key, purchased?, sandbox? }>",
  restore: "() => Promise<{ restored: boolean }>",
  refresh: "() => void",
};

export default WE_IAP_API;
