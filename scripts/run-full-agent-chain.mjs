#!/usr/bin/env node
/**
 * Execute the full Money Machine agent pipeline from the current handoff
 * through Final Boss, then kick Idea Guy + Research Guy for the next cycle.
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parsePipeline, getNextAgent, runAgentChain, AGENT_CHAIN } from "./agent-auto-runner.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const fromArg = (() => {
  const eq = args.find((a) => a.startsWith("--from="));
  if (eq) return eq.slice("--from=".length);
  const idx = args.indexOf("--from");
  if (idx >= 0 && args[idx + 1]) return args[idx + 1];
  return null;
})();
const noKick = args.includes("--no-kick");

const pipelinePath = join(root, "board", "PIPELINE.md");
const entries = parsePipeline(readFileSync(pipelinePath, "utf8"));
const { agent, cycle, reason } = getNextAgent(entries);

console.log(`Money Machine — full agent chain`);
console.log(`  Start: ${fromArg ?? agent} (cycle ${cycle})`);
console.log(`  Reason: ${reason}`);
console.log(`  Chain: ${AGENT_CHAIN.join(" → ")}\n`);

const start = fromArg ?? agent;
const startIdx = AGENT_CHAIN.indexOf(start);
if (startIdx < 0) {
  console.error(`Unknown agent: ${start}`);
  process.exit(1);
}

const results = await runAgentChain(start, { kickNextCycle: !noKick });

for (const r of results) {
  if (r.skipped) {
    console.log(`  SKIP ${r.reason}`);
    continue;
  }
  console.log(`  ✓ ${r.from} → ${r.to} | ${r.verdict} | ${r.subject}`);
}

const final = results[results.length - 1];
console.log(`\nDone. ${results.length} step(s). Next agent: ${final?.nextAgent ?? "unknown"}`);
process.exit(0);
