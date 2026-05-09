/**
 * Drekaskip Wave Generator — Test Suite (Bushel 61A)
 * Tests all 12 G-gates (BP032 G1-G9 + BP034 G10-G12).
 *
 * Run: node --test tests/drekaskip/test_b61a.mjs
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

// Dynamic imports from compiled dist
const { dispatchWave, getWave, getWaveStatus, getActivitySummary, initWaveGenerator } =
  await import("../../dist/drekaskip/wave_generator.js");
const { computeReceipt } = await import("../../dist/drekaskip/fan_in_synthesizer.js");
const { createAxisState } = await import("../../dist/drekaskip/beat_coordinator.js");
const { generateWaveId } = await import("../../dist/drekaskip/saga_registry.js");
const { tool_wave_dispatch, tool_saga_query, tool_saga_list } =
  await import("../../dist/drekaskip/mcp_tools.js");

/** G1 — K30 Instance Reuse */
describe("G1 — K30 Instance Reuse", () => {
  test("wave_generator imports K30 commit 03e6337 config constants", async () => {
    // The Wave Generator must reference K30's commit in its receipt
    const result = await tool_wave_dispatch({
      saga_id: "Saga-Test-G1",
      axes: ["research", "build", "discovery"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    assert.ok(result.wave_id.startsWith("WaveRider-"), "wave_id follows LB-STACK-0196 naming");

    // Wait for completion
    await new Promise(r => setTimeout(r, 2000));

    const wave = getWave(result.wave_id);
    assert.ok(wave, "wave persisted");
    assert.ok(wave.receipt, "receipt generated");
    assert.equal(wave.receipt.k30_commit_ref, "03e6337", "K30 commit ref present");
    assert.equal(wave.receipt.k30_config.discard_threshold, "Infinity", "discard_threshold=Infinity");
    assert.equal(wave.receipt.k30_config.merge_policy, "fan_in_synthesize", "merge_policy correct");
  });
});

/** G2 — Wave-Generator-API Endpoints */
describe("G2 — Wave-Generator-API Endpoints", () => {
  test("tool_wave_dispatch returns wave_id + saga_id + budget", async () => {
    const result = await tool_wave_dispatch({
      saga_id: "Saga-Test-G2",
      axes: ["research", "build"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    assert.ok(result.wave_id, "wave_id returned");
    assert.equal(result.saga_id, "Saga-Test-G2", "saga_id returned");
    assert.match(result.status, /pending|running|complete/, "valid status");
  });

  test("getWaveStatus returns K30 branch states", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G2b",
      axes: ["research", "synthesis"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    const status = getWaveStatus(dispatch.wave_id);
    assert.ok(status, "status returned");
    assert.equal(status.wave_id, dispatch.wave_id, "wave_id matches");
    assert.ok(Array.isArray(status.axes), "axes array present");
    assert.ok(status.axes.length >= 2, "axes populated");
  });
});

/** G3 — Beat-Offset Coordination */
describe("G3 — Beat-Offset Coordination", () => {
  test("each axis has triad (3 SEG instances) per Skulk B36 P3 spec", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G3",
      axes: ["research", "build", "discovery"],
      budget: { max_segs: 12, timeout_s: 5 },
      beat_offset_ms: 50,
    });

    await new Promise(r => setTimeout(r, 1500));
    const wave = getWave(dispatch.wave_id);
    assert.ok(wave, "wave exists");
    for (const axis of wave.axes) {
      assert.equal(axis.triad_segs.length, 3, `axis ${axis.axis_name} has triad (3 SEGs)`);
    }
  });
});

/** G4 — Fan-In Synthesis */
describe("G4 — Fan-In Synthesis", () => {
  test("fan-in aggregates all axes — no axis discarded", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G4",
      axes: ["research", "build", "discovery", "synthesis"],
      budget: { max_segs: 12, timeout_s: 5 },
    });

    await new Promise(r => setTimeout(r, 2000));
    const wave = getWave(dispatch.wave_id);
    assert.ok(wave?.synthesis, "synthesis artifact generated");
    assert.ok(wave.synthesis.includes("Wave Synthesis"), "synthesis is consolidated markdown");
    // All 4 axes must appear (fan_in_synthesize — no discard)
    for (const axisName of ["research", "build", "discovery", "synthesis"]) {
      assert.ok(wave.synthesis.includes(axisName), `axis ${axisName} included in synthesis`);
    }
  });
});

/** G5 — Budget Enforcement */
describe("G5 — Budget Enforcement", () => {
  test("wave aborts when max_segs exceeded", async () => {
    // 4 axes × 3 SEGs = 12; set max_segs=6 to trigger budget exceeded
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G5",
      axes: ["research", "build", "discovery", "synthesis"],
      budget: { max_segs: 6, timeout_s: 5 },
    });
    assert.equal(dispatch.status, "aborted", "wave aborted on budget exceeded");
    assert.ok(dispatch.message.includes("budget exceeded"), "message describes reason");
  });
});

/** G6 — Empirical Receipt */
describe("G6 — Empirical Receipt", () => {
  test("receipt includes t_wave_ms, t_serial_est_ms, speedup_ratio", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G6",
      axes: ["research", "build", "discovery"],
      budget: { max_segs: 12, timeout_s: 5 },
    });

    await new Promise(r => setTimeout(r, 2000));
    const wave = getWave(dispatch.wave_id);
    assert.ok(wave?.receipt, "receipt present");
    assert.ok(typeof wave.receipt.t_wave_ms === "number", "t_wave_ms numeric");
    assert.ok(typeof wave.receipt.t_serial_est_ms === "number", "t_serial_est_ms numeric");
    assert.ok(typeof wave.receipt.speedup_ratio === "number", "speedup_ratio numeric");
    assert.equal(wave.receipt.axes_count, 3, "axes_count matches");
    assert.ok(wave.receipt.segs_fired > 0, "segs_fired > 0");
  });
});

/** G7 — Triad Geometry Per Axis */
describe("G7 — Triad Geometry Per Axis", () => {
  test("each axis has exactly 3 SEG slots (triad) + axis-level metadata", async () => {
    const axis = createAxisState("test-axis", "wave-test");
    assert.equal(axis.triad_segs.length, 3, "triad has 3 SEGs");
    assert.equal(axis.axis_name, "test-axis", "axis_name set");
    for (const [i, seg] of axis.triad_segs.entries()) {
      assert.equal(seg.triad_slot, i, `triad slot ${i} correct`);
      assert.equal(seg.axis_name, "test-axis", "seg knows its axis");
    }
  });
});

/** G8 — Cross-Reference K30 Commit */
describe("G8 — Cross-Reference K30 Commit", () => {
  test("receipt carries k30_commit_ref 03e6337", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G8",
      axes: ["research", "build", "discovery"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    await new Promise(r => setTimeout(r, 2000));
    const wave = getWave(dispatch.wave_id);
    assert.equal(wave?.receipt?.k30_commit_ref, "03e6337", "K30 commit ref confirmed");
  });
});

/** G9 — K30 §10 Dependent Claim Confirmation */
describe("G9 — K30 §10 Dependent Claim Confirmation", () => {
  test("speedup_ratio < 1.0 for ≥3 axes (wall-time < serial estimate)", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G9",
      axes: ["research", "build", "discovery", "synthesis"],
      budget: { max_segs: 12, timeout_s: 10 },
    });
    await new Promise(r => setTimeout(r, 3000));
    const wave = getWave(dispatch.wave_id);
    assert.ok(wave?.receipt, "receipt present");
    assert.ok(wave.receipt.speedup_ratio < 1.0, `speedup_ratio=${wave.receipt.speedup_ratio} < 1.0 (K30 §10 confirmed)`);
    assert.ok(wave.receipt.k30_claim_confirmed, "k30_claim_confirmed=true");
  });
});

/** G10 — T4 Production-Class (daemon start + crash recovery) */
describe("G10 — T4 Production-Class", () => {
  test("initWaveGenerator loads persisted waves (crash-recovery)", () => {
    // Should not throw
    assert.doesNotThrow(() => initWaveGenerator(), "crash-recovery init runs cleanly");
  });

  test("getActivitySummary returns production health data", async () => {
    const summary = getActivitySummary();
    assert.ok(typeof summary.total_waves === "number", "total_waves numeric");
    assert.ok(typeof summary.complete === "number", "complete numeric");
    assert.ok(typeof summary.running === "number", "running numeric");
    assert.ok(typeof summary.aborted === "number", "aborted numeric");
  });

  test("wave receipt persisted to ~/.claude/state/drekaskip/waves/", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G10",
      axes: ["research", "build", "discovery"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    await new Promise(r => setTimeout(r, 2000));
    const dir = resolve(homedir(), ".claude", "state", "drekaskip", "waves");
    assert.ok(existsSync(dir), "~/.claude/state/drekaskip/waves/ exists");
  });
});

/** G11 — Sweat Scribe Instrumentation */
describe("G11 — Sweat Scribe Signals", () => {
  test("effort signals written to pending or live path", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G11",
      axes: ["research", "build"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    await new Promise(r => setTimeout(r, 2000));
    // Either live (B80) or pending path should exist
    const pendingPath = resolve(homedir(), ".claude", "state", "drekaskip", "effort_signals_pending.jsonl");
    const livePath = resolve(homedir(), ".claude", "state", "sweat_scribe", "raw_signals.jsonl");
    const signalsExist = existsSync(pendingPath) || existsSync(livePath);
    assert.ok(signalsExist, "sweat scribe signals written (pending or live)");
  });
});

/** G12 — MCCI Thread Integration */
describe("G12 — MCCI Thread Integration", () => {
  test("MCCI handoff candidates written (pending or live)", async () => {
    const dispatch = await tool_wave_dispatch({
      saga_id: "Saga-Test-G12",
      axes: ["research", "synthesis"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    await new Promise(r => setTimeout(r, 2000));
    const pendingPath = resolve(homedir(), ".claude", "state", "drekaskip", "mcci_handoff_pending.jsonl");
    const livePath = resolve(homedir(), ".claude", "state", "mcci", "threads.jsonl");
    const handoffExists = existsSync(pendingPath) || existsSync(livePath);
    assert.ok(handoffExists, "MCCI handoff candidates written");
  });
});

/** MCP Tools: saga_query + saga_list */
describe("MCP Tools — saga_query + saga_list", () => {
  test("tool_saga_query returns wave list for saga", async () => {
    await tool_wave_dispatch({
      saga_id: "Saga-MCP-Test",
      axes: ["research"],
      budget: { max_segs: 12, timeout_s: 5 },
    });
    const result = await tool_saga_query({ saga_id: "Saga-MCP-Test" });
    assert.equal(result.saga_id, "Saga-MCP-Test", "saga_id matches");
    assert.ok(result.wave_count >= 1, "at least 1 wave");
    assert.ok(Array.isArray(result.waves), "waves array");
  });

  test("tool_saga_list returns array of all sagas", async () => {
    const result = await tool_saga_list();
    assert.ok(Array.isArray(result), "saga list is array");
    // At minimum the test sagas from above should be present
    assert.ok(result.length >= 1, "at least 1 saga");
  });
});
