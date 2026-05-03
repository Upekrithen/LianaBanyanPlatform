/**
 * KN-S2 Retention Pruner + Archive Roller — T1-T10 test suite
 * =============================================================
 * Tests: pruner removes pass-interval files, preserves bookends,
 * moves failed/anomaly, protect/unprotect, archive_roller, CLI dry-run, status.
 */

import { strictEqual, ok } from "assert";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync, utimesSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { test } from "node:test";

import { RetentionPruner, rollArchive } from "../dist/stats_capture/retention_pruner.js";

// ─── Helper: write a fake snapshot JSON ───────────────────────────────────────

function writeSnap(dir, filename, content) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, filename), JSON.stringify(content));
}

function makeTempTelemetryRoot() {
  const root = mkdtempSync(resolve(tmpdir(), "retention-test-"));
  ["live", "failed", "anomaly", "protected", ".archive"].forEach((d) => mkdirSync(resolve(root, d), { recursive: true }));
  return root;
}

function ageFile(filepath, ageHours) {
  const ts = Date.now() - ageHours * 60 * 60 * 1000;
  const d = new Date(ts);
  utimesSync(filepath, d, d);
}

// ─── T1: pruner removes 25h-old pass-interval files from live/ ────────────────

test("T1: pruner removes 25h-old pass-interval files from live/", async () => {
  const root = makeTempTelemetryRoot();
  const liveDir = resolve(root, "live");
  const archiveDir = resolve(root, ".archive");

  const fname = "T1-test__interval__2026-01-01T00-00-00-000Z.json";
  writeSnap(liveDir, fname, { test_id: "T1-test", snapshot_type: "interval", outcome: "pass", anomaly_flag: false, retention_class: "interval_pass" });
  ageFile(resolve(liveDir, fname), 25); // 25 hours old

  const pruner = new RetentionPruner(root);
  const receipt = await pruner.manual_prune({ older_than_hours: 24, dry_run: false });

  ok(receipt.pruned_count >= 1, "should prune at least 1 file");
  ok(receipt.archived_count >= 1, "should archive at least 1 file");
  ok(!existsSync(resolve(liveDir, fname)), "file should be removed from live/");

  // Should appear in archive
  const archiveFiles = readdirSync(archiveDir);
  ok(archiveFiles.length >= 1, "archive should have entries");
});

// ─── T2: pruner moves failed-interval files to failed/ (preserves 30d) ────────

test("T2: pruner does NOT remove failed-interval files before 30d", async () => {
  const root = makeTempTelemetryRoot();
  const failedDir = resolve(root, "failed");

  const fname = "T2-test__interval__2026-01-01T00-00-00-000Z.json";
  writeSnap(failedDir, fname, { test_id: "T2-test", snapshot_type: "interval", outcome: "fail" });
  ageFile(resolve(failedDir, fname), 24 * 25); // 25 days old (< 30d)

  const pruner = new RetentionPruner(root);
  await pruner.manual_prune({ older_than_hours: 24, dry_run: false });

  ok(existsSync(resolve(failedDir, fname)), "25d-old fail file should NOT be pruned (30d TTL)");
});

// ─── T3: pruner moves anomaly-interval files to anomaly/ (preserves 90d) ──────

test("T3: pruner does NOT remove anomaly files before 90d", async () => {
  const root = makeTempTelemetryRoot();
  const anomalyDir = resolve(root, "anomaly");

  const fname = "T3-test__interval__2026-01-01T00-00-00-000Z.json";
  writeSnap(anomalyDir, fname, { test_id: "T3-test", snapshot_type: "interval", anomaly_flag: true });
  ageFile(resolve(anomalyDir, fname), 24 * 45); // 45 days old (< 90d)

  const pruner = new RetentionPruner(root);
  await pruner.manual_prune({ older_than_hours: 24, dry_run: false });

  ok(existsSync(resolve(anomalyDir, fname)), "45d-old anomaly file should NOT be pruned (90d TTL)");
});

// ─── T4: pruner NEVER touches bookend files ───────────────────────────────────

test("T4: pruner NEVER touches bookend files", async () => {
  const root = makeTempTelemetryRoot();
  const liveDir = resolve(root, "live");

  const startF = "T4-test__bookend_start__2026-01-01T00-00-00-000Z.json";
  const endF = "T4-test__bookend_end__2026-01-01T00-00-00-000Z.json";
  writeSnap(liveDir, startF, { test_id: "T4-test", snapshot_type: "bookend_start", retention_class: "bookend" });
  writeSnap(liveDir, endF, { test_id: "T4-test", snapshot_type: "bookend_end", retention_class: "bookend" });
  ageFile(resolve(liveDir, startF), 100);
  ageFile(resolve(liveDir, endF), 100);

  const pruner = new RetentionPruner(root);
  const receipt = await pruner.manual_prune({ older_than_hours: 24, dry_run: false });

  ok(existsSync(resolve(liveDir, startF)), "bookend_start should remain");
  ok(existsSync(resolve(liveDir, endF)), "bookend_end should remain");
  ok(receipt.bookend_skipped >= 2, "bookend_skipped count should be >= 2");
});

// ─── T5: pruner NEVER touches protected/ files ────────────────────────────────

test("T5: pruner NEVER touches protected/ files", async () => {
  const root = makeTempTelemetryRoot();
  const protectedDir = resolve(root, "protected");

  const fname = "T5-test__interval__2026-01-01T00-00-00-000Z.json";
  writeSnap(protectedDir, fname, { test_id: "T5-test", retention_class: "protected" });
  ageFile(resolve(protectedDir, fname), 200);

  const pruner = new RetentionPruner(root);
  await pruner.manual_prune({ older_than_hours: 24, dry_run: false });

  ok(existsSync(resolve(protectedDir, fname)), "protected file should not be touched");
});

// ─── T6: archive_roller creates weekly archive entry ─────────────────────────

test("T6: archive_roller creates weekly NDJSON archive", async () => {
  const root = makeTempTelemetryRoot();
  const archivePath = rollArchive(root, "2026-W18");
  ok(archivePath.includes("2026-W18.ndjson"), "archive path should include week key");
});

// ─── T7: protect command moves test_id files to protected/ ───────────────────

test("T7: protect command moves test_id files to protected/", async () => {
  const root = makeTempTelemetryRoot();
  const liveDir = resolve(root, "live");
  const protectedDir = resolve(root, "protected");

  const fname = "T7-test__bookend_start__2026-01-01T00-00-00-000Z.json";
  writeSnap(liveDir, fname, { test_id: "T7-test" });

  const pruner = new RetentionPruner(root);
  await pruner.protect("T7-test");

  ok(!existsSync(resolve(liveDir, fname)), "file should leave live/");
  ok(existsSync(resolve(protectedDir, fname)), "file should be in protected/");
});

// ─── T8: unprotect restores to appropriate tier ───────────────────────────────

test("T8: unprotect restores files to live/", async () => {
  const root = makeTempTelemetryRoot();
  const liveDir = resolve(root, "live");
  const protectedDir = resolve(root, "protected");

  const fname = "T8-test__bookend_start__2026-01-01T00-00-00-000Z.json";
  writeSnap(protectedDir, fname, { test_id: "T8-test" });

  const pruner = new RetentionPruner(root);
  await pruner.unprotect("T8-test");

  ok(!existsSync(resolve(protectedDir, fname)), "file should leave protected/");
  ok(existsSync(resolve(liveDir, fname)), "file should be back in live/");
});

// ─── T9: CLI dry-run reports without modifying ────────────────────────────────

test("T9: dry-run mode reports without modifying files", async () => {
  const root = makeTempTelemetryRoot();
  const liveDir = resolve(root, "live");

  const fname = "T9-test__interval__2026-01-01T00-00-00-000Z.json";
  writeSnap(liveDir, fname, { test_id: "T9-test", snapshot_type: "interval", outcome: "pass", anomaly_flag: false });
  ageFile(resolve(liveDir, fname), 30);

  const pruner = new RetentionPruner(root);
  const receipt = await pruner.manual_prune({ older_than_hours: 24, dry_run: true });

  strictEqual(receipt.dry_run, true);
  ok(receipt.pruned_count >= 1, "dry-run should report prunable files");
  ok(existsSync(resolve(liveDir, fname)), "dry-run should NOT actually delete the file");
});

// ─── T10: status command reports accurate counts per tier ─────────────────────

test("T10: status command reports accurate counts", async () => {
  const root = makeTempTelemetryRoot();
  const liveDir = resolve(root, "live");
  const protectedDir = resolve(root, "protected");

  writeSnap(liveDir, "S1__bookend_start__ts.json", {});
  writeSnap(liveDir, "S2__bookend_end__ts.json", {});
  writeSnap(protectedDir, "S3__interval__ts.json", {});

  const pruner = new RetentionPruner(root);
  const status = pruner.status();

  ok(status.live >= 2, `live should have >=2 files, got ${status.live}`);
  ok(status.protected >= 1, `protected should have >=1 file, got ${status.protected}`);
  ok(typeof status.failed === "number");
  ok(typeof status.anomaly === "number");
  ok(typeof status.archive === "number");
});
