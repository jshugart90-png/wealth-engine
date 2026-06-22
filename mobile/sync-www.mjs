/**
 * Sync dist/ assets into Capacitor www folders.
 * Usage: node sync-www.mjs [games|tools|receipt-rush|webhook-whack|invoice-stack|horseshoe-toss|uptime-defender|freelancer-memory|color-switch-snake|word-scramble-biz|net-30-ninja|ssl-shield|all]
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
};

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
