/**
 * Shared IAP module — product config, client bridge script, StoreKit helpers.
 * Used by build-all.mjs, ios-upload-checklist.mjs, and Capacitor www sync.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const sharedDir = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(sharedDir, "..");
const repoRoot = join(mobileRoot, "..");

export const GAME_SLUGS = new Set([
  "games",
  "horseshoe-toss",
  "invoice-stack",
  "uptime-defender",
  "freelancer-memory",
  "color-switch-snake",
  "word-scramble-biz",
  "receipt-rush",
  "webhook-whack",
  "net-30-ninja",
  "ssl-shield",
  "nda-speed-sign",
  "invoice-number-rush",
]);

/** Stripe SKU cross-reference for dual monetization (web + App Store). */
export const STRIPE_IAP_MAP = {
  games: { premium_unlock: null, remove_ads: null },
  billsnap: { pro_unlock: "pro-pdf", premium_unlock: "unlimited-month" },
  "statusping-lite": { pro_unlock: "starter" },
  leaselens: { pro_unlock: "report" },
  ndagen: { pro_unlock: "pdf" },
  hookrelay: { pro_unlock: "monthly" },
  pipekit: { pro_unlock: "starter" },
  meetingcost: { pro_unlock: "pro" },
  templateforge: { pro_unlock: "catalog-bundle" },
  "hookrelay-dlq": { pro_unlock: "pro" },
  devwatch: { pro_unlock: "bundle" },
  "freelancer-stack": { pro_unlock: "bundle" },
  tools: { pro_unlock: null },
};

const GAME_PRODUCT_DEFS = [
  { key: "remove_ads", type: "non_consumable", price: 2.99, title: "Remove Ads", description: "Hide AdMob banners permanently" },
  { key: "premium_unlock", type: "non_consumable", price: 4.99, title: "Premium Unlock", description: "Unlock premium features and badges" },
  { key: "tip_jar", type: "consumable", price: 0.99, title: "Tip Jar", description: "Support the developer" },
];

const UTILITY_PRODUCT_DEFS = [
  { key: "pro_unlock", type: "non_consumable", price: 4.99, title: "Pro Unlock", description: "Unlock Pro features (matches Stripe tier where applicable)" },
];

export function loadIapConfig() {
  const path = join(repoRoot, "config", "mobile-iap-products.json");
  if (!existsSync(path)) return generateIapConfig();
  return JSON.parse(readFileSync(path, "utf8"));
}

export function generateIapConfig() {
  const metaDir = join(mobileRoot, "store-metadata");
  const slugs = readdirSync(metaDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const apps = {};
  for (const slug of slugs) {
    const metaPath = join(metaDir, slug, "metadata.json");
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    const bundleId = meta.bundleId;
    if (!bundleId) continue;

    const isGame = GAME_SLUGS.has(slug);
    const defs = isGame ? GAME_PRODUCT_DEFS : UTILITY_PRODUCT_DEFS;
    const stripeMap = STRIPE_IAP_MAP[slug] ?? {};

    apps[slug] = {
      appName: meta.appName,
      bundleId,
      type: isGame ? "game" : "utility",
      version: meta.version ?? "1.0.0",
      products: defs.map((d) => ({
        key: d.key,
        storeKitId: `${bundleId}.${d.key}`,
        type: d.type,
        price: d.price,
        title: d.title,
        description: d.description,
        stripeSku: stripeMap[d.key] ?? stripeMap.pro_unlock ?? null,
      })),
    };
  }

  const config = {
    generatedAt: new Date().toISOString(),
    revenueCat: {
      plugin: "@revenuecat/purchases-capacitor",
      note: "Configure API key in App Store Connect + RevenueCat dashboard after IAP products are live",
    },
    apps,
  };

  const outPath = join(repoRoot, "config", "mobile-iap-products.json");
  writeFileSync(outPath, JSON.stringify(config, null, 2) + "\n");
  return config;
}

export function getAppProducts(appSlug) {
  const config = loadIapConfig();
  return config.apps[appSlug] ?? null;
}

export function iapStorageKey(appSlug, productKey) {
  return `we_iap_${appSlug}_${productKey}`;
}

/** Minified client-side IAP bridge — localStorage until App Store Connect + RevenueCat live. */
export function iapClientScript(appSlug) {
  const app = getAppProducts(appSlug);
  if (!app) return "";

  const productsJson = JSON.stringify(
    app.products.map((p) => ({ key: p.key, id: p.storeKitId, price: p.price, title: p.title }))
  );
  const isGame = app.type === "game";

  return `(function(){
  var APP=${JSON.stringify(appSlug)};
  var PRODUCTS=${productsJson};
  var PREFIX='we_iap_'+APP+'_';

  function owned(key){
    try{return localStorage.getItem(PREFIX+key)==='1'}catch(e){return false}
  }
  function setOwned(key){
    try{localStorage.setItem(PREFIX+key,'1')}catch(e){}
    refreshUI();
  }

  function shouldShowAds(){
    return ${isGame ? "!owned('remove_ads')" : "true"};
  }

  function hideAdSlots(){
    if(shouldShowAds())return;
    document.querySelectorAll('.ad,[data-ad-slot]').forEach(function(el){
      el.style.display='none';
    });
  }

  function refreshUI(){
    var badge=document.getElementById('we-iap-premium-badge');
    var removeBtn=document.getElementById('we-iap-remove-ads');
    var hasPremium=owned('premium_unlock')||owned('pro_unlock');
    var noAds=!shouldShowAds();
    if(badge)badge.style.display=(hasPremium||noAds)?'inline-block':'none';
    if(removeBtn)removeBtn.style.display=noAds?'none':'inline-block';
    hideAdSlots();
    document.body.classList.toggle('we-iap-premium',hasPremium);
    document.body.classList.toggle('we-iap-no-ads',noAds);
  }

  function purchase(key){
    var prod=PRODUCTS.find(function(p){return p.key===key});
    if(!prod)return Promise.reject(new Error('Unknown product'));
    if(owned(key))return Promise.resolve({key:key,restored:true});

    /* Native: @revenuecat/purchases-capacitor or StoreKit 2 via Capacitor plugin */
    if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Purchases){
      return window.Capacitor.Plugins.Purchases.purchaseProduct({productIdentifier:prod.id})
        .then(function(){setOwned(key);return{key:key,purchased:true};});
    }

    /* Sandbox / pre-App-Store-Connect: simulate success (replace after products live) */
    if(confirm('Purchase '+prod.title+' ($'+prod.price.toFixed(2)+')?\\n\\nSandbox mode — receipt verify placeholder until App Store Connect products are live.')){
      setOwned(key);
      return Promise.resolve({key:key,purchased:true,sandbox:true});
    }
    return Promise.reject(new Error('Cancelled'));
  }

  function restore(){
    if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Purchases){
      return window.Capacitor.Plugins.Purchases.restorePurchases().then(function(res){
        (res&&res.customerInfo&&res.customerInfo.entitlements&&res.customerInfo.entitlements.active||{}).forEach(function(){});
        refreshUI();
        return{restored:true};
      });
    }
    refreshUI();
    alert('Restore complete — checked local purchases. Connect RevenueCat for cross-device restore.');
    return Promise.resolve({restored:true,local:true});
  }

  window.WE_IAP={
    app:APP,
    products:PRODUCTS,
    owns:owned,
    shouldShowAds:shouldShowAds,
    purchase:purchase,
    restore:restore,
    refresh:refreshUI
  };

  function wireUI(){
    var bar=document.getElementById('we-iap-bar');
    if(!bar)return;
    var removeBtn=document.getElementById('we-iap-remove-ads');
    var premiumBtn=document.getElementById('we-iap-premium');
    var restoreBtn=document.getElementById('we-iap-restore');
    var tipBtn=document.getElementById('we-iap-tip');
    if(removeBtn)removeBtn.addEventListener('click',function(){WE_IAP.purchase('remove_ads').catch(function(){})});
    if(premiumBtn)premiumBtn.addEventListener('click',function(){
      WE_IAP.purchase(${isGame ? "'premium_unlock'" : "'pro_unlock'"}).catch(function(){});
    });
    if(restoreBtn)restoreBtn.addEventListener('click',function(){WE_IAP.restore()});
    if(tipBtn)tipBtn.addEventListener('click',function(){WE_IAP.purchase('tip_jar').catch(function(){})});
    refreshUI();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wireUI);
  else wireUI();
})();`;
}

export function iapBarHtml(appSlug) {
  const app = getAppProducts(appSlug);
  if (!app) return "";

  const isGame = app.type === "game";
  const removeAds = app.products.find((p) => p.key === "remove_ads");
  const premium = app.products.find((p) => p.key === "premium_unlock" || p.key === "pro_unlock");
  const tip = app.products.find((p) => p.key === "tip_jar");

  return `<div class="we-iap-bar" id="we-iap-bar" role="region" aria-label="In-app purchases">
<style>
.we-iap-bar{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin:8px 0;padding:8px;background:rgba(0,0,0,.15);border-radius:8px;max-width:360px;width:100%}
.we-iap-bar button{background:#6366f1;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer}
.we-iap-bar button:active{transform:scale(.97)}
#we-iap-premium-badge{display:none;background:#eab308;color:#1c1917;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700}
body.we-iap-premium .we-iap-bar{border-color:#eab308}
body.we-iap-no-ads .ad{display:none!important}
</style>
${removeAds ? `<button type="button" id="we-iap-remove-ads">Remove Ads · $${removeAds.price.toFixed(2)}</button>` : ""}
${premium ? `<button type="button" id="we-iap-premium">${premium.title} · $${premium.price.toFixed(2)}</button>` : ""}
${tip ? `<button type="button" id="we-iap-tip">Tip · $${tip.price.toFixed(2)}</button>` : ""}
<button type="button" id="we-iap-restore">Restore</button>
<span id="we-iap-premium-badge">★ Premium</span>
</div>`;
}

/** Map dist/games/{slug} → mobile app slug for IAP injection. */
export function gameSlugToAppSlug(gameSlug) {
  return gameSlug;
}

/** Map venture id → mobile utility app slug (if packaged). */
export const VENTURE_TO_MOBILE = {
  billsnap: "billsnap",
  statusping: "statusping-lite",
  leaselens: "leaselens",
  ndagen: "ndagen",
  hookrelay: "hookrelay",
  "devtools-api": "pipekit",
  meetingcost: "meetingcost",
  "pdf-factory": "templateforge",
  comparestack: "comparestack",
  "tip-calculator-pro": "tip-calculator-pro",
  "hourly-rate-calculator-pro": "hourly-rate-calculator-pro",
  "freelancer-tax-estimator": "freelancer-tax-estimator",
  "1099-threshold-tracker-pro": "1099-threshold-tracker-pro",
  "quarterly-tax-deadline-pro": "quarterly-tax-deadline-pro",
  "profit-margin-calculator-pro": "profit-margin-calculator-pro",
  "break-even-calculator-pro": "break-even-calculator-pro",
  "late-fee-calculator-pro": "late-fee-calculator-pro",
  "markup-calculator-pro": "markup-calculator-pro",
};

export function generateStoreKitConfig() {
  const config = loadIapConfig();
  const products = [];
  for (const app of Object.values(config.apps)) {
    for (const p of app.products) {
      products.push({
        appName: app.appName,
        bundleId: app.bundleId,
        ...p,
      });
    }
  }
  return products;
}
