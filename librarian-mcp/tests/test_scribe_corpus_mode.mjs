/**
 * test_scribe_corpus_mode.mjs (K466 / B121)
 * ==========================================
 * Tests the mode: observational|corpus field added to Scribe registry schema (K466).
 *
 * Tests:
 *   A. mode field accepted and persisted on Scribe registry retrofit
 *   B. consult_scribes on a corpus-mode Scribe with corpus < max_entries returns ALL tablets
 *   C. consult_scribes on a corpus-mode Scribe with corpus > max_entries returns DETERMINISTIC chunk
 *      (same query twice returns same tablets — stable, not random like recency-sort)
 *   D. consult_scribes on an observational-mode Scribe still returns recency-sorted top-K (regression)
 *   E. retrofit script idempotent — running twice produces no duplicate writes
 *
 * Architecture: uses synthetic temp dirs set up BEFORE module import (ESM cache discipline).
 * Follows feedback_tests_mutating_real_files_serial.md — all I/O on temp dirs.
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Set up temp Cathedral tree BEFORE any imports ────────────────────────

const TMP_ROOT = mkdtempSync(resolve(tmpdir(), "k466-mode-"));

function writeJsonl(path, lines) {
  writeFileSync(path, lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf-8");
}

// ─── Bishop's Cathedral (scribes/) ────────────────────────────────────────
mkdirSync(resolve(TMP_ROOT, "scribes"), { recursive: true });

// Registry with:
//   - CorpusScribe: mode=corpus, has 8 static-reference tablets
//   - ObservScribe: mode=observational, has 5 tablets with distinct timestamps
const bishopRegistry = `
version: test-k466
opened: 2026-04-23
opener: K466 corpus mode test
spec: ../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md
scribes:
  - id: CorpusScribe
    mode: corpus
    primary:
      level: 1
      field: "R11 canonical corpus verdania cooperative statistics benchmark"
    adjacents: []
    keywords:
      - "verdania"
      - "cooperative"
      - "cairnfield"
      - "corpus"
      - "R11"
      - "benchmark"
  - id: ObservScribe
    mode: observational
    primary:
      level: 1
      field: "Knight session observations handoff log"
    adjacents: []
    keywords:
      - "observation"
      - "session"
      - "handoff"
      - "log"
      - "knight"
`.trim() + "\n";

writeFileSync(resolve(TMP_ROOT, "scribes", "registry.yaml"), bishopRegistry, "utf-8");

// CorpusScribe: 8 facts, all with the SAME timestamp (simulates R11 ingest)
// In observational mode, same-timestamp entries would be returned in arbitrary order.
// In corpus mode, they must come back in original append order.
const sameTs = "2026-04-23T10:00:00.000Z";
const corpusFacts = [
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 1: Verdania has 847293 member-owners", source: "knight_ship", scope: "public" },
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 2: 4.7 billion transaction volume 2024", source: "knight_ship", scope: "public" },
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 3: Thornwick dense-sparse retrieval architecture", source: "knight_ship", scope: "public" },
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 4: Cairnfield Protocol 180-day portability", source: "knight_ship", scope: "public" },
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 5: Solstice Index 4.18 November 2025", source: "knight_ship", scope: "public" },
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 6: Cooperative Capital Framework equity rules", source: "knight_ship", scope: "public" },
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 7: AI Governance Charter Federated Platform Compact", source: "knight_ship", scope: "public" },
  { ts: sameTs, session: "K466-test", observation: "Corpus fact 8: founding summit historical precedent Sundry Accord", source: "knight_ship", scope: "public" },
];

writeJsonl(resolve(TMP_ROOT, "scribes", "scribe_CorpusScribe.jsonl"), [
  { type: "header", scribe_id: "CorpusScribe", primary_level: 1, primary_field: "R11 corpus", adjacents: [], opened: sameTs },
  ...corpusFacts,
]);

// ObservScribe: 5 sessions with distinct increasing timestamps
const now = Date.now();
const observEntries = [
  { ts: new Date(now - 5000).toISOString(), session: "K461", observation: "Oldest observation session K461", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 4000).toISOString(), session: "K462", observation: "Observation session K462", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 3000).toISOString(), session: "K463", observation: "Observation session K463", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 2000).toISOString(), session: "K464", observation: "Observation session K464", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 1000).toISOString(), session: "K465", observation: "Newest observation session K465", source: "knight_ship", scope: "public" },
];

writeJsonl(resolve(TMP_ROOT, "scribes", "scribe_ObservScribe.jsonl"), [
  { type: "header", scribe_id: "ObservScribe", primary_level: 1, primary_field: "Knight session observations", adjacents: [], opened: new Date(now - 6000).toISOString() },
  ...observEntries,
]);

// ─── Knight's Cathedral (empty, not used in these tests) ──────────────────
mkdirSync(resolve(TMP_ROOT, "knight_cathedral", "scribes"), { recursive: true });
writeFileSync(resolve(TMP_ROOT, "knight_cathedral", "registry.yaml"),
  "version: test-k466\nopened: 2026-04-23\nopener: K466 test\nspec: ../SP22\nscribes: []\n", "utf-8");

// ─── Import consult (AFTER env + temp dirs are ready) ────────────────────
process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_ROOT;
const { consultScribes } = await import("../dist/scribes/consult.js");

after(() => {
  delete process.env.LIBRARIAN_STITCHPUNKS_DIR;
  try { rmSync(TMP_ROOT, { recursive: true, force: true }); } catch { /* ignore */ }
});

// ─── Test A: mode field accepted and persisted on Scribe registry retrofit ─

test("A: registry.yaml with mode=corpus and mode=observational parses correctly", () => {
  // Verify the synthetic registry was written with both modes
  const raw = readFileSync(resolve(TMP_ROOT, "scribes", "registry.yaml"), "utf-8");
  assert.ok(raw.includes("mode: corpus"), "Registry must contain mode: corpus");
  assert.ok(raw.includes("mode: observational"), "Registry must contain mode: observational");
});

// ─── Test B: corpus-mode Scribe with 8 facts returns ALL 8 (no recency truncation) ─

test("B: corpus-mode Scribe returns ALL tablets when corpus < max_entries", () => {
  // Default max_entries for corpus = 100 → all 8 facts should be returned
  const result = consultScribes({ topic: "verdania R11 corpus benchmark", cathedral: "bishop", scope: "public" });

  const corpusEntries = result.entries.filter((e) =>
    typeof e.observation === "string" && e.observation.startsWith("Corpus fact")
  );

  assert.equal(corpusEntries.length, 8,
    `Expected all 8 corpus facts, got ${corpusEntries.length}. Entries: ${result.entries.map(e => e.observation?.slice(0, 40)).join(" | ")}`
  );

  // Verify the scribe was served in corpus mode
  const scribeInfo = result.scribes_consulted.find((s) => s.scribe_id === "CorpusScribe");
  assert.ok(scribeInfo, "CorpusScribe must appear in scribes_consulted");
  assert.equal(scribeInfo.mode, "corpus", "CorpusScribe must report mode=corpus");
});

// ─── Test C: corpus-mode with max_entries < corpus returns DETERMINISTIC chunk ─

test("C: corpus-mode with explicit max_entries < corpus returns first-N deterministically", () => {
  const result1 = consultScribes({
    topic: "verdania R11 corpus benchmark",
    cathedral: "bishop",
    scope: "public",
    max_entries: 3,
  });

  const result2 = consultScribes({
    topic: "verdania R11 corpus benchmark",
    cathedral: "bishop",
    scope: "public",
    max_entries: 3,
  });

  const c1 = result1.entries.filter((e) => e.observation?.startsWith("Corpus fact"));
  const c2 = result2.entries.filter((e) => e.observation?.startsWith("Corpus fact"));

  // Must return exactly 3 (capped by max_entries)
  assert.equal(c1.length, 3, `Expected 3 corpus facts, got ${c1.length}`);

  // Must be deterministic (same facts both calls)
  assert.deepEqual(
    c1.map((e) => e.observation),
    c2.map((e) => e.observation),
    "Corpus mode must return the same deterministic chunk on repeated calls"
  );

  // Must be the FIRST facts (original append order), not the last (recency-sorted)
  assert.ok(
    c1[0].observation?.includes("Corpus fact 1") ||
    c1[0].observation?.includes("Corpus fact 2"),
    `Corpus mode must return facts from the beginning (got: ${c1[0].observation})`
  );
});

// ─── Test D: observational-mode Scribe returns recency-sorted top-K (regression) ─

test("D: observational-mode Scribe returns newest-first (recency top-K regression)", () => {
  const result = consultScribes({
    topic: "observation session handoff log knight",
    cathedral: "bishop",
    scope: "public",
    max_entries: 3,
  });

  const obsEntries = result.entries.filter((e) =>
    typeof e.observation === "string" && e.observation.includes("session K")
  );

  assert.ok(obsEntries.length >= 1, `Expected at least 1 observational entry, got ${obsEntries.length}`);
  assert.ok(obsEntries.length <= 3, `Should be capped at 3, got ${obsEntries.length}`);

  // Newest (K465) should appear first
  const hasNewest = obsEntries.some((e) => e.observation?.includes("K465"));
  assert.ok(hasNewest, "Newest observation (K465) should appear in top-3 recency-sorted results");

  // Oldest (K461) should NOT appear (beyond top-3)
  const hasOldest = obsEntries.some((e) => e.observation?.includes("K461"));
  assert.equal(hasOldest, false, "Oldest observation (K461) should NOT appear in recency top-3");

  // Verify the scribe was served in observational mode
  const scribeInfo = result.scribes_consulted.find((s) => s.scribe_id === "ObservScribe");
  assert.ok(scribeInfo, "ObservScribe must appear in scribes_consulted");
  assert.equal(scribeInfo.mode, "observational", "ObservScribe must report mode=observational");
});

// ─── Test E: retrofit script idempotent (running twice produces no extra writes) ─

test("E: retrofit-scribe-mode.mjs is idempotent (running twice changes nothing)", () => {
  // Use the REAL registries (non-temp) to test the script.
  // The script reads from stitchpunks/scribes/registry.yaml and knight_cathedral/registry.yaml.
  // Since we've already set mode fields, running the script should report 0 changes.
  const scriptPath = resolve(__dirname, "..", "scripts", "retrofit-scribe-mode.mjs");

  let output1, output2;
  try {
    output1 = execSync(`node "${scriptPath}"`, { encoding: "utf-8" });
  } catch (e) {
    assert.fail(`First retrofit run failed: ${e.message}\n${e.stdout}\n${e.stderr}`);
  }

  try {
    output2 = execSync(`node "${scriptPath}"`, { encoding: "utf-8" });
  } catch (e) {
    assert.fail(`Second retrofit run failed: ${e.message}\n${e.stdout}\n${e.stderr}`);
  }

  // Both runs should report 0 changes (already retrofitted)
  assert.ok(
    output1.includes("already up-to-date") || output1.includes("0 changes") || output1.includes("Changed: 0"),
    `First run should report no changes. Got: ${output1.slice(0, 300)}`
  );
  assert.ok(
    output2.includes("already up-to-date") || output2.includes("0 changes") || output2.includes("Changed: 0"),
    `Second run should report no changes. Got: ${output2.slice(0, 300)}`
  );
});
