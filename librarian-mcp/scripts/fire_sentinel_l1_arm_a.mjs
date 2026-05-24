/**
 * Fire L1 Arm A — apparatus-validation receipt #1
 * Bushel 17 EXTENSION / Sipping Ethereal T — first instrumented sentinel ever fired.
 * Run: node librarian-mcp/scripts/fire_sentinel_l1_arm_a.mjs
 */
import { pathToFileURL } from "node:url";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");

function distUrl(relPath) {
  return pathToFileURL(join(DIST, relPath)).href;
}

const { runSentinelOnArmA } = await import(distUrl("bushel_17/sentinel_runner.js"));

const armAContext = {
  session_id: "BP021",
  is_post_compaction: true,
  context_budget_remaining: 0.06,
  fresh_session_with_coffee_handoff: false,
  session_start_ts: new Date().toISOString(),
};

const result = runSentinelOnArmA("L1", armAContext, 1);

console.log("\n=== RECEIPT JSON ===");
console.log(JSON.stringify(result.receipt, null, 2));
console.log("\n=== RECEIPT PATH ===");
console.log(result.receipt_path);
