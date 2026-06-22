#!/usr/bin/env node
/**
 * App Store preflight QC — 15-item checklist before mobile submission.
 * Run: node scripts/app-store-preflight.mjs [--app games|tools|freelancer-stack|devwatch|hookrelay-dlq|receipt-rush|webhook-whack|invoice-stack|horseshoe-toss|uptime-defender|freelancer-memory|color-switch-snake|word-scramble-biz|net-30-ninja|ssl-shield|nda-speed-sign|invoice-number-rush|billsnap|statusping-lite|leaselens|ndagen|hookrelay|pipekit|meetingcost|templateforge|comparestack|tip-calculator-pro|hourly-rate-calculator-pro|freelancer-tax-estimator|1099-threshold-tracker-pro|quarterly-tax-deadline-pro|profit-margin-calculator-pro|break-even-calculator-pro|late-fee-calculator-pro|markup-calculator-pro|day-rate-calculator-pro|bill-splitter-pro]
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { getRoot } from "../core/env.mjs";

const root = getRoot();
const app = process.argv.includes("--app")
  ? process.argv[process.argv.indexOf("--app") + 1]
  : "games";
const HUB_APPS = ["tools", "freelancer-stack", "devwatch", "hookrelay-dlq"];
const MINI_GAMES = ["receipt-rush", "webhook-whack", "invoice-stack", "horseshoe-toss", "uptime-defender", "freelancer-memory", "color-switch-snake", "word-scramble-biz", "net-30-ninja", "ssl-shield", "nda-speed-sign", "invoice-number-rush"];
const UTIL_APPS = ["billsnap", "statusping-lite", "leaselens", "ndagen", "hookrelay", "pipekit", "meetingcost", "templateforge", "comparestack", "tip-calculator-pro", "hourly-rate-calculator-pro", "freelancer-tax-estimator", "1099-threshold-tracker-pro", "quarterly-tax-deadline-pro", "profit-margin-calculator-pro", "break-even-calculator-pro", "late-fee-calculator-pro", "markup-calculator-pro", "day-rate-calculator-pro", "bill-splitter-pro"];
const UTIL_DIST = { "statusping-lite": "statusping", pipekit: "pipekit", templateforge: "templateforge", comparestack: "comparestack", "tip-calculator-pro": "tip-calculator-pro", "hourly-rate-calculator-pro": "hourly-rate-calculator-pro", "freelancer-tax-estimator": "freelancer-tax-estimator", "1099-threshold-tracker-pro": "1099-threshold-tracker-pro", "quarterly-tax-deadline-pro": "quarterly-tax-deadline-pro", "profit-margin-calculator-pro": "profit-margin-calculator-pro", "break-even-calculator-pro": "break-even-calculator-pro", "late-fee-calculator-pro": "late-fee-calculator-pro", "markup-calculator-pro": "markup-calculator-pro", "day-rate-calculator-pro": "day-rate-calculator-pro", "bill-splitter-pro": "bill-splitter-pro" };
const isMiniGame = MINI_GAMES.includes(app);
const isUtilApp = UTIL_APPS.includes(app);
const isHubApp = HUB_APPS.includes(app);
const miniGameSlug = isMiniGame ? app : null;
const utilSlug = isUtilApp ? app : null;
const mobileRoot = join(root, "mobile");
const dist = join(root, "dist");
const baseUrl = "https://wealth-engine-0qlj.onrender.com";

const checks = [];

function pass(id, name, detail = "OK") {
  checks.push({ id, name, status: "PASS", detail });
}

function fail(id, name, detail) {
  checks.push({ id, name, status: "FAIL", detail });
}

function warn(id, name, detail) {
  checks.push({ id, name, status: "WARN", detail });
}

// 1. Privacy policy URL reachable in metadata
const privacyMeta = join(mobileRoot, "store-metadata", app, "metadata.json");
if (existsSync(privacyMeta)) {
  const meta = JSON.parse(readFileSync(privacyMeta, "utf8"));
  if (meta.privacyPolicyUrl?.includes("privacy.html")) pass(1, "Privacy policy URL in metadata");
  else fail(1, "Privacy policy URL in metadata", "Missing privacy.html URL");
} else {
  fail(1, "Privacy policy URL in metadata", `Missing ${privacyMeta}`);
}

// 2. Privacy page exists in dist
if (existsSync(join(dist, "privacy.html"))) pass(2, "Privacy page built");
else fail(2, "Privacy page built", "Run npm run build");

// 3. App icons present
const iconSvg = join(dist, "assets", "pwa", "icon.svg");
if (existsSync(iconSvg)) pass(3, "App icons present");
else fail(3, "App icons present", "Missing dist/assets/pwa/icon.svg");

// 4. Splash screen config
const capConfig = join(mobileRoot, app, "capacitor.config.ts");
if (existsSync(capConfig) && readFileSync(capConfig, "utf8").includes("SplashScreen")) pass(4, "Splash screen configured");
else warn(4, "Splash screen configured", "Add SplashScreen plugin config");

// 5. Games hub links OR mini-game/utility/hub entry
const gamesHub = join(dist, "games", "index.html");
if (isHubApp) {
  const hubWww = join(mobileRoot, app, "www", "index.html");
  if (existsSync(hubWww)) pass(5, "Hub app synced", app);
  else fail(5, "Hub app synced", `Run node mobile/sync-www.mjs ${app}`);
  if (app === "freelancer-stack") {
    const bundle = join(dist, "bundles", "freelancer-stack.html");
    if (existsSync(bundle)) pass("5b", "Freelancer stack bundle built");
    else fail("5b", "Freelancer stack bundle built", "Missing dist/bundles/freelancer-stack.html");
    for (const tool of ["billsnap", "templateforge", "ndagen"]) {
      if (existsSync(join(dist, tool, "index.html"))) pass(`5c-${tool}`, `${tool} built in dist`);
      else fail(`5c-${tool}`, `${tool} built in dist`, `Missing dist/${tool}/index.html`);
    }
  } else if (app === "devwatch") {
    const bundle = join(dist, "bundles", "devwatch.html");
    if (existsSync(bundle)) pass("5b", "DevWatch bundle built");
    else fail("5b", "DevWatch bundle built", "Missing dist/bundles/devwatch.html");
    if (existsSync(join(dist, "statusping", "index.html"))) pass("5c-statusping", "statusping built in dist");
    else fail("5c-statusping", "statusping built in dist", "Missing dist/statusping/index.html");
    for (const tool of ["ssl-expiry-checker.html", "cron-schedule-helper.html"]) {
      if (existsSync(join(dist, "tools", tool))) pass(`5c-${tool}`, `${tool} built in dist`);
      else fail(`5c-${tool}`, `${tool} built in dist`, `Missing dist/tools/${tool}`);
    }
  } else if (app === "hookrelay-dlq") {
    const landing = join(dist, "go", "hookrelay-dlq.html");
    if (existsSync(landing)) pass("5b", "DLQ Pro landing built");
    else fail("5b", "DLQ Pro landing built", "Missing dist/go/hookrelay-dlq.html");
    if (existsSync(join(dist, "hookrelay", "index.html"))) pass("5c-hookrelay", "hookrelay built in dist");
    else fail("5c-hookrelay", "hookrelay built in dist", "Missing dist/hookrelay/index.html");
    if (existsSync(join(dist, "hookrelay", "pricing.html"))) pass("5c-pricing", "hookrelay pricing built");
    else fail("5c-pricing", "hookrelay pricing built", "Missing dist/hookrelay/pricing.html");
  }
} else if (isUtilApp) {
  const utilDist = UTIL_DIST[utilSlug] ?? utilSlug;
  const utilApp = join(dist, utilDist, "index.html");
  if (existsSync(utilApp)) pass(5, "Utility app built", utilDist);
  else fail(5, "Utility app built", `Missing dist/${utilDist}/index.html`);
} else if (isMiniGame) {
  const miniGame = join(dist, "games", miniGameSlug, "index.html");
  if (existsSync(miniGame)) pass(5, "Mini-game built", miniGameSlug);
  else fail(5, "Mini-game built", `Missing dist/games/${miniGameSlug}/index.html`);
} else if (existsSync(gamesHub)) {
  const hub = readFileSync(gamesHub, "utf8");
  const slugs = [
    "horseshoe-toss",
    "invoice-stack",
    "uptime-defender",
    "freelancer-memory",
    "color-switch-snake",
    "word-scramble-biz",
    "receipt-rush",
    "webhook-whack",
    "net-30-ninja",
    "ssl-shield",
    "nda-speed-sign",
    "invoice-number-rush",
  ];
  const missing = slugs.filter((s) => !hub.includes(`/games/${s}/`));
  if (!missing.length) pass(5, "Games hub links intact", `${slugs.length} games`);
  else fail(5, "Games hub links intact", `Missing: ${missing.join(", ")}`);
} else if (!isMiniGame) {
  fail(5, "Games hub links intact", "No dist/games/index.html");
}

// 6. All games in dist OR mini-game/utility/hub synced to mobile www
if (isHubApp) {
  const mobileWww = join(mobileRoot, app, "www", "index.html");
  if (existsSync(mobileWww)) pass(6, "Hub synced to mobile", mobileWww);
  else fail(6, "Hub synced to mobile", `Run node mobile/sync-www.mjs ${app}`);
} else if (isUtilApp) {
  const mobileWww = join(mobileRoot, app, "www", "index.html");
  if (existsSync(mobileWww)) pass(6, "Utility synced to mobile", mobileWww);
  else fail(6, "Utility synced to mobile", `Run node mobile/sync-www.mjs ${app}`);
} else if (isMiniGame) {
  const mobileWww = join(mobileRoot, app, "www", "index.html");
  if (existsSync(mobileWww)) pass(6, "Mini-game synced to mobile", mobileWww);
  else fail(6, "Mini-game synced to mobile", `Run node mobile/sync-www.mjs ${app}`);
} else {
const gameSlugs = readdirSync(join(root, "games"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const missingGames = gameSlugs.filter((s) => !existsSync(join(dist, "games", s, "index.html")));
if (!missingGames.length) pass(6, "All games in dist", `${gameSlugs.length} games`);
else fail(6, "All games in dist", `Missing: ${missingGames.join(", ")}`);
}

// 6b. (mini-game / utility / hub — placeholder to keep check IDs stable)
if (isHubApp && app === "freelancer-stack" && existsSync(join(mobileRoot, app, "www", "bundles", "freelancer-stack.html"))) {
  pass("6b", "Freelancer stack bundle synced");
} else if (isHubApp && app === "devwatch" && existsSync(join(mobileRoot, app, "www", "bundles", "devwatch.html"))) {
  pass("6b", "DevWatch bundle synced");
} else if (isHubApp && app === "hookrelay-dlq" && existsSync(join(mobileRoot, app, "www", "go", "hookrelay-dlq.html"))) {
  pass("6b", "DLQ Pro landing synced");
} else if (isHubApp) {
  pass("6b", "Hub bundle sync", app);
} else if (isUtilApp && existsSync(join(dist, (UTIL_DIST[utilSlug] ?? utilSlug), "index.html"))) {
  pass("6b", "Utility source in dist", UTIL_DIST[utilSlug] ?? utilSlug);
} else if (isMiniGame && existsSync(join(dist, "games", miniGameSlug, "index.html"))) {
  pass("6b", "Mini-game source in dist", miniGameSlug);
}

// 7. AdMob test mode documented (should be ON until production IDs)
const admobDoc = join(root, "docs", "ADSENSE_ADMOB_SETUP.md");
if (existsSync(admobDoc)) pass(7, "AdMob setup documented");
else fail(7, "AdMob setup documented", "Missing docs/ADSENSE_ADMOB_SETUP.md");

// 8. AdMob production check
const sampleGamePath = isUtilApp
  ? join(dist, UTIL_DIST[utilSlug] ?? utilSlug, "index.html")
  : isMiniGame
  ? join(dist, "games", miniGameSlug, "index.html")
  : isHubApp
  ? join(mobileRoot, app, "www", "index.html")
  : join(dist, "games", "horseshoe-toss", "index.html");
if (isUtilApp && existsSync(sampleGamePath)) {
  pass(8, "AdMob production mode", "N/A — utility app, no in-app ads");
} else if (isHubApp && existsSync(sampleGamePath)) {
  pass(8, "AdMob production mode", "N/A — hub app, no in-app ads");
} else if (existsSync(sampleGamePath)) {
  const g = readFileSync(sampleGamePath, "utf8");
  if (g.includes("testMode:true") || g.includes("3940256099942544")) {
    warn(8, "AdMob production mode", "Test IDs active — swap ADMOB_* env vars before store release");
  } else {
    pass(8, "AdMob production mode", "Production IDs detected");
  }
} else {
  warn(8, "AdMob production mode", "No built game to inspect");
}

// 9. Version bump in mobile package
const mobilePkg = join(mobileRoot, "package.json");
if (existsSync(mobilePkg)) {
  const pkg = JSON.parse(readFileSync(mobilePkg, "utf8"));
  if (pkg.version && pkg.version !== "0.0.0") pass(9, "Mobile version set", pkg.version);
  else warn(9, "Mobile version set", "Bump mobile/package.json version before release");
} else {
  fail(9, "Mobile version set", "Missing mobile/package.json");
}

// 10. Capacitor config appId
if (existsSync(capConfig)) {
  const cfg = readFileSync(capConfig, "utf8");
  if (cfg.includes("appId:") && !cfg.includes("com.example")) pass(10, "Capacitor appId configured");
  else fail(10, "Capacitor appId configured", "Set real appId in capacitor.config.ts");
} else {
  fail(10, "Capacitor appId configured", `Missing ${capConfig}`);
}

// 11. Fastlane lanes present
const fastfile = join(mobileRoot, "fastlane", "Fastfile");
if (existsSync(fastfile) && readFileSync(fastfile, "utf8").includes("lane :beta")) pass(11, "Fastlane beta lane");
else fail(11, "Fastlane beta lane", "Missing mobile/fastlane/Fastfile");

// 12. Store metadata complete
const requiredMeta = ["metadata.json", "description.txt", "keywords.txt"];
const metaMissing = requiredMeta.filter((f) => !existsSync(join(mobileRoot, "store-metadata", app, f)));
if (!metaMissing.length) pass(12, "Store metadata complete");
else fail(12, "Store metadata complete", `Missing: ${metaMissing.join(", ")}`);

// 13. PWA manifest live path
if (existsSync(join(dist, "manifest.json"))) {
  const m = JSON.parse(readFileSync(join(dist, "manifest.json"), "utf8"));
  if (m.start_url) pass(13, "PWA manifest valid", `${baseUrl}/manifest.json`);
  else fail(13, "PWA manifest valid", "No start_url");
} else {
  fail(13, "PWA manifest valid", "Run npm run build");
}

// 13b. Games PWA manifest (hub only)
const gamesManifest = join(dist, "games", "manifest.json");
if (isMiniGame || isUtilApp || isHubApp) {
  pass("13b", "Games PWA manifest", isHubApp ? "N/A — standalone hub app" : isUtilApp ? "N/A — standalone utility app" : "N/A — single-game mini-app");
} else if (existsSync(gamesManifest)) {
  const gm = JSON.parse(readFileSync(gamesManifest, "utf8"));
  if (gm.start_url === "/games/") pass("13b", "Games PWA manifest", `${baseUrl}/games/manifest.json`);
  else warn("13b", "Games PWA manifest", "Unexpected start_url");
} else {
  fail("13b", "Games PWA manifest", "Missing dist/games/manifest.json");
}

// 14. Service worker registered
if (existsSync(join(dist, "sw.js"))) pass(14, "Service worker built", `${baseUrl}/sw.js`);
else fail(14, "Service worker built", "Missing dist/sw.js");

// 15. Support URL in metadata
if (existsSync(privacyMeta)) {
  const meta = JSON.parse(readFileSync(privacyMeta, "utf8"));
  if (meta.supportUrl) pass(15, "Support URL configured", meta.supportUrl);
  else fail(15, "Support URL configured", "Add supportUrl to metadata.json");
}

// 16. IAP products defined
const iapConfigPath = join(root, "config", "mobile-iap-products.json");
if (existsSync(iapConfigPath)) {
  const iapConfig = JSON.parse(readFileSync(iapConfigPath, "utf8"));
  const appIap = iapConfig.apps?.[app];
  if (appIap?.products?.length) {
    pass(16, "IAP products configured", `${appIap.products.length} products`);
    const invalid = appIap.products.filter((p) => !p.storeKitId?.startsWith(appIap.bundleId + "."));
    if (!invalid.length) pass("16b", "IAP StoreKit IDs valid");
    else fail("16b", "IAP StoreKit IDs valid", invalid.map((p) => p.key).join(", "));
  } else {
    fail(16, "IAP products configured", `Missing products for ${app} in mobile-iap-products.json`);
  }
} else {
  fail(16, "IAP products configured", "Run npm run mobile:iap:generate");
}

// 17. StoreKit template present
const storeKitPath = join(mobileRoot, "storekit", "Products.storekit");
if (existsSync(storeKitPath)) pass(17, "StoreKit config template");
else warn(17, "StoreKit config template", "Run npm run mobile:storekit:generate");

const passed = checks.filter((c) => c.status === "PASS").length;
const failed = checks.filter((c) => c.status === "FAIL").length;
const warned = checks.filter((c) => c.status === "WARN").length;

const result = {
  app,
  timestamp: new Date().toISOString(),
  passed,
  failed,
  warned,
  total: checks.length,
  readyForStore: failed === 0,
  blockers: [
    "Google Play $25 one-time required for Play Store",
    "iOS TestFlight upload requires macOS + Xcode (Apple Dev account active)",
  ],
  checks,
};

console.log(JSON.stringify(result, null, 2));
process.exit(failed > 0 ? 1 : 0);
