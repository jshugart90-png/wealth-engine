#!/usr/bin/env node
/**
 * Verify Stripe payment links on all venture landings and /go/* conversion pages.
 * Run: node scripts/verify-payment-links.mjs
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot } from "../core/env.mjs";
import { getAllPaymentLinks } from "../core/commerce.mjs";
import { getDb } from "../core/db.mjs";

const root = getRoot();
const dist = join(root, "dist");
const issues = [];
const ok = [];

function scanHtml(file, label) {
  const html = readFileSync(file, "utf8");
  if (html.includes("#checkout-pending")) {
    issues.push({ file: label, issue: "checkout-pending placeholder" });
    return;
  }
  const stripeLinks = (html.match(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g) ?? []).length;
  const payPlaceholders = (html.match(/\{\{PAY:[^}]+\}\}/g) ?? []).length;
  if (payPlaceholders > 0) {
    issues.push({ file: label, issue: `${payPlaceholders} uninjected PAY placeholders` });
    return;
  }
  if (stripeLinks > 0 || !html.includes("Get pro access") && !html.includes("Subscribe") && !html.includes("$")) {
    ok.push({ file: label, stripeLinks });
  } else if (html.includes('href="#"') && html.includes("btn")) {
    issues.push({ file: label, issue: "empty checkout href" });
  } else {
    ok.push({ file: label, stripeLinks: 0 });
  }
}

// Ensure DB loaded for payment links
try {
  getDb();
} catch {
  /* CI may lack DB */
}

const linksPath = join(getDataRoot(), "payment-links.json");
const catalogCount = existsSync(linksPath)
  ? JSON.parse(readFileSync(linksPath, "utf8")).length
  : getAllPaymentLinks().length;

// Venture pages
for (const dir of readdirSync(dist, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const page of ["index.html", "pricing.html"]) {
    const fp = join(dist, dir.name, page);
    if (existsSync(fp)) scanHtml(fp, `${dir.name}/${page}`);
  }
}

// /go/* landings
const goDir = join(dist, "go");
if (existsSync(goDir)) {
  for (const f of readdirSync(goDir).filter((x) => x.endsWith(".html"))) {
    scanHtml(join(goDir, f), `go/${f}`);
  }
}

const report = {
  ok: issues.length === 0,
  catalogSkus: catalogCount,
  pagesOk: ok.length,
  issues,
  summary: issues.length === 0 ? "All payment links verified" : `${issues.length} issue(s) found`,
};
console.log(JSON.stringify(report, null, 2));
process.exit(issues.length ? 1 : 0);
