import { createServer } from "http";
import { readFileSync, existsSync, mkdirSync, appendFileSync } from "fs";
import { join, extname } from "path";
import { getRoot, getDataRoot, loadEnv } from "./env.mjs";
import { getDb, logEvent } from "./db.mjs";
import { handleStripeWebhook, validateApiKey, redeemLicense, getPaymentLink } from "./commerce.mjs";
import { trackAffiliateClick, signupPartner, getPartnerStats } from "./marketing/affiliates.mjs";
import { trackFunnel } from "./pipeline/funnel.mjs";
import { runUptimeChecks } from "../ventures/statusping/checker.mjs";
import { handleApiRequest } from "../ventures/devtools-api/handlers.mjs";
import { handleBillSnap } from "../ventures/billsnap/handlers.mjs";
import { handleLeaseLens } from "../ventures/leaselens/handlers.mjs";

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  const dir = join(getDataRoot(), "logs");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, "server.log"), line);
}

const EXTENSIONLESS_PREFIXES = ["/go/", "/bundles/", "/hookrelay/"];

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function tryExtensionlessRedirect(pathname, res, root) {
  const path = normalizePath(pathname);
  if (extname(path)) return false;

  const shouldTry =
    path === "/join" ||
    path === "/refer" ||
    path.startsWith("/partners") ||
    EXTENSIONLESS_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (!shouldTry) return false;

  if (path.startsWith("/partners")) {
    const partnersIndex = join(root, "dist", "partners", "index.html");
    if (existsSync(partnersIndex)) {
      res.writeHead(301, { Location: "/partners/index.html" });
      res.end();
      return true;
    }
  }

  const htmlPath = join(root, "dist", `${path.slice(1)}.html`);
  if (existsSync(htmlPath)) {
    res.writeHead(301, { Location: `${path}.html` });
    res.end();
    return true;
  }
  return false;
}

export function createAppServer() {
  getDb();
  const env = loadEnv();
  const root = getRoot();

  return createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    try {
      const ref = url.searchParams.get("ref");
      if (ref) {
        trackAffiliateClick(ref);
        res.setHeader(
          "Set-Cookie",
          `we_ref=${encodeURIComponent(ref)}; Path=/; Max-Age=${90 * 86400}; SameSite=Lax`
        );
      }

      if (req.method === "POST" && url.pathname === "/api/affiliate/signup") {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = Buffer.concat(chunks).toString();
        let data = {};
        try {
          data = JSON.parse(body || "{}");
        } catch {
          /* ignore */
        }
        const result = signupPartner({ email: data.email, name: data.name });
        if (data.email) {
          trackFunnel("affiliate_signup", { path: data.path ?? "/join", meta: { email: data.email } });
        }
        res.writeHead(result.ok ? 200 : 400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/affiliate/stats") {
        const code = url.searchParams.get("code");
        const stats = code ? getPartnerStats(code) : null;
        if (!stats) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "not_found" }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, ...stats }));
        return;
      }

      if (req.method === "POST" && url.pathname === "/webhooks/stripe") {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = Buffer.concat(chunks).toString();
        await handleStripeWebhook(body, req.headers["stripe-signature"], env.STRIPE_WEBHOOK_SECRET);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"ok":true}');
        return;
      }

      if (url.pathname.startsWith("/api/pipekit/")) {
        const auth = req.headers["x-api-key"];
        if (auth) {
          const v = validateApiKey(auth);
          if (!v.ok) {
            res.writeHead(v.error === "rate_limit" ? 429 : 401, { "Content-Type": "application/json" });
            res.end(JSON.stringify(v));
            return;
          }
        }
        const result = await handleApiRequest(url.pathname.replace("/api/pipekit", ""), req, url);
        res.writeHead(result.status ?? 200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.body));
        return;
      }

      if (url.pathname.startsWith("/api/billsnap/")) {
        const result = await handleBillSnap(url.pathname, req, url);
        res.writeHead(result.status ?? 200, { "Content-Type": result.headers?.["Content-Type"] ?? "application/json", ...result.headers });
        res.end(result.body);
        return;
      }

      if (url.pathname.startsWith("/api/leaselens/")) {
        const result = await handleLeaseLens(url.pathname, req, url);
        res.writeHead(result.status ?? 200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.body));
        return;
      }

      if (url.pathname.startsWith("/api/funnel/") && req.method === "POST") {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = Buffer.concat(chunks).toString();
        let data = {};
        try {
          data = JSON.parse(body || "{}");
        } catch {
          /* ignore malformed body */
        }
        const type = url.pathname.replace("/api/funnel/", "");
        trackFunnel(type, data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"ok":true}');
        return;
      }

      if (tryExtensionlessRedirect(url.pathname, res, root)) return;

      if (url.pathname === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, ts: new Date().toISOString() }));
        return;
      }

      if (url.pathname === "/api/payment-links") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(readFileSync(join(getDataRoot(), "payment-links.json"), "utf8"));
        return;
      }

      // Static files from dist/
      let filePath = join(root, "dist", url.pathname === "/" ? "index.html" : url.pathname);
      if (existsSync(filePath) && !extname(filePath)) filePath += "/index.html";
      if (existsSync(filePath)) {
        const ext = extname(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
        res.end(readFileSync(filePath));
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    } catch (e) {
      log(`ERROR ${url.pathname}: ${e.message}`);
      res.writeHead(500);
      res.end("Error");
    }
  });
}

export async function startServer() {
  const env = loadEnv();
  const port = parseInt(env.PORT ?? "8787", 10);
  const server = createAppServer();
  server.listen(port, env.HOST ?? "0.0.0.0", () => {
    log(`Wealth Engine server on :${port}`);
    console.log(`Wealth Engine running http://localhost:${port}`);
  });

  // Background uptime checker every 5 min
  setInterval(() => {
    runUptimeChecks().catch((e) => log(`uptime error: ${e.message}`));
  }, 5 * 60 * 1000);

  return server;
}

if (process.argv[1]?.endsWith("server.mjs")) {
  startServer();
}
