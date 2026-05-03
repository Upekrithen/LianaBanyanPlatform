/**
 * Stats-Capture Parallel Compare Query — KN-S3 / BP018
 * ======================================================
 * Correlates 5-Knight × 3-pod test runs for Founder comparison.
 * Matches snapshots by test_id_pattern (e.g. "KN-R4-session-*").
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { TELEMETRY_ROOT } from "./harness.js";

export type ParallelSession = {
  knight_session_index: number;
  test_ids: string[];
  snapshot_count: number;
  outcomes: { pass: number; fail: number; errored: number };
  mean_runtime_ms: number;
  context_pct_progression: number[];
  fork_doctrine_compliance_rate: number;
  bee_canon_marks_sum: number;
  anomaly_count: number;
};

export type ParallelCompareResult = {
  data_available: boolean;
  test_id_pattern: string;
  sessions: ParallelSession[];
  aggregate: {
    total_assertions: number;
    total_failures: number;
    mean_runtime_ms: number;
    fork_doctrine_compliance_rate: number;
    bee_canon_marks_sum: number;
  };
  error?: string;
};

export function queryParallelCompare(test_id_pattern: string, root: string = TELEMETRY_ROOT): ParallelCompareResult {
  try {
    const regex = new RegExp(test_id_pattern.replace(/\*/g, ".*").replace(/\?/g, "."));
    const dirs = ["live", "failed", "anomaly", "protected"].map((d) => resolve(root, d));

    // Collect all matching snapshots grouped by knight_session_index
    const bySession = new Map<number, Array<Record<string, unknown>>>();
    const testIds = new Set<string>();

    for (const dir of dirs) {
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        try {
          const snap = JSON.parse(readFileSync(resolve(dir, f), "utf-8")) as Record<string, unknown>;
          const tid = String(snap.test_id ?? "");
          if (!regex.test(tid)) continue;
          testIds.add(tid);
          const idx = Number(snap.knight_session_index ?? 1);
          if (!bySession.has(idx)) bySession.set(idx, []);
          bySession.get(idx)!.push(snap);
        } catch { /* skip */ }
      }
    }

    const sessions: ParallelSession[] = [];
    let totalAssertions = 0;
    let totalFailures = 0;
    let allRuntimes: number[] = [];
    let allForkCompliance: boolean[] = [];
    let allBeeMarks = 0;

    for (const [idx, snaps] of bySession) {
      const endSnaps = snaps.filter((s) => s.snapshot_type === "bookend_end");
      const outcomes = { pass: 0, fail: 0, errored: 0 };
      const runtimes: number[] = [];
      const ctxPcts: number[] = [];
      let forkCompliant = 0;
      let beeMarksSum = 0;
      let anomalies = 0;

      for (const s of endSnaps) {
        const oc = String(s.outcome ?? "");
        if (oc === "pass") outcomes.pass++;
        else if (oc === "fail") { outcomes.fail++; totalFailures++; }
        else if (oc === "errored") outcomes.errored++;
        if (typeof s.clock_time_ms === "number") runtimes.push(s.clock_time_ms);
        if (typeof s.context_pct === "number") ctxPcts.push(s.context_pct);
        if (s.fork_doctrine_compliant === true) forkCompliant++;
        if (s.bee_canon_marks && typeof (s.bee_canon_marks as Record<string, number>).workers_drones_pro_rata === "number") {
          beeMarksSum += (s.bee_canon_marks as Record<string, number>).workers_drones_pro_rata ?? 0;
        }
        if (s.anomaly_flag) anomalies++;
        if (typeof s.assertion_total === "number") totalAssertions += s.assertion_total;
      }

      const meanRuntime = runtimes.length > 0 ? runtimes.reduce((a, b) => a + b, 0) / runtimes.length : 0;
      const forkRate = endSnaps.length > 0 ? forkCompliant / endSnaps.length : 1;

      allRuntimes.push(...runtimes);
      allForkCompliance.push(...endSnaps.map((s) => s.fork_doctrine_compliant === true));
      allBeeMarks += beeMarksSum;

      sessions.push({
        knight_session_index: idx,
        test_ids: [...new Set(snaps.map((s) => String(s.test_id ?? "")))],
        snapshot_count: snaps.length,
        outcomes,
        mean_runtime_ms: Math.round(meanRuntime),
        context_pct_progression: ctxPcts,
        fork_doctrine_compliance_rate: Math.round(forkRate * 100) / 100,
        bee_canon_marks_sum: Math.round(beeMarksSum * 100) / 100,
        anomaly_count: anomalies,
      });
    }

    sessions.sort((a, b) => a.knight_session_index - b.knight_session_index);

    const globalMeanRuntime = allRuntimes.length > 0 ? allRuntimes.reduce((a, b) => a + b, 0) / allRuntimes.length : 0;
    const globalForkRate = allForkCompliance.length > 0 ? allForkCompliance.filter(Boolean).length / allForkCompliance.length : 1;

    return {
      data_available: sessions.length > 0,
      test_id_pattern,
      sessions,
      aggregate: {
        total_assertions: totalAssertions,
        total_failures: totalFailures,
        mean_runtime_ms: Math.round(globalMeanRuntime),
        fork_doctrine_compliance_rate: Math.round(globalForkRate * 100) / 100,
        bee_canon_marks_sum: Math.round(allBeeMarks * 100) / 100,
      },
    };
  } catch (err) {
    return {
      data_available: false,
      test_id_pattern,
      sessions: [],
      aggregate: { total_assertions: 0, total_failures: 0, mean_runtime_ms: 0, fork_doctrine_compliance_rate: 0, bee_canon_marks_sum: 0 },
      error: String(err),
    };
  }
}
