import { randomBytes } from "crypto";
import { getDb, logEvent } from "../db.mjs";
import { getPublicBaseUrl } from "../env.mjs";

export function ensureReferralCodes(count = 5) {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS referrals (
      code TEXT PRIMARY KEY,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  const existing = db.prepare("SELECT COUNT(*) as c FROM referrals").get().c;
  const created = [];
  for (let i = existing; i < count; i++) {
    const code = randomBytes(4).toString("hex");
    db.prepare("INSERT INTO referrals (code, created_at) VALUES (?, ?)").run(code, new Date().toISOString());
    created.push(code);
  }
  const all = db.prepare("SELECT code FROM referrals").all();
  const base = getPublicBaseUrl();
  return {
    links: all.map((r) => ({ code: r.code, url: `${base}/?ref=${r.code}` })),
    created: created.length,
  };
}

export function trackReferralClick(code) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM referrals WHERE code = ?").get(code);
  if (!row) return false;
  db.prepare("UPDATE referrals SET clicks = clicks + 1 WHERE code = ?").run(code);
  logEvent(null, "referral_click", { code });
  return true;
}
