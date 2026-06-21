# Game Pipeline

**Agent:** Game Creator · **Sprint:** 2026-06-21 overnight → 08:00 CT  
**Prod base:** https://wealth-engine-0qlj.onrender.com/games/

| Slug | Name | Status | QC | Live URL | Promo |
|------|------|--------|-----|----------|-------|
| horseshoe-toss | Horseshoe Toss | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/horseshoe-toss/ | **PROMO_READY** |
| invoice-stack | Invoice Stack | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/invoice-stack/ | **PROMO_READY** |
| uptime-defender | Uptime Defender | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/uptime-defender/ | **PROMO_READY** |
| freelancer-memory | Memory Match: Freelancer Tools | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/freelancer-memory/ | **PROMO_READY** |
| color-switch-snake | Color Switch Snake | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/color-switch-snake/ | **PROMO_READY** |
| word-scramble-biz | Word Scramble: Business Terms | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/word-scramble-biz/ | **PROMO_READY** |
| receipt-rush | Receipt Rush | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/receipt-rush/ | **PROMO_READY** |
| webhook-whack | Webhook Whack-a-Mole | **Shipped** | 5/5 PASS | https://wealth-engine-0qlj.onrender.com/games/webhook-whack/ | **PROMO_READY** |

**Games hub:** https://wealth-engine-0qlj.onrender.com/games/

## Queue (future ideas)

- Receipt Rush — catch falling receipts (BillSnap)
- Net-30 Ninja — dodge late-payment obstacles
- Webhook Whack-a-Mole — tap failed webhooks (HookRelay)
- SSL Shield — block expiry bombs (StatusPing)
- NDA Speed Sign — match clause pairs (NDAGen)

---

## QC Log — horseshoe-toss

### QC Pass 1/5 — 2026-06-21 00:32 CT
- **Result:** PASS
- **Notes:** Loads at /games/horseshoe-toss/, no external deps, canvas renders
- **Fixes:** None

### QC Pass 2/5 — 2026-06-21 00:33 CT
- **Result:** PASS
- **Notes:** 10-round scoring, ringer/close/miss logic, best score persists localStorage, play-again works
- **Fixes:** None

### QC Pass 3/5 — 2026-06-21 00:33 CT
- **Result:** PASS
- **Notes:** touch-action:none, touchstart handler, responsive canvas resize, viewport meta
- **Fixes:** None

### QC Pass 4/5 — 2026-06-21 00:34 CT
- **Result:** PASS
- **Notes:** Clear instructions, power bar visual, all-ages timing mechanic, StatusPing/Horseshoe CTAs
- **Fixes:** None

### QC Pass 5/5 — 2026-06-21 00:35 CT
- **Result:** PASS
- **Notes:** Local smoke test HTTP 200
- **Fixes:** None

---

## QC Log — invoice-stack

### QC Pass 1/5 — PASS — loads, single-file HTML, no console errors
### QC Pass 2/5 — PASS — stack/trim/overlap scoring, lives, level-up, game over
### QC Pass 3/5 — PASS — touch left/right zones, mouse hold, responsive canvas
### QC Pass 4/5 — PASS — invoice labels, BillSnap CTA with LAUNCH25, clear instructions
### QC Pass 5/5 — PASS — local HTTP 200

---

## QC Log — uptime-defender

### QC Pass 1/5 — PASS — loads clean
### QC Pass 2/5 — PASS — lane towers, wave spawning, uptime drain, credits
### QC Pass 3/5 — PASS — tap lane placement, touch support
### QC Pass 4/5 — PASS — server/bug metaphor, StatusPing CTA, wave messages
### QC Pass 5/5 — PASS — local HTTP 200
- **Fixes between passes:** Fixed score variable declaration order

---

## QC Log — freelancer-memory

### QC Pass 1/5 — PASS — loads, 16-card grid renders
### QC Pass 2/5 — PASS — match/mismatch flip, move counter, win at 8 pairs
### QC Pass 3/5 — PASS — tap cards, touch-action:manipulation, responsive grid
### QC Pass 4/5 — PASS — freelancer tool icons, Freelancer Stack CTA
### QC Pass 5/5 — PASS — local HTTP 200

---

## QC Log — color-switch-snake

### QC Pass 1/5 — PASS — loads, canvas snake renders
### QC Pass 2/5 — PASS — eat food changes color, gate matching, score/best persist
### QC Pass 3/5 — PASS — tap left/right turn, touch support
### QC Pass 4/5 — PASS — color labels, games hub CTA, simple instructions
### QC Pass 5/5 — PASS — local HTTP 200

---

## QC Log — word-scramble-biz

### QC Pass 1/5 — PASS — loads, 10 rounds
### QC Pass 2/5 — PASS — spell check, skip, clear, scoring
### QC Pass 3/5 — PASS — tap letters, mobile-friendly buttons
### QC Pass 4/5 — PASS — business hints, BillSnap/Net30 CTAs
### QC Pass 5/5 — PASS — local HTTP 200
- **Fixes between passes:** Fixed letter pick tracking (picked[] indices)

---

## Marketing Director � PROMO_READY

8 shipped games; receipt-rush + webhook-whack itch zips in `GAMES_PROMO_2026-06-21.md` (**PROMO_READY**):

- **Batch:** `D:\wealth-engine-data\marketing\outreach\GAMES_PROMO_2026-06-21.md` � itch.io, r/WebGames, r/indiegames, Facebook groups, Poki/CrazyGames/GameMonetize prep
- **Reddit signup (user):** `D:\wealth-engine-data\marketing\REDDIT_SIGNUP_READY.md`
- **Playbook:** `D:\wealth-engine-data\marketing\ZERO_BUDGET_PLAYBOOK.md`
- Cross-link: portfolio README games hub, horseshoeroundme.com (ZB-008)
