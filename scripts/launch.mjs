import { patchEnvFromHorseshoe, ensureStripeWebhook } from "../core/setup.mjs";
import { spawn } from "child_process";
import { getRoot } from "../core/env.mjs";
import { runOrchestratorCycle } from "../core/orchestrator.mjs";

const args = process.argv.slice(2);
const publicUrl = args.find((a) => a.startsWith("http")) ?? process.env.PUBLIC_BASE_URL;

console.log("=== Wealth Engine Launch ===\n");

patchEnvFromHorseshoe();
console.log("✓ Env patched (Resend from Horseshoe hub)");

await runOrchestratorCycle();
console.log("✓ Orchestrator cycle complete");

if (publicUrl && publicUrl.startsWith("http")) {
  try {
    const wh = await ensureStripeWebhook(publicUrl);
    console.log("✓ Stripe webhook:", wh.url, wh.created ? "(created)" : "(existing)");
  } catch (e) {
    console.warn("⚠ Webhook setup:", e.message);
  }
}

console.log("\nStarting daemon...");
const child = spawn(process.execPath, ["core/daemon.mjs"], {
  cwd: getRoot(),
  detached: true,
  stdio: "ignore",
  windowsHide: true,
});
child.unref();
console.log(`✓ Daemon PID ${child.pid} — http://localhost:8787`);
console.log("\nDone. Wealth Engine is live locally.");
