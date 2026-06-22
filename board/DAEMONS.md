# Overnight Daemons

**STATUS:** **STOPPED** per user directive 2026-06-21 — **app-dev-only mode**

**Stopped at:** 2026-06-22 (user pivot)  
**Action:** All non-app background daemons terminated; **do not** restart until user lifts app-dev-only mode.

| Daemon | PID(s) stopped | Status | Notes |
|--------|----------------|--------|-------|
| `scripts/overnight-build-sprint.mjs` | — | **STOPPED** | Not running at stop time |
| `scripts/money-machine-daemon.mjs` | 23828, 29404, 34360, 34996 | **STOPPED** | All instances killed |
| `deploy/marketing-director-loop.ps1` | — | **STOPPED** | Not running at stop time |
| `deploy/production-orchestrator-loop.ps1` | — | **STOPPED** | Not running at stop time |
| GitHub Pro cycle loops | — | **STOPPED** | Not running at stop time |

**Preserved:** `core/server` (prod) — not stopped per directive.

---
_Manually updated for app-dev-only pivot._
