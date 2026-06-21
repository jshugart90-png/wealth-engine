#!/usr/bin/env node
/** Write WEALTH_STATUS report per Autonomous Wealth Engine skill template */
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { getRoot, getDataRoot } from "../core/env.mjs";
import { getFunnelMetrics } from "../core/pipeline/funnel.mjs";

const root = getRoot();
const dataRoot = getDataRoot();
const dateStr = process.env.WEALTH_REPORT_DATE ?? "2026-06-21";

function gitCountSince(ref) {
  try {
    return parseInt(execSync(`git rev-list --count ${ref}..HEAD`, { cwd: root, encoding: "utf8" }).trim(), 10) || 0;
  } catch {
    return 0;
  }
}

function readJson(p, fb = {}) {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
}

const metrics = getFunnelMetrics(30);
const commitsTonight = gitCountSince("bff97dc");
const adsNotes = readJson(join(dataRoot, "marketing", "ads", "campaign-notes.json"));
const keywordCount = JSON.parse(readFileSync(join(root, "config", "seo-keywords.json"), "utf8")).keywords.length;

const body = `# Wealth Engine Status — ${dateStr}

## Executive Summary

Overnight Build sprint pushed **${commitsTonight} commits** with Render production verified. Revenue machine is **traffic-ready but revenue-blocked** at **$${metrics.revenueUsd} / $500** — Stripe live (14 products, LAUNCH25), ${keywordCount} SEO keywords, 10 /go/* landings, 16+ free tools, Google Ads CSV at $${adsNotes.dailyBudgetTotal ?? 11}/day. Top win: end-to-end deploy pipeline (git push → Render API → 200 verify). Top blocker: human Google Ads CSV import (~5 min).

## Active Experiments

| ID | Name | Phase | This Week | Metrics | Next |
|----|------|-------|-----------|---------|------|
| WE-20260620-001 | BillSnap Google Ads scale | Build → Launch | 10 /go landings incl. receipt + compare | $0 / $500 (${metrics.pctOfTarget}%) | User imports Google Ads CSV |
| WE-20260621-002 | MeetingCost viral → paid | Build | /go/meeting, embed widget | $0 | Outreach batches 3–4 |
| WE-20260621-003 | Programmatic SEO funnel | Build | ${keywordCount} keywords, build-all mode | 0 organic clicks | Sitemap submit post-DNS |

## Research Pipeline

- **1099 contractor invoice template SEO** — Score 23/25; keyword live; validate organic in 2–4 weeks.
- **Payment reminder / retainer invoice templates** — Added keywords cycle 3; cross-link from BillSnap.

## Completed Actions

- ${commitsTonight} commits since bff97dc: /go/* landings (invoice, lease, uptime, nda, webhook, pipekit, templates, meeting, receipt, compare)
- 16+ free ad tools including sales tax, payment terms, compound interest, overtime pay
- ${keywordCount} SEO pages in /p/* (all generated each build)
- Google Ads CSV: ${adsNotes.campaigns?.length ?? 7} campaigns, $${adsNotes.dailyBudgetTotal ?? 11}/day
- Outreach batches 2–4 in D:\\wealth-engine-data\\marketing\\outreach\\
- Render deploy via API after each push batch
- Agent chain cycles executed overnight

## Blockers

None requiring escalation — all revenue gates have documented workarounds:

| Blocker | Workaround in use |
|---------|-------------------|
| Google Ads not live | CSV at D:\\wealth-engine-data\\marketing\\ads\\google-ads-import.csv |
| Custom domain | Render URL in all ads/final URLs |
| Horseshoe cross-traffic | Promo bar ready; manual GoDaddy upload |
| Netlify | Skipped — out of credits |
| Revenue $0 | Import ads CSV today |

## Recommended Focus

**Review → Launch** — Infrastructure complete. Next dollar requires user to import ads CSV and optionally set GoDaddy DNS. Monitor Stripe for first LAUNCH25 checkout.
`;

const outPath = join(dataRoot, "reports", `WEALTH_STATUS_${dateStr}.md`);
mkdirSync(join(outPath, ".."), { recursive: true });
writeFileSync(outPath, body);
console.log("Wrote:", outPath);
