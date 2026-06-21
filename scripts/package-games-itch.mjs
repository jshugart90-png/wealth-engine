#!/usr/bin/env node
/**
 * Package games as HTML zips for itch.io upload (free distribution).
 * Run: node scripts/package-games-itch.mjs
 * Output: D:/wealth-engine-data/mobile/itch/{slug}.zip (8 games + hub bundle)
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { getRoot, getDataRoot } from "../core/env.mjs";

const root = getRoot();
const dist = join(root, "dist");
const gamesDist = join(dist, "games");
const outRoot = join(getDataRoot(), "mobile", "itch");

const SHIPPED_GAMES = [
  { slug: "horseshoe-toss", title: "Horseshoe Toss" },
  { slug: "invoice-stack", title: "Invoice Stack" },
  { slug: "uptime-defender", title: "Uptime Defender" },
  { slug: "freelancer-memory", title: "Memory Match: Freelancer Tools" },
  { slug: "color-switch-snake", title: "Color Switch Snake" },
  { slug: "word-scramble-biz", title: "Word Scramble: Business Terms" },
  { slug: "receipt-rush", title: "Receipt Rush" },
  { slug: "webhook-whack", title: "Webhook Whack-a-Mole" },
];

const BASE_URL = "https://wealth-engine-0qlj.onrender.com";

if (!existsSync(gamesDist)) {
  console.error("Run npm run build first");
  process.exit(1);
}

mkdirSync(outRoot, { recursive: true });

function zipFolder(folderPath, zipPath) {
  if (existsSync(zipPath)) rmSync(zipPath, { force: true });
  if (process.platform === "win32") {
    execSync(`Compress-Archive -Path "${folderPath}\\*" -DestinationPath "${zipPath}" -Force`, {
      shell: "powershell.exe",
    });
  } else {
    execSync(`cd "${folderPath}" && zip -r "${zipPath}" .`, { shell: true });
  }
}

function relativizeHtml(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fp = join(dir, entry.name);
    if (entry.isDirectory()) relativizeHtml(fp);
    else if (entry.name.endsWith(".html")) {
      let html = readFileSync(fp, "utf8");
      html = html
        .replace(/href="\/games\//g, 'href="./')
        .replace(/href="\/go\//g, `href="${BASE_URL}/go/`)
        .replace(/href="\/tools\//g, `href="${BASE_URL}/tools/`)
        .replace(/href="\/"/g, `href="${BASE_URL}/"`)
        .replace(/fetch\('\/api\//g, `fetch('${BASE_URL}/api/`);
      writeFileSync(fp, html);
    }
  }
}

const results = [];

for (const game of SHIPPED_GAMES) {
  const src = join(gamesDist, game.slug);
  if (!existsSync(join(src, "index.html"))) {
    console.warn(`Skip ${game.slug} - not in dist`);
    continue;
  }
  const outDir = join(outRoot, game.slug);
  const zipPath = join(outRoot, `${game.slug}.zip`);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(src, outDir, { recursive: true });
  relativizeHtml(outDir);
  writeFileSync(
    join(outDir, "README.txt"),
    `${game.title} - Wealth Engine\nFree HTML5 game. Set index to index.html on itch.io.\nMore: ${BASE_URL}/games/\n`
  );
  zipFolder(outDir, zipPath);
  results.push({ slug: game.slug, title: game.title, zip: zipPath, folder: outDir });
}

// Hub bundle (all 8 + index)
const hubDir = join(outRoot, "horseshoe-games-hub");
const hubZip = join(outRoot, "horseshoe-games-hub.zip");
rmSync(hubDir, { recursive: true, force: true });
mkdirSync(hubDir, { recursive: true });
cpSync(gamesDist, hubDir, { recursive: true });
relativizeHtml(hubDir);
writeFileSync(
  join(hubDir, "README.txt"),
  `Horseshoe Games Hub - Wealth Engine
Free HTML5 games for all ages.

Games included:
${SHIPPED_GAMES.map((g) => `- ${g.title}`).join("\n")}

Upload as HTML zip on itch.io. Set index to index.html.
More: ${BASE_URL}/games/
`
);
zipFolder(hubDir, hubZip);
results.push({ slug: "horseshoe-games-hub", title: "Horseshoe Games Hub", zip: hubZip, folder: hubDir });

console.log(
  JSON.stringify(
    {
      ok: true,
      count: results.length,
      outputDir: outRoot,
      zips: results.map((r) => r.zip),
      upload: "https://itch.io/game/new - HTML project, upload zip, index = index.html",
    },
    null,
    2
  )
);
