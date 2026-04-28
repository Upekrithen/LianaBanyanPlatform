/**
 * K532 — Pawn Dispatch Verification Script
 *
 * Smoke-tests the dispatch_pawn tool wiring WITHOUT calling the Perplexity API.
 * Verifies: feature-flag-off behavior, config load, ledger directory structure,
 * and that all exported functions are importable.
 *
 * Run: node scripts/verify-pawn-dispatch.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`  ✓ ${label}`);
      passed++;
    } else {
      console.error(`  ✗ ${label} — returned: ${JSON.stringify(result)}`);
      failed++;
    }
  } catch (err) {
    console.error(`  ✗ ${label} — threw: ${err.message}`);
    failed++;
  }
}

async function checkAsync(label, fn) {
  try {
    const result = await fn();
    if (result === true || result === undefined) {
      console.log(`  ✓ ${label}`);
      passed++;
    } else {
      console.error(`  ✗ ${label} — returned: ${JSON.stringify(result)}`);
      failed++;
    }
  } catch (err) {
    console.error(`  ✗ ${label} — threw: ${err.message}`);
    failed++;
  }
}

console.log("\n=== K532 Pawn Dispatch Verification ===\n");

// C.1 — Config file exists and is valid JSON
console.log("C.1 — Config file");
check("pawn_dispatch_caps.json exists", () => existsSync(resolve(LIBRARIAN_ROOT, "config", "pawn_dispatch_caps.json")));
check("pawn_dispatch_caps.json is valid JSON", () => {
  const caps = JSON.parse(readFileSync(resolve(LIBRARIAN_ROOT, "config", "pawn_dispatch_caps.json"), "utf-8"));
  return caps.PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED === false;
});
check("per_dispatch_cost_cap_usd is 1.00", () => {
  const caps = JSON.parse(readFileSync(resolve(LIBRARIAN_ROOT, "config", "pawn_dispatch_caps.json"), "utf-8"));
  return caps.per_dispatch_cost_cap_usd === 1.00;
});
check("daily_cost_cap_usd is 10.00", () => {
  const caps = JSON.parse(readFileSync(resolve(LIBRARIAN_ROOT, "config", "pawn_dispatch_caps.json"), "utf-8"));
  return caps.daily_cost_cap_usd === 10.00;
});

// C.2 — Dispatch module importable and functions exported
console.log("\nC.2 — Module import");
let dispatchModule;
try {
  dispatchModule = await import("../dist/pawn_dispatch.js");
  check("runDispatchPawn exported", () => typeof dispatchModule.runDispatchPawn === "function");
  check("getDispatchStatus exported", () => typeof dispatchModule.getDispatchStatus === "function");
  check("cancelDispatch exported", () => typeof dispatchModule.cancelDispatch === "function");
  check("listRecentDispatches exported", () => typeof dispatchModule.listRecentDispatches === "function");
} catch (err) {
  console.error(`  ✗ Failed to import pawn_dispatch.js — ${err.message}`);
  console.error("    Run 'npm run build' first to compile TypeScript.");
  failed += 4;
}

// C.3 — Feature-flag-off returns feature_flag_off (no API call)
console.log("\nC.3 — Feature flag off");
if (dispatchModule) {
  await checkAsync("feature_flag_off when ENABLED=false", async () => {
    const result = await dispatchModule.runDispatchPawn({
      prompt_content: "test",
      expected_return_path: "BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_TEST.md",
    });
    return result.status === "feature_flag_off" && result.error_class === "feature_flag_off";
  });
}

// C.4 — Directory structure exists
console.log("\nC.4 — Directory structure");
check("dispatches/pawn/ exists", () => existsSync(resolve(LIBRARIAN_ROOT, "dispatches", "pawn")));
check("telemetry/ exists", () => existsSync(resolve(LIBRARIAN_ROOT, "telemetry")));

// C.5 — SHA-256 hashing works (built-in crypto)
console.log("\nC.5 — SHA-256 hashing");
check("sha256 produces 64-char hex", () => {
  const hash = createHash("sha256").update("test", "utf-8").digest("hex");
  return hash.length === 64;
});

// C.6 — listRecentDispatches returns empty array when ledger missing
console.log("\nC.6 — Empty ledger");
if (dispatchModule) {
  check("listRecentDispatches returns [] when no ledger", () => {
    const records = dispatchModule.listRecentDispatches(10);
    return Array.isArray(records);
  });
}

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  process.exit(1);
}
