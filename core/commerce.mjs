import { randomBytes } from "crypto";
import { getDb, logEvent } from "./db.mjs";

export function getPaymentLink(sku) {
  const row = getDb().prepare("SELECT payment_link FROM stripe_catalog WHERE sku = ?").get(sku);
  return row?.payment_link ?? null;
}

export function getAllPaymentLinks() {
  return getDb().prepare("SELECT sku, venture_id, payment_link FROM stripe_catalog").all();
}

export function createLicense(ventureId, sku, opts = {}) {
  const code = "WE-" + randomBytes(8).toString("hex").toUpperCase();
  const meta = JSON.parse(
    getDb().prepare("SELECT payload FROM events WHERE venture_id = ? AND type = 'stripe_checkout' ORDER BY id DESC LIMIT 1").get(ventureId)?.payload ?? "{}"
  );
  const uses = opts.uses ?? (parseInt(meta.reports ?? meta.credits ?? "1", 10) || 1);
  getDb()
    .prepare(
      `INSERT INTO licenses (code, venture_id, sku, stripe_session_id, email, uses_remaining, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      code,
      ventureId,
      sku,
      opts.sessionId ?? null,
      opts.email ?? null,
      uses,
      opts.expiresAt ?? null,
      new Date().toISOString()
    );
  logEvent(ventureId, "license_created", { code, sku });
  return code;
}

export function createApiKey(ventureId, tier, stripeCustomerId) {
  const key = "pk_" + randomBytes(24).toString("hex");
  getDb()
    .prepare(
      `INSERT INTO api_keys (key, venture_id, tier, stripe_customer_id, day_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(key, ventureId, tier, stripeCustomerId ?? null, todayKey(), new Date().toISOString());
  logEvent(ventureId, "api_key_created", { tier });
  return key;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const LIMITS = { starter: 1000, pro: 50000, enterprise: 500000 };

export function validateApiKey(key) {
  const row = getDb().prepare("SELECT * FROM api_keys WHERE key = ? AND active = 1").get(key);
  if (!row) return { ok: false, error: "invalid_key" };
  const day = todayKey();
  if (row.day_key !== day) {
    getDb().prepare("UPDATE api_keys SET day_key = ?, requests_today = 0 WHERE key = ?").run(day, key);
    row.requests_today = 0;
  }
  const limit = LIMITS[row.tier] ?? 100;
  if (row.requests_today >= limit) return { ok: false, error: "rate_limit", limit };
  getDb().prepare("UPDATE api_keys SET requests_today = requests_today + 1 WHERE key = ?").run(key);
  return { ok: true, ventureId: row.venture_id, tier: row.tier, remaining: limit - row.requests_today - 1 };
}

export function redeemLicense(code, ventureId) {
  const row = getDb().prepare("SELECT * FROM licenses WHERE code = ? AND venture_id = ?").get(code, ventureId);
  if (!row) return { ok: false, error: "invalid" };
  if (row.expires_at && new Date(row.expires_at) < new Date()) return { ok: false, error: "expired" };
  if (row.uses_remaining <= 0) return { ok: false, error: "depleted" };
  getDb().prepare("UPDATE licenses SET uses_remaining = uses_remaining - 1 WHERE code = ?").run(code);
  return { ok: true, sku: row.sku, remaining: row.uses_remaining - 1 };
}

export async function handleStripeWebhook(body, signature, secret) {
  const event = typeof body === "string" ? JSON.parse(body) : body;

  const db = getDb();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const ventureId = session.metadata?.venture_id;
    const sku = session.metadata?.sku;
    const email = session.customer_details?.email;

    logEvent(ventureId, "stripe_checkout", { sku, email, sessionId: session.id });

    const { sendLicenseEmail, sendApiKeyEmail } = await import("./email.mjs");

    if (ventureId === "devtools-api") {
      const tier = sku?.includes("pro") ? "pro" : sku?.includes("enterprise") ? "enterprise" : "starter";
      const key = createApiKey(ventureId, tier, session.customer);
      await sendApiKeyEmail({ to: email, key, tier });
    } else if (ventureId === "billsnap" || ventureId === "leaselens" || ventureId === "pdf-factory") {
      const code = createLicense(ventureId, sku, { sessionId: session.id, email });
      await sendLicenseEmail({ to: email, ventureId, sku, code });
    } else if (ventureId === "statusping") {
      const code = createLicense(ventureId, sku, {
        sessionId: session.id,
        email,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        uses: sku?.includes("team") ? 50 : 5,
      });
      await sendLicenseEmail({ to: email, ventureId, sku, code });
    }
  }
  return { received: true };
}
