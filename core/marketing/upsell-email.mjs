import { getDb, logEvent } from "../db.mjs";
import { sendLicenseEmail } from "../email.mjs";
import { getPaymentLink } from "../commerce.mjs";

const UPSELL_MAP = {
  "billsnap": { sku: "freelancer-kit", venture: "pdf-factory", pitch: "Add the Freelancer Business Kit templates" },
  "leaselens": { sku: "smb-compliance-pack", venture: "pdf-factory", pitch: "SMB Compliance pack pairs well with lease review" },
  "devtools-api": { sku: "basic-monthly", venture: "statusping", pitch: "Monitor your API endpoints with StatusPing" },
};

export async function runPostCheckoutUpsell() {
  const db = getDb();
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const events = db
    .prepare("SELECT * FROM events WHERE type = 'stripe_checkout' AND ts > ? AND payload NOT LIKE '%upsell_sent%'")
    .all(dayAgo);

  let sent = 0;
  for (const ev of events.slice(0, 5)) {
    const p = JSON.parse(ev.payload ?? "{}");
    const map = UPSELL_MAP[ev.venture_id];
    if (!map || !p.email) continue;
    const link = getPaymentLink(map.sku);
    if (!link) continue;

    const { loadEnv } = await import("../env.mjs");
    const env = loadEnv();
    if (!env.RESEND_API_KEY) break;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.FROM_EMAIL ?? "newsletter@horseshoeroundme.com",
        to: [p.email],
        subject: "Customers also get…",
        html: `<p>Thanks for your purchase!</p><p>${map.pitch}.</p><p><a href="${link}">View offer →</a></p>`,
      }),
    });
    logEvent(ev.venture_id, "upsell_sent", { email: p.email, sku: map.sku });
    sent++;
  }
  return { sent, eligible: events.length };
}
