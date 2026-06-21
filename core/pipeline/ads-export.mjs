import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "../env.mjs";

const CAMPAIGNS = [
  {
    name: "WE - Invoice Generator",
    budgetDailyUsd: 2,
    keywords: [
      { kw: "free invoice generator pdf", h1: "Free Invoice PDF", h2: "No Signup · $3 Pro", desc: "Preview free. Pro PDF $3. Code LAUNCH25 saves 25%." },
      { kw: "invoice generator no signup", h1: "Invoice — No Signup", h2: "PDF in 30 Seconds", desc: "Instant preview. Watermark-free export $3. Secure Stripe." },
      { kw: "freelancer invoice template", h1: "Freelancer Invoice", h2: "Print-Ready PDF $3", desc: "Made for contractors. One-time $3 or $12/mo unlimited." },
      { kw: "make invoice pdf online", h1: "Make Invoice PDF", h2: "Try Free First", desc: "Online invoice maker. Pro export from $3. LAUNCH25 at checkout." },
    ],
    sku: "pro-pdf",
    finalUrlPath: "/go/invoice.html?utm_source=google&utm_campaign=invoice",
  },
  {
    name: "WE - Lease Analyzer",
    budgetDailyUsd: 2,
    keywords: [
      { kw: "lease red flags checklist", h1: "Lease Red Flags", h2: "Free Risk Score", desc: "Paste lease, get instant flags. Full report $7. Not legal advice." },
      { kw: "rental lease analyzer", h1: "Rental Lease Analyzer", h2: "Instant Preview", desc: "Rule-based lease scan. Unlock full report for $7." },
      { kw: "tenant lease review tool", h1: "Tenant Lease Review", h2: "Know Before You Sign", desc: "Free preview + paid full analysis. Secure checkout." },
    ],
    sku: "single-report",
    finalUrlPath: "/go/lease.html?utm_source=google&utm_campaign=lease",
  },
  {
    name: "WE - Uptime Monitor",
    budgetDailyUsd: 2,
    keywords: [
      { kw: "cheap uptime monitor", h1: "Cheap Uptime Monitor", h2: "From $5/mo", desc: "Email alerts when site goes down. 5 monitors included." },
      { kw: "website down alert email", h1: "Site Down Alerts", h2: "Email in 5 Min", desc: "Simple monitoring. No complex setup. Cancel anytime." },
      { kw: "simple uptime monitoring", h1: "Simple Uptime Tool", h2: "5 Monitors $5/mo", desc: "Know before customers do. Self-serve Stripe billing." },
    ],
    sku: "basic-monthly",
    finalUrlPath: "/go/uptime.html?utm_source=google&utm_campaign=uptime",
  },
  {
    name: "WE - NDA Generator",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "free nda generator", h1: "Free NDA Generator", h2: "PDF $4", desc: "Preview free. Clean PDF export. No subscription." },
      { kw: "mutual nda template", h1: "Mutual NDA Template", h2: "Instant PDF", desc: "Freelancers & startups. Code LAUNCH25 saves 25%." },
    ],
    sku: "nda-pdf",
    finalUrlPath: "/go/nda.html?utm_source=google&utm_campaign=nda",
  },
  {
    name: "WE - PipeKit API",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "uuid api generator", h1: "UUID API Generator", h2: "Free Tier + $9/mo", desc: "Self-serve API keys. Hash, base64, JSON tools included." },
      { kw: "developer api utilities", h1: "Dev API Utilities", h2: "No Postman Bloat", desc: "100 free req/day. Pro from $9/mo. Instant Stripe checkout." },
    ],
    sku: "starter-monthly",
    finalUrlPath: "/go/pipekit.html?utm_source=google&utm_campaign=pipekit",
  },
  {
    name: "WE - Webhook Relay",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "webhook relay service", h1: "Webhook Relay", h2: "$7/mo Self-Serve", desc: "Retry failed Stripe webhooks. Dead-letter alerts. No enterprise sales." },
      { kw: "stripe webhook retry", h1: "Stripe Webhook Retry", h2: "HookRelay $7/mo", desc: "Forward and replay webhooks. Setup in 60 seconds." },
    ],
    sku: "relay-monthly",
    finalUrlPath: "/go/webhook.html?utm_source=google&utm_campaign=webhook",
  },
  {
    name: "WE - Business Templates",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "freelancer contract template pdf", h1: "Freelancer Templates", h2: "Instant Download $14", desc: "Contracts, invoices, onboarding kits. LAUNCH25 saves 25%." },
      { kw: "small business compliance templates", h1: "SMB Compliance Pack", h2: "Print-Ready PDFs", desc: "Hiring, compliance, and ops templates. Checkout in 60 seconds." },
      { kw: "business document template pack", h1: "Business Doc Pack", h2: "From $12", desc: "TemplateForge — instant PDF download after Stripe checkout." },
    ],
    sku: "freelancer-kit",
    finalUrlPath: "/go/templates.html?utm_source=google&utm_campaign=templates",
  },
  {
    name: "WE - Freelancer Kit",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "freelancer business kit pdf", h1: "Freelancer Kit $14", h2: "14 Templates", desc: "Contracts, proposals, invoices. LAUNCH25 saves 25% at checkout." },
      { kw: "freelancer document template pack", h1: "Freelancer Docs", h2: "Instant Download", desc: "Print-ready PDFs. No subscription. Secure Stripe checkout." },
    ],
    sku: "freelancer-kit",
    finalUrlPath: "/go/freelancer.html?utm_source=google&utm_campaign=freelancer",
  },
  {
    name: "WE - Contractor Invoice",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "contractor invoice template pdf", h1: "Contractor Invoice", h2: "PDF in 30 Sec", desc: "1099-friendly invoice. Preview free. Pro export $3." },
      { kw: "1099 contractor invoice maker", h1: "1099 Invoice Maker", h2: "No Signup", desc: "Send invoices same day. LAUNCH25 saves 25%." },
    ],
    sku: "pro-pdf",
    finalUrlPath: "/go/contractor.html?utm_source=google&utm_campaign=contractor",
  },
  {
    name: "WE - SMB Compliance",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "smb compliance checklist pdf", h1: "SMB Compliance Pack", h2: "$19 Instant", desc: "Incident response, vendor agreements. Download in 60 seconds." },
      { kw: "small business compliance documents", h1: "Compliance Docs", h2: "No Lawyer Sub", desc: "Print-ready templates. LAUNCH25 at checkout." },
    ],
    sku: "smb-compliance-pack",
    finalUrlPath: "/go/compliance.html?utm_source=google&utm_campaign=compliance",
  },
  {
    name: "WE - Freelancer Stack",
    budgetDailyUsd: 2,
    keywords: [
      { kw: "freelancer invoice contract bundle", h1: "Freelancer Stack", h2: "$29/mo Unlimited", desc: "Invoice + templates + NDA. LAUNCH25 saves 25%." },
      { kw: "freelancer business tools bundle", h1: "Revenue Stack $49", h2: "One-Time Bundle", desc: "Replace 3 subscriptions. Instant Stripe checkout." },
    ],
    sku: "stack-unlimited",
    finalUrlPath: "/go/stack.html?utm_source=google&utm_campaign=stack",
  },
  {
    name: "WE - HookRelay DLQ",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "webhook dead letter queue", h1: "Webhook DLQ Pro", h2: "$29/mo", desc: "Retry, dead-letter alerts, replay. Indie SaaS pricing." },
      { kw: "stripe webhook retry service", h1: "Stripe Webhook Retry", h2: "25K Events/mo", desc: "Production-grade relay. LAUNCH25 at checkout." },
    ],
    sku: "hookrelay-pro",
    finalUrlPath: "/go/webhook.html?utm_source=google&utm_campaign=hookrelay-dlq",
  },
  {
    name: "WE - DevWatch Bundle",
    budgetDailyUsd: 1,
    keywords: [
      { kw: "uptime ssl cron monitoring bundle", h1: "DevWatch $39/mo", h2: "3-in-1 Monitoring", desc: "Uptime + SSL + cron in one dashboard. LAUNCH25 saves 25%." },
      { kw: "ssl certificate expiry alert", h1: "SSL Expiry Alerts", h2: "DevWatch Bundle", desc: "Never miss cert renewal. Unified alerts with uptime + cron." },
    ],
    sku: "devwatch-monthly",
    finalUrlPath: "/go/devwatch.html?utm_source=google&utm_campaign=devwatch",
  },
];

export function buildGoogleAdsCsv() {
  const env = loadEnv();
  const base = (env.PUBLIC_BASE_URL ?? "https://wealth-engine-0qlj.onrender.com").replace(/\/$/, "");
  const outDir = join(getDataRoot(), "marketing", "ads");
  mkdirSync(outDir, { recursive: true });

  const rows = [
    ["Campaign", "Ad group", "Keyword", "Match type", "Max CPC", "Final URL", "Headline 1", "Headline 2", "Description"].join(","),
  ];

  for (const c of CAMPAIGNS) {
    for (const entry of c.keywords) {
      const kw = typeof entry === "string" ? entry : entry.kw;
      const h1 = typeof entry === "string" ? kw.split(" ").slice(0, 3).join(" ") : entry.h1;
      const h2 = typeof entry === "string" ? "Free Preview Instantly" : entry.h2;
      const desc = typeof entry === "string" ? "Try free. Pro from $3. Secure checkout." : entry.desc;
      rows.push(
        [
          esc(c.name),
          esc(kw),
          esc(kw),
          "Phrase",
          "0.45",
          esc(base + c.finalUrlPath),
          esc(h1),
          esc(h2),
          esc(desc),
        ].join(",")
      );
    }
  }

  const csv = rows.join("\n");
  writeFileSync(join(outDir, "google-ads-import.csv"), csv);
  writeFileSync(join(outDir, "microsoft-ads-import.csv"), csv);
  writeFileSync(
    join(outDir, "campaign-notes.json"),
    JSON.stringify({ campaigns: CAMPAIGNS, baseUrl: base, dailyBudgetTotal: CAMPAIGNS.reduce((s, c) => s + c.budgetDailyUsd, 0) }, null, 2)
  );
  const dailyBudgetUsd = CAMPAIGNS.reduce((s, c) => s + c.budgetDailyUsd, 0);
  return { path: join(outDir, "google-ads-import.csv"), dailyBudgetUsd, campaigns: CAMPAIGNS.length };
}

function esc(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}
