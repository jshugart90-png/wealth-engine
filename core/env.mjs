import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function getRoot() {
  return root;
}

export function getDataRoot() {
  const env = loadEnvRaw();
  if (env.WEALTH_DATA_ROOT) return env.WEALTH_DATA_ROOT;
  const dPath = "D:\\wealth-engine-data";
  if (existsSync("D:\\")) {
    mkdirSync(dPath, { recursive: true });
    return dPath;
  }
  return join(root, "data");
}

function loadEnvRaw() {
  const path = join(root, ".env");
  const env = { ...process.env };
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

export function loadEnv() {
  return loadEnvRaw();
}

export function getPublicBaseUrl() {
  const env = loadEnv();
  return (env.PUBLIC_BASE_URL ?? "http://localhost:8787").replace(/\/$/, "");
}

export function requireEnv(key) {
  const env = loadEnv();
  const val = env[key];
  if (!val) throw new Error(`Missing env: ${key} (copy .env.example to .env)`);
  return val;
}
