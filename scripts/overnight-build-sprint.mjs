#!/usr/bin/env node
/**
 * Overnight build sprint — hourly cycles until review time (7:45 AM US Central).
 * Each cycle: pop keywords from queue, build, commit, push, deploy, verify, optional agent:chain.
 * At review time: summary:overnight + write-wealth-status + update state.md metrics.
 */
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync, spawn } from "child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = process.env.WEALTH_DATA_ROOT ?? "D:\\wealth-engine-data";
const logPath = join(dataRoot, "logs", "overnight-sprint.log");
const REVIEW_HOUR_CT = 7;
const REVIEW_MINUTE_CT = 45;
const INTERVAL_MS = parseInt(process.env.SPRINT_INTERVAL_MS ?? String(60 * 60 * 1000), 10);
const PROD_BASE = process.env.PUBLIC_BASE_URL ?? "https://wealth-engine-0qlj.onrender.com";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  mkdirSync(join(dataRoot, "logs"), { recursive: true });
  appendFileSync(logPath, line + "\n");
  console.log(line);
}

function ctNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
}

function msUntilReview() {
  const now = ctNow();
  const target = new Date(now);
  target.setHours(REVIEW_HOUR_CT, REVIEW_MINUTE_CT, 0, 0);
  if (now >= target) return 0;
  return target - now;
}

function run(cmd, opts = {}) {
  log(`$ ${cmd}`);
  return execSync(cmd, { cwd: root, encoding: "utf8", stdio: opts.silent ? "pipe" : "inherit", ...opts });
}

function popKeywords(n = 5) {
  const queuePath = join(root, "config", "overnight-keyword-queue.json");
  const seoPath = join(root, "config", "seo-keywords.json");
  if (!existsSync(queuePath)) return 0;
  const queue = JSON.parse(readFileSync(queuePath, "utf8"));
  const seo = JSON.parse(readFileSync(seoPath, "utf8"));
  const existing = new Set(seo.keywords.map((k) => k.slug));
  const batch = [];
  while (batch.length < n && queue.queue.length > 0) {
    const kw = queue.queue.shift();
    if (!existing.has(kw.slug)) batch.push(kw);
  }
  if (batch.length === 0) return 0;
  seo.keywords.push(...batch);
  writeFileSync(seoPath, JSON.stringify(seo, null, 2) + "\n");
  writeFileSync(queuePath, JSON.stringify(queue, null, 2) + "\n");
  log(`Added ${batch.length} SEO keywords: ${batch.map((k) => k.slug).join(", ")}`);
  return batch.length;
}

async function verifyUrls(paths) {
  const results = [];
  for (const p of paths) {
    try {
      const r = await fetch(`${PROD_BASE}${p}`, { method: "HEAD", redirect: "follow" });
      results.push({ path: p, status: r.status });
      log(`Verify ${p} → ${r.status}`);
    } catch (e) {
      results.push({ path: p, error: e.message });
      log(`Verify ${p} → ERROR ${e.message}`);
    }
  }
  writeFileSync(join(dataRoot, "marketing", "last-verify.json"), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
  return results;
}

async function sprintCycle(cycleNum) {
  log(`── Cycle ${cycleNum} start ──`);
  popKeywords(5);

  run("npm run build");
  try {
    const { buildGoogleAdsCsv } = await import("../core/pipeline/ads-export.mjs");
    buildGoogleAdsCsv();
  } catch (e) {
    log(`Ads CSV refresh skipped: ${e.message}`);
  }

  const status = run("git status --porcelain", { silent: true });
  if (status.trim()) {
    run('git add config/seo-keywords.json config/overnight-keyword-queue.json core/ ventures/ board/');
    run(`git commit -m "Overnight cycle ${cycleNum}: SEO keywords, build refresh"`);
    run("git push origin main");
    run("npm run deploy:render");
    await new Promise((r) => setTimeout(r, 90000));
    await verifyUrls([
      "/api/health",
      "/go/invoice.html",
      "/go/compare.html",
      "/tools/compound-interest-calculator.html",
      "/sitemap.xml",
    ]);
  } else {
    log("No git changes — skip commit/push");
  }

  if (cycleNum % 2 === 0) {
    try {
      run("npm run agent:chain -- --no-kick", { silent: false });
    } catch (e) {
      log(`Agent chain error: ${e.message}`);
    }
  }

  log(`── Cycle ${cycleNum} end ──`);
}

async function runReview() {
  log("══ Review phase (7:45 AM CT) ══");
  run("npm run build");
  run("npm run summary:overnight");
  run("node scripts/write-wealth-status.mjs");
  log("Review deliverables written");
}

async function main() {
  log(`Overnight sprint started. Review at ${REVIEW_HOUR_CT}:${String(REVIEW_MINUTE_CT).padStart(2, "0")} CT`);
  let cycle = 1;

  while (msUntilReview() > INTERVAL_MS / 2) {
    await sprintCycle(cycle);
    cycle++;
    const wait = Math.min(INTERVAL_MS, msUntilReview());
    if (wait <= 0) break;
    log(`Sleeping ${Math.round(wait / 60000)} min until next cycle`);
    await new Promise((r) => setTimeout(r, wait));
  }

  await runReview();
  log(`Sprint complete. ${cycle - 1} build cycles executed.`);
}

main().catch((e) => {
  log(`FATAL: ${e.message}`);
  process.exit(1);
});
