import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { getRoot, getPublicBaseUrl, loadEnv } from "./env.mjs";
import { getAllPaymentLinks } from "./commerce.mjs";
import { buildHighConversionLandings } from "./pipeline/conversion-landings.mjs";
import { buildThanksPage } from "./marketing/thanks-page.mjs";
import { buildAdToolPages } from "./marketing/ad-tools.mjs";
import { buildBundleLandings } from "./marketing/bundles.mjs";
import { generateSeoPages } from "./marketing/seo-pages.mjs";
import { generateCompliancePseo } from "./pipeline/compliance-pseo.mjs";
import { buildSitemap, buildRobotsTxt } from "./marketing/sitemap.mjs";
import { expandCompareStack } from "../ventures/comparestack/generator.mjs";
import { buildEmbedWidgets } from "./marketing/embeds.mjs";
import { buildProductFeeds } from "./marketing/feeds.mjs";
import { buildReferralPages } from "./marketing/referral-page.mjs";
import { buildIndexNowKey } from "./marketing/indexnow.mjs";
import {
  admobPlaceholderScript,
  buildPwaManifest,
  buildGamesPwaManifest,
  buildServiceWorker,
  injectCheckoutTracking,
  googleSiteVerificationMeta,
  injectGoogleSiteVerification,
  pwaHeadTags,
  visitTrackerScript,
} from "./marketing/monetization.mjs";

const root = getRoot();
const config = JSON.parse(readFileSync(join(root, "config", "ventures.json"), "utf8"));

function injectPaymentLinks(html, ventureId) {
  const links = getAllPaymentLinks().filter((l) => l.venture_id === ventureId);
  let out = html;
  for (const l of links) {
    out = out.replaceAll(`{{PAY:${l.sku}}}`, l.payment_link ?? "#");
  }
  out = out.replace(/\{\{PAY:[^}]+\}\}/g, "#checkout-pending");
  return out;
}

function injectAllPaymentLinks(html) {
  let out = html;
  for (const l of getAllPaymentLinks()) {
    out = out.replaceAll(`{{PAY:${l.sku}}}`, l.payment_link ?? "#");
  }
  out = out.replace(/\{\{PAY:[^}]+\}\}/g, "#checkout-pending");
  return out;
}

export function buildAll() {
  const dist = join(root, "dist");
  mkdirSync(dist, { recursive: true });

  // Regenerate CompareStack pages before copying ventures → dist
  const compare = expandCompareStack();

  const built = [];
  for (const v of config.ventures) {
    const src = join(root, v.path);
    const dest = join(root, v.deployPath);
    if (!existsSync(src)) continue;
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true, filter: (p) => !p.includes("node_modules") });

    for (const file of ["index.html", "app.html", "pricing.html"]) {
      const fp = join(dest, file);
      if (existsSync(fp)) {
        let html = readFileSync(fp, "utf8");
        html = injectPaymentLinks(html, v.id);
        html = injectGoogleSiteVerification(html);
        html = injectCheckoutTracking(html, `/${v.deployPath.replace("dist/", "")}`);
        if (html.includes("</head>") && !html.includes("we_ref")) {
          html = html.replace("</head>", `<script>${visitTrackerScript(`/${v.deployPath.replace("dist/", "")}`)}</script></head>`);
        }
        writeFileSync(fp, html);
      }
    }

    // CompareStack pages reference SKUs across ventures
    if (v.id === "comparestack") {
      const pagesDir = join(dest, "pages");
      if (existsSync(pagesDir)) {
        for (const f of readdirSync(pagesDir).filter((x) => x.endsWith(".html"))) {
          const fp = join(pagesDir, f);
          writeFileSync(fp, injectAllPaymentLinks(readFileSync(fp, "utf8")));
        }
      }
    }
    built.push(v.id);
  }

  // Portfolio hub
  const hub = buildPortfolioHub(built);
  writeFileSync(join(dist, "index.html"), hub);

  // Marketing static pages (must exist after `npm run build` for Render deploy)
  const landings = buildHighConversionLandings();
  const thanks = buildThanksPage();
  const adTools = buildAdToolPages();
  const bundles = buildBundleLandings();
  const seo = generateSeoPages();
  const compliancePseo = generateCompliancePseo();
  const sitemap = buildSitemap();
  const robots = buildRobotsTxt();
  const embeds = buildEmbedWidgets();
  const feeds = buildProductFeeds();
  const referral = buildReferralPages();
  const indexNow = buildIndexNowKey();
  const bingSiteAuth = buildBingSiteAuth();
  const games = buildGames();
  const pwa = buildPwaAssets();

  return {
    built,
    hub: join(dist, "index.html"),
    compare,
    landings,
    thanks,
    adTools,
    bundles,
    seo,
    compliancePseo,
    sitemap,
    robots,
    embeds,
    feeds,
    referral,
    indexNow,
    bingSiteAuth,
    games,
    pwa,
  };
}

const BING_SITE_AUTH_KEY = "BFFC299D3E2BDBFCB92C641272C2C2DB";

function buildBingSiteAuth() {
  const source = join(root, "public", "BingSiteAuth.xml");
  const content = existsSync(source)
    ? readFileSync(source, "utf8")
    : `<?xml version="1.0"?>
<users>
	<user>${BING_SITE_AUTH_KEY}</user>
</users>
`;
  const primary = join(root, "dist", "BingSiteAuth.xml");
  const alt = join(root, "dist", `${BING_SITE_AUTH_KEY}.xml`);
  writeFileSync(primary, content, "utf8");
  writeFileSync(alt, content, "utf8");
  return { primary, alt };
}

function getAdmobOpts() {
  const env = loadEnv();
  const appId = env.ADMOB_APP_ID;
  const testDefault = !appId || appId.includes("3940256099942544");
  return {
    appId: appId || undefined,
    bannerId: env.ADMOB_BANNER_ID || undefined,
    rewardedId: env.ADMOB_REWARDED_ID || undefined,
    testMode: testDefault,
  };
}

function buildPwaAssets() {
  const base = getPublicBaseUrl();
  const assetsDir = join(root, "dist", "assets", "pwa");
  mkdirSync(assetsDir, { recursive: true });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#6366f1"/><text x="256" y="300" font-size="220" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif">W</text></svg>`;
  writeFileSync(join(assetsDir, "icon.svg"), svg);
  writeFileSync(join(assetsDir, "icon-192.png"), svg);
  writeFileSync(join(assetsDir, "icon-512.png"), svg);

  const manifest = buildPwaManifest(base);
  manifest.icons = [
    { src: "/assets/pwa/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
    { src: "/assets/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/assets/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ];
  writeFileSync(join(root, "dist", "manifest.json"), JSON.stringify(manifest, null, 2));
  writeFileSync(join(root, "dist", "sw.js"), buildServiceWorker());
  return { manifest: join(root, "dist", "manifest.json"), sw: join(root, "dist", "sw.js") };
}

function buildGames() {
  const gamesSrc = join(root, "games");
  const gamesDest = join(root, "dist", "games");
  if (!existsSync(gamesSrc)) return { copied: [], hub: null };

  mkdirSync(gamesDest, { recursive: true });
  const slugs = readdirSync(gamesSrc, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const admobScript = admobPlaceholderScript(getAdmobOpts());

  for (const slug of slugs) {
    const src = join(gamesSrc, slug);
    const dest = join(gamesDest, slug);
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    const idx = join(dest, "index.html");
    if (existsSync(idx)) {
      let html = readFileSync(idx, "utf8");
      html = injectGoogleSiteVerification(html);
      if (!html.includes("WE_ADMOB")) {
        html = html.replace("</body>", `<script>${admobScript}</script><script>${visitTrackerScript(`/games/${slug}/`)}</script></body>`);
      }
      writeFileSync(idx, html);
    }
  }

  const meta = slugs
    .map((slug) => {
      const idx = join(gamesSrc, slug, "index.html");
      if (!existsSync(idx)) return null;
      const html = readFileSync(idx, "utf8");
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? slug;
      const desc = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ?? "Free browser game";
      return { slug, title, desc };
    })
    .filter(Boolean);

  const cards = meta
    .map(
      (g) => `
    <a class="card" href="/games/${g.slug}/">
      <h2>${g.title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</h2>
      <p>${g.desc.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>
      <span class="play">Play →</span>
    </a>`
    )
    .join("");

  const hubHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${googleSiteVerificationMeta()}
<title>Free Games — Wealth Engine</title>
<meta name="description" content="Simple free browser games for all ages. Play Horseshoe Toss, Invoice Stack, and more.">
<link rel="manifest" href="/games/manifest.json">
<meta name="theme-color" content="#6366f1">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}</script>
<style>
  body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e8e8ef;margin:0;padding:0 20px 40px}
  .promo{background:#0f172a;color:#e2e8f0;padding:12px 16px;text-align:center;font-size:13px;border-bottom:1px solid #1e293b}
  .promo a{color:#22c55e;font-weight:700;margin:0 10px;text-decoration:none}
  h1{text-align:center;margin:32px 0 8px}
  .sub{text-align:center;color:#888;margin-bottom:32px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;max-width:1000px;margin:0 auto}
  .card{background:#14141c;border:1px solid #2a2a38;border-radius:12px;padding:24px;text-decoration:none;color:inherit;transition:.2s;display:block}
  .card:hover{border-color:#6366f1;transform:translateY(-2px)}
  h2{margin:0 0 8px;font-size:20px}
  p{color:#888;font-size:14px;margin:0 0 12px}
  .play{color:#6366f1;font-size:13px;font-weight:600}
  .ad{max-width:728px;margin:24px auto;background:#1a1a24;border:1px dashed #444;border-radius:8px;padding:16px;text-align:center;color:#666;font-size:12px}
  .offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
  .offline.show{display:block}
  .recent{max-width:1000px;margin:0 auto 24px}
  .recent h3{font-size:14px;color:#888;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em}
  .recent-row{display:flex;gap:12px;flex-wrap:wrap}
  .recent a{background:#1a1a28;border:1px solid #333;border-radius:8px;padding:10px 14px;font-size:13px;color:#c4c4d4;text-decoration:none}
  .recent a:hover{border-color:#6366f1;color:#fff}
</style></head><body>
<div id="offline-banner" class="offline" role="status">You're offline — games work after first load</div>
<div class="promo"><a href="/">← Wealth Engine</a>
  <a href="/go/invoice.html">BillSnap Invoices</a>
  <a href="/go/uptime.html">StatusPing Uptime</a>
  <a href="/tools/index.html">Free Tools</a>
</div>
<h1>🎮 Free Games</h1>
<p class="sub">Simple, fun, all ages — ${meta.length} games, no download required</p>
<div class="ad">AdSense placeholder — 728×90 leaderboard</div>
<div id="recent-section" class="recent" hidden>
  <h3>Recently played</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards || "<p style='text-align:center;color:#888'>Games coming soon…</p>"}</div>
<div class="ad" style="margin-top:32px">AdSense placeholder — 300×250 rectangle</div>
<script>${admobScript}</script>
<script>(function(){
  var KEY='we_recent_games';
  var titles=${JSON.stringify(Object.fromEntries(meta.map((g) => [g.slug, g.title.replace(/🥷\\s*/, "")])))};
  function trackRecent(slug){
    try{
      var list=JSON.parse(localStorage.getItem(KEY)||'[]').filter(function(s){return s!==slug});
      list.unshift(slug);
      localStorage.setItem(KEY,JSON.stringify(list.slice(0,5)));
    }catch(e){}
  }
  document.querySelectorAll('.grid .card').forEach(function(card){
    var m=card.getAttribute('href')&&card.getAttribute('href').match(/\\/games\\/([^/]+)\\//);
    if(m)card.addEventListener('click',function(){trackRecent(m[1])});
  });
  function renderRecent(){
    var row=document.getElementById('recent-row');
    var section=document.getElementById('recent-section');
    if(!row||!section)return;
    var slugs=[];
    try{slugs=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){}
    slugs=slugs.filter(function(s){return titles[s]}).slice(0,3);
    if(!slugs.length){section.hidden=true;return;}
    section.hidden=false;
    row.innerHTML=slugs.map(function(s){
      return '<a href="/games/'+s+'/">'+titles[s]+'</a>';
    }).join('');
  }
  renderRecent();
  var banner=document.getElementById('offline-banner');
  function setOffline(){if(banner)banner.classList.toggle('show',!navigator.onLine)}
  window.addEventListener('online',setOffline);
  window.addEventListener('offline',setOffline);
  setOffline();
})();</script>
<script>${visitTrackerScript("/games/")}</script>
</body></html>`;

  writeFileSync(join(gamesDest, "index.html"), hubHtml);

  const gamesManifest = buildGamesPwaManifest(getPublicBaseUrl());
  writeFileSync(join(gamesDest, "manifest.json"), JSON.stringify(gamesManifest, null, 2));

  return { copied: slugs, hub: join(gamesDest, "index.html"), count: meta.length, manifest: join(gamesDest, "manifest.json") };
}

function buildPortfolioHub(ventureIds) {
  const cards = config.ventures
    .filter((v) => ventureIds.includes(v.id))
    .map(
      (v) => `
    <a class="card" href="${v.deployPath.replace("dist/", "")}/index.html">
      <span class="tag">${v.type}</span>
      <h2>${v.name}</h2>
      <p>${v.model} · ${v.channels.slice(0, 2).join(", ")}</p>
    </a>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wealth Engine Portfolio</title>
${pwaHeadTags()}
<style>
  body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e8e8ef;margin:0;padding:0 20px 40px}
  .promo{background:#0f172a;color:#e2e8f0;padding:12px 16px;text-align:center;font-size:13px;border-bottom:1px solid #1e293b}
  .promo a{color:#22c55e;font-weight:700;margin:0 10px;text-decoration:none}
  .promo a:hover{text-decoration:underline}
  h1{text-align:center;margin:32px 0 8px}
  .sub{text-align:center;color:#888;margin-bottom:24px}
  .quick{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:900px;margin:0 auto 32px}
  .quick a{background:#14141c;border:1px solid #2a2a38;color:#e8e8ef;padding:10px 16px;border-radius:8px;text-decoration:none;font-size:14px}
  .quick a:hover{border-color:#6366f1}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;max-width:1100px;margin:0 auto}
  .card{background:#14141c;border:1px solid #2a2a38;border-radius:12px;padding:24px;text-decoration:none;color:inherit;transition:.2s}
  .card:hover{border-color:#6366f1;transform:translateY(-2px)}
  .tag{font-size:11px;text-transform:uppercase;color:#6366f1;letter-spacing:.08em}
  h2{margin:12px 0 8px;font-size:20px}
  p{color:#888;font-size:14px;margin:0}
</style></head><body>
<div class="promo"><strong>LAUNCH25</strong> — 25% off checkout ·
  <a href="/go/invoice.html">Invoice $3</a>
  <a href="/go/lease.html">Lease check</a>
  <a href="/go/uptime.html">Uptime $5/mo</a>
  <a href="/go/nda.html">NDA $4</a>
  <a href="/go/pipekit.html">PipeKit $9/mo</a>
  <a href="https://horseshoeroundme.com" target="_blank" rel="noopener">← Horseshoe Round Me</a>
</div>
<h1>Wealth Engine</h1>
<p class="sub">Autonomous venture portfolio — independent revenue channels</p>
<div class="quick">
  <a href="/go/invoice.html">🧾 Invoice landing</a>
  <a href="/go/nda.html">📄 NDA landing</a>
  <a href="/bundles/freelancer-stack.html">📦 Freelancer bundle</a>
  <a href="/tools/bill-splitter.html">🔢 Bill splitter</a>
  <a href="/tools/tip-calculator.html">Tip calculator</a>
  <a href="/tools/index.html">All free tools</a>
  <a href="/go/meeting.html">Meeting cost</a>
  <a href="/go/receipt.html">Receipt $3</a>
  <a href="/go/freelancer.html">Freelancer stack</a>
  <a href="/go/hookrelay-dlq.html">HookRelay DLQ</a>
  <a href="/go/stack.html">Revenue stack $29/mo</a>
  <a href="/go/contractor.html">Contractor invoice</a>
  <a href="/tools/payment-terms-calculator.html">Net 30 calc</a>
  <a href="/tools/1099-tax-estimator.html">1099 tax calc</a>
  <a href="/join.html">📬 LAUNCH25 list</a>
  <a href="/partners/index.html">🤝 Partner program</a>
  <a href="/comparestack/index.html">Compare tools</a>
  <a href="/games/">🎮 Free games</a>
</div>
<div class="grid">${cards}</div>
<script>${visitTrackerScript("/")}</script>
</body></html>`;
}

if (process.argv[1]?.endsWith("build-all.mjs")) {
  try {
    const r = buildAll();
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
