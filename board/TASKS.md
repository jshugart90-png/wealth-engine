# Build Queue (Final Boss owned)

Status: `todo` | `in_progress` | `blocked` | `done`

**Goal:** $500/mo · **Current Stripe products:** 14 · **Data:** `D:\wealth-engine-data`

| # | Task | Owner agent | Status | Blocker |
|---|------|-------------|--------|---------|
| T-001 | Deploy wealth-engine to Render staging; verify `/api/health` | Deploy Guy | todo | GitHub repo + Render service (see docs/ACCESS_NEEDED.md) |
| T-002 | Point custom domain + update `PUBLIC_BASE_URL` + Stripe webhook | Deploy Guy | blocked | Human: domain choice (AP-002) |
| T-003 | Import `google-ads-import.csv` from `D:\wealth-engine-data\marketing\` | Marketing Guy | blocked | Human: Google Ads billing (AP-001) |
| T-004 | Optimize BillSnap `/go/invoice` landing + LAUNCH25 coupon in ads copy | Marketing Guy + Code Cracker Guy | in_progress | — |
| T-005 | Run orchestrator on 180m interval; confirm ramp-report.json updates | Final Boss | in_progress | `npm run run:daemon` or Render daemon |

## Completed

| # | Task | Done |
|---|------|------|
| — | Seed Money Machine board + 11 agent rules | 2026-06-20 |
| — | Fix orchestrator uptime step (runUptimeChecks) | 2026-06-20 |
