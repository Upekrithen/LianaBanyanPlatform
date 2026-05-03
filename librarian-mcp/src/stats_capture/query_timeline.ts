/**
 * Stats-Capture Timeline Query — KN-S3 / BP018
 * ==============================================
 * Returns ordered sequence of all snapshots for one test_id:
 *   bookend_start + intervals + bookend_end
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { TELEMETRY_ROOT } from "./harness.js";

export type TimelineResult = {
  data_available: boolean;
  test_id: string;
  snapshot_count: number;
  snapshots: Array<Record<string, unknown>>;
  error?: string;
};

export function queryTimeline(test_id: string, root: string = TELEMETRY_ROOT): TimelineResult {
  try {
    const dirs = ["live", "failed", "anomaly", "protected"].map((d) => resolve(root, d));
    const snapshots: Array<Record<string, unknown>> = [];

    for (const dir of dirs) {
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.startsWith(test_id + "__") || !f.endsWith(".json")) continue;
        try {
          const snap = JSON.parse(readFileSync(resolve(dir, f), "utf-8")) as Record<string, unknown>;
          snapshots.push({ ...snap, _source_dir: dir.split(/[\\/]/).pop() });
        } catch { /* skip malformed */ }
      }
    }

    // Sort by timestamp
    snapshots.sort((a, b) => {
      const ta = String(a.timestamp ?? "");
      const tb = String(b.timestamp ?? "");
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });

    return {
      data_available: snapshots.length > 0,
      test_id,
      snapshot_count: snapshots.length,
      snapshots,
    };
  } catch (err) {
    return { data_available: false, test_id, snapshot_count: 0, snapshots: [], error: String(err) };
  }
}
