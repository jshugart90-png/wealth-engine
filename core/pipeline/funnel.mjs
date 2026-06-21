import { getDb, logEvent } from "../db.mjs";

export function initFunnelTables() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS funnel_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      type TEXT NOT NULL,
      venture_id TEXT,
      sku TEXT,
      source TEXT,
      ref_code TEXT,
      path TEXT,
      meta TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_funnel_type ON funnel_events(type, ts);
  `);
}

export function trackFunnel(type, data = {}) {
  initFunnelTables();
  getDb()
    .prepare(
      `INSERT INTO funnel_events (ts, type, venture_id, sku, source, ref_code, path, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      new Date().toISOString(),
      type,
      data.ventureId ?? null,
      data.sku ?? null,
      data.source ?? null,
      data.refCode ?? null,
      data.path ?? null,
      JSON.stringify(data.meta ?? {})
    );
}

export function getFunnelMetrics(days = 30) {
  initFunnelTables();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const db = getDb();
  const visits = db.prepare("SELECT COUNT(*) as c FROM funnel_events WHERE type='visit' AND ts > ?").get(since).c;
  const checkoutClicks = db.prepare("SELECT COUNT(*) as c FROM funnel_events WHERE type='checkout_click' AND ts > ?").get(since).c;
  const checkouts = db.prepare("SELECT COUNT(*) as c FROM events WHERE type='stripe_checkout' AND ts > ?").get(since).c;
  const revenue = db.prepare("SELECT payload FROM events WHERE type='stripe_checkout' AND ts > ?").all(since);
  let totalUsd = 0;
  for (const r of revenue) {
    try {
      const p = JSON.parse(r.payload);
      totalUsd += Number(p.amountUsd ?? 0);
    } catch {
      /* stripe payload may not have amount yet */
    }
  }
  const target = 500;
  return {
    days,
    visits,
    checkoutClicks,
    purchases: checkouts,
    revenueUsd: totalUsd,
    targetUsd: target,
    pctOfTarget: Math.round((totalUsd / target) * 100),
    projected30dUsd: days > 0 ? Math.round((totalUsd / Math.max(1, days)) * 30) : 0,
  };
}

export function parseAttribution(url, refHeader) {
  const source = url.searchParams.get("utm_source") ?? url.searchParams.get("src") ?? "direct";
  const ref = url.searchParams.get("ref") ?? refHeader ?? null;
  return { source, refCode: ref };
}
