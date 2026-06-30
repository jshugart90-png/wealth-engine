#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getDataRoot, getMarketingBaseUrl } from "../core/env.mjs";
import { submitIndexNow } from "../core/marketing/indexnow.mjs";

const base = getMarketingBaseUrl();
const feedUrl = `${base}/feed.xml`;
const sitemapUrl = `${base}/sitemap.xml`;
const results = [];

async function postForm(name, url, body) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });
    results.push({ name, status: res.status, ok: res.ok });
  } catch (e) {
    results.push({ name, error: e.message, ok: false });
  }
}

async function postXmlRpc(name, url, methodName, params) {
  const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>${params.map((value) => `<param><value><string>${escapeXml(value)}</string></value></param>`).join("")}</params>
</methodCall>`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: xml,
    });
    results.push({ name, status: res.status, ok: res.ok });
  } catch (e) {
    results.push({ name, error: e.message, ok: false });
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const indexNow = await submitIndexNow();
results.push({ name: "indexnow", ...indexNow });

await postForm("websub-google-feed", "https://pubsubhubbub.appspot.com/", {
  "hub.mode": "publish",
  "hub.url": feedUrl,
});

await postForm("websub-google-sitemap", "https://pubsubhubbub.appspot.com/", {
  "hub.mode": "publish",
  "hub.url": sitemapUrl,
});

await postXmlRpc("pingomatic", "http://rpc.pingomatic.com/", "weblogUpdates.ping", [
  "Wealth Engine",
  base,
  feedUrl,
]);

const report = {
  at: new Date().toISOString(),
  base,
  feedUrl,
  sitemapUrl,
  results,
};

const outDir = join(getDataRoot(), "marketing");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "free-discovery-submit.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
