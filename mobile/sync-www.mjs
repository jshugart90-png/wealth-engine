/**
 * Sync dist/ assets into Capacitor www folders.
 * Usage: node sync-www.mjs [games|tools|freelancer-stack|devwatch|renter-toolkit|hookrelay-dlq|1099-suite|receipt-rush|webhook-whack|invoice-stack|horseshoe-toss|uptime-defender|freelancer-memory|color-switch-snake|word-scramble-biz|net-30-ninja|ssl-shield|nda-speed-sign|invoice-number-rush|billsnap|statusping-lite|leaselens|ndagen|hookrelay|pipekit|meetingcost|templateforge|comparestack|tip-calculator-pro|hourly-rate-calculator-pro|freelancer-tax-estimator|1099-threshold-tracker-pro|quarterly-tax-deadline-pro|profit-margin-calculator-pro|break-even-calculator-pro|late-fee-calculator-pro|markup-calculator-pro|day-rate-calculator-pro|bill-splitter-pro|percentage-calculator-pro|all]
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import {
  deadlinePushInlineScript,
  contractorCsvExportScript,
  agencyPushInlineScript,
  agencyClientCsvExportScript,
  teamPushInlineScript,
  ndagenAuditCsvExportScript,
} from "./shared/push.mjs";

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

function syncFreelancerStack() {
  const www = join(mobileRoot, "freelancer-stack", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    {
      href: "billsnap/index.html",
      slug: "billsnap",
      title: "BillSnap",
      desc: "Invoice & receipt PDFs in 30 seconds",
      featured: true,
    },
    {
      href: "templateforge/index.html",
      slug: "templateforge",
      title: "TemplateForge",
      desc: "Contracts, proposals & compliance kits",
    },
    {
      href: "ndagen/index.html",
      slug: "ndagen",
      title: "NDAGen",
      desc: "One-way & mutual NDA PDFs",
    },
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
  const hrefsJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])));

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Freelancer Revenue Stack</title>
<meta name="description" content="BillSnap + TemplateForge + NDAGen — invoice, contract, and NDA in one stack.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#1e3a8a">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0 20px 40px}
.promo{background:#eab308;color:#000;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#000;text-decoration:underline}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem}
.sub{text-align:center;color:#94a3b8;margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#2563eb;transform:translateY(-2px)}
.card.featured{border-color:#22c55e;background:linear-gradient(135deg,#1e293b,#14532d)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#94a3b8;font-size:14px}
.open{color:#38bdf8;font-size:13px;font-weight:600}
.bundle{display:block;max-width:900px;margin:24px auto 0;background:#1e3a8a;border:2px solid #2563eb;border-radius:12px;padding:20px;text-align:center;color:inherit;text-decoration:none}
.bundle strong{display:block;font-size:18px;margin-bottom:6px;color:#fff}
.bundle span{font-size:14px;color:#bfdbfe}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 12px;font-size:13px;color:#cbd5e1;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#64748b}
.footer a{color:#38bdf8}
</style></head><body>
<div class="promo"><strong>LAUNCH25</strong> — 25% off · <a href="https://wealth-engine-0qlj.onrender.com/go/freelancer.html">Checkout →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>📦 Freelancer Revenue Stack</h1>
<p class="sub">BillSnap + TemplateForge + NDAGen — invoice → contract → NDA</p>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<a class="bundle" href="bundles/freelancer-stack.html">
  <strong>Stack Bundle — $49 one-time</strong>
  <span>30-day unlimited + freelancer kit + NDA pack · or $29/mo unlimited</span>
</a>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/bundles/freelancer-stack.html">View bundle online</a></p>
<script>(function(){
  var KEY='freelancer_stack_recent';
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
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  for (const dir of ["billsnap", "templateforge", "ndagen"]) {
    const src = join(dist, dir);
    if (!existsSync(join(src, "index.html"))) {
      console.error(`Missing dist/${dir} — run npm run build first`);
      process.exit(1);
    }
    cpSync(src, join(www, dir), { recursive: true });
  }

  const bundleSrc = join(dist, "bundles", "freelancer-stack.html");
  if (!existsSync(bundleSrc)) {
    console.error("Missing dist/bundles/freelancer-stack.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "bundles"), { recursive: true });
  cpSync(bundleSrc, join(www, "bundles", "freelancer-stack.html"));

  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced freelancer-stack → mobile/freelancer-stack/www");
}

function syncDevWatch() {
  const www = join(mobileRoot, "devwatch", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    {
      href: "statusping/index.html",
      slug: "statusping",
      title: "StatusPing",
      desc: "Uptime monitors & email alerts",
      featured: true,
    },
    {
      href: "tools/ssl-expiry-checker.html",
      slug: "ssl",
      title: "SSL Expiry Checker",
      desc: "Certificate expiry date alerts",
    },
    {
      href: "tools/cron-schedule-helper.html",
      slug: "cron",
      title: "Cron Schedule Helper",
      desc: "Heartbeat URLs for scheduled jobs",
    },
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
  const hrefsJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])));

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DevWatch</title>
<meta name="description" content="StatusPing + SSL Expiry Checker + Cron Schedule Helper — uptime, SSL, and cron in one stack.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0f172a">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0 20px 40px}
.promo{background:#eab308;color:#000;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#000;text-decoration:underline}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem}
.sub{text-align:center;max-width:360px;margin:0 auto 20px;color:#94a3b8;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#2563eb;transform:translateY(-2px)}
.card.featured{border-color:#22d3ee;background:linear-gradient(135deg,#1e293b,#0c4a6e)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#94a3b8;font-size:14px}
.open{color:#38bdf8;font-size:13px;font-weight:600}
.bundle{display:block;max-width:900px;margin:24px auto 0;background:#1e3a8a;border:2px solid #2563eb;border-radius:12px;padding:20px;text-align:center;color:inherit;text-decoration:none}
.bundle strong{display:block;font-size:18px;margin-bottom:6px;color:#fff}
.bundle span{font-size:14px;color:#bfdbfe}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 12px;font-size:13px;color:#cbd5e1;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#64748b}
.footer a{color:#38bdf8}
</style></head><body>
<div class="promo"><strong>LAUNCH25</strong> — 25% off · <a href="https://wealth-engine-0qlj.onrender.com/go/devwatch.html">DevWatch $39/mo →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>🛡️ DevWatch</h1>
<p class="sub">StatusPing + SSL + cron — know before customers do</p>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<a class="bundle" href="bundles/devwatch.html">
  <strong>DevWatch — $39/mo</strong>
  <span>25 monitors + 10 SSL certs + 20 cron jobs · or StatusPing Team $19/mo</span>
</a>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/bundles/devwatch.html">View bundle online</a></p>
<script>(function(){
  var KEY='devwatch_recent';
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
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  const statuspingSrc = join(dist, "statusping");
  if (!existsSync(join(statuspingSrc, "index.html"))) {
    console.error("Missing dist/statusping — run npm run build first");
    process.exit(1);
  }
  cpSync(statuspingSrc, join(www, "statusping"), { recursive: true });

  mkdirSync(join(www, "tools"), { recursive: true });
  for (const toolFile of ["ssl-expiry-checker.html", "cron-schedule-helper.html"]) {
    const src = join(dist, "tools", toolFile);
    if (!existsSync(src)) {
      console.error(`Missing dist/tools/${toolFile} — run npm run build first`);
      process.exit(1);
    }
    cpSync(src, join(www, "tools", toolFile));
  }

  const bundleSrc = join(dist, "bundles", "devwatch.html");
  if (!existsSync(bundleSrc)) {
    console.error("Missing dist/bundles/devwatch.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "bundles"), { recursive: true });
  cpSync(bundleSrc, join(www, "bundles", "devwatch.html"));

  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced devwatch → mobile/devwatch/www");
}

function syncRenterToolkit() {
  const www = join(mobileRoot, "renter-toolkit", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    {
      href: "leaselens/index.html",
      slug: "leaselens",
      title: "LeaseLens",
      desc: "Paste your lease — get a risk score & red flags",
      featured: true,
    },
    {
      href: "templateforge/index.html",
      slug: "templateforge",
      title: "TemplateForge",
      desc: "Compliance templates & rental checklists",
    },
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
  const hrefsJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])));

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Renter Toolkit</title>
<meta name="description" content="LeaseLens + TemplateForge — lease review and compliance templates in one hub.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#14532d">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0 20px 40px}
.promo{background:#eab308;color:#000;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#000;text-decoration:underline}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem}
.sub{text-align:center;color:#94a3b8;margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#22c55e;transform:translateY(-2px)}
.card.featured{border-color:#22c55e;background:linear-gradient(135deg,#1e293b,#14532d)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#94a3b8;font-size:14px}
.open{color:#4ade80;font-size:13px;font-weight:600}
.stat{display:block;max-width:900px;margin:0 auto 20px;background:#14532d;border:2px solid #22c55e;border-radius:12px;padding:16px 20px;text-align:center}
.stat span{font-size:1.2rem;font-weight:700;color:#4ade80}
.bundle{display:block;max-width:900px;margin:24px auto 0;background:#14532d;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;color:inherit;text-decoration:none}
.bundle strong{display:block;font-size:18px;margin-bottom:6px;color:#fff}
.bundle span{font-size:14px;color:#bbf7d0}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 12px;font-size:13px;color:#cbd5e1;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#64748b}
.footer a{color:#4ade80}
</style></head><body>
<div class="promo"><strong>LAUNCH25</strong> — 25% off · <a href="https://wealth-engine-0qlj.onrender.com/go/lease.html">Lease review →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>🏠 Renter Toolkit</h1>
<p class="sub">LeaseLens + TemplateForge — review leases & grab compliance templates</p>
<div class="stat">Last lease score<br><span id="last-score">—</span></div>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<a class="bundle" href="bundles/landlord-tenant-stack.html">
  <strong>Lease Bundle — $15 + $19</strong>
  <span>3 lease reports + compliance template pack · LAUNCH25 at checkout</span>
</a>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/bundles/landlord-tenant-stack.html">View bundle online</a></p>
<script>(function(){
  var KEY='renter_toolkit_recent';
  var SCORE_KEY='leaselens_last_score';
  var titles=${titlesJson};
  var hrefs=${hrefsJson};
  var scoreEl=document.getElementById('last-score');
  try{var s=localStorage.getItem(SCORE_KEY);if(scoreEl&&s)scoreEl.textContent=s}catch(e){}
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

  for (const dir of ["leaselens", "templateforge"]) {
    const src = join(dist, dir);
    if (!existsSync(join(src, "index.html"))) {
      console.error(`Missing dist/${dir} — run npm run build first`);
      process.exit(1);
    }
    cpSync(src, join(www, dir), { recursive: true });
  }

  const bundleSrc = join(dist, "bundles", "landlord-tenant-stack.html");
  if (!existsSync(bundleSrc)) {
    console.error("Missing dist/bundles/landlord-tenant-stack.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "bundles"), { recursive: true });
  cpSync(bundleSrc, join(www, "bundles", "landlord-tenant-stack.html"));

  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced renter-toolkit → mobile/renter-toolkit/www");
}

function syncHookRelayDlq() {
  const www = join(mobileRoot, "hookrelay-dlq", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    {
      href: "go/hookrelay-dlq.html",
      slug: "landing",
      title: "DLQ Pro Landing",
      desc: "$29/mo — retry, dead letter queue, replay",
      featured: true,
    },
    {
      href: "hookrelay/index.html",
      slug: "relay",
      title: "HookRelay Dashboard",
      desc: "Receive, retry, and forward webhooks",
    },
    {
      href: "hookrelay/pricing.html",
      slug: "pricing",
      title: "Pricing & Plans",
      desc: "Free, Pro $29/mo, Team $79/mo",
    },
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
  const hrefsJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])));

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HookRelay DLQ Pro</title>
<meta name="description" content="Webhook dead letter queue, exponential backoff retry, and one-click replay for indie SaaS.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0d1117">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0d1117;color:#c9d1d9;margin:0;padding:0 20px 40px}
.promo{background:#238636;color:#fff;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#fff;text-decoration:underline}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem}
.sub{text-align:center;max-width:360px;margin:0 auto 20px;color:#8b949e;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#58a6ff;transform:translateY(-2px)}
.card.featured{border-color:#238636;background:linear-gradient(135deg,#161b22,#0d2818)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#8b949e;font-size:14px}
.open{color:#58a6ff;font-size:13px;font-weight:600}
.tier{display:block;max-width:900px;margin:24px auto 0;background:#161b22;border:2px solid #238636;border-radius:12px;padding:20px;text-align:center;color:inherit;text-decoration:none}
.tier strong{display:block;font-size:18px;margin-bottom:6px;color:#3fb950}
.tier span{font-size:14px;color:#8b949e}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#484f58;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:8px 12px;font-size:13px;color:#c9d1d9;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#484f58}
.footer a{color:#58a6ff}
</style></head><body>
<div class="promo"><strong>LAUNCH25</strong> — 25% off first month · <a href="go/hookrelay-dlq.html">DLQ Pro $29/mo →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>🔗 HookRelay DLQ Pro</h1>
<p class="sub">Dead letter queue, retry, and replay for Stripe, GitHub & Shopify webhooks</p>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<a class="tier" href="go/hookrelay-dlq.html">
  <strong>DLQ Pro — $29/mo</strong>
  <span>10 endpoints · 25K events/mo · Slack + email alerts · one-click replay</span>
</a>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/go/hookrelay-dlq.html">View landing online</a></p>
<script>(function(){
  var KEY='hookrelay_dlq_recent';
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
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  const hookrelaySrc = join(dist, "hookrelay");
  if (!existsSync(join(hookrelaySrc, "index.html"))) {
    console.error("Missing dist/hookrelay — run npm run build first");
    process.exit(1);
  }
  cpSync(hookrelaySrc, join(www, "hookrelay"), { recursive: true });

  const landingSrc = join(dist, "go", "hookrelay-dlq.html");
  if (!existsSync(landingSrc)) {
    console.error("Missing dist/go/hookrelay-dlq.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "go"), { recursive: true });
  cpSync(landingSrc, join(www, "go", "hookrelay-dlq.html"));

  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced hookrelay-dlq → mobile/hookrelay-dlq/www");
}

function sync1099Suite() {
  const www = join(mobileRoot, "1099-suite", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    {
      href: "go/1099-deadline.html",
      slug: "landing",
      title: "1099 Pro Landing",
      desc: "$19 — track contractors, generate 1099-NEC PDFs",
      featured: true,
    },
    {
      href: "1099-threshold-tracker-pro/index.html",
      slug: "threshold",
      title: "Threshold Tracker",
      desc: "Flag contractors crossing the $600 NEC threshold",
    },
    {
      href: "quarterly-tax-deadline-pro/index.html",
      slug: "quarterly",
      title: "Quarterly Deadlines",
      desc: "Estimated tax payment calendar & reminders",
    },
    {
      href: "tools/1099-tax-estimator.html",
      slug: "estimator",
      title: "1099 Tax Estimator",
      desc: "Penalty calculator & filing checklist",
    },
    {
      href: "freelancer-tax-estimator/index.html",
      slug: "freelancer",
      title: "Freelancer Tax Estimator",
      desc: "Self-employment tax & quarterly estimates",
    },
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
  const hrefsJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])));
  const pushScript = deadlinePushInlineScript();
  const csvScript = contractorCsvExportScript();

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>1099 Deadline Suite</title>
<meta name="description" content="1099-NEC deadline tracker, contractor threshold alerts, and filing checklists for Jan 31.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#78350f">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0 20px 40px}
.promo{background:#d97706;color:#000;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#000;text-decoration:underline}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem}
.sub{text-align:center;max-width:360px;margin:0 auto 20px;color:#94a3b8;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#d97706;transform:translateY(-2px)}
.card.featured{border-color:#d97706;background:linear-gradient(135deg,#1e293b,#78350f)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#94a3b8;font-size:14px}
.open{color:#fbbf24;font-size:13px;font-weight:600}
.stat{display:block;max-width:900px;margin:0 auto 20px;background:#78350f;border:2px solid #d97706;border-radius:12px;padding:16px 20px;text-align:center}
.stat span{font-size:1.2rem;font-weight:700;color:#fbbf24}
.tier{display:block;max-width:900px;margin:24px auto 0;background:#78350f;border:2px solid #d97706;border-radius:12px;padding:20px;text-align:center;color:inherit;text-decoration:none}
.tier strong{display:block;font-size:18px;margin-bottom:6px;color:#fff}
.tier span{font-size:14px;color:#fde68a}
.export{display:block;max-width:900px;margin:16px auto 0;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:14px 20px;text-align:center}
.export button{background:#d97706;color:#000;border:none;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:14px}
.export p{margin:8px 0 0;font-size:12px;color:#64748b}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 12px;font-size:13px;color:#cbd5e1;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#64748b}
.footer a{color:#fbbf24}
</style></head><body>
<div class="promo"><strong>JAN31</strong> — 1099-NEC deadline · <a href="go/1099-deadline.html">Pro Suite $19 →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>📋 1099 Deadline Suite</h1>
<p class="sub">Track contractor payments, hit Jan 31, and export your filing list</p>
<div class="stat">Contractors needing 1099<br><span id="contractor-count">—</span></div>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<div class="export"><button type="button" id="export-contractors">Export contractors CSV</button><p>Opens in Excel · from Threshold Tracker data</p></div>
<a class="tier" href="go/1099-deadline.html">
  <strong>Pro Suite — $19</strong>
  <span>Up to 10 contractor 1099-NEC PDFs · state filing checklists · Jan deadline tracker</span>
</a>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/go/1099-deadline.html">View landing online</a></p>
<script>(function(){
  var KEY='1099_suite_recent';
  var STORAGE_KEY='thresholdpro_contractors';
  var titles=${titlesJson};
  var hrefs=${hrefsJson};
  var countEl=document.getElementById('contractor-count');
  try{
    var rows=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    var need=rows.filter(function(r){return (r.paid||0)>=600}).length;
    if(countEl)countEl.textContent=rows.length?need+' of '+rows.length:'0 saved';
  }catch(e){}
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
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  const landingSrc = join(dist, "go", "1099-deadline.html");
  if (!existsSync(landingSrc)) {
    console.error("Missing dist/go/1099-deadline.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "go"), { recursive: true });
  cpSync(landingSrc, join(www, "go", "1099-deadline.html"));

  const estimatorSrc = join(dist, "tools", "1099-tax-estimator.html");
  if (!existsSync(estimatorSrc)) {
    console.error("Missing dist/tools/1099-tax-estimator.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "tools"), { recursive: true });
  cpSync(estimatorSrc, join(www, "tools", "1099-tax-estimator.html"));

  for (const dir of ["1099-threshold-tracker-pro", "quarterly-tax-deadline-pro", "freelancer-tax-estimator"]) {
    const src = join(dist, dir);
    if (!existsSync(join(src, "index.html"))) {
      console.error(`Missing dist/${dir} — run npm run build first`);
      process.exit(1);
    }
    cpSync(src, join(www, dir), { recursive: true });
  }

  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced 1099-suite → mobile/1099-suite/www");
}

function syncStatuspingAgency() {
  const www = join(mobileRoot, "statusping-agency", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    {
      href: "go/statusping-agency.html",
      slug: "landing",
      title: "Agency Landing",
      desc: "$49/mo — 10 workspaces, white-label status pages",
      featured: true,
    },
    {
      href: "statusping/index.html",
      slug: "statusping",
      title: "StatusPing",
      desc: "Uptime monitors & email alerts per client",
    },
    {
      href: "tools/ssl-expiry-checker.html",
      slug: "ssl",
      title: "SSL Expiry Checker",
      desc: "Certificate expiry alerts for client domains",
    },
    {
      href: "tools/cron-schedule-helper.html",
      slug: "cron",
      title: "Cron Schedule Helper",
      desc: "Heartbeat monitoring for scheduled jobs",
    },
    {
      href: "comparestack/pages/white-label-monitoring-agency.html",
      slug: "compare",
      title: "Agency Compare",
      desc: "White-label monitoring pricing vs competitors",
    },
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
  const hrefsJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])));
  const pushScript = agencyPushInlineScript();
  const csvScript = agencyClientCsvExportScript();

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>StatusPing Agency</title>
<meta name="description" content="White-label uptime monitoring for agencies — 10 client workspaces, 100 monitors, branded status pages.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0f172a">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0 20px 40px}
.promo{background:#0284c7;color:#fff;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#fff;text-decoration:underline}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem}
.sub{text-align:center;max-width:360px;margin:0 auto 20px;color:#94a3b8;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#38bdf8;transform:translateY(-2px)}
.card.featured{border-color:#0284c7;background:linear-gradient(135deg,#1e293b,#0c4a6e)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#94a3b8;font-size:14px}
.open{color:#38bdf8;font-size:13px;font-weight:600}
.stat{display:block;max-width:900px;margin:0 auto 20px;background:#0c4a6e;border:2px solid #0284c7;border-radius:12px;padding:16px 20px;text-align:center}
.stat span{font-size:1.2rem;font-weight:700;color:#7dd3fc}
.tier{display:block;max-width:900px;margin:24px auto 0;background:#0c4a6e;border:2px solid #0284c7;border-radius:12px;padding:20px;text-align:center;color:inherit;text-decoration:none}
.tier strong{display:block;font-size:18px;margin-bottom:6px;color:#fff}
.tier span{font-size:14px;color:#bae6fd}
.export{display:block;max-width:900px;margin:16px auto 0;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:14px 20px;text-align:center}
.export button{background:#0284c7;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:14px}
.export p{margin:8px 0 0;font-size:12px;color:#64748b}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 12px;font-size:13px;color:#cbd5e1;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#64748b}
.footer a{color:#38bdf8}
</style></head><body>
<div class="promo"><strong>LAUNCH25</strong> — 25% off first month · <a href="go/statusping-agency.html">Agency $49/mo →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>📡 StatusPing Agency</h1>
<p class="sub">White-label uptime monitoring — resell at $20–30/client</p>
<div class="stat">Client workspaces<br><span id="client-count">—</span></div>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<div class="export"><button type="button" id="export-clients">Export clients CSV</button><p>Opens in Excel · from agency client roster</p></div>
<a class="tier" href="go/statusping-agency.html">
  <strong>Agency — $49/mo</strong>
  <span>10 client workspaces · 100 monitors · branded status pages · reseller kit</span>
</a>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/go/statusping-agency.html">View landing online</a></p>
<script>(function(){
  var KEY='statusping_agency_recent';
  var STORAGE_KEY='statusping_agency_clients';
  var titles=${titlesJson};
  var hrefs=${hrefsJson};
  var countEl=document.getElementById('client-count');
  try{
    var rows=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    if(countEl)countEl.textContent=rows.length?rows.length+' of 10 workspaces':'0 saved';
  }catch(e){}
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
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  const landingSrc = join(dist, "go", "statusping-agency.html");
  if (!existsSync(landingSrc)) {
    console.error("Missing dist/go/statusping-agency.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "go"), { recursive: true });
  cpSync(landingSrc, join(www, "go", "statusping-agency.html"));

  const statuspingSrc = join(dist, "statusping");
  if (!existsSync(join(statuspingSrc, "index.html"))) {
    console.error("Missing dist/statusping — run npm run build first");
    process.exit(1);
  }
  cpSync(statuspingSrc, join(www, "statusping"), { recursive: true });

  mkdirSync(join(www, "tools"), { recursive: true });
  for (const toolFile of ["ssl-expiry-checker.html", "cron-schedule-helper.html"]) {
    const src = join(dist, "tools", toolFile);
    if (!existsSync(src)) {
      console.error(`Missing dist/tools/${toolFile} — run npm run build first`);
      process.exit(1);
    }
    cpSync(src, join(www, "tools", toolFile));
  }

  const compareSrc = join(dist, "comparestack", "pages", "white-label-monitoring-agency.html");
  if (!existsSync(compareSrc)) {
    console.error("Missing dist/comparestack/pages/white-label-monitoring-agency.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "comparestack", "pages"), { recursive: true });
  cpSync(compareSrc, join(www, "comparestack", "pages", "white-label-monitoring-agency.html"));

  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced statusping-agency → mobile/statusping-agency/www");
}

function syncNdagenTeam() {
  const www = join(mobileRoot, "ndagen-team", "www");
  mkdirSync(www, { recursive: true });

  const tools = [
    {
      href: "go/nda-team.html",
      slug: "landing",
      title: "Team Landing",
      desc: "$29/mo — 50 NDAs, 3 seats, shared templates",
      featured: true,
    },
    {
      href: "ndagen/index.html",
      slug: "ndagen",
      title: "NDAGen",
      desc: "Mutual & one-way NDA generator with state selector",
    },
    {
      href: "templateforge/index.html",
      slug: "templateforge",
      title: "TemplateForge",
      desc: "Shared contract and proposal templates for your team",
    },
    {
      href: "comparestack/pages/nda-template-generators.html",
      slug: "compare",
      title: "NDA Compare",
      desc: "NDA tool pricing vs Quoqo, AiDocX, and competitors",
    },
    {
      href: "bundles/freelancer-stack.html",
      slug: "stack",
      title: "Freelancer Stack",
      desc: "BillSnap + TemplateForge + NDAGen bundle",
    },
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
  const hrefsJson = JSON.stringify(Object.fromEntries(tools.map((t) => [t.slug, t.href])));
  const pushScript = teamPushInlineScript();
  const csvScript = ndagenAuditCsvExportScript();

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NDAGen Team</title>
<meta name="description" content="50 NDA exports per month for agencies — 3 team seats, shared templates, governing-law selector.">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0f172a">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0 20px 40px}
.promo{background:#059669;color:#fff;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;margin:0 -20px 16px}
.promo a{color:#fff;text-decoration:underline}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px}
.offline.show{display:block}
h1{text-align:center;margin:28px 0 8px;font-size:1.6rem}
.sub{text-align:center;max-width:360px;margin:0 auto 20px;color:#94a3b8;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{display:block;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;color:inherit;text-decoration:none;transition:.2s}
.card:hover{border-color:#22c55e;transform:translateY(-2px)}
.card.featured{border-color:#059669;background:linear-gradient(135deg,#1e293b,#064e3b)}
h2{margin:0 0 8px;font-size:18px}
p{margin:0 0 10px;color:#94a3b8;font-size:14px}
.open{color:#22c55e;font-size:13px;font-weight:600}
.stat{display:block;max-width:900px;margin:0 auto 20px;background:#064e3b;border:2px solid #059669;border-radius:12px;padding:16px 20px;text-align:center}
.stat span{font-size:1.2rem;font-weight:700;color:#86efac}
.tier{display:block;max-width:900px;margin:24px auto 0;background:#064e3b;border:2px solid #059669;border-radius:12px;padding:20px;text-align:center;color:inherit;text-decoration:none}
.tier strong{display:block;font-size:18px;margin-bottom:6px;color:#fff}
.tier span{font-size:14px;color:#bbf7d0}
.export{display:block;max-width:900px;margin:16px auto 0;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:14px 20px;text-align:center}
.export button{background:#059669;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:14px}
.export p{margin:8px 0 0;font-size:12px;color:#64748b}
.recent{max-width:900px;margin:0 auto 20px}
.recent h3{font-size:13px;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em}
.recent-row{display:flex;gap:10px;flex-wrap:wrap}
.recent a{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 12px;font-size:13px;color:#cbd5e1;text-decoration:none}
.footer{text-align:center;margin-top:32px;font-size:13px;color:#64748b}
.footer a{color:#22c55e}
</style></head><body>
<div class="promo"><strong>LAUNCH25</strong> — 25% off first month · <a href="go/nda-team.html">Team $29/mo →</a></div>
<div id="offline-banner" class="offline" role="status">You're offline — open tools you've used before</div>
<h1>📄 NDAGen Team</h1>
<p class="sub">50 NDA exports/mo for agencies — beats Quoqo at $30</p>
<div class="stat">Exports this month<br><span id="export-count">—</span></div>
<div id="recent-section" class="recent" hidden>
  <h3>Recently used</h3>
  <div id="recent-row" class="recent-row"></div>
</div>
<div class="grid">${cards}</div>
<div class="export"><button type="button" id="export-audit">Export audit log CSV</button><p>Opens in Excel · from NDAGen activity</p></div>
<a class="tier" href="go/nda-team.html">
  <strong>Team — $29/mo</strong>
  <span>50 PDF exports · 3 seats · mutual & one-way NDAs · audit log</span>
</a>
<p class="footer"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/go/nda-team.html">View landing online</a></p>
<script>(function(){
  var KEY='ndagen_team_recent';
  var USAGE_KEY='ndagen_exports_mo';
  var TEAM_LIMIT=50;
  var titles=${titlesJson};
  var hrefs=${hrefsJson};
  var countEl=document.getElementById('export-count');
  try{
    var raw=JSON.parse(localStorage.getItem(USAGE_KEY)||'{}');
    var month=new Date().toISOString().slice(0,7);
    var count=(raw.month===month)?(raw.count||0):0;
    if(countEl)countEl.textContent=count+' of '+TEAM_LIMIT+' used';
  }catch(e){}
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
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  const landingSrc = join(dist, "go", "nda-team.html");
  if (!existsSync(landingSrc)) {
    console.error("Missing dist/go/nda-team.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "go"), { recursive: true });
  cpSync(landingSrc, join(www, "go", "nda-team.html"));

  const ndagenSrc = join(dist, "ndagen");
  if (!existsSync(join(ndagenSrc, "index.html"))) {
    console.error("Missing dist/ndagen — run npm run build first");
    process.exit(1);
  }
  cpSync(ndagenSrc, join(www, "ndagen"), { recursive: true });

  const templateforgeSrc = join(dist, "templateforge");
  if (!existsSync(join(templateforgeSrc, "index.html"))) {
    console.error("Missing dist/templateforge — run npm run build first");
    process.exit(1);
  }
  cpSync(templateforgeSrc, join(www, "templateforge"), { recursive: true });

  const compareSrc = join(dist, "comparestack", "pages", "nda-template-generators.html");
  if (!existsSync(compareSrc)) {
    console.error("Missing dist/comparestack/pages/nda-template-generators.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "comparestack", "pages"), { recursive: true });
  cpSync(compareSrc, join(www, "comparestack", "pages", "nda-template-generators.html"));

  const bundleSrc = join(dist, "bundles", "freelancer-stack.html");
  if (!existsSync(bundleSrc)) {
    console.error("Missing dist/bundles/freelancer-stack.html — run npm run build first");
    process.exit(1);
  }
  mkdirSync(join(www, "bundles"), { recursive: true });
  cpSync(bundleSrc, join(www, "bundles", "freelancer-stack.html"));

  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced ndagen-team → mobile/ndagen-team/www");
}

const MINI_GAME_SHELLS = {
  "receipt-rush": {
    title: "Receipt Rush",
    emoji: "🧾",
    tagline: "Catch receipts before they hit the ground. Dodge crumpled ones!",
    themeColor: "#fef3c7",
    bg: "#fef3c7",
    text: "#1c1917",
    sub: "#78716c",
    accent: "#b45309",
    btnBg: "#d97706",
    btnHover: "#b45309",
    bestBorder: "#fcd34d",
    bestKey: "receipt_rush_best",
  },
  "webhook-whack": {
    title: "Webhook Whack",
    emoji: "🔗",
    tagline: "Tap failed webhooks — ignore the healthy ones!",
    themeColor: "#0f0f1a",
    bg: "#0f0f1a",
    text: "#e0e7ff",
    sub: "#818cf8",
    accent: "#34d399",
    btnBg: "#6366f1",
    btnHover: "#4f46e5",
    bestBorder: "#312e81",
    bestKey: "webhook_whack_best",
  },
  "invoice-stack": {
    title: "Invoice Stack",
    emoji: "🧾",
    tagline: "Tap left/right to move — stack invoices before they fall!",
    themeColor: "#0f172a",
    bg: "#0f172a",
    text: "#e2e8f0",
    sub: "#94a3b8",
    accent: "#38bdf8",
    btnBg: "#2563eb",
    btnHover: "#1d4ed8",
    bestBorder: "#334155",
    bestKey: "invoice_stack_best",
  },
  "horseshoe-toss": {
    title: "Horseshoe Toss",
    emoji: "🐴",
    tagline: "Tap when the power bar is green — ring the stake!",
    themeColor: "#1a2f1a",
    bg: "#1a2f1a",
    text: "#f0f4e8",
    sub: "#a8c4a0",
    accent: "#ffd54f",
    btnBg: "#4caf50",
    btnHover: "#388e3c",
    bestBorder: "#3a5a3a",
    bestKey: "hsBest",
  },
  "uptime-defender": {
    title: "Uptime Defender",
    emoji: "🛡️",
    tagline: "Deploy ping monitors — stop downtime bugs!",
    themeColor: "#0a0a12",
    bg: "#0a0a12",
    text: "#e0e0ff",
    sub: "#8888bb",
    accent: "#6ee7b7",
    btnBg: "#6366f1",
    btnHover: "#4f46e5",
    bestBorder: "#1e1e30",
    bestKey: "uptime_defender_best",
  },
  "freelancer-memory": {
    title: "Freelancer Memory",
    emoji: "🧠",
    tagline: "Match freelancer tool pairs — tap two cards!",
    themeColor: "#111827",
    bg: "#111827",
    text: "#f3f4f6",
    sub: "#9ca3af",
    accent: "#a78bfa",
    btnBg: "#6366f1",
    btnHover: "#4f46e5",
    bestBorder: "#374151",
    bestKey: "freelancer_memory_best",
    bestLabel: "Fewest moves",
    bestEmpty: "—",
  },
  "color-switch-snake": {
    title: "Color Switch Snake",
    emoji: "🐍",
    tagline: "Swipe or tap sides to turn — match gate colors!",
    themeColor: "#0c0c0c",
    bg: "#0c0c0c",
    text: "#fff",
    sub: "#888",
    accent: "#f472b6",
    btnBg: "#ec4899",
    btnHover: "#db2777",
    bestBorder: "#333",
    bestKey: "color_switch_snake_best",
  },
  "word-scramble-biz": {
    title: "Word Scramble Biz",
    emoji: "📝",
    tagline: "Tap letters to spell business terms!",
    themeColor: "#fefce8",
    bg: "#fefce8",
    text: "#1c1917",
    sub: "#78716c",
    accent: "#ca8a04",
    btnBg: "#ca8a04",
    btnHover: "#b45309",
    bestBorder: "#fcd34d",
    bestKey: "word_scramble_biz_best",
  },
  "net-30-ninja": {
    title: "Net-30 Ninja",
    emoji: "🥷",
    tagline: "Jump over late invoices and net-30 traps!",
    themeColor: "#0f172a",
    bg: "#0f172a",
    text: "#e2e8f0",
    sub: "#94a3b8",
    accent: "#38bdf8",
    btnBg: "#2563eb",
    btnHover: "#1d4ed8",
    bestBorder: "#334155",
    bestKey: "net_30_ninja_best",
  },
  "ssl-shield": {
    title: "SSL Shield",
    emoji: "🔒",
    tagline: "Tap expiring certs — ignore healthy ones!",
    themeColor: "#0c1222",
    bg: "#0c1222",
    text: "#e2e8f0",
    sub: "#64748b",
    accent: "#22d3ee",
    btnBg: "#0891b2",
    btnHover: "#0e7490",
    bestBorder: "#1e293b",
    bestKey: "ssl_shield_best",
  },
  "invoice-number-rush": {
    title: "Invoice Number Rush",
    emoji: "🧾",
    tagline: "Tap the matching invoice number before it vanishes!",
    themeColor: "#0c1a2e",
    bg: "#0c1a2e",
    text: "#e2e8f0",
    sub: "#94a3b8",
    accent: "#38bdf8",
    btnBg: "#2563eb",
    btnHover: "#1d4ed8",
    bestBorder: "#334155",
    bestKey: "invoice_number_rush_best",
  },
  "nda-speed-sign": {
    title: "NDA Speed Sign",
    emoji: "📄",
    tagline: "Match NDA clause pairs before time runs out!",
    themeColor: "#1a1625",
    bg: "#1a1625",
    text: "#f5f3ff",
    sub: "#a78bfa",
    accent: "#fbbf24",
    btnBg: "#7c3aed",
    btnHover: "#6d28d9",
    bestBorder: "#4c3d6e",
    bestKey: "nda_speed_sign_best",
    bestLabel: "Best time",
    bestEmpty: "—",
  },
};

const UTILITY_SHELLS = {
  billsnap: {
    title: "BillSnap",
    emoji: "🧾",
    tagline: "Invoice PDF in 30 seconds — preview free, $3 pro export",
    themeColor: "#f8fafc",
    bg: "#f8fafc",
    text: "#0f172a",
    sub: "#64748b",
    accent: "#2563eb",
    btnBg: "#2563eb",
    btnHover: "#1d4ed8",
    statBorder: "#cbd5e1",
    statKey: "billsnap_last_invoice",
    statLabel: "Last invoice #",
    statEmpty: "—",
    cta: "Create Invoice",
    moreLink: "https://wealth-engine-0qlj.onrender.com/tools/",
    moreLabel: "More tools",
    offlineMsg: "You're offline — open BillSnap if you've used it before",
    features: [
      "Free preview — pay $3 only to export PDF",
      "No subscription or signup wall",
      "Draft saved locally on your device",
    ],
  },
  "statusping-lite": {
    title: "StatusPing Lite",
    emoji: "📡",
    tagline: "Uptime alerts from $5/mo — know before customers do",
    themeColor: "#0f172a",
    bg: "#0f172a",
    text: "#e2e8f0",
    sub: "#94a3b8",
    accent: "#38bdf8",
    btnBg: "#0284c7",
    btnHover: "#0369a1",
    statBorder: "#334155",
    statKey: "statusping_last_url",
    statLabel: "Last monitor URL",
    statEmpty: "—",
    cta: "Open Monitors",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/uptime.html",
    moreLabel: "Pricing & plans",
    offlineMsg: "You're offline — open StatusPing if you've used it before",
    distSlug: "statusping",
    wwwSlug: "statusping",
    features: [
      "5-minute checks with instant email alerts",
      "SSL expiry warnings on Basic tier",
      "Subscribe from $5/mo — cancel anytime",
    ],
  },
  leaselens: {
    title: "LeaseLens",
    emoji: "📋",
    tagline: "Rental lease red flags — full report $7",
    themeColor: "#ecfdf5",
    bg: "#ecfdf5",
    text: "#064e3b",
    sub: "#047857",
    accent: "#059669",
    btnBg: "#059669",
    btnHover: "#047857",
    statBorder: "#a7f3d0",
    statKey: "leaselens_last_score",
    statLabel: "Last risk score",
    statEmpty: "—",
    cta: "Analyze Lease",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/lease.html",
    moreLabel: "Full report pricing",
    offlineMsg: "You're offline — open LeaseLens if you've used it before",
    features: [
      "Free preview — top red flags before you sign",
      "Full clause report unlocks for $7 via Stripe",
      "License code restores paid reports on any device",
    ],
  },
  ndagen: {
    title: "NDAGen",
    emoji: "📄",
    tagline: "Mutual NDAs in seconds — PDF $4 or Team $29/mo",
    themeColor: "#ecfdf5",
    bg: "#ecfdf5",
    text: "#064e3b",
    sub: "#047857",
    accent: "#059669",
    btnBg: "#059669",
    btnHover: "#047857",
    statBorder: "#a7f3d0",
    statKey: "ndagen_exports_mo",
    statLabel: "Exports this month",
    statEmpty: "0",
    statRead: "try{var raw=JSON.parse(localStorage.getItem('ndagen_exports_mo')||'{}');if(el)el.textContent=String(raw.count||0)}catch(e){}",
    cta: "Generate NDA",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/nda-team.html",
    moreLabel: "Team plan pricing",
    offlineMsg: "You're offline — open NDAGen if you've used it before",
    features: [
      "Free unlimited NDA previews",
      "Single PDF export for $4 via Stripe",
      "Team plan — 50 exports/mo, 3 seats",
    ],
  },
  hookrelay: {
    title: "HookRelay",
    emoji: "🔗",
    tagline: "Webhook DLQ, retry & forwarding for indie SaaS",
    themeColor: "#0d1117",
    bg: "#0d1117",
    text: "#c9d1d9",
    sub: "#8b949e",
    accent: "#58a6ff",
    btnBg: "#238636",
    btnHover: "#2ea043",
    statBorder: "#30363d",
    statKey: "hookrelay_plan",
    statLabel: "Active plan",
    statEmpty: "Free tier",
    cta: "Open Relay",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/hookrelay-dlq.html",
    moreLabel: "DLQ Pro pricing",
    offlineMsg: "You're offline — open HookRelay if you've used it before",
    features: [
      "Durable receive → retry → DLQ → replay",
      "Stripe, GitHub, Shopify preset connectors",
      "Plans from $7/mo — free tier included",
    ],
  },
  pipekit: {
    title: "PipeKit",
    emoji: "🔧",
    tagline: "Developer API utilities — UUID, hash, JSON from $9/mo",
    themeColor: "#0d1117",
    bg: "#0d1117",
    text: "#c9d1d9",
    sub: "#8b949e",
    accent: "#58a6ff",
    btnBg: "#238636",
    btnHover: "#2ea043",
    statBorder: "#30363d",
    statKey: "pipekit_tier",
    statLabel: "API tier",
    statEmpty: "Free (100/day)",
    cta: "Open API Docs",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/pipekit.html",
    moreLabel: "Get API key",
    offlineMsg: "You're offline — open PipeKit if you've used it before",
    distSlug: "pipekit",
    features: [
      "UUID, hash, base64, JSON format APIs",
      "100 free requests/day — no signup",
      "Pro keys from $9/mo via Stripe",
    ],
  },
  meetingcost: {
    title: "MeetingCost",
    emoji: "💸",
    tagline: "How much does this meeting actually cost?",
    themeColor: "#fef2f2",
    bg: "#fef2f2",
    text: "#7f1d1d",
    sub: "#991b1b",
    accent: "#dc2626",
    btnBg: "#dc2626",
    btnHover: "#b91c1c",
    statBorder: "#fecaca",
    statKey: "meetingcost_last",
    statLabel: "Last meeting cost",
    statEmpty: "—",
    cta: "Calculate Cost",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/meeting.html",
    moreLabel: "Pro report pricing",
    offlineMsg: "You're offline — open MeetingCost if you've used it before",
    features: [
      "Instant cost from attendees, rate, and duration",
      "Shareable link with pre-filled values",
      "Pro report unlocks for $5 via Stripe",
    ],
  },
  templateforge: {
    title: "TemplateForge",
    emoji: "📄",
    tagline: "Business document kits — instant download from $12",
    themeColor: "#fafafa",
    bg: "#fafafa",
    text: "#111827",
    sub: "#6b7280",
    accent: "#2563eb",
    btnBg: "#2563eb",
    btnHover: "#1d4ed8",
    statBorder: "#d1d5db",
    statKey: "templateforge_last_kit",
    statLabel: "Last kit viewed",
    statEmpty: "—",
    cta: "Browse Kits",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/freelancer.html",
    moreLabel: "LAUNCH25 discount",
    offlineMsg: "You're offline — open TemplateForge if you've used it before",
    copyRecursive: true,
    features: [
      "Freelancer, compliance, and hiring packs",
      "Instant PDF download after Stripe checkout",
      "No subscription — pay once per kit",
    ],
  },
  comparestack: {
    title: "CompareStack",
    emoji: "⚖️",
    tagline: "Honest SaaS & freelancer tool comparisons",
    themeColor: "#ffffff",
    bg: "#ffffff",
    text: "#111827",
    sub: "#6b7280",
    accent: "#2563eb",
    btnBg: "#2563eb",
    btnHover: "#1d4ed8",
    statBorder: "#e5e7eb",
    statKey: "comparestack_last_page",
    statLabel: "Last comparison",
    statEmpty: "—",
    cta: "Browse Comparisons",
    moreLink: "https://wealth-engine-0qlj.onrender.com/comparestack/",
    moreLabel: "All 16+ guides",
    offlineMsg: "You're offline — open CompareStack if you've used it before",
    copyRecursive: true,
    features: [
      "16+ comparison guides for SaaS and tools",
      "Pricing tables with portfolio disclosures",
      "Recently viewed saved on your device",
    ],
  },
  "tip-calculator-pro": {
    title: "Tip Calculator Pro",
    emoji: "🧾",
    tagline: "Split bills, calculate tips, per-person breakdown",
    themeColor: "#0f172a",
    bg: "#0f172a",
    text: "#f8fafc",
    sub: "#94a3b8",
    accent: "#22c55e",
    btnBg: "#22c55e",
    btnHover: "#16a34a",
    statBg: "#1e293b",
    statBorder: "#334155",
    statKey: "tipcalcpro_last",
    statLabel: "Last total",
    statEmpty: "—",
    cta: "Calculate Tip",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/invoice.html",
    moreLabel: "Invoice PDF $3",
    offlineMsg: "You're offline — open Tip Calculator Pro if you've used it before",
    features: [
      "One-tap tip presets — 15%, 18%, 20%, 25%",
      "Split between any number of people",
      "Round up and copy summary to share",
    ],
  },
  "hourly-rate-calculator-pro": {
    title: "Hourly Rate Calculator Pro",
    emoji: "💰",
    tagline: "Freelancer hourly rate from income, taxes & expenses",
    themeColor: "#1e1b4b",
    bg: "#1e1b4b",
    text: "#f8fafc",
    sub: "#a5b4fc",
    accent: "#fbbf24",
    btnBg: "#f59e0b",
    btnHover: "#d97706",
    statBg: "#312e81",
    statBorder: "#4338ca",
    statKey: "hourlyratepro_last",
    statLabel: "Last rate",
    statEmpty: "—",
    cta: "Calculate Rate",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/freelancer-stack.html",
    moreLabel: "Freelancer Stack $49",
    offlineMsg: "You're offline — open Hourly Rate Calculator Pro if you've used it before",
    features: [
      "Target take-home income with quick presets",
      "Billable hours, weeks worked, tax & expense %",
      "Hourly rate with gross annual breakdown",
    ],
  },
  "freelancer-tax-estimator": {
    title: "Freelancer Tax Estimator Pro",
    emoji: "📊",
    tagline: "1099 self-employment tax & quarterly payments",
    themeColor: "#064e3b",
    bg: "#064e3b",
    text: "#f0fdf4",
    sub: "#6ee7b7",
    accent: "#fbbf24",
    btnBg: "#f59e0b",
    btnHover: "#d97706",
    statBg: "#065f46",
    statBorder: "#047857",
    statKey: "freelancertaxpro_last",
    statLabel: "Last estimate",
    statEmpty: "—",
    cta: "Estimate Taxes",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/freelancer-stack.html",
    moreLabel: "Freelancer Stack $49",
    offlineMsg: "You're offline — open Freelancer Tax Estimator Pro if you've used it before",
    features: [
      "Gross income & business deductions",
      "Self-employment tax (92.35% × 15.3%)",
      "Federal, state & quarterly payment estimates",
    ],
  },
  "1099-threshold-tracker-pro": {
    title: "1099 Threshold Tracker Pro",
    emoji: "📋",
    tagline: "Track contractor payments toward $600 1099-NEC threshold",
    themeColor: "#1e1b4b",
    bg: "#1e1b4b",
    text: "#f8fafc",
    sub: "#a5b4fc",
    accent: "#fbbf24",
    btnBg: "#f59e0b",
    btnHover: "#d97706",
    statBg: "#312e81",
    statBorder: "#4338ca",
    statKey: "thresholdpro_last",
    statLabel: "Vendor summary",
    statEmpty: "—",
    cta: "Track Vendors",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/compliance.html",
    moreLabel: "Compliance pack $19",
    offlineMsg: "You're offline — open 1099 Threshold Tracker Pro if you've used it before",
    features: [
      "Multi-vendor YTD payment tracking",
      "W-9 on-file status per contractor",
      "1099-NEC threshold alerts & progress bars",
    ],
  },
  "quarterly-tax-deadline-pro": {
    title: "Quarterly Tax Deadline Pro",
    emoji: "📅",
    tagline: "Federal estimated tax due dates for freelancers",
    themeColor: "#0c4a6e",
    bg: "#0c4a6e",
    text: "#f0f9ff",
    sub: "#7dd3fc",
    accent: "#fbbf24",
    btnBg: "#f59e0b",
    btnHover: "#d97706",
    statBg: "#075985",
    statBorder: "#0284c7",
    statKey: "quarterlytaxpro_last",
    statLabel: "Next deadline",
    statEmpty: "—",
    cta: "View Calendar",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/freelancer-stack.html",
    moreLabel: "Freelancer Stack $49",
    offlineMsg: "You're offline — open Quarterly Tax Deadline Pro if you've used it before",
    features: [
      "Next-deadline countdown with days remaining",
      "Full quarterly calendar by tax year",
      "Mark quarters paid — saved locally",
    ],
  },
  "profit-margin-calculator-pro": {
    title: "Profit Margin Calculator Pro",
    emoji: "📊",
    tagline: "Gross & net margins, markup, and break-even",
    themeColor: "#064e3b",
    bg: "#064e3b",
    text: "#ecfdf5",
    sub: "#6ee7b7",
    accent: "#fbbf24",
    btnBg: "#f59e0b",
    btnHover: "#d97706",
    statBg: "#065f46",
    statBorder: "#047857",
    statKey: "profitmarginpro_last",
    statLabel: "Last calculation",
    statEmpty: "—",
    cta: "Calculate Margins",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/freelancer-stack.html",
    moreLabel: "Freelancer Stack $49",
    offlineMsg: "You're offline — open Profit Margin Calculator Pro if you've used it before",
    features: [
      "Gross & net margin with dollar breakdown",
      "Markup on cost and per-unit margin",
      "Break-even units with fixed costs",
    ],
  },
  "break-even-calculator-pro": {
    title: "Break-Even Calculator Pro",
    emoji: "⚖️",
    tagline: "Units and revenue needed to cover fixed costs",
    themeColor: "#0c4a6e",
    bg: "#0c4a6e",
    text: "#f0f9ff",
    sub: "#7dd3fc",
    accent: "#fbbf24",
    btnBg: "#0284c7",
    btnHover: "#0369a1",
    statBg: "#075985",
    statBorder: "#0284c7",
    statKey: "breakevenpro_last",
    statLabel: "Last calculation",
    statEmpty: "—",
    cta: "Calculate Break-Even",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/freelancer-stack.html",
    moreLabel: "Freelancer Stack $49",
    offlineMsg: "You're offline — open Break-Even Calculator Pro if you've used it before",
    features: [
      "Break-even units and revenue target",
      "Contribution margin per unit",
      "Profit scenarios at 150, 200, 250 units",
    ],
  },
  "late-fee-calculator-pro": {
    title: "Late Fee Calculator Pro",
    emoji: "⏰",
    tagline: "Overdue invoice penalties with grace period & flat fees",
    themeColor: "#450a0a",
    bg: "#450a0a",
    text: "#fef2f2",
    sub: "#fca5a5",
    accent: "#fbbf24",
    btnBg: "#f59e0b",
    btnHover: "#d97706",
    statBg: "#7f1d1d",
    statBorder: "#991b1b",
    statKey: "latefeepro_last",
    statLabel: "Last calculation",
    statEmpty: "—",
    cta: "Calculate Late Fee",
    moreLink: "https://wealth-engine-0qlj.onrender.com/go/invoice.html",
    moreLabel: "BillSnap Invoices",
    offlineMsg: "You're offline — open Late Fee Calculator Pro if you've used it before",
    features: [
      "Monthly %, daily %, flat & compound modes",
      "Total due with effective daily rate",
      "60-day projection for escalation planning",
    ],
  },
  "markup-calculator-pro": {
    title: "Markup Calculator Pro",
    emoji: "🏷️",
    tagline: "Selling price, profit margin & multi-unit pricing",
    themeColor: "#312e81",
    bg: "#1e1b4b",
    text: "#eef2ff",
    sub: "#a5b4fc",
    accent: "#fbbf24",
    btnBg: "#4338ca",
    btnHover: "#3730a3",
    statBg: "#312e81",
    statBorder: "#4338ca",
    statKey: "markuppro_last",
    statLabel: "Last calculation",
    statEmpty: "—",
    cta: "Calculate Markup",
    moreLink: "https://wealth-engine-0qlj.onrender.com/profit-margin-calculator-pro/",
    moreLabel: "Profit Margin Pro",
    offlineMsg: "You're offline — open Markup Calculator Pro if you've used it before",
    features: [
      "Cost → price with markup & tax",
      "Profit per unit and margin breakdown",
      "Pro: reverse markup & tier pricing table",
    ],
  },
  "day-rate-calculator-pro": {
    title: "Day Rate to Hourly Calculator Pro",
    emoji: "📅",
    tagline: "Day rate, hourly rate & monthly freelance income",
    themeColor: "#78350f",
    bg: "#451a03",
    text: "#fffbeb",
    sub: "#fcd34d",
    accent: "#fbbf24",
    btnBg: "#92400e",
    btnHover: "#78350f",
    statBg: "#78350f",
    statBorder: "#92400e",
    statKey: "dayratepro_last",
    statLabel: "Last calculation",
    statEmpty: "—",
    cta: "Calculate Day Rate",
    moreLink: "https://wealth-engine-0qlj.onrender.com/hourly-rate-calculator-pro/",
    moreLabel: "Hourly Rate Pro",
    offlineMsg: "You're offline — open Day Rate Calculator Pro if you've used it before",
    features: [
      "Day rate → hourly & monthly revenue",
      "Billable hours and working days presets",
      "Pro: reverse pricing & project vs retainer",
    ],
  },
  "bill-splitter-pro": {
    title: "Bill Splitter Pro",
    emoji: "🍽️",
    tagline: "Split bills with tip, tax & per-person totals",
    themeColor: "#7c2d12",
    bg: "#431407",
    text: "#fff7ed",
    sub: "#fdba74",
    accent: "#fb923c",
    btnBg: "#9a3412",
    btnHover: "#7c2d12",
    statBg: "#7c2d12",
    statBorder: "#9a3412",
    statKey: "billsplitpro_last",
    statLabel: "Last split",
    statEmpty: "—",
    cta: "Split Bill",
    moreLink: "https://wealth-engine-0qlj.onrender.com/tip-calculator-pro/",
    moreLabel: "Tip Calculator Pro",
    offlineMsg: "You're offline — open Bill Splitter Pro if you've used it before",
    features: [
      "Equal split with tip presets & per-person breakdown",
      "Grand total, tip, and bill-per-person summary",
      "Pro: tax line, round-up & uneven custom splits",
    ],
  },
  "percentage-calculator-pro": {
    title: "Percentage Calculator Pro",
    emoji: "📊",
    tagline: "% of, change, compound & compare",
    themeColor: "#312e81",
    bg: "#1e1b4b",
    text: "#eef2ff",
    sub: "#a5b4fc",
    accent: "#818cf8",
    btnBg: "#4338ca",
    btnHover: "#312e81",
    statBg: "#312e81",
    statBorder: "#4338ca",
    statKey: "pctcalcpro_last",
    statLabel: "Last result",
    statEmpty: "—",
    cta: "Calculate",
    moreLink: "https://wealth-engine-0qlj.onrender.com/bill-splitter-pro/",
    moreLabel: "Bill Splitter Pro",
    offlineMsg: "You're offline — open Percentage Calculator Pro if you've used it before",
    features: [
      "X% of Y, what percent, and increase/decrease modes",
      "One-tap presets and shareable results",
      "Pro: reverse %, compound steps & value compare",
    ],
  },
};

function syncUtility(slug) {
  const shell = UTILITY_SHELLS[slug];
  if (!shell) {
    console.error(`Unknown utility slug: ${slug}`);
    process.exit(1);
  }
  const distSlug = shell.distSlug ?? slug;
  const wwwSlug = shell.wwwSlug ?? slug;
  const www = join(mobileRoot, slug, "www");
  const utilSrc = join(dist, distSlug);
  if (!existsSync(join(utilSrc, "index.html"))) {
    console.error(`Missing dist/${distSlug} — run npm run build first`);
    process.exit(1);
  }
  mkdirSync(www, { recursive: true });
  mkdirSync(join(www, wwwSlug), { recursive: true });
  if (shell.copyRecursive) {
    cpSync(utilSrc, join(www, wwwSlug), { recursive: true });
  } else {
    cpSync(join(utilSrc, "index.html"), join(www, wwwSlug, "index.html"));
    if (existsSync(join(utilSrc, "handlers.mjs"))) {
      cpSync(join(utilSrc, "handlers.mjs"), join(www, wwwSlug, "handlers.mjs"));
    }
  }

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${shell.title}</title>
<meta name="description" content="${shell.tagline}">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="${shell.themeColor}">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:${shell.bg};color:${shell.text};margin:0;padding:0 20px 40px;min-height:100vh;display:flex;flex-direction:column;align-items:center}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px;width:100%}
.offline.show{display:block}
h1{margin:32px 0 8px;font-size:1.6rem}
.sub{color:${shell.sub};text-align:center;margin-bottom:20px;max-width:340px;line-height:1.5}
.stat{background:${shell.statBg ?? "#fff"};border:2px solid ${shell.statBorder};border-radius:12px;padding:16px 28px;margin-bottom:16px;text-align:center;box-shadow:0 1px 3px rgba(15,23,42,.06)}
.stat span{font-size:1.4rem;font-weight:700;color:${shell.accent}}
.features{max-width:320px;margin-bottom:24px;font-size:14px;color:${shell.sub};line-height:1.6}
.features li{margin-bottom:6px}
.cta{display:inline-block;background:${shell.btnBg};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:1.1rem;margin-bottom:16px}
.cta:hover{background:${shell.btnHover}}
.links{font-size:13px;color:${shell.sub};margin-top:20px}
.links a{color:${shell.accent}}
</style></head><body>
<div id="offline-banner" class="offline" role="status">${shell.offlineMsg}</div>
<h1>${shell.emoji} ${shell.title}</h1>
<p class="sub">${shell.tagline}</p>
<div class="stat">${shell.statLabel}<br><span id="last-stat">${shell.statEmpty}</span></div>
<ul class="features">
${(shell.features ?? []).map((f) => `  <li>${f}</li>`).join("\n")}
</ul>
<a class="cta" href="${wwwSlug}/index.html">${shell.cta}</a>
<p class="links"><a href="privacy.html">Privacy</a> · <a href="${shell.moreLink}">${shell.moreLabel}</a></p>
<script>(function(){
  var KEY='${shell.statKey}';
  var el=document.getElementById('last-stat');
  ${shell.statRead ?? "try{var v=localStorage.getItem(KEY);if(el&&v)el.textContent=v}catch(e){}"}
  var banner=document.getElementById('offline-banner');
  function setOffline(){if(banner)banner.classList.toggle('show',!navigator.onLine)}
  window.addEventListener('online',setOffline);
  window.addEventListener('offline',setOffline);
  setOffline();
})();</script>
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);
  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });
  console.log(`Synced ${slug} → mobile/${slug}/www`);
}

function syncMiniGame(slug) {
  const shell = MINI_GAME_SHELLS[slug];
  if (!shell) {
    console.error(`Unknown mini-game slug: ${slug}`);
    process.exit(1);
  }
  const www = join(mobileRoot, slug, "www");
  const gameSrc = join(dist, "games", slug);
  if (!existsSync(join(gameSrc, "index.html"))) {
    console.error(`Missing dist/games/${slug} — run npm run build first`);
    process.exit(1);
  }
  mkdirSync(www, { recursive: true });
  mkdirSync(join(www, slug), { recursive: true });
  cpSync(join(gameSrc, "index.html"), join(www, slug, "index.html"));

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${shell.title}</title>
<meta name="description" content="${shell.tagline}">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="${shell.themeColor}">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">
<style>
body{font-family:system-ui,sans-serif;background:${shell.bg};color:${shell.text};margin:0;padding:0 20px 40px;min-height:100vh;display:flex;flex-direction:column;align-items:center}
.offline{display:none;background:#7f1d1d;color:#fecaca;text-align:center;padding:10px 16px;font-size:13px;width:100%}
.offline.show{display:block}
h1{margin:32px 0 8px;font-size:1.6rem}
.sub{color:${shell.sub};text-align:center;margin-bottom:20px;max-width:320px}
.best{background:rgba(255,255,255,.06);border:2px solid ${shell.bestBorder};border-radius:12px;padding:16px 28px;margin-bottom:24px;text-align:center}
.best span{font-size:2rem;font-weight:700;color:${shell.accent}}
.play{display:inline-block;background:${shell.btnBg};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:1.1rem;margin-bottom:16px}
.play:hover{background:${shell.btnHover}}
.links{font-size:13px;color:${shell.sub};margin-top:20px}
.links a{color:${shell.accent}}
</style></head><body>
<div id="offline-banner" class="offline" role="status">You're offline — tap Play if you've opened the game before</div>
<h1>${shell.emoji} ${shell.title}</h1>
<p class="sub">${shell.tagline}</p>
<div class="best">${shell.bestLabel ?? "Best score"}<br><span id="best-score">${shell.bestEmpty ?? "0"}</span></div>
<a class="play" href="${slug}/index.html">Play Now</a>
<p class="links"><a href="privacy.html">Privacy</a> · <a href="https://wealth-engine-0qlj.onrender.com/games/">More games</a></p>
<script>(function(){
  var KEY='${shell.bestKey}';
  var el=document.getElementById('best-score');
  try{var b=parseInt(localStorage.getItem(KEY)||'0',10);if(el)el.textContent=b&&!isNaN(b)?b:'${shell.bestEmpty ?? "0"}'}catch(e){}
  var banner=document.getElementById('offline-banner');
  function setOffline(){if(banner)banner.classList.toggle('show',!navigator.onLine)}
  window.addEventListener('online',setOffline);
  window.addEventListener('offline',setOffline);
  setOffline();
})();</script>
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);
  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });
  console.log(`Synced ${slug} → mobile/${slug}/www`);
}

ensureBuild();
if (target === "games" || target === "all") syncGames();
if (target === "tools" || target === "all") syncTools();
if (target === "freelancer-stack" || target === "all") syncFreelancerStack();
if (target === "devwatch" || target === "all") syncDevWatch();
if (target === "renter-toolkit" || target === "all") syncRenterToolkit();
if (target === "hookrelay-dlq" || target === "all") syncHookRelayDlq();
if (target === "1099-suite" || target === "all") sync1099Suite();
if (target === "statusping-agency" || target === "all") syncStatuspingAgency();
if (target === "ndagen-team" || target === "all") syncNdagenTeam();
if (target === "billsnap" || target === "all") syncUtility("billsnap");
if (target === "statusping-lite" || target === "all") syncUtility("statusping-lite");
if (target === "leaselens" || target === "all") syncUtility("leaselens");
if (target === "ndagen" || target === "all") syncUtility("ndagen");
if (target === "hookrelay" || target === "all") syncUtility("hookrelay");
if (target === "pipekit" || target === "all") syncUtility("pipekit");
if (target === "meetingcost" || target === "all") syncUtility("meetingcost");
if (target === "templateforge" || target === "all") syncUtility("templateforge");
if (target === "comparestack" || target === "all") syncUtility("comparestack");
if (target === "tip-calculator-pro" || target === "all") syncUtility("tip-calculator-pro");
if (target === "hourly-rate-calculator-pro" || target === "all") syncUtility("hourly-rate-calculator-pro");
if (target === "freelancer-tax-estimator" || target === "all") syncUtility("freelancer-tax-estimator");
if (target === "1099-threshold-tracker-pro" || target === "all") syncUtility("1099-threshold-tracker-pro");
if (target === "quarterly-tax-deadline-pro" || target === "all") syncUtility("quarterly-tax-deadline-pro");
if (target === "profit-margin-calculator-pro" || target === "all") syncUtility("profit-margin-calculator-pro");
if (target === "break-even-calculator-pro" || target === "all") syncUtility("break-even-calculator-pro");
if (target === "late-fee-calculator-pro" || target === "all") syncUtility("late-fee-calculator-pro");
if (target === "markup-calculator-pro" || target === "all") syncUtility("markup-calculator-pro");
if (target === "day-rate-calculator-pro" || target === "all") syncUtility("day-rate-calculator-pro");
if (target === "bill-splitter-pro" || target === "all") syncUtility("bill-splitter-pro");
if (target === "percentage-calculator-pro" || target === "all") syncUtility("percentage-calculator-pro");
if (target === "receipt-rush" || target === "all") syncMiniGame("receipt-rush");
if (target === "webhook-whack" || target === "all") syncMiniGame("webhook-whack");
if (target === "invoice-stack" || target === "all") syncMiniGame("invoice-stack");
if (target === "uptime-defender" || target === "all") syncMiniGame("uptime-defender");
if (target === "freelancer-memory" || target === "all") syncMiniGame("freelancer-memory");
if (target === "color-switch-snake" || target === "all") syncMiniGame("color-switch-snake");
if (target === "horseshoe-toss" || target === "all") syncMiniGame("horseshoe-toss");
if (target === "word-scramble-biz" || target === "all") syncMiniGame("word-scramble-biz");
if (target === "net-30-ninja" || target === "all") syncMiniGame("net-30-ninja");
if (target === "ssl-shield" || target === "all") syncMiniGame("ssl-shield");
if (target === "nda-speed-sign" || target === "all") syncMiniGame("nda-speed-sign");
if (target === "invoice-number-rush" || target === "all") syncMiniGame("invoice-number-rush");
