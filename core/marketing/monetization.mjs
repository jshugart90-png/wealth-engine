/** Shared monetization snippets injected at build time. */

export const ADMOB_TEST_APP_ID = "ca-app-pub-3940256099942544~3347511713";
export const ADMOB_TEST_BANNER = "ca-app-pub-3940256099942544/6300978111";
export const ADMOB_TEST_REWARDED = "ca-app-pub-3940256099942544/5224354917";

/** Page-view + attribution tracking (works on static pages). */
export function visitTrackerScript(path = "/") {
  const safePath = JSON.stringify(path);
  return `(function(){try{var r=localStorage.getItem('we_ref')||new URLSearchParams(location.search).get('ref');fetch('/api/funnel/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:${safePath},refCode:r,source:new URLSearchParams(location.search).get('utm_source')||'direct'})}).catch(function(){})}catch(e){}})();`;
}

/** Checkout click tracking for Stripe payment links. */
export function checkoutClickScript(sku, path) {
  return `(function(){try{var r=localStorage.getItem('we_ref')||new URLSearchParams(location.search).get('ref');fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${sku}',path:'${path}',refCode:r})}).catch(function(){})}catch(e){}})()`;
}

/**
 * AdMob placeholder — uses Google test IDs in dev.
 * Production: set ADMOB_APP_ID + ADMOB_BANNER_ID in .env, rebuild.
 * Rewarded ads unlock LAUNCH25 discount codes (stored in localStorage).
 */
export function admobPlaceholderScript(opts = {}) {
  const appId = opts.appId ?? ADMOB_TEST_APP_ID;
  const bannerId = opts.bannerId ?? ADMOB_TEST_BANNER;
  const rewardedId = opts.rewardedId ?? ADMOB_TEST_REWARDED;
  const testMode = opts.testMode !== false;
  return `(function(){
  var WE_ADMOB={appId:'${appId}',banner:'${bannerId}',rewarded:'${rewardedId}',testMode:${testMode}};
  window.WE_ADMOB=WE_ADMOB;
  function showBanner(el){
    if(!el)return;
    if(window.WE_IAP&&window.WE_IAP.shouldShowAds&&!window.WE_IAP.shouldShowAds()){el.style.display='none';return;}
    el.setAttribute('data-admob','banner');
    el.innerHTML='<div style="font-size:10px;color:#666;padding:4px">'+(WE_ADMOB.testMode?'AdMob TEST banner · ':'AdMob banner · ')+WE_ADMOB.banner+'</div>';
  }
  function refreshAds(){
    document.querySelectorAll('.ad,[data-ad-slot]').forEach(showBanner);
  }
  window.WE_refreshAds=refreshAds;
  refreshAds();
  window.WE_showRewardedAd=function(onReward){
    if(WE_ADMOB.testMode){
      var code='LAUNCH25-'+Math.random().toString(36).slice(2,8).toUpperCase();
      try{localStorage.setItem('we_game_reward',code)}catch(e){}
      if(onReward)onReward(code);
      return;
    }
    /* Native Capacitor AdMob plugin: @capacitor-community/admob — wire in mobile/ after Play Console setup */
    if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.AdMob){
      window.Capacitor.Plugins.AdMob.showRewardVideoAd({adId:WE_ADMOB.rewarded}).then(function(){if(onReward)onReward('LAUNCH25')});
    }else if(onReward){onReward('LAUNCH25');}
  };
})();`;
}

/** Upsell bar HTML — secondary SKU CTA below primary checkout. */
export function upsellBarHtml(primarySku, altSku, altLabel, path) {
  if (!altSku) return "";
  return `<div class="we-upsell" style="margin-top:16px;padding:12px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:8px;font-size:13px">
  <strong>Upgrade:</strong> <a href="{{PAY:${altSku}}}" style="color:#22c55e;font-weight:700" onclick="${checkoutClickScript(altSku, path)}">${altLabel}</a>
</div>`;
}

/** PWA manifest object for Wealth Engine installable web app. */
export function buildPwaManifest(baseUrl) {
  return {
    name: "Wealth Engine",
    short_name: "Wealth Engine",
    description: "Freelancer tools, games, and business utilities — install for offline access.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#6366f1",
    orientation: "any",
    categories: ["business", "finance", "games"],
    icons: [
      { src: `${baseUrl}/assets/pwa/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${baseUrl}/assets/pwa/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
    shortcuts: [
      { name: "Free Games", url: "/games/", description: "Play 6 free browser games" },
      { name: "BillSnap Invoice", url: "/go/invoice.html", description: "Invoice PDF in 30 seconds" },
      { name: "Free Tools", url: "/tools/index.html", description: "Calculators and utilities" },
    ],
  };
}

/** Games Hub PWA — installable shortcut to /games/ (Capacitor + Add to Home Screen). */
export function buildGamesPwaManifest(baseUrl) {
  return {
    name: "Horseshoe Games Hub",
    short_name: "Games Hub",
    description: "Six free family-friendly games — Horseshoe Toss, Invoice Stack, and more.",
    start_url: "/games/",
    scope: "/games/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#6366f1",
    orientation: "any",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/assets/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
}

/** Minimal service worker — cache shell pages for offline PWA install. */
export function buildServiceWorker() {
  return `const CACHE='we-v2';
const SHELL=['/','/games/','/games/index.html','/games/manifest.json','/tools/index.html','/privacy.html','/manifest.json','/assets/pwa/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok&&e.request.url.includes(location.origin)){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request)));
});`;
}

export const GOOGLE_SITE_VERIFICATION = "X8W5bw-fSJ0pTZiA0LesNi2vZ_-bUdLqVokR5uJZlI4";

export function googleSiteVerificationMeta() {
  return `<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />`;
}

/** Inject GSC verification meta into static HTML if missing. */
export function injectGoogleSiteVerification(html) {
  if (html.includes("google-site-verification")) return html;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${googleSiteVerificationMeta()}\n</head>`);
  }
  return html;
}

export function pwaHeadTags() {
  return `${googleSiteVerificationMeta()}
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6366f1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}</script>`;
}

/** Inject onclick checkout tracking into href="{{PAY:sku}}" links missing tracking. */
export function injectCheckoutTracking(html, pathPrefix) {
  return html.replace(
    /href="\{\{PAY:([^}]+)\}\}"(?![^>]*onclick)/g,
    (match, sku) =>
      `href="{{PAY:${sku}}}" onclick="${checkoutClickScript(sku, pathPrefix)}"`
  );
}
