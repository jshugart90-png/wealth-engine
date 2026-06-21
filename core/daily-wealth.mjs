import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getDataRoot } from "./env.mjs";
import { generateSeoPages } from "./marketing/seo-pages.mjs";
import { buildSitemap, buildRobotsTxt, pingSearchEngines } from "./marketing/sitemap.mjs";
import { submitIndexNow } from "./marketing/indexnow.mjs";
import { buildProductFeeds } from "./marketing/feeds.mjs";
import { ensureReferralCodes } from "./marketing/referrals.mjs";
import { buildDirectoryPack } from "./marketing/directory-pack.mjs";
import { expandCompareStack } from "../ventures/comparestack/generator.mjs";
import { buildBundleLandings } from "./marketing/bundles.mjs";
import { buildEmbedWidgets } from "./marketing/embeds.mjs";
import { runPostCheckoutUpsell } from "./marketing/upsell-email.mjs";
import { logEvent } from "./db.mjs";

export async function runDailyWealthCycle() {
  const results = {};

  results.seoPages = generateSeoPages();
  logEvent(null, "daily_seo", results.seoPages);

  results.sitemap = buildSitemap();
  results.robots = buildRobotsTxt();
  results.ping = await pingSearchEngines();
  logEvent(null, "daily_sitemap_ping", results.ping);

  results.indexNow = await submitIndexNow();
  logEvent(null, "daily_indexnow", results.indexNow);

  results.feeds = buildProductFeeds();
  results.referrals = ensureReferralCodes(8);
  results.directories = buildDirectoryPack();
  results.compareExpand = expandCompareStack();
  results.bundles = buildBundleLandings();
  results.embeds = buildEmbedWidgets();

  try {
    results.upsell = await runPostCheckoutUpsell();
  } catch (e) {
    results.upsell = { skipped: e.message };
  }

  const reportPath = join(getDataRoot(), "marketing", "daily-wealth-report.json");
  mkdirSync(join(getDataRoot(), "marketing"), { recursive: true });
  writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(), results }, null, 2));

  return results;
}

if (process.argv[1]?.endsWith("daily-wealth.mjs")) {
  runDailyWealthCycle().then((r) => console.log(JSON.stringify(r, null, 2))).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
