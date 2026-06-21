# Money Machine — 11 Autonomous Cursor Agents

Human-in-the-loop wealth engine for **$500/mo in 30 days** across 9 ventures and **14 Stripe products**.

## Quick start

```powershell
cd C:\Users\jshug\wealth-engine
node scripts/run-agent-cycle.mjs
```

Open Cursor → new Agent chat → `@research-guy` (or whichever agent the helper names).

Each agent:
1. Reads `board/PIPELINE.md`
2. Does its job (see `.cursor/rules/<agent>.mdc`)
3. **Appends** a verdict entry to `board/PIPELINE.md`
4. Updates relevant board files

## The 11 agents

| # | Rule | Role |
|---|------|------|
| 1 | `@idea-guy` | Prioritize ideas, kick cycles |
| 2 | `@research-guy` | Market validation |
| 3 | `@realistic-guy` | Scope / kill bad ideas |
| 4 | `@money-math-guy` | Unit economics → $500 path |
| 5 | `@marketing-guy` | Ads CSV, landings, outreach (`core/pipeline/ramp.mjs`) |
| 6 | `@stripe-money-guy` | Payment links, webhook fulfillment |
| 7 | `@bug-checker-guy` | QA, `npm run health` |
| 8 | `@code-cracker-guy` | Implementation |
| 9 | `@security-guy` | Secrets, Tier-2 review |
| 10 | `@deploy-guy` | Render / CI / staging |
| 11 | `@final-boss` | Owns `board/TASKS.md`, closes cycles |

Coordinator: `@money-machine-coordinator` — loop overview and verdict format.

## Board structure

```
board/
  PIPELINE.md    # append-only handoffs
  IDEAS.md       # backlog
  DECISIONS.md   # locked decisions
  TASKS.md       # Final Boss queue
  APPROVALS.md   # Tier-2 gates
```

## Autonomy tiers

| Tier | Who decides | Examples |
|------|-------------|----------|
| **Tier 1** | Agents | Research, code, build, staging, board updates |
| **Tier 2** | **You** | Prod deploy, DNS, ad spend, new Stripe prices |

Tier-2 flow:
1. Agent logs request in `board/APPROVALS.md`
2. Run `node scripts/notify-approval.mjs --id AP-001` (Telegram or Slack)
3. You approve in chat or env
4. Agent continues

### Notification env

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
# or
SLACK_WEBHOOK_URL=...
```

## Verdict format

Every agent ends with:

```markdown
## VERDICT: PASS | FAIL | HOLD
**Agent:** ...
**Cycle:** N
**Subject:** ...
**Summary:** ...
**Artifacts:** ...
**Tier-2 needed:** yes/no
**Next:** @next-agent
```

## Automated backend (runs in parallel)

The Node orchestrator complements the Cursor agents:

```powershell
npm run run          # single cycle
npm run run:daemon   # server + cycle every 6h (or RUN_INTERVAL_MINUTES)
```

Each orchestrator cycle runs:
- Stripe sync
- PDF + CompareStack refresh
- Build all ventures
- **Growth ramp** (`core/pipeline/ramp.mjs`) → `D:\wealth-engine-data\marketing\`
- **Uptime checks** (StatusPing)

Final Boss should run `npm run run` at cycle close.

## CI / deploy

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `.github/workflows/ci.yml` | push to `main` | build, health, staging deploy hook |
| `.github/workflows/deploy-prod.yml` | **manual only** | Tier-2 prod deploy |

See `deploy/render.yaml` for Render service definition.

## Cycle 1 status

Seeded in `board/PIPELINE.md`:
- Idea Guy → Research Guy on **BillSnap scale-up** (PASS)
- Next agent: **Realistic Guy** (`@realistic-guy`)

## Human blockers

See [ACCESS_NEEDED.md](ACCESS_NEEDED.md) — domain, GitHub repo, Google Ads, ad budget.
