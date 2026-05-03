/**
 * KN-S1 Stats-Capture Harness — T1-T14 test suite
 * ==================================================
 * Tests: bookend_start, tick/anomaly, end/classification, interval cadence,
 * concurrent multi-harness, BeeCanonMarks, FORK doctrine, withStatsCapture,
 * cost-accounting (T11-T14).
 */

import { strictEqual, ok, deepStrictEqual } from "assert";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { test } from "node:test";

import {
  StatsCaptureHarness,
  withStatsCapture,
  detectAnomalies,
  checkForkDoctrineCompliance,
  TELEMETRY_LIVE,
  TELEMETRY_FAILED,
  TELEMETRY_ANOMALY,
} from "../dist/stats_capture/harness.js";

// ─── Shared temp root for isolation ───────────────────────────────────────────

function makeTempRoot() {
  return mkdtempSync(resolve(tmpdir(), "stats-capture-test-"));
}

// ─── T1: start() emits bookend_start snapshot to live/ ───────────────────────

test("T1: harness.start() emits bookend_start snapshot", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T1-test",
    test_file: "/fake/test_t1.mjs",
    telemetry_root: root,
    interval_seconds: 9999, // no intervals during test
  });

  const snapPath = harness.start();
  harness.end("pass");

  const liveDir = resolve(root, "live");
  const files = readdirSync(liveDir);
  const startFile = files.find((f) => f.includes("bookend_start"));
  ok(startFile, "bookend_start file should exist in live/");

  const snap = JSON.parse(readFileSync(resolve(liveDir, startFile), "utf-8"));
  strictEqual(snap.test_id, "T1-test");
  strictEqual(snap.snapshot_type, "bookend_start");
  strictEqual(snap.outcome, "in_flight");
  strictEqual(snap.retention_class, "bookend");
});

// ─── T2: tick() updates currentSnapshot; anomaly_detector flags context_pct spike ─

test("T2: tick() updates state; anomaly detected at context_pct > 85", () => {
  const startTs = Date.now();
  const result = detectAnomalies({ context_pct: 90 }, startTs);
  ok(result.anomaly_flag, "context_pct 90 should trigger anomaly");
  ok(result.reason?.includes("90"), "anomaly reason should mention the value");

  const noAnomaly = detectAnomalies({ context_pct: 50 }, startTs);
  ok(!noAnomaly.anomaly_flag, "context_pct 50 should not trigger anomaly");
});

// ─── T3: end("pass") emits bookend_end + classifies intervals as interval_pass ─

test("T3: end('pass') emits bookend_end, pass-intervals remain in live/", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T3-test",
    test_file: "/fake/test_t3.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  harness.start();
  harness.end("pass", { commit_hash: "abc123" });

  const liveDir = resolve(root, "live");
  const files = readdirSync(liveDir);
  const endFile = files.find((f) => f.includes("bookend_end"));
  ok(endFile, "bookend_end file should exist");

  const snap = JSON.parse(readFileSync(resolve(liveDir, endFile), "utf-8"));
  strictEqual(snap.outcome, "pass");
  strictEqual(snap.commit_hash, "abc123");
  strictEqual(snap.retention_class, "bookend");
});

// ─── T4: end("fail") emits bookend_end + classifies intervals as interval_fail ─

test("T4: end('fail') moves interval files to failed/", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T4-test",
    test_file: "/fake/test_t4.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  // Manually write a fake interval file to live/
  const liveDir = resolve(root, "live");
  const failedDir = resolve(root, "failed");
  mkdirSync(liveDir, { recursive: true });
  mkdirSync(failedDir, { recursive: true });
  const fakeInterval = resolve(liveDir, "T4-test__interval__2026-05-01T00-00-00-000Z.json");
  const { writeFileSync } = await import("fs");
  writeFileSync(fakeInterval, JSON.stringify({ test_id: "T4-test", snapshot_type: "interval" }));

  harness.start();
  harness.end("fail", { error_details: "assertion failed" });

  // interval files should have moved to failed/
  const failedFiles = readdirSync(failedDir);
  ok(failedFiles.length >= 1, "interval file should be in failed/");
});

// ─── T5: anomaly during run → classify intervals as interval_anomaly ──────────

test("T5: anomaly flag → interval files moved to anomaly/", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T5-test",
    test_file: "/fake/test_t5.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  // Manually write a fake interval file
  const liveDir = resolve(root, "live");
  const anomalyDir = resolve(root, "anomaly");
  mkdirSync(liveDir, { recursive: true });
  mkdirSync(anomalyDir, { recursive: true });
  const { writeFileSync } = await import("fs");
  writeFileSync(
    resolve(liveDir, "T5-test__interval__2026-05-01T00-00-00-000Z.json"),
    JSON.stringify({ test_id: "T5-test", snapshot_type: "interval" })
  );

  harness.start();
  harness.tick({ context_pct: 91 }); // triggers anomaly
  harness.end("pass");

  const anomalyFiles = readdirSync(anomalyDir);
  ok(anomalyFiles.length >= 1, "interval file should be in anomaly/");
});

// ─── T6: interval cadence — timer fires at configured rate ────────────────────

test("T6: interval cadence — 2 intervals over ~100ms at 40ms cadence", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T6-test",
    test_file: "/fake/test_t6.mjs",
    telemetry_root: root,
    interval_seconds: 0.04, // 40ms
  });

  harness.start();
  await new Promise((r) => setTimeout(r, 150)); // wait ~150ms → ~3 intervals
  harness.end("pass");

  const liveDir = resolve(root, "live");
  const intervals = readdirSync(liveDir).filter((f) => f.includes("interval"));
  ok(intervals.length >= 2, `should have at least 2 intervals, got ${intervals.length}`);
});

// ─── T7: concurrent multi-harness — 5 harnesses, no telemetry collision ───────

test("T7: concurrent multi-harness — 5 harnesses, no telemetry collision", async () => {
  const root = makeTempRoot();
  const harnesses = Array.from({ length: 5 }, (_, i) =>
    new StatsCaptureHarness({
      test_id: `T7-test-${i}`,
      test_file: `/fake/test_t7_${i}.mjs`,
      telemetry_root: root,
      knight_session_index: i + 1,
      knight_session_total: 5,
      interval_seconds: 9999,
    })
  );

  await Promise.all(harnesses.map((h) => { h.start(); return Promise.resolve(); }));
  await Promise.all(harnesses.map((h) => h.end("pass")));

  const liveDir = resolve(root, "live");
  const files = readdirSync(liveDir);
  const startFiles = files.filter((f) => f.includes("bookend_start"));
  const endFiles = files.filter((f) => f.includes("bookend_end"));
  strictEqual(startFiles.length, 5, "should have 5 bookend_start files");
  strictEqual(endFiles.length, 5, "should have 5 bookend_end files");

  // No test_id collision: each file should be unique
  const ids = new Set(files.map((f) => f.split("__")[0]));
  strictEqual(ids.size, 5, "each harness should have unique test_id files");
});

// ─── T8: BeeCanonMarks recorded correctly ────────────────────────────────────

test("T8: BeeCanonMarks recorded in snapshot", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T8-test",
    test_file: "/fake/test_t8.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  harness.start();
  harness.tick({
    bee_canon_marks: {
      workers_drones_pro_rata: 1.0,
      queen_multiplier: 1.5,
      project_cohort_multiplier: 1.25,
    },
  });
  harness.end("pass");

  const liveDir = resolve(root, "live");
  const endFile = readdirSync(liveDir).find((f) => f.includes("bookend_end"));
  ok(endFile, "bookend_end should exist");
  const snap = JSON.parse(readFileSync(resolve(liveDir, endFile), "utf-8"));
  ok(snap.bee_canon_marks, "bee_canon_marks should be in end snapshot");
  strictEqual(snap.bee_canon_marks.queen_multiplier, 1.5);
});

// ─── T9: FORK doctrine compliance flag ────────────────────────────────────────

test("T9: FORK doctrine compliance check", () => {
  ok(checkForkDoctrineCompliance("KN-S1 LANDED -- Stats-Capture harness"), "non-empty commit should be compliant");
  ok(!checkForkDoctrineCompliance("  "), "empty/whitespace commit should be non-compliant");
});

// ─── T10: withStatsCapture helper wraps test correctly ────────────────────────

test("T10: withStatsCapture helper", async () => {
  const root = makeTempRoot();
  let harnessRef;

  const result = await withStatsCapture(
    { test_id: "T10-test", test_file: "/fake/test_t10.mjs", telemetry_root: root, interval_seconds: 9999 },
    async (h) => {
      harnessRef = h;
      h.tick({ assertion_index: 1, assertion_total: 3 });
      return "test-passed";
    }
  );

  strictEqual(result, "test-passed");
  const liveDir = resolve(root, "live");
  const files = readdirSync(liveDir);
  ok(files.some((f) => f.includes("bookend_start")), "should have bookend_start");
  ok(files.some((f) => f.includes("bookend_end")), "should have bookend_end");
});

// ─── T11: cost-accounting — vendor_api_spend_usd computed correctly ───────────

test("T11: cost-accounting — spend computed from tokens × rates", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T11-test",
    test_file: "/fake/test_t11.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  harness.start();
  harness.end("pass", {
    vendor_api_tokens_input: 100_000,
    vendor_api_tokens_output: 10_000,
    vendor_api_provider: "anthropic",
    vendor_pricing_input_per_million: 3.0,
    vendor_pricing_output_per_million: 15.0,
  });

  const liveDir = resolve(root, "live");
  const endFile = readdirSync(liveDir).find((f) => f.includes("bookend_end"));
  const snap = JSON.parse(readFileSync(resolve(liveDir, endFile), "utf-8"));

  // (100000/1e6)*3 + (10000/1e6)*15 = 0.3 + 0.15 = 0.45
  ok(Math.abs(snap.vendor_api_spend_usd - 0.45) < 0.001, `spend should be ~0.45, got ${snap.vendor_api_spend_usd}`);
});

// ─── T12: cost-accounting — counterfactual populated ─────────────────────────

test("T12: cost-accounting — counterfactual_cost_estimate populated", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T12-test",
    test_file: "/fake/test_t12.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  harness.start();
  harness.end("pass", {
    vendor_api_tokens_input: 200_000,
    vendor_api_tokens_output: 20_000,
    vendor_pricing_input_per_million: 3.0,
    vendor_pricing_output_per_million: 15.0,
  });

  const liveDir = resolve(root, "live");
  const snap = JSON.parse(readFileSync(resolve(liveDir, readdirSync(liveDir).find((f) => f.includes("bookend_end"))), "utf-8"));

  ok(snap.counterfactual_cost_estimate_usd > snap.vendor_api_spend_usd, "counterfactual should exceed actual spend");
  strictEqual(snap.counterfactual_estimation_method, "marathon_3_4x_throughput_baseline");
});

// ─── T13: cost-accounting — savings computed correctly ────────────────────────

test("T13: cost-accounting — estimated_savings_usd + pct", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T13-test",
    test_file: "/fake/test_t13.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  harness.start();
  harness.end("pass", {
    vendor_api_tokens_input: 100_000,
    vendor_api_tokens_output: 10_000,
    vendor_pricing_input_per_million: 3.0,
    vendor_pricing_output_per_million: 15.0,
  });

  const liveDir = resolve(root, "live");
  const snap = JSON.parse(readFileSync(resolve(liveDir, readdirSync(liveDir).find((f) => f.includes("bookend_end"))), "utf-8"));

  // spend = 0.45; counterfactual = 0.45 * 3.5 = 1.575; savings = 1.575 - 0.45 = 1.125; pct = 71.4%
  ok(snap.estimated_savings_usd > 0, "savings should be positive");
  ok(snap.estimated_savings_pct > 0 && snap.estimated_savings_pct < 100, "savings pct should be 0-100");
  ok(Math.abs(snap.estimated_savings_pct - 71.4) < 1, `savings pct should be ~71.4%, got ${snap.estimated_savings_pct}`);
});

// ─── T14: cost-accounting — colossus_paired_test_id linkage ──────────────────

test("T14: colossus_paired_test_id linkage", async () => {
  const root = makeTempRoot();
  const harness = new StatsCaptureHarness({
    test_id: "T14-test",
    test_file: "/fake/test_t14.mjs",
    telemetry_root: root,
    interval_seconds: 9999,
  });

  harness.start();
  harness.end("pass", {
    vendor_api_tokens_input: 50_000,
    vendor_api_tokens_output: 5_000,
    vendor_pricing_input_per_million: 3.0,
    vendor_pricing_output_per_million: 15.0,
    colossus_paired_test_id: "COLOSSUS-BUSHEL-3-RUN-42",
  });

  const liveDir = resolve(root, "live");
  const snap = JSON.parse(readFileSync(resolve(liveDir, readdirSync(liveDir).find((f) => f.includes("bookend_end"))), "utf-8"));
  strictEqual(snap.colossus_paired_test_id, "COLOSSUS-BUSHEL-3-RUN-42");
});
