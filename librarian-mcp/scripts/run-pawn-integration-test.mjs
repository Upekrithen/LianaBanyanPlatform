/**
 * K532 — Phase C.10 Integration Test
 *
 * Dispatches the actual PAWN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md prompt
 * through the dispatch_pawn tool. Verifies:
 *  - Return file lands at BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md
 *  - Ledger entry recorded
 *  - Telemetry recorded
 *  - Response is structurally valid (markdown content)
 *
 * Temporarily enables the feature gate; restores to false after test completes.
 *
 * Usage (with PERPLEXITY_API_KEY in environment):
 *   node scripts/run-pawn-integration-test.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, "..");
const WORKSPACE_ROOT = resolve(LIBRARIAN_ROOT, "..");

const CONFIG_PATH = resolve(LIBRARIAN_ROOT, "config", "pawn_dispatch_caps.json");
const PAWN_PROMPT_PATH = resolve(
  WORKSPACE_ROOT,
  "BISHOP_DROPZONE/02_PawnPrompts/PAWN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md"
);
const EXPECTED_RETURN_PATH = "BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md";
const LEDGER_PATH = resolve(LIBRARIAN_ROOT, "dispatches", "pawn", "dispatch_ledger.jsonl");
const TELEMETRY_PATH = resolve(LIBRARIAN_ROOT, "telemetry", "pawn_dispatch_costs.jsonl");

// ── Pre-flight checks ─────────────────────────────────────────────────────────

if (!process.env.PERPLEXITY_API_KEY) {
  console.error("ERROR: PERPLEXITY_API_KEY not set. Load from SDS.env first.");
  process.exit(1);
}

if (!existsSync(PAWN_PROMPT_PATH)) {
  console.error(`ERROR: Pawn prompt not found at ${PAWN_PROMPT_PATH}`);
  process.exit(1);
}

const promptContent = readFileSync(PAWN_PROMPT_PATH, "utf-8");
console.log(`\nKeirsey prompt loaded: ${promptContent.length} chars (~${Math.ceil(promptContent.length / 4)} tokens)`);

// ── Temporarily enable feature gate ──────────────────────────────────────────

const originalConfig = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
const testConfig = { ...originalConfig, PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED: true };
writeFileSync(CONFIG_PATH, JSON.stringify(testConfig, null, 2), "utf-8");
console.log("Feature gate temporarily enabled.");

// ── Import and run dispatch ───────────────────────────────────────────────────

let result;
let errorOccurred = false;

try {
  // Dynamic import AFTER config written (module reads config at call time)
  const { runDispatchPawn } = await import("../dist/pawn_dispatch.js");

  console.log("\nDispatching to Perplexity sonar-pro...");
  console.log("(Expected cost: ~$0.07-0.15; may take 30-90 seconds)");
  const t0 = Date.now();

  result = await runDispatchPawn({
    prompt_content: promptContent,
    prompt_artifact_path: "BISHOP_DROPZONE/02_PawnPrompts/PAWN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md",
    expected_return_path: EXPECTED_RETURN_PATH,
    model: "sonar-pro",
    max_tokens: 4000,
    dispatch_metadata: {
      session_id: "K532",
      cohort: "Keirsey-validation",
      founder_authorized: true,
    },
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nDispatch completed in ${elapsed}s.`);
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error("\nDISPATCH FAILED:", err);
  errorOccurred = true;
} finally {
  // ── Restore feature gate to false ─────────────────────────────────────────
  writeFileSync(CONFIG_PATH, JSON.stringify(originalConfig, null, 2), "utf-8");
  console.log("\nFeature gate restored to false.");
}

if (errorOccurred) {
  process.exit(1);
}

// ── Verify results ────────────────────────────────────────────────────────────

console.log("\n=== Verification ===");

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    if (fn()) {
      console.log(`  ✓ ${label}`);
      passed++;
    } else {
      console.error(`  ✗ ${label}`);
      failed++;
    }
  } catch (err) {
    console.error(`  ✗ ${label} — ${err.message}`);
    failed++;
  }
}

check("Dispatch status is 'dispatched'", () => result.status === "dispatched");
check("dispatch_id is a UUID", () => /^[0-9a-f-]{36}$/.test(result.dispatch_id ?? ""));
check("cost_actual_usd > 0", () => (result.cost_actual_usd ?? 0) > 0);
check("cost_actual_usd < 1.00 (per-dispatch cap)", () => (result.cost_actual_usd ?? 0) < 1.00);

const returnFilePath = resolve(WORKSPACE_ROOT, EXPECTED_RETURN_PATH);
check("Return file exists on disk", () => existsSync(returnFilePath));
check("Return file has content (>100 chars)", () => {
  if (!existsSync(returnFilePath)) return false;
  const content = readFileSync(returnFilePath, "utf-8");
  return content.length > 100;
});
check("Return file contains markdown table or headers", () => {
  if (!existsSync(returnFilePath)) return false;
  const content = readFileSync(returnFilePath, "utf-8");
  return content.includes("|") || content.includes("#");
});

check("Ledger file exists", () => existsSync(LEDGER_PATH));
check("Ledger has entry for this dispatch", () => {
  if (!existsSync(LEDGER_PATH)) return false;
  const lines = readFileSync(LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
  return lines.some(l => {
    try { return JSON.parse(l).dispatch_id === result.dispatch_id; } catch { return false; }
  });
});

check("Telemetry file exists", () => existsSync(TELEMETRY_PATH));
check("Telemetry has entry for this dispatch", () => {
  if (!existsSync(TELEMETRY_PATH)) return false;
  const lines = readFileSync(TELEMETRY_PATH, "utf-8").split("\n").filter(l => l.trim());
  return lines.some(l => {
    try { return JSON.parse(l).dispatch_id === result.dispatch_id; } catch { return false; }
  });
});

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);

if (passed > 0 && failed === 0) {
  console.log("\nK532 Phase C.10 INTEGRATION TEST PASSED");
  console.log(`Return file: ${returnFilePath}`);
  console.log(`Dispatch ID: ${result.dispatch_id}`);
  console.log(`Cost actual: $${result.cost_actual_usd?.toFixed(6)}`);
}

if (failed > 0) process.exit(1);
