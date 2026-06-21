#!/usr/bin/env node
/**
 * Daily Reddit draft generation — 3 drafts/day from active MARKETING.md campaigns.
 * Callable from overnight sprint or marketing director cycle.
 *
 * Usage: node scripts/reddit-draft-daily.mjs [--date YYYY-MM-DD] [--count 3]
 */
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const count = process.argv.find((a) => a.startsWith("--count="))?.split("=")[1] ||
  (process.argv.includes("--count") ? process.argv[process.argv.indexOf("--count") + 1] : "3");
const date = process.argv.find((a) => a.startsWith("--date="))?.split("=")[1] ||
  (process.argv.includes("--date") ? process.argv[process.argv.indexOf("--date") + 1] : new Date().toISOString().slice(0, 10));

const script = path.join(ROOT, "scripts", "reddit-draft-queue.mjs");
const out = execSync(`node "${script}" --generate --count ${count} --date ${date}`, {
  cwd: ROOT,
  encoding: "utf8",
});
console.log(out);
