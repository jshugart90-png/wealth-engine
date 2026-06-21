import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";

const BUNDLES = [
  {
    slug: "freelancer-stack",
    title: "Freelancer Revenue Stack",
    desc: "Invoice → contract → NDA in one stack. Unlimited PDFs, templates, and exports.",
    primarySku: "stack-unlimited",
    primaryLabel: "Stack Unlimited — $29/mo",
    primarySub: "BillSnap unlimited + TemplateForge + NDAGen. Cancel anytime.",
    bundleSku: "freelancer-stack-bundle",
    bundleLabel: "Stack Bundle — $49 one-time",
    bundleSub: "30-day unlimited + freelancer kit + NDA PDF pack. Best for new freelancers.",
    ventures: [
      { name: "BillSnap", path: "/billsnap/index.html", desc: "Invoice & receipt PDFs" },
      { name: "TemplateForge", path: "/templateforge/index.html", desc: "Contracts & proposals" },
      { name: "NDAGen", path: "/ndagen/index.html", desc: "One-way & mutual NDAs" },
    ],
    adLanding: "/go/freelancer.html",
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
    ventures: ["/leaselens/index.html", "/templateforge/index.html"],
  },
];

function buildFreelancerStackHtml(b, base) {
  const subLink = getPaymentLink(b.primarySku) ?? "#";
  const bundleLink = getPaymentLink(b.bundleSku) ?? "#";
  const ventureCards = b.ventures
    .map(
      (v) =>
        `<a class="tool" href="${base}${v.path}"><strong>${v.name}</strong><span>${v.desc}</span></a>`
    )
    .join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${b.title} — $29/mo unlimited</title>
<meta name="description" content="${b.desc} Use code LAUNCH25 at checkout.">
<style>
body{font-family:system-ui;max-width:720px;margin:40px auto;padding:20px;line-height:1.5;color:#1e293b}
h1{color:#2563eb;font-size:clamp(28px,5vw,36px);margin-bottom:8px}
.lead{color:#64748b;font-size:18px;margin-bottom:24px}
.badge{background:#eab308;color:#000;font-size:11px;padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:12px;font-weight:700}
.plans{display:grid;gap:16px;margin:24px 0}
.plan{border:2px solid #e2e8f0;border-radius:12px;padding:20px}
.plan.featured{border-color:#2563eb;background:#f8fafc}
.plan h2{margin:0 0 6px;font-size:20px}
.plan p{margin:0 0 14px;color:#64748b;font-size:14px}
.btn{display:block;background:#2563eb;color:#fff;text-align:center;padding:14px;text-decoration:none;border-radius:8px;font-weight:600}
.btn.secondary{background:#fff;color:#2563eb;border:2px solid #2563eb}
.tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:28px 0}
.tool{display:block;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-decoration:none;color:inherit}
.tool:hover{border-color:#2563eb}
.tool strong{display:block;color:#2563eb;margin-bottom:4px}
.tool span{font-size:13px;color:#64748b}
.footer{margin-top:32px;font-size:14px;color:#64748b}
</style></head><body>
<span class="badge">LAUNCH25 — 25% off at checkout</span>
<h1>${b.title}</h1>
<p class="lead">${b.desc}</p>
<div class="plans">
  <div class="plan featured">
    <h2>${b.primaryLabel}</h2>
    <p>${b.primarySub}</p>
    <a class="btn" href="${subLink}" onclick="fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${b.primarySku}',path:'/bundles/freelancer-stack'})})">Start unlimited →</a>
  </div>
  <div class="plan">
    <h2>${b.bundleLabel}</h2>
    <p>${b.bundleSub}</p>
    <a class="btn secondary" href="${bundleLink}" onclick="fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${b.bundleSku}',path:'/bundles/freelancer-stack'})})">Get bundle →</a>
  </div>
</div>
<h2>Included tools — try free first</h2>
<div class="tools">${ventureCards}</div>
<p class="footer"><a href="${base}${b.adLanding}">Ad landing →</a> · <a href="${base}/go/invoice.html">Invoice only $3</a> · <a href="${base}/">← All products</a></p>
<p style="font-size:12px;color:#94a3b8">Templates are not legal advice. Instant delivery after Stripe checkout.</p>
</body></html>`;
}

function buildSimpleBundleHtml(b, base) {
  const links = b.skus.map((s) => getPaymentLink(s)).filter(Boolean);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${b.title} — Bundle</title>
<meta name="description" content="${b.desc}. Use code LAUNCH25 at checkout.">
<style>body{font-family:system-ui;max-width:640px;margin:40px auto;padding:20px}h1{color:#2563eb}
.badge{background:#eab308;color:#000;font-size:11px;padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:12px;font-weight:700}
.btn{display:block;background:#2563eb;color:#fff;text-align:center;padding:14px;margin:10px 0;text-decoration:none;border-radius:8px;font-weight:600}
.btn.secondary{background:#fff;color:#2563eb;border:2px solid #2563eb}</style></head><body>
<span class="badge">LAUNCH25 — 25% off at checkout</span>
<h1>${b.title}</h1><p>${b.desc}</p>
<p>Buy each product — instant access:</p>
${links.map((l, i) => `<a class="btn" href="${l}">Get part ${i + 1} →</a>`).join("")}
<a class="btn secondary" href="${base}/go/invoice.html">Or start with Invoice PDF $3 →</a>
<p style="margin-top:24px"><a href="${base}/">← All products</a></p></body></html>`;
}

export function buildBundleLandings() {
  const dist = join(getRoot(), "dist", "bundles");
  mkdirSync(dist, { recursive: true });
  const base = getPublicBaseUrl();

  for (const b of BUNDLES) {
    const html =
      b.slug === "freelancer-stack" ? buildFreelancerStackHtml(b, base) : buildSimpleBundleHtml(b, base);
    writeFileSync(join(dist, `${b.slug}.html`), html);
  }
  return { bundles: BUNDLES.length };
}
