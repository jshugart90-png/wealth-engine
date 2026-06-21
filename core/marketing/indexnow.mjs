import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";

const INDEXNOW_ENDPOINTS = ["https://www.bing.com/indexnow", "https://api.indexnow.org/indexnow"];

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

async function submitViaGet(urls, key) {
  let accepted = 0;
  let failed = 0;
  const batchSize = 20;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (url) => {
        const q = new URL("https://www.bing.com/indexnow");
        q.searchParams.set("url", url);
        q.searchParams.set("key", key);
        try {
          const res = await fetch(q);
          return res.status === 200 || res.status === 202 ? "ok" : "fail";
        } catch {
          return "fail";
        }
      })
    );
    accepted += results.filter((r) => r === "ok").length;
    failed += results.filter((r) => r === "fail").length;
  }
  return { accepted, failed, method: "GET" };
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
  let result = { submitted: urls.length, ok: false, method: "POST" };

  try {
    const res = await fetch(INDEXNOW_ENDPOINTS[1], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    result = { ...result, ok: res.ok, status: res.status };
    if (!res.ok && res.status === 403) {
      const getResult = await submitViaGet(urls, key);
      result = {
        submitted: urls.length,
        ok: getResult.accepted > 0,
        status: getResult.failed === 0 ? 202 : 207,
        method: "GET",
        accepted: getResult.accepted,
        failed: getResult.failed,
      };
    }
  } catch (e) {
    result.error = e.message;
    const getResult = await submitViaGet(urls, key);
    result = {
      submitted: urls.length,
      ok: getResult.accepted > 0,
      method: "GET",
      accepted: getResult.accepted,
      failed: getResult.failed,
    };
  }

  writeFileSync(
    join(getDataRoot(), "marketing", "indexnow-log.json"),
    JSON.stringify({ ...result, urls, at: new Date().toISOString() }, null, 2)
  );
  return result;
}
