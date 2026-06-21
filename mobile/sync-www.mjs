/**
 * Sync dist/ assets into Capacitor www folders.
 * Usage: node sync-www.mjs [games|tools|all]
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(mobileRoot, "..");
const dist = join(repoRoot, "dist");
const target = process.argv[2] ?? "all";

function ensureBuild() {
  if (!existsSync(join(dist, "index.html"))) {
    console.log("dist/ missing — running npm run build…");
    execSync("npm run build", { cwd: repoRoot, stdio: "inherit" });
  }
}

function syncGames() {
  const www = join(mobileRoot, "games", "www");
  mkdirSync(www, { recursive: true });
  cpSync(join(dist, "games"), www, { recursive: true });
  // Capacitor entry
  if (!existsSync(join(www, "index.html"))) {
    writeFileSync(
      join(www, "index.html"),
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=./index.html"><title>Games</title></head><body></body></html>`
    );
  }
  console.log("Synced games → mobile/games/www");
}

function syncTools() {
  const www = join(mobileRoot, "tools", "www");
  mkdirSync(www, { recursive: true });

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Freelancer Tools — Wealth Engine</title>
<meta name="description" content="BillSnap invoices, free calculators, and business utilities.">
<link rel="manifest" href="/manifest.json">
<style>
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e8e8ef;margin:0;padding:20px}
h1{text-align:center} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;max-width:900px;margin:24px auto}
a{display:block;background:#14141c;border:1px solid #2a2a38;border-radius:12px;padding:20px;color:inherit;text-decoration:none}
a:hover{border-color:#6366f1} h2{margin:0 0 8px;font-size:18px} p{margin:0;color:#888;font-size:14px}
</style></head><body>
<h1>Freelancer Tools</h1>
<p style="text-align:center;color:#888">BillSnap + top free utilities</p>
<div class="grid">
  <a href="billsnap/index.html"><h2>BillSnap</h2><p>Invoice PDF in 30 seconds — $3 pro export</p></a>
  <a href="tools/tip-calculator.html"><h2>Tip Calculator</h2><p>Free — ad-supported</p></a>
  <a href="tools/meeting-cost-free.html"><h2>Meeting Cost</h2><p>Free viral calculator</p></a>
  <a href="tools/payment-terms-calculator.html"><h2>Net 30 Calculator</h2><p>Payment terms helper</p></a>
  <a href="tools/hourly-rate-calculator.html"><h2>Hourly Rate</h2><p>Freelancer pricing</p></a>
  <a href="tools/1099-tax-estimator.html"><h2>1099 Tax Estimator</h2><p>Quarterly tax planning</p></a>
</div>
<p style="text-align:center;margin-top:32px;font-size:13px"><a href="privacy.html" style="color:#6366f1">Privacy</a></p>
</body></html>`;

  writeFileSync(join(www, "index.html"), indexHtml);

  cpSync(join(dist, "billsnap"), join(www, "billsnap"), { recursive: true });
  cpSync(join(dist, "tools"), join(www, "tools"), { recursive: true });
  if (existsSync(join(dist, "privacy.html"))) cpSync(join(dist, "privacy.html"), join(www, "privacy.html"));
  if (existsSync(join(dist, "manifest.json"))) cpSync(join(dist, "manifest.json"), join(www, "manifest.json"));
  if (existsSync(join(dist, "sw.js"))) cpSync(join(dist, "sw.js"), join(www, "sw.js"));
  if (existsSync(join(dist, "assets"))) cpSync(join(dist, "assets"), join(www, "assets"), { recursive: true });

  console.log("Synced tools → mobile/tools/www");
}

ensureBuild();
if (target === "games" || target === "all") syncGames();
if (target === "tools" || target === "all") syncTools();
