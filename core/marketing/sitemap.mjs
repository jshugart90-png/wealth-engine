import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "fs";
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
  "/bundles/devwatch.html",
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
  "/go/compliance.html",
  "/go/contractor.html",
  "/p/freelancer-compliance-by-state.html",
  "/tools/index.html",
  "/tools/sales-tax-calculator.html",
  "/tools/payment-terms-calculator.html",
  "/tools/compound-interest-calculator.html",
  "/tools/overtime-pay-calculator.html",
  "/tools/bill-splitter.html",
  "/tools/discount-calculator.html",
  "/tools/break-even-calculator.html",
  "/tools/unit-price-calculator.html",
  "/tools/ssl-expiry-checker.html",
  "/tools/cron-schedule-helper.html",
  "/tools/quarterly-tax-deadline-calendar.html",
  "/tools/1099-payment-threshold-tracker.html",
  "/tools/day-rate-to-hourly-calculator.html",
  "/tools/1099-tax-estimator.html",
  "/tools/rent-affordability-calculator.html",
  "/go/devwatch.html",
  "/go/meeting-cost-team.html",
  "/go/nda-team.html",
  "/go/meeting-team.html",
  "/go/statusping-agency.html",
  "/go/1099-deadline.html",
  "/go/pipekit-pro.html",
  "/privacy.html",
  "/join.html",
  "/refer.html",
  "/partners/index.html",
  "/tools/hourly-rate.html",
  "/feed.xml",
  "/comparestack/index.html",
  "/meetingcost/index.html",
  "/ndagen/index.html",
  "/hookrelay/index.html",
];

function listCompareStackUrls() {
  const pagesDir = join(getRoot(), "ventures", "comparestack", "pages");
  if (!existsSync(pagesDir)) return [];
  return readdirSync(pagesDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => `/comparestack/pages/${f}`);
}

export function buildSitemap() {
  const base = getPublicBaseUrl();
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [...STATIC_PATHS, ...listCompareStackUrls(), ...listAllSeoUrls()];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u.replace(/\/index\.html$/, "/").replace(/([^/])$/, "$1")}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq></url>`).join("\n")}
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
