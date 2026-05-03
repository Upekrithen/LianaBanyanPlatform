/**
 * KN-D2 Test Suite — Apiarist Hive Thread-State Lifecycle
 * =========================================================
 * T1: open → synthesizing transition allowed
 * T2: synthesizing → closed transition allowed
 * T3: closed → sealed transition allowed
 * T4: invalid backward transition (sealed → open) rejected
 * T5: synthesis_target Jar ID must be populated before sealed
 * T6: bee_role_assignments per participant correct (Workers/Drones/Queen)
 * T7: ts_closed populated on close transition; ts_sealed on seal
 */

import { test } from "node:test";
import { ok, strictEqual, notStrictEqual } from "node:assert/strict";
import { withStatsCapture } from "../dist/stats_capture/harness.js";
import {
  createHiveThread,
  advanceHiveThread,
  readHiveThread,
} from "../dist/apiarist_hive/state_transitions.js";
import { validateRoleAssignments } from "../dist/apiarist_hive/thread_state.js";

function makeThread(overrides = {}) {
  const participants = ["alice", "bob", "charlie"];
  const bee_role_assignments = { alice: "worker", bob: "drone", charlie: "queen" };
  return {
    topic: `test-thread-${Date.now()}-${Math.random()}`,
    participants,
    bee_role_assignments,
    ...overrides,
  };
}

// T1: open → synthesizing transition
test("T1: open → synthesizing transition allowed", async () => {
  await withStatsCapture(
    { test_id: "knd2-T1", test_file: "test_apiarist_hive_lifecycle_knd2.mjs", k_prompt_source: "KN-D2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 1, assertion_total: 7 });
      const created = createHiveThread(makeThread());
      ok(created.success, "Thread creation should succeed");
      strictEqual(created.thread.state, "open");

      const advanced = advanceHiveThread(created.thread.id, "synthesizing");
      ok(advanced.success, "open → synthesizing must be allowed");
      strictEqual(advanced.thread.state, "synthesizing");
    }
  );
});

// T2: synthesizing → closed transition
test("T2: synthesizing → closed transition allowed", async () => {
  await withStatsCapture(
    { test_id: "knd2-T2", test_file: "test_apiarist_hive_lifecycle_knd2.mjs", k_prompt_source: "KN-D2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 2, assertion_total: 7 });
      const created = createHiveThread(makeThread());
      advanceHiveThread(created.thread.id, "synthesizing");
      const closed = advanceHiveThread(created.thread.id, "closed", {
        synthesis_target: `LB-JAR-${Date.now()}`,
      });
      ok(closed.success, "synthesizing → closed must be allowed");
      strictEqual(closed.thread.state, "closed");
    }
  );
});

// T3: closed → sealed transition
test("T3: closed → sealed transition allowed", async () => {
  await withStatsCapture(
    { test_id: "knd2-T3", test_file: "test_apiarist_hive_lifecycle_knd2.mjs", k_prompt_source: "KN-D2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 3, assertion_total: 7 });
      const created = createHiveThread(makeThread());
      const jar_id = `LB-JAR-${Date.now()}`;
      advanceHiveThread(created.thread.id, "synthesizing");
      advanceHiveThread(created.thread.id, "closed", { synthesis_target: jar_id });
      const sealed = advanceHiveThread(created.thread.id, "sealed");
      ok(sealed.success, "closed → sealed must be allowed");
      strictEqual(sealed.thread.state, "sealed");
    }
  );
});

// T4: invalid backward transition rejected
test("T4: sealed → open backward transition rejected", async () => {
  await withStatsCapture(
    { test_id: "knd2-T4", test_file: "test_apiarist_hive_lifecycle_knd2.mjs", k_prompt_source: "KN-D2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 4, assertion_total: 7 });
      const created = createHiveThread(makeThread());
      const jar_id = `LB-JAR-${Date.now()}`;
      advanceHiveThread(created.thread.id, "synthesizing");
      advanceHiveThread(created.thread.id, "closed", { synthesis_target: jar_id });
      advanceHiveThread(created.thread.id, "sealed");

      const backward = advanceHiveThread(created.thread.id, "open");
      ok(!backward.success, "sealed → open must be rejected");
      ok(backward.error, "Error message required");
      ok(backward.bridle_flag, "BRIDLE flag required on invalid transition");
    }
  );
});

// T5: synthesis_target required before sealed
test("T5: synthesis_target Jar ID required before sealed", async () => {
  await withStatsCapture(
    { test_id: "knd2-T5", test_file: "test_apiarist_hive_lifecycle_knd2.mjs", k_prompt_source: "KN-D2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 5, assertion_total: 7 });
      const created = createHiveThread(makeThread());
      advanceHiveThread(created.thread.id, "synthesizing");
      // Close WITHOUT synthesis_target
      const closed = advanceHiveThread(created.thread.id, "closed");
      ok(closed.success, "Closing without jar_id is allowed at close step");

      // Try to seal without synthesis_target set
      const sealed = advanceHiveThread(created.thread.id, "sealed");
      ok(!sealed.success, "Sealing without synthesis_target must fail");
      ok(sealed.error?.includes("synthesis_target"), "Error must mention synthesis_target");
    }
  );
});

// T6: bee_role_assignments per participant correct
test("T6: bee_role_assignments validation (Workers/Drones/Queen)", async () => {
  await withStatsCapture(
    { test_id: "knd2-T6", test_file: "test_apiarist_hive_lifecycle_knd2.mjs", k_prompt_source: "KN-D2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 6, assertion_total: 7 });

      // Valid: one of each role
      const valid = validateRoleAssignments(
        ["w1", "d1", "q1"],
        { w1: "worker", d1: "drone", q1: "queen" }
      );
      ok(valid.valid, "Valid role assignments should pass");

      // Invalid: two queens
      const twoQueens = validateRoleAssignments(
        ["q1", "q2"],
        { q1: "queen", q2: "queen" }
      );
      ok(!twoQueens.valid, "Two queens must fail validation");

      // Invalid: missing role
      const missing = validateRoleAssignments(
        ["w1", "w2"],
        { w1: "worker" }
      );
      ok(!missing.valid, "Missing role assignment must fail");

      // Thread creation validates roles
      const badThread = createHiveThread({
        topic: "bad-roles",
        participants: ["q1", "q2"],
        bee_role_assignments: { q1: "queen", q2: "queen" },
      });
      ok(!badThread.success, "Thread creation with two queens must fail");
    }
  );
});

// T7: timestamps populated correctly
test("T7: ts_closed populated on close; ts_sealed on seal", async () => {
  await withStatsCapture(
    { test_id: "knd2-T7", test_file: "test_apiarist_hive_lifecycle_knd2.mjs", k_prompt_source: "KN-D2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 7, assertion_total: 7 });
      const created = createHiveThread(makeThread());
      ok(!created.thread.ts_closed, "ts_closed must not exist on open");
      ok(!created.thread.ts_sealed, "ts_sealed must not exist on open");

      advanceHiveThread(created.thread.id, "synthesizing");
      const jar_id = `LB-JAR-${Date.now()}`;
      const closed = advanceHiveThread(created.thread.id, "closed", { synthesis_target: jar_id });
      ok(closed.thread.ts_closed, "ts_closed must be set after close transition");
      ok(!isNaN(Date.parse(closed.thread.ts_closed)), "ts_closed must be valid ISO-8601");

      const sealed = advanceHiveThread(closed.thread.id, "sealed");
      ok(sealed.thread.ts_sealed, "ts_sealed must be set after seal transition");
      ok(!isNaN(Date.parse(sealed.thread.ts_sealed)), "ts_sealed must be valid ISO-8601");
    }
  );
});
