/**
 * test_build_gate.mjs — K448(B118): MCP build-window crossfire gate tests
 * =========================================================================
 * Tests for src/buildGate.ts (compiled to dist/buildGate.js) and
 * scripts/build-guarded.mjs.
 *
 * 10 cases:
 *   1. No lock file → checkRebuildLock returns null (proceed)
 *   2. Active fresh lock (age ≈ 0) → returns server_rebuilding with retry_after_ms
 *   3. Active stale lock (age > expectedDurationMs + 10s) → returns stale_lock warning
 *   4. Failed lock state → returns server_build_failed with last_error + since
 *   5. Malformed lock file → returns null (graceful, no crash)
 *   6. triggered_by field is preserved in server_rebuilding response
 *   7. Build-guard: success run → lock rewritten to post_build_reload (NOT deleted)
 *   8. Build-guard: failure run → lock has status:"failed" after exit
 *   9. post_build_reload lock → returns server_rebuilding with phase:"reload"
 *  10. clearPostBuildReloadLock() deletes the lock (simulates MCP server startup)
 *
 * Run: node --test tests/test_build_gate.mjs (after npm run build)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync, mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  checkRebuildLock,
  readRebuildLock,
  clearPostBuildReloadLock,
} from "../dist/buildGate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BUILD_GUARDED = resolve(__dirname, "../scripts/build-guarded.mjs");

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "k448-build-gate-"));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function lockPath(dir) {
  return join(dir, ".rebuild.lock");
}

function writeActiveLock(dir, overrides = {}) {
  const lock = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    expectedDurationMs: 30_000,
    triggeredBy: "test",
    ...overrides,
  };
  writeFileSync(lockPath(dir), JSON.stringify(lock, null, 2), "utf-8");
  return lock;
}

function writeFailedLock(dir, overrides = {}) {
  const lock = {
    status: "failed",
    error: "TS1234: test error",
    failedAt: new Date().toISOString(),
    ...overrides,
  };
  writeFileSync(lockPath(dir), JSON.stringify(lock, null, 2), "utf-8");
  return lock;
}

function pastIso(msAgo) {
  return new Date(Date.now() - msAgo).toISOString();
}

// ── Test 1: No lock → proceed ─────────────────────────────────────────────────

test("no lock file → checkRebuildLock returns null (proceed)", () => {
  const dir = makeTempDir();
  const result = checkRebuildLock(lockPath(dir));
  assert.equal(result, null, "No lock should return null");
  rmSync(dir, { recursive: true, force: true });
});

// ── Test 2: Fresh active lock → server_rebuilding ─────────────────────────────

test("fresh active lock → returns server_rebuilding with positive retry_after_ms", () => {
  const dir = makeTempDir();
  writeActiveLock(dir, { expectedDurationMs: 30_000, triggeredBy: "npm run build-guarded" });

  const result = checkRebuildLock(lockPath(dir));

  assert.ok(result !== null, "Should return a block, not null");
  assert.ok(!("warning" in result), "Should not be a stale warning");
  assert.equal(result.error, "server_rebuilding");
  assert.ok(result.retry_after_ms > 0, `retry_after_ms should be > 0, got ${result.retry_after_ms}`);
  assert.ok(result.retry_after_ms <= 40_000, `retry_after_ms should be ≤ 40000, got ${result.retry_after_ms}`);
  assert.ok(typeof result.reason === "string" && result.reason.includes("in progress"), `reason should mention "in progress", got: ${result.reason}`);

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 3: Stale active lock → warning, proceed ──────────────────────────────

test("stale active lock (age > expectedDurationMs + 10s) → returns stale_lock warning", () => {
  const dir = makeTempDir();
  // Build started 50s ago with 30s expectation → 50s > 30s + 10s = stale
  writeActiveLock(dir, {
    startedAt: pastIso(50_000),
    expectedDurationMs: 30_000,
    triggeredBy: "stale-test",
  });

  const result = checkRebuildLock(lockPath(dir));

  assert.ok(result !== null, "Should not be null for a stale lock");
  assert.ok("warning" in result, `Expected warning property, got: ${JSON.stringify(result)}`);
  assert.equal(result.warning, "stale_lock");
  assert.ok(result.age_ms >= 50_000, `age_ms should be ≥ 50000, got ${result.age_ms}`);

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 4: Failed lock → server_build_failed ─────────────────────────────────

test("failed lock state → returns server_build_failed with last_error and since", () => {
  const dir = makeTempDir();
  const failedAt = pastIso(5_000);
  writeFailedLock(dir, {
    error: "TS2345: Argument of type X is not assignable to type Y",
    failedAt,
  });

  const result = checkRebuildLock(lockPath(dir));

  assert.ok(result !== null, "Should not be null for a failed lock");
  assert.ok(!("warning" in result), "Should be an error block, not a warning");
  assert.equal(result.error, "server_build_failed");
  assert.ok(result.last_error.includes("TS2345"), `last_error should include the TS error, got: ${result.last_error}`);
  assert.equal(result.since, failedAt);

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 5: Malformed lock file → null (graceful) ─────────────────────────────

test("malformed lock file → checkRebuildLock returns null (graceful, no crash)", () => {
  const dir = makeTempDir();
  writeFileSync(lockPath(dir), "{not valid json at all!!!", "utf-8");

  let result;
  assert.doesNotThrow(() => {
    result = checkRebuildLock(lockPath(dir));
  }, "Should not throw on malformed JSON");

  assert.equal(result, null, "Malformed lock should return null");
  rmSync(dir, { recursive: true, force: true });
});

// ── Test 6: triggered_by preserved in server_rebuilding ───────────────────────

test("triggered_by field is preserved in server_rebuilding response", () => {
  const dir = makeTempDir();
  writeActiveLock(dir, {
    triggeredBy: "npm run rebuild:full",
    expectedDurationMs: 30_000,
  });

  const result = checkRebuildLock(lockPath(dir));

  assert.ok(result !== null);
  assert.ok(!("warning" in result));
  assert.equal(result.triggered_by, "npm run rebuild:full");

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 7: Build-guard success run → lock deleted ────────────────────────────

test("build-guard: success run → .rebuild.lock is deleted after tsc exits 0", () => {
  const rootLock = resolve(__dirname, "../.rebuild.lock");

  // Clean up any pre-existing lock from a previous test run.
  if (existsSync(rootLock)) rmSync(rootLock);

  // Use "node" (on PATH, no spaces) with unquoted JS to avoid Windows CMD
  // nested-quote parsing issues. build-guarded.mjs calls execSync(BUILD_TSC_CMD).
  const result = spawnSync(
    process.execPath,
    [BUILD_GUARDED],
    {
      env: {
        ...process.env,
        BUILD_TSC_CMD: "node -e process.exit(0)",
      },
      timeout: 10_000,
    }
  );

  assert.equal(result.status, 0, `build-guarded should exit 0 on success. stderr: ${result.stderr?.toString()}`);
  // Two-phase lifecycle: on success, lock is rewritten to post_build_reload (NOT deleted).
  // The new MCP process clears it in main() via clearPostBuildReloadLock().
  assert.ok(existsSync(rootLock), "Lock file should exist (post_build_reload phase) after successful build");
  const lock = JSON.parse(readFileSync(rootLock, "utf-8"));
  assert.equal(lock.status, "post_build_reload", `Lock status should be 'post_build_reload', got: ${lock.status}`);
  assert.ok(typeof lock.tscCompletedAt === "string", "Lock should have tscCompletedAt timestamp");

  // Clean up so subsequent tests start fresh.
  rmSync(rootLock, { force: true });
});

// ── Test 8: Build-guard failure run → lock has status:"failed" ────────────────

test("build-guard: failure run → .rebuild.lock has status:'failed' after exit", () => {
  const rootLock = resolve(__dirname, "../.rebuild.lock");

  // Clean up any leftover lock.
  if (existsSync(rootLock)) rmSync(rootLock);

  const result = spawnSync(
    process.execPath,
    [BUILD_GUARDED],
    {
      env: {
        ...process.env,
        BUILD_TSC_CMD: "node -e process.exit(1)",
      },
      timeout: 10_000,
    }
  );

  assert.equal(result.status, 1, "build-guarded should exit 1 when tsc fails");
  assert.ok(existsSync(rootLock), "Lock file should exist after failed build");

  const lock = JSON.parse(readFileSync(rootLock, "utf-8"));
  assert.equal(lock.status, "failed", `Lock status should be 'failed', got: ${lock.status}`);
  assert.ok(typeof lock.error === "string", "Lock should have an error string");
  assert.ok(typeof lock.failedAt === "string", "Lock should have a failedAt timestamp");

  // Clean up the failure lock so subsequent runs start clean.
  rmSync(rootLock, { force: true });
});

// ── Test 9: post_build_reload lock blocks with phase:"reload" ─────────────────

test("post_build_reload lock → returns server_rebuilding with phase:'reload'", () => {
  const dir = makeTempDir();

  writeFileSync(lockPath(dir), JSON.stringify({
    status: "post_build_reload",
    pid: process.pid,
    tscCompletedAt: new Date().toISOString(),
    expectedDurationMs: 10_000,
    triggeredBy: "npm run build-guarded",
  }, null, 2), "utf-8");

  const result = checkRebuildLock(lockPath(dir));

  assert.ok(result !== null, "Should return a block, not null");
  assert.ok(!("warning" in result), "Should not be a stale warning");
  assert.equal(result.error, "server_rebuilding");
  assert.equal(result.phase, "reload", `phase should be 'reload', got: ${result.phase}`);
  assert.ok(result.retry_after_ms > 0, `retry_after_ms should be > 0, got ${result.retry_after_ms}`);
  assert.ok(result.reason.includes("reloading"), `reason should mention 'reloading', got: ${result.reason}`);

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 10: clearPostBuildReloadLock deletes the lock ────────────────────────

test("clearPostBuildReloadLock() deletes post_build_reload lock (simulates MCP server startup)", () => {
  const dir = makeTempDir();
  const lp = lockPath(dir);

  writeFileSync(lp, JSON.stringify({
    status: "post_build_reload",
    pid: process.pid,
    tscCompletedAt: new Date().toISOString(),
    expectedDurationMs: 10_000,
    triggeredBy: "test",
  }, null, 2), "utf-8");

  assert.ok(existsSync(lp), "Lock should exist before clearing");

  clearPostBuildReloadLock(lp);

  assert.equal(existsSync(lp), false, "Lock should be deleted after clearPostBuildReloadLock()");
  // Calling again on a cleared lock should not throw.
  assert.doesNotThrow(() => clearPostBuildReloadLock(lp), "clearPostBuildReloadLock is idempotent (no-op if no lock)");

  rmSync(dir, { recursive: true, force: true });
});
