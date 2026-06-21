import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot, loadEnv } from "../env.mjs";
import { getPaymentLink } from "../commerce.mjs";

const POSTS = [
  {
    platform: "reddit",
    subreddit: "freelance",
    title: "Free invoice PDF generator — no account, $3 for watermark-free export",
    body: "Built a simple tool for myself — preview free, one-time $3 for clean PDF. Not trying to spam; genuinely useful for quick client invoices.",
    urlPath: "/billsnap/index.html?utm_source=reddit&utm_campaign=freelance",
  },
  {
    platform: "reddit",
    subreddit: "Landlord",
    title: "Free lease red-flag checker (paste text, get score)",
    body: "Rule-based analyzer — not legal advice, but catches common bad clauses. Free preview, full report is a few bucks.",
    urlPath: "/leaselens/index.html?utm_source=reddit&utm_campaign=landlord",
  },
  {
    platform: "indiehackers",
    title: "Launched 9 micro-tools under one Stripe stack — feedback welcome",
    body: "PipeKit API, BillSnap, LeaseLens, uptime monitor, etc. All self-serve checkout. Would love feedback on positioning.",
    urlPath: "/?utm_source=indiehackers",
  },
  {
    platform: "reddit",
    subreddit: "webdev",
    title: "Simple webhook relay for indie SaaS — $7/mo, no enterprise sales call",
    body: "Built HookRelay for my own stack — forward webhooks, replay failed events, dead-letter alerts. Self-serve Stripe.",
    urlPath: "/go/webhook.html?utm_source=reddit&utm_campaign=webdev",
  },
  {
    platform: "reddit",
    subreddit: "startups",
    title: "Free NDA generator with $4 PDF export — no Rocket Lawyer subscription",
    body: "Quick mutual or one-way NDAs for freelancers. Preview free, clean PDF for a few bucks.",
    urlPath: "/go/nda.html?utm_source=reddit&utm_campaign=startups",
  },
  {
    platform: "hackernews",
    title: "Show HN: PipeKit — micro-APIs (UUID, hash, base64) with self-serve keys",
    body: "100 free requests/day unauthenticated. Paid from $9/mo. Built for developers who don't need a full API platform.",
    urlPath: "/go/pipekit.html?utm_source=hn&utm_campaign=pipekit",
  },
];

export function buildOutreachPack() {
  const env = loadEnv();
  const base = (env.PUBLIC_BASE_URL ?? "https://YOUR_DOMAIN").replace(/\/$/, "");
  const outDir = join(getDataRoot(), "marketing", "outreach");
  mkdirSync(outDir, { recursive: true });

  const pack = POSTS.map((p) => ({
    ...p,
    fullUrl: base + p.urlPath,
    readyToPost: `${p.title}\n\n${p.body ?? p.tagline ?? ""}\n\n${base + p.urlPath}`,
  }));

  writeFileSync(join(outDir, "posts.json"), JSON.stringify(pack, null, 2));
  writeFileSync(join(outDir, "POST_TODAY.md"), formatToday(pack));
  return { posts: pack.length, today: join(outDir, "POST_TODAY.md") };
}

function formatToday(pack) {
  const day = Math.floor(Date.now() / 86400000) % pack.length;
  const p = pack[day];
  return `# Post today — ${p.platform}\n\n${p.readyToPost}\n\n---\nCopy and post manually (automated posting violates most platform TOS).\n`;
}
