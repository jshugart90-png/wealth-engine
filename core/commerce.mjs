import { randomBytes } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getDb, logEvent } from "./db.mjs";
import { creditAffiliateConversion, clawbackCommission } from "./marketing/affiliates.mjs";
import { getDataRoot } from "./env.mjs";

let paymentLinksFileCache;

function readPaymentLinksFile() {
  if (paymentLinksFileCache) return paymentLinksFileCache;
  const path = join(getDataRoot(), "payment-links.json");
  if (!existsSync(path)) {
    paymentLinksFileCache = [];
    return paymentLinksFileCache;
  }

  try {
    const catalog = JSON.parse(readFileSync(path, "utf8"));
    paymentLinksFileCache = Array.isArray(catalog) ? catalog.filter((row) => row?.sku && row?.payment_link) : [];
  } catch {
    paymentLinksFileCache = [];
  }
  return paymentLinksFileCache;
}

export function getPaymentLink(sku) {
  const row = getDb().prepare("SELECT payment_link FROM stripe_catalog WHERE sku = ?").get(sku);
  if (row?.payment_link) return row.payment_link;
  return readPaymentLinksFile().find((item) => item.sku === sku)?.payment_link ?? null;
}

export function getAllPaymentLinks() {
  const bySku = new Map(readPaymentLinksFile().map((item) => [item.sku, item]));
  for (const row of getDb().prepare("SELECT sku, venture_id, payment_link FROM stripe_catalog").all()) {
    if (row.payment_link) bySku.set(row.sku, row);
  }
  return [...bySku.values()];
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

function parseAffiliateRef(session) {
  return (
    session.metadata?.affiliate_ref ??
    session.metadata?.ref_code ??
    session.client_reference_id?.replace(/^ref:/, "") ??
    null
  );
}

function parseAmountUsd(session) {
  const cents = session.amount_total ?? session.amount_subtotal;
  return cents != null ? cents / 100 : null;
}

export async function handleStripeWebhook(body, signature, secret) {
  const event = typeof body === "string" ? JSON.parse(body) : body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const ventureId = session.metadata?.venture_id;
    const sku = session.metadata?.sku;
    const email = session.customer_details?.email;
    const affiliateRef = parseAffiliateRef(session);
    const amountUsd = parseAmountUsd(session);

    logEvent(ventureId, "stripe_checkout", { sku, email, sessionId: session.id, affiliateRef, amountUsd });

    if (affiliateRef) {
      creditAffiliateConversion({ code: affiliateRef, sku, amountUsd, sessionId: session.id });
    }

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

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const sessionId = charge.metadata?.checkout_session_id ?? charge.payment_intent;
    if (sessionId) {
      clawbackCommission(sessionId);
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const affiliateRef = invoice.metadata?.affiliate_ref ?? invoice.subscription_details?.metadata?.affiliate_ref;
    if (affiliateRef) {
      const sku = invoice.lines?.data?.[0]?.price?.lookup_key ?? invoice.metadata?.sku;
      creditAffiliateConversion({
        code: affiliateRef,
        sku,
        amountUsd: (invoice.amount_paid ?? 0) / 100,
        sessionId: invoice.id,
      });
    }
  }

  return { received: true };
}
