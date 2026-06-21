# Tier-2 Approval Gate

Tier-1 agents act autonomously (research, code, staging, board updates).
Tier-2 requires human approval logged here before proceeding.

## Pending

_(none — blanket approval granted 2026-06-20)_

---

## Template (copy for new requests)

```markdown
### AP-NNN — Title
- **Requested by:** Agent Name
- **Date:** YYYY-MM-DD
- **Action:** What will happen
- **Risk:** What could go wrong
- **Approve:** How human approves
- **Status:** ⏳ PENDING | ✅ APPROVED | ❌ REJECTED
```

## Approved / Rejected

| ID | Decision | Date | Notes |
|----|----------|------|-------|
| AP-001 | ✅ APPROVED | 2026-06-20 | User blanket approval for legal revenue generation. Google Ads budget up to **$300/mo**; import `D:\wealth-engine-data\marketing\ads\google-ads-import.csv`. |
| AP-002 | ✅ APPROVED | 2026-06-20 | User blanket approval for legal revenue generation. Production domain/DNS (Render default URL or `tools.horseshoeroundme.com` when DNS ready). |
| AP-003 | ✅ APPROVED | 2026-06-20 | User blanket approval for legal revenue generation. Production deploy to Render authorized. |

### AP-001 — Google Ads budget authorization (archived)
- **Requested by:** Money Math Guy
- **Date:** 2026-06-20
- **Action:** Spend up to **$300/mo** on Google Ads importing `D:\wealth-engine-data\marketing\ads\google-ads-import.csv`
- **Risk:** Real money spend; CPC variance
- **Status:** ✅ APPROVED — 2026-06-20 — User blanket approval for legal revenue generation.

### AP-002 — Production domain + DNS (archived)
- **Requested by:** Deploy Guy
- **Date:** 2026-06-20
- **Action:** Point custom domain (e.g. `tools.horseshoeroundme.com`) to Render; update Stripe webhook URL
- **Risk:** Live customer-facing URL change
- **Status:** ✅ APPROVED — 2026-06-20 — User blanket approval for legal revenue generation. Using Render default URL until DNS configured.

### AP-003 — Production deploy (Render) (archived)
- **Requested by:** Deploy Guy
- **Date:** 2026-06-20
- **Action:** Deploy wealth-engine to Render production
- **Risk:** Live prod push
- **Status:** ✅ APPROVED — 2026-06-20 — User blanket approval for legal revenue generation.
