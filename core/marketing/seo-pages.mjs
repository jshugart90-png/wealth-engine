import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";
import { AFFILIATE_REF_SCRIPT } from "./affiliates.mjs";
import { checkoutClickScript, visitTrackerScript } from "./monetization.mjs";

const VENTURE_PATHS = {
  billsnap: "/billsnap/index.html",
  leaselens: "/leaselens/index.html",
  "devtools-api": "/devtools-api/index.html",
  statusping: "/statusping/index.html",
  "pdf-factory": "/templateforge/index.html",
  comparestack: "/comparestack/index.html",
  meetingcost: "/meetingcost/index.html",
  ndagen: "/ndagen/index.html",
  hookrelay: "/hookrelay/index.html",
};

export function generateSeoPages() {
  const config = JSON.parse(readFileSync(join(getRoot(), "config", "seo-keywords.json"), "utf8"));
  const outDir = join(getDataRoot(), "seo-pages");
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(getDataRoot(), "marketing"), { recursive: true });

  const dayIndex = Math.floor(Date.now() / 86400000);
  const perCycle = config.pagesPerCycle ?? 3;
  const start = (dayIndex * perCycle) % config.keywords.length;
  const base = getPublicBaseUrl();
  const created = [];

  // Generate all keywords so prod sitemap stays complete (rotation still logged)
  const toGenerate = config.keywords;

  for (let i = 0; i < toGenerate.length; i++) {
    const kw = toGenerate[i];
    const payLink = getPaymentLink(kw.sku) ?? "#";
    const venturePath = VENTURE_PATHS[kw.venture] ?? "/";
    const pagePath = `/p/${kw.slug}.html`;
    const primaryLanding = landingForKeyword(kw);
    const metaDesc = kw.metaDescription ?? `${kw.title} — free preview, instant pro upgrade. No account required. Use LAUNCH25 for 25% off.`;
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(kw.title)} — Free Preview + Pro (2026)</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${base}${pagePath}">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: kw.title, description: metaDesc, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } })}</script>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6}
h1{font-size:clamp(24px,4vw,36px)}.cta{display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;margin:8px 8px 8px 0}
.cta.outline{background:#fff;color:#2563eb;border:2px solid #2563eb}
.money{background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;margin:22px 0}
.money strong{color:#166534}
.email-cap{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:24px 0}
.links{font-size:14px;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0}
.links a{margin-right:12px}</style></head><body>
<h1>${esc(kw.title)}</h1>
<p>Free preview available. Pro unlock via secure Stripe checkout — no account required and no long-term contract.</p>
<div class="money"><strong>Need this today?</strong> LAUNCH25 is prefilled on checkout links for 25% off. Start with the free preview, then unlock the PDF/template/API key when it is useful.</div>
<a class="cta" href="${venturePath}">Try free</a>
<a class="cta outline" href="${payLink}" onclick="${checkoutClickScript(kw.sku, pagePath)}">Get pro access</a>
<a class="cta outline" href="${primaryLanding}?utm_source=seo&utm_campaign=${kw.slug}">See the focused landing</a>
<div class="email-cap"><strong>Get LAUNCH25 deals</strong>
<form onsubmit="event.preventDefault();fetch('/api/funnel/email_capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:this.email.value,path:'/p/${kw.slug}'})}).then(()=>this.querySelector('.ok').style.display='block')">
<input type="email" name="email" placeholder="you@email.com" required style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:6px;margin:8px 0">
<button type="submit" style="padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer">Join list</button>
<p class="ok" style="display:none;color:#059669;margin-top:8px">✓ Subscribed.</p></form></div>
<div class="links"><a href="/go/billsnap-pro.html">BillSnap Pro</a><a href="/go/invoice.html">Invoice PDF</a><a href="/tools/index.html">Free tools</a><a href="/comparestack/index.html">Compare tools</a><a href="/p/freelancer-compliance-by-state.html">State compliance</a><a href="${primaryLanding}">Pro landing</a></div>
<script>${AFFILIATE_REF_SCRIPT}</script>
<script>${visitTrackerScript(pagePath)}</script>
</body></html>`;
    writeFileSync(join(outDir, `${kw.slug}.html`), html);
    created.push({ slug: kw.slug, url: `/p/${kw.slug}.html` });
  }

  syncToDist(outDir);
  const cycleSlugs = [];
  for (let i = 0; i < perCycle; i++) {
    cycleSlugs.push(config.keywords[(start + i) % config.keywords.length].slug);
  }
  writeFileSync(join(getDataRoot(), "marketing", "seo-batch.json"), JSON.stringify({ created, cycleSlugs, at: new Date().toISOString() }, null, 2));
  return { created: created.length, slugs: created.map((c) => c.slug), cycleSlugs };
}

function syncToDist(seoDir) {
  const distP = join(getRoot(), "dist", "p");
  mkdirSync(distP, { recursive: true });
  for (const f of readdirSync(seoDir).filter((x) => x.endsWith(".html"))) {
    writeFileSync(join(distP, f), readFileSync(join(seoDir, f)));
  }
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function landingForKeyword(kw) {
  if (kw.venture === "billsnap") return kw.sku === "unlimited-month" ? "/go/billsnap-pro.html" : "/go/invoice.html";
  if (kw.venture === "leaselens") return "/go/lease.html";
  if (kw.venture === "statusping") return kw.sku === "devwatch-monthly" ? "/go/devwatch.html" : "/go/uptime.html";
  if (kw.venture === "devtools-api") return kw.sku === "pro-monthly" ? "/go/pipekit-pro.html" : "/go/pipekit.html";
  if (kw.venture === "ndagen") return kw.sku === "ndagen-team-monthly" ? "/go/nda-team.html" : "/go/nda.html";
  if (kw.venture === "hookrelay") return kw.sku === "hookrelay-pro" ? "/go/hookrelay-dlq.html" : "/go/webhook.html";
  if (kw.venture === "meetingcost") return "/go/meeting.html";
  if (kw.venture === "pdf-factory") return kw.sku === "1099-suite-pro" ? "/go/1099-deadline.html" : "/go/templates.html";
  return "/go/freelancer.html";
}

export function listAllSeoUrls() {
  const dir = join(getDataRoot(), "seo-pages");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => `/p/${f}`);
}
