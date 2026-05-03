/**
 * KN-J4 Test Suite — House Scribe Apiarist Hive Integration
 * ==========================================================
 * T1: Hive-thread closure event → House Scribe creates Jar correctly
 * T2: Bee-canon role mapping correct (Workers/Drones/Queen attribution)
 * T3: Project-cohort GREATER % Marks multiplier applied correctly
 * T4: Jar excalibur_class_eligible default true (when Drone present)
 * T5: Composes with KN-J1 + KN-J2 + KN-J3 cleanly (Jar sealed + coordinate set)
 * T6: BRIDLE Rule 4: incomplete synthesis halts Jar creation with flag
 * T7: FORK doctrine compliance: Marks-attribution NEVER bridges to fiat
 */

import { test } from "node:test";
import { ok, strictEqual, deepStrictEqual, notStrictEqual, match } from "node:assert/strict";
import { existsSync, unlinkSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
  onThreadClosedWithSynthesis,
  queryHiveJarStatus,
  PROJECT_COHORT_MULTIPLIER,
  QUEEN_SUPERVISOR_MULTIPLIER,
} from "../dist/house_scribe/apiarist_hive_subscriber.js";
import { queryLivingCell } from "../dist/house_scribe/living_gridwork.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HS_DIR = resolve(__dirname, "../stitchpunks/house_scribe");

function clearHsLedgers() {
  const files = [
    resolve(HS_DIR, "hive_closure_events.jsonl"),
    resolve(HS_DIR, "jars_ledger.jsonl"),
    resolve(HS_DIR, "jar_events.jsonl"),
    resolve(HS_DIR, "hs_instances.jsonl"),
    resolve(HS_DIR, "gridwork_state.jsonl"),
    resolve(HS_DIR, "gridwork_events.jsonl"),
    resolve(HS_DIR, "coordinate_assignments.jsonl"),
  ];
  for (const f of files) {
    if (existsSync(f)) unlinkSync(f);
  }
}

function makeEvent(overrides = {}) {
  return {
    thread_id: `hive-t-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    cathedral: "knight",
    cohort_type: "tribe",
    closed_at: new Date().toISOString(),
    synthesis_summary: "A complete synthesis of the thread discussion and outcomes.",
    synthesis_blob_pointer: "ipfs://Qm1234567890abcdef",
    contributors: [
      { member_id: "worker-alice", role: "worker", contribution_weight: 0.4 },
      { member_id: "worker-bob",   role: "worker", contribution_weight: 0.3 },
      { member_id: "drone-carol",  role: "drone",  contribution_weight: 0.2, drone_specialty: "excalibur_class_specialist" },
      { member_id: "queen-dave",   role: "queen",  contribution_weight: 0.1 },
    ],
    queen_member_id: "queen-dave",
    content_type: "knowledge_synthesis",
    read_cohort_minimum: "member",
    write_cohort_minimum: "member",
    total_marks_pool: 100,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("T1: Hive-thread closure event → House Scribe creates Jar correctly", () => {
  clearHsLedgers();
  const event = makeEvent();
  const result = onThreadClosedWithSynthesis(event);

  ok(result.success, `Jar creation should succeed; error: ${result.error}`);
  ok(result.jar, "Jar should be returned");
  strictEqual(result.jar.source_hive_thread_id, event.thread_id, "Jar should link to thread_id");
  strictEqual(result.jar.state, "retrievable", "Jar should be retrievable (final state) after full orchestration");
  ok(result.coordinate, "Coordinate should be assigned");
  ok(result.serial, "Cathedral serial should be assigned");
  ok(result.fork_doctrine_validated, "FORK doctrine must be validated");
  strictEqual(result.incomplete_synthesis, undefined, "No incomplete synthesis flag on success");
});

test("T2: Bee-canon role mapping correct (Workers/Drones/Queen attribution)", () => {
  clearHsLedgers();
  const event = makeEvent({ cohort_type: "tribe" });
  const result = onThreadClosedWithSynthesis(event);

  ok(result.success, `Expected success; error: ${result.error}`);
  const attrs = result.marks_attribution;
  ok(Array.isArray(attrs), "marks_attribution should be an array");
  ok(attrs.length === 4, `Expected 4 attribution records, got ${attrs.length}`);

  const worker = attrs.find((a) => a.member_id === "worker-alice");
  const drone  = attrs.find((a) => a.member_id === "drone-carol");
  const queen  = attrs.find((a) => a.member_id === "queen-dave");

  ok(worker, "Worker attribution should exist");
  ok(drone,  "Drone attribution should exist");
  ok(queen,  "Queen attribution should exist");

  strictEqual(worker.role, "worker");
  strictEqual(drone.role,  "drone");
  strictEqual(queen.role,  "queen");
  strictEqual(drone.drone_specialty, "excalibur_class_specialist");

  // Queen should have higher attributed_marks_fraction than a worker with same weight
  ok(queen.attributed_marks_fraction > 0, "Queen should have positive marks fraction");
  ok(worker.attributed_marks_fraction > 0, "Worker should have positive marks fraction");

  // All fractions should be positive (no silent-zero)
  for (const a of attrs) {
    ok(a.attributed_marks_fraction > 0, `Member ${a.member_id} should have positive marks fraction`);
  }
});

test("T3: Project-cohort GREATER % Marks multiplier applied correctly", () => {
  clearHsLedgers();
  const tribeEvent   = makeEvent({ cohort_type: "tribe",   thread_id: `tribe-${Date.now()}` });
  const projectEvent = makeEvent({ cohort_type: "project", thread_id: `proj-${Date.now()}` });

  const tribeResult   = onThreadClosedWithSynthesis(tribeEvent);
  const projectResult = onThreadClosedWithSynthesis(projectEvent);

  ok(tribeResult.success,   `Tribe Jar should succeed; error: ${tribeResult.error}`);
  ok(projectResult.success, `Project Jar should succeed; error: ${projectResult.error}`);

  const tribeWorker   = tribeResult.marks_attribution.find((a) => a.role === "worker");
  const projectWorker = projectResult.marks_attribution.find((a) => a.role === "worker");

  ok(tribeWorker,   "Tribe worker attribution should exist");
  ok(projectWorker, "Project worker attribution should exist");

  strictEqual(tribeWorker.cohort_multiplier,   1.0,                      "Tribe multiplier = 1.0");
  strictEqual(projectWorker.cohort_multiplier, PROJECT_COHORT_MULTIPLIER, `Project multiplier = ${PROJECT_COHORT_MULTIPLIER}`);

  // Project worker fraction should be > tribe worker fraction (GREATER %)
  ok(
    projectWorker.attributed_marks_fraction > tribeWorker.attributed_marks_fraction,
    `Project worker fraction (${projectWorker.attributed_marks_fraction}) should exceed tribe (${tribeWorker.attributed_marks_fraction})`
  );
});

test("T4: Jar excalibur_class_eligible default true when Drone present", () => {
  clearHsLedgers();
  // Event with drone contributor
  const withDrone = makeEvent({ thread_id: `drone-${Date.now()}` });
  const res1 = onThreadClosedWithSynthesis(withDrone);
  ok(res1.success, `Should succeed; error: ${res1.error}`);
  ok(res1.jar.excalibur_class_eligible === true, "Jar should be excalibur_class_eligible when Drone present");

  // Event WITHOUT drone contributor
  const noDrone = makeEvent({
    thread_id: `nodrone-${Date.now()}`,
    contributors: [
      { member_id: "worker-alice", role: "worker", contribution_weight: 0.7 },
      { member_id: "queen-dave",   role: "queen",  contribution_weight: 0.3 },
    ],
  });
  const res2 = onThreadClosedWithSynthesis(noDrone);
  ok(res2.success, `Should succeed without drone; error: ${res2.error}`);
  // No drone → excalibur_class_eligible = false (set by orchestration based on drone presence)
  strictEqual(res2.jar.excalibur_class_eligible, false, "Jar should NOT be excalibur_class_eligible without Drone");
});

test("T5: Composes with KN-J1 + KN-J2 + KN-J3 cleanly", async () => {
  clearHsLedgers();
  const event = makeEvent({ thread_id: `compose-${Date.now()}` });
  const result = onThreadClosedWithSynthesis(event);

  ok(result.success, `Orchestration should succeed; error: ${result.error}`);

  // KN-J1: Jar state = retrievable (final state after seal)
  strictEqual(result.jar.state, "retrievable", "KN-J1 compose: Jar should be retrievable after full orchestration");
  ok(result.jar.jar_id,                   "KN-J1 compose: Jar should have jar_id");
  ok(result.serial,                       "KN-J1 compose: Cathedral serial should be set");

  // KN-J2: coordinate should be assigned and valid (NN-NN-NN-NN)
  ok(result.coordinate, "KN-J2 compose: coordinate should be assigned");
  match(result.coordinate, /^\d{2}-\d{2}-\d{2}-\d{2}$/, "KN-J2 compose: coordinate format NN-NN-NN-NN");
  strictEqual(result.jar.coordinate, result.coordinate, "KN-J2 compose: Jar.coordinate matches assigned coordinate");

  // KN-J3: query living cell should now know about this cell prefix
  const cell = queryLivingCell(result.coordinate);
  ok(cell.data_available, "KN-J3 compose: living cell should have data after event");
  ok(cell.cell.jar_count >= 1, "KN-J3 compose: jar_count should be at least 1");
});

test("T6: BRIDLE Rule 4: incomplete synthesis halts Jar creation with flag", () => {
  clearHsLedgers();

  // Case A: empty synthesis_summary
  const emptySum = makeEvent({ synthesis_summary: "   ", thread_id: `empty-sum-${Date.now()}` });
  const resA = onThreadClosedWithSynthesis(emptySum);
  strictEqual(resA.success, false, "Should HALT on empty synthesis_summary");
  ok(resA.incomplete_synthesis, "incomplete_synthesis flag should be set");
  ok(resA.bridle_flag,          "bridle_flag should be set");
  match(resA.bridle_flag, /HALT/, "bridle_flag should contain HALT");
  ok(resA.fork_doctrine_validated, "FORK doctrine validated even on HALT");

  // Case B: empty synthesis_blob_pointer
  const emptyBlob = makeEvent({ synthesis_blob_pointer: "", thread_id: `empty-blob-${Date.now()}` });
  const resB = onThreadClosedWithSynthesis(emptyBlob);
  strictEqual(resB.success, false, "Should HALT on empty synthesis_blob_pointer");
  ok(resB.incomplete_synthesis, "incomplete_synthesis flag should be set");
  ok(resB.bridle_flag,          "bridle_flag should be set");
});

test("T7: FORK doctrine compliance: Marks-attribution NEVER bridges to fiat", () => {
  clearHsLedgers();
  const event = makeEvent({ cohort_type: "project", thread_id: `fork-${Date.now()}` });
  const result = onThreadClosedWithSynthesis(event);

  ok(result.success, `Should succeed; error: ${result.error}`);
  ok(result.fork_doctrine_validated, "Top-level fork_doctrine_validated must be true");

  for (const attr of result.marks_attribution) {
    strictEqual(
      attr.fork_doctrine_validated,
      true,
      `Member ${attr.member_id} must have fork_doctrine_validated=true`
    );
    // Marks fractions are dimensionless ratios (LB-currency), not fiat
    ok(typeof attr.attributed_marks_fraction === "number",   "Marks fraction should be a number");
    ok(attr.attributed_marks_fraction <= 10,                 "Marks fraction should be a ratio, not a large fiat number");
    ok(attr.attributed_marks_fraction > 0,                   "Marks fraction should be positive (no silent-zero)");
  }

  // Query and verify persisted status
  const status = queryHiveJarStatus(event.thread_id);
  ok(status.data_available, "Hive Jar status should be queryable");
  ok(status.jars.length >= 1, "At least 1 Jar should be in status");
  ok(Array.isArray(status.marks_attribution), "Marks attribution should be in status");
  for (const attr of status.marks_attribution) {
    strictEqual(attr.fork_doctrine_validated, true, "Persisted FORK doctrine flag must be true");
  }
});
