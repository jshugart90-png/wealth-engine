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
    cta: { text: "Try StatusPing", sku: "basic-monthly", landing: "/go/uptime.html" },
  },
  {
    slug: "invoice-generators-freelancers",
    title: "Best Invoice Generators for Freelancers",
    intro: "Quick comparison of one-time vs subscription invoicing tools.",
    items: [
      { name: "BillSnap", best: true, price: "$3/PDF or $29/mo Pro", pros: ["No account required", "Print-ready PDF", "Pay per use or unlimited"] },
      { name: "Wave", price: "Free", pros: ["Full accounting", "US/Canada focus"] },
      { name: "FreshBooks", price: "From $19/mo", pros: ["Time tracking", "Client portal"] },
    ],
    cta: { text: "Create invoice — BillSnap", sku: "pro-pdf", landing: "/go/invoice.html" },
  },
  {
    slug: "developer-api-toolkits",
    title: "Developer Micro-API Toolkits Compared",
    intro: "Utility APIs for JSON, hashing, encoding — self-serve pricing.",
    items: [
      { name: "PipeKit API", best: true, price: "From $9/mo", pros: ["UUID, hash, base64", "Generous free tier", "API key in minutes"] },
      { name: "Postman", price: "Free tier", pros: ["Full API platform", "Team collaboration"] },
    ],
    cta: { text: "Get PipeKit API key", sku: "starter-monthly", landing: "/go/pipekit.html" },
  },
  {
    slug: "lease-analyzer-tools",
    title: "Best Lease Analyzer Tools (2026)",
    intro: "Compare tenant-focused lease review tools.",
    items: [
      { name: "LeaseLens", best: true, price: "$7/report", pros: ["Instant red flags", "Rule-based", "No signup preview"] },
      { name: "LegalZoom", price: "Varies", pros: ["Attorney network", "Full legal services"] },
    ],
    cta: { text: "Try LeaseLens", sku: "single-report", landing: "/go/lease.html" },
  },
  {
    slug: "nda-template-generators",
    title: "NDA Template Generators Compared",
    intro: "Quick NDA drafts for freelancers and startups.",
    items: [
      { name: "NDAGen", best: true, price: "$4 PDF", pros: ["Free preview", "Instant PDF", "Simple fields"] },
      { name: "Rocket Lawyer", price: "Subscription", pros: ["Attorney review", "Full library"] },
    ],
    cta: { text: "Generate NDA", sku: "nda-pdf", landing: "/go/nda.html" },
  },
  {
    slug: "webhook-relay-tools",
    title: "Webhook Relay & Testing Tools Compared",
    intro: "Forward, replay, and debug webhooks for indie SaaS.",
    items: [
      { name: "HookRelay DLQ Pro", best: true, price: "$29/mo", pros: ["25K events/mo", "Dead-letter queue", "One-click replay"] },
      { name: "Hookdeck", price: "From $39/mo", pros: ["Enterprise features", "Team collaboration"] },
      { name: "webhook.site", price: "Free", pros: ["Instant test URL", "No signup"] },
    ],
    cta: { text: "Try HookRelay DLQ Pro", sku: "hookrelay-pro", landing: "/go/webhook.html" },
  },
  {
    slug: "freelancer-business-stacks",
    title: "Freelancer Business Tool Stacks Compared",
    intro: "Invoice + contract + NDA bundles vs separate subscriptions.",
    items: [
      { name: "Freelancer Revenue Stack", best: true, price: "$29/mo or $49 bundle", pros: ["BillSnap unlimited", "14 templates", "NDA generator"] },
      { name: "FreshBooks", price: "From $19/mo", pros: ["Full accounting", "Time tracking"] },
      { name: "FreelancePro Toolkit", price: "$79 one-time", pros: ["Static PDF pack", "No live generators"] },
    ],
    cta: { text: "Get Freelancer Stack", sku: "stack-unlimited", landing: "/go/stack.html" },
  },
  {
    slug: "ssl-monitoring-tools",
    title: "SSL Certificate Monitoring Tools Compared",
    intro: "Get email alerts before your SSL cert expires and takes your site offline.",
    items: [
      { name: "DevWatch Bundle", best: true, price: "$39/mo", pros: ["SSL + uptime + cron", "25 monitors", "Unified alerts"] },
      { name: "SSLNudge", price: "From $17/mo", pros: ["SSL-only focus", "Multi-domain"] },
      { name: "UptimeRobot", price: "Free tier", pros: ["Basic SSL check", "50 monitors free"] },
    ],
    cta: { text: "Try DevWatch", sku: "devwatch-monthly", landing: "/go/devwatch.html" },
  },
  {
    slug: "cron-job-monitoring-tools",
    title: "Cron Job Monitoring Tools Compared",
    intro: "Heartbeat monitoring for scheduled tasks, backups, and batch jobs.",
    items: [
      { name: "DevWatch Bundle", best: true, price: "$39/mo", pros: ["20 cron jobs", "Email + Slack alerts", "Uptime included"] },
      { name: "Healthchecks.io", price: "From $20/mo", pros: ["Cron-focused", "Grace periods"] },
      { name: "Cronitor", price: "From $24/mo", pros: ["Cron + uptime", "Team features"] },
    ],
    cta: { text: "Monitor cron jobs", sku: "devwatch-monthly", landing: "/go/devwatch.html" },
  },
  {
    slug: "business-template-bundles",
    title: "Business Template Bundles Compared",
    intro: "Freelancer and SMB document packs — instant download vs subscriptions.",
    items: [
      { name: "TemplateForge", best: true, price: "From $12", pros: ["Instant PDF download", "Freelancer + compliance kits", "LAUNCH25 discount"] },
      { name: "Canva Pro", price: "$15/mo", pros: ["Design templates", "Brand kit"] },
      { name: "LegalZoom", price: "Subscription", pros: ["Attorney network", "Legal review"] },
    ],
    cta: { text: "Browse templates", sku: "freelancer-kit", landing: "/go/freelancer.html" },
  },
  {
    slug: "cheap-invoice-apps",
    title: "Cheapest Invoice Apps for Freelancers (2026)",
    intro: "One-time PDF vs monthly subscriptions — total cost comparison.",
    items: [
      { name: "BillSnap", best: true, price: "$3/PDF or $29/mo stack", pros: ["No signup", "Pay per use", "Stack includes templates"] },
      { name: "Invoice Ninja", price: "Free tier", pros: ["Self-hosted option", "Client portal"] },
      { name: "QuickBooks", price: "From $30/mo", pros: ["Full accounting", "Tax prep integration"] },
    ],
    cta: { text: "Create invoice free", sku: "pro-pdf", landing: "/go/invoice.html" },
  },
];

const EXTRA_COMPARISONS = [
  {
    slug: "meeting-cost-calculators",
    title: "Meeting Cost Calculators Compared",
    intro: "Show your team the true price of meetings.",
    items: [
      { name: "MeetingCost", best: true, price: "$5 report", pros: ["Shareable URL", "Free calculator", "Viral embed"] },
      { name: "Spreadsheets", price: "Free", pros: ["Manual", "Flexible"] },
    ],
    cta: { text: "Calculate meeting cost", sku: "meeting-pro", landing: "/tools/meeting-cost-free.html" },
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
<a class="cta" href="${c.cta.landing ?? `{{PAY:${c.cta.sku}}}`}">${c.cta.text}</a>
<a class="cta" href="{{PAY:${c.cta.sku}}}" style="background:#fff;color:#2563eb;border:2px solid #2563eb;margin-left:8px">Buy now →</a>
<p class="disclaimer">Affiliate disclosure: We operate ${c.items.find((i) => i.best)?.name ?? "listed products"}. Comparisons updated automatically.</p>
</body></html>`;
}
