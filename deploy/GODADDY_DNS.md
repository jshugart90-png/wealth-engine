# GoDaddy DNS + Render custom domain

**Skip Netlify.** Use GoDaddy for `horseshoeroundme.com` and Render for Wealth Engine tools.

## Production URLs (current)

| Service | URL |
|---------|-----|
| Wealth Engine (Render) | https://wealth-engine-0qlj.onrender.com |
| Horseshoe marketing site | https://horseshoeroundme.com (GoDaddy hosting) |
| Recommended tools subdomain | `tools.horseshoeroundme.com` → Render |

---

## Step 1 — Point `tools.horseshoeroundme.com` to Render (~5 min)

1. **Render Dashboard** → `wealth-engine-0qlj` service → **Settings** → **Custom Domains**
2. Click **Add Custom Domain** → enter `tools.horseshoeroundme.com`
3. Render shows a **CNAME target** (e.g. `wealth-engine-0qlj.onrender.com`)

4. **GoDaddy** → [DNS Management](https://dcc.godaddy.com/manage/dns) for `horseshoeroundme.com`
5. Add record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | tools | `wealth-engine-0qlj.onrender.com` | 600 |

6. Wait 5–30 min for DNS propagation
7. Render will auto-provision HTTPS once DNS resolves

### After DNS is live

Update Render environment variables:

```
PUBLIC_BASE_URL=https://tools.horseshoeroundme.com
STRIPE_SUCCESS_URL=https://tools.horseshoeroundme.com/thanks
STRIPE_CANCEL_URL=https://tools.horseshoeroundme.com/
```

Stripe Dashboard → Webhooks → update endpoint to:
`https://tools.horseshoeroundme.com/webhooks/stripe`

Re-export ads (orchestrator does this automatically):

```powershell
cd C:\Users\jshug\wealth-engine
npm run run
```

---

## Step 2 — Horseshoe cross-promo bar (GoDaddy, NOT Netlify)

The promo bar is already in `C:\Users\jshug\Website\index.html` (line ~141):

```html
<div style="background:#0f172a;...">
  <strong>Tools:</strong>
  <a href="https://wealth-engine-0qlj.onrender.com/go/invoice.html">Invoice PDF $3</a>
  ...
</div>
```

**Deploy to GoDaddy:**

1. GoDaddy → **My Products** → `horseshoeroundme.com` → **Manage**
2. If using **Website Builder**: paste the promo bar HTML at top of homepage
3. If using **cPanel File Manager**: upload/replace `public_html/index.html` from `C:\Users\jshug\Website\index.html`
4. Verify at https://horseshoeroundme.com — promo links should open Render URLs

Optional: update promo links to `https://tools.horseshoeroundme.com/go/...` after Step 1 DNS is live.

---

## Step 3 — Optional: forward apex domain

If you want `horseshoeroundme.com` to also reach tools:

| Option | GoDaddy setup |
|--------|---------------|
| Keep Horseshoe landing | No change — apex stays on GoDaddy site |
| Forward `/tools` path | Not supported on basic GoDaddy — use subdomain instead |
| Forward whole apex | Domain Forwarding → `https://tools.horseshoeroundme.com` (loses Horseshoe site) |

**Recommended:** Keep apex on Horseshoe brand site; use `tools.horseshoeroundme.com` for Wealth Engine.

---

## Verify

```powershell
# DNS (after propagation)
nslookup tools.horseshoeroundme.com

# Health
Invoke-WebRequest https://wealth-engine-0qlj.onrender.com/api/health -UseBasicParsing

# Custom domain (after Render cert issued)
Invoke-WebRequest https://tools.horseshoeroundme.com/api/health -UseBasicParsing
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Render "DNS not verified" | Confirm CNAME name is `tools` not `tools.horseshoeroundme.com` |
| SSL pending | Wait up to 1 hour after DNS resolves |
| Stripe webhook fails | Re-copy signing secret after URL change |
| Ads 404 on Final URL | Re-run `npm run run` to regenerate CSV with new base URL |
