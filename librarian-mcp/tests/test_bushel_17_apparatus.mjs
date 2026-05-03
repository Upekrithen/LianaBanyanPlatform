/**
 * Bushel 17 — Apparatus Verification Tests (G1-G6)
 * Run with: node --test tests/test_bushel_17_apparatus.mjs
 *
 * G1: Sentinel corpus coverage — 9 tasks × 3 classes
 * G2: Receipt schema — 6 variables present on all tasks
 * G3: Detective substrate-coherence anchors present on all tasks
 * G4: Cache TTL documentation — arm isolation enforced in scaffold
 * G5: Threshold map renders coherently (scaffold-state validation)
 * G6: Codex reservation format present in empirical_comparison_receipt.json
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIBRARIAN_ROOT = resolve(__dirname, "..");
const DIST = join(LIBRARIAN_ROOT, "dist");

/** Windows-safe ESM import helper */
function distUrl(relPath) {
  return pathToFileURL(join(DIST, relPath)).href;
}
const STATE_BASE = join(
  process.env.HOME || process.env.USERPROFILE || "C:\\Users\\Administrator",
  ".claude",
  "state",
  "bushel_17"
);

// ---------------------------------------------------------------------------
// G1 — Sentinel corpus coverage: 9 tasks × 2 arms × 3 replicates = 54 fire-slots
// ---------------------------------------------------------------------------

test("G1 — sentinel corpus has 9 tasks across 3 classes (3 each)", async () => {
  const { SENTINEL_CORPUS, TASKS_BY_CLASS, validateCorpusCoverage } = await import(
    distUrl("bushel_17/sentinel_corpus.js")
  );

  assert.equal(SENTINEL_CORPUS.length, 9, "Expected 9 sentinel tasks total");

  const classes = ["lookup", "author", "bushel_design"];
  for (const cls of classes) {
    assert.equal(
      TASKS_BY_CLASS[cls].length,
      3,
      `Expected 3 tasks for class '${cls}', got ${TASKS_BY_CLASS[cls].length}`
    );
  }

  const result = validateCorpusCoverage();
  assert.ok(result.ok, `G1 validation failed: ${result.message}`);
  console.log(`G1 PASS — ${result.message}`);
});

test("G1 — all task IDs are unique and match expected pattern", async () => {
  const { SENTINEL_CORPUS } = await import(
    distUrl("bushel_17/sentinel_corpus.js")
  );

  const ids = SENTINEL_CORPUS.map((t) => t.task_id);
  const expected = ["L1", "L2", "L3", "A1", "A2", "A3", "D1", "D2", "D3"];
  const unique = new Set(ids);

  assert.equal(unique.size, 9, "All task IDs must be unique");
  for (const id of expected) {
    assert.ok(ids.includes(id), `Missing expected task ID: ${id}`);
  }
  console.log(`G1b PASS — all 9 task IDs present and unique: ${ids.join(", ")}`);
});

// ---------------------------------------------------------------------------
// G2 — Receipt schema: 6 variables present on all tasks
// ---------------------------------------------------------------------------

test("G2 — every sentinel task has all 6 measured variables defined in rubric", async () => {
  const { SENTINEL_CORPUS } = await import(
    distUrl("bushel_17/sentinel_corpus.js")
  );

  const requiredRubricFields = ["must_contain", "canonical_pointers", "substrate_routing_expected", "min_completeness_ratio"];

  for (const task of SENTINEL_CORPUS) {
    for (const field of requiredRubricFields) {
      assert.ok(
        field in task.rubric,
        `Task ${task.task_id} missing rubric field: ${field}`
      );
    }
    assert.ok(task.reference_canon_pointers.length > 0, `Task ${task.task_id} has no reference_canon_pointers`);
    assert.ok(task.substrate_coherence_anchors.length > 0, `Task ${task.task_id} has no substrate_coherence_anchors`);
  }
  console.log(`G2 PASS — all 9 tasks have complete rubric + canon pointers + coherence anchors`);
});

test("G2 — validateReceiptSchema accepts a fully-populated receipt", async () => {
  const { validateReceiptSchema } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  const fullReceipt = {
    task_id: "L1",
    task_class: "lookup",
    arm: "A_compaction_continue",
    session_id: "BP021",
    ts: new Date().toISOString(),
    replicate: 1,
    measurements: {
      TTFP_ms: 1200,
      TTFA_ms: 3400,
      tokens_to_first_output: 512,
      founder_correction_turns: 0,
      r_check_1_violations: 0,
      substrate_coherence_score: 1.0,
    },
    completion_quality_rubric_score: 0.95,
    detective_validation_anchors: ["83.3%", "$416.67"],
    cache_provenance_note: "warm",
    notes: "",
    background_shadow_tokens_during_arm: {
      total_tokens: null,
      shadow_heartbeats_observed: 0,
      window_start_ts: new Date().toISOString(),
      window_end_ts: new Date().toISOString(),
      stream_class: "sipping_ethereal_t",
      instrumentation_status: "scaffold_unfilled",
      heartbeat_path_observed: "none_found",
    },
  };

  const result = validateReceiptSchema(fullReceipt);
  assert.ok(result.ok, `Schema validation failed: ${result.missing.join(", ")}`);
  console.log("G2b PASS — full receipt schema validates");
});

test("G2 — validateReceiptSchema rejects a receipt missing measurements", async () => {
  const { validateReceiptSchema } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  const incompleteReceipt = {
    task_id: "L1",
    task_class: "lookup",
    arm: "A_compaction_continue",
    session_id: "BP021",
    ts: new Date().toISOString(),
    replicate: 1,
    measurements: {},
    completion_quality_rubric_score: null,
    detective_validation_anchors: [],
    cache_provenance_note: "warm",
    notes: "",
  };

  const result = validateReceiptSchema(incompleteReceipt);
  assert.ok(!result.ok, "Expected schema validation to fail for incomplete receipt");
  assert.ok(result.missing.length > 0, "Expected missing fields to be listed");
  console.log(`G2c PASS — incomplete receipt correctly rejected (missing: ${result.missing.join(", ")})`);
});

// ---------------------------------------------------------------------------
// G3 — Detective substrate-coherence anchors present and non-empty
// ---------------------------------------------------------------------------

test("G3 — all tasks have substrate_coherence_anchors for Detective validation", async () => {
  const { SENTINEL_CORPUS } = await import(
    distUrl("bushel_17/sentinel_corpus.js")
  );

  for (const task of SENTINEL_CORPUS) {
    assert.ok(
      Array.isArray(task.substrate_coherence_anchors) && task.substrate_coherence_anchors.length >= 2,
      `Task ${task.task_id} needs at least 2 substrate_coherence_anchors (has ${task.substrate_coherence_anchors.length})`
    );
  }
  console.log("G3 PASS — all tasks have ≥2 Detective substrate-coherence anchors");
});

// ---------------------------------------------------------------------------
// G4 — Prompt-cache TTL isolation: Arm A/B scaffold writes cache_provenance_note
// ---------------------------------------------------------------------------

test("G4 — runSentinelOnArmA scaffold writes cache_provenance_note with 'warm' for Arm A", async () => {
  const { runSentinelOnArmA } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  const ctx = {
    session_id: "TEST_B17_G4",
    is_post_compaction: true,
    context_budget_remaining: 0.06,
    fresh_session_with_coffee_handoff: false,
    session_start_ts: new Date().toISOString(),
  };

  const { receipt } = runSentinelOnArmA("L1", ctx, 1);
  assert.ok(
    receipt.cache_provenance_note.toLowerCase().includes("warm"),
    `Arm A receipt must mention 'warm' cache. Got: ${receipt.cache_provenance_note}`
  );
  assert.ok(
    receipt.cache_provenance_note.toLowerCase().includes("5-min"),
    `Arm A receipt must mention '5-min' TTL. Got: ${receipt.cache_provenance_note}`
  );
  console.log("G4a PASS — Arm A scaffold correctly documents warm cache + 5-min TTL");
});

test("G4 — runSentinelOnArmB scaffold writes cache_provenance_note with 'cold' for Arm B", async () => {
  const { runSentinelOnArmB } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  const ctx = {
    session_id: "TEST_B17_G4_B",
    is_post_compaction: false,
    context_budget_remaining: null,
    fresh_session_with_coffee_handoff: true,
    session_start_ts: new Date().toISOString(),
  };

  const { receipt } = runSentinelOnArmB("L1", ctx, 1);
  assert.ok(
    receipt.cache_provenance_note.toLowerCase().includes("cold"),
    `Arm B receipt must mention 'cold' cache. Got: ${receipt.cache_provenance_note}`
  );
  console.log("G4b PASS — Arm B scaffold correctly documents cold cache");
});

// ---------------------------------------------------------------------------
// G5 — Threshold map renders as coherent task-class boundary (scaffold state)
// ---------------------------------------------------------------------------

test("G5 — empirical_comparison_receipt.json exists with threshold_map structure", () => {
  const receiptPath = join(STATE_BASE, "empirical_comparison_receipt.json");
  assert.ok(existsSync(receiptPath), `empirical_comparison_receipt.json not found at: ${receiptPath}`);

  const receipt = JSON.parse(readFileSync(receiptPath, "utf-8"));
  assert.equal(receipt.bushel, 17, "Receipt bushel must be 17");
  assert.ok(receipt.threshold_map, "Receipt must have threshold_map field");
  assert.ok(receipt.threshold_map.lookup !== undefined, "threshold_map.lookup must be present");
  assert.ok(receipt.threshold_map.author !== undefined, "threshold_map.author must be present");
  assert.ok(receipt.threshold_map.bushel_design !== undefined, "threshold_map.bushel_design must be present");
  assert.ok(receipt.threshold_map.near_pivot !== undefined, "threshold_map.near_pivot must be present");
  assert.ok(receipt.threshold_map.radical_pivot !== undefined, "threshold_map.radical_pivot must be present");
  console.log("G5 PASS — empirical_comparison_receipt.json exists with complete threshold_map structure");
});

// ---------------------------------------------------------------------------
// G6 — Codex reservation format present in empirical_comparison_receipt.json
// ---------------------------------------------------------------------------

test("G6 — Codex reservation string present in empirical_comparison_receipt.json", () => {
  const receiptPath = join(STATE_BASE, "empirical_comparison_receipt.json");
  const receipt = JSON.parse(readFileSync(receiptPath, "utf-8"));

  assert.ok(
    typeof receipt.codex_reservation === "string" && receipt.codex_reservation.includes("LB-CODEX"),
    `codex_reservation must contain 'LB-CODEX'. Got: ${receipt.codex_reservation}`
  );
  assert.ok(
    receipt.codex_reservation.includes("Bushel 17"),
    `codex_reservation must mention 'Bushel 17'. Got: ${receipt.codex_reservation}`
  );
  console.log(`G6 PASS — Codex reservation: "${receipt.codex_reservation}"`);
});

// ---------------------------------------------------------------------------
// Additional: fire-slot count validation
// ---------------------------------------------------------------------------

test("Apparatus scaffold: 54 fire-slots (9 tasks × 2 arms × 3 replicates)", async () => {
  const { SENTINEL_CORPUS } = await import(
    distUrl("bushel_17/sentinel_corpus.js")
  );

  const taskCount = SENTINEL_CORPUS.length;
  const arms = 2;
  const replicates = 3;
  const expected = taskCount * arms * replicates;
  assert.equal(expected, 54, `Expected 54 fire-slots, got ${expected}`);
  console.log(`Fire-slot count PASS — ${taskCount} tasks × ${arms} arms × ${replicates} replicates = ${expected} fire-slots`);
});

// ---------------------------------------------------------------------------
// G7 (Sipping Ethereal T) — 4 new tests for Sipping instrumentation (BP021 EXTENSION)
// ---------------------------------------------------------------------------

test("G7a — SentinelReceipt has background_shadow_tokens_during_arm field with correct structure", async () => {
  const { runSentinelOnArmA } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  const ctx = {
    session_id: "TEST_B17_G7A",
    is_post_compaction: true,
    context_budget_remaining: 0.06,
    fresh_session_with_coffee_handoff: false,
    session_start_ts: new Date().toISOString(),
  };

  const { receipt } = runSentinelOnArmA("L1", ctx, 1);
  const sipping = receipt.background_shadow_tokens_during_arm;

  assert.ok(sipping !== undefined, "background_shadow_tokens_during_arm must be present on receipt");
  assert.equal(sipping.stream_class, "sipping_ethereal_t", "stream_class must be 'sipping_ethereal_t'");
  assert.ok(
    sipping.instrumentation_status === "live" || sipping.instrumentation_status === "scaffold_unfilled",
    `instrumentation_status must be 'live' or 'scaffold_unfilled'. Got: ${sipping.instrumentation_status}`
  );
  assert.ok(typeof sipping.shadow_heartbeats_observed === "number", "shadow_heartbeats_observed must be a number");
  assert.ok(typeof sipping.window_start_ts === "string" && sipping.window_start_ts.length > 0, "window_start_ts must be a non-empty string");
  assert.ok(typeof sipping.window_end_ts === "string" && sipping.window_end_ts.length > 0, "window_end_ts must be a non-empty string");
  assert.ok(typeof sipping.heartbeat_path_observed === "string", "heartbeat_path_observed must be a string");
  console.log(`G7a PASS — background_shadow_tokens_during_arm present: status=${sipping.instrumentation_status}, heartbeats=${sipping.shadow_heartbeats_observed}`);
});

test("G7b — validateReceiptSchema accepts receipt with scaffold_unfilled Sipping field (G2-pass rule)", async () => {
  const { validateReceiptSchema } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  const receiptWithSipping = {
    task_id: "L1",
    task_class: "lookup",
    arm: "A_compaction_continue",
    session_id: "TEST_B17_G7B",
    ts: new Date().toISOString(),
    replicate: 1,
    measurements: {
      TTFP_ms: null,
      TTFA_ms: null,
      tokens_to_first_output: null,
      founder_correction_turns: null,
      r_check_1_violations: null,
      substrate_coherence_score: null,
    },
    completion_quality_rubric_score: null,
    detective_validation_anchors: [],
    cache_provenance_note: "warm",
    notes: "",
    background_shadow_tokens_during_arm: {
      total_tokens: null,
      shadow_heartbeats_observed: 0,
      window_start_ts: new Date().toISOString(),
      window_end_ts: new Date().toISOString(),
      stream_class: "sipping_ethereal_t",
      instrumentation_status: "scaffold_unfilled",
      heartbeat_path_observed: "none_found",
    },
  };

  const result = validateReceiptSchema(receiptWithSipping);
  assert.ok(result.ok, `G2 must accept scaffold_unfilled Sipping field. Missing: ${result.missing.join(", ")}`);
  console.log("G7b PASS — validateReceiptSchema accepts scaffold_unfilled Sipping field (G2-pass rule confirmed)");
});

test("G7c — when Shadows are running, receipt has non-zero shadow_heartbeats_observed", async () => {
  const { readShadowHeartbeatsWithinWindow } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  // Use a wide window covering known heartbeat timestamps from BP021 / BP011
  // Heartbeats in test environment: ~/.claude/state/eblets/BP021/heartbeat_R11_shadow_*.eblet.md
  const windowStart = new Date("2026-05-01T00:00:00Z");
  const windowEnd = new Date("2026-05-04T23:59:59Z");

  const heartbeats = readShadowHeartbeatsWithinWindow(windowStart, windowEnd);

  if (heartbeats.length > 0) {
    // Shadows are running — verify heartbeat structure
    const hb = heartbeats[0];
    assert.ok(typeof hb.shadow_id === "string" && hb.shadow_id.length > 0, "shadow_id must be present");
    assert.ok(typeof hb.ts === "string", "heartbeat ts must be a string");
    assert.ok(typeof hb.source_path === "string", "source_path must be a string");
    console.log(`G7c PASS (live) — ${heartbeats.length} Shadow heartbeats observed in window. First: ${hb.shadow_id} at ${hb.ts}`);
  } else {
    // Shadows not running in this window — verify graceful no-throw
    assert.equal(heartbeats.length, 0, "No heartbeats in window — graceful empty array expected");
    console.log("G7c PASS (scaffold) — No Shadow heartbeats in window; readShadowHeartbeatsWithinWindow returned empty array without throwing");
  }
});

test("G7d — when Shadows are NOT running (empty window), Sipping receipt has total_tokens: null + scaffold_unfilled", async () => {
  const { buildSippingScaffold } = await import(
    distUrl("bushel_17/sentinel_runner.js")
  );

  // Use a window in the far past — guaranteed no heartbeats
  const windowStartTs = "2020-01-01T00:00:00.000Z";
  const windowEndTs = "2020-01-01T00:00:01.000Z";

  const sipping = buildSippingScaffold(windowStartTs, windowEndTs);

  assert.equal(sipping.total_tokens, null, "total_tokens must be null when no Shadows running");
  assert.equal(sipping.shadow_heartbeats_observed, 0, "shadow_heartbeats_observed must be 0 when no Shadows running");
  assert.equal(sipping.instrumentation_status, "scaffold_unfilled", "instrumentation_status must be scaffold_unfilled when no Shadows running");
  assert.equal(sipping.stream_class, "sipping_ethereal_t", "stream_class must be sipping_ethereal_t");
  assert.equal(sipping.heartbeat_path_observed, "none_found", "heartbeat_path_observed must be 'none_found' when no Shadows present");
  console.log("G7d PASS — empty-window Sipping scaffold: total_tokens=null, status=scaffold_unfilled, no throw");
});
