import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot } from "../../core/env.mjs";

const PRODUCTS = [
  {
    id: "smb-compliance-pack",
    name: "SMB Compliance Starter Pack",
    price: 19,
    files: ["employee-handbook-outline.html", "incident-log.html", "vendor-checklist.html"],
  },
  {
    id: "freelancer-kit",
    name: "Freelancer Business Kit",
    price: 14,
    files: ["contract-template.html", "invoice-tracker.html", "client-onboarding.html"],
  },
  {
    id: "hiring-pack",
    name: "Small Team Hiring Pack",
    price: 12,
    files: ["job-description-templates.html", "interview-scorecard.html", "offer-checklist.html"],
  },
];

export function refreshPdfCatalog() {
  const root = join(getRoot(), "ventures", "pdf-factory", "catalog");
  mkdirSync(root, { recursive: true });

  for (const p of PRODUCTS) {
    const dir = join(root, p.id);
    mkdirSync(dir, { recursive: true });
    for (const f of p.files) {
      const fp = join(dir, f);
      if (!existsSync(fp)) writeFileSync(fp, genericTemplate(p.name, f));
    }
    writeFileSync(join(dir, "README.txt"), `${p.name}\nPrice: $${p.price}\nFiles: ${p.files.join(", ")}\n`);
  }

  const indexHtml = buildStorefront(PRODUCTS);
  writeFileSync(join(getRoot(), "ventures", "pdf-factory", "index.html"), indexHtml);
  return { products: PRODUCTS.length, path: root };
}

function genericTemplate(productName, fileName) {
  const title = fileName.replace(/-/g, " ").replace(".html", "");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>@page{margin:.6in}body{font-family:system-ui,sans-serif;font-size:11px;line-height:1.4;color:#111}
h1{font-size:18px;border-bottom:2px solid #333}h2{font-size:13px;margin-top:16px}ul{margin:8px 0}li{margin:4px 0}</style></head>
<body><h1>${title} — ${productName}</h1>
<p>Print-ready template. Fill fields, save PDF via browser print.</p>
<h2>Checklist</h2><ul>
<li>☐ Review with legal counsel if binding</li><li>☐ Customize for your jurisdiction</li><li>☐ Version and date all changes</li>
<li>☐ Store signed copies securely</li><li>☐ Schedule annual review</li></ul>
<h2>Notes</h2><p style="border:1px solid #ccc;min-height:120px;padding:8px"></p>
<p style="font-size:9px;color:#888;margin-top:24px">TemplateForge · Not legal advice</p></body></html>`;
}

function buildStorefront(products) {
  const cards = products
    .map(
      (p) => `<a class="card" href="{{PAY:${p.id === "smb-compliance-pack" ? "smb-compliance-pack" : p.id === "freelancer-kit" ? "freelancer-kit" : "hiring-pack"}}}" data-kit="${p.name}">
      <h2>${p.name}</h2><p>${p.files.length} print-ready templates</p><span class="price">$${p.price}</span></a>`
    )
    .join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TemplateForge — Business Document Kits</title>
<meta name="description" content="Print-ready business templates for freelancers and small teams. Instant download.">
<style>
body{font-family:system-ui,sans-serif;background:#fafafa;margin:0;padding:40px 20px;color:#111}
h1{text-align:center} .sub{text-align:center;color:#666;margin-bottom:32px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;max-width:900px;margin:0 auto}
.card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:24px;text-decoration:none;color:inherit}
.card:hover{border-color:#2563eb}.price{color:#2563eb;font-weight:bold;margin-top:12px;display:block}
</style></head><body>
<h1>TemplateForge</h1><p class="sub">Business document kits — no subscription, instant delivery</p>
<div class="grid">${cards}</div>
<script>document.querySelectorAll('.card[data-kit]').forEach(function(c){c.addEventListener('click',function(){try{localStorage.setItem('templateforge_last_kit',c.getAttribute('data-kit'))}catch(e){}})});</script>
</body></html>`;
}
