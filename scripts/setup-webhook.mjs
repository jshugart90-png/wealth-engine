import { patchEnvFromHorseshoe, ensureStripeWebhook } from "../core/setup.mjs";
import { loadEnv, getRoot } from "../core/env.mjs";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const publicUrl = process.argv[2] ?? loadEnv().PUBLIC_BASE_URL;
if (!publicUrl?.startsWith("http")) {
  console.error("Usage: node scripts/setup-webhook.mjs https://your-public-url");
  process.exit(1);
}

patchEnvFromHorseshoe();

const envPath = join(getRoot(), ".env");
let env = readFileSync(envPath, "utf8");
if (!env.includes(`PUBLIC_BASE_URL=${publicUrl}`)) {
  env = env.replace(/PUBLIC_BASE_URL=.*/, `PUBLIC_BASE_URL=${publicUrl}`);
  env = env.replace(/STRIPE_SUCCESS_URL=.*/, `STRIPE_SUCCESS_URL=${publicUrl}/thanks`);
  writeFileSync(envPath, env);
}

const wh = await ensureStripeWebhook(publicUrl);
console.log(JSON.stringify(wh, null, 2));
