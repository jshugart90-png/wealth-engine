#!/usr/bin/env node
/**
 * Reddit draft queue — parse outreach files → D:\wealth-engine-data\marketing\reddit-drafts\
 * Agents write DRAFT only; user reviews and publishes manually.
 *
 * Usage:
 *   node scripts/reddit-draft-queue.mjs                    # list + summary
 *   node scripts/reddit-draft-queue.mjs --import           # seed top posts for today/tomorrow
 *   node scripts/reddit-draft-queue.mjs --import --limit 10
 *   node scripts/reddit-draft-queue.mjs --generate --count 3 --date 2026-06-22
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = process.env.WEALTH_DATA_ROOT || "D:\\wealth-engine-data";
const OUTREACH = path.join(DATA, "marketing", "outreach");
const DRAFTS_DIR = path.join(DATA, "marketing", "reddit-drafts");
const MARKETING_MD = path.join(ROOT, "board", "MARKETING.md");
const DEPLOY_LOG = path.join(ROOT, "board", "DEPLOY_LOG.md");

const SOURCE_FILES = [
  { file: "FREE_POSTS_batch1.md", priority: 3 },
  { file: "POST_2026-06-21_batch9.md", priority: 2 },
  { file: "POST_2026-06-21_batch10.md", priority: 1 },
  { file: "GAMES_PROMO_2026-06-21.md", priority: 4 },
];

const SUGGESTED_TIME = "Tue–Thu 9–11 AM CT";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function stripFences(text) {
  return text.replace(/^```\n?|\n?```$/g, "").trim();
}

function firstLandingUrl(body) {
  const m = body.match(/https:\/\/wealth-engine[^\s)]+/);
  return m ? m[0] : "https://wealth-engine-0qlj.onrender.com";
}

function inferCampaign(body, title) {
  const hay = `${title}\n${body}`.toLowerCase();
  if (hay.includes("billsnap") || (hay.includes("invoice") && hay.includes("$29/mo"))) return "MC-010";
  if (hay.includes("freelancer stack") || hay.includes("freelancer revenue")) return "MC-008";
  if (hay.includes("hookrelay") || hay.includes("dlq") || hay.includes("webhook")) return "MC-009";
  if (hay.includes("statusping") || hay.includes("uptime monitoring")) return "MC-007";
  if (hay.includes("affiliate") || hay.includes("partner program")) return "MC-012";
  if (hay.includes("compliance")) return "MC-011";
  if (hay.includes("html5") || hay.includes("games hub") || hay.includes("browser mini-games")) return "MC-GAMES-001";
  return "MC-000";
}

function parseRedditPosts(markdown, sourceFile) {
  const posts = [];
  const sections = markdown.split(/\n(?=##\s)/);
  for (const section of sections) {
    const header = section.match(/^##\s+(.+)/m);
    if (!header) continue;
    const h = header[1];
    const subMatch =
      h.match(/Reddit\s+r\/(\w+)/i) ||
      h.match(/r\/(\w+)\s*[—\-]/i) ||
      h.match(/(\d+)\.\s*Reddit\s+r\/(\w+)/i);
    if (!subMatch) continue;
    const subreddit = (subMatch[2] || subMatch[1]).toLowerCase();

    const titleMatch = section.match(/\*\*Title:\*\*\s*\n```\n([\s\S]*?)```/m) ||
      section.match(/\*\*Title:\*\*\s+([^\n]+)/m);
    const bodyMatch = section.match(/\*\*Body:\*\*\s*\n```\n([\s\S]*?)```/m) ||
      section.match(/\*\*Body:\*\*\s*\n([\s\S]*?)(?=\n\*\*Publish steps:|\n---\n|\n##\s)/m);
    if (!titleMatch || !bodyMatch) continue;

    const title = stripFences(titleMatch[1].trim());
    const body = stripFences(bodyMatch[1].trim());
    if (!title || !body) continue;

    posts.push({
      subreddit,
      title,
      body,
      source: sourceFile,
      landing_url: firstLandingUrl(body),
      campaign: inferCampaign(body, title),
      suggested_time: SUGGESTED_TIME,
    });
  }
  return posts;
}

function loadAllPosts() {
  const all = [];
  for (const { file, priority } of SOURCE_FILES) {
    const p = path.join(OUTREACH, file);
    if (!fs.existsSync(p)) continue;
    const md = fs.readFileSync(p, "utf8");
    for (const post of parseRedditPosts(md, file)) {
      all.push({ ...post, priority });
    }
  }
  all.sort((a, b) => a.priority - b.priority || a.subreddit.localeCompare(b.subreddit));
  return dedupePosts(all);
}

function dedupePosts(posts) {
  const seen = new Set();
  return posts.filter((p) => {
    const key = `${p.subreddit}::${p.title.slice(0, 60)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function draftFilename(date, index, subreddit) {
  return `${date}-${index}-${subreddit}.md`;
}

function renderDraft(post, date, status = "DRAFT") {
  return `---
status: ${status}
date: ${date}
subreddit: ${post.subreddit}
campaign: ${post.campaign}
suggested_time: "${post.suggested_time}"
landing_url: ${post.landing_url}
source: ${post.source}
published_url: ""
---

# Title

${post.title}

# Body

${post.body}
`;
}

function existingDraftKeys() {
  if (!fs.existsSync(DRAFTS_DIR)) return new Set();
  const keys = new Set();
  for (const f of fs.readdirSync(DRAFTS_DIR)) {
    if (!f.endsWith(".md")) continue;
    const body = fs.readFileSync(path.join(DRAFTS_DIR, f), "utf8");
    const title = body.match(/# Title\n\n([\s\S]*?)\n\n# Body/m)?.[1]?.trim();
    const sub = body.match(/^subreddit:\s*(\w+)/m)?.[1];
    if (title && sub) keys.add(`${sub}::${title.slice(0, 60)}`);
  }
  return keys;
}

function parseDraftIndex(filename) {
  const m = filename.match(/^\d{4}-\d{2}-\d{2}-(\d+)-/);
  return m ? parseInt(m[1], 10) : NaN;
}

function nextIndexForDate(date, counters) {
  if (counters?.has(date)) {
    const n = counters.get(date) + 1;
    counters.set(date, n);
    return n;
  }
  let start = 1;
  if (fs.existsSync(DRAFTS_DIR)) {
    const nums = fs.readdirSync(DRAFTS_DIR)
      .filter((f) => f.startsWith(`${date}-`) && f.endsWith(".md"))
      .map((f) => parseDraftIndex(f))
      .filter((n) => !Number.isNaN(n));
    if (nums.length) start = Math.max(...nums) + 1;
  }
  counters?.set(date, start);
  return start;
}

function writeDrafts(posts, dates, status = "DRAFT") {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  const existing = existingDraftKeys();
  const written = [];
  const counters = new Map();
  let dateIdx = 0;
  let perDate = 0;
  const maxPerDate = Math.ceil(posts.length / dates.length);

  for (const post of posts) {
    const key = `${post.subreddit}::${post.title.slice(0, 60)}`;
    if (existing.has(key)) continue;

    if (perDate >= maxPerDate && dateIdx < dates.length - 1) {
      dateIdx++;
      perDate = 0;
    }
    const date = dates[dateIdx];
    const index = nextIndexForDate(date, counters);
    const filename = draftFilename(date, index, post.subreddit);
    const outPath = path.join(DRAFTS_DIR, filename);
    fs.writeFileSync(outPath, renderDraft(post, date, status));
    existing.add(key);
    written.push({ path: outPath, filename, date, subreddit: post.subreddit, campaign: post.campaign });
    perDate++;
  }
  return written;
}

function parseActiveCampaigns() {
  if (!fs.existsSync(MARKETING_MD)) return [];
  const md = fs.readFileSync(MARKETING_MD, "utf8");
  const rows = [...md.matchAll(/\|\s*(MC-[A-Z0-9-]+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*\*\*(ACTIVE|PUBLISH_READY)\*\*/g)];
  return rows.map((m) => ({
    id: m[1],
    name: m[2].trim(),
    product: m[3].trim(),
    landing: m[4].trim(),
    channels: m[5].trim(),
    status: m[6],
  }));
}

function subredditForCampaign(campaign) {
  const map = {
    "MC-010": "freelance",
    "MC-008": "freelance",
    "MC-009": "webdev",
    "MC-007": "SaaS",
    "MC-012": "SideProject",
    "MC-011": "smallbusiness",
    "MC-GAMES-001": "WebGames",
    "MC-001": "freelance",
    "MC-002": "webdev",
  };
  return map[campaign.id] || "SideProject";
}

function generateFromCampaigns(count, date) {
  const campaigns = parseActiveCampaigns();
  const pool = loadAllPosts();
  const written = [];
  const used = existingDraftKeys();

  for (const campaign of campaigns) {
    if (written.length >= count) break;
    const match =
      pool.find((p) => p.campaign === campaign.id && !used.has(`${p.subreddit}::${p.title.slice(0, 60)}`)) ||
      pool.find((p) => p.campaign === campaign.id);
    if (!match) continue;

    const post = { ...match };
    if (!pool.find((p) => p.campaign === campaign.id)) {
      post.subreddit = subredditForCampaign(campaign);
      post.title = `[Draft] ${campaign.name}`;
      post.body = `Campaign ${campaign.id}: ${campaign.name}\n\nLanding: ${campaign.landing}\n\n*(Agent: expand from MARKETING.md + DEPLOY_LOG before review)*`;
      post.landing_url = firstLandingUrl(campaign.landing);
      post.source = "board/MARKETING.md";
    }

    const key = `${post.subreddit}::${post.title.slice(0, 60)}`;
    if (used.has(key)) continue;

    const index = nextIndexForDate(date, new Map());
    const filename = draftFilename(date, index, post.subreddit);
    const outPath = path.join(DRAFTS_DIR, filename);
    fs.writeFileSync(outPath, renderDraft(post, date, "DRAFT"));
    used.add(key);
    written.push({ path: outPath, filename, date, subreddit: post.subreddit, campaign: post.campaign });
  }
  return written;
}

function countDrafts() {
  if (!fs.existsSync(DRAFTS_DIR)) return { total: 0, byStatus: {}, byDate: {} };
  const byStatus = {};
  const byDate = {};
  let total = 0;
  for (const f of fs.readdirSync(DRAFTS_DIR)) {
    if (!f.endsWith(".md")) continue;
    total++;
    const body = fs.readFileSync(path.join(DRAFTS_DIR, f), "utf8");
    const status = body.match(/^status:\s*(\w+)/m)?.[1] || "UNKNOWN";
    const date = body.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)?.[1] || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;
    byDate[date] = (byDate[date] || 0) + 1;
  }
  return { total, byStatus, byDate };
}

function hasArg(name) {
  return process.argv.includes(name);
}

function argValue(name, fallback) {
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function main() {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });

  if (hasArg("--import")) {
    const limit = parseInt(argValue("--limit", "10"), 10);
    const dates = argValue("--dates", `${todayISO()},${tomorrowISO()}`).split(",").map((d) => d.trim());
    const posts = loadAllPosts().slice(0, limit);
    const written = writeDrafts(posts, dates, "DRAFT");
    console.log(JSON.stringify({ ok: true, action: "import", written: written.length, files: written, counts: countDrafts() }, null, 2));
    return;
  }

  if (hasArg("--generate")) {
    const count = parseInt(argValue("--count", "3"), 10);
    const date = argValue("--date", todayISO());
    const written = generateFromCampaigns(count, date);
    console.log(JSON.stringify({ ok: true, action: "generate", written: written.length, files: written, counts: countDrafts() }, null, 2));
    return;
  }

  const pool = loadAllPosts();
  const counts = countDrafts();
  console.log(JSON.stringify({
    ok: true,
    action: "summary",
    outreach_posts_parsed: pool.length,
    drafts_dir: DRAFTS_DIR,
    deploy_log: fs.existsSync(DEPLOY_LOG),
    counts,
    sample_posts: pool.slice(0, 5).map((p) => ({ subreddit: p.subreddit, campaign: p.campaign, title: p.title.slice(0, 60) })),
  }, null, 2));
}

main();
