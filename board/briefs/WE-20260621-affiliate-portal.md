# Idea Brief: Portfolio Affiliate Portal

**ID:** WE-20260621-affiliate-portal
**Date:** 2026-06-21
**Status:** READY_FOR_BUILD

## Problem
Wealth-engine has 161 live URLs, 18 Stripe products, and CompareStack affiliate pages — but no self-serve partner onboarding. 2026 SaaS affiliate benchmarks show partners abandon programs that require email approval, lack real-time dashboards, or hide commission rules. Indie tool founders lose 40–50% of potential affiliate recruits at onboarding friction (LinkJolt, Track360 2026). Portfolio products (BillSnap $29/mo, HookRelay $29/mo, DevWatch $39/mo) need a unified 25% recurring commission engine to scale beyond paid ads.

## Solution
Launch **`/partners/`** self-serve affiliate portal across the portfolio:
- **Signup → approve → live link in <5 min** (no manual email)
- **Commission:** 25% recurring for 12 months on all subscription SKUs; $1 flat on $3–$7 one-time
- **Stripe webhook integration:** auto-credit on `invoice.paid`, clawback on refund (30-day hold)
- **Starter kit:** pre-built deep links, 1-sentence positioning per venture, screenshot pack, FTC disclosure template
- **Attribution:** 90-day first-click cookie; sub-ID support for CompareStack cross-links
- **MVP scope:** static portal + SQLite partner table + referral code on checkout metadata

## Monetization
Affiliate-sourced CAC target LTV:CAC > 3x. At 25% of $29/mo for 12mo = $87 max payout vs ~$348 LTV (12mo retention). **Path to $50k/mo:** 200 active affiliates × 8 conversions/mo × $29 avg × 75% net (after commission) ≈ $34.8k + organic CompareStack affiliate revenue. Recruiting 50 content-site affiliates in devtools/freelancer niches in 90 days.

## Automation Angle
Stripe webhook → commission ledger → monthly payout batch. Partner dashboard auto-generated from DB. Asset kit generated from existing `/go/*` screenshots. CompareStack pages auto-inject partner sub-IDs via `?ref=` param.

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 4 | 4 | 5 | 5 | 4 | **22** |

## Competition
Rewardful, FirstPromoter, PartnerStack ($500+/mo enterprise). Differentiation: zero monthly SaaS cost (self-built), portfolio-wide single signup, deep links to 161 existing URLs. CompareStack already drives outbound affiliate clicks — portal captures inbound partners.

## Validation Plan
Ship MVP portal; manually recruit 10 indie-hacker affiliates; target 5 attributed conversions in 30 days. Join 3 outbound SaaS affiliate programs (Cronitor, Hookdeck, LemonSqueezy) to feed CompareStack while building inbound.

## Risks and Guardrails
FTC disclosure required on all partner pages. Stripe Connect or manual PayPal payouts — document tax form collection (W-9) before $600/yr threshold. No brand bidding on paid search without approval.

## Next Step
**Build agent:** `/partners/index.html`, referral metadata on Stripe checkout, `config/affiliates.json` partner rules, webhook handler in `core/server.mjs`.
