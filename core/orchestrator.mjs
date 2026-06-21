import { appendFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "./env.mjs";
import { getDb, logEvent } from "./db.mjs";
import { syncStripeCatalog } from "./stripe-sync.mjs";
import { buildAll } from "./build-all.mjs";
import { runUptimeChecks } from "../ventures/statusping/checker.mjs";
import { refreshCompareStack } from "../ventures/comparestack/generator.mjs";
import { refreshPdfCatalog } from "../ventures/pdf-factory/generator.mjs";
import { runDailyWealthCycle } from "./daily-wealth.mjs";

function log(msg) {
  const dir = join(getDataRoot(), "logs");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, "orchestrator.log"), `[${new Date().toISOString()}] ${msg}\n`);
  console.log(msg);
}

export async function runOrchestratorCycle() {
  const env = loadEnv();
  const db = getDb();
  const started = new Date().toISOString();
  const run = db.prepare("INSERT INTO runs (started_at, status, summary) VALUES (?, ?, ?)").run(started, "running", "{}");
  const runId = run.lastInsertRowid;
  const summary = { steps: [] };

  try {
    if (env.AUTO_STRIPE_SYNC !== "false") {
      log("Step: Stripe catalog sync");
      const stripe = await syncStripeCatalog();
      summary.steps.push({ stripe });
      logEvent(null, "orchestrator_stripe", stripe);
    }

    log("Step: Refresh PDF product catalog");
    const pdf = refreshPdfCatalog();
    summary.steps.push({ pdf });
    logEvent("pdf-factory", "catalog_refresh", pdf);

    log("Step: Refresh CompareStack SEO pages");
    const compare = refreshCompareStack();
    summary.steps.push({ compare });
    logEvent("comparestack", "seo_refresh", compare);

    if (env.AUTO_BUILD !== "false") {
      log("Step: Build all venture sites");
      const build = buildAll();
      summary.steps.push({ build });
      logEvent(null, "orchestrator_build", build);
    }

    log("Step: Growth ramp pipeline (SEO + ads + landings + outreach)");
    const { runGrowthRamp } = await import("./pipeline/ramp.mjs");
    const ramp = await runGrowthRamp();
    summary.steps.push({ ramp: { target: ramp.targetUsd, revenue: ramp.metrics.revenueUsd, pct: ramp.metrics.pctOfTarget } });
    logEvent(null, "growth_ramp", ramp.metrics);

    log("Step: Uptime monitor checks");
    const uptime = await runUptimeChecks();
    summary.steps.push({ uptime });
    logEvent("statusping", "uptime_checks", uptime);

    const report = writeStatusReport(summary);
    summary.report = report;

    db.prepare("UPDATE runs SET finished_at = ?, status = ?, summary = ? WHERE id = ?").run(
      new Date().toISOString(),
      "ok",
      JSON.stringify(summary),
      runId
    );
    log("Cycle complete.");
    return summary;
  } catch (e) {
    log(`Cycle failed: ${e.message}`);
    db.prepare("UPDATE runs SET finished_at = ?, status = ?, summary = ? WHERE id = ?").run(
      new Date().toISOString(),
      "error",
      JSON.stringify({ error: e.message }),
      runId
    );
    throw e;
  }
}

function writeStatusReport(summary) {
  const path = join(getDataRoot(), "status-report.json");
  const config = JSON.parse(readFileSync(join(getRoot(), "config", "ventures.json"), "utf8"));
  let links = [];
  const linksPath = join(getDataRoot(), "payment-links.json");
  if (existsSync(linksPath)) links = JSON.parse(readFileSync(linksPath, "utf8"));

  const report = {
    generatedAt: new Date().toISOString(),
    ventures: config.ventures.map((v) => ({
      id: v.id,
      name: v.name,
      model: v.model,
      paymentLinks: links.filter((l) => l.venture_id === v.id).length,
      channels: v.channels,
    })),
    lastCycle: summary,
  };
  writeFileSync(path, JSON.stringify(report, null, 2) + "\n");
  return path;
}

if (process.argv[1]?.endsWith("orchestrator.mjs")) {
  runOrchestratorCycle().catch(() => process.exit(1));
}
