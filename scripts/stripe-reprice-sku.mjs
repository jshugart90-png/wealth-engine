#!/usr/bin/env node
/** Reprice an existing Stripe SKU: new price + payment link, update catalog. Usage: node scripts/stripe-reprice-sku.mjs unlimited-month */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "../core/env.mjs";
import { getDb, logEvent } from "../core/db.mjs";

async function stripeRequest(secret, method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? JSON.stringify(data));
  return data;
}

const sku = process.argv[2];
if (!sku) {
  console.error("Usage: node scripts/stripe-reprice-sku.mjs <sku>");
  process.exit(1);
}

const env = loadEnv();
const secret = env.STRIPE_SECRET_KEY;
if (!secret?.startsWith("sk_")) {
  console.log(JSON.stringify({ ok: false, reason: "no_stripe_key" }));
  process.exit(0);
}

const config = JSON.parse(readFileSync(join(getRoot(), "config", "ventures.json"), "utf8"));
const item = config.stripeProducts.find((p) => p.sku === sku);
if (!item) throw new Error(`SKU not found in ventures.json: ${sku}`);

const db = getDb();
const existing = db.prepare("SELECT * FROM stripe_catalog WHERE sku = ?").get(sku);
if (!existing?.stripe_product_id) {
  console.log(JSON.stringify({ ok: false, reason: "no_existing_product", sku }));
  process.exit(1);
}

const priceBody = {
  product: existing.stripe_product_id,
  unit_amount: String(Math.round(item.priceUsd * 100)),
  currency: "usd",
};
if (item.interval === "month") priceBody["recurring[interval]"] = "month";

const price = await stripeRequest(secret, "POST", "/prices", priceBody);

const linkBody = {
  "line_items[0][price]": price.id,
  "line_items[0][quantity]": "1",
  allow_promotion_codes: "true",
  "metadata[venture_id]": item.ventureId,
  "metadata[sku]": item.sku,
};
if (env.STRIPE_SUCCESS_URL) {
  linkBody["after_completion[type]"] = "redirect";
  linkBody["after_completion[redirect][url]"] = env.STRIPE_SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}";
}

const link = await stripeRequest(secret, "POST", "/payment_links", linkBody);

const updated_at = new Date().toISOString();
db.prepare(`
  UPDATE stripe_catalog SET stripe_price_id = ?, payment_link = ?, updated_at = ? WHERE sku = ?
`).run(price.id, link.url, updated_at, sku);

await stripeRequest(secret, "POST", `/products/${existing.stripe_product_id}`, {
  name: item.name,
});

const catalog = db.prepare("SELECT * FROM stripe_catalog").all();
writeFileSync(join(getDataRoot(), "payment-links.json"), JSON.stringify(catalog, null, 2) + "\n");

logEvent(item.ventureId, "stripe_price_repriced", { sku, priceUsd: item.priceUsd, url: link.url });
console.log(JSON.stringify({ ok: true, sku, priceUsd: item.priceUsd, priceId: price.id, paymentLink: link.url }, null, 2));
