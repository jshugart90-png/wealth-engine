import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";
import { AFFILIATE_REF_SCRIPT } from "../marketing/affiliates.mjs";

const PAGES = [
  {
    slug: "invoice",
    headline: "Invoice PDF in 30 seconds",
    sub: "No signup. Preview free. Pro PDF $3 — or unlimited exports for $29/mo.",
    sku: "pro-pdf",
    tool: "/billsnap/index.html",
    bullets: ["Freelancers & contractors", "Print-ready PDF", "One-time $3 or $29/mo unlimited"],
    urgency: "Most freelancers export their first pro PDF in under 2 minutes.",
    socialProof: "2,400+ preview sessions this month",
    altSku: "unlimited-month",
    altLabel: "BillSnap Pro Unlimited — $29/mo",
  },
  {
    slug: "lease",
    headline: "Is your lease trying to screw you?",
    sub: "Paste your lease. Get a risk score + red flags in seconds.",
    sku: "single-report",
    tool: "/leaselens/index.html",
    bullets: ["Rule-based analysis", "Not legal advice", "Full report $7"],
  },
  {
    slug: "uptime",
    headline: "Know before your customers do",
    sub: "Email alerts when your site goes down. From $5/mo.",
    sku: "basic-monthly",
    tool: "/statusping/index.html",
    bullets: ["5 monitors", "5-min checks", "Cancel anytime"],
  },
  {
    slug: "nda",
    headline: "NDA in 2 minutes — not 2 hours",
    sub: "Free preview. Clean PDF export for $4. No lawyer subscription.",
    sku: "nda-pdf",
    tool: "/ndagen/index.html",
    bullets: ["Freelancers & startups", "Mutual or one-way", "Instant download"],
  },
  {
    slug: "webhook",
    headline: "Never miss a webhook again",
    sub: "Receive, retry with backoff, dead letter queue, and one-click replay. From $7/mo.",
    sku: "relay-monthly",
    tool: "/hookrelay/index.html",
    bullets: ["3 endpoints · 10K events/mo", "DLQ email alerts on failure", "Stripe/GitHub/Shopify presets"],
    altSku: "hookrelay-pro",
    altLabel: "DLQ Pro — $29/mo (25K events)",
  },
  {
    slug: "hookrelay-dlq",
    headline: "Webhook dead letter queue for indie SaaS",
    sub: "Durable receive → exponential backoff retry → DLQ → replay. $29/mo beats Hookdeck at $39+.",
    sku: "hookrelay-pro",
    tool: "/hookrelay/index.html",
    bullets: ["10 endpoints · 25K events/mo", "One-click DLQ replay dashboard", "Slack + email failure alerts"],
    urgency: "Fix failed Stripe webhooks before customers notice.",
    socialProof: "Built for solo devs shipping on Render, Fly, and Vercel",
    altSku: "relay-monthly",
    altLabel: "Starter relay — $7/mo",
  },
  {
    slug: "pipekit",
    headline: "Dev APIs without the bloat",
    sub: "UUID, hash, base64, JSON — self-serve keys from $9/mo.",
    sku: "starter-monthly",
    tool: "/devtools-api/index.html",
    bullets: ["100 free req/day", "API key in minutes", "No Postman required"],
  },
  {
    slug: "templates",
    headline: "Business templates that ship today",
    sub: "Compliance, hiring, and freelancer kits. Instant download after checkout.",
    sku: "freelancer-kit",
    tool: "/templateforge/index.html",
    bullets: ["Print-ready PDFs", "SMB & freelancer focus", "From $12"],
  },
  {
    slug: "meeting",
    headline: "This meeting costs how much?",
    sub: "Show your team the real dollar cost. Pro shareable report for $5.",
    sku: "meeting-pro",
    tool: "/meetingcost/index.html",
    bullets: ["Viral share link", "Free calculator", "Pro PDF export $5"],
  },
  {
    slug: "receipt",
    headline: "Receipt PDF in one click",
    sub: "Free preview. Clean receipt export for $3. Perfect for cash sales and reimbursements.",
    sku: "pro-pdf",
    tool: "/billsnap/index.html",
    bullets: ["No signup required", "Print-ready PDF", "Same $3 pro export as invoices"],
  },
  {
    slug: "compare",
    headline: "Pick the right tool in 60 seconds",
    sub: "Side-by-side comparisons for uptime, invoices, webhooks, and dev APIs.",
    sku: "starter-monthly",
    tool: "/comparestack/index.html",
    bullets: ["Honest feature tables", "Direct checkout links", "Updated 2026"],
  },
  {
    slug: "hiring",
    headline: "Hire without HR software",
    sub: "Interview scorecards, offer letters, onboarding checklists — instant PDF download.",
    sku: "hiring-pack",
    tool: "/templateforge/index.html",
    bullets: ["Print-ready templates", "Small team focus", "From $12 with LAUNCH25"],
  },
  {
    slug: "freelancer",
    headline: "Freelancer Revenue Stack — invoice to NDA",
    sub: "BillSnap unlimited + TemplateForge + NDAGen. $29/mo or $49 bundle. LAUNCH25 at checkout.",
    sku: "stack-unlimited",
    tool: "/bundles/freelancer-stack.html",
    bullets: ["Unlimited invoice & receipt PDFs", "14 contract & proposal templates", "NDA generator included"],
    urgency: "Ship your client paperwork today — no accounts, instant PDFs.",
    socialProof: "320K+ monthly searches for freelancer invoice tools",
    altSku: "freelancer-stack-bundle",
    altLabel: "Stack Bundle — $49 one-time",
  },
  {
    slug: "compliance",
    headline: "SMB compliance pack without a lawyer",
    sub: "Incident response, vendor agreements, W-9 checklists — plus state-specific 1099 guides. Download in 60 seconds.",
    sku: "smb-compliance-pack",
    tool: "/p/freelancer-compliance-by-state.html",
    bullets: ["40 state compliance guides live", "Print-ready PDF templates", "1099 + contractor checklists"],
    urgency: "Jan 31 1099-NEC deadline — get templates and state filing guides now.",
    socialProof: "Pilot: CA, TX, FL, NY, IL, PA, OH, GA, NC, MI compliance pages",
    altSku: "freelancer-kit",
    altLabel: "Freelancer Kit — $14",
  },
  {
    slug: "contractor",
    headline: "Contractor invoice — get paid faster",
    sub: "1099-friendly invoice PDF. Preview free, pro export $3. Unlimited plan $29/mo.",
    sku: "pro-pdf",
    tool: "/billsnap/index.html",
    bullets: ["No account required", "Late-fee line items", "BillSnap Pro unlimited $29/mo"],
    urgency: "Send invoices the same day you finish the job.",
    altSku: "unlimited-month",
    altLabel: "BillSnap Pro Unlimited — $29/mo",
  },
  {
    slug: "billsnap-pro",
    headline: "BillSnap Pro — unlimited invoice PDFs",
    sub: "Invoice weekly without counting exports. $29/mo beats QuickBooks for solo contractors.",
    sku: "unlimited-month",
    tool: "/billsnap/index.html",
    bullets: ["Unlimited pro PDF exports", "No signup wall", "Cancel anytime"],
    urgency: "320K+ monthly searches for freelancer invoice tools.",
    socialProof: "Built for contractors, consultants, and 1099 freelancers",
    altSku: "pro-pdf",
    altLabel: "Single export — $3 one-time",
  },
  {
    slug: "stack",
    headline: "Freelancer Revenue Stack",
    sub: "Unlimited invoices + 14 templates + NDA generator. $29/mo or $49 one-time bundle.",
    sku: "stack-unlimited",
    tool: "/bundles/freelancer-stack.html",
    bullets: ["BillSnap unlimited PDFs", "TemplateForge freelancer kit", "NDAGen PDF export included"],
    altSku: "freelancer-stack-bundle",
    altLabel: "One-time bundle — $49",
    urgency: "Replace 3 subscriptions with one stack.",
  },
  {
    slug: "devwatch",
    headline: "DevWatch — uptime + SSL + cron in one",
    sub: "Stop paying for 3 monitoring tools. 25 monitors, 10 SSL certs, 20 cron jobs — $39/mo.",
    sku: "devwatch-monthly",
    tool: "/statusping/index.html",
    bullets: ["Unified Slack + email alerts", "SSL expiry warnings", "Cron heartbeat monitoring"],
    altSku: "basic-monthly",
    altLabel: "Uptime only — $5/mo",
  },
  {
    slug: "nda-team",
    headline: "NDAGen Team — 50 NDAs/mo for agencies",
    sub: "3 seats, shared templates, governing-law selector. $29/mo beats Quoqo at $30.",
    sku: "ndagen-team-monthly",
    tool: "/ndagen/index.html",
    bullets: ["50 PDF exports per month", "3 team seats + audit log", "Mutual & one-way NDAs"],
    urgency: "Agencies outgrow $4 one-off exports fast — Team tier ships today.",
    socialProof: "CompareStack NDA traffic + Freelancer Stack cross-sell",
    altSku: "nda-pdf",
    altLabel: "Single PDF — $4 one-time",
  },
  {
    slug: "meeting-cost-team",
    headline: "MeetingCost Team — show your org what meetings cost",
    sub: "25 seats, shared salary templates, embed widget, and meeting history dashboard. $29/mo.",
    sku: "meetingcost-team-monthly",
    tool: "/meetingcost/index.html",
    bullets: ["50 shareable reports per month", "25 team seats + audit log", "Intranet embed widget included"],
    urgency: "Calwise charges €30/mo — indie team tier with no calendar OAuth.",
    socialProof: "Viral embed widget + CompareStack meeting-cost traffic",
    altSku: "meeting-pro",
    altLabel: "Single report — $5 one-time",
  },
  {
    slug: "statusping-agency",
    headline: "StatusPing Agency — white-label monitoring",
    sub: "10 client workspaces, 100 monitors, branded status pages. $49/mo wholesale for agencies.",
    sku: "agency-monthly",
    tool: "/statusping/index.html",
    bullets: ["Resell at $20–30/client", "White-label status pages", "Reseller kit included"],
    urgency: "PerkyDash charges €49 for 2 clients — we give 10 workspaces.",
    socialProof: "Built for web dev shops on Render, Fly, and Vercel",
    altSku: "devwatch-monthly",
    altLabel: "DevWatch bundle — $39/mo",
  },
  {
    slug: "1099-deadline",
    headline: "1099-NEC deadline — don't pay $60/form penalties",
    sub: "Track contractor payments, generate 1099-NEC PDFs, state filing checklists. Pro suite $19.",
    sku: "1099-suite-pro",
    tool: "/tools/1099-tax-estimator.html",
    bullets: ["Jan 31 federal deadline tracker", "Up to 10 contractor 1099 PDFs", "State filing guides from compliance hub"],
    urgency: "Late 1099-NEC penalties start at $60 per form.",
    socialProof: "Built on 10-state compliance data + BillSnap contractor invoicing",
    altSku: "smb-compliance-pack",
    altLabel: "Compliance pack — $19",
  },
  {
    slug: "pipekit-pro",
    headline: "PipeKit API — 50K requests/mo included",
    sub: "JSON validate, hash, DNS, UUID — one API key. $29/mo metered dev utilities.",
    sku: "pro-monthly",
    tool: "/devtools-api/index.html",
    bullets: ["50K requests included", "Overage $0.50/10K", "Free tier 1K/day for testing"],
    urgency: "74% of SaaS uses usage-based pricing in 2026.",
    socialProof: "Bundled dev utilities — one key vs 5 separate tools",
    altSku: "starter-monthly",
    altLabel: "Starter — $9/mo",
  },
];

export function buildHighConversionLandings() {
  const dist = join(getRoot(), "dist", "go");
  mkdirSync(dist, { recursive: true });
  const base = getPublicBaseUrl();
  const coupon = "LAUNCH25";

  for (const p of PAGES) {
    const pay = getPaymentLink(p.sku) ?? "#";
    const altPay = p.altSku ? getPaymentLink(p.altSku) ?? "#" : null;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${p.headline} — LAUNCH25 Deal</title>
<meta property="og:title" content="${p.headline}">
<meta name="description" content="${p.sub} Use code LAUNCH25. No signup for free preview.">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: p.headline, description: p.sub, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } })}</script>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{max-width:480px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:36px;text-align:center}
h1{font-size:clamp(26px,5vw,34px);margin-bottom:12px}p{color:#94a3b8;margin-bottom:20px;font-size:17px}
ul{text-align:left;margin:20px 0;color:#cbd5e1;font-size:14px}li{margin:8px 0}
.btn{display:block;background:#22c55e;color:#fff;text-decoration:none;padding:16px;border-radius:10px;font-weight:700;margin:10px 0;font-size:16px}
.btn.secondary{background:transparent;border:2px solid #22c55e;color:#22c55e}
.btn.tertiary{background:transparent;border:none;color:#94a3b8;font-size:14px;padding:8px}
.badge{background:#eab308;color:#000;font-size:11px;padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:16px;font-weight:700}
.proof{font-size:13px;color:#64748b;margin-bottom:12px}
.urgency{font-size:14px;color:#fbbf24;margin:16px 0 8px;font-weight:600}
.email{font-size:13px;margin-top:16px;color:#64748b}.email a{color:#22c55e}
</style></head><body><div class="card">
<span class="badge">Use code ${coupon} at checkout</span>
${p.socialProof ? `<p class="proof">${p.socialProof}</p>` : ""}
<h1>${p.headline}</h1><p>${p.sub}</p>
${p.urgency ? `<p class="urgency">${p.urgency}</p>` : ""}
<ul>${p.bullets.map((b) => `<li>✓ ${b}</li>`).join("")}</ul>
<a class="btn" href="${pay}" onclick="(function(){var r=localStorage.getItem('we_ref')||new URLSearchParams(location.search).get('ref');fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${p.sku}',path:'/go/${p.slug}',refCode:r})})})()">Get pro access →</a>
${altPay ? `<a class="btn secondary" href="${altPay}" onclick="(function(){var r=localStorage.getItem('we_ref')||new URLSearchParams(location.search).get('ref');fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${p.altSku}',path:'/go/${p.slug}',refCode:r})})})()">${p.altLabel ?? "Upgrade plan"} →</a>` : ""}
<a class="btn secondary" href="${p.tool}?utm_source=landing&utm_campaign=${p.slug}">Try free first</a>
<p class="email">Get launch deals: <a href="/join.html?utm_source=go-${p.slug}">Join LAUNCH25 list</a> · <a href="/partners/index.html?utm_source=go-${p.slug}">Partner program</a></p>
</div><script>${AFFILIATE_REF_SCRIPT}</script></body></html>`;
    writeFileSync(join(dist, `${p.slug}.html`), html);
  }
  return { pages: PAGES.length, base };
}
