import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";

const PAGES = [
  {
    slug: "invoice",
    headline: "Invoice PDF in 30 seconds",
    sub: "No signup. Preview free. Watermark-free export for $3.",
    sku: "pro-pdf",
    tool: "/billsnap/index.html",
    bullets: ["Freelancers & contractors", "Print-ready PDF", "One-time payment"],
  },
  {
    slug: "lease",
    headline: "Is your lease trying to screw you?",
    sub: "Paste your lease. Get a risk score + red flags in seconds.",
    sku: "single-report",
    tool: "/leaselens/index.html",
    bullets: ["Rule-based analysis", "Not legal advice", "Full report $7"],
  },
  {
    slug: "uptime",
    headline: "Know before your customers do",
    sub: "Email alerts when your site goes down. From $5/mo.",
    sku: "basic-monthly",
    tool: "/statusping/index.html",
    bullets: ["5 monitors", "5-min checks", "Cancel anytime"],
  },
  {
    slug: "nda",
    headline: "NDA in 2 minutes — not 2 hours",
    sub: "Free preview. Clean PDF export for $4. No lawyer subscription.",
    sku: "nda-pdf",
    tool: "/ndagen/index.html",
    bullets: ["Freelancers & startups", "Mutual or one-way", "Instant download"],
  },
  {
    slug: "webhook",
    headline: "Never miss a webhook again",
    sub: "Forward, replay, and debug webhooks. From $7/mo.",
    sku: "relay-monthly",
    tool: "/hookrelay/index.html",
    bullets: ["3 endpoints included", "Dead-letter alerts", "Dev-friendly setup"],
  },
  {
    slug: "pipekit",
    headline: "Dev APIs without the bloat",
    sub: "UUID, hash, base64, JSON — self-serve keys from $9/mo.",
    sku: "starter-monthly",
    tool: "/devtools-api/index.html",
    bullets: ["100 free req/day", "API key in minutes", "No Postman required"],
  },
  {
    slug: "templates",
    headline: "Business templates that ship today",
    sub: "Compliance, hiring, and freelancer kits. Instant download after checkout.",
    sku: "freelancer-kit",
    tool: "/templateforge/index.html",
    bullets: ["Print-ready PDFs", "SMB & freelancer focus", "From $12"],
  },
];

export function buildHighConversionLandings() {
  const dist = join(getRoot(), "dist", "go");
  mkdirSync(dist, { recursive: true });
  const base = getPublicBaseUrl();
  const coupon = "LAUNCH25";

  for (const p of PAGES) {
    const pay = getPaymentLink(p.sku) ?? "#";
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${p.headline}</title>
<meta property="og:title" content="${p.headline}">
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{max-width:480px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:36px;text-align:center}
h1{font-size:clamp(26px,5vw,34px);margin-bottom:12px}p{color:#94a3b8;margin-bottom:20px;font-size:17px}
ul{text-align:left;margin:20px 0;color:#cbd5e1;font-size:14px}li{margin:8px 0}
.btn{display:block;background:#22c55e;color:#fff;text-decoration:none;padding:16px;border-radius:10px;font-weight:700;margin:10px 0;font-size:16px}
.btn.secondary{background:transparent;border:2px solid #22c55e;color:#22c55e}
.badge{background:#eab308;color:#000;font-size:11px;padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:16px;font-weight:700}
</style></head><body><div class="card">
<span class="badge">Use code ${coupon} at checkout</span>
<h1>${p.headline}</h1><p>${p.sub}</p><ul>${p.bullets.map((b) => `<li>✓ ${b}</li>`).join("")}</ul>
<a class="btn" href="${pay}" onclick="fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${p.sku}',path:'/go/${p.slug}'})})">Get pro access →</a>
<a class="btn secondary" href="${p.tool}?utm_source=landing">Try free first</a>
</div></body></html>`;
    writeFileSync(join(dist, `${p.slug}.html`), html);
  }
  return { pages: PAGES.length, base };
}
