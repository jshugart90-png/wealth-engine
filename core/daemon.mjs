import { loadEnv } from "./env.mjs";
import { runOrchestratorCycle } from "./orchestrator.mjs";
import { startServer } from "./server.mjs";

const env = loadEnv();
const intervalMin = parseInt(env.RUN_INTERVAL_MINUTES ?? "360", 10);

console.log("Wealth Engine daemon starting...");
console.log(`Orchestrator interval: every ${intervalMin} minutes`);

await runOrchestratorCycle();
await startServer();

setInterval(() => {
  runOrchestratorCycle().catch((e) => console.error("Cycle error:", e.message));
}, intervalMin * 60 * 1000);

process.on("SIGINT", () => {
  console.log("Daemon stopped.");
  process.exit(0);
});
