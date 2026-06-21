# Idea Brief: PipeKit Metered API Scale

**ID:** WE-20260621-pipekit-metered
**Date:** 2026-06-21
**Status:** Candidate

## Problem
74% of SaaS suppliers use usage-based pricing in 2026 (Stripe data). Developer utility APIs (JSON validate, hash, DNS lookup, UUID) have fragmented free tools but few indie-priced metered APIs. PipeKit already exists at $9/$29/$99 with SEO pages for each endpoint. ScreenshotOne reached $100K MRR via programmatic SEO + API — same playbook applies.

## Solution
Reposition PipeKit as **metered dev utility API** with programmatic integration pages:
- Base: $29/mo includes 50K requests; overage $0.50/10K
- pSEO: 200 pages targeting "{language} json validator api", "dns lookup api python", etc.
- Free tier: 1K requests/day (acquisition)
- MVP: Stripe Billing meters wired to existing API key system in `ventures/devtools-api`

## Monetization
$29/mo × 400 customers + overage = $11.6k base; scale to $50k with 1,200 Pro + Enterprise mix and pSEO volume. Usage-based billing aligns revenue with customer success.

## Automation Angle
API key provisioning, usage metering, billing, and page generation fully automated. Stripe native metered billing available.

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 4 | 3 | 5 | 5 | 4 | **21** |

## Competition
RapidAPI listings, AWS utilities, free online tools. Differentiation: bundled utilities one API key, indie pricing, SEO discovery.

## Validation Plan
Add Stripe meter to PipeKit pro tier; publish 20 integration pSEO pages; list on RapidAPI.

## Risks and Guardrails
Rate limit abuse on free tier; spending caps required. No storage of customer payload data beyond logs.

## Next Step
Build agent: wire Stripe Billing meters to PipeKit usage counter.
