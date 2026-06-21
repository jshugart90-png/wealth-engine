import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";

function indexNowKeyForHost(hostname) {
  return hostname.replace(/\./g, "-") + "-indexnow";
}

export function buildIndexNowKey() {
  const base = getPublicBaseUrl();
  const host = new URL(base).hostname;
  const key = indexNowKeyForHost(host);
  writeFileSync(join(getRoot(), "dist", `${key}.txt`), key);
  return { key, keyLocation: `${base}/${key}.txt` };
}

function listSitemapUrls() {
  const sitemapPath = join(getRoot(), "dist", "sitemap.xml");
  if (!existsSync(sitemapPath)) return [];
  const xml = readFileSync(sitemapPath, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

export async function submitIndexNow() {
  const base = getPublicBaseUrl();
  buildIndexNowKey();
  let urls = listSitemapUrls();
  if (urls.length === 0) urls = [base.replace(/\/$/, "")];

  const host = new URL(base).hostname;
  const key = indexNowKeyForHost(host);
  const keyLocation = `${base}/${key}.txt`;

  const body = { host, key, keyLocation, urlList: urls };
  let result = { submitted: urls.length, ok: false };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    result = { ...result, ok: res.ok, status: res.status };
  } catch (e) {
    result.error = e.message;
  }
  writeFileSync(join(getDataRoot(), "marketing", "indexnow-log.json"), JSON.stringify({ ...result, urls, at: new Date().toISOString() }, null, 2));
  return result;
}
