#!/usr/bin/env node
/**
 * Money Machine continuous daemon — orchestrator + agent pipeline rotation.
 * Logs to D:\wealth-engine-data\logs\money-machine-daemon.log
 */
import { appendFileSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { runOrchestratorCycle } from "../core/orchestrator.mjs";
import { runGrowthRamp } from "../core/pipeline/ramp.mjs";
import { parsePipeline, getNextAgent, runAgentStep, runAgentChain, getDataRoot } from "./agent-auto-runner.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = { ...process.env };
  const envPath = join(root, ".env");
  try {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  } catch {
    /* no .env */
  }
  return env;
}

function log(msg) {
  const dir = join(getDataRoot(), "logs");
  mkdirSync(dir, { recursive: true });
  const line = `[${new Date().toISOString()}] ${msg}`;
  appendFileSync(join(dir, "money-machine-daemon.log"), line + "\n");
  console.log(line);
}

const env = loadEnv();
const intervalMin = parseInt(env.MM_DAEMON_INTERVAL_MINUTES ?? env.RUN_INTERVAL_MINUTES ?? "60", 10);
const fullChainEachCycle = env.MM_FULL_CHAIN === "true";
const runOnce = process.argv.includes("--once");

async function daemonCycle() {
  log("── MM daemon cycle start ──");

  try {
    log("Step: orchestrator cycle");
    await runOrchestratorCycle();
  } catch (e) {
    log(`Orchestrator error: ${e.message}`);
  }

  try {
    log("Step: growth ramp");
    const ramp = await runGrowthRamp();
    log(`Ramp: revenue $${ramp.metrics?.revenueUsd ?? 0} (${ramp.metrics?.pctOfTarget ?? 0}% of target)`);
  } catch (e) {
    log(`Ramp error: ${e.message}`);
  }

  try {
    const pipelinePath = join(root, "board", "PIPELINE.md");
    const entries = parsePipeline(readFileSync(pipelinePath, "utf8"));
    const { agent, cycle } = getNextAgent(entries);
    log(`Step: agent pipeline (cycle ${cycle}, next: ${agent})`);

    if (fullChainEachCycle) {
      const results = await runAgentChain(agent, { kickNextCycle: true });
      log(`Full chain: ${results.length} agent step(s) completed`);
    } else {
      const r = await runAgentStep(agent, { force: true });
      if (r.skipped) log(`Agent skipped: ${r.reason}`);
      else log(`Agent ${r.from}: ${r.verdict} → ${r.to}`);
    }
  } catch (e) {
    log(`Agent error: ${e.message}`);
  }

  log("── MM daemon cycle end ──");
}

log(`Money Machine daemon starting (interval: ${intervalMin} min, fullChain: ${fullChainEachCycle})`);
await daemonCycle();

if (!runOnce) {
  setInterval(() => {
    daemonCycle().catch((e) => log(`Cycle crash: ${e.message}`));
  }, intervalMin * 60 * 1000);
}

process.on("SIGINT", () => {
  log("Money Machine daemon stopped.");
  process.exit(0);
});
