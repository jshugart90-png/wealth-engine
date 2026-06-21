import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "./env.mjs";
import { getDb, logEvent } from "./db.mjs";

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

export async function syncStripeCatalog() {
  const env = loadEnv();
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_")) {
    return { ok: false, reason: "no_stripe_key" };
  }

  const config = JSON.parse(readFileSync(join(getRoot(), "config", "ventures.json"), "utf8"));
  const db = getDb();
  const upsert = db.prepare(`
    INSERT INTO stripe_catalog (sku, venture_id, stripe_product_id, stripe_price_id, payment_link, updated_at)
    VALUES (@sku, @venture_id, @stripe_product_id, @stripe_price_id, @payment_link, @updated_at)
    ON CONFLICT(sku) DO UPDATE SET
      stripe_product_id=excluded.stripe_product_id,
      stripe_price_id=excluded.stripe_price_id,
      payment_link=excluded.payment_link,
      updated_at=excluded.updated_at
  `);

  let created = 0;
  for (const item of config.stripeProducts) {
    const existing = db.prepare("SELECT * FROM stripe_catalog WHERE sku = ?").get(item.sku);
    if (existing?.payment_link) continue;

    const product = await stripeRequest(secret, "POST", "/products", {
      name: item.name,
      "metadata[venture_id]": item.ventureId,
      "metadata[sku]": item.sku,
      ...Object.fromEntries(
        Object.entries(item.metadata ?? {}).map(([k, v]) => [`metadata[${k}]`, String(v)])
      ),
    });

    const priceBody = {
      product: product.id,
      unit_amount: String(Math.round(item.priceUsd * 100)),
      currency: "usd",
    };
    if (item.interval === "month") {
      priceBody["recurring[interval]"] = "month";
    }

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

    upsert.run({
      sku: item.sku,
      venture_id: item.ventureId,
      stripe_product_id: product.id,
      stripe_price_id: price.id,
      payment_link: link.url,
      updated_at: new Date().toISOString(),
    });
    created++;
    logEvent(item.ventureId, "stripe_product_created", { sku: item.sku, url: link.url });
  }

  const catalog = db.prepare("SELECT * FROM stripe_catalog").all();
  writeFileSync(
    join(getDataRoot(), "payment-links.json"),
    JSON.stringify(catalog, null, 2) + "\n"
  );
  return { ok: true, created, total: catalog.length };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
    process.argv[1]?.endsWith("stripe-sync.mjs")) {
  syncStripeCatalog()
    .then((r) => {
      console.log(JSON.stringify(r, null, 2));
      if (!r.ok) process.exit(0);
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
