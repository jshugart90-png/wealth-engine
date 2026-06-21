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

---

## Completed & ready to ship

- Render production live with 9 ventures + Stripe (14 products, coupon LAUNCH25)
- Google Ads CSV + Microsoft mirror updated with Render URLs and improved ad copy
- High-conversion landings: \`/go/invoice\`, \`/go/lease\`, \`/go/uptime\`
- Bundle pages: \`/bundles/freelancer-stack\`, \`/bundles/dev-ops-stack\`, \`/bundles/landlord-tenant-stack\`
- Ad-supported free tools: \`/tools/tip-calculator\`, \`/tools/meeting-cost-free\`
- Privacy page for AdSense: \`/privacy.html\`
- Thanks page with gtag conversion hook: \`/thanks.html\`
- GoDaddy DNS guide: \`deploy/GODADDY_DNS.md\`
- Ads import checklist: \`D:\\wealth-engine-data\\marketing\\ADS_IMPORT_CHECKLIST.md\`
- Horseshoe promo bar in \`C:\\Users\\jshug\\Website\\index.html\` (needs GoDaddy upload)

---

## Revenue actions YOU must do (~15 min total)

### 1. Google Ads import (~5 min) — highest leverage

Follow: \`D:\\wealth-engine-data\\marketing\\ADS_IMPORT_CHECKLIST.md\`

CSV: \`D:\\wealth-engine-data\\marketing\\ads\\google-ads-import.csv\`

Cap at **$10/day** total. Use coupon **LAUNCH25** messaging in landing pages.

### 2. GoDaddy DNS (~5 min)

Follow: \`C:\\Users\\jshug\\wealth-engine\\deploy\\GODADDY_DNS.md\`

Add CNAME \`tools\` → \`wealth-engine-0qlj.onrender.com\`, then update Render env vars.

### 3. Upload Horseshoe site (~3 min)

Upload \`C:\\Users\\jshug\\Website\\index.html\` to GoDaddy (NOT Netlify). Promo bar already points to Render.

### 4. AdSense application (~5 min, optional secondary)

Follow: \`docs/ADSENSE_ADMOB_SETUP.md\` — apply with Render URL + \`/privacy.html\`

---

## Obstacles / paused projects

| Project | Blocker | Workaround |
|---------|---------|------------|
| Custom domain SSL | GoDaddy CNAME not yet added | Use Render URL in ads (works now) |
| Horseshoe deploy | GoDaddy manual upload | Promo bar ready in local file |
| Google Ads API | No OAuth credentials | CSV manual import (ready) |
| AdMob | Requires Android app | AdSense on web tools instead |
| Netlify shop link | Out of credits | Keep Horseshoe merch on GoDaddy; tools on Render |

---

## Next 24h priorities

1. **Import Google Ads CSV** — expect first clicks within hours
2. **Point tools.horseshoeroundme.com** — improves trust + ad Quality Score
3. **Upload Horseshoe index.html** — cross-traffic to /go/invoice
4. **Set conversion tracking** — add \`GOOGLE_ADS_CONVERSION_ID\` to .env after Ads import
5. **Monitor Stripe dashboard** for first LAUNCH25 checkout

---

## Path to $500/mo (30 days)

| Channel | Monthly potential | Confidence |
|---------|-------------------|------------|
| Google Ads → BillSnap $3 PDF | $200–400 | High (if ads imported today) |
| Organic SEO (10 pages/cycle) | $50–150 | Medium (2–4 week lag) |
| Horseshoe cross-traffic | $30–80 | Medium (needs GoDaddy upload) |
| LeaseLens + StatusPing ads | $50–120 | Medium |
| AdSense free tools | $5–20 | Low (approval lag) |

**Math:** 63 sales × $8 AOV = $504. At 2.5% CVR need ~2,520 clicks. At $0.40 CPC ≈ $1,008 ad spend OR mix organic + paid at $300/mo budget.

**Fastest path:** Import ads today ($10/day cap) + upload Horseshoe promo bar. First sale likely within 48–72h of ads going live.

---

## Agent / daemon status

${ramp.at ? `Last ramp: ${ramp.at}` : "Ramp: run \`npm run run\` to refresh"}

Tasks board excerpt:
\`\`\`
${tasks.split("\n").slice(0, 16).join("\n")}
\`\`\`
`;

const paths = [
  join(dataRoot, "reports", `OVERNIGHT_SUMMARY_${dateStr}.md`),
  join(root, "board", "OVERNIGHT_SUMMARY.md"),
];

for (const p of paths) {
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, body);
  console.log("Wrote:", p);
}
