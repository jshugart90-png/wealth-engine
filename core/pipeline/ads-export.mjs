import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "../env.mjs";
import { getAllPaymentLinks } from "../commerce.mjs";

const CAMPAIGNS = [
  {
    name: "WE - Invoice Generator",
    budgetDailyUsd: 12,
    keywords: [
      "free invoice generator pdf",
      "invoice generator no signup",
      "freelancer invoice template",
      "make invoice pdf online",
    ],
    sku: "pro-pdf",
    finalUrlPath: "/billsnap/index.html?utm_source=google&utm_campaign=invoice",
  },
  {
    name: "WE - Lease Analyzer",
    budgetDailyUsd: 8,
    keywords: [
      "lease red flags checklist",
      "rental lease analyzer",
      "tenant lease review tool",
    ],
    sku: "single-report",
    finalUrlPath: "/leaselens/index.html?utm_source=google&utm_campaign=lease",
  },
  {
    name: "WE - Uptime Monitor",
    budgetDailyUsd: 6,
    keywords: [
      "cheap uptime monitor",
      "website down alert email",
      "simple uptime monitoring",
    ],
    sku: "basic-monthly",
    finalUrlPath: "/statusping/index.html?utm_source=google&utm_campaign=uptime",
  },
];

export function buildGoogleAdsCsv() {
  const env = loadEnv();
  const base = (env.PUBLIC_BASE_URL ?? "https://YOUR_DOMAIN").replace(/\/$/, "");
  const links = getAllPaymentLinks();
  const outDir = join(getDataRoot(), "marketing", "ads");
  mkdirSync(outDir, { recursive: true });

  const rows = [
    ["Campaign", "Ad group", "Keyword", "Match type", "Max CPC", "Final URL", "Headline 1", "Headline 2", "Description"].join(","),
  ];

  for (const c of CAMPAIGNS) {
    const pay = links.find((l) => l.sku === c.sku)?.payment_link ?? base + c.finalUrlPath;
    for (const kw of c.keywords) {
      rows.push(
        [
          esc(c.name),
          esc(kw),
          esc(kw),
          "Phrase",
          "0.45",
          esc(base + c.finalUrlPath),
          esc(kw.split(" ").slice(0, 3).join(" ")),
          "Free Preview Instantly",
          esc(`Try free. Pro from $3. Secure checkout.`),
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
  return { path: join(outDir, "google-ads-import.csv"), dailyBudgetUsd: 26, campaigns: CAMPAIGNS.length };
}

function esc(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}
