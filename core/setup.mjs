import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getRoot, loadEnv } from "./env.mjs";

export function patchEnvFromHorseshoe() {
  const root = getRoot();
  const envPath = join(root, ".env");
  const horseshoeEnv = "C:\\Users\\jshug\\horseshoe-command-hub\\.env";
  if (!existsSync(envPath) || !existsSync(horseshoeEnv)) return;

  const env = readFileSync(envPath, "utf8");
  const hs = readFileSync(horseshoeEnv, "utf8");
  const pick = (key) => {
    const m = hs.match(new RegExp(`^${key}=(.+)$`, "m"));
    return m?.[1]?.trim();
  };

  let out = env;
  const resend = pick("RESEND_API_KEY");
  const from = pick("RESEND_FROM_EMAIL");
  if (resend && !env.includes("RESEND_API_KEY=re_")) {
    out = out.replace(/RESEND_API_KEY=.*/, `RESEND_API_KEY=${resend}`);
  }
  if (from) {
    out = out.replace(/FROM_EMAIL=.*/, `FROM_EMAIL=${from}`);
  }
  writeFileSync(envPath, out);
}

export async function ensureStripeWebhook(publicUrl) {
  const env = loadEnv();
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_")) return { ok: false, reason: "no_key" };

  const url = `${publicUrl.replace(/\/$/, "")}/webhooks/stripe`;
  const list = await stripeGet(secret, "/webhook_endpoints?limit=100");
  const existing = list.data?.find((w) => w.url === url);
  if (existing) {
    if (!env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")) {
      patchEnv("STRIPE_WEBHOOK_SECRET", existing.secret);
    }
    return { ok: true, url, id: existing.id, created: false };
  }

  const body = {
    url,
    "enabled_events[0]": "checkout.session.completed",
  };
  const wh = await stripePost(secret, "/webhook_endpoints", body);
  patchEnv("STRIPE_WEBHOOK_SECRET", wh.secret);
  return { ok: true, url, id: wh.id, created: true };
}

function patchEnv(key, value) {
  const path = join(getRoot(), ".env");
  let env = readFileSync(path, "utf8");
  if (env.match(new RegExp(`^${key}=`, "m"))) {
    env = env.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`);
  } else {
    env += `\n${key}=${value}\n`;
  }
  writeFileSync(path, env);
}

async function stripeGet(secret, path) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  return res.json();
}

async function stripePost(secret, path, body) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (Array.isArray(v)) v.forEach((item, i) => params.append(`${k}[${i}]`, item));
    else params.append(k, v);
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? JSON.stringify(data));
  return data;
}
