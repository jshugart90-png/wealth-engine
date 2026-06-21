# Idea Brief: TemplateForge State Compliance pSEO

**ID:** WE-20260621-compliance-state-seo
**Date:** 2026-06-21
**Status:** READY_FOR_BUILD

## Problem
50 US states have divergent freelancer/contractor compliance rules: 1099-NEC filing thresholds ($600 federal, state-specific direct filing in MO/MA/etc.), LLC formation requirements, W-9 collection mandates, and contractor classification tests. SMB Compliance Pack ($19 one-time) proves demand; WorkWise charges $120 for compliance bundles. Search volume exists for "{state} 1099 filing requirements", "{state} freelancer LLC", "{state} independent contractor rules" — high-intent, low competition vs generic legal sites. Wealth-engine has 106 `/p/*` pages, TemplateForge catalog, and `/tools/1099-tax-estimator` but zero state-specific compliance landings.

## Solution
Programmatic SEO expansion: **50 states × 4 page types = 200 compliance pages**:
1. `/p/{state}-1099-filing-requirements` — state direct-filing rules, deadlines, links to DOR portals
2. `/p/{state}-freelancer-llc-guide` — formation steps, registered agent notes
3. `/p/{state}-contractor-compliance-checklist` — W-9, insurance, classification
4. `/p/{state}-freelancer-tax-deadlines` — quarterly estimated tax + Jan 31 1099-NEC

Each page: unique state data (sourced from official DOR/IRS pub), CTA to **SMB Compliance Pack ($19)** or **Freelancer Kit ($14)**, cross-link to BillSnap + 1099 estimator tool. Quality gate: ≥60% unique content per page (Google pSEO threshold 2026).

## Monetization
200 pages × 200 avg monthly searches × 12% CTR × 3% CVR × $16 AOV = ~$2,300/mo baseline at 6mo index. **$50k/mo path:** 200 pages + 150 state-specific ad campaigns + Freelancer Stack $29/mo upsell → 1,700 Stack subs. Seasonal 1099 spike (Jan) adds 3× traffic multiplier. Missouri/Massachusetts non-CF/SF filing rules create urgency content competitors miss.

## Automation Angle
State data JSON in `config/state-compliance.json`; page generation via existing `pdf-factory/generator.mjs` pipeline. Auto-update annual from RSS/DOR changelog flags. Internal linking hub at `/p/freelancer-compliance-by-state.html`. Zero manual writing after data entry.

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 5 | 4 | 5 | 5 | 4 | **23** |

## Competition
H&R Block, state .gov sites (informational only), LegalZoom ($79+ LLC). Differentiation: actionable checklists + instant template download, not legal advice — paired with free 1099 estimator tool. No competitor combines state pSEO + $14–19 template kits.

## Validation Plan
Ship pilot batch: 10 high-population states (CA, TX, FL, NY, IL, PA, OH, GA, NC, MI); measure GSC impressions at 30 days; track SMB Compliance Pack conversion rate vs generic `/go/compliance`.

## Risks and Guardrails
Disclaimer: informational only, not legal/tax advice; cite official sources with "last updated" dates. Review state data annually. Avoid guaranteeing filing outcomes. YMYL content — ensure accurate IRS/state citations.

## Next Step
**Build agent:** `config/state-compliance.json` (10-state pilot), generator template, 40 pSEO pages (10 states × 4 types), hub page, sitemap update building on 161 existing URLs.
