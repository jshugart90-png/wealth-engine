#!/usr/bin/env node
/** Set inAppPurchases: true in all store-metadata metadata.json files. */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const metaDir = join(dirname(fileURLToPath(import.meta.url)), "..", "mobile", "store-metadata");
const slugs = readdirSync(metaDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

for (const slug of slugs) {
  const path = join(metaDir, slug, "metadata.json");
  const meta = JSON.parse(readFileSync(path, "utf8"));
  if (meta.contentRating) {
    meta.contentRating.inAppPurchases = true;
    writeFileSync(path, JSON.stringify(meta, null, 2) + "\n");
    console.log("Updated", slug);
  }
}
