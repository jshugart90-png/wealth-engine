import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";
import { AFFILIATE_REF_SCRIPT } from "../marketing/affiliates.mjs";
import { checkoutClickScript, visitTrackerScript } from "../marketing/monetization.mjs";

const PAGE_TYPES = [
  {
    suffix: "1099-filing-requirements",
    title: (s) => `${s.name} 1099-NEC Filing Requirements (2026)`,
    meta: (s) => `${s.name} 1099 filing rules, $600 federal threshold, and whether ${s.abbr} requires state copies. Official sources cited.`,
    h1: (s) => `${s.name} 1099-NEC Filing Requirements`,
    intro: (s) => `If you paid freelancers or contractors in ${s.name}, federal Form 1099-NEC rules apply at $${s.federalThreshold}+. ${s.hasState1099Filing ? `${s.abbr} also requires state information returns.` : `${s.abbr} does not require separate state 1099 copies for most payers, but federal filing is still mandatory.`}`,
    body: (s) => `
<h2>Federal threshold</h2>
<p>IRS requires Form 1099-NEC when you pay $${s.federalThreshold} or more in nonemployee compensation during the tax year. Furnish copies to recipients by <strong>January 31</strong> and file with the IRS by the same date (or extended deadline if applicable).</p>
<h2>${s.abbr} state rules</h2>
<p>${s.notes1099}</p>
<p>Official source: <a href="${s.dorUrl}" rel="noopener noreferrer">${s.dorName}</a></p>
<h2>Before you pay any contractor</h2>
<ul>
<li>Collect a completed <strong>Form W-9</strong> before first payment</li>
<li>Track payments by vendor in a spreadsheet or invoicing tool</li>
<li>Confirm contractor vs employee classification using the ${s.contractorTest}</li>
</ul>`,
    primarySku: "smb-compliance-pack",
    primaryLabel: "SMB Compliance Pack — $19",
    secondarySku: "freelancer-kit",
    secondaryLabel: "Freelancer Kit — $14",
  },
  {
    suffix: "freelancer-llc-guide",
    title: (s) => `${s.name} Freelancer LLC Formation Guide`,
    meta: (s) => `How to form an LLC in ${s.name}: fees, registered agent, and tax basics for freelancers.`,
    h1: (s) => `${s.name} Freelancer LLC Guide`,
    intro: (s) => `Forming an LLC in ${s.name} separates personal assets from client work. Filing fee: ${s.llcFormationFee}. ${s.registeredAgentRequired ? "A registered agent is required." : "Registered agent rules vary by entity type."}`,
    body: (s) => `
<h2>Formation steps</h2>
<ol>
<li>Choose a unique business name (check ${s.abbr} SOS database)</li>
<li>File articles of organization via <a href="${s.sosUrl}" rel="noopener noreferrer">${s.abbr} Secretary of State</a></li>
<li>Obtain EIN from IRS (free at irs.gov)</li>
<li>Draft an operating agreement (keep internal — not always filed)</li>
<li>Open a dedicated business bank account</li>
</ol>
<h2>Costs and ongoing fees</h2>
<p>${s.notesLLC}</p>
<h2>Tax treatment</h2>
<p>Most single-member freelancer LLCs are pass-through entities. You still owe self-employment tax on net profit. Consult a CPA before electing S-corp status.</p>`,
    primarySku: "freelancer-kit",
    primaryLabel: "Freelancer Kit — $14",
    secondarySku: "smb-compliance-pack",
    secondaryLabel: "SMB Compliance Pack — $19",
  },
  {
    suffix: "contractor-compliance-checklist",
    title: (s) => `${s.name} Independent Contractor Compliance Checklist`,
    meta: (s) => `W-9, insurance, and classification checklist for hiring contractors in ${s.name}.`,
    h1: (s) => `${s.name} Contractor Compliance Checklist`,
    intro: (s) => `Use this checklist before engaging freelancers in ${s.name}. Classification standard: ${s.contractorTest}.`,
    body: (s) => `
<h2>Pre-payment checklist</h2>
<ul>
<li>☐ Signed W-9 on file (legal name + TIN)</li>
<li>☐ Written scope-of-work or subcontractor agreement</li>
<li>☐ Proof of general liability insurance (if required by contract)</li>
<li>☐ Verify trade licenses for regulated industries</li>
<li>☐ Document that worker controls how work is performed</li>
<li>☐ Set up 1099 tracking if payments may exceed $${s.federalThreshold}</li>
</ul>
<h2>${s.abbr}-specific notes</h2>
<p>${s.notesContractor}</p>
<h2>Red flags auditors watch</h2>
<ul>
<li>Fixed hourly schedule with no deliverables</li>
<li>Using company email and equipment exclusively</li>
<li>Paying individuals who are your only workers</li>
</ul>`,
    primarySku: "smb-compliance-pack",
    primaryLabel: "SMB Compliance Pack — $19",
    secondarySku: "freelancer-kit",
    secondaryLabel: "Freelancer Kit — $14",
  },
  {
    suffix: "freelancer-tax-deadlines",
    title: (s) => `${s.name} Freelancer Tax Deadlines (2026)`,
    meta: (s) => `Quarterly estimated tax dates and 1099 deadlines for ${s.name} freelancers and 1099 contractors.`,
    h1: (s) => `${s.name} Freelancer Tax Deadlines`,
    intro: (s) => `Freelancers in ${s.name} owe federal estimated tax quarterly. State obligations depend on ${s.abbr} income tax rules.`,
    body: (s) => `
<h2>2026 quarterly estimated tax due dates</h2>
<ul>
${(s.quarterlyDueDates ?? ["April 15", "June 15", "September 15", "January 15 (prior year Q4)"]).map((d) => `<li>${d}</li>`).join("\n")}
</ul>
<h2>1099-NEC key dates</h2>
<ul>
<li><strong>January 31</strong> — Furnish 1099-NEC to recipients</li>
<li><strong>January 31</strong> — File 1099-NEC with IRS (Copy A)</li>
</ul>
<h2>${s.abbr} specifics</h2>
<p>${s.notesTax}</p>
<p>Official source: <a href="${s.dorUrl}" rel="noopener noreferrer">${s.dorName}</a></p>
<h2>Self-employment tax reminder</h2>
<p>Net freelance profit is subject to 15.3% self-employment tax (Social Security + Medicare) plus income tax. Set aside 25–30% of net income if you have no employer withholding.</p>`,
    primarySku: "freelancer-kit",
    primaryLabel: "Freelancer Kit — $14",
    secondarySku: "smb-compliance-pack",
    secondaryLabel: "SMB Compliance Pack — $19",
  },
];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function buildPage(state, pageType, config, base) {
  const slug = `${state.slug}-${pageType.suffix}`;
  const pagePath = `/p/${slug}.html`;
  const title = pageType.title(state);
  const primaryPay = getPaymentLink(pageType.primarySku) ?? "#";
  const secondaryPay = getPaymentLink(pageType.secondarySku) ?? "#";

  const related = PAGE_TYPES.filter((p) => p.suffix !== pageType.suffix)
    .map((p) => `<li><a href="/p/${state.slug}-${p.suffix}.html">${esc(state.name)} ${p.suffix.replace(/-/g, " ")}</a></li>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(pageType.meta(state))}">
<link rel="canonical" href="${base}${pagePath}">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: title, dateModified: config.lastUpdated })}</script>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1e293b}
h1{font-size:clamp(24px,4vw,36px);color:#0f172a}h2{margin-top:28px;font-size:20px;color:#334155}
.meta{font-size:13px;color:#64748b;margin-bottom:24px}
.cta{display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;margin:8px 8px 8px 0;font-weight:600}
.cta.outline{background:#fff;color:#2563eb;border:2px solid #2563eb}
.cta.green{background:#16a34a}
.tools{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:24px 0}
.disclaimer{font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;margin-top:32px;padding-top:16px}
nav.related{margin-top:24px;font-size:14px}
a{color:#2563eb}
</style></head><body>
<p class="meta">Last updated: ${config.lastUpdated} · ${state.abbr} · <a href="/p/freelancer-compliance-by-state.html">All states</a></p>
<h1>${esc(pageType.h1(state))}</h1>
<p>${esc(pageType.intro(state))}</p>
${pageType.body(state)}
<div class="tools">
<strong>Free tools</strong>
<ul>
<li><a href="/tools/quarterly-tax-deadline-calendar.html">Quarterly tax deadline calendar</a> — never miss estimated payments</li>
<li><a href="/tools/1099-payment-threshold-tracker.html">1099 threshold tracker</a> — know when to file</li>
<li><a href="/billsnap/index.html">BillSnap</a> — invoice contractors and track payments</li>
<li><a href="/go/compliance.html">SMB Compliance Pack landing</a></li>
</ul>
</div>
<a class="cta" href="${primaryPay}" onclick="${checkoutClickScript(pageType.primarySku, pagePath)}">${esc(pageType.primaryLabel)} →</a>
<a class="cta outline" href="${secondaryPay}" onclick="${checkoutClickScript(pageType.secondarySku, pagePath)}">${esc(pageType.secondaryLabel)} →</a>
<a class="cta green" href="/go/freelancer.html">Freelancer Stack $29/mo</a>
<nav class="related"><strong>More ${esc(state.name)} guides:</strong><ul>${related}</ul></nav>
<p class="disclaimer">${esc(config.disclaimer)} Sources: IRS Publication 15-A, ${esc(state.dorName)}. Rates and thresholds change — verify before filing.</p>
<script>${AFFILIATE_REF_SCRIPT}</script>
<script>${visitTrackerScript(pagePath)}</script>
</body></html>`;
}

function buildHubPage(states, config, base) {
  const pagePath = "/p/freelancer-compliance-by-state.html";
  const rows = states
    .map(
      (s) => `<tr>
<td><strong>${esc(s.name)} (${s.abbr})</strong></td>
<td><a href="/p/${s.slug}-1099-filing-requirements.html">1099 filing</a></td>
<td><a href="/p/${s.slug}-freelancer-llc-guide.html">LLC guide</a></td>
<td><a href="/p/${s.slug}-contractor-compliance-checklist.html">Checklist</a></td>
<td><a href="/p/${s.slug}-freelancer-tax-deadlines.html">Tax deadlines</a></td>
</tr>`
    )
    .join("\n");

  const compliancePay = getPaymentLink("smb-compliance-pack") ?? "#";
  const freelancerPay = getPaymentLink("freelancer-kit") ?? "#";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Freelancer Compliance by State — 1099, LLC &amp; Contractor Guides</title>
<meta name="description" content="State-specific freelancer compliance guides: 1099 filing, LLC formation, contractor checklists, and tax deadlines for CA, TX, FL, NY, and more.">
<link rel="canonical" href="${base}${pagePath}">
<style>
body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;line-height:1.6}
h1{font-size:clamp(26px,4vw,38px)}table{width:100%;border-collapse:collapse;margin:24px 0;font-size:14px}
th,td{border:1px solid #e2e8f0;padding:10px;text-align:left}th{background:#f8fafc}
.cta{display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;margin:8px 8px 8px 0}
.cta.outline{background:#fff;color:#2563eb;border:2px solid #2563eb}
.disclaimer{font-size:12px;color:#64748b;margin-top:32px}
</style></head><body>
<h1>Freelancer Compliance by State</h1>
<p>State-specific guides for 1099-NEC filing, LLC formation, contractor compliance, and quarterly tax deadlines. ${states.length} high-population states (${states.length * 4} pages).</p>
<a class="cta" href="${compliancePay}" onclick="${checkoutClickScript("smb-compliance-pack", pagePath)}">SMB Compliance Pack — $19</a>
<a class="cta outline" href="${freelancerPay}" onclick="${checkoutClickScript("freelancer-kit", pagePath)}">Freelancer Kit — $14</a>
<a class="cta outline" href="/tools/1099-tax-estimator.html">1099 tax estimator</a>
<table>
<thead><tr><th>State</th><th>1099</th><th>LLC</th><th>Checklist</th><th>Deadlines</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p class="disclaimer">${esc(config.disclaimer)} Last updated: ${config.lastUpdated}. Expanding to all 50 states.</p>
<script>${AFFILIATE_REF_SCRIPT}</script>
<script>${visitTrackerScript(pagePath)}</script>
</body></html>`;
}

function syncToDist(seoDir) {
  const distP = join(getRoot(), "dist", "p");
  mkdirSync(distP, { recursive: true });
  for (const f of readdirSync(seoDir).filter((x) => x.endsWith(".html"))) {
    writeFileSync(join(distP, f), readFileSync(join(seoDir, f)));
  }
}

export function generateCompliancePseo() {
  const config = JSON.parse(readFileSync(join(getRoot(), "config", "state-compliance.json"), "utf8"));
  const outDir = join(getDataRoot(), "seo-pages");
  mkdirSync(outDir, { recursive: true });
  const base = getPublicBaseUrl();
  const created = [];

  const states = config.pilotStates
    .filter((slug) => config.states[slug])
    .map((slug) => ({ slug, ...config.states[slug] }));

  for (const state of states) {
    for (const pageType of PAGE_TYPES) {
      const slug = `${state.slug}-${pageType.suffix}`;
      const html = buildPage(state, pageType, config, base);
      writeFileSync(join(outDir, `${slug}.html`), html);
      created.push({ slug, url: `/p/${slug}.html`, state: state.abbr, type: pageType.suffix });
    }
  }

  const hubHtml = buildHubPage(states, config, base);
  writeFileSync(join(outDir, "freelancer-compliance-by-state.html"), hubHtml);
  created.push({ slug: "freelancer-compliance-by-state", url: "/p/freelancer-compliance-by-state.html", hub: true });

  syncToDist(outDir);

  writeFileSync(
    join(getDataRoot(), "marketing", "compliance-pseo-batch.json"),
    JSON.stringify({ created, states: config.pilotStates, pageCount: created.length, at: new Date().toISOString() }, null, 2)
  );

  return { pageCount: created.length, slugs: created.map((c) => c.slug), states: config.pilotStates.length };
}

if (process.argv[1]?.endsWith("compliance-pseo.mjs")) {
  console.log(JSON.stringify(generateCompliancePseo(), null, 2));
}
