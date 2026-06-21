import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "../env.mjs";

export async function ensureLaunchCoupon() {
  const config = JSON.parse(readFileSync(join(getRoot(), "config", "growth-target.json"), "utf8"));
  const code = config.ramp.launchCouponCode ?? "LAUNCH25";
  const pct = config.ramp.launchCouponPercentOff ?? 25;
  const env = loadEnv();
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_")) return { ok: false, reason: "no_stripe" };

  const list = await stripeGet(secret, `/promotion_codes?code=${code}&limit=1`);
  if (list.data?.length) return { ok: true, code, existing: true };

  const coupon = await stripePost(secret, "/coupons", {
    percent_off: String(pct),
    duration: "once",
    name: "Launch discount",
  });
  await stripePost(secret, "/promotion_codes", {
    "promotion[type]": "coupon",
    "promotion[coupon]": coupon.id,
    code,
    max_redemptions: "500",
  });
  writeFileSync(join(getDataRoot(), "marketing", "launch-coupon.json"), JSON.stringify({ code, pct, at: new Date().toISOString() }, null, 2));
  return { ok: true, code, pct, created: true };
}

async function stripeGet(secret, path) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, { headers: { Authorization: `Bearer ${secret}` } });
  return res.json();
}

async function stripePost(secret, path, body) {
  const params = new URLSearchParams(body);
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? JSON.stringify(data));
  return data;
}
