import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot } from "../../core/env.mjs";

const COMPARISONS = [
  {
    slug: "uptime-monitoring-tools",
    title: "Best Uptime Monitoring Tools (2026)",
    intro: "Compare pricing, alert channels, and free tiers for indie developers and small teams.",
    items: [
      { name: "StatusPing", best: true, price: "From $5/mo", pros: ["Email alerts", "5–50 monitors", "Simple setup"] },
      { name: "UptimeRobot", price: "Free tier", pros: ["50 monitors free", "Public status pages"] },
      { name: "Pingdom", price: "From $10/mo", pros: ["Enterprise features", "Detailed reports"] },
    ],
    cta: { text: "Try StatusPing", sku: "basic-monthly" },
  },
  {
    slug: "invoice-generators-freelancers",
    title: "Best Invoice Generators for Freelancers",
    intro: "Quick comparison of one-time vs subscription invoicing tools.",
    items: [
      { name: "BillSnap", best: true, price: "$3/PDF or $12/mo", pros: ["No account required", "Print-ready PDF", "Pay per use"] },
      { name: "Wave", price: "Free", pros: ["Full accounting", "US/Canada focus"] },
      { name: "FreshBooks", price: "From $19/mo", pros: ["Time tracking", "Client portal"] },
    ],
    cta: { text: "Create invoice — BillSnap", sku: "pro-pdf" },
  },
  {
    slug: "developer-api-toolkits",
    title: "Developer Micro-API Toolkits Compared",
    intro: "Utility APIs for JSON, hashing, encoding — self-serve pricing.",
    items: [
      { name: "PipeKit API", best: true, price: "From $9/mo", pros: ["UUID, hash, base64", "Generous free tier", "API key in minutes"] },
      { name: "Postman", price: "Free tier", pros: ["Full API platform", "Team collaboration"] },
    ],
    cta: { text: "Get PipeKit API key", sku: "starter-monthly" },
  },
];

const EXTRA_COMPARISONS = [
  {
    slug: "lease-analyzer-tools",
    title: "Best Lease Analyzer Tools (2026)",
    intro: "Compare tenant-focused lease review tools.",
    items: [
      { name: "LeaseLens", best: true, price: "$7/report", pros: ["Instant red flags", "Rule-based", "No signup preview"] },
      { name: "LegalZoom", price: "Varies", pros: ["Attorney network", "Full legal services"] },
    ],
    cta: { text: "Try LeaseLens", sku: "single-report" },
  },
  {
    slug: "nda-template-generators",
    title: "NDA Template Generators Compared",
    intro: "Quick NDA drafts for freelancers and startups.",
    items: [
      { name: "NDAGen", best: true, price: "$4 PDF", pros: ["Free preview", "Instant PDF", "Simple fields"] },
      { name: "Rocket Lawyer", price: "Subscription", pros: ["Attorney review", "Full library"] },
    ],
    cta: { text: "Generate NDA", sku: "nda-pdf" },
  },
];

export function refreshCompareStack() {
  return buildPages(COMPARISONS);
}

export function expandCompareStack() {
  const day = Math.floor(Date.now() / 86400000);
  const extra = EXTRA_COMPARISONS[day % EXTRA_COMPARISONS.length];
  const all = [...COMPARISONS];
  if (!all.find((c) => c.slug === extra.slug)) all.push(extra);
  return buildPages(all);
}

function buildPages(list) {
  const out = join(getRoot(), "ventures", "comparestack", "pages");
  mkdirSync(out, { recursive: true });
  for (const c of list) {
    writeFileSync(join(out, `${c.slug}.html`), pageHtml(c));
  }
  writeFileSync(join(getRoot(), "ventures", "comparestack", "index.html"), indexHtml(list));
  return { pages: list.length };
}

function indexHtml(comparisons) {
  const links = comparisons.map((c) => `<li><a href="pages/${c.slug}.html">${c.title}</a></li>`).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CompareStack — Honest Tool Comparisons</title>
<meta name="description" content="Independent comparison guides for SaaS, APIs, and freelancer tools.">
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222}
a{color:#2563eb} .disclaimer{font-size:12px;color:#888;margin-top:40px;border-top:1px solid #eee;padding-top:16px}</style></head>
<body><h1>CompareStack</h1><p>Data-driven comparison pages. We may earn from products we operate or recommend.</p>
<ul>${links}</ul>
<p class="disclaimer">Disclosure: CompareStack is operated by Wealth Engine. Some listed products are portfolio ventures with checkout links.</p>
</body></html>`;
}

function pageHtml(c) {
  const rows = c.items
    .map(
      (i) => `<tr${i.best ? ' class="best"' : ""}><td>${i.name}${i.best ? " ★" : ""}</td><td>${i.price}</td><td><ul>${i.pros.map((p) => `<li>${p}</li>`).join("")}</ul></td></tr>`
    )
    .join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${c.title}</title>
<meta name="description" content="${c.intro}">
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#222}
table{width:100%;border-collapse:collapse;margin:24px 0}td,th{border:1px solid #ddd;padding:12px;text-align:left;vertical-align:top}
th{background:#f5f5f5}.best{background:#eff6ff}
.cta{display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px}
.disclaimer{font-size:12px;color:#888;margin-top:32px}
</style></head><body>
<h1>${c.title}</h1><p>${c.intro}</p>
<table><tr><th>Tool</th><th>Pricing</th><th>Highlights</th></tr>${rows}</table>
<a class="cta" href="{{PAY:${c.cta.sku}}}">${c.cta.text}</a>
<p class="disclaimer">Affiliate disclosure: We operate ${c.items.find((i) => i.best)?.name ?? "listed products"}. Comparisons updated automatically.</p>
</body></html>`;
}
