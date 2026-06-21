# Personal Assistant Playbook

How to use the Personal Assistant agent in Wealth Engine chat.

---

## What it does

The Personal Assistant is your **human-task concierge**. It:

- Reads your living priority doc (`board/MY_NEXT_STEPS.md`) first
- Gives you **one clear next action** with numbered steps, exact URLs, file paths, and time estimates
- Marks tasks complete when you say **"done with X"**
- Coordinates with other wealth-engine agents (Marketing Director, Deploy Guy, etc.)
- Never auto-spends money or posts to Reddit/social without your approval

---

## How to invoke

### In Cursor chat

1. Open the **wealth-engine** repo in Cursor
2. Start a new chat (or continue an existing one)
3. Use any of these prompts:

| Prompt | What you get |
|--------|--------------|
| `@personal-assistant what's next?` | Single best action from `MY_NEXT_STEPS.md` |
| `@personal-assistant done with GSC verify` | Marks complete + tells you what unlocks |
| `@personal-assistant how do I post to Reddit?` | Step-by-step from ready draft |
| `@personal-assistant I have 15 minutes` | Top quick win from current state |
| `@personal-assistant blocked on Mac` | Alternates that don't need Mac |

### Attach the rule manually

If `@personal-assistant` is not in the rule picker:

1. Open `.cursor/rules/personal-assistant.mdc`
2. Or say: *"Act as Personal Assistant per `.cursor/rules/personal-assistant.mdc` — what's my next step?"*

### Morning routine (recommended)

```
@personal-assistant Good morning — read MY_NEXT_STEPS.md and give me today's top 3.
```

---

## Task completion workflow

```
You complete task → say "done with [task name]" → assistant updates boards → gives new #1 priority
```

### Example

**You:** `done with GSC verify`

**Assistant will:**

1. Check off step 1 in `board/MY_NEXT_STEPS.md` → move to **Completed**
2. Update `board/TASKS.md` if applicable (e.g. T-010 partial)
3. Reply with: what unlocked (Bing import, IndexNow), new #1 action (Bing Webmaster import), time estimate

### Reddit post completion

After publishing manually:

1. Update draft file on D: drive:
   ```yaml
   status: PUBLISHED
   published_url: https://reddit.com/r/freelance/comments/...
   ```
2. Tell assistant: `done with Reddit freelance post`
3. Assistant marks complete and suggests next draft (e.g. r/smallbusiness)

---

## What the assistant reads

| File | Purpose |
|------|---------|
| `board/MY_NEXT_STEPS.md` | Your living priority list |
| `board/USER_FIRST_DOLLAR.md` | Ranked first-dollar path |
| `board/TASKS.md` | Build queue (T-001, T-002, …) |
| `board/MARKETING.md` | Campaign status |
| `board/APPS.md` | Mobile/PWA/TestFlight |
| `board/PRODUCTION.md` | Overnight agent cycles |
| `board/REDDIT_WORKFLOW.md` | Draft → review → publish |
| `D:\wealth-engine-data\marketing\reddit-drafts\` | Ready posts |
| `deploy/*.md` | Infra setup guides |
| `mobile/APP_STORE_MANUAL_STEPS.md` | Store uploads |

## What the assistant writes

| File | When |
|------|------|
| `board/MY_NEXT_STEPS.md` | Every session — keeps priorities current |
| `board/TASKS.md` | When a queued task status changes |
| `board/MARKETING.md` | When a marketing checkbox completes |

---

## User-facing guides (links)

### Search & discovery ($0)

| Guide | Path | Time |
|-------|------|-----:|
| Google Search Console + Bing + IndexNow | [deploy/SEARCH_CONSOLE_BING_FREE_SETUP.md](../deploy/SEARCH_CONSOLE_BING_FREE_SETUP.md) | 10 min |
| GoDaddy DNS CNAME → Render | [deploy/GODADDY_DNS.md](../deploy/GODADDY_DNS.md) | 15 min |
| Render deploy | [deploy/RENDER.md](../deploy/RENDER.md) | — |
| Trigger deploy | [deploy/trigger-render-deploy.md](../deploy/trigger-render-deploy.md) | 2 min |

### Reddit & community ($0)

| Guide | Path | Time |
|-------|------|-----:|
| Reddit workflow (draft → publish) | [board/REDDIT_WORKFLOW.md](../board/REDDIT_WORKFLOW.md) | — |
| Reddit signup steps | `D:\wealth-engine-data\marketing\REDDIT_SIGNUP_READY.md` | 2 min |
| Ready drafts (10 REVIEW) | `D:\wealth-engine-data\marketing\reddit-drafts\` | 10 min/post |
| Free posts batch | `D:\wealth-engine-data\marketing\outreach\FREE_POSTS_batch1.md` | — |
| Zero-budget playbook | `D:\wealth-engine-data\marketing\ZERO_BUDGET_PLAYBOOK.md` | — |

### Mobile & games

| Guide | Path | Time |
|-------|------|-----:|
| TestFlight (Mac required) | [mobile/fastlane/README.md](../mobile/fastlane/README.md) | 30–45 min |
| App Store manual steps | [mobile/APP_STORE_MANUAL_STEPS.md](../mobile/APP_STORE_MANUAL_STEPS.md) | — |
| Apps tracker | [board/APPS.md](../board/APPS.md) | — |
| Games promo | `D:\wealth-engine-data\marketing\outreach\GAMES_PROMO_2026-06-21.md` | 15 min |
| itch.io zips | `D:\wealth-engine-data\mobile\itch\*.zip` | 15 min/game |

### Affiliate & monetization

| Guide | Path | Time |
|-------|------|-----:|
| Affiliate launch (6 channels) | `D:\wealth-engine-data\marketing\outreach\AFFILIATE_LAUNCH_2026-06-21.md` | 7 min |
| Partner portal | https://wealth-engine-0qlj.onrender.com/join.html | — |
| First dollar checklist | [board/USER_FIRST_DOLLAR.md](../board/USER_FIRST_DOLLAR.md) | 30 min |
| Monetization matrix | [docs/MONETIZATION_MATRIX.md](MONETIZATION_MATRIX.md) | — |

### Blocked (need approval or credentials)

| Item | Blocker | Doc |
|------|---------|-----|
| Google Ads | $0 budget policy | `D:\wealth-engine-data\marketing\ADS_IMPORT_CHECKLIST.md` |
| Google Play | $25 fee | [mobile/APP_STORE_MANUAL_STEPS.md](../mobile/APP_STORE_MANUAL_STEPS.md) |
| Auto email | RESEND_API_KEY | `docs/ACCESS_NEEDED.md` |

---

## Coordination with other agents

| You need… | Ask… |
|-----------|------|
| New Reddit drafts | Marketing Director (`@marketing-director`) |
| DNS / Render / deploy | Deploy Guy (`@deploy-guy`) |
| Code changes / new features | Code Cracker Guy |
| Store build issues | Check `board/APPS.md`; TestFlight needs Mac |
| Overnight priorities | Final Boss / Production Orchestrator |
| Revenue analysis | Stripe Money Guy |

The Personal Assistant **does not write code**. It routes build work to agents and keeps your manual checklist current.

---

## Hard limits

- **No auto-spend** — Google Ads, Play $25, paid tools require explicit approval
- **No auto-post** — Reddit, X, LinkedIn, IH are manual publish only
- **No secrets in git** — API keys, `.p8`, `.env` stay local

---

## Quick reference

| | |
|---|---|
| **Living doc** | `board/MY_NEXT_STEPS.md` |
| **Agent rule** | `.cursor/rules/personal-assistant.mdc` |
| **Prod** | https://wealth-engine-0qlj.onrender.com |
| **Coupon** | LAUNCH25 (25% off) |
| **Reddit** | u/WealthEngineDev |
| **Revenue goal** | $500/mo |
