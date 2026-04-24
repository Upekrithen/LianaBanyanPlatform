/**
 * test_canonical_codegen.mjs — K456(B121): regression tests for codegen-canonical-hook.mjs
 * ==========================================================================================
 * Three cases:
 *   A. Idempotent when in sync: running codegen twice produces identical hook content.
 *   B. Self-heals drift: corrupted innovationCount in hook → codegen restores canonical value.
 *   C. Non-YAML fields untouched: founderAge (hand-maintained) is not overwritten by codegen.
 *
 * Run: node --test tests/test_canonical_codegen.mjs (after npm run build)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CODEGEN_SCRIPT = resolve(__dirname, "../scripts/codegen-canonical-hook.mjs");
const HOOK_PATH = resolve(__dirname, "../../platform/src/hooks/useCanonicalStats.ts");
const OVERVIEW_PATH = resolve(__dirname, "../index/overview.json");

function runCodegen() {
  return spawnSync(process.execPath, [CODEGEN_SCRIPT], {
    encoding: "utf-8",
    timeout: 15_000,
    cwd: resolve(__dirname, ".."),
  });
}

// ── Test A: idempotent when already in sync ───────────────────────────────────

test("codegen is idempotent: running twice produces identical hook content", () => {
  const before = readFileSync(HOOK_PATH, "utf-8");
  try {
    const r1 = runCodegen();
    assert.equal(r1.status, 0, `First codegen run failed. stderr:\n${r1.stderr}`);
    const after1 = readFileSync(HOOK_PATH, "utf-8");

    const r2 = runCodegen();
    assert.equal(r2.status, 0, `Second codegen run failed. stderr:\n${r2.stderr}`);
    const after2 = readFileSync(HOOK_PATH, "utf-8");

    assert.equal(after1, after2, "Hook content should be identical after two consecutive codegen runs");
  } finally {
    writeFileSync(HOOK_PATH, before, "utf-8");
  }
});

// ── Test B: self-heals drift in a YAML-sourced field ─────────────────────────

test("self-heals drift: corrupted innovationCount is restored to canonical value", () => {
  const original = readFileSync(HOOK_PATH, "utf-8");
  // Extract the real canonical innovationCount value from the current hook (post-codegen)
  const m = original.match(/\binnovationCount\s*:\s*(\d[\d_]*)/);
  assert.ok(m, "innovationCount not found in hook");
  const canonical = parseInt(m[1].replace(/_/g, ""), 10);

  const corrupted = original.replace(
    /(\binnovationCount\s*:\s*)\d[\d_]*/,
    "$19999",
  );
  assert.notEqual(corrupted, original, "Corruption step must change the file");

  try {
    writeFileSync(HOOK_PATH, corrupted, "utf-8");

    const result = runCodegen();
    assert.equal(result.status, 0, `codegen failed. stderr:\n${result.stderr}`);

    const restored = readFileSync(HOOK_PATH, "utf-8");
    const mRestored = restored.match(/\binnovationCount\s*:\s*(\d[\d_]*)/);
    assert.ok(mRestored, "innovationCount not found after codegen");
    const restoredVal = parseInt(mRestored[1].replace(/_/g, ""), 10);

    assert.equal(
      restoredVal, canonical,
      `Expected innovationCount restored to ${canonical}, got ${restoredVal}`,
    );
  } finally {
    writeFileSync(HOOK_PATH, original, "utf-8");
  }
});

// ── Test C: non-YAML fields (founderAge) are left untouched ──────────────────
// Note: knightSessions and bishopSessions are now overview-sourced (K460), not
// YAML-sourced. They should be updated by codegen from overview.json.

test("non-YAML field founderAge is preserved unchanged after codegen", () => {
  const original = readFileSync(HOOK_PATH, "utf-8");
  // Corrupt founderAge (hand-maintained, not YAML-sourced)
  const corrupted = original.replace(
    /(\bfounderAge\s*:\s*)\d+/,
    "$1999",
  );
  assert.notEqual(corrupted, original, "founderAge corruption step must change the file");

  try {
    writeFileSync(HOOK_PATH, corrupted, "utf-8");

    const result = runCodegen();
    assert.equal(result.status, 0, `codegen failed. stderr:\n${result.stderr}`);

    const afterCodegen = readFileSync(HOOK_PATH, "utf-8");
    const mAge = afterCodegen.match(/\bfounderAge\s*:\s*(\d+)/);
    assert.ok(mAge, "founderAge not found after codegen");
    assert.equal(
      parseInt(mAge[1], 10), 999,
      `Expected founderAge=999 preserved, got ${mAge[1]} (codegen must not overwrite hand-maintained fields)`,
    );
  } finally {
    writeFileSync(HOOK_PATH, original, "utf-8");
  }
});

// ── Test D: overview-sourced codegen rewrites stale knightSessions / bishopSessions ─
// Sources are the artifact-derived fields (knightPromptCount / bishopSessionCount),
// NOT the *McpLogged diagnostic fields (K462 semantic swap).

test("overview-sourced codegen: stale knightSessions and bishopSessions are updated from overview.json", () => {
  if (!existsSync(OVERVIEW_PATH)) {
    console.warn("  ⚠ overview.json missing — run `npm run rebuild:full` first. Skipping test D.");
    return;
  }

  const overview = JSON.parse(readFileSync(OVERVIEW_PATH, "utf-8"));
  const canonicalKnight = overview.knightPromptCount;
  const canonicalBishop = overview.bishopSessionCount;
  if (typeof canonicalKnight !== "number" || typeof canonicalBishop !== "number") {
    console.warn("  ⚠ overview.json missing knightPromptCount/bishopSessionCount — run `npm run rebuild:full`. Skipping test D.");
    return;
  }

  const original = readFileSync(HOOK_PATH, "utf-8");
  const corrupted = original
    .replace(/(\bknightSessions\s*:\s*)\d[\d_]*/, "$19999")
    .replace(/(\bbishopSessions\s*:\s*)\d[\d_]*/, "$18888");
  assert.notEqual(corrupted, original, "Corruption step must change the file");

  try {
    writeFileSync(HOOK_PATH, corrupted, "utf-8");

    const result = runCodegen();
    assert.equal(result.status, 0, `codegen failed. stderr:\n${result.stderr}`);

    const restored = readFileSync(HOOK_PATH, "utf-8");
    const mKnight = restored.match(/\bknightSessions\s*:\s*(\d[\d_]*)/);
    const mBishop = restored.match(/\bbishopSessions\s*:\s*(\d[\d_]*)/);
    assert.ok(mKnight, "knightSessions not found after codegen");
    assert.ok(mBishop, "bishopSessions not found after codegen");
    assert.equal(
      parseInt(mKnight[1].replace(/_/g, ""), 10), canonicalKnight,
      `knightSessions should be ${canonicalKnight} (from overview.knightPromptCount), got ${mKnight[1]}`,
    );
    assert.equal(
      parseInt(mBishop[1].replace(/_/g, ""), 10), canonicalBishop,
      `bishopSessions should be ${canonicalBishop} (from overview.bishopSessionCount), got ${mBishop[1]}`,
    );
  } finally {
    writeFileSync(HOOK_PATH, original, "utf-8");
  }
});

// ── Test F: codegen reads artifact-derived fields, not *McpLogged diagnostic fields ─
// Verifies the K462 semantic split: knightPromptCount/bishopSessionCount drive the hook,
// while knightSessionsMcpLogged/bishopSessionsMcpLogged are left alone.

test("codegen reads knightPromptCount and bishopSessionCount, not *McpLogged fields", () => {
  if (!existsSync(OVERVIEW_PATH)) {
    console.warn("  ⚠ overview.json missing — run `npm run rebuild:full` first. Skipping test F.");
    return;
  }

  const originalOverview = readFileSync(OVERVIEW_PATH, "utf-8");
  const originalHook = readFileSync(HOOK_PATH, "utf-8");

  // Patch overview.json so *McpLogged fields are set to 1 and artifact fields to 9999.
  // After codegen, hook should reflect 9999 (artifact), not 1 (MCP-logged).
  const overrideOverview = JSON.parse(originalOverview);
  overrideOverview.knightPromptCount = 9999;
  overrideOverview.bishopSessionCount = 8888;
  overrideOverview.knightSessionsMcpLogged = 1;
  overrideOverview.bishopSessionsMcpLogged = 1;

  try {
    writeFileSync(OVERVIEW_PATH, JSON.stringify(overrideOverview, null, 2), "utf-8");

    const result = runCodegen();
    assert.equal(result.status, 0, `codegen failed. stderr:\n${result.stderr}`);

    const afterHook = readFileSync(HOOK_PATH, "utf-8");
    const mKnight = afterHook.match(/\bknightSessions\s*:\s*(\d[\d_]*)/);
    const mBishop = afterHook.match(/\bbishopSessions\s*:\s*(\d[\d_]*)/);
    assert.ok(mKnight, "knightSessions not found after codegen");
    assert.ok(mBishop, "bishopSessions not found after codegen");

    assert.equal(
      parseInt(mKnight[1].replace(/_/g, ""), 10), 9999,
      `knightSessions should be 9999 (from knightPromptCount), got ${mKnight[1]} — codegen must not use knightSessionsMcpLogged`,
    );
    assert.equal(
      parseInt(mBishop[1].replace(/_/g, ""), 10), 8888,
      `bishopSessions should be 8888 (from bishopSessionCount), got ${mBishop[1]} — codegen must not use bishopSessionsMcpLogged`,
    );
  } finally {
    writeFileSync(OVERVIEW_PATH, originalOverview, "utf-8");
    writeFileSync(HOOK_PATH, originalHook, "utf-8");
  }
});

// ── Test E: overview-sourced codegen is idempotent when already in sync ───────

test("overview-sourced codegen: idempotent when knightSessions/bishopSessions already match overview", () => {
  if (!existsSync(OVERVIEW_PATH)) {
    console.warn("  ⚠ overview.json missing — run `npm run rebuild:full` first. Skipping test E.");
    return;
  }

  const before = readFileSync(HOOK_PATH, "utf-8");
  try {
    const r1 = runCodegen();
    assert.equal(r1.status, 0, `First codegen run failed. stderr:\n${r1.stderr}`);
    const after1 = readFileSync(HOOK_PATH, "utf-8");

    const r2 = runCodegen();
    assert.equal(r2.status, 0, `Second codegen run failed. stderr:\n${r2.stderr}`);
    const after2 = readFileSync(HOOK_PATH, "utf-8");

    assert.equal(after1, after2, "Hook content should be identical after two consecutive codegen runs (idempotent)");
  } finally {
    writeFileSync(HOOK_PATH, before, "utf-8");
  }
});
