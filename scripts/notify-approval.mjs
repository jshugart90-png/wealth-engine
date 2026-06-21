#!/usr/bin/env node
/**
 * Sends Tier-2 approval notifications via Telegram or Slack webhook.
 *
 * Usage:
 *   node scripts/notify-approval.mjs --id AP-001
 *   node scripts/notify-approval.mjs --pending
 *   node scripts/notify-approval.mjs --message "Custom alert"
 *
 * Env (one channel required):
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *   SLACK_WEBHOOK_URL
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const boardPath = join(root, "board", "APPROVALS.md");

function loadEnv() {
  const env = { ...process.env };
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return env;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { id: null, pending: false, message: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && args[i + 1]) out.id = args[++i];
    else if (args[i] === "--pending") out.pending = true;
    else if (args[i] === "--message" && args[i + 1]) out.message = args[++i];
  }
  return out;
}

function extractApproval(md, id) {
  const re = new RegExp(`### ${id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}[\\s\\S]*?(?=\\n### |\\n## |$)`);
  const m = md.match(re);
  return m ? m[0].trim() : null;
}

function listPending(md) {
  const blocks = md.split(/^### /m).slice(1);
  return blocks
    .filter((b) => b.includes("⏳ PENDING") || b.includes("Status:** ⏳ PENDING"))
    .map((b) => "### " + b.trim());
}

async function sendTelegram(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
  return "telegram";
}

async function sendSlack(webhookUrl, text) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack ${res.status}: ${await res.text()}`);
  return "slack";
}

async function notify(text) {
  const env = loadEnv();
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    return sendTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, text);
  }
  if (env.SLACK_WEBHOOK_URL) {
    return sendSlack(env.SLACK_WEBHOOK_URL, text);
  }
  console.error("No notification channel configured.");
  console.error("Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID or SLACK_WEBHOOK_URL in .env");
  process.exit(1);
}

const { id, pending, message } = parseArgs();

if (!existsSync(boardPath) && !message) {
  console.error("board/APPROVALS.md not found");
  process.exit(1);
}

const md = existsSync(boardPath) ? readFileSync(boardPath, "utf8") : "";
let payload = message;

if (!payload && id) {
  const block = extractApproval(md, id);
  if (!block) {
    console.error(`Approval ${id} not found in APPROVALS.md`);
    process.exit(1);
  }
  payload = `🔔 *Wealth Engine Tier-2 Approval*\n\n${block}\n\nReply in Cursor or approve via env flag.`;
}

if (!payload && pending) {
  const blocks = listPending(md);
  if (blocks.length === 0) {
    console.log("No pending approvals.");
    process.exit(0);
  }
  payload = `🔔 *Wealth Engine — ${blocks.length} pending approval(s)*\n\n${blocks.join("\n\n")}`;
}

if (!payload) {
  console.error("Usage: notify-approval.mjs --id AP-001 | --pending | --message \"...\"");
  process.exit(1);
}

const channel = await notify(payload.slice(0, 4000));
console.log(JSON.stringify({ ok: true, channel, chars: payload.length }, null, 2));
