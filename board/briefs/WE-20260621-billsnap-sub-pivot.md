# Idea Brief: BillSnap Sub Pivot

**ID:** WE-20260621-billsnap-sub-pivot
**Date:** 2026-06-21
**Status:** SHIPPED

## Problem
320K+/mo US search volume for invoice-related terms; MicroGaps validates freelancer frustration with $15–55/mo accounting suites. BillSnap unlimited at $12/mo under-monetizes high-intent recurring users who invoice weekly. Industry-specific queries ("contractor invoice template", "consultant invoice format") convert better than generic terms but need dedicated pSEO landings.

## Solution
Reprice BillSnap unlimited subscription **$12 → $29/mo** (aligned with Freelancer Stack tier economics) and add industry programmatic SEO:
- **Entry:** `/p/{industry}-invoice-template` pages → `/go/billsnap-pro.html` or enhanced `/go/invoice.html`
- **Core offer:** `$29/mo unlimited` BillSnap Pro (unlimited-month SKU) — unlimited PDF exports, no signup
- **MVP scope:** Pricing/copy update, `/go/billsnap-pro` landing, 3–5 industry SEO keywords, Stripe price sync

## Monetization
| Tier | Price | Target |
|------|-------|--------|
| Pro PDF (one-time) | $3 | Entry / ads wedge |
| BillSnap Pro Unlimited | $29/mo | Recurring from weekly invoicers |
| Freelancer Stack | $29/mo | Upsell with templates + NDA |

**Path:** 320K/mo volume × 1.5% CTR × 2% CVR × $29 = ~$2.8k/mo at modest scale; 5k→20k target with 500+ industry pages.

## Automation Angle
- pSEO pages auto-generated from `config/seo-keywords.json`
- Stripe checkout + webhook fulfillment already wired
- `/go/billsnap-pro` conversion landing from ads + SEO CTAs

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital | Risk | **Total** |
|-------------|-----------------|------------|---------|------|-----------|
| 5 | 5 | 5 | 5 | 4 | **23** |

## Validation Plan
1. Ship `/go/billsnap-pro` + reprice unlimited-month to $29 in Stripe
2. Add 5 industry invoice template SEO keywords (contractor, freelancer, consultant)
3. A/B invoice landing: $3 one-time vs $29/mo unlimited CTA
4. Success: ≥3 $29/mo subs in 30 days

## Next Step
**Build agent:** Update ventures.json price, landing pages, seo-keywords.json, stripe sync for unlimited-month reprice.
