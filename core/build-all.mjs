import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "fs";
import { join } from "path";
import { getRoot } from "./env.mjs";
import { getAllPaymentLinks } from "./commerce.mjs";

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

export function buildAll() {
  const dist = join(root, "dist");
  mkdirSync(dist, { recursive: true });

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
        const html = readFileSync(fp, "utf8");
        writeFileSync(fp, injectPaymentLinks(html, v.id));
      }
    }
    built.push(v.id);
  }

  // Portfolio hub
  const hub = buildPortfolioHub(built);
  writeFileSync(join(dist, "index.html"), hub);
  return { built, hub: join(dist, "index.html") };
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
  <a href="https://horseshoeroundme.com" target="_blank" rel="noopener">← Horseshoe Round Me</a>
</div>
<h1>Wealth Engine</h1>
<p class="sub">Autonomous venture portfolio — independent revenue channels</p>
<div class="quick">
  <a href="/go/invoice.html">🧾 Invoice landing</a>
  <a href="/bundles/freelancer-stack.html">📦 Freelancer bundle</a>
  <a href="/tools/tip-calculator.html">🔢 Tip calculator</a>
  <a href="/comparestack/index.html">Compare tools</a>
</div>
<div class="grid">${cards}</div>
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
