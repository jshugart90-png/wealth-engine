# Idea Brief: HookRelay DLQ Pro

**ID:** WE-20260621-hookrelay-dlq
**Date:** 2026-06-21
**Status:** READY_FOR_BUILD

## Problem
Indie SaaS founders integrating Stripe, Shopify, and GitHub webhooks lose revenue when endpoints fail silently. Hookdeck starts at $39/mo; Svix outbound starts at $490/mo — overkill for solo devs. Reddit/HN threads consistently ask for "webhook dead letter queue" and "stripe webhook retry" solutions. Existing wealth-engine has HookRelay at $7/mo (basic forward) and 8+ webhook SEO pages live (`/p/webhook-*`, `/go/webhook.html`).

## Solution
Upgrade HookRelay into **DLQ Pro** — inbound webhook reliability for indie devs:
- Durable receive → retry with exponential backoff → dead letter queue → one-click replay dashboard
- Stripe/Shopify/GitHub preset connectors (URL swap only)
- MVP: 3 endpoints, 10K events/mo, email + Slack alerts, payload inspector
- Leverage existing `/p/webhook-retry-service.html`, `/p/webhook-log-viewer.html` for programmatic SEO funnel

## Monetization
| Tier | Price | Events/mo | Target customers for $50k/mo |
|------|-------|-----------|------------------------------|
| Free | $0 | 1K | Acquisition |
| Pro | $29/mo | 25K | ~1,034 customers |
| Team | $79/mo | 250K | ~150 customers (mix) |

**Blended path to $50k:** 700 Pro ($20.3k) + 200 Team ($15.8k) + 400 Pro at scale + API overage = $50k MRR. Comparable: Hookdeck Team $39–499; we undercut on indie positioning.

## Automation Angle
- Edge receive + queue + retry fully automated post-setup
- Self-serve signup, API key provisioning, Stripe billing webhooks
- SEO pages auto-generated from keyword config (already 8 webhook pages)
- Support deflected via docs + status page

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 5 | 4 | 5 | 5 | 4 | **23** |

## Competition
| Competitor | Price | Our edge |
|------------|-------|----------|
| Hookdeck | $39+/mo | Cheaper indie tier; simpler UX |
| EventDock | Free 5K events | We bundle SEO acquisition + dev-tool cross-sell |
| Svix | $490/mo | 10× cheaper for receive-only use case |
| webhook.site | Free | No retries/DLQ — we're production-grade |

## Validation Plan
1. Upgrade HookRelay landing with DLQ feature list + $29/mo pricing
2. Post Show HN / r/SaaS with free tier (1K events)
3. Target: 50 free signups, 5 paid conversions in 30 days
4. Track `/go/webhook.html` → signup CVR

## Risks and Guardrails
- Must store payloads encrypted at rest; publish privacy policy
- Rate-limit free tier to prevent abuse
- Cannot claim SOC2/HIPAA (Svix territory) — target indie/non-regulated
- Respect provider webhook ToS (forwarding only, no modification of payment data)

## Next Step
**Build agent:** Extend `ventures/hookrelay` with retry queue + DLQ replay UI; add Stripe SKU `hookrelay-pro` at $29/mo; wire `/go/webhook.html` CTA to signup.
