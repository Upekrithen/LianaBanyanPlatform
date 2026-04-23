/**
 * test_scribe_tools.mjs (K436)
 * ============================
 * Happy path + error path for log_tidbit (appendTidbit), scribe_log
 * (appendScribeEntry + unknown-Scribe rejection), and fates_route
 * (appendFatesLog roundtrip).
 *
 * Uses a per-process temp directory under os.tmpdir() so production tablets
 * are never touched. The temp dir is seeded by copying registry.yaml from the
 * real stitchpunks dir. LIBRARIAN_STITCHPUNKS_DIR env var must be set BEFORE
 * the modules under test are loaded.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_STITCHPUNKS = resolve(__dirname, "..", "stitchpunks");

// Build a clean temp Cathedral root and point the env var at it BEFORE loading
// the modules under test.
const TMP_ROOT = mkdtempSync(resolve(tmpdir(), "k436-cathedral-"));
mkdirSync(resolve(TMP_ROOT, "scribes"), { recursive: true });
mkdirSync(resolve(TMP_ROOT, "data"), { recursive: true });
copyFileSync(
  resolve(REPO_STITCHPUNKS, "scribes", "registry.yaml"),
  resolve(TMP_ROOT, "scribes", "registry.yaml"),
);
process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_ROOT;

const { appendTidbit, appendScribeEntry, appendFatesLog,
        readTidbits, readTablet, readFatesLog } = await import("../dist/scribes/cathedral.js");
const { getScribe } = await import("../dist/scribes/registry.js");
const { runFates } = await import("../dist/scribes/fates.js");

after(() => {
  try {
    rmSync(TMP_ROOT, { recursive: true, force: true });
  } catch {
    // Ignore cleanup failures on Windows file locking.
  }
});

const SESSION = "K9999";

test("appendTidbit happy path: line_count grows, record is readable", () => {
  const before = readTidbits().length;
  const r = appendTidbit({
    agent: "KNIGHT",
    session: SESSION,
    category: "verify_file_exists",
    observation: "K436 self-test: confirmed test runner can append a tidbit to the ledger.",
    artifact: "tests/test_scribe_tools.mjs",
  });
  assert.equal(r.ok, true);
  assert.equal(r.record.bridle_rule, 2);
  assert.ok(r.line_count > before);

  const mine = readTidbits({ session: SESSION });
  assert.ok(mine.length >= 1);
  const last = mine[mine.length - 1];
  assert.equal(last.category, "verify_file_exists");
});

test("appendScribeEntry happy path: writes to a registered Scribe's tablet", () => {
  assert.ok(getScribe("BRIDLE"), "BRIDLE must be registered");
  const before = readTablet("BRIDLE").length;
  const r = appendScribeEntry({
    scribe_id: "BRIDLE",
    session: SESSION,
    observation: "K436 self-test: Scribe append round-trip verified.",
    source: "knight_ship",
    canonical_ref: "tests/test_scribe_tools.mjs",
  });
  assert.equal(r.ok, true);
  assert.ok(r.line_count > 0);
  const after = readTablet("BRIDLE");
  assert.equal(after.length, before + 1);
  assert.equal(after[after.length - 1].observation.startsWith("K436 self-test"), true);
});

test("appendFatesLog happy path: routing record persists", () => {
  const result = runFates(
    "BRIDLE Rule 2 verify before asserting — sample text for the K436 self-test."
  );
  const r = appendFatesLog({
    session: SESSION,
    agent: "KNIGHT",
    clotho_themes: result.clotho_themes,
    lachesis_scores: result.lachesis_scores,
    atropos_dispatch: result.atropos_dispatch.map((d) => ({
      scribe_id: d.scribe_id,
      directive: d.directive,
      suggested_observation: d.suggested_observation,
    })),
    coverage_gaps: result.coverage_gaps,
    source_exchange: "K436 test_scribe_tools.mjs",
  });
  assert.equal(r.ok, true);
  const mine = readFatesLog({ session: SESSION });
  assert.ok(mine.length >= 1);
});

test("scribe_log error path: unknown scribe id is rejected (cathedral throws)", () => {
  assert.throws(() => {
    appendScribeEntry({
      scribe_id: "DEFINITELY_NOT_REGISTERED",
      session: SESSION,
      observation: "Should never get written to disk.",
      source: "knight_ship",
    });
  }, /unregistered Scribe/);
});

test("appendTidbit injects ts and bridle_rule:2 (schema invariant)", () => {
  const r = appendTidbit({
    agent: "KNIGHT",
    session: SESSION,
    category: "verify_symbol_exists",
    observation: "K436 self-test: schema invariants hold (ts ISO + bridle_rule=2).",
  });
  assert.match(r.record.ts, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  assert.equal(r.record.bridle_rule, 2);
});
