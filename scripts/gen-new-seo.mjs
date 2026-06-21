import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../core/env.mjs";
import { getPaymentLink } from "../core/commerce.mjs";

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

const slugs = [
  "ssl-certificate-expiry-monitor",
  "simple-receipt-generator-free",
  "scope-of-work-template-freelancer",
  "cron-job-monitor-alerts",
  "api-rate-limit-checker",
];

const config = JSON.parse(readFileSync(join(getRoot(), "config", "seo-keywords.json"), "utf8"));
const outDir = join(getDataRoot(), "seo-pages");
const distP = join(getRoot(), "dist", "p");
mkdirSync(outDir, { recursive: true });
mkdirSync(distP, { recursive: true });
const base = getPublicBaseUrl();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

for (const slug of slugs) {
  const kw = config.keywords.find((k) => k.slug === slug);
  if (!kw) {
    console.log("missing", slug);
    continue;
  }
  const payLink = getPaymentLink(kw.sku) ?? "#";
  const venturePath = VENTURE_PATHS[kw.venture] ?? "/";
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(kw.title)} — Free + Pro</title>
<meta name="description" content="${esc(kw.title)}. Free preview. Instant pro upgrade via Stripe.">
<link rel="canonical" href="${base}/p/${kw.slug}.html">
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6}
h1{font-size:clamp(24px,4vw,36px)}.cta{display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;margin:8px 8px 8px 0}
.cta.outline{background:#fff;color:#2563eb;border:2px solid #2563eb}</style></head><body>
<h1>${esc(kw.title)}</h1>
<p>Free preview available. Pro unlock via secure one-time or subscription checkout.</p>
<a class="cta" href="${venturePath}">Try free</a>
<a class="cta outline" href="${payLink}">Get pro access</a>
</body></html>`;
  writeFileSync(join(outDir, `${kw.slug}.html`), html);
  writeFileSync(join(distP, `${kw.slug}.html`), html);
  console.log("created", kw.slug);
}
