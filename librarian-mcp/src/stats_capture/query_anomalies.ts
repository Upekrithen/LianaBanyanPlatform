/**
 * Stats-Capture Anomaly Query — KN-S3 / BP018
 * =============================================
 * Returns flagged anomaly snapshots since a cutoff date.
 * Scans anomaly/ dir + live/ interval files with anomaly_flag=true.
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { TELEMETRY_ROOT } from "./harness.js";

export type AnomalyEntry = {
  test_id: string;
  anomaly_reason: string;
  snapshot: Record<string, unknown>;
  source_dir: string;
};

export type AnomaliesResult = {
  data_available: boolean;
  since: string;
  count: number;
  anomalies: AnomalyEntry[];
  error?: string;
};

export function queryAnomalies(
  since: string,
  severity: "all" | "high" = "all",
  root: string = TELEMETRY_ROOT
): AnomaliesResult {
  try {
    const sinceMs = new Date(since).getTime();
    const dirs = ["live", "anomaly"].map((d) => ({ dir: resolve(root, d), name: d }));
    const anomalies: AnomalyEntry[] = [];

    for (const { dir, name } of dirs) {
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        try {
          const snap = JSON.parse(readFileSync(resolve(dir, f), "utf-8")) as Record<string, unknown>;
          if (!snap.anomaly_flag) continue;
          const ts = snap.timestamp ? new Date(String(snap.timestamp)).getTime() : 0;
          if (ts < sinceMs) continue;
          // High severity: context_pct > 90 or anomaly_reason includes "stall"
          if (severity === "high") {
            const reason = String(snap.anomaly_reason ?? "");
            const ctx = Number(snap.context_pct ?? 0);
            if (ctx <= 90 && !reason.includes("stall")) continue;
          }
          anomalies.push({
            test_id: String(snap.test_id ?? ""),
            anomaly_reason: String(snap.anomaly_reason ?? "unknown"),
            snapshot: snap,
            source_dir: name,
          });
        } catch { /* skip */ }
      }
    }

    anomalies.sort((a, b) => {
      const ta = String(a.snapshot.timestamp ?? "");
      const tb = String(b.snapshot.timestamp ?? "");
      return tb < ta ? -1 : tb > ta ? 1 : 0; // newest first
    });

    return { data_available: true, since, count: anomalies.length, anomalies };
  } catch (err) {
    return { data_available: false, since, count: 0, anomalies: [], error: String(err) };
  }
}
