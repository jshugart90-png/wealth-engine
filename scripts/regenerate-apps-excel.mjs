#!/usr/bin/env node
/**
 * Regenerate D:\wealth-engine-data\reports\WEALTH_ENGINE_APPS_2026-06-21.xlsx
 * with IAP products, TestFlight ready, Fastlane lane columns.
 */
import { readFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadIapConfig } from "../mobile/shared/iap.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = "D:\\wealth-engine-data\\reports\\WEALTH_ENGINE_APPS_2026-06-21.xlsx";
const mobileRoot = join(repoRoot, "mobile");

const FASTLANE_LANES = {
  games: "beta",
  tools: "beta_freelancer_tools",
  "receipt-rush": "beta_receipt_rush",
  "webhook-whack": "beta_webhook_whack",
  "invoice-stack": "beta_invoice_stack",
  "horseshoe-toss": "beta_horseshoe_toss",
  "uptime-defender": "beta_uptime_defender",
  "freelancer-memory": "beta_freelancer_memory",
  "color-switch-snake": "beta_color_switch_snake",
  "word-scramble-biz": "beta_word_scramble_biz",
  "net-30-ninja": "beta_net_30_ninja",
  "ssl-shield": "beta_ssl_shield",
  "nda-speed-sign": "beta_nda_speed_sign",
  billsnap: "beta_billsnap",
  "statusping-lite": "beta_statusping_lite",
  leaselens: "beta_leaselens",
  ndagen: "beta_ndagen",
  hookrelay: "beta_hookrelay",
  pipekit: "beta_pipekit",
  meetingcost: "beta_meetingcost",
  templateforge: "beta_templateforge",
  comparestack: "beta_comparestack",
  "tip-calculator-pro": "beta_tip_calculator_pro",
  "hourly-rate-calculator-pro": "beta_hourly_rate_calculator_pro",
  "freelancer-tax-estimator": "beta_freelancer_tax_estimator_pro",
  "1099-threshold-tracker-pro": "beta_1099_threshold_tracker_pro",
  "quarterly-tax-deadline-pro": "beta_quarterly_tax_deadline_pro",
  "profit-margin-calculator-pro": "beta_profit_margin_calculator_pro",
  "break-even-calculator-pro": "beta_break_even_calculator_pro",
  "late-fee-calculator-pro": "beta_late_fee_calculator_pro",
  "markup-calculator-pro": "beta_markup_calculator_pro",
  "day-rate-calculator-pro": "beta_day_rate_calculator_pro",
  "bill-splitter-pro": "beta_bill_splitter_pro",
  "percentage-calculator-pro": "beta_percentage_calculator_pro",
  "renter-toolkit": "beta_renter_toolkit",
  "invoice-number-rush": "beta_invoice_number_rush",
  "freelancer-stack": "beta_freelancer_stack",
  devwatch: "beta_devwatch",
  "hookrelay-dlq": "beta_hookrelay_dlq_pro",
  "1099-suite": "beta_1099_suite",
};

async function main() {
  const ExcelJS = (await import("exceljs")).default;
  const iapConfig = loadIapConfig();
  const fastfile = readFileSync(join(mobileRoot, "fastlane", "Fastfile"), "utf8");

  const slugs = readdirSync(join(mobileRoot, "store-metadata"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const rows = slugs.map((slug, i) => {
    const meta = JSON.parse(readFileSync(join(mobileRoot, "store-metadata", slug, "metadata.json"), "utf8"));
    const iap = iapConfig.apps[slug];
    const lane = FASTLANE_LANES[slug];
    const hasCap = existsSync(join(mobileRoot, slug, "capacitor.config.ts"));
    const hasWww = existsSync(join(mobileRoot, slug, "www", "index.html"));
    const hasMeta = ["metadata.json", "description.txt", "keywords.txt"].every((f) =>
      existsSync(join(mobileRoot, "store-metadata", slug, f))
    );
    const laneOk = lane && fastfile.includes(`lane :${lane}`);
    const testFlightReady = hasCap && hasMeta && laneOk && (iap?.products?.length ?? 0) > 0;

    return {
      num: i + 1,
      appName: meta.appName,
      slug,
      bundleId: meta.bundleId,
      version: meta.version ?? "1.0.0",
      type: iap?.type ?? "unknown",
      iapProducts: iap?.products?.length ?? 0,
      iapProductIds: (iap?.products ?? []).map((p) => p.storeKitId).join("; "),
      testFlightReady: testFlightReady ? "YES" : "NO",
      fastlaneLane: lane ?? "MISSING",
      stripeLinked: (iap?.products ?? []).some((p) => p.stripeSku) ? "YES" : "NO",
    };
  });

  mkdirSync(dirname(outPath), { recursive: true });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Apps");

  ws.columns = [
    { header: "#", key: "num", width: 5 },
    { header: "App Name", key: "appName", width: 28 },
    { header: "Slug", key: "slug", width: 24 },
    { header: "Bundle ID", key: "bundleId", width: 36 },
    { header: "Version", key: "version", width: 10 },
    { header: "Type", key: "type", width: 10 },
    { header: "IAP Products", key: "iapProducts", width: 12 },
    { header: "IAP Product IDs", key: "iapProductIds", width: 60 },
    { header: "TestFlight Ready", key: "testFlightReady", width: 16 },
    { header: "Fastlane Lane", key: "fastlaneLane", width: 32 },
    { header: "Stripe Linked", key: "stripeLinked", width: 14 },
  ];

  ws.addRows(rows);
  ws.getRow(1).font = { bold: true };

  await wb.xlsx.writeFile(outPath);
  console.log(`Wrote ${rows.length} apps → ${outPath}`);
  console.log(`TestFlight ready: ${rows.filter((r) => r.testFlightReady === "YES").length}/${rows.length}`);
  console.log(`Total IAP products: ${rows.reduce((s, r) => s + r.iapProducts, 0)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
