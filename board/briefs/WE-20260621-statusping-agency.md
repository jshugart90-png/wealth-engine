# Idea Brief: StatusPing Agency White-Label

**ID:** WE-20260621-statusping-agency
**Date:** 2026-06-21
**Status:** READY_FOR_BUILD

## Problem
Web agencies resell uptime monitoring at $20–30/client/mo but pay PerkyDash €49/mo (2 clients), Uptimeify €69/mo, or FlareWarden $137/mo for white-label platforms. Agencies need: custom status page domains per client, branded dashboards, no per-client seat fees, and margin-friendly wholesale pricing. StatusPing has basic ($5), team ($19), and DevWatch ($39) tiers but no agency/reseller SKU. 12 CompareStack uptime pages + SSL/cron tools drive agency-intent traffic.

## Solution
Launch **StatusPing Agency** at **$49/mo** wholesale:
- **10 client workspaces** (add +$5/workspace overage)
- **100 monitors** shared pool across clients
- **White-label status pages:** `status.{clientdomain}.com` CNAME instructions + TemplateForge-branded fallback
- **Branded email alerts** (agency logo in alert footer)
- **Reseller kit:** margin calculator, client pitch one-pager, SLA template (PDF from TemplateForge)
- **Retail guidance:** agencies charge $20–30/client → $200–300/mo revenue on $49 COGS = 75%+ margin
- **MVP scope:** agency-monthly Stripe SKU, workspace switcher in dashboard, status page subdomain config doc

## Monetization
$49/mo × 150 agencies = $7.35k MRR direct; **$50k path** requires 340 agencies OR hybrid: 100 agencies + 800 DevWatch/Team retail subs. Agency channel compounds — each agency adds 5–15 end clients over 12 months. PerkyDash validates €49 entry with 2 workspaces; we undercut on monitor count (100 vs 20).

## Automation Angle
Monitor checks, alerts, billing automated (existing `checker.mjs`). Workspace provisioning via config JSON. Status page generation from existing StatusPing templates. SEO funnel from `/comparestack/pages/uptime-monitoring-tools.html` → `/go/statusping-agency`.

## Scores (1–5)
| Feasibility | Time-to-Revenue | Automation | Capital (inv) | Risk (inv) | **Total** |
|-------------|-----------------|------------|---------------|------------|-----------|
| 4 | 3 | 4 | 5 | 4 | **20** |

## Competition
PerkyDash Agency €49/mo, Uptimeify €69/mo, FlareWarden $137/mo. Differentiation: lowest agency entry with highest monitor pool, bundled with DevWatch SSL/cron upsell, portfolio cross-sell (invoice + NDA for agency clients).

## Validation Plan
Landing at `/go/statusping-agency`; outreach to 20 web dev agencies on Reddit r/webdev + Indie Hackers; target 5 agency trials in 60 days.

## Risks and Guardrails
Custom domain SSL requires user CNAME setup — document clearly. No SLA guarantees beyond uptime check accuracy. Support load scales with agencies — cap at 50 agencies until async support playbook exists.

## Next Step
**Build agent:** `agency-monthly` SKU ($49), workspace model in StatusPing config, `/go/statusping-agency.html`, reseller kit PDF from TemplateForge catalog.
