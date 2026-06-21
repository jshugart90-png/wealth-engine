# Idea Brief: Freelancer Revenue Stack

**ID:** WE-20260621-freelancer-stack
**Date:** 2026-06-21
**Status:** READY_FOR_BUILD

## Problem
73M+ US freelancers search for invoicing, contracts, and NDA tools monthly (320K+ combined search volume for invoice-related terms alone). Existing solutions split across bloated accounting suites ($15–55/mo) or free PDF generators with no payment path. Freelancers want a single, fast stack: invoice → contract → NDA without accounts or complexity. Evidence: MicroGaps reports persistent complaints about $20/mo invoice tools despite Wave/FreshBooks scale; FreelancePro Toolkit sells $79 contract packs proving willingness to pay for bundled ops kits.

## Solution
Unify existing wealth-engine ventures into one **Freelancer Revenue Stack** funnel:
- **Entry:** Programmatic SEO pages (`/p/freelancer-invoice-template-{industry}`, `/p/contract-template-{role}`) → free tools hub
- **Core offer:** `$29/mo unlimited` BillSnap subscription (reprice from $12) OR `$49 one-time` bundle (BillSnap Pro + TemplateForge freelancer-kit + NDAGen PDF pack)
- **MVP scope:** Bundle checkout page, cross-links on all 72+ `/p/*` freelancer keywords, email capture on free tools, Stripe subscription SKU for stack-unlimited

## Monetization
| Tier | Price | Target mix | Unit math to $50k/mo |
|------|-------|------------|----------------------|
| Stack Unlimited (sub) | $29/mo | 60% | ~1,034 subs |
| Stack Bundle (one-time) | $49 | 25% | ~510 sales/mo (repeat traffic) |
| À la carte upsells | $3–19 | 15% | Buffer |

**Path:** 320K/mo invoice search volume × 2% CTR × 3% CVR × blended $35 AOV = theoretical ceiling >>$50k at scale. Conservative 12-month target: 400 subs + 200 bundles/mo = ~$21k MRR; scale via 500+ industry template pages.

## Automation Angle
- Programmatic page generation already wired (`config/seo-keywords.json` → `/p/*.html`)
- Stripe checkout + webhook fulfillment automated
- Free tools drive AdSense + email list; drip to stack offer
- No manual delivery — PDF generation, template download, NDA export all instant

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 5 | 4 | 5 | 5 | 5 | **24** |

## Competition
| Competitor | Gap we exploit |
|------------|----------------|
| Wave / FreshBooks | Too complex; we win on instant PDF, no signup |
| FreelancePro Toolkit ($79) | Static download; we offer live generators + templates |
| HubSpot free invoice | Requires account; BillSnap is zero-friction |
| Canva templates | No payment collection; we bundle invoice + contract + NDA |

**Differentiation:** Only stack combining instant invoice PDF + lawyer-style templates + NDA in one checkout, fed by 500+ SEO landing pages.

## Validation Plan
1. Ship `/bundles/freelancer-stack` with $49 bundle + $29/mo toggle (Stripe new SKU)
2. Add 20 industry-specific invoice template SEO pages this week
3. A/B test $29/mo vs $12/mo on `/go/invoice.html` for 14 days
4. Success signal: ≥5 stack purchases or ≥10 $29/mo subs in 30 days

## Risks and Guardrails
- Legal: Templates include disclaimers ("not legal advice"); no guaranteed enforceability claims
- Repricing $12→$29 may reduce conversion — mitigate with LAUNCH25 and annual discount
- Google HCU: Each `/p/*` page must include unique industry copy, not pure variable swap

## Next Step
**Build agent:** Create Stripe SKU `freelancer-stack-unlimited` ($29/mo) + upgrade `/bundles/freelancer-stack` with subscription option and cross-links from top 10 `/p/*` invoice pages.
