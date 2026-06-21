# Google Search Console + Bing Webmaster (free)

**Site:** https://wealth-engine-0qlj.onrender.com  
**Sitemap:** https://wealth-engine-0qlj.onrender.com/sitemap.xml  
**Cost:** $0  
**Time:** ~10 min if you use URL-prefix + Bing import (no GoDaddy required for Render hostname)

---

## Do this once (minimal path)

1. **Google Search Console** — https://search.google.com/search-console  
   - **Add property** → **URL prefix:** `https://wealth-engine-0qlj.onrender.com/`  
   - **Verify:** HTML tag or file upload on the next deploy (skip DNS if you only care about the Render URL).  
   - **Sitemaps** → submit `sitemap.xml` (full URL above).

2. **Bing Webmaster Tools** — https://www.bing.com/webmasters  
   - **Add site** → **Import from Google Search Console** (fastest; no second DNS step).  
   - **Sitemaps** → same `sitemap.xml` URL.

3. **IndexNow (after Bing shows the site verified)** — from repo root:

   ```powershell
   cd C:\Users\jshug\wealth-engine
   node -e "import('./core/marketing/indexnow.mjs').then(m => m.submitIndexNow().then(console.log))"
   ```

   Key file (must stay live):  
   `https://wealth-engine-0qlj.onrender.com/wealth-engine-0qlj-onrender-com-indexnow.txt`  
   Log: `D:\wealth-engine-data\marketing\indexnow-log.json` — expect `ok: true`, not HTTP 403.

**Why IndexNow failed:** API returns **403** when the host is not verified in Bing Webmaster (~291 URLs queued). Key file alone is not enough.

---

## Sitemap ping (do not rely on)

| Endpoint | Result (2026-06-21) |
|----------|---------------------|
| `GET https://www.google.com/ping?sitemap=…` | **404** — ping deprecated ([Google blog](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)) |
| `GET https://www.bing.com/ping?sitemap=…` | **410** — gone |

Use **GSC + Bing sitemap submit** instead; keep `lastmod` fresh on URLs in `sitemap.xml`.

---

## Optional: custom domain (GoDaddy DNS)

Only if you verify a **Domain** property (apex + subdomains):

1. GSC → Verify → **Domain name provider** → copy TXT.  
2. GoDaddy → DNS → TXT, Host `@`, paste, TTL 600 → Save → wait 5–60 min → Verify.  
3. Repeat TXT if Bing asks for its own record (or still use **Import from GSC**).

---

## Weekly checks (free)

| Check | Where |
|-------|--------|
| Indexed pages | GSC → Pages |
| Crawl errors | GSC → Page indexing |
| Bing crawl | Bing → URL Inspection |
| IndexNow | `indexnow-log.json` |

---

## Not in scope

- Paid ads — `board/MARKETING.md` BLOCKED_NO_BUDGET  
- Paid rank trackers — use GSC/Bing only  

**Related:** `D:\wealth-engine-data\marketing\ZERO_BUDGET_PLAYBOOK.md`
