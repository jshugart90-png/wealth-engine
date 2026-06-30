import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl, loadEnv } from "../env.mjs";

const INDEXNOW_ENDPOINTS = ["https://www.bing.com/indexnow", "https://api.indexnow.org/indexnow"];
const PROD_BASE_URL = "https://wealth-engine-0qlj.onrender.com";

function getIndexNowBaseUrl() {
  const env = loadEnv();
  const base = (env.INDEXNOW_BASE_URL || getPublicBaseUrl()).replace(/\/$/, "");
  const host = new URL(base).hostname;
  if (host === "localhost" || host === "127.0.0.1") return PROD_BASE_URL;
  return base;
}

function indexNowKeyForHost(hostname) {
  return hostname.replace(/\./g, "-") + "-indexnow";
}

export function buildIndexNowKey() {
  const base = getIndexNowBaseUrl();
  const host = new URL(base).hostname;
  const key = indexNowKeyForHost(host);
  writeFileSync(join(getRoot(), "dist", `${key}.txt`), key);
  return { key, keyLocation: `${base}/${key}.txt` };
}

function normalizeSitemapUrl(url, base) {
  try {
    const parsed = new URL(url);
    const target = new URL(base);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.protocol = target.protocol;
      parsed.hostname = target.hostname;
      parsed.port = target.port;
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function listSitemapUrls(base) {
  const sitemapPath = join(getRoot(), "dist", "sitemap.xml");
  if (!existsSync(sitemapPath)) return [];
  const xml = readFileSync(sitemapPath, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalizeSitemapUrl(m[1], base));
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
  const base = getIndexNowBaseUrl();
  buildIndexNowKey();
  let urls = listSitemapUrls(base);
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
    if (!res.ok && (res.status === 403 || res.status === 429)) {
      const fallbackUrls = res.status === 429 ? urls.slice(0, 20) : urls;
      const getResult = await submitViaGet(fallbackUrls, key);
      result = {
        submitted: urls.length,
        ok: getResult.accepted > 0,
        status: getResult.failed === 0 ? 202 : 207,
        method: "GET",
        accepted: getResult.accepted,
        failed: getResult.failed,
        fallbackSubmitted: fallbackUrls.length,
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
