import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";

const BUNDLES = [
  {
    slug: "freelancer-stack",
    title: "Freelancer Stack",
    desc: "BillSnap unlimited + Freelancer template kit",
    skus: ["unlimited-month", "freelancer-kit"],
    ventures: ["/billsnap/index.html", "/pdf-factory/index.html"],
  },
  {
    slug: "dev-ops-stack",
    title: "Dev Ops Stack",
    desc: "PipeKit Pro + StatusPing Team",
    skus: ["pro-monthly", "team-monthly"],
    ventures: ["/devtools-api/index.html", "/statusping/index.html"],
  },
  {
    slug: "landlord-tenant-stack",
    title: "Renter Toolkit",
    desc: "LeaseLens 3-pack + compliance templates",
    skus: ["report-bundle", "smb-compliance-pack"],
    ventures: ["/leaselens/index.html", "/pdf-factory/index.html"],
  },
];

export function buildBundleLandings() {
  const dist = join(getRoot(), "dist", "bundles");
  mkdirSync(dist, { recursive: true });
  const base = getPublicBaseUrl();

  for (const b of BUNDLES) {
    const links = b.skus.map((s) => getPaymentLink(s)).filter(Boolean);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${b.title} — Bundle</title>
<style>body{font-family:system-ui;max-width:640px;margin:40px auto;padding:20px}h1{color:#2563eb}
.btn{display:block;background:#2563eb;color:#fff;text-align:center;padding:14px;margin:10px 0;text-decoration:none;border-radius:8px}</style></head><body>
<h1>${b.title}</h1><p>${b.desc}</p>
<p>Buy each product — instant access:</p>
${links.map((l, i) => `<a class="btn" href="${l}">Get part ${i + 1} →</a>`).join("")}
<p><a href="/">← All products</a></p></body></html>`;
    writeFileSync(join(dist, `${b.slug}.html`), html);
  }
  return { bundles: BUNDLES.length };
}
