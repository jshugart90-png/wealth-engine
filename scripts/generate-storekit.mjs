#!/usr/bin/env node
/** Generate mobile/storekit/Products.storekit from config/mobile-iap-products.json */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadIapConfig } from "../mobile/shared/iap.mjs";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "mobile", "storekit");
mkdirSync(outDir, { recursive: true });

const config = loadIapConfig();
let internalId = 1000;

const typeMap = {
  non_consumable: "NonConsumable",
  consumable: "Consumable",
  auto_renewable: "AutoRenewableSubscription",
};

const products = [];
for (const app of Object.values(config.apps)) {
  for (const p of app.products) {
    internalId += 1;
    products.push({
      displayPrice: p.price.toFixed(2),
      familyShareable: false,
      internalID: String(internalId),
      localizations: [
        {
          description: p.description,
          displayName: p.title,
          locale: "en_US",
        },
      ],
      productID: p.storeKitId,
      referenceName: `${app.appName} ${p.title}`,
      type: typeMap[p.type] ?? "NonConsumable",
    });
  }
}

const storekit = {
  identifier: "Products",
  nonRenewingSubscriptions: [],
  products,
  settings: {
    _failTransactionsEnabled: false,
    _storeKitErrors: [],
  },
  subscriptionGroups: [],
  version: { major: 3, minor: 0 },
};

const outPath = join(outDir, "Products.storekit");
writeFileSync(outPath, JSON.stringify(storekit, null, 2) + "\n");
console.log(`Wrote ${products.length} products → ${outPath}`);
