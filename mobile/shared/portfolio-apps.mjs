/**
 * Portfolio app registry — deep links for Wealth Engine Hub (App 45).
 * Reads store-metadata slugs and maps each app to a local www href.
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const sharedDir = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(sharedDir, "..");
const repoRoot = join(mobileRoot, "..");
const baseUrl = "https://wealth-engine-0qlj.onrender.com";

/** Slug → relative href inside Capacitor www (or prod path segment). */
export const DEEP_LINKS = {
  games: "games/index.html",
  tools: "tools/index.html",
  "receipt-rush": "games/receipt-rush/index.html",
  "webhook-whack": "games/webhook-whack/index.html",
  "invoice-stack": "games/invoice-stack/index.html",
  "horseshoe-toss": "games/horseshoe-toss/index.html",
  "uptime-defender": "games/uptime-defender/index.html",
  "freelancer-memory": "games/freelancer-memory/index.html",
  "color-switch-snake": "games/color-switch-snake/index.html",
  "word-scramble-biz": "games/word-scramble-biz/index.html",
  "net-30-ninja": "games/net-30-ninja/index.html",
  "ssl-shield": "games/ssl-shield/index.html",
  "nda-speed-sign": "games/nda-speed-sign/index.html",
  "invoice-number-rush": "games/invoice-number-rush/index.html",
  billsnap: "billsnap/index.html",
  "statusping-lite": "statusping/index.html",
  leaselens: "leaselens/index.html",
  ndagen: "ndagen/index.html",
  hookrelay: "hookrelay/index.html",
  pipekit: "pipekit/index.html",
  meetingcost: "meetingcost/index.html",
  templateforge: "templateforge/index.html",
  comparestack: "comparestack/index.html",
  "tip-calculator-pro": "tip-calculator-pro/index.html",
  "hourly-rate-calculator-pro": "hourly-rate-calculator-pro/index.html",
  "freelancer-tax-estimator": "freelancer-tax-estimator/index.html",
  "1099-threshold-tracker-pro": "1099-threshold-tracker-pro/index.html",
  "quarterly-tax-deadline-pro": "quarterly-tax-deadline-pro/index.html",
  "profit-margin-calculator-pro": "profit-margin-calculator-pro/index.html",
  "break-even-calculator-pro": "break-even-calculator-pro/index.html",
  "late-fee-calculator-pro": "late-fee-calculator-pro/index.html",
  "markup-calculator-pro": "markup-calculator-pro/index.html",
  "day-rate-calculator-pro": "day-rate-calculator-pro/index.html",
  "bill-splitter-pro": "bill-splitter-pro/index.html",
  "percentage-calculator-pro": "percentage-calculator-pro/index.html",
  "freelancer-stack": "bundles/freelancer-stack.html",
  devwatch: "bundles/devwatch.html",
  "renter-toolkit": "bundles/landlord-tenant-stack.html",
  "hookrelay-dlq": "go/hookrelay-dlq.html",
  "1099-suite": "go/1099-deadline.html",
  "statusping-agency": "go/statusping-agency.html",
  "ndagen-team": "go/nda-team.html",
  "meetingcost-team": "go/meeting-cost-team.html",
  partners: "partners/index.html",
  "wealth-hub": "index.html",
};

const HUB_SLUGS = new Set([
  "games",
  "tools",
  "freelancer-stack",
  "devwatch",
  "renter-toolkit",
  "hookrelay-dlq",
  "1099-suite",
  "statusping-agency",
  "ndagen-team",
  "meetingcost-team",
  "partners",
  "wealth-hub",
]);

const GAME_SLUGS = new Set([
  "games",
  "receipt-rush",
  "webhook-whack",
  "invoice-stack",
  "horseshoe-toss",
  "uptime-defender",
  "freelancer-memory",
  "color-switch-snake",
  "word-scramble-biz",
  "net-30-ninja",
  "ssl-shield",
  "nda-speed-sign",
  "invoice-number-rush",
]);

export function getPortfolioApps() {
  const metaDir = join(mobileRoot, "store-metadata");
  const iapPath = join(repoRoot, "config", "mobile-iap-products.json");
  const iapConfig = existsSync(iapPath) ? JSON.parse(readFileSync(iapPath, "utf8")) : { apps: {} };

  const slugs = readdirSync(metaDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => {
      const order = Object.keys(DEEP_LINKS);
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  return slugs.map((slug, i) => {
    const meta = JSON.parse(readFileSync(join(metaDir, slug, "metadata.json"), "utf8"));
    const href = DEEP_LINKS[slug] ?? `${slug}/index.html`;
    const type = GAME_SLUGS.has(slug) ? "game" : HUB_SLUGS.has(slug) ? "hub" : "utility";
    return {
      num: i + 1,
      slug,
      title: meta.appName,
      desc: meta.subtitle ?? meta.appName,
      href,
      prodUrl: `${baseUrl}/${href.replace(/^\//, "")}`,
      bundleId: meta.bundleId,
      type,
      iapProducts: iapConfig.apps?.[slug]?.products?.length ?? 0,
    };
  });
}
