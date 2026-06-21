import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "../env.mjs";

const CAMPAIGNS = [
  {
    name: "WE - Invoice Generator",
    budgetDailyUsd: 5,
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
    budgetDailyUsd: 3,
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
    budgetDailyUsd: 2,
    keywords: [
      { kw: "free nda generator", h1: "Free NDA Generator", h2: "PDF $4", desc: "Preview free. Clean PDF export. No subscription." },
      { kw: "mutual nda template", h1: "Mutual NDA Template", h2: "Instant PDF", desc: "Freelancers & startups. Code LAUNCH25 saves 25%." },
      { kw: "nda template online", h1: "NDA Template Online", h2: "2-Minute Setup", desc: "Simple fields. Secure Stripe checkout." },
    ],
    sku: "nda-pdf",
    finalUrlPath: "/go/nda.html?utm_source=google&utm_campaign=nda",
  },
  {
    name: "WE - Webhook Relay",
    budgetDailyUsd: 2,
    keywords: [
      { kw: "webhook testing tool", h1: "Webhook Testing Tool", h2: "From $7/mo", desc: "Forward, replay, debug webhooks. Dev-friendly." },
      { kw: "webhook relay service", h1: "Webhook Relay", h2: "Never Miss Events", desc: "Dead-letter alerts. 3 endpoints included." },
    ],
    sku: "relay-monthly",
    finalUrlPath: "/go/webhook.html?utm_source=google&utm_campaign=webhook",
  },
  {
    name: "WE - PipeKit API",
    budgetDailyUsd: 2,
    keywords: [
      { kw: "uuid api generator", h1: "UUID API Generator", h2: "From $9/mo", desc: "Self-serve API keys. 100 free req/day." },
      { kw: "json formatter api", h1: "JSON Formatter API", h2: "Dev Micro-APIs", desc: "Hash, base64, timestamp. Simple pricing." },
    ],
    sku: "starter-monthly",
    finalUrlPath: "/go/pipekit.html?utm_source=google&utm_campaign=pipekit",
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
