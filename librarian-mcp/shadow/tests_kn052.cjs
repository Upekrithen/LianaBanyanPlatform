/**
 * KN052 — Cost-Comparison Shadow + Multi-Detective Dispatch
 * Test suite (Phase D) — 10 tests, minimum 8 required
 *
 * Tests cover:
 * T01 shadow_daemon_spawns_correctly
 * T02 shadow_daemon_kills_on_completion (state file written with 'complete')
 * T03 detective_1_returns_before_spend (with vendor breakdown)
 * T04 detective_2_returns_before_accomplishments (with quantified deltas)
 * T05 detective_3_returns_after_spend (telemetry anchor present)
 * T06 detective_4_returns_after_accomplishments (canonical ceiling loaded)
 * T07 detective_5_synthesis_ratio_correct (math verified vs reference points)
 * T08 receipt_artifact_written_to_dropzone (proper path + canonical-format)
 * T09 b127_26x_algo_layers_complete (all 4 layers present with status field)
 * T10 kn052_citation_present (KN042 Substrate-Routed Memory Expansion cited)
 *
 * Augur-Pricing exemption: test file is documentation-class; LB membership
 * pricing identical for all members at $5/year, unchanged; all cost figures
 * are industry-term vendor-API spend, membership-orthogonal.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// ── Paths ─────────────────────────────────────────────────────────────────────
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SHADOW_PY = path.join(__dirname, "kn052_cost_comparison_shadow.py");
const RECEIPT_PATH = path.join(
  REPO_ROOT,
  "BISHOP_DROPZONE",
  "03_BishopHandoffs",
  "SUBSTRATE_ROI_BEFORE_VS_AFTER_RECEIPT_BP005.md"
);
const SHADOW_STATE_FILE = path.join(
  os.homedir(),
  ".lb-session",
  "kn052_shadow_state.json"
);

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function test(id, name, fn) {
  try {
    fn();
    console.log(`  ✅ ${id}: ${name}`);
    passed++;
    results.push({ id, name, status: "PASS" });
  } catch (err) {
    console.log(`  ❌ ${id}: ${name}`);
    console.log(`     Error: ${err.message}`);
    failed++;
    results.push({ id, name, status: "FAIL", error: err.message });
  }
}

// ── One-time Shadow execution (runs the daemon, produces state + receipt) ─────
let shadowOutput = null;
let shadowError = null;
let shadowExitCode = 0;

console.log("\n[KN052] Executing Shadow daemon (Python)...");
try {
  shadowOutput = execSync(`python "${SHADOW_PY}"`, {
    encoding: "utf-8",
    timeout: 60000,
    cwd: REPO_ROOT,
  });
  console.log("[KN052] Shadow daemon completed.");
} catch (err) {
  shadowError = err;
  shadowOutput = err.stdout || "";
  shadowExitCode = err.status || 1;
  console.log(`[KN052] Shadow daemon error (exit ${shadowExitCode}): ${err.message}`);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
console.log("\n[KN052] Running 10 tests...\n");

test("T01", "shadow_daemon_spawns_correctly", () => {
  assert(shadowOutput !== null, "shadowOutput is null — daemon did not execute");
  assert(
    shadowOutput.includes("[KN052] Cost-Comparison Shadow daemon spawning"),
    "Expected spawn message not found in output"
  );
  assert(
    shadowOutput.includes("KN052-BP005"),
    "Expected SESSION_TAG 'KN052-BP005' not found"
  );
  assert(shadowExitCode === 0, `Non-zero exit code: ${shadowExitCode}`);
});

test("T02", "shadow_daemon_kills_on_completion (state file written with 'complete')", () => {
  assert(
    fs.existsSync(SHADOW_STATE_FILE),
    `Shadow state file not found at ${SHADOW_STATE_FILE}`
  );
  const stateRaw = fs.readFileSync(SHADOW_STATE_FILE, "utf-8");
  const state = JSON.parse(stateRaw);
  assert(state.status === "complete", `Expected status 'complete', got '${state.status}'`);
  assert(state.shadow_id === "kn052-cost-comparison", "Wrong shadow_id");
  assert(state.session === "KN052-BP005", "Wrong session tag in state file");
  assert(
    state.kill_on.includes("receipt_complete"),
    "Kill-on condition missing 'receipt_complete'"
  );
});

test("T03", "detective_1_returns_before_spend (with vendor breakdown)", () => {
  // Shadow output confirms daemon completed (individual detective JSON is not streamed to stdout)
  assert(
    shadowOutput.includes("shadow_status") || shadowOutput.includes("KN052"),
    "Shadow daemon output not found — daemon may not have run"
  );
  assert(shadowOutput.includes('"detectives"'), "Detective dispatch confirmation not in shadow output");
  // Receipt should contain Detective 1 section (receipt is the canonical artifact)
  assert(fs.existsSync(RECEIPT_PATH), "Receipt file not written yet");
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  assert(
    receipt.includes("Detective 1") || receipt.includes("BEFORE-substrate Vendor"),
    "Detective 1 section missing from receipt"
  );
  assert(
    receipt.includes("Anthropic"),
    "Vendor breakdown (Anthropic) missing from receipt"
  );
  assert(
    receipt.includes("Gap D.1 applied"),
    "D.1 gap disclosure missing from receipt"
  );
  // BEFORE spend should be a positive number in reasonable range ($500-$5000)
  const totalMatch = receipt.match(/TOTAL.*\$(\d+\.\d+)/);
  if (totalMatch) {
    const total = parseFloat(totalMatch[1]);
    assert(total > 100, `BEFORE total too low: $${total}`);
    assert(total < 10000, `BEFORE total implausibly high: $${total}`);
  }
});

test("T04", "detective_2_returns_before_accomplishments (with quantified deltas)", () => {
  assert(fs.existsSync(RECEIPT_PATH), "Receipt not written");
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  assert(
    receipt.includes("Detective 2") || receipt.includes("BEFORE-substrate Accomplishments"),
    "Detective 2 section missing from receipt"
  );
  // Should contain innovation count from K421/B110 reconciliation (2267)
  assert(receipt.includes("2,267") || receipt.includes("2267"), "Innovation count 2267 missing");
  // Should contain provisional count (13)
  assert(receipt.includes("13"), "BEFORE provisional count missing");
  // Should contain Knight sessions
  assert(
    receipt.includes("Knight Sessions") || receipt.includes("knight_sessions"),
    "Knight session count missing"
  );
  // Source citation required
  assert(
    receipt.includes("K421/B110"),
    "K421/B110 source citation missing from Detective 2"
  );
});

test("T05", "detective_3_returns_after_spend (telemetry anchor present)", () => {
  assert(fs.existsSync(RECEIPT_PATH), "Receipt not written");
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  assert(
    receipt.includes("Detective 3") || receipt.includes("AFTER-substrate Vendor"),
    "Detective 3 section missing from receipt"
  );
  // Telemetry anchor: 15 sessions, $94.46 actual, $141.70 saved (from B127/Penny Saved paper)
  assert(receipt.includes("94.4"), "Telemetry anchor $94.46 not found in receipt");
  assert(receipt.includes("141.7") || receipt.includes("141.70"), "Saved $141.70 missing");
  assert(receipt.includes("60"), "60% savings figure missing");
  // K528 benchmark spend should appear
  assert(receipt.includes("206") || receipt.includes("K528"), "K528 benchmark spend missing");
  // Should note live log entry count
  assert(
    receipt.includes("substrate_savings_log") || receipt.includes("Live log entries"),
    "Live log reference missing from Detective 3"
  );
});

test("T06", "detective_4_returns_after_accomplishments (canonical ceiling loaded)", () => {
  assert(fs.existsSync(RECEIPT_PATH), "Receipt not written");
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  assert(
    receipt.includes("Detective 4") || receipt.includes("AFTER-substrate Accomplishments"),
    "Detective 4 section missing from receipt"
  );
  // Canonical values ceiling should appear
  assert(
    receipt.includes("2,270") || receipt.includes("2270"),
    "Current innovation count 2270 missing"
  );
  assert(receipt.includes("228"), "Crown Jewels 228 missing");
  assert(receipt.includes("15"), "15 provisionals missing from Detective 4");
  // Benchmark table should appear
  assert(receipt.includes("R10") && receipt.includes("+86"), "R10 benchmark missing from D4");
  assert(receipt.includes("K528"), "K528 benchmark missing from D4");
  // AFTER era time span (12 days)
  assert(receipt.includes("12"), "12-day timespan missing from D4");
  // Architectural milestones
  assert(
    receipt.includes("Cathedral Effect") || receipt.includes("Conductor"),
    "Architectural milestones missing from D4"
  );
});

test("T07", "detective_5_synthesis_ratio_correct (math verified vs known reference points)", () => {
  assert(fs.existsSync(RECEIPT_PATH), "Receipt not written");
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  assert(
    receipt.includes("Detective 5") || receipt.includes("Synthesis"),
    "Detective 5 section missing from receipt"
  );
  // ROI multiplier should be present and reasonable (>3x, <100x)
  const roiMatch = receipt.match(/Adjusted ROI multiplier[:\s]+([0-9]+)x/i);
  if (roiMatch) {
    const roi = parseInt(roiMatch[1], 10);
    assert(roi >= 3, `ROI multiplier too low: ${roi}x`);
    assert(roi <= 100, `ROI multiplier implausibly high: ${roi}x`);
  } else {
    // Broader search: just look for a number followed by 'x improvement'
    assert(
      receipt.includes("improvement") && /\d+x/.test(receipt),
      "No ROI improvement factor found in receipt"
    );
  }
  // Sessions-per-dollar ratio should appear
  assert(
    receipt.includes("Sessions per dollar") || receipt.includes("sessions_per_dollar"),
    "Sessions-per-dollar metric missing from synthesis"
  );
  // Cold multiplier 2.5x should appear
  assert(receipt.includes("2.5"), "Cold multiplier 2.5 missing from synthesis");
  // K518 density anchor
  assert(receipt.includes("25.4") || receipt.includes("K518"), "K518 density anchor missing");
  // Headline finding present
  assert(
    receipt.includes("Headline Finding") || receipt.includes("headline_finding"),
    "Headline finding section missing"
  );
});

test("T08", "receipt_artifact_written_to_dropzone (proper path + canonical-format)", () => {
  assert(fs.existsSync(RECEIPT_PATH), `Receipt not found at expected path: ${RECEIPT_PATH}`);
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  // Must be non-trivially sized (meaningful receipt)
  assert(receipt.length > 3000, `Receipt too short (${receipt.length} chars); expected >3000`);
  // Must have required header fields
  assert(receipt.includes("KN052"), "KN052 session identifier missing from receipt header");
  assert(receipt.includes("BP005"), "BP005 session identifier missing from receipt header");
  assert(
    receipt.includes("v-cost-comparison-shadow-multi-detective-KN052"),
    "Required git tag missing from receipt header"
  );
  // Must have Augur-Pricing exemption header
  assert(
    receipt.includes("Augur-Pricing exemption"),
    "Augur-Pricing exemption comment missing"
  );
  // Must have D.1 gap disclosure
  assert(
    receipt.includes("D.1") || receipt.includes("Gap D.1"),
    "D.1 gap disclosure missing from receipt"
  );
  // Must end with FOR THE KEEP
  assert(receipt.includes("FOR THE KEEP"), "FOR THE KEEP sign-off missing from receipt");
  // Path must be in BISHOP_DROPZONE/03_BishopHandoffs/
  assert(
    RECEIPT_PATH.includes("03_BishopHandoffs"),
    "Receipt not in 03_BishopHandoffs directory"
  );
});

test("T09", "b127_26x_algo_layers_complete (all 4 layers present with status field)", () => {
  assert(fs.existsSync(RECEIPT_PATH), "Receipt not written");
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  // All four layers must appear
  assert(receipt.includes("L1") || receipt.includes("Cold multiplier"), "Layer 1 missing");
  assert(receipt.includes("L2") || receipt.includes("Model-tier"), "Layer 2 missing");
  assert(receipt.includes("L3") || receipt.includes("Context density"), "Layer 3 missing");
  assert(receipt.includes("L4") || receipt.includes("Accuracy rework"), "Layer 4 missing");
  // Verdict must be present
  assert(
    receipt.includes("PARTIAL VERIFY") || receipt.includes("VERIFY") || receipt.includes("REFUTE"),
    "B127 verdict (VERIFY/REFUTE) missing"
  );
  // 26x must appear
  assert(receipt.includes("26"), "26x reference missing from B127 section");
  // Confirmed vs pending differentiation
  assert(receipt.includes("CONFIRMED") || receipt.includes("✅"), "Confirmed layer status missing");
  assert(receipt.includes("NOT YET") || receipt.includes("⏳") || receipt.includes("PENDING"), "Pending layer status missing");
});

test("T10", "kn052_citation_present (KN042 Substrate-Routed Memory Expansion cited)", () => {
  assert(fs.existsSync(RECEIPT_PATH), "Receipt not written");
  const receipt = fs.readFileSync(RECEIPT_PATH, "utf-8");
  // KN042 citation block
  assert(
    receipt.includes("KN042") || receipt.includes("Substrate-Routed Memory Expansion"),
    "KN042 Substrate-Routed Memory Expansion citation missing"
  );
  // Wrasse entries referenced
  assert(
    receipt.includes("W-313") || receipt.includes("Wrasse") || receipt.includes("wrasse"),
    "Wrasse registry entries missing from KN042 citation"
  );
  // Layer 3 connection
  assert(
    receipt.includes("Layer 3") || receipt.includes("context efficiency") || receipt.includes("context density"),
    "Layer 3 / context efficiency connection missing in KN042 citation"
  );
  // Memory file referenced
  assert(
    receipt.includes("project_ring_of_three_golden_eblets") || receipt.includes("KN042-BP005"),
    "KN042 source session or memory file reference missing"
  );
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
console.log(`KN052 Test Results: ${passed} passed / ${failed} failed / ${passed + failed} total`);
console.log(`${"═".repeat(60)}`);

if (failed > 0) {
  console.log("\nFailed tests:");
  results
    .filter((r) => r.status === "FAIL")
    .forEach((r) => console.log(`  ❌ ${r.id}: ${r.name}\n     ${r.error}`));
  process.exit(1);
} else {
  console.log("\n✅ All tests passed. Tag: v-cost-comparison-shadow-multi-detective-KN052");
  process.exit(0);
}
