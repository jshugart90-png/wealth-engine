import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "./env.mjs";
import { getDb } from "./db.mjs";

const checks = [];
const env = loadEnv();
const envPath = join(getRoot(), ".env");
const hasEnvFile = existsSync(envPath);
const hasRuntimeEnv = Boolean(env.PUBLIC_BASE_URL || env.STRIPE_SECRET_KEY || env.WEALTH_DATA_ROOT);
const isCi = process.env.CI === "true";

checks.push({ name: "database", ok: !!getDb() });
checks.push({
  name: "env_file",
  ok: hasEnvFile || hasRuntimeEnv || isCi,
  hint: hasEnvFile ? ".env found" : isCi ? "skipped in CI" : hasRuntimeEnv ? "using process env" : "copy .env.example to .env",
});

const linksPath = join(getDataRoot(), "payment-links.json");
if (isCi) {
  checks.push({ name: "stripe_links", ok: true, hint: "skipped in CI" });
} else {
  checks.push({
    name: "stripe_links",
    ok: existsSync(linksPath) && JSON.parse(readFileSync(linksPath, "utf8")).length > 0,
    hint: "Run npm run stripe:sync after adding STRIPE_SECRET_KEY",
  });
}

checks.push({ name: "dist_built", ok: existsSync(join(getRoot(), "dist", "index.html")) });

const allOk = checks.every((c) => c.ok);
console.log(JSON.stringify({ ok: allOk, checks }, null, 2));
process.exit(allOk ? 0 : 1);
