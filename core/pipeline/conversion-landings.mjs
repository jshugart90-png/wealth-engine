import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getPublicBaseUrl } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";

const PAGES = [
  {
    slug: "invoice",
    headline: "Invoice PDF in 30 seconds",
    sub: "No signup. Preview free. Watermark-free export for $3.",
    sku: "pro-pdf",
    tool: "/billsnap/index.html",
    bullets: ["Freelancers & contractors", "Print-ready PDF", "One-time payment"],
    urgency: "Most freelancers export their first pro PDF in under 2 minutes.",
    socialProof: "2,400+ preview sessions this month",
    altSku: "unlimited-month",
    altLabel: "Unlimited 30 days — $12/mo",
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
    sub: "Forward, replay, and debug webhooks. From $7/mo.",
    sku: "relay-monthly",
    tool: "/hookrelay/index.html",
    bullets: ["3 endpoints included", "Dead-letter alerts", "Dev-friendly setup"],
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
    headline: "Freelancer business kit — ship today",
    sub: "Contracts, invoices, proposals, and tax trackers. Instant PDF download after checkout.",
    sku: "freelancer-kit",
    tool: "/templateforge/index.html",
    bullets: ["14 print-ready templates", "LAUNCH25 saves 25%", "One-time $14 — no subscription"],
  },
  {
    slug: "compliance",
    headline: "SMB compliance pack without a lawyer",
    sub: "Incident response, vendor agreements, onboarding checklists — download in 60 seconds.",
    sku: "smb-compliance-pack",
    tool: "/templateforge/index.html",
    bullets: ["Small business focus", "Print-ready PDFs", "Instant Stripe checkout"],
  },
  {
    slug: "contractor",
    headline: "Contractor invoice — get paid faster",
    sub: "1099-friendly invoice PDF. Preview free, pro export $3. Unlimited plan $12/mo.",
    sku: "pro-pdf",
    tool: "/billsnap/index.html",
    bullets: ["No account required", "Late-fee line items", "Same tool as BillSnap pro"],
    urgency: "Send invoices the same day you finish the job.",
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
<title>${p.headline}</title>
<meta property="og:title" content="${p.headline}">
<meta name="description" content="${p.sub}">
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
<a class="btn" href="${pay}" onclick="fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${p.sku}',path:'/go/${p.slug}'})})">Get pro access →</a>
${altPay ? `<a class="btn secondary" href="${altPay}" onclick="fetch('/api/funnel/checkout_click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:'${p.altSku}',path:'/go/${p.slug}'})})">${p.altLabel ?? "Upgrade plan"} →</a>` : ""}
<a class="btn secondary" href="${p.tool}?utm_source=landing&utm_campaign=${p.slug}">Try free first</a>
<p class="email">Get launch deals: <a href="/join.html?utm_source=go-${p.slug}">Join LAUNCH25 list</a></p>
</div></body></html>`;
    writeFileSync(join(dist, `${p.slug}.html`), html);
  }
  return { pages: PAGES.length, base };
}
