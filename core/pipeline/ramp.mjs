import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot } from "../env.mjs";
import { runDailyWealthCycle } from "../daily-wealth.mjs";
import { buildGoogleAdsCsv } from "./ads-export.mjs";
import { buildOutreachPack } from "./outreach.mjs";
import { ensureLaunchCoupon } from "./coupons.mjs";
import { buildHighConversionLandings } from "./conversion-landings.mjs";
import { getFunnelMetrics } from "./funnel.mjs";
import { logEvent } from "../db.mjs";

export async function runGrowthRamp() {
  mkdirSync(join(getDataRoot(), "marketing"), { recursive: true });

  const growth = JSON.parse(readFileSync(join(getRoot(), "config", "growth-target.json"), "utf8"));
  const seoConfig = JSON.parse(readFileSync(join(getRoot(), "config", "seo-keywords.json"), "utf8"));
  seoConfig.pagesPerCycle = growth.ramp.seoPagesPerCycle ?? 10;
  writeFileSync(join(getRoot(), "config", "seo-keywords.json"), JSON.stringify(seoConfig, null, 2));

  const results = {};

  results.coupon = await ensureLaunchCoupon();
  results.landings = buildHighConversionLandings();
  results.ads = buildGoogleAdsCsv();
  results.outreach = buildOutreachPack();
  results.daily = await runDailyWealthCycle();
  results.metrics = getFunnelMetrics(30);

  const report = {
    at: new Date().toISOString(),
    targetUsd: growth.targetMonthlyUsd,
    metrics: results.metrics,
    nextActions: [
      "Import google-ads-import.csv into Google Ads (~$26/day suggested)",
      "Post POST_TODAY.md content to listed platform",
      "Deploy to custom domain (see docs/ACCESS_NEEDED.md)",
      "Share /go/invoice, /go/lease, /go/uptime links",
    ],
    results,
  };

  writeFileSync(join(getDataRoot(), "marketing", "ramp-report.json"), JSON.stringify(report, null, 2));

  // Agent system bridge — snapshot for Final Boss / run-agent-cycle.mjs
  const boardHint = join(getRoot(), "board", ".ramp-last.json");
  try {
    writeFileSync(
      boardHint,
      JSON.stringify(
        {
          at: report.at,
          targetUsd: report.targetUsd,
          revenueUsd: results.metrics.revenueUsd,
          pctOfTarget: results.metrics.pctOfTarget,
          nextActions: report.nextActions,
        },
        null,
        2
      )
    );
  } catch {
    /* board/ may not exist in all environments */
  }

  logEvent(null, "growth_ramp", { target: growth.targetMonthlyUsd, revenue: results.metrics.revenueUsd });
  return report;
}

if (process.argv[1]?.endsWith("ramp.mjs")) {
  runGrowthRamp().then((r) => console.log(JSON.stringify(r, null, 2))).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
