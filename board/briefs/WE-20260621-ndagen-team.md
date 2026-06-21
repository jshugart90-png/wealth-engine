# Idea Brief: NDAGen Team B2B Tier

**ID:** WE-20260621-ndagen-team
**Date:** 2026-06-21
**Status:** READY_FOR_BUILD

## Problem
Freelancers and small agencies generate 5–50 NDAs/year but NDAGen today sells only $4 one-time PDF exports. Competitors validate B2B subscription demand: Quoqo Growth $29.99/mo (50 NDAs), AiDocX Pro $6/mo, PactDraft $149/yr (25 docs). Enterprise (BRYTER) starts at $1,000/mo — huge gap for 2–10 person agencies needing mutual NDAs, team templates, and audit trails without legal ops overhead. CompareStack `/comparestack/pages/nda-template-generators.html` + Freelancer Stack bundle already drive NDA traffic.

## Solution
Launch **NDAGen Team** at **$29/mo** (aligned with BillSnap Pro / Freelancer Stack pricing):
- **50 NDA exports/mo** (mutual + unilateral)
- **3 team seats** with shared template library
- **Governing law selector** (US state dropdown — feeds compliance pSEO cross-links)
- **Audit log:** created/sent/downloaded timestamps (localStorage + optional export)
- **Upsell path:** Freelancer Stack bundle includes NDA; Team tier for agencies outgrowing one-time $4 exports
- **MVP scope:** Stripe `ndagen-team-monthly` SKU, usage counter in existing NDAGen generator, `/go/nda-team` landing

## Monetization
$29/mo × 1,724 teams = $50k MRR. Lower-friction path: 500 Team subs + 2,000/mo one-time $4 exports = $14.5k + $8k = $22.5k/mo baseline. Quoqo at $30/mo with 50 NDAs validates price anchor. Freelancer Stack cross-sell adds 15–20% attach rate.

## Automation Angle
Free preview → paywall on PDF export (existing flow). Usage metering via Stripe subscription metadata. pSEO funnel from `/p/nda-template-freelancer.html` and CompareStack NDA pages. Auto-renewal billing wired.

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 5 | 4 | 4 | 5 | 4 | **22** |

## Competition
Quoqo ($20–30/mo), AiDocX ($6/mo), PactDraft ($59/doc). Differentiation: instant no-signup preview (existing NDAGen UX), portfolio bundle with BillSnap + templates, indie pricing without AI-review legal claims.

## Validation Plan
Add Team tier SKU; A/B `/go/nda-team` vs existing NDA flow; target 10 Team trials from Freelancer Stack thank-you page in 30 days.

## Risks and Guardrails
Disclaimer: not legal advice; templates are starting points. No "AI legal review" claims (Quoqo differentiator — avoid without counsel). Store minimal PII; no document content on server for MVP.

## Next Step
**Build agent:** `ndagen-team-monthly` Stripe SKU, usage gate in `ventures/ndagen/`, `/go/nda-team.html` landing, cross-link from Freelancer Stack bundle page.
