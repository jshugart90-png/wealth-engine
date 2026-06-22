/**
 * Sync dist/ assets into Capacitor www folders.
 * Usage: node sync-www.mjs [games|tools|receipt-rush|all]
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(mobileRoot, "..");
const dist = join(repoRoot, "dist");
const target = process.argv[2] ?? "all";

function ensureBuild() {
  if (!existsSync(join(dist, "index.html"))) {
    console.log("dist/ missing — running npm run build…");
    execSync("npm run build", { cwd: repoRoot, stdio: "inherit" });
  }
}

function syncGames() {
  const www = join(mobileRoot, "games", "www");
  mkdirSync(www, { recursive: true });
  cpSync(join(dist, "games"), www, { recursive: true });
  // Capacitor entry
  if (!existsSync(join(www, "index.html"))) {
    writeFileSync(
      join(www, "index.html"),
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=./index.html"><title>Games</title></head><body></body></html>`
    );
  }
  console.log("Synced games → mobile/games/www");
}

function syncTools() {
  const www = join(mobileRoot, "tools", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    { href: "billsnap/index.html", slug: "billsnap", title: "BillSnap", desc: "Invoice PDF in 30 seconds — $3 pro export", featured: true },
    { href: "tools/tip-calculator.html", slug: "tip", title: "Tip Calculator", desc: "Split bills and calculate tips" },
    { href: "tools/meeting-cost-free.html", slug: "meeting", title: "Meeting Cost", desc: "See what meetings really cost your team" },
    { href: "tools/payment-terms-calculator.html", slug: "net30", title: "Net 30 Calculator", desc: "Payment terms and due dates" },
    { href: "tools/hourly-rate-calculator.html", slug: "hourly", title: "Hourly Rate", desc: "Freelancer pricing from annual goals" },
    { href: "tools/1099-tax-estimator.html", slug: "1099", title: "1099 Tax Estimator", desc: "Quarterly tax planning for contractors" },
    { href: "tools/late-fee-calculator.html", slug: "late-fee", title: "Late Fee Calculator", desc: "Calculate overdue invoice penalties" },
    { href: "tools/profit-margin-calculator.html", slug: "margin", title: "Profit Margin", desc: "Markup and margin for projects" },
  ];

  const cards = tools
    .map(
      (t) => `
    <a class="card${t.featured ? " featured" : ""}" href="${t.href}" data-slug="${t.slug}">
      <h2>${t.title}</h2>
      <p>${t.desc}</p>
      <span class="open">Open →</span>
    </a>`
    )
    .join("");

  const titlesJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.title])));

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Freelancer Tools — Wealth Engine</title>
<meta name="description" content="BillSnap invoices, free calculators, and business utilities.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0a0a0f">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e8e8ef;margin:0;padding:0 20px 40px}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px}
.sub{text-align:center;color:#888;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#14141c;border:1px solid #2a2a38;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#6366f1;transform:translateY(-2px)}
.card.featured{border-color:#22c55e;background:linear-gradient(135deg,#14141c,#0f1a14)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#888;font-size:14px}
.open{color:#6366f1;font-size:13px;font-weight:600}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#888;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#1a1a28;border:1px solid #333;border-radius:8px;padding:8px 12px;font-size:13px;color:#c4c4d4;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px}
.footer a{color:#6366f1}
</style></head><body>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>Freelancer Tools</h1>
<p class="sub">BillSnap + ${tools.length} free business calculators</p>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="tools/index.html">All tools</a></p>
<script>(function(){
  var KEY='we_recent_tools';
  var titles=${titlesJson};
  var hrefs=${JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])))};
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
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  cpSync(join(dist, "billsnap"), join(www, "billsnap"), { recursive: true });
  cpSync(join(dist, "tools"), join(www, "tools"), { recursive: true });
  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced tools → mobile/tools/www");
}

function syncReceiptRush() {
  const www = join(mobileRoot, "receipt-rush", "www");
  const gameSrc = join(dist, "games", "receipt-rush");
  if (!existsSync(join(gameSrc, "index.html"))) {
    console.error("Missing dist/games/receipt-rush — run npm run build first");
    process.exit(1);
  }
  mkdirSync(www, { recursive: true });
  cpSync(join(gameSrc, "index.html"), join(www, "index.html"));
  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });
  console.log("Synced receipt-rush → mobile/receipt-rush/www");
}

ensureBuild();
if (target === "games" || target === "all") syncGames();
if (target === "tools" || target === "all") syncTools();
if (target === "receipt-rush" || target === "all") syncReceiptRush();
