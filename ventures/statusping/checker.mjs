import { getDb, logEvent } from "../../core/db.mjs";

export async function runUptimeChecks() {
  const db = getDb();
  const monitors = db.prepare("SELECT * FROM monitors WHERE active = 1").all();
  let checked = 0;
  let down = 0;

  for (const m of monitors) {
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(m.url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
      const ok = res.ok || (res.status >= 300 && res.status < 400);
      const prev = m.last_status;
      db.prepare("UPDATE monitors SET last_status = ?, last_checked = ? WHERE id = ?").run(ok ? 1 : 0, new Date().toISOString(), m.id);
      if (!ok) {
        down++;
        logEvent("statusping", "monitor_down", { id: m.id, url: m.url });
      } else if (prev === 0) {
        logEvent("statusping", "monitor_recovered", { id: m.id, url: m.url });
      }
      checked++;
    } catch {
      db.prepare("UPDATE monitors SET last_status = 0, last_checked = ? WHERE id = ?").run(new Date().toISOString(), m.id);
      down++;
      logEvent("statusping", "monitor_down", { id: m.id, url: m.url, error: "timeout" });
      checked++;
    }
  }
  return { checked, down, total: monitors.length };
}

export function addMonitor(id, url, email) {
  getDb()
    .prepare("INSERT OR REPLACE INTO monitors (id, url, email, active) VALUES (?, ?, ?, 1)")
    .run(id, url, email ?? null);
}
