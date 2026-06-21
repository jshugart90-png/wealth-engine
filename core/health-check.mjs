import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot } from "./env.mjs";
import { getDb } from "./db.mjs";

const checks = [];

checks.push({ name: "database", ok: !!getDb() });
checks.push({ name: "env_file", ok: existsSync(join(getRoot(), ".env")) });

const linksPath = join(getDataRoot(), "payment-links.json");
if (process.env.CI === "true") {
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
