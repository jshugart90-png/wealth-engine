#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot } from "../core/env.mjs";

const root = getRoot();
const files = [
  "sitemap.xml",
  "robots.txt",
  "feed.xml",
  "products.json",
  "ai-products.json",
  "llms.txt",
  "manifest.json",
  "games/manifest.json",
];
const issues = [];

for (const file of files) {
  const path = join(root, "dist", file);
  if (!existsSync(path)) {
    issues.push({ file, issue: "missing" });
    continue;
  }
  const body = readFileSync(path, "utf8");
  if (body.includes("localhost") || body.includes("127.0.0.1") || body.includes(":8787")) {
    issues.push({ file, issue: "contains local URL" });
  }
}

const report = {
  ok: issues.length === 0,
  checked: files.length,
  issues,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
