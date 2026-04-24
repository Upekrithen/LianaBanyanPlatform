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
  readFileSync, writeFileSync, existsSync, renameSync, copyFileSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERIFY_SCRIPT = resolve(__dirname, "../scripts/verify-canonical.mjs");
const OVERVIEW_PATH = resolve(__dirname, "../index/overview.json");
const OVERVIEW_BAK  = resolve(__dirname, "../index/overview.json.k456bak");
const HOOK_PATH     = resolve(__dirname, "../../platform/src/hooks/useCanonicalStats.ts");

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

// ── Test D: K462 overview-only drift — knightSessions mismatch → exit 1 ───────
// Uses artifact-derived field knightPromptCount (not the old knightSessionCount/McpLogged).

test("drift detected: overview.knightPromptCount ≠ hook.knightSessions → exit 1 + DRIFT DETECTED", () => {
  if (!existsSync(OVERVIEW_PATH) || !existsSync(HOOK_PATH)) {
    console.warn("  ⚠ overview.json or hook missing — skipping test D.");
    return;
  }

  const originalOverview = readFileSync(OVERVIEW_PATH, "utf-8");
  const originalHook = readFileSync(HOOK_PATH, "utf-8");

  // Corrupt knightPromptCount in overview.json to a value that won't match the hook
  const corruptOverview = JSON.parse(originalOverview);
  corruptOverview.knightPromptCount = 7777;

  try {
    writeFileSync(OVERVIEW_PATH, JSON.stringify(corruptOverview, null, 2) + "\n", "utf-8");

    const result = runVerify();
    assert.equal(
      result.status, 1,
      `Expected exit 1 on overview-only drift. stdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
    assert.ok(
      result.stderr.includes("DRIFT DETECTED"),
      `Expected "DRIFT DETECTED" in stderr. Got:\n${result.stderr}`,
    );
    assert.ok(
      result.stderr.includes("knightSessions") || result.stderr.includes("knightPromptCount"),
      `Expected drift message to mention knightSessions/knightPromptCount. Got:\n${result.stderr}`,
    );
  } finally {
    writeFileSync(OVERVIEW_PATH, originalOverview, "utf-8");
    writeFileSync(HOOK_PATH, originalHook, "utf-8");
  }
});

// ── Test E: K462 — *McpLogged fields are ignored by verify (diagnostic-only) ────
// Corrupting knightSessionsMcpLogged / bishopSessionsMcpLogged must NOT cause drift.

test("McpLogged fields are diagnostic-only: corrupting them does not trigger DRIFT DETECTED", () => {
  if (!existsSync(OVERVIEW_PATH)) {
    console.warn("  ⚠ overview.json missing — skipping test E.");
    return;
  }

  const originalOverview = readFileSync(OVERVIEW_PATH, "utf-8");

  // Set *McpLogged to obviously wrong values — verify must still pass
  const corruptOverview = JSON.parse(originalOverview);
  corruptOverview.knightSessionsMcpLogged = 1;
  corruptOverview.bishopSessionsMcpLogged = 1;

  try {
    writeFileSync(OVERVIEW_PATH, JSON.stringify(corruptOverview, null, 2) + "\n", "utf-8");

    const result = runVerify();
    assert.equal(
      result.status, 0,
      `Expected exit 0 — *McpLogged fields must not be cross-checked. stdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
    assert.ok(
      result.stdout.includes("All canonical surfaces agree."),
      `Expected "All canonical surfaces agree." even with corrupted *McpLogged fields. Got:\n${result.stdout}`,
    );
  } finally {
    writeFileSync(OVERVIEW_PATH, originalOverview, "utf-8");
  }
});
