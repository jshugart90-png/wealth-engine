import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { getDb, logEvent } from "../db.mjs";
import { getRoot, getPublicBaseUrl } from "../env.mjs";

let configCache;

export function loadAffiliateConfig() {
  if (configCache) return configCache;
  configCache = JSON.parse(readFileSync(join(getRoot(), "config", "affiliates.json"), "utf8"));
  return configCache;
}

export function initAffiliateTables() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS affiliates (
      code TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      status TEXT DEFAULT 'active',
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      commission_pending_usd REAL DEFAULT 0,
      commission_paid_usd REAL DEFAULT 0,
      stripe_connect_id TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS affiliate_commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      sku TEXT,
      amount_usd REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      stripe_session_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (code) REFERENCES affiliates(code)
    );
    CREATE INDEX IF NOT EXISTS idx_affiliate_comm_code ON affiliate_commissions(code, status);
  `);
}

function generateCode() {
  return randomBytes(4).toString("hex");
}

export function signupPartner({ email, name }) {
  initAffiliateTables();
  if (!email?.includes("@")) return { ok: false, error: "invalid_email" };

  const db = getDb();
  const existing = db.prepare("SELECT * FROM affiliates WHERE email = ?").get(email.trim().toLowerCase());
  if (existing) {
    return {
      ok: true,
      existing: true,
      code: existing.code,
      url: buildPartnerUrl(existing.code),
    };
  }

  let code = generateCode();
  while (db.prepare("SELECT 1 FROM affiliates WHERE code = ?").get(code)) {
    code = generateCode();
  }

  db.prepare(
    `INSERT INTO affiliates (code, email, name, status, created_at) VALUES (?, ?, ?, 'active', ?)`
  ).run(code, email.trim().toLowerCase(), name?.trim() || null, new Date().toISOString());

  db.prepare(
    `INSERT OR IGNORE INTO referrals (code, clicks, conversions, created_at) VALUES (?, 0, 0, ?)`
  ).run(code, new Date().toISOString());

  logEvent("portfolio", "affiliate_signup", { code, email: email.trim().toLowerCase() });

  return { ok: true, existing: false, code, url: buildPartnerUrl(code) };
}

export function buildPartnerUrl(code, path = "/") {
  const base = getPublicBaseUrl();
  const sep = path.includes("?") ? "&" : "?";
  return `${base}${path}${sep}ref=${code}`;
}

export function getPartnerByCode(code) {
  initAffiliateTables();
  return getDb().prepare("SELECT * FROM affiliates WHERE code = ? AND status = 'active'").get(code);
}

export function trackAffiliateClick(code) {
  initAffiliateTables();
  const db = getDb();
  const partner = getPartnerByCode(code);
  if (partner) {
    db.prepare("UPDATE affiliates SET clicks = clicks + 1 WHERE code = ?").run(code);
    db.prepare("UPDATE referrals SET clicks = clicks + 1 WHERE code = ?").run(code);
    logEvent("portfolio", "affiliate_click", { code });
    logEvent(null, "referral_click", { code });
    return true;
  }
  const row = db.prepare("SELECT * FROM referrals WHERE code = ?").get(code);
  if (!row) return false;
  db.prepare("UPDATE referrals SET clicks = clicks + 1 WHERE code = ?").run(code);
  logEvent(null, "referral_click", { code });
  return true;
}

export function calcCommissionUsd(sku, amountUsd) {
  const cfg = loadAffiliateConfig();
  const product = cfg.products.find((p) => p.sku === sku);
  const price = amountUsd ?? product?.priceUsd ?? 0;

  if (product?.type === "subscription" || (!product && price >= 5)) {
    return Math.round(price * cfg.commissions.subscription.rate * 100) / 100;
  }
  if (price >= cfg.commissions.oneTime.priceMinUsd && price <= cfg.commissions.oneTime.priceMaxUsd) {
    return cfg.commissions.oneTime.flatUsd;
  }
  return 0;
}

export function creditAffiliateConversion({ code, sku, amountUsd, sessionId }) {
  if (!code) return { ok: false, error: "no_code" };
  initAffiliateTables();
  const partner = getPartnerByCode(code);
  if (!partner) return { ok: false, error: "unknown_partner" };

  const commission = calcCommissionUsd(sku, amountUsd);
  if (commission <= 0) return { ok: false, error: "no_commission" };

  const db = getDb();
  db.prepare("UPDATE affiliates SET conversions = conversions + 1, commission_pending_usd = commission_pending_usd + ? WHERE code = ?").run(
    commission,
    code
  );
  db.prepare("UPDATE referrals SET conversions = conversions + 1 WHERE code = ?").run(code);
  db.prepare(
    `INSERT INTO affiliate_commissions (code, sku, amount_usd, status, stripe_session_id, created_at)
     VALUES (?, ?, ?, 'pending', ?, ?)`
  ).run(code, sku ?? null, commission, sessionId ?? null, new Date().toISOString());

  logEvent("portfolio", "affiliate_conversion", { code, sku, commission, sessionId });
  return { ok: true, commission };
}

export function clawbackCommission(sessionId) {
  initAffiliateTables();
  const rows = getDb()
    .prepare("SELECT * FROM affiliate_commissions WHERE stripe_session_id = ? AND status = 'pending'")
    .all(sessionId);
  for (const row of rows) {
    const p = getDb().prepare("SELECT commission_pending_usd FROM affiliates WHERE code = ?").get(row.code);
    const next = Math.max(0, (p?.commission_pending_usd ?? 0) - row.amount_usd);
    getDb().prepare("UPDATE affiliates SET commission_pending_usd = ? WHERE code = ?").run(next, row.code);
    getDb().prepare("UPDATE affiliate_commissions SET status = 'clawed_back' WHERE id = ?").run(row.id);
    logEvent("portfolio", "affiliate_clawback", { code: row.code, amount: row.amount_usd, sessionId });
  }
  return { clawed: rows.length };
}

export function getPartnerStats(code) {
  initAffiliateTables();
  const partner = getPartnerByCode(code);
  if (!partner) return null;
  const cfg = loadAffiliateConfig();
  return {
    code: partner.code,
    email: partner.email,
    clicks: partner.clicks,
    conversions: partner.conversions,
    commissionPendingUsd: partner.commission_pending_usd,
    commissionPaidUsd: partner.commission_paid_usd,
    payoutHoldDays: cfg.program.payoutHoldDays,
    cookieDays: cfg.program.cookieDays,
  };
}

export const AFFILIATE_REF_SCRIPT = `(function(){
  var p=new URLSearchParams(location.search);
  var ref=p.get('ref')||localStorage.getItem('we_ref');
  if(p.get('ref')){ref=p.get('ref');localStorage.setItem('we_ref',ref);document.cookie='we_ref='+ref+';path=/;max-age='+(90*86400);}
  if(!ref)return;
  document.querySelectorAll('a[href*="stripe.com"]').forEach(function(a){
    try{var u=new URL(a.href);u.searchParams.set('client_reference_id',ref);a.href=u.toString();}catch(e){}
  });
})();`;
