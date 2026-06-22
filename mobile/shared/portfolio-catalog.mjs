/**
 * Wealth Engine Hub portfolio index HTML — shared by build-all and sync-www.
 */
import { getPortfolioApps } from "./portfolio-apps.mjs";
import { iapClientScript, iapBarHtml } from "./iap.mjs";
import { wealthHubPushInlineScript, wealthHubPortfolioCsvExportScript } from "./push.mjs";

export function generateWealthHubIndexHtml({ onlineUrl = "https://wealth-engine-0qlj.onrender.com/wealth-hub/" } = {}) {
  const apps = getPortfolioApps();
  const portfolioJson = JSON.stringify(
    apps.map((a) => ({
      num: a.num,
      slug: a.slug,
      title: a.title,
      desc: a.desc,
      href: a.href,
      prodUrl: a.prodUrl,
      bundleId: a.bundleId,
      type: a.type,
      iapProducts: a.iapProducts,
    }))
  );

  const cards = apps
    .map(
      (a) => `
    <a class="card${a.slug === "billsnap" ? " featured" : ""}" href="${a.href}" data-slug="${a.slug}">
      <span class="tag">${a.type}</span>
      <h2>${a.title}</h2>
      <p>${a.desc}</p>
      <span class="open">Open →</span>
    </a>`
    )
    .join("");

  const titlesJson = JSON.stringify(Object.fromEntries(apps.map((a) => [a.slug, a.title])));
  const hrefsJson = JSON.stringify(Object.fromEntries(apps.map((a) => [a.slug, a.href])));
  const pushScript = wealthHubPushInlineScript();
  const csvScript = wealthHubPortfolioCsvExportScript();
  const iapScript = iapClientScript("wealth-hub");
  const iapBar = iapBarHtml("wealth-hub");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wealth Engine Hub</title>
<meta name="description" content="Master portfolio index — ${apps.length} apps with deep links to every tool and game.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0a0a0f">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e8e8ef;margin:0;padding:0 20px 40px}
.promo{background:#6366f1;color:#fff;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#fff;text-decoration:underline}
.offline{display:none;background:#312e81;color:#c7d2fe;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem;color:#fff}
.sub{text-align:center;max-width:420px;margin:0 auto 20px;color:#888;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;max-width:1100px;margin:0 auto}
.card{display:block;background:#14141c;border:1px solid #2a2a38;border-radius:12px;padding:16px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#6366f1;transform:translateY(-2px)}
.card.featured{border-color:#22c55e;background:linear-gradient(135deg,#14141c,#0f1a14)}
.tag{font-size:10px;text-transform:uppercase;color:#6366f1;letter-spacing:.06em}
h2{margin:8px 0 6px;font-size:16px;color:#fff}
p{margin:0 0 8px;color:#888;font-size:13px;line-height:1.4}
.open{color:#6366f1;font-size:12px;font-weight:600}
.stat{display:block;max-width:1100px;margin:0 auto 20px;background:#1e1b4b;border:2px solid #6366f1;border-radius:12px;padding:16px 20px;text-align:center}
.stat span{font-size:1.1rem;font-weight:700;color:#c7d2fe}
.iap{display:block;max-width:1100px;margin:16px auto 0;text-align:center}
.export{display:block;max-width:1100px;margin:16px auto 0;background:#14141c;border:1px solid #2a2a38;border-radius:12px;padding:14px 20px;text-align:center}
.export button{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:14px}
.export p{margin:8px 0 0;font-size:12px;color:#64748b}
.recent{max-width:1100px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#14141c;border:1px solid #2a2a38;border-radius:8px;padding:8px 12px;font-size:13px;color:#c4c4d4;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#64748b}
.footer a{color:#6366f1}
</style></head><body>
<div class="promo"><strong>${apps.length} apps</strong> · deep links to every tool & game · <a href="games/index.html">Games hub →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open apps you've used before</div>
<h1>⚡ Wealth Engine Hub</h1>
<p class="sub">Master portfolio index — ${apps.length} mobile apps, utilities, games & bundles</p>
<div class="stat">Portfolio catalog<br><span id="portfolio-count">${apps.length} apps indexed</span></div>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<div class="iap">${iapBar}</div>
<div class="export"><button type="button" id="export-portfolio">Export portfolio CSV (${apps.length} apps)</button><p>Opens in Excel · Pro adds Bundle ID & IAP columns</p></div>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="${onlineUrl}">View portfolio online</a></p>
<script>window.WE_PORTFOLIO=${portfolioJson};</script>
<script>(function(){
  var KEY='wealth_hub_recent';
  var titles=${titlesJson};
  var hrefs=${hrefsJson};
  function trackRecent(slug){
    try{
      var list=JSON.parse(localStorage.getItem(KEY)||'[]').filter(function(s){return s!==slug});
      list.unshift(slug);
      localStorage.setItem(KEY,JSON.stringify(list.slice(0,5)));
    }catch(e){}
  }
  document.querySelectorAll('.card').forEach(function(card){
    var slug=card.getAttribute('data-slug');
    if(slug)card.addEventListener('click',function(){trackRecent(slug)});
  });
  function renderRecent(){
    var row=document.getElementById('recent-row');
    var section=document.getElementById('recent-section');
    if(!row||!section)return;
    var slugs=[];
    try{slugs=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){}
    slugs=slugs.filter(function(s){return titles[s]&&hrefs[s]}).slice(0,3);
    if(!slugs.length){section.hidden=true;return;}
    section.hidden=false;
    row.innerHTML=slugs.map(function(s){
      return '<a href="'+hrefs[s]+'">'+titles[s]+'</a>';
    }).join('');
  }
  renderRecent();
  var banner=document.getElementById('offline-banner');
  function setOffline(){if(banner)banner.classList.toggle('show',!navigator.onLine)}
  window.addEventListener('online',setOffline);
  window.addEventListener('offline',setOffline);
  setOffline();
})();</script>
<script>${pushScript}</script>
<script>${csvScript}</script>
<script>${iapScript}</script>
</body></html>`;
}
