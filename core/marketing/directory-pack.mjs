import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, getMarketingBaseUrl } from "../env.mjs";
import { getAllPaymentLinks } from "../commerce.mjs";

const DIRECTORIES = [
  { name: "AlternativeTo", url: "https://alternativeto.net/contribute/" },
  { name: "SaaSHub", url: "https://www.saashub.com/submit" },
  { name: "Product Hunt", url: "https://www.producthunt.com/posts/new" },
  { name: "Indie Hackers", url: "https://www.indiehackers.com/post/new" },
  { name: "BetaList", url: "https://betalist.com/submit" },
  { name: "API List", url: "https://apilist.fun/submit" },
  { name: "StackShare", url: "https://stackshare.io/submit" },
  { name: "Capterra", url: "https://www.capterra.com/vendors/sign-up" },
  { name: "G2", url: "https://www.g2.com/products/new" },
  { name: "Slant", url: "https://www.slant.co/" },
  { name: "ToolFinder", url: "https://toolfinder.co/submit" },
  { name: "Launching Next", url: "https://www.launchingnext.com/submit/" },
];

export function buildDirectoryPack() {
  mkdirSync(join(getDataRoot(), "marketing", "directories"), { recursive: true });
  const base = getMarketingBaseUrl();
  const config = JSON.parse(readFileSync(join(getRoot(), "config", "ventures.json"), "utf8"));
  const links = getAllPaymentLinks();
  const pack = [];

  for (const v of config.ventures) {
    const listing = {
      productName: v.name,
      tagline: `${v.name} — ${v.model} tool by Wealth Engine`,
      website: `${base}/${venturePath(v.id)}`,
      pricing: v.prices ? Object.values(v.prices).join(", ") : "See site",
      category: v.type,
      checkoutLinks: links.filter((l) => l.venture_id === v.id).map((l) => l.payment_link),
      directories: DIRECTORIES.map((d) => ({ ...d, submitUrl: d.url })),
    };
    const fp = join(getDataRoot(), "marketing", "directories", `${v.id}.json`);
    writeFileSync(fp, JSON.stringify(listing, null, 2));
    pack.push(v.id);
  }

  writeFileSync(join(getDataRoot(), "marketing", "directory-index.json"), JSON.stringify({ pack, generated: new Date().toISOString() }, null, 2));
  return { listings: pack.length };
}

function venturePath(id) {
  const map = { "pdf-factory": "pdf-factory", comparestack: "comparestack/index.html" };
  return map[id] ?? `${id}/index.html`;
}
