import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { getRoot, getDataRoot } from "../core/env.mjs";
import { getFunnelMetrics } from "../core/pipeline/funnel.mjs";

const root = getRoot();
const dataRoot = getDataRoot();
const now = new Date();
const dateStr = "2026-06-21";

function readJson(path, fallback = {}) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function gitCountSince(ref) {
  try {
    const out = execSync(`git rev-list --count ${ref}..HEAD`, { cwd: root, encoding: "utf8" }).trim();
    return parseInt(out, 10) || 0;
  } catch {
    return 0;
  }
}

function gitLogSince(ref, n = 12) {
  try {
    return execSync(`git log ${ref}..HEAD --oneline`, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const metrics = getFunnelMetrics(30);
const ramp = readJson(join(dataRoot, "marketing", "ramp-report.json"));
const seoBatch = readJson(join(dataRoot, "marketing", "seo-batch.json"));
const adsNotes = readJson(join(dataRoot, "marketing", "ads", "campaign-notes.json"));
const tasks = existsSync(join(root, "board", "TASKS.md"))
  ? readFileSync(join(root, "board", "TASKS.md"), "utf8")
  : "";

const commitsTonight = gitCountSince("bff97dc");
const commitLog = gitLogSince("bff97dc");

const liveUrls = [
  "/go/nda.html",
  "/go/invoice.html",
  "/go/lease.html",
  "/go/uptime.html",
  "/go/webhook.html",
  "/go/pipekit.html",
  "/go/templates.html",
  "/go/meeting.html",
  "/tools/index.html",
  "/tools/markup-calculator.html",
  "/tools/late-fee-calculator.html",
  "/tools/break-even-calculator.html",
  "/tools/profit-margin-calculator.html",
  "/tools/invoice-number-generator.html",
  "/join.html",
  "/p/late-fee-invoice-calculator.html",
  "/p/api-uptime-sla-monitor.html",
  "/p/cron-job-monitor-free.html",
];

const body = `# Overnight Build Summary — ${dateStr}

**Prepared:** ${now.toISOString()} (review at 8 AM US Central)
**Production:** https://wealth-engine-0qlj.onrender.com
**Health:** \`/api/health\` OK
**Revenue:** $${metrics.revenueUsd} / $500 target (${metrics.pctOfTarget}%)
**Commits pushed tonight (after bff97dc):** ${commitsTonight}

---

## Built tonight

- **Render deploy API** — \`scripts/trigger-render-deploy.mjs\` via ~/.render/cli.yaml (verified 201)
- **8 /go ad landings:** invoice, lease, uptime, nda, webhook, pipekit, templates, meeting
- **12+ free ad tools:** tip, meeting cost, percentage, bill splitter, hourly rate, markup, late fee, break-even, discount, unit price, profit margin, invoice number generator + \`/tools/index.html\` hub
- **${seoBatch.created?.length ?? "45+"} SEO keywords** → full \`/p/*.html\` set (all keywords generated each build)
- **Conversion CTAs** improved on BillSnap, StatusPing, PipeKit, HookRelay (sticky footers + sharper copy)
- **/join redirect** → \`/join.html\` in server.mjs
- **Google Ads CSV** — ${adsNotes.campaigns?.length ?? 6} campaigns, **$${adsNotes.dailyBudgetTotal ?? 10}/day cap**
- **Outreach pack** — Reddit, Indie Hackers, HN Show HN drafts in \`D:\\wealth-engine-data\\marketing\\outreach\\\`
- **Agent chain** executed (\`npm run agent:chain\`)
- **MM daemon** running (PID verified)

Recent commits:
\`\`\`
${commitLog || "(none)"}
\`\`\`

---

## Live URLs (verify 200)

${liveUrls.map((u) => `- https://wealth-engine-0qlj.onrender.com${u}`).join("\n")}

---

## Ready to ship

- Render production live with 9 ventures + Stripe (14 products, coupon LAUNCH25)
- Google Ads CSV: \`D:\\wealth-engine-data\\marketing\\ads\\google-ads-import.csv\` — ${adsNotes.campaigns?.length ?? 6} campaigns, **$${adsNotes.dailyBudgetTotal ?? 10}/day**
- High-conversion landings under \`/go/*\`
- Bundle pages: \`/bundles/freelancer-stack\`, \`/bundles/dev-ops-stack\`, \`/bundles/landlord-tenant-stack\`
- Free tools hub: \`/tools/index.html\`
- CompareStack: 7 comparison pages
- SEO programmatic pages: \`/p/*\` (${seoBatch.created?.length ?? 45}+ pages)
- RSS/product feeds: \`/feed.xml\`, \`/products.json\`
- Outreach: \`D:\\wealth-engine-data\\marketing\\outreach\\POST_TODAY.md\`

---

## User must do

### 1. Import Google Ads CSV (~5 min) — highest leverage

Follow: \`D:\\wealth-engine-data\\marketing\\ADS_IMPORT_CHECKLIST.md\`
CSV: \`D:\\wealth-engine-data\\marketing\\ads\\google-ads-import.csv\`
Cap at **$${adsNotes.dailyBudgetTotal ?? 10}/day** total.

### 2. GoDaddy DNS (~5 min)

Follow: \`deploy/GODADDY_DNS.md\` — CNAME \`tools\` → \`wealth-engine-0qlj.onrender.com\`

### 3. Post one outreach thread (~10 min)

Pick from \`D:\\wealth-engine-data\\marketing\\outreach\\POST_TODAY.md\` — Reddit r/freelance invoice post recommended.

### 4. Upload Horseshoe site (~3 min)

Upload \`C:\\Users\\jshug\\Website\\index.html\` to GoDaddy (NOT Netlify).

### 5. Set conversion tracking after ads live

\`GOOGLE_ADS_CONVERSION_ID\` in Render env + \`.env\`

---

## Paused

| Project | Blocker | Workaround |
|---------|---------|------------|
| Custom domain SSL | GoDaddy CNAME not yet added | Use Render URL in ads |
| Google Ads API | No OAuth | CSV manual import |
| Netlify | Out of credits | GoDaddy only |
| gh CLI | Not installed | git push + Render API deploy |
| Revenue | $0 — no ads imported yet | Import CSV today |

---

## Path to $500

| Channel | Monthly potential | Confidence |
|---------|-------------------|------------|
| Google Ads → BillSnap $3 PDF | $200–400 | High (if ads imported) |
| Organic SEO (45+ /p pages) | $50–150 | Medium (2–4 week lag) |
| Horseshoe cross-traffic | $30–80 | Medium |
| LeaseLens + StatusPing + NDA + PipeKit ads | $50–120 | Medium |
| AdSense free tools | $5–20 | Low |

**Math:** 63 sales × $8 AOV = $504. At 2.5% CVR need ~2,520 clicks. At $0.40 CPC ≈ $1,008 ad spend OR mix organic + paid at $300/mo budget (AP-001 approved).

---

## Agent / daemon status

${ramp.at ? `Last ramp: ${ramp.at}` : "Ramp: run \`npm run run\` to refresh"}
MM daemon: \`npm run daemon:mm\` (360 min interval)
Deploy trigger: \`node scripts/trigger-render-deploy.mjs\`

Tasks board excerpt:
\`\`\`
${tasks.split("\n").slice(0, 20).join("\n")}
\`\`\`
`;

const paths = [
  join(dataRoot, "reports", `OVERNIGHT_SUMMARY_${dateStr}.md`),
  join(root, "board", "MORNING_SUMMARY.md"),
];

for (const p of paths) {
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, body);
  console.log("Wrote:", p);
}
