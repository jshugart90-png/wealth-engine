# Locked Decisions

Decisions here are final unless Final Boss opens a new cycle with explicit override.

| Date | Decision | Owner | Rationale |
|------|----------|-------|-----------|
| 2026-06-20 | **$500/mo in 30 days** is the north-star metric | Final Boss | growth-target.json assumptions: ~63 sales @ $8 AOV |
| 2026-06-20 | **BillSnap is cycle-1 primary** wedge | Idea Guy → Research Guy | Lowest friction, proven search intent |
| 2026-06-20 | **Data root** stays `D:\wealth-engine-data` on Windows | Deploy Guy | env.mjs auto-detects D:\; marketing artifacts live there |
| 2026-06-20 | **14 Stripe products** — no new SKUs without Money Math + Tier-2 | Stripe Money Guy | config/ventures.json stripeProducts array |
| 2026-06-20 | **Prod deploy = Tier 2** — manual workflow_dispatch only | Security Guy | .github/workflows/deploy-prod.yml |
| 2026-06-20 | **Ad spend cap** pending human — default $300/mo max | Money Math Guy | See APPROVALS.md AP-001 |
| 2026-06-20 | **User blanket approval** — all legal revenue actions approved | Final Boss | User: "if it makes money i approve as long as it's legal"; AP-001/002/003 approved |
| 2026-06-20 | **Prod URL** — Render `*.onrender.com` until custom DNS | Deploy Guy | AP-002 approved; horseshoeroundme subdomain optional follow-up |
| 2026-06-20 | **Google Ads** — CSV ready; user one-click import in UI | Marketing Guy | No Google Ads API OAuth; manual import only |
| 2026-06-20 | **Cycle 1 scope locked** — BillSnap only, no new SKUs | Realistic Guy | 30-day MVP |
