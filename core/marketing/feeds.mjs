import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { getAllPaymentLinks } from "../commerce.mjs";

export function buildProductFeeds() {
  mkdirSync(join(getDataRoot(), "marketing"), { recursive: true });
  const base = getPublicBaseUrl();
  const links = getAllPaymentLinks();
  const config = JSON.parse(readFileSync(join(getRoot(), "config", "ventures.json"), "utf8"));

  const products = links.map((l) => {
    const venture = config.ventures.find((v) => v.id === l.venture_id);
    return {
      id: l.sku,
      name: l.sku,
      venture: venture?.name ?? l.venture_id,
      url: l.payment_link,
      landing: `${base}/${l.venture_id === "pdf-factory" ? "pdf-factory" : l.venture_id}/index.html`,
    };
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Wealth Engine Products</title>
<link>${base}</link>
<description>Micro-SaaS and digital products</description>
${products.map((p) => `<item><title>${esc(p.name)}</title><link>${p.url}</link><description>${esc(p.venture)}</description></item>`).join("\n")}
</channel></rss>`;

  writeFileSync(join(getRoot(), "dist", "feed.xml"), rss);
  writeFileSync(join(getRoot(), "dist", "products.json"), JSON.stringify({ products, updated: new Date().toISOString() }, null, 2));
  return { products: products.length, feeds: ["/feed.xml", "/products.json"] };
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
