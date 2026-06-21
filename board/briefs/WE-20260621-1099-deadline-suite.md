# Idea Brief: 1099 Deadline Suite

**ID:** WE-20260621-1099-deadline-suite
**Date:** 2026-06-21
**Status:** Candidate

## Problem
Every January, 4.5M+ US businesses scramble to file 1099-NEC forms by Jan 31 deadline. Penalties start at $60/form for late filing. Freelancers who paid contractors $600+ need W-9 collection, form generation, and state-specific direct filing (MO, MA, etc. bypass IRS CF/SF program). Existing `/tools/1099-tax-estimator` drives traffic but doesn't convert to paid workflow. BillSnap invoicing data could power contractor payment tracking but no 1099 product exists.

## Solution
**1099 Deadline Suite** — seasonal product + year-round subscription:
- **Free tier:** contractor payment tracker (manual entry), Jan 15 email reminder
- **Pro $19 one-time (Jan–Feb):** 1099-NEC PDF generator for up to 10 contractors, W-9 request email template
- **Business $29/mo:** unlimited contractors, state filing checklist, BillSnap payment import (CSV), deadline calendar
- **pSEO:** `/p/1099-nec-deadline-2026`, `/p/w9-request-template`, `/p/1099-penalty-calculator`
- **Cross-sell:** BillSnap unlimited for invoicing → 1099 Suite for year-end

## Monetization
Seasonal spike: 50k Jan searches × 5% CTR × 4% CVR × $19 = ~$19k in 6-week window. **$50k/mo year-round:** unrealistic for pure seasonal; as portfolio wedge contributes $3–8k/mo Jan + $2k/mo Business subs (70 subs × $29). Best as BillSnap funnel amplifier, not standalone $50k play.

## Automation Angle
Email reminder cron (Jan 1, Jan 15, Jan 25). PDF generation from form template. Payment threshold alerts ($600 approaching). Stripe seasonal SKU auto-archived Mar 1.

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 4 | 4 | 4 | 5 | 3 | **20** |

## Competition
Track1099, Tax1099.com, QuickBooks ($7/form). Differentiation: indie pricing, BillSnap integration, state-specific checklists from compliance pSEO data layer.

## Validation Plan
Ship Jan deadline landing + estimator enhancement by Dec 2026; measure email capture rate from existing 1099 tool traffic.

## Risks and Guardrails
Tax form accuracy is YMYL — use IRS official field layout; disclaimer required. E-filing to IRS requires FIRE system registration (Tier-2) — MVP is PDF generation only, not e-file.

## Next Step
Park until compliance-state-seo data layer ships; reuse state JSON for filing checklists.
