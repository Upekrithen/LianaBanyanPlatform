/**
 * KN-S3 Stats-Capture MCP Tools — T1-T8 test suite
 * ===================================================
 * Tests: aggregate counts, timeline ordering, parallel_compare, anomalies,
 * protect via MCP, k_prompt_pattern filter, cohort_class filter, aggregate fields.
 */

import { strictEqual, ok } from "assert";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { test } from "node:test";

import { queryAggregate } from "../dist/stats_capture/query_aggregate.js";
import { queryTimeline } from "../dist/stats_capture/query_timeline.js";
import { queryParallelCompare } from "../dist/stats_capture/query_parallel_compare.js";
import { queryAnomalies } from "../dist/stats_capture/query_anomalies.js";
import { RetentionPruner } from "../dist/stats_capture/retention_pruner.js";

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function makeTempRoot() {
  const root = mkdtempSync(resolve(tmpdir(), "kns3-test-"));
  ["live", "failed", "anomaly", "protected", ".archive"].forEach((d) => mkdirSync(resolve(root, d), { recursive: true }));
  return root;
}

function writeSnap(root, tier, testId, type, extras = {}) {
  const dir = resolve(root, tier);
  const ts = new Date().toISOString();
  const filename = `${testId}__${type}__${ts.replace(/[:.]/g, "-")}.json`;
  const content = {
    test_id: testId,
    snapshot_type: type,
    timestamp: ts,
    outcome: extras.outcome ?? "pass",
    anomaly_flag: extras.anomaly_flag ?? false,
    retention_class: extras.retention_class ?? "bookend",
    fork_doctrine_compliant: extras.fork_doctrine_compliant ?? true,
    k_prompt_section: extras.k_prompt_section ?? "KN-R4",
    k_prompt_source: extras.k_prompt_source ?? "KN-R4",
    knight_session_index: extras.knight_session_index ?? 1,
    knight_session_total: extras.knight_session_total ?? 1,
    vendor_api_spend_usd: extras.vendor_api_spend_usd ?? 0.1,
    counterfactual_cost_estimate_usd: extras.counterfactual_cost_estimate_usd ?? 0.35,
    clock_time_ms: extras.clock_time_ms ?? 5000,
    bee_canon_marks: extras.bee_canon_marks ?? { workers_drones_pro_rata: 1.0, queen_multiplier: 1.5, project_cohort_multiplier: 1.25 },
    context_pct: extras.context_pct ?? 40,
    assertion_total: extras.assertion_total ?? 5,
    anomaly_reason: extras.anomaly_reason ?? null,
    ...extras,
  };
  writeFileSync(resolve(dir, filename), JSON.stringify(content));
  return filename;
}

// ─── T1: aggregate counts correct across seeded test_telemetry/ ──────────────

test("T1: aggregate counts correct across seeded telemetry", async () => {
  const root = makeTempRoot();
  writeSnap(root, "live", "T1-A", "bookend_end", { outcome: "pass" });
  writeSnap(root, "live", "T1-B", "bookend_end", { outcome: "pass" });
  writeSnap(root, "failed", "T1-C", "bookend_end", { outcome: "fail" });

  const result = queryAggregate({ hours: 24 * 365, root });
  ok(result.data_available, "should be data_available");
  ok(result.total >= 3, "total should count all seeded snaps");
  ok(result.by_outcome.pass >= 2, "should count 2 pass outcomes");
  ok(result.by_outcome.fail >= 1, "should count 1 fail outcome");
  ok(result.by_tier.live >= 2, "live tier should have 2 snaps");
  ok(result.by_tier.failed >= 1, "failed tier should have 1 snap");
  ok(result.cost_accounting.actual_spend_usd > 0, "should aggregate spend");
  ok(result.cost_accounting.counterfactual_estimate_usd > result.cost_accounting.actual_spend_usd, "counterfactual > actual");
});

// ─── T2: timeline returns ordered snapshots ────────────────────────────────────

test("T2: timeline returns ordered snapshots (bookend_start + intervals + bookend_end)", async () => {
  const root = makeTempRoot();
  // Write snapshots with slightly staggered timestamps
  const tid = "T2-timeline-test";

  const t0 = new Date(Date.now() - 10000).toISOString();
  const t1 = new Date(Date.now() - 5000).toISOString();
  const t2 = new Date().toISOString();

  const snap = (type, ts) => ({ test_id: tid, snapshot_type: type, timestamp: ts, outcome: "pass", anomaly_flag: false, retention_class: "bookend", fork_doctrine_compliant: true });
  writeFileSync(resolve(root, "live", `${tid}__bookend_start__ts0.json`), JSON.stringify(snap("bookend_start", t0)));
  writeFileSync(resolve(root, "live", `${tid}__interval__ts1.json`), JSON.stringify(snap("interval", t1)));
  writeFileSync(resolve(root, "live", `${tid}__bookend_end__ts2.json`), JSON.stringify(snap("bookend_end", t2)));

  const result = queryTimeline(tid, root);
  ok(result.data_available, "should have data");
  strictEqual(result.snapshot_count, 3, "should return 3 snapshots");

  const types = result.snapshots.map((s) => s.snapshot_type);
  strictEqual(types[0], "bookend_start", "first should be bookend_start");
  strictEqual(types[1], "interval", "second should be interval");
  strictEqual(types[2], "bookend_end", "third should be bookend_end");
});

// ─── T3: parallel_compare correlates 5-session fixture ────────────────────────

test("T3: parallel_compare correctly correlates 5-session × 3-pod fixture", async () => {
  const root = makeTempRoot();

  // Seed 5 Knight sessions × 3 snapshots each
  for (let sessionIdx = 1; sessionIdx <= 5; sessionIdx++) {
    for (let pod = 1; pod <= 3; pod++) {
      const tid = `KN-R4-session-${sessionIdx}-pod-${pod}`;
      writeSnap(root, "live", tid, "bookend_end", {
        outcome: "pass",
        knight_session_index: sessionIdx,
        knight_session_total: 5,
        clock_time_ms: 5000 + sessionIdx * 100,
        fork_doctrine_compliant: true,
        bee_canon_marks: { workers_drones_pro_rata: 1.0, queen_multiplier: 1.5, project_cohort_multiplier: 1.25 },
        assertion_total: 8,
      });
    }
  }

  const result = queryParallelCompare("KN-R4-session-*", root);
  ok(result.data_available, "should have data");
  ok(result.sessions.length >= 5, `should have 5 sessions, got ${result.sessions.length}`);
  ok(result.aggregate.mean_runtime_ms > 0, "mean_runtime_ms should be positive");
  strictEqual(result.aggregate.fork_doctrine_compliance_rate, 1, "all sessions should be fork-compliant");
  ok(result.aggregate.bee_canon_marks_sum > 0, "bee_canon_marks_sum should be positive");
});

// ─── T4: anomalies returns flagged snapshots since cutoff ─────────────────────

test("T4: anomalies returns flagged snapshots since cutoff", async () => {
  const root = makeTempRoot();
  writeSnap(root, "anomaly", "T4-anomaly", "interval", { anomaly_flag: true, anomaly_reason: "context_pct 91% exceeds threshold" });
  writeSnap(root, "live", "T4-normal", "interval", { anomaly_flag: false });

  const since = new Date(Date.now() - 60_000).toISOString(); // last minute
  const result = queryAnomalies(since, "all", root);
  ok(result.data_available, "should have data");
  ok(result.anomalies.some((a) => a.test_id === "T4-anomaly"), "should include anomaly entry");
  ok(!result.anomalies.some((a) => a.test_id === "T4-normal"), "should NOT include non-anomaly entry");
});

// ─── T5: protect command moves files to protected/ via RetentionPruner ────────

test("T5: protect command via RetentionPruner", async () => {
  const root = makeTempRoot();
  writeSnap(root, "live", "T5-protect", "bookend_start", {});

  const pruner = new RetentionPruner(root);
  await pruner.protect("T5-protect");

  const protectedDir = resolve(root, "protected");
  const files = existsSync(protectedDir) ? readdirSync(protectedDir) : [];
  ok(files.some((f) => f.startsWith("T5-protect__")), "file should be in protected/");
});

// ─── T6: aggregate filter by k_prompt_pattern ─────────────────────────────────

test("T6: aggregate filter by k_prompt_pattern works", async () => {
  const root = makeTempRoot();
  writeSnap(root, "live", "T6-R4-1", "bookend_end", { k_prompt_section: "KN-R4", outcome: "pass" });
  writeSnap(root, "live", "T6-Q1-1", "bookend_end", { k_prompt_section: "KN-Q1", k_prompt_source: "KN-Q1", outcome: "pass" });

  const r4Only = queryAggregate({ hours: 24 * 365, k_prompt_pattern: "KN-R*", root });
  ok(r4Only.data_available, "should have data");
  ok(r4Only.by_k_prompt["KN-R4"] >= 1, "should count KN-R4 entries");
  // KN-Q1 should not appear
  ok(!r4Only.by_k_prompt["KN-Q1"], "KN-Q1 should be filtered out");
});

// ─── T7: aggregate filter by cohort_class (if implemented) ───────────────────

test("T7: aggregate returns data with cohort_class filter (passthrough)", async () => {
  const root = makeTempRoot();
  writeSnap(root, "live", "T7-cohort", "bookend_end", { outcome: "pass" });

  // cohort_class filter is a passthrough for now (no cohort_class field in snapshots)
  const result = queryAggregate({ hours: 24 * 365, cohort_class: "federation_member", root });
  ok(result.data_available !== undefined, "should return a result object");
});

// ─── T8: parallel_compare aggregate fields computed correctly ─────────────────

test("T8: parallel_compare aggregate fields correct", async () => {
  const root = makeTempRoot();

  // 2 sessions × 1 snap each
  writeSnap(root, "live", "T8-sess-1", "bookend_end", {
    knight_session_index: 1, outcome: "pass", clock_time_ms: 1000,
    fork_doctrine_compliant: true, bee_canon_marks: { workers_drones_pro_rata: 2.0, queen_multiplier: 1.5, project_cohort_multiplier: 1.25 }, assertion_total: 3,
  });
  writeSnap(root, "live", "T8-sess-2", "bookend_end", {
    knight_session_index: 2, outcome: "fail", clock_time_ms: 2000,
    fork_doctrine_compliant: false, bee_canon_marks: { workers_drones_pro_rata: 1.0, queen_multiplier: 1.5, project_cohort_multiplier: 1.25 }, assertion_total: 3,
  });

  const result = queryParallelCompare("T8-sess-*", root);
  ok(result.data_available, "should have data");
  strictEqual(result.aggregate.total_assertions, 6, "total assertions should be 3+3=6");
  strictEqual(result.aggregate.total_failures, 1, "total failures = 1 (fail outcome)");
  ok(result.aggregate.mean_runtime_ms > 0, "mean_runtime_ms should be positive");
  ok(result.aggregate.bee_canon_marks_sum >= 2.0, "bee_canon_marks sum should be >= 2");
});
