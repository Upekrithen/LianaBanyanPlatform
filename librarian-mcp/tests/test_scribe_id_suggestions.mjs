/**
 * test_scribe_id_suggestions.mjs — KN084 / OG-018 regression tests
 * ==================================================================
 * Tests the scribe_log error path when a caller passes a read-only
 * pheromone artifact scribe ID (corpus snapshot or pre-supersede backup)
 * instead of the registered base scribe ID.
 *
 * The server-side logic pattern-matches suffix variants and returns a
 * helpful suggestion pointing to the correct base scribe. This test
 * exercises that path by calling appendScribeEntry (cathedral.ts) which
 * throws on unknown scribes, and independently verifying the pattern
 * matching logic.
 *
 * OG-018 root cause: Bishop tried `scribe_log(scribe_id="R11_corpus")`
 * based on Pheromone Detective hits. The correct write target is "R11";
 * R11_corpus is a frozen corpus snapshot tablet, not an active write target.
 *
 * Run: node --test tests/test_scribe_id_suggestions.mjs  (after npm run build)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_STITCHPUNKS = resolve(__dirname, "..", "stitchpunks");

// ── Temp Cathedral root (so real tablets are never touched) ──────────────────
const TMP_ROOT = mkdtempSync(resolve(tmpdir(), "kn084-cathedral-"));
mkdirSync(resolve(TMP_ROOT, "scribes"), { recursive: true });
mkdirSync(resolve(TMP_ROOT, "data"), { recursive: true });
copyFileSync(
  resolve(REPO_STITCHPUNKS, "scribes", "registry.yaml"),
  resolve(TMP_ROOT, "scribes", "registry.yaml"),
);
process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_ROOT;

const { appendScribeEntry } = await import("../dist/scribes/cathedral.js");
const { getScribe } = await import("../dist/scribes/registry.js");

after(() => {
  try { rmSync(TMP_ROOT, { recursive: true, force: true }); } catch { /* ignore */ }
});

// ── The pattern-matching logic ────────────────────────────────────────────────
// Mirror the inline logic from server.ts scribe_log handler so we can test it
// independently of the MCP layer.
const READ_ONLY_SUFFIX_PATTERNS = [
  /^(.+?)_corpus$/,
  /^(.+?)_pre_.+_backup$/,
  /^(.+?)_backup$/,
];

function suggestBaseScribe(scribe_id) {
  for (const pattern of READ_ONLY_SUFFIX_PATTERNS) {
    const m = scribe_id.match(pattern);
    if (m && m[1] && getScribe(m[1])) {
      return m[1];
    }
  }
  return undefined;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("R11 is registered as base scribe", () => {
  assert.ok(getScribe("R11"), "R11 must be in registry.yaml");
});

test("R12Cranewell is registered as base scribe", () => {
  assert.ok(getScribe("R12Cranewell"), "R12Cranewell must be in registry.yaml");
});

test("R11_corpus is NOT a registered scribe (read-only artifact)", () => {
  assert.equal(getScribe("R11_corpus"), null);
});

test("R11_pre_K535_backup is NOT a registered scribe (read-only artifact)", () => {
  assert.equal(getScribe("R11_pre_K535_backup"), null);
});

test("suggestion for R11_corpus → R11", () => {
  assert.equal(suggestBaseScribe("R11_corpus"), "R11");
});

test("suggestion for R11_pre_K535_backup → R11", () => {
  assert.equal(suggestBaseScribe("R11_pre_K535_backup"), "R11");
});

test("suggestion for R11_pre_K_MJ_KP_backup → R11", () => {
  assert.equal(suggestBaseScribe("R11_pre_K_MJ_KP_backup"), "R11");
});

test("suggestion for R12Cranewell_backup → R12Cranewell", () => {
  assert.equal(suggestBaseScribe("R12Cranewell_backup"), "R12Cranewell");
});

test("no suggestion for completely unknown scribe Foo", () => {
  assert.equal(suggestBaseScribe("Foo"), undefined);
});

test("no suggestion for unknown scribe with _corpus suffix whose base is not registered", () => {
  assert.equal(suggestBaseScribe("Nonexistent_corpus"), undefined);
});

test("appendScribeEntry throws for R11_corpus with unregistered Scribe error", () => {
  assert.throws(() => {
    appendScribeEntry({
      scribe_id: "R11_corpus",
      session: "KN084",
      observation: "Test: R11_corpus should be rejected as unregistered.",
      source: "knight_ship",
    });
  }, /unregistered Scribe/);
});

test("appendScribeEntry succeeds for base R11", () => {
  const r = appendScribeEntry({
    scribe_id: "R11",
    session: "KN084",
    observation: "KN084 self-test: base R11 write accepted as expected.",
    source: "knight_ship",
  });
  assert.equal(r.ok, true);
});
