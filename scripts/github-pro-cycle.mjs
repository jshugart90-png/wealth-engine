#!/usr/bin/env node
/**
 * GitHub Pro audit cycle — run until 8 AM US Central.
 * Usage: node scripts/github-pro-cycle.mjs [--once]
 */
import { execSync } from "child_process";
import { appendFileSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot } from "../core/env.mjs";

const root = getRoot();
const boardDir = join(root, "board");
const logPath = join(boardDir, "GITHUB_PRO.md");
const deployLog = join(boardDir, "DEPLOY_LOG.md");
const once = process.argv.includes("--once");

const PROD = "https://wealth-engine-0qlj.onrender.com";
const SAMPLE_URLS = [
  "/api/health",
  "/games/manifest.json",
  "/manifest.json",
  "/go/invoice.html",
  "/go/nda.html",
];

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...opts }).trim();
  } catch (e) {
    return e.stdout?.trim() || e.stderr?.trim() || e.message;
  }
}

function checkProd() {
  const results = [];
  for (const path of SAMPLE_URLS) {
    try {
      const r = execSync(`curl -s -o NUL -w "%{http_code}" "${PROD}${path}"`, {
        cwd: root,
        encoding: "utf8",
        shell: true,
      }).trim();
      results.push({ path, status: r, ok: r === "200" });
    } catch {
      results.push({ path, status: "FAIL", ok: false });
    }
  }
  return results;
}

function appendAudit(line) {
  const ts = new Date().toISOString();
  appendFileSync(logPath, `\n### ${ts}\n${line}\n`, "utf8");
}

async function cycle() {
  const ts = new Date().toISOString();
  const fixes = [];
  const errors = [];

  // Pull latest
  run("git fetch origin");
  const status = run("git status -sb");
  const ahead = status.match(/ahead (\d+)/)?.[1] ?? "0";

  // Build
  let buildOk = false;
  try {
    execSync("npm run build", { cwd: root, stdio: "pipe" });
    buildOk = true;
  } catch (e) {
    errors.push(`build failed: ${e.message?.slice(0, 200)}`);
  }

  // Preflight
  let preflightOk = false;
  try {
    const out = execSync("npm run mobile:preflight", { cwd: root, encoding: "utf8", stdio: "pipe" });
    preflightOk = out.includes('"failed": 0');
  } catch (e) {
    errors.push(`preflight failed: ${e.message?.slice(0, 200)}`);
  }

  // Prod health
  const prod = checkProd();
  const prodOk = prod.every((p) => p.ok);

  // Push if ahead
  if (ahead !== "0") {
    try {
      execSync("git push origin main", { cwd: root, stdio: "pipe" });
      fixes.push(`pushed ${ahead} commit(s)`);
    } catch (e) {
      errors.push(`push failed: ${e.message?.slice(0, 100)}`);
    }
  }

  const summary = [
    `- **Build:** ${buildOk ? "PASS" : "FAIL"}`,
    `- **Preflight:** ${preflightOk ? "PASS" : "FAIL"}`,
    `- **Prod:** ${prodOk ? "healthy" : "degraded"} (${prod.map((p) => `${p.path}=${p.status}`).join(", ")})`,
    `- **Git:** ${status.split("\n")[0]}`,
    errors.length ? `- **Errors:** ${errors.join("; ")}` : "",
    fixes.length ? `- **Actions:** ${fixes.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  appendAudit(summary);

  if (prodOk && buildOk) {
    appendFileSync(
      deployLog,
      `| ${ts} | GP | github-pro-cycle | ${SAMPLE_URLS.join(", ")} | PASS ${prod.length}/${prod.length} |\n`,
      "utf8"
    );
  }

  console.log(JSON.stringify({ ts, buildOk, preflightOk, prodOk, ahead, errors }, null, 2));
  return { buildOk, preflightOk, prodOk, errors };
}

function until8amCentral() {
  const now = new Date();
  // US Central is UTC-5 (CDT in June)
  const central = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const target = new Date(central);
  target.setHours(8, 0, 0, 0);
  if (central >= target) return 0;
  return target.getTime() - central.getTime();
}

if (once) {
  await cycle();
} else {
  while (until8amCentral() > 0) {
    await cycle();
    const ms = Math.min(30 * 60 * 1000, until8amCentral());
    if (ms <= 0) break;
    await new Promise((r) => setTimeout(r, ms));
  }
  console.log("GitHub Pro cycle complete — 8 AM Central reached or passed.");
}
