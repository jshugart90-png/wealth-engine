# Reddit Workflow — Draft → Review → Publish

**Mode:** `DRAFT_ONLY` — agents never auto-post. User reviews and publishes manually (multiple times per day).

**Account:** [u/WealthEngineDev](https://reddit.com/user/WealthEngineDev) · **Account live:** 2026-06-21 · **Posting:** manual only (never auto-post)

**Drafts:** `D:\wealth-engine-data\marketing\reddit-drafts\`  
**Config (local, not in git):** `D:\wealth-engine-data\marketing\reddit-config.local.json`  
**Signup status:** `D:\wealth-engine-data\marketing\REDDIT_SIGNUP_STATUS.md`

---

## Daily loop

1. **Generate** — overnight sprint or marketing director runs:
   ```bash
   node scripts/reddit-draft-daily.mjs
   ```
   Produces up to 3 new drafts per day from active campaigns in `board/MARKETING.md`.

2. **Review** — open today's files in `reddit-drafts/`:
   - Filename: `{date}-{n}-{subreddit}.md`
   - Edit title/body if needed
   - Change frontmatter `status: DRAFT` → `status: READY_FOR_REVIEW` when satisfied

3. **Publish** — user posts manually on reddit.com:
   - Match **Suggested time** (Tue–Thu 9–11 AM CT for promo posts)
   - Paste **Title** and **Body** from draft
   - Stay in comments 30+ min

4. **Mark published** — in the draft file:
   ```yaml
   status: PUBLISHED
   published_url: https://reddit.com/r/.../comments/...
   ```

---

## Draft file format

```yaml
---
status: DRAFT | READY_FOR_REVIEW | PUBLISHED
date: YYYY-MM-DD
subreddit: freelance
campaign: MC-010
suggested_time: "Tue–Thu 9–11 AM CT"
landing_url: https://wealth-engine-0qlj.onrender.com/go/...
source: POST_2026-06-21_batch10.md
published_url: ""
---
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `node scripts/reddit-draft-queue.mjs` | Summary of parsed outreach + draft counts |
| `node scripts/reddit-draft-queue.mjs --import --limit 10` | Seed from outreach batches |
| `node scripts/reddit-draft-daily.mjs` | Generate 3 daily drafts |

---

## Rules

- **Never** auto-publish or use Reddit API to post
- Max **1 promo post per subreddit per week**
- Lead with value; disclose self-promotion when relevant
- Pull landing URLs from `board/DEPLOY_LOG.md` + latest `/go/*` pages
- Minimum **3 drafts/day** queued for user review

---

## Priority subreddits

r/freelance · r/smallbusiness · r/webdev · r/Entrepreneur · r/SaaS · r/SideProject · r/WebGames · r/indiegames

See `D:\wealth-engine-data\marketing\REDDIT_SIGNUP_READY.md` for account setup.
