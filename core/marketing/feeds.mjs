import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getMarketingBaseUrl } from "../env.mjs";
import { getAllPaymentLinks } from "../commerce.mjs";

export function buildProductFeeds() {
  mkdirSync(join(getDataRoot(), "marketing"), { recursive: true });
  const base = getMarketingBaseUrl();
  const links = getAllPaymentLinks();
  const config = JSON.parse(readFileSync(join(getRoot(), "config", "ventures.json"), "utf8"));
  const stripeProducts = new Map(config.stripeProducts.map((p) => [p.sku, p]));

  const products = links.map((l) => {
    const venture = config.ventures.find((v) => v.id === l.venture_id);
    const product = stripeProducts.get(l.sku);
    return {
      id: l.sku,
      name: product?.name ?? humanizeSku(l.sku),
      venture: venture?.name ?? l.venture_id,
      priceUsd: product?.priceUsd ?? null,
      interval: product?.interval ?? null,
      checkoutUrl: l.payment_link,
      landing: `${base}${landingPathForSku(l.sku, l.venture_id)}`,
    };
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Wealth Engine Products</title>
<link>${base}</link>
<description>Micro-SaaS and digital products</description>
${products.map((p) => `<item><title>${esc(p.name)}</title><link>${p.landing}</link><guid>${p.id}</guid><description>${esc(`${p.venture}${p.priceUsd ? ` - $${p.priceUsd}${p.interval === "month" ? "/mo" : ""}` : ""}. Checkout: ${p.checkoutUrl}`)}</description><pubDate>${new Date().toUTCString()}</pubDate></item>`).join("\n")}
</channel></rss>`;

  writeFileSync(join(getRoot(), "dist", "feed.xml"), rss);
  writeFileSync(join(getRoot(), "dist", "products.json"), JSON.stringify({ products, updated: new Date().toISOString() }, null, 2));
  writeFileSync(join(getRoot(), "dist", "ai-products.json"), JSON.stringify({ site: base, products, updated: new Date().toISOString() }, null, 2));
  writeFileSync(join(getRoot(), "dist", "llms.txt"), buildLlmsTxt(base, products));
  return { products: products.length, feeds: ["/feed.xml", "/products.json", "/ai-products.json", "/llms.txt"] };
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function humanizeSku(sku) {
  return String(sku)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function landingPathForSku(sku, ventureId) {
  const map = {
    "pro-pdf": "/go/invoice.html",
    "unlimited-month": "/go/billsnap-pro.html",
    "stack-unlimited": "/go/stack.html",
    "freelancer-stack-bundle": "/go/freelancer.html",
    "single-report": "/go/lease.html",
    "report-bundle": "/go/lease.html",
    "smb-compliance-pack": "/go/compliance.html",
    "freelancer-kit": "/go/templates.html",
    "hiring-pack": "/go/hiring.html",
    "1099-suite-pro": "/go/1099-deadline.html",
    "basic-monthly": "/go/uptime.html",
    "devwatch-monthly": "/go/devwatch.html",
    "agency-monthly": "/go/statusping-agency.html",
    "meeting-pro": "/go/meeting.html",
    "nda-pdf": "/go/nda.html",
    "ndagen-team-monthly": "/go/nda-team.html",
    "relay-monthly": "/go/webhook.html",
    "hookrelay-pro": "/go/hookrelay-dlq.html",
    "starter-monthly": "/go/pipekit.html",
    "pro-monthly": "/go/pipekit-pro.html",
  };
  if (map[sku]) return map[sku];
  return `/${ventureId === "pdf-factory" ? "templateforge" : ventureId}/index.html`;
}

function buildLlmsTxt(base, products) {
  const lines = [
    "# Wealth Engine",
    "",
    "Wealth Engine is a portfolio of low-cost freelancer, small business, developer, compliance, monitoring, and document tools with self-serve Stripe checkout.",
    "",
    "## Important URLs",
    `- Home: ${base}/`,
    `- Product feed: ${base}/products.json`,
    `- AI product feed: ${base}/ai-products.json`,
    `- Sitemap: ${base}/sitemap.xml`,
    `- BillSnap Pro: ${base}/go/billsnap-pro.html`,
    `- Invoice PDF: ${base}/go/invoice.html`,
    `- Freelancer Stack: ${base}/go/stack.html`,
    `- Compliance Pack: ${base}/go/compliance.html`,
    "",
    "## Products",
    ...products.map((p) => `- ${p.name}: ${p.landing} (${p.priceUsd ? `$${p.priceUsd}${p.interval === "month" ? "/mo" : ""}` : "see page"})`),
    "",
  ];
  return `${lines.join("\n")}\n`;
}
