import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getRoot, getDataRoot } from "./env.mjs";

let db;

export function getDb() {
  if (db) return db;
  const dataDir = getDataRoot();
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  db = new Database(join(dataDir, "wealth-engine.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      status TEXT NOT NULL,
      summary TEXT
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      venture_id TEXT,
      type TEXT NOT NULL,
      payload TEXT
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      venture_id TEXT NOT NULL,
      tier TEXT NOT NULL,
      stripe_customer_id TEXT,
      requests_today INTEGER DEFAULT 0,
      day_key TEXT,
      created_at TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS monitors (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      email TEXT,
      last_status INTEGER,
      last_checked TEXT,
      stripe_customer_id TEXT,
      active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS licenses (
      code TEXT PRIMARY KEY,
      venture_id TEXT NOT NULL,
      sku TEXT NOT NULL,
      stripe_session_id TEXT,
      email TEXT,
      uses_remaining INTEGER,
      expires_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stripe_catalog (
      sku TEXT PRIMARY KEY,
      venture_id TEXT NOT NULL,
      stripe_product_id TEXT,
      stripe_price_id TEXT,
      payment_link TEXT,
      updated_at TEXT
    );
  `);
  return db;
}

export function logEvent(ventureId, type, payload = {}) {
  getDb()
    .prepare("INSERT INTO events (ts, venture_id, type, payload) VALUES (?, ?, ?, ?)")
    .run(new Date().toISOString(), ventureId, type, JSON.stringify(payload));
}
