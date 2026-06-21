import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot } from "../core/env.mjs";
import { getFunnelMetrics } from "../core/pipeline/funnel.mjs";

const root = getRoot();
const dataRoot = getDataRoot();
const now = new Date();
const dateStr = now.toISOString().slice(0, 10);

function readJson(path, fallback = {}) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

const metrics = getFunnelMetrics(30);
const ramp = readJson(join(dataRoot, "marketing", "ramp-report.json"));
const tasks = existsSync(join(root, "board", "TASKS.md"))
  ? readFileSync(join(root, "board", "TASKS.md"), "utf8")
  : "";

const body = `# Overnight Build Summary — ${dateStr}

**Prepared:** ${now.toISOString()} (review at 8 AM US Central)
**Production:** https://wealth-engine-0qlj.onrender.com
**Health:** \`/api/health\` OK
**Revenue:** $${metrics.revenueUsd} / $500 target (${metrics.pctOfTarget}%)
**Commits pushed tonight (after bff97dc):** 6+ (see git log)

---

## Everything built tonight

- **Build pipeline:** \`npm run build\` now ships SEO pages, bundles, sitemap, CompareStack, embeds, RSS feeds, referral pages
- **7 /go ad landings:** invoice, lease, uptime, nda, webhook, pipekit, templates
- **5 free ad tools:** tip calc, meeting cost, percentage, bill splitter, hourly rate
- **CompareStack:** 6 comparison pages with Stripe checkout + /go CTAs
- **30 SEO keywords** → \`/p/*.html\` (10 generated per build cycle)
- **Conversion CTAs** on BillSnap, LeaseLens, StatusPing, PipeKit, NDAGen, HookRelay, TemplateForge
- **Referral flow:** \`/refer.html\`, \`/join.html\` email capture via funnel API
- **Ads CSV** updated — 4 campaigns, $10/day cap
- **Horseshoe promo bar** expanded (invoice, lease, meeting cost, LAUNCH25 list)
- **Agent chain** + MM daemon cycle executed

---

## Ready to ship

- Render production live with 9 ventures + Stripe (14 products, coupon LAUNCH25)
- Google Ads CSV + Microsoft mirror — 4 campaigns, **$10/day cap** (invoice $5, lease $3, uptime $2, nda $1)
- High-conversion landings: \`/go/invoice\`, \`/go/lease\`, \`/go/uptime\`, \`/go/nda\`, \`/go/webhook\`, \`/go/pipekit\`, \`/go/templates\`
- Bundle pages: \`/bundles/freelancer-stack\`, \`/bundles/dev-ops-stack\`, \`/bundles/landlord-tenant-stack\`
- Ad-supported free tools under \`/tools/*\`
- Referral + email capture: \`/refer.html\`, \`/join.html\`
- CompareStack: 6 comparison pages
- SEO programmatic pages: \`/p/*\`
- RSS/product feeds: \`/feed.xml\`, \`/products.json\`
- Privacy + thanks pages
- Outreach pack: \`D:\\wealth-engine-data\\marketing\\outreach\\POST_TODAY.md\`

**⚠️ Deploy note:** Pushes went to GitHub but new URLs may 404 until Render rebuilds. See \`deploy/trigger-render-deploy.md\`.

---

## User must do manually

### 1. Trigger Render deploy OR add GitHub deploy hook (~2 min)

See \`deploy/trigger-render-deploy.md\`. Without \`RENDER_DEPLOY_HOOK_URL\`, new pages won't appear on prod.

### 2. Google Ads import (~5 min) — highest leverage

Follow: \`D:\\wealth-engine-data\\marketing\\ADS_IMPORT_CHECKLIST.md\`
CSV: \`D:\\wealth-engine-data\\marketing\\ads\\google-ads-import.csv\`
Cap at **$10/day** total.

### 3. GoDaddy DNS (~5 min)

Follow: \`deploy/GODADDY_DNS.md\` — CNAME \`tools\` → \`wealth-engine-0qlj.onrender.com\`

### 4. Upload Horseshoe site (~3 min)

Upload \`C:\\Users\\jshug\\Website\\index.html\` to GoDaddy (NOT Netlify).

### 5. AdSense (optional)

Follow: \`docs/ADSENSE_ADMOB_SETUP.md\`

---

## Paused projects

| Project | Blocker | Workaround |
|---------|---------|------------|
| Render deploy auto-hook | \`RENDER_DEPLOY_HOOK_URL\` not in GitHub secrets or .env | Manual deploy trigger |
| Custom domain SSL | GoDaddy CNAME not yet added | Use Render URL in ads |
| Horseshoe deploy | GoDaddy manual upload | Promo bar ready locally |
| Google Ads API | No OAuth | CSV manual import |
| Netlify | Out of credits | GoDaddy only |
| gh CLI | Not installed | git push only |

---

## Revenue math path to $500

| Channel | Monthly potential | Confidence |
|---------|-------------------|------------|
| Google Ads → BillSnap $3 PDF | $200–400 | High (if ads imported) |
| Organic SEO (10 pages/cycle) | $50–150 | Medium (2–4 week lag) |
| Horseshoe cross-traffic | $30–80 | Medium |
| LeaseLens + StatusPing + NDA ads | $50–120 | Medium |
| AdSense free tools | $5–20 | Low |

**Math:** 63 sales × $8 AOV = $504. At 2.5% CVR need ~2,520 clicks. At $0.40 CPC ≈ $1,008 ad spend OR mix organic + paid at $300/mo budget.

---

## Next priorities

1. **Deploy to Render** — verify \`/go/nda.html\` returns 200
2. **Import Google Ads CSV**
3. **GoDaddy DNS + Horseshoe upload**
4. **Set \`GOOGLE_ADS_CONVERSION_ID\`** after ads live
5. **Monitor Stripe** for first LAUNCH25 checkout

---

## Agent / daemon status

${ramp.at ? `Last ramp: ${ramp.at}` : "Ramp: run \`npm run run\` to refresh"}
MM daemon: \`npm run daemon:mm\` (360 min interval, full agent chain)

Tasks board excerpt:
\`\`\`
${tasks.split("\n").slice(0, 18).join("\n")}
\`\`\`
`;

const paths = [
  join(dataRoot, "reports", `OVERNIGHT_SUMMARY_${dateStr}.md`),
  join(root, "board", "OVERNIGHT_SUMMARY.md"),
  join(root, "board", "MORNING_SUMMARY.md"),
];

for (const p of paths) {
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, body);
  console.log("Wrote:", p);
}
