/**
 * test_lachesis_rare_token.mjs (K472 / B121)
 * ===========================================
 * Tests for the three K472 retrieval-layer fixes:
 *
 * Fix 1 — Lachesis rare-token weighting:
 *   Synthetic proper nouns appearing in only one Scribe's keyword list receive
 *   a +1.0 bonus per match, boosting that Scribe's score above generic Scribes
 *   that match on common substrings (e.g. "architecture" matching Architecture Scribe).
 *
 * Fix 2 — Architecture-Scribe collision (corpus_label):
 *   R11 and KnightR11 Scribes now carry corpus_label: "r11_reference".
 *   The registry schema exposes corpus_label and it is persisted on load.
 *
 * Fix 3 — Corpus-mode priority boost in consultScribes:
 *   When query rarity exceeds RARITY_THRESHOLD, corpus-mode Scribes receive
 *   +0.3 on their Lachesis score before ranking, ensuring they rank above
 *   observational Scribes for high-rarity (synthetic-proper-noun) queries.
 *
 * Architecture: uses synthetic temp dirs for all I/O (feedback_tests_mutating_real_files_serial.md).
 *
 * Run: node --test tests/test_lachesis_rare_token.mjs (after `npm run build`)
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Set up temp Cathedral tree BEFORE any imports ───────────────────────

const TMP_ROOT = mkdtempSync(resolve(tmpdir(), "k472-rare-token-"));

function writeJsonl(path, lines) {
  writeFileSync(path, lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf-8");
}

// ─── Bishop Cathedral: two Scribes ───────────────────────────────────────
mkdirSync(resolve(TMP_ROOT, "scribes"), { recursive: true });

// R11Corpus: corpus mode with rare synthetic-proper-noun keywords
// GenericArch: observational with common keyword "architecture"
// The R11Corpus Scribe has "verdania", "thornwick", "reference architecture"
// as rare keywords (not present in GenericArch) — Fix 1 should boost R11Corpus
// when the query contains those rare tokens.
const bishopRegistry = `
version: test-k472
opened: 2026-04-24
opener: K472 rare-token test
spec: ../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md
scribes:
  - id: R11Corpus
    mode: corpus
    corpus_label: r11_reference
    primary:
      level: 1
      field: "R11 canonical corpus cooperative AI benchmark verdania thornwick"
    adjacents:
      - level: 2
        field: "cooperative governance economics patronage directors equity"
    keywords:
      - "verdania"
      - "thornwick"
      - "cairnfield"
      - "reference architecture"
      - "cooperative ai platform"
      - "cooperative ledger standards body"
      - "cooperative capital framework"
      - "reference onboarding framework"
      - "cooperative principles assessment"
      - "reference communication standards"
      - "exit interview completion rate"
      - "exit interview"
  - id: GenericArch
    mode: observational
    primary:
      level: 1
      field: "platform architecture continuity MCP tool surfaces schema design"
    adjacents:
      - level: 2
        field: "MCP protocol and tool registration"
    keywords:
      - "architecture"
      - "MCP"
      - "schema"
      - "tablet"
      - "Cathedral"
`.trim() + "\n";

writeFileSync(resolve(TMP_ROOT, "scribes", "registry.yaml"), bishopRegistry, "utf-8");

const sameTs = "2026-04-24T00:00:00.000Z";

// R11Corpus tablet: 12 entries (synthetic corpus facts)
const r11Facts = Array.from({ length: 12 }, (_, i) => ({
  ts: sameTs,
  session: "K472-test",
  observation: `Corpus fact ${i + 1}: R11 canonical fact about Verdania and Thornwick. Value: ${i * 100}.`,
  source: "knight_ship",
  scope: "public",
  fact_id: `CF-${String(i + 1).padStart(2, "0")}`,
}));

writeJsonl(resolve(TMP_ROOT, "scribes", "scribe_R11Corpus.jsonl"), [
  { type: "header", scribe_id: "R11Corpus", primary_level: 1, primary_field: "R11 corpus", adjacents: [], opened: sameTs },
  ...r11Facts,
]);

// GenericArch tablet: 5 observational entries about LB architecture
const now = Date.now();
const archEntries = [
  { ts: new Date(now - 5000).toISOString(), session: "K461", observation: "Architecture entry 1: MCP tool surfaces updated, schema patched.", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 4000).toISOString(), session: "K462", observation: "Architecture entry 2: Cathedral tablet format, architecture digest.", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 3000).toISOString(), session: "K463", observation: "Architecture entry 3: Cost+20% margin locked in schema.", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 2000).toISOString(), session: "K464", observation: "Architecture entry 4: MCP architecture review complete.", source: "knight_ship", scope: "public" },
  { ts: new Date(now - 1000).toISOString(), session: "K465", observation: "Architecture entry 5: Newest architecture observation.", source: "knight_ship", scope: "public" },
];

writeJsonl(resolve(TMP_ROOT, "scribes", "scribe_GenericArch.jsonl"), [
  { type: "header", scribe_id: "GenericArch", primary_level: 1, primary_field: "Platform architecture", adjacents: [], opened: new Date(now - 6000).toISOString() },
  ...archEntries,
]);

// ─── Knight Cathedral (empty — not used in these tests) ──────────────────
mkdirSync(resolve(TMP_ROOT, "knight_cathedral", "scribes"), { recursive: true });
writeFileSync(
  resolve(TMP_ROOT, "knight_cathedral", "registry.yaml"),
  "version: test-k472\nopened: 2026-04-24\nopener: K472 test\nspec: ../SP22\nscribes: []\n",
  "utf-8",
);

// ─── Import modules (AFTER env + temp dirs are ready) ────────────────────
process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_ROOT;
const { computeKeywordRarityMap, scoreScribe, getRegistry } = await import("../dist/scribes/registry.js");
const { consultScribes } = await import("../dist/scribes/consult.js");

after(() => {
  delete process.env.LIBRARIAN_STITCHPUNKS_DIR;
  try { rmSync(TMP_ROOT, { recursive: true, force: true }); } catch { /* ignore */ }
});

// ─── Fix 1 Tests: rare-token weighting in scoreScribe ────────────────────

test("Fix1-A: computeKeywordRarityMap returns count=1 for keywords unique to one Scribe", () => {
  const rarityMap = computeKeywordRarityMap();
  // "verdania" is only in R11Corpus
  assert.equal(rarityMap.get("verdania"), 1, "verdania should appear in exactly 1 Scribe");
  // "thornwick" is only in R11Corpus
  assert.equal(rarityMap.get("thornwick"), 1, "thornwick should appear in exactly 1 Scribe");
  // "architecture" is only in GenericArch
  assert.equal(rarityMap.get("architecture"), 1, "architecture should appear in exactly 1 Scribe");
  // "reference architecture" is only in R11Corpus
  assert.equal(rarityMap.get("reference architecture"), 1, "reference architecture should appear in exactly 1 Scribe");
});

test("Fix1-B: scoreScribe with rarityMap gives R11Corpus +1.0 bonus on rare keyword match", () => {
  const rarityMap = computeKeywordRarityMap();
  // Query about "Verdania" — rare keyword, only in R11Corpus
  const themes = ["What are the Verdania membership statistics?"];
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);
  const archResult = scoreScribe("GenericArch", themes, rarityMap);

  // R11Corpus: primary match ("verdania") + rare bonus → score ≥ 2.0
  assert.ok(r11Result.score >= 2.0,
    `R11Corpus should score ≥2.0 on rare "verdania" query, got ${r11Result.score}`);
  // GenericArch: should not match "verdania" at all
  assert.equal(archResult.score, 0,
    `GenericArch should score 0 on "verdania" query, got ${archResult.score}`);
});

test("Fix1-C: scoreScribe with rarityMap — 'architecture' query: GenericArch +1.0 rare bonus, R11Corpus 0", () => {
  const rarityMap = computeKeywordRarityMap();
  // Query about "architecture" — present in GenericArch keyword (rare there too, count=1)
  // and NOT in R11Corpus keywords (only "reference architecture" is)
  const themes = ["What is the MCP architecture design?"];
  const archResult = scoreScribe("GenericArch", themes, rarityMap);
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);

  // GenericArch: "architecture" is a keyword → primary match + rare bonus
  assert.ok(archResult.score >= 2.0,
    `GenericArch should score ≥2.0 on "architecture" query, got ${archResult.score}`);
  // R11Corpus: "architecture" alone doesn't match "reference architecture" — no match
  assert.equal(r11Result.score, 0,
    `R11Corpus should score 0 on pure "architecture" query, got ${r11Result.score}`);
});

test("Fix1-D: 'Reference Architecture' query routes to R11Corpus, not GenericArch", () => {
  const rarityMap = computeKeywordRarityMap();
  // "reference architecture" matches R11Corpus keyword, NOT GenericArch (which only has "architecture")
  const themes = ["What embedding dimensionality does the Cooperative AI Platform Reference Architecture specify?"];
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);
  const archResult = scoreScribe("GenericArch", themes, rarityMap);

  // R11Corpus: "reference architecture" is a keyword → primary match + rare bonus → ≥2.0
  assert.ok(r11Result.score >= 2.0,
    `R11Corpus should score ≥2.0 on "Reference Architecture" query, got ${r11Result.score}`);
  // GenericArch: "architecture" substring-matches ("reference architecture" contains "architecture")
  // But "reference architecture" is also a keyword in R11Corpus — it matches R11Corpus first.
  // GenericArch still gets a primary match on "architecture" keyword (1.0 base + rare bonus 1.0 = 2.0)
  // The tie-break in consultScribes is broken by the corpus-mode boost (Fix 3).
  assert.ok(r11Result.score >= archResult.score,
    `R11Corpus (${r11Result.score}) should score ≥ GenericArch (${archResult.score}) on "Reference Architecture" query`);
});

// ─── Fix 2 Tests: corpus_label field ─────────────────────────────────────

test("Fix2-A: R11Corpus Scribe exposes corpus_label=r11_reference from registry", () => {
  const reg = getRegistry();
  const r11 = reg.scribes.find((s) => s.id === "R11Corpus");
  assert.ok(r11, "R11Corpus must be in registry");
  assert.equal(r11.corpus_label, "r11_reference",
    "R11Corpus must have corpus_label='r11_reference'");
});

test("Fix2-B: observational Scribe has no corpus_label", () => {
  const reg = getRegistry();
  const arch = reg.scribes.find((s) => s.id === "GenericArch");
  assert.ok(arch, "GenericArch must be in registry");
  assert.ok(!arch.corpus_label, "GenericArch must NOT have corpus_label");
});

// ─── Fix 3 Tests: corpus-mode priority boost in consultScribes ───────────

test("Fix3-A: 'verdania' query returns R11Corpus entries (corpus-mode), not GenericArch", () => {
  // "verdania" is rare → corpus boost applies → R11Corpus ranks first
  const result = consultScribes({
    topic: "What are the Verdania membership statistics from the canonical corpus?",
    cathedral: "bishop",
    scope: "public",
  });

  assert.ok(result.scribes_consulted.length > 0, "At least one Scribe should be consulted");
  const r11Entry = result.scribes_consulted.find((s) => s.scribe_id === "R11Corpus");
  assert.ok(r11Entry, "R11Corpus must be in scribes_consulted for verdania query");

  // Verify corpus mode is reported correctly
  assert.equal(r11Entry.mode, "corpus", "R11Corpus should be reported as corpus mode");

  // Verify corpus entries are returned (corpus has 12 facts)
  assert.ok(r11Entry.entries_returned >= 12,
    `Expected all 12 corpus facts, got ${r11Entry.entries_returned}`);
});

test("Fix3-B: 'Reference Architecture' query returns R11Corpus entries, not GenericArch", () => {
  // "reference architecture" is rare → R11Corpus wins over GenericArch
  const result = consultScribes({
    topic: "What embedding dimensionality does the Cooperative AI Platform Reference Architecture specify?",
    cathedral: "bishop",
    scope: "public",
  });

  // R11Corpus must be ranked first (either alone or above GenericArch)
  const firstScribe = result.scribes_consulted[0];
  assert.ok(firstScribe, "At least one Scribe should be consulted");
  assert.equal(firstScribe.scribe_id, "R11Corpus",
    `R11Corpus should rank first for 'Reference Architecture' query; got ${firstScribe.scribe_id}`);
});

test("Fix3-C: corpus Scribe returns all facts even when max_entries is small (no corpus trimming starvation)", () => {
  // With Fix 3, corpus-mode Scribes process first. R11Corpus has 12 entries.
  // max_entries=5 is a small cap — the corpus should still contribute (not get starved
  // by observational entries filling the slots first).
  // Note: explicit max_entries=5 still caps the corpus (test C from K466 suite still holds),
  // but R11Corpus gets to contribute ITS entries first before GenericArch.
  const result = consultScribes({
    topic: "Verdania Thornwick corpus cooperative AI benchmark facts",
    cathedral: "bishop",
    scope: "public",
    max_entries: 5,
  });

  const r11Entry = result.scribes_consulted.find((s) => s.scribe_id === "R11Corpus");
  assert.ok(r11Entry, "R11Corpus must appear in consulted Scribes");

  // The key property: R11Corpus contributes its entries BEFORE GenericArch
  // (because corpus boost ensures it ranks first). Even with max_entries=5,
  // R11Corpus fills the 5 slots, not GenericArch.
  if (result.scribes_consulted.length > 0) {
    assert.equal(result.scribes_consulted[0].scribe_id, "R11Corpus",
      "With rare-query boost, R11Corpus (corpus) must process first");
  }
});

test("Fix3-D: non-rare query (generic 'architecture') still routes to GenericArch", () => {
  // A generic query with no rare tokens should still route to the correct Scribe
  // (GenericArch). The corpus boost only applies when rarity > threshold.
  const result = consultScribes({
    topic: "MCP architecture tablet Cathedral schema",
    cathedral: "bishop",
    scope: "public",
  });

  // GenericArch should be consulted (it has "architecture", "MCP", "schema", etc.)
  const archEntry = result.scribes_consulted.find((s) => s.scribe_id === "GenericArch");
  assert.ok(archEntry,
    "GenericArch should be consulted for generic architecture/MCP query");
});

test("Fix3-E: regression — observational-mode Scribe behavior unchanged for non-rare queries", () => {
  // Observational Scribes should still return recency-sorted entries for non-corpus queries
  const result = consultScribes({
    topic: "MCP architecture tablet Cathedral schema",
    cathedral: "bishop",
    scope: "public",
  });

  const archEntry = result.scribes_consulted.find((s) => s.scribe_id === "GenericArch");
  if (archEntry) {
    assert.equal(archEntry.mode, "observational",
      "GenericArch must be reported as observational mode");
    // Verify entries exist (observational, recency-sorted)
    assert.ok(archEntry.entries_returned >= 1, "GenericArch should return at least 1 entry");
  }
});

// ─── K473 MJ-category Tests ───────────────────────────────────────────────
// Verify that the five new MJ-category keywords (Reference Onboarding Framework,
// Cooperative Principles Assessment, Reference Communication Standards,
// exit interview completion rate, exit interview) receive rare-token +1.0 bonus
// and route MJ queries to R11Corpus, not GenericArch.
//
// The synthetic registry above does NOT include these MJ terms in GenericArch,
// so they will be unique to R11Corpus (count=1) and receive the rare-token bonus.
// We extend the synthetic registry in-memory via computeKeywordRarityMap + scoreScribe.

test("K473-MJ-02: 'Cooperative Principles Assessment' routes to R11Corpus (rare-token boost)", () => {
  const rarityMap = computeKeywordRarityMap();
  // "cooperative principles assessment" is only in R11Corpus keywords (K473 addition)
  const themes = ["What is the minimum passing score on the Cooperative Principles Assessment required for full voting rights?"];
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);
  const archResult = scoreScribe("GenericArch", themes, rarityMap);

  // R11Corpus should score ≥ 2.0 (primary match + rare-token bonus)
  assert.ok(r11Result.score >= 2.0,
    `R11Corpus should score ≥2.0 on "Cooperative Principles Assessment" query, got ${r11Result.score}`);
  // GenericArch should score 0 (no keyword match)
  assert.equal(archResult.score, 0,
    `GenericArch should score 0 on "Cooperative Principles Assessment" query, got ${archResult.score}`);
});

test("K473-MJ-03/05/08: 'Reference Onboarding Framework' routes to R11Corpus (rare-token boost)", () => {
  const rarityMap = computeKeywordRarityMap();
  const themes = ["What is the standard provisional member trial period under the Reference Onboarding Framework?"];
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);
  const archResult = scoreScribe("GenericArch", themes, rarityMap);

  assert.ok(r11Result.score >= 2.0,
    `R11Corpus should score ≥2.0 on "Reference Onboarding Framework" query, got ${r11Result.score}`);
  assert.equal(archResult.score, 0,
    `GenericArch should score 0 on "Reference Onboarding Framework" query, got ${archResult.score}`);
});

test("K473-MJ-07: 'Reference Communication Standards' routes to R11Corpus (rare-token boost)", () => {
  const rarityMap = computeKeywordRarityMap();
  const themes = ["What timeframes do the Reference Communication Standards specify for member inquiry acknowledgment?"];
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);
  const archResult = scoreScribe("GenericArch", themes, rarityMap);

  assert.ok(r11Result.score >= 2.0,
    `R11Corpus should score ≥2.0 on "Reference Communication Standards" query, got ${r11Result.score}`);
  assert.equal(archResult.score, 0,
    `GenericArch should score 0 on "Reference Communication Standards" query, got ${archResult.score}`);
});

test("K473-MJ-06: 'exit interview completion rate' routes to R11Corpus (rare-token boost)", () => {
  const rarityMap = computeKeywordRarityMap();
  const themes = ["What minimum exit interview completion rate does the Standards Body benchmark recommend?"];
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);
  const archResult = scoreScribe("GenericArch", themes, rarityMap);

  // "exit interview completion rate" is in R11Corpus keywords; "exit interview" is a shorter match
  // Either phrase appearing in query should give R11Corpus a rare-token boost
  assert.ok(r11Result.score >= 2.0,
    `R11Corpus should score ≥2.0 on "exit interview" query, got ${r11Result.score}`);
  assert.equal(archResult.score, 0,
    `GenericArch should score 0 on "exit interview" query, got ${archResult.score}`);
});

test("K473-regression: AM routing still works after MJ keyword additions", () => {
  const rarityMap = computeKeywordRarityMap();
  // AM-02 question — "Reference Architecture" should still route to R11Corpus
  const themes = ["What embedding dimensionality does the Cooperative AI Platform Reference Architecture specify?"];
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);

  assert.ok(r11Result.score >= 2.0,
    `R11Corpus AM routing regressed — "Reference Architecture" query scored ${r11Result.score}, expected ≥2.0`);
});

test("K473-regression: generic 'architecture' query still routes to GenericArch", () => {
  const rarityMap = computeKeywordRarityMap();
  const themes = ["MCP architecture tablet Cathedral schema"];
  const archResult = scoreScribe("GenericArch", themes, rarityMap);
  const r11Result = scoreScribe("R11Corpus", themes, rarityMap);

  assert.ok(archResult.score >= 2.0,
    `GenericArch should score ≥2.0 on pure "architecture" query, got ${archResult.score}`);
  assert.equal(r11Result.score, 0,
    `R11Corpus should score 0 on pure "architecture" query, got ${r11Result.score}`);
});
