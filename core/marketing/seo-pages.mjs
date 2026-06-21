import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";

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

  for (let i = 0; i < perCycle; i++) {
    const kw = config.keywords[(start + i) % config.keywords.length];
    const payLink = getPaymentLink(kw.sku) ?? "#";
    const venturePath = VENTURE_PATHS[kw.venture] ?? "/";
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(kw.title)} — Free + Pro</title>
<meta name="description" content="${esc(kw.title)}. Free preview. Instant pro upgrade via Stripe.">
<link rel="canonical" href="${base}/p/${kw.slug}.html">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: kw.title, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } })}</script>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6}
h1{font-size:clamp(24px,4vw,36px)}.cta{display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;margin:8px 8px 8px 0}
.cta.outline{background:#fff;color:#2563eb;border:2px solid #2563eb}</style></head><body>
<h1>${esc(kw.title)}</h1>
<p>Free preview available. Pro unlock via secure one-time or subscription checkout.</p>
<a class="cta" href="${venturePath}">Try free</a>
<a class="cta outline" href="${payLink}">Get pro access</a>
</body></html>`;
    writeFileSync(join(outDir, `${kw.slug}.html`), html);
    created.push({ slug: kw.slug, url: `/p/${kw.slug}.html` });
  }

  syncToDist(outDir);
  writeFileSync(join(getDataRoot(), "marketing", "seo-batch.json"), JSON.stringify({ created, at: new Date().toISOString() }, null, 2));
  return { created: created.length, slugs: created.map((c) => c.slug) };
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

export function listAllSeoUrls() {
  const dir = join(getDataRoot(), "seo-pages");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => `/p/${f}`);
}
