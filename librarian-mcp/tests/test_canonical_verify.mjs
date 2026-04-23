/**
 * test_canonical_verify.mjs — K456(B121): regression tests for verify-canonical.mjs
 * ==================================================================================
 * Three cases:
 *   A. Happy path: repo in sync → exit 0, prints "All canonical surfaces agree."
 *   B. Drift fails: overview.json corrupted → exit 1, stderr contains "DRIFT DETECTED"
 *   C. Missing overview is a warning, not failure → exit 0 even without overview.json
 *
 * Run: node --test tests/test_canonical_verify.mjs (after npm run build)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync, writeFileSync, existsSync, renameSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERIFY_SCRIPT = resolve(__dirname, "../scripts/verify-canonical.mjs");
const OVERVIEW_PATH = resolve(__dirname, "../index/overview.json");
const OVERVIEW_BAK  = resolve(__dirname, "../index/overview.json.k456bak");

function runVerify() {
  return spawnSync(process.execPath, [VERIFY_SCRIPT], {
    encoding: "utf-8",
    timeout: 15_000,
    cwd: resolve(__dirname, ".."),
  });
}

// ── Test A: happy path — all three surfaces in sync → exit 0 ─────────────────

test("happy path: all canonical surfaces in sync → exit 0 + confirm message", () => {
  const result = runVerify();
  assert.equal(
    result.status, 0,
    `Expected exit 0 (all in sync). stdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  assert.ok(
    result.stdout.includes("All canonical surfaces agree."),
    `Expected "All canonical surfaces agree." in stdout. Got:\n${result.stdout}`,
  );
});

// ── Test B: corrupted overview.json → exit 1 + "DRIFT DETECTED" in stderr ────

test("drift detected: corrupted overview.json → exit 1 + DRIFT DETECTED in stderr", () => {
  const original = readFileSync(OVERVIEW_PATH, "utf-8");
  const corrupt = JSON.parse(original);
  corrupt.innovationCount = 9999;

  try {
    writeFileSync(OVERVIEW_PATH, JSON.stringify(corrupt, null, 2) + "\n", "utf-8");

    const result = runVerify();
    assert.equal(
      result.status, 1,
      `Expected exit 1 on drift. stdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
    assert.ok(
      result.stderr.includes("DRIFT DETECTED"),
      `Expected "DRIFT DETECTED" in stderr. Got:\n${result.stderr}`,
    );
  } finally {
    writeFileSync(OVERVIEW_PATH, original, "utf-8");
  }
});

// ── Test C: missing overview.json → exit 0 (warning only, not failure) ────────

test("missing overview.json → exit 0 (fresh-checkout ergonomics preserved)", () => {
  assert.ok(existsSync(OVERVIEW_PATH), "overview.json must exist before this test renames it");
  renameSync(OVERVIEW_PATH, OVERVIEW_BAK);

  try {
    const result = runVerify();
    assert.equal(
      result.status, 0,
      `Expected exit 0 when overview.json absent. stdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
    // Should warn, not hard-fail
    const combined = result.stdout + result.stderr;
    assert.ok(
      combined.includes("missing") || combined.includes("Skipping"),
      `Expected a warning about missing overview.json. Combined:\n${combined}`,
    );
  } finally {
    renameSync(OVERVIEW_BAK, OVERVIEW_PATH);
  }
});
