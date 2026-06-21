#!/usr/bin/env node
/**
 * Reads board/PIPELINE.md and shows who should run next in the Money Machine loop.
 * Also surfaces ramp metrics from the growth pipeline.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const AGENT_CHAIN = [
  "Idea Guy",
  "Research Guy",
  "Realistic Guy",
  "Money Math Guy",
  "Marketing Guy",
  "Stripe Money Guy",
  "Bug Checker Guy",
  "Code Cracker Guy",
  "Security Guy",
  "Deploy Guy",
  "Final Boss",
];

const AGENT_RULE = {
  "Idea Guy": "idea-guy",
  "Research Guy": "research-guy",
  "Realistic Guy": "realistic-guy",
  "Money Math Guy": "money-math-guy",
  "Marketing Guy": "marketing-guy",
  "Stripe Money Guy": "stripe-money-guy",
  "Bug Checker Guy": "bug-checker-guy",
  "Code Cracker Guy": "code-cracker-guy",
  "Security Guy": "security-guy",
  "Deploy Guy": "deploy-guy",
  "Final Boss": "final-boss",
};

function getDataRoot() {
  const envPath = join(root, ".env");
  const env = { ...process.env };
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
  if (env.WEALTH_DATA_ROOT) return env.WEALTH_DATA_ROOT;
  if (existsSync("D:\\")) return "D:\\wealth-engine-data";
  return join(root, "data");
}

function parsePipeline(md) {
  const entries = [];
  const blocks = md.split(/^### /m).slice(1);
  for (const block of blocks) {
    const header = block.split("\n")[0];
    const hm = header.match(/^([\d-T:.Z]+)\s+(.+?)\s+→\s+(.+?)$/);
    if (!hm) continue;
    const get = (key) => {
      const m = block.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`));
      return m ? m[1].trim() : null;
    };
    entries.push({
      at: hm[1],
      from: hm[2].trim(),
      to: hm[3].trim(),
      cycle: get("Cycle"),
      verdict: get("Verdict"),
      subject: get("Subject"),
      summary: get("Summary"),
    });
  }
  return entries;
}

function loadRampReport(dataRoot) {
  const path = join(dataRoot, "marketing", "ramp-report.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function loadTasks() {
  const path = join(root, "board", "TASKS.md");
  if (!existsSync(path)) return [];
  const md = readFileSync(path, "utf8");
  const rows = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^\|\s*(T-\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(\w+)\s*\|/);
    if (m && m[4] !== "done") rows.push({ id: m[1], task: m[2].trim(), owner: m[3].trim(), status: m[4] });
  }
  return rows;
}

const pipelinePath = join(root, "board", "PIPELINE.md");
if (!existsSync(pipelinePath)) {
  console.error("board/PIPELINE.md missing — run Idea Guy first");
  process.exit(1);
}

const md = readFileSync(pipelinePath, "utf8");
const entries = parsePipeline(md);
const last = entries[entries.length - 1] ?? null;
const dataRoot = getDataRoot();
const ramp = loadRampReport(dataRoot);
const openTasks = loadTasks();

let nextAgent = "Idea Guy";
let nextRule = "idea-guy";
let reason = "No pipeline entries — start cycle 1";

if (last) {
  if (last.to === "Idea Guy" || last.from === "Final Boss") {
    nextAgent = "Idea Guy";
    nextRule = "idea-guy";
    reason = "Final Boss closed cycle — start next cycle";
  } else {
    nextAgent = last.to;
    nextRule = AGENT_RULE[last.to] ?? last.to.toLowerCase().replace(/\s+/g, "-");
    reason = `Last handoff: ${last.from} → ${last.to} (${last.verdict})`;
  }
}

const cycle = last?.cycle ?? "1";
const idx = AGENT_CHAIN.indexOf(nextAgent);

console.log(`
╔══════════════════════════════════════════════════════════╗
║  MONEY MACHINE — Agent Cycle Helper                      ║
╚══════════════════════════════════════════════════════════╝

Target:     $500/mo (config/growth-target.json)
Data root:  ${dataRoot}
Products:   14 Stripe SKUs (config/ventures.json)

── Last pipeline entry ──
${last ? `  ${last.at}  ${last.from} → ${last.to}
  Cycle ${last.cycle} | ${last.verdict} | ${last.subject}
  ${last.summary ?? ""}` : "  (none)"}

── Run next ──
  Agent:  ${nextAgent}  (@${nextRule})
  Cycle:  ${cycle}
  Why:    ${reason}
  Chain:  ${AGENT_CHAIN.map((a, i) => (i === idx ? `[${a}]` : a)).join(" → ")}

── Open tasks (board/TASKS.md) ──
${openTasks.length ? openTasks.map((t) => `  ${t.id} [${t.status}] ${t.task} (${t.owner})`).join("\n") : "  (none)"}

── Growth ramp (core/pipeline/ramp.mjs) ──
${ramp
  ? `  Target: $${ramp.targetUsd}/mo
  Revenue (30d): $${ramp.metrics?.revenueUsd ?? "?"} (${ramp.metrics?.pctOfTarget ?? "?"}% of target)
  Report: ${join(dataRoot, "marketing", "ramp-report.json")}`
  : `  No ramp report yet — run: npm run run`}

── Quick start in Cursor ──
  1. Open board/PIPELINE.md
  2. New chat → @${nextRule} (or pick rule from .cursor/rules/)
  3. Agent appends verdict to PIPELINE.md when done
  4. Repeat: node scripts/run-agent-cycle.mjs
`);
