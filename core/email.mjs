import { loadEnv } from "./env.mjs";

export async function sendLicenseEmail({ to, ventureId, sku, code }) {
  const env = loadEnv();
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !to) return { sent: false, reason: "email_not_configured" };

  const names = {
    "billsnap": "BillSnap",
    "leaselens": "LeaseLens",
    "pdf-factory": "TemplateForge",
    "devtools-api": "PipeKit API",
    "statusping": "StatusPing",
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [to],
      subject: `Your ${names[ventureId] ?? ventureId} license`,
      html: `<p>Thank you for your purchase.</p><p><strong>License:</strong> <code>${code}</code></p><p>Enter this code on the product page to unlock your purchase.</p><p>— Wealth Engine</p>`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { sent: false, reason: err };
  }
  return { sent: true };
}

export async function sendApiKeyEmail({ to, key, tier }) {
  const env = loadEnv();
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !to) return { sent: false, reason: "email_not_configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [to],
      subject: "Your PipeKit API key",
      html: `<p>Your API key (tier: ${tier}):</p><pre>${key}</pre><p>Header: X-Api-Key: ${key}</p>`,
    }),
  });
  return { sent: res.ok };
}
