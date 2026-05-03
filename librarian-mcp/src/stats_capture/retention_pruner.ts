/**
 * Retention Pruner — KN-S2 / BP018
 * ==================================
 * Tiered retention policy:
 *   bookend          → always retained (never touched)
 *   interval_pass    → 24h retention (moved to .archive after)
 *   interval_fail    → 30d in failed/
 *   interval_anomaly → 90d in anomaly/
 *   protected        → indefinite in protected/
 *
 * Daily 03:00 cron: prune live/ interval pass files older than 24h
 * Weekly archive: compress old pass intervals into .archive/YYYY-WW.ndjson
 * Manual CLI: stats-capture prune [--dry-run] [--older-than-hours=24]
 *
 * Composes with:
 *   KN-S1 harness.ts — classifyIntervals() pre-sorts on test end
 *   KN-S3 MCP tools  — Bishop queries substrate after pruner runs
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync, statSync, writeFileSync, appendFileSync, createReadStream, createWriteStream } from "fs";
import { resolve } from "path";
import { TELEMETRY_ROOT, TELEMETRY_LIVE, TELEMETRY_FAILED, TELEMETRY_ANOMALY, TELEMETRY_PROTECTED, TELEMETRY_ARCHIVE } from "./harness.js";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PruneReceipt = {
  pruned_count: number;
  archived_count: number;
  deleted_count: number;
  protected_skipped: number;
  bookend_skipped: number;
  dry_run: boolean;
  timestamp: string;
  details: Array<{ file: string; action: string }>;
};

// ─── Age thresholds ────────────────────────────────────────────────────────────

const PASS_INTERVAL_TTL_MS  = 24 * 60 * 60 * 1000;   // 24 hours
const FAIL_INTERVAL_TTL_MS  = 30 * 24 * 60 * 60 * 1000; // 30 days
const ANOMALY_INTERVAL_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

// ─── RetentionPruner ───────────────────────────────────────────────────────────

export class RetentionPruner {
  private root: string;

  constructor(root: string = TELEMETRY_ROOT) {
    this.root = root;
  }

  private liveDir()      { return resolve(this.root, "live"); }
  private failedDir()    { return resolve(this.root, "failed"); }
  private anomalyDir()   { return resolve(this.root, "anomaly"); }
  private protectedDir() { return resolve(this.root, "protected"); }
  private archiveDir()   { return resolve(this.root, ".archive"); }

  /**
   * Daily 03:00 run: prune pass-interval files older than 24h from live/.
   * Move them to .archive/<YYYY-WW>.ndjson.
   * Prune failed/ files older than 30d, anomaly/ files older than 90d.
   */
  async run_daily(dry_run = false): Promise<PruneReceipt> {
    return this._prune({ older_than_hours: 24, dry_run });
  }

  /**
   * Manual prune with configurable age threshold.
   */
  async manual_prune(opts: { older_than_hours: number; dry_run: boolean }): Promise<PruneReceipt> {
    return this._prune(opts);
  }

  /**
   * Protect a test_id: move all its files from live/ to protected/.
   */
  async protect(test_id: string): Promise<void> {
    const src = this.liveDir();
    const dst = this.protectedDir();
    if (!existsSync(src)) return;
    mkdirSync(dst, { recursive: true });
    for (const f of readdirSync(src).filter((f) => f.startsWith(test_id + "__"))) {
      renameSync(resolve(src, f), resolve(dst, f));
    }
  }

  /**
   * Unprotect: move files from protected/ back to live/ (appropriate tier).
   */
  async unprotect(test_id: string): Promise<void> {
    const src = this.protectedDir();
    const dst = this.liveDir();
    if (!existsSync(src)) return;
    mkdirSync(dst, { recursive: true });
    for (const f of readdirSync(src).filter((f) => f.startsWith(test_id + "__"))) {
      renameSync(resolve(src, f), resolve(dst, f));
    }
  }

  /**
   * Status: count files per tier.
   */
  status(): Record<string, number> {
    const count = (dir: string) => {
      if (!existsSync(dir)) return 0;
      return readdirSync(dir).filter((f) => f.endsWith(".json") || f.endsWith(".ndjson")).length;
    };
    return {
      live: count(this.liveDir()),
      failed: count(this.failedDir()),
      anomaly: count(this.anomalyDir()),
      protected: count(this.protectedDir()),
      archive: count(this.archiveDir()),
    };
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private _prune(opts: { older_than_hours: number; dry_run: boolean }): PruneReceipt {
    const { older_than_hours, dry_run } = opts;
    const now = Date.now();
    const receipt: PruneReceipt = {
      pruned_count: 0,
      archived_count: 0,
      deleted_count: 0,
      protected_skipped: 0,
      bookend_skipped: 0,
      dry_run,
      timestamp: new Date().toISOString(),
      details: [],
    };

    // Prune live/ pass-interval files older than threshold
    const liveDir = this.liveDir();
    if (existsSync(liveDir)) {
      for (const f of readdirSync(liveDir)) {
        if (!f.endsWith(".json")) continue;
        // Skip bookend files
        if (f.includes("bookend_start") || f.includes("bookend_end")) {
          receipt.bookend_skipped++;
          continue;
        }
        if (!f.includes("interval")) continue;

        const filepath = resolve(liveDir, f);
        const stat = statSync(filepath);
        const ageMs = now - stat.mtimeMs;

        if (ageMs < older_than_hours * 60 * 60 * 1000) continue;

        // Read to check outcome
        let content: { outcome?: string; anomaly_flag?: boolean } = {};
        try { content = JSON.parse(readFileSync(filepath, "utf-8")); } catch { /* skip malformed */ }

        if (content.anomaly_flag) continue; // anomaly files handled separately
        if (content.outcome === "fail" || content.outcome === "errored") continue;

        // Archive pass-interval
        receipt.details.push({ file: f, action: "archive" });
        receipt.archived_count++;
        receipt.pruned_count++;
        if (!dry_run) {
          this._appendToArchive(filepath, f);
          unlinkSync(filepath);
        }
      }
    }

    // Prune failed/ files older than 30d
    const failedDir = this.failedDir();
    if (existsSync(failedDir)) {
      for (const f of readdirSync(failedDir)) {
        if (!f.endsWith(".json")) continue;
        const filepath = resolve(failedDir, f);
        const ageMs = now - statSync(filepath).mtimeMs;
        if (ageMs >= FAIL_INTERVAL_TTL_MS) {
          receipt.details.push({ file: f, action: "delete_failed_expired" });
          receipt.deleted_count++;
          receipt.pruned_count++;
          if (!dry_run) unlinkSync(filepath);
        }
      }
    }

    // Prune anomaly/ files older than 90d
    const anomalyDir = this.anomalyDir();
    if (existsSync(anomalyDir)) {
      for (const f of readdirSync(anomalyDir)) {
        if (!f.endsWith(".json")) continue;
        const filepath = resolve(anomalyDir, f);
        const ageMs = now - statSync(filepath).mtimeMs;
        if (ageMs >= ANOMALY_INTERVAL_TTL_MS) {
          receipt.details.push({ file: f, action: "delete_anomaly_expired" });
          receipt.deleted_count++;
          receipt.pruned_count++;
          if (!dry_run) unlinkSync(filepath);
        }
      }
    }

    return receipt;
  }

  private _appendToArchive(filepath: string, filename: string): void {
    const archiveDir = this.archiveDir();
    mkdirSync(archiveDir, { recursive: true });

    // Weekly archive key: YYYY-WW
    const now = new Date();
    const week = _isoWeek(now);
    const archiveFile = resolve(archiveDir, `${week}.ndjson`);

    try {
      const content = readFileSync(filepath, "utf-8");
      appendFileSync(archiveFile, content.replace(/\n$/, "") + "\n", "utf-8");
    } catch { /* skip malformed file */ }
  }
}

// ─── Archive roller ─────────────────────────────────────────────────────────────

export function rollArchive(root: string = TELEMETRY_ROOT, week?: string): string {
  const archiveDir = resolve(root, ".archive");
  mkdirSync(archiveDir, { recursive: true });
  const weekKey = week ?? _isoWeek(new Date());
  const archiveFile = resolve(archiveDir, `${weekKey}.ndjson`);
  return archiveFile;
}

// ─── ISO week key ──────────────────────────────────────────────────────────────

function _isoWeek(d: Date): string {
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const dayOfYear = (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000;
  const weekOfYear = Math.ceil((dayOfYear + jan4.getDay()) / 7);
  return `${d.getFullYear()}-W${String(weekOfYear).padStart(2, "0")}`;
}
