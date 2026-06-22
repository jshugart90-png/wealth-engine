#!/usr/bin/env node
/**
 * iOS TestFlight upload readiness validator — all 32 apps.
 * Run: node mobile/ios-upload-checklist.mjs [--app slug] [--json]
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { loadIapConfig, generateIapConfig, GAME_SLUGS } from "./shared/iap.mjs";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(mobileRoot, "..");
const fastfile = join(mobileRoot, "fastlane", "Fastfile");
const iapConfigPath = join(repoRoot, "config", "mobile-iap-products.json");

const appArg = process.argv.includes("--app")
  ? process.argv[process.argv.indexOf("--app") + 1]
  : null;
const jsonOut = process.argv.includes("--json");

/** Slug → Fastlane lane name (from TESTFLIGHT_ALL_APPS.md). */
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
  "freelancer-stack": "beta_freelancer_stack",
  devwatch: "beta_devwatch",
  "hookrelay-dlq": "beta_hookrelay_dlq_pro",
};

function getAppSlugs() {
  const metaDir = join(mobileRoot, "store-metadata");
  return readdirSync(metaDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function checkApp(slug, iapConfig, fastfileContent) {
  const checks = [];
  const pass = (id, name, detail = "OK") => checks.push({ id, name, status: "PASS", detail });
  const fail = (id, name, detail) => checks.push({ id, name, status: "FAIL", detail });
  const warn = (id, name, detail) => checks.push({ id, name, status: "WARN", detail });

  const metaPath = join(mobileRoot, "store-metadata", slug, "metadata.json");
  const capConfig = join(mobileRoot, slug, "capacitor.config.ts");
  const entitlementsDoc = join(mobileRoot, "ios", "ENTITLEMENTS.md");
  const infoPlistDoc = join(mobileRoot, "ios", "INFO_PLIST_TEMPLATE.md");
  const storeKit = join(mobileRoot, "storekit", "Products.storekit");

  // 1. Bundle ID in metadata + capacitor
  let bundleId = null;
  if (existsSync(metaPath)) {
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    bundleId = meta.bundleId;
    if (bundleId) pass(1, "Bundle ID in metadata", bundleId);
    else fail(1, "Bundle ID in metadata", "Missing bundleId");
    if (meta.version) pass(2, "Version in metadata", meta.version);
    else warn(2, "Version in metadata", "Add version to metadata.json");
    if (meta.privacyPolicyUrl?.includes("privacy.html")) pass(3, "Privacy URL", meta.privacyPolicyUrl);
    else fail(3, "Privacy URL", "Missing privacyPolicyUrl");
  } else {
    fail(1, "Bundle ID in metadata", `Missing ${metaPath}`);
  }

  if (existsSync(capConfig)) {
    const cfg = readFileSync(capConfig, "utf8");
    const appIdMatch = cfg.match(/appId:\s*"([^"]+)"/);
    if (appIdMatch && bundleId && appIdMatch[1] === bundleId) pass(4, "Capacitor appId matches metadata");
    else if (appIdMatch) fail(4, "Capacitor appId matches metadata", `cap=${appIdMatch?.[1]} meta=${bundleId}`);
    else fail(4, "Capacitor appId matches metadata", "No appId in capacitor.config.ts");
    if (cfg.includes("SplashScreen")) pass(5, "SplashScreen configured");
    else warn(5, "SplashScreen configured", "Add SplashScreen plugin");
  } else {
    fail(4, "Capacitor config exists", `Missing ${capConfig}`);
  }

  // 6. Capacitor www synced
  const wwwIndex = join(mobileRoot, slug, "www", "index.html");
  if (existsSync(wwwIndex)) pass(6, "Capacitor www synced");
  else warn(6, "Capacitor www synced", `Run npm run mobile:sync:${slug.replace(/_/g, "-")}`);

  // 7. Store metadata complete
  for (const f of ["description.txt", "keywords.txt"]) {
    const p = join(mobileRoot, "store-metadata", slug, f);
    if (existsSync(p)) pass(`7-${f}`, `Store metadata: ${f}`);
    else fail(`7-${f}`, `Store metadata: ${f}`, "Missing");
  }

  // 8. Fastlane lane
  const lane = FASTLANE_LANES[slug];
  if (lane && fastfileContent.includes(`lane :${lane}`)) pass(8, "Fastlane lane", lane);
  else fail(8, "Fastlane lane", lane ? `Missing lane :${lane}` : "No lane mapping");

  // 9. IAP products defined
  const appIap = iapConfig.apps[slug];
  if (appIap?.products?.length) {
    pass(9, "IAP products defined", `${appIap.products.length} products`);
    for (const p of appIap.products) {
      if (p.storeKitId?.startsWith(bundleId + ".")) pass(`9-${p.key}`, `IAP ID: ${p.key}`, p.storeKitId);
      else fail(`9-${p.key}`, `IAP ID: ${p.key}`, `Expected ${bundleId}.${p.key}`);
    }
  } else {
    fail(9, "IAP products defined", "Not in mobile-iap-products.json");
  }

  // 10. iOS docs
  if (existsSync(entitlementsDoc)) pass(10, "Entitlements doc");
  else warn(10, "Entitlements doc", "Create mobile/ios/ENTITLEMENTS.md");
  if (existsSync(infoPlistDoc)) pass(11, "Info.plist template doc");
  else warn(11, "Info.plist template doc", "Create mobile/ios/INFO_PLIST_TEMPLATE.md");
  if (existsSync(storeKit)) pass(12, "StoreKit config template");
  else warn(12, "StoreKit config template", "Create mobile/storekit/Products.storekit");

  const failed = checks.filter((c) => c.status === "FAIL").length;
  const laneName = FASTLANE_LANES[slug] ?? null;

  return {
    slug,
    appName: appIap?.appName ?? slug,
    bundleId,
    type: GAME_SLUGS.has(slug) ? "game" : "utility",
    iapProductCount: appIap?.products?.length ?? 0,
    fastlaneLane: laneName,
    testFlightReady: failed === 0,
    failed,
    checks,
  };
}

function checkUniqueBundleIds(iapConfig) {
  const ids = Object.values(iapConfig.apps).map((a) => a.bundleId);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  return dupes.length ? { ok: false, dupes: [...new Set(dupes)] } : { ok: true };
}

function main() {
  if (!existsSync(iapConfigPath)) generateIapConfig();
  const iapConfig = loadIapConfig();
  const fastfileContent = existsSync(fastfile) ? readFileSync(fastfile, "utf8") : "";

  const slugs = appArg ? [appArg] : getAppSlugs();
  const results = slugs.map((s) => checkApp(s, iapConfig, fastfileContent));
  const bundleCheck = checkUniqueBundleIds(iapConfig);

  const summary = {
    timestamp: new Date().toISOString(),
    appsChecked: results.length,
    testFlightReady: results.filter((r) => r.testFlightReady).length,
    gaps: results.filter((r) => !r.testFlightReady).length,
    totalIapProducts: Object.values(iapConfig.apps).reduce((s, a) => s + a.products.length, 0),
    uniqueBundleIds: bundleCheck.ok,
    duplicateBundleIds: bundleCheck.dupes ?? [],
    blockers: [
      "iOS build/upload requires macOS + Xcode (Windows cannot run xcodebuild)",
      "App Store Connect IAP products must be created manually per bundle ID",
      "Fastlane .env requires App Store Connect API key on Mac",
    ],
    apps: results,
  };

  if (jsonOut) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`\n iOS Upload Checklist — ${summary.appsChecked} apps`);
    console.log(` TestFlight ready: ${summary.testFlightReady}/${summary.appsChecked}`);
    console.log(` IAP products: ${summary.totalIapProducts}`);
    console.log(` Unique bundle IDs: ${bundleCheck.ok ? "YES" : "NO — " + bundleCheck.dupes.join(", ")}\n`);
    for (const r of results) {
      const icon = r.testFlightReady ? "✓" : "✗";
      console.log(` ${icon} ${r.appName} (${r.slug}) — IAP:${r.iapProductCount} lane:${r.fastlaneLane ?? "MISSING"}`);
      if (!r.testFlightReady) {
        for (const c of r.checks.filter((x) => x.status === "FAIL")) {
          console.log(`    FAIL: ${c.name} — ${c.detail}`);
        }
      }
    }
  }

  const exitCode = summary.gaps > 0 || !bundleCheck.ok ? 1 : 0;
  process.exit(exitCode);
}

main();
