import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { listAllSeoUrls } from "./seo-pages.mjs";

export async function submitIndexNow() {
  const base = getPublicBaseUrl();
  const urls = listAllSeoUrls().slice(-5).map((u) => `${base}${u}`);
  if (urls.length === 0) urls.push(base);

  const host = new URL(base).hostname;
  const key = host.replace(/\./g, "-") + "-indexnow";
  const keyLocation = `${base}/${key}.txt`;
  writeFileSync(join(getRoot(), "dist", `${key}.txt`), key);

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
