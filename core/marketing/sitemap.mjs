import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { listAllSeoUrls } from "./seo-pages.mjs";

const STATIC_PATHS = [
  "/",
  "/billsnap/index.html",
  "/leaselens/index.html",
  "/devtools-api/index.html",
  "/statusping/index.html",
  "/templateforge/index.html",
  "/go/invoice.html",
  "/go/billsnap-pro.html",
  "/go/lease.html",
  "/go/uptime.html",
  "/go/nda.html",
  "/go/webhook.html",
  "/go/hookrelay-dlq.html",
  "/go/freelancer.html",
  "/go/stack.html",
  "/hookrelay/pricing.html",
  "/go/pipekit.html",
  "/bundles/freelancer-stack.html",
  "/bundles/dev-ops-stack.html",
  "/bundles/landlord-tenant-stack.html",
  "/tools/tip-calculator.html",
  "/tools/meeting-cost-free.html",
  "/tools/percentage-calculator.html",
  "/tools/hourly-rate-calculator.html",
  "/tools/profit-margin-calculator.html",
  "/tools/invoice-number-generator.html",
  "/tools/markup-calculator.html",
  "/tools/late-fee-calculator.html",
  "/go/templates.html",
  "/go/meeting.html",
  "/go/receipt.html",
  "/go/hiring.html",
  "/tools/roi-calculator.html",
  "/go/compare.html",
  "/tools/index.html",
  "/tools/sales-tax-calculator.html",
  "/tools/payment-terms-calculator.html",
  "/tools/compound-interest-calculator.html",
  "/tools/overtime-pay-calculator.html",
  "/tools/bill-splitter.html",
  "/tools/discount-calculator.html",
  "/tools/break-even-calculator.html",
  "/tools/unit-price-calculator.html",
  "/tools/index.html",
  "/tools/hourly-rate.html",
  "/privacy.html",
  "/join.html",
  "/refer.html",
  "/feed.xml",
  "/comparestack/index.html",
  "/meetingcost/index.html",
  "/ndagen/index.html",
  "/hookrelay/index.html",
  "/comparestack/pages/uptime-monitoring-tools.html",
  "/comparestack/pages/invoice-generators-freelancers.html",
  "/comparestack/pages/developer-api-toolkits.html",
];

export function buildSitemap() {
  const base = getPublicBaseUrl();
  const urls = [...STATIC_PATHS, ...listAllSeoUrls()];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u.replace(/\/index\.html$/, "/").replace(/([^/])$/, "$1")}</loc><changefreq>daily</changefreq></url>`).join("\n")}
</urlset>`;
  const distPath = join(getRoot(), "dist", "sitemap.xml");
  writeFileSync(distPath, xml);
  writeFileSync(join(getDataRoot(), "marketing", "sitemap.xml"), xml);
  return { urls: urls.length, path: "/sitemap.xml" };
}

export function buildRobotsTxt() {
  const base = getPublicBaseUrl();
  const txt = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;
  writeFileSync(join(getRoot(), "dist", "robots.txt"), txt);
  return { path: "/robots.txt" };
}

export async function pingSearchEngines() {
  const base = getPublicBaseUrl();
  const sitemapUrl = encodeURIComponent(`${base}/sitemap.xml`);
  const pings = [];
  try {
    const g = await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`);
    pings.push({ engine: "google", status: g.status });
  } catch (e) {
    pings.push({ engine: "google", error: e.message });
  }
  try {
    const b = await fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`);
    pings.push({ engine: "bing", status: b.status });
  } catch (e) {
    pings.push({ engine: "bing", error: e.message });
  }
  writeFileSync(join(getDataRoot(), "marketing", "ping-log.json"), JSON.stringify({ pings, at: new Date().toISOString() }, null, 2));
  return { pings };
}
