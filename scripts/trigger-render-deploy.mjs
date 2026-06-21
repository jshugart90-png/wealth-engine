#!/usr/bin/env node
/** Trigger Render deploy via API key from ~/.render/cli.yaml */
import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const SERVICE_ID = process.env.RENDER_SERVICE_ID ?? "srv-d8rlh4favr4c73eo9dng";

function getApiKey() {
  const yaml = readFileSync(join(homedir(), ".render", "cli.yaml"), "utf8");
  const m = yaml.match(/key:\s*(.+)/);
  if (!m) throw new Error("No API key in ~/.render/cli.yaml");
  return m[1].trim();
}

const key = getApiKey();
const r = await fetch(`https://api.render.com/v1/services/${SERVICE_ID}/deploys`, {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ clearCache: "do_not_clear" }),
});
const text = await r.text();
console.log("Render deploy:", r.status, text.slice(0, 200));
if (!r.ok) process.exit(1);
