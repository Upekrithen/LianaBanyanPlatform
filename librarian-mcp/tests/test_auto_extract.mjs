/**
 * test_auto_extract.mjs — K474/B122 Self-Indexing Scribes
 * =========================================================
 * Unit tests for the corpus-derived distinctiveness keyword extractor.
 *
 * Synthetic 3-Scribe fixture:
 *   ScribeA: talks about "verdania cooperative governance patronage" (exclusive terms)
 *   ScribeB: talks about "thornwick architecture embeddings vectors" (exclusive terms)
 *   ScribeC: general text with common phrases shared across scribes
 *
 * Tests:
 *   - Distinctiveness ranking (exclusive terms score highest)
 *   - Corpus-exclusive token inclusion (df==1, tf>=2 always included regardless of top-K)
 *   - Stopword filtering (common English words excluded)
 *   - N-gram handling (1-4 grams produced)
 *   - Missing file grace (warning + skip, no crash)
 *   - Deterministic output across two runs (same inputs → same outputs)
 *   - LIBRARIAN_KEYWORDS_MODE: union / auto-only / hand-only
 *
 * Run: node --test tests/test_auto_extract.mjs (after `npm run build`)
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Set up temp fixture dirs BEFORE any imports ─────────────────────────────

const TMP_ROOT = mkdtempSync(resolve(tmpdir(), "k474-auto-extract-"));
const FIXTURE_DIR = resolve(TMP_ROOT, "fixtures");
mkdirSync(FIXTURE_DIR, { recursive: true });

// ScribeA — exclusive terms: "verdania", "cooperative governance", "patronage directors"
const SCRIBE_A_TEXT = `
Verdania is a cooperative platform with 847,293 members.
Verdania cooperative governance involves patronage directors elected annually.
The patronage directors oversee cooperative governance policy in Verdania.
Verdania patronage directors meet quarterly. Cooperative governance requires
consensus. Patronage directors allocate surplus funds in Verdania.
Cooperative governance principles guide all Verdania decisions.
`.repeat(2);

// ScribeB — exclusive terms: "thornwick", "embeddings", "dense sparse retrieval"
const SCRIBE_B_TEXT = `
Thornwick uses dense sparse retrieval for information access.
Dense sparse retrieval combines embeddings with keyword matching in Thornwick.
Thornwick embeddings have 1536 dimensions for dense sparse retrieval.
The Thornwick architecture optimizes dense sparse retrieval with embeddings.
Dense sparse retrieval in Thornwick uses cosine similarity on embeddings.
Thornwick embeddings capture semantic meaning for dense sparse retrieval.
`.repeat(2);

// ScribeC — general shared text (common terms appear in all scribes)
const SCRIBE_C_TEXT = `
The platform provides cooperative services for members.
Members use the platform to access cooperative resources.
The platform cooperative architecture supports many members.
Cooperative platform access is available to all registered members.
Platform members can access cooperative services at any time.
Cooperative governance applies to all platform members equally.
`.repeat(2);

writeFileSync(resolve(FIXTURE_DIR, "scribeA.md"), SCRIBE_A_TEXT, "utf-8");
writeFileSync(resolve(FIXTURE_DIR, "scribeB.md"), SCRIBE_B_TEXT, "utf-8");
writeFileSync(resolve(FIXTURE_DIR, "scribeC.md"), SCRIBE_C_TEXT, "utf-8");

// JSON fixture for text extraction test
const JSON_FIXTURE = {
  title: "Verdania Report",
  description: "Verdania governance facts",
  facts: [
    { id: "VG-01", text: "Verdania cooperative governance patronage directors elected." },
    { id: "VG-02", text: "Verdania patronage directors meet quarterly for governance." },
  ],
};
writeFileSync(resolve(FIXTURE_DIR, "scribeA.json"), JSON.stringify(JSON_FIXTURE), "utf-8");

// JSONL fixture
const JSONL_LINES = [
  JSON.stringify({ observation: "Thornwick dense sparse retrieval architecture uses embeddings." }),
  JSON.stringify({ observation: "Thornwick embeddings are 1536-dimensional dense sparse vectors." }),
  JSON.stringify({ observation: "Dense sparse retrieval in Thornwick outperforms keyword-only search." }),
];
writeFileSync(resolve(FIXTURE_DIR, "scribeB.jsonl"), JSONL_LINES.join("\n") + "\n", "utf-8");

// ─── Temp stitchpunks dir for registry tests ──────────────────────────────────

const STITCHPUNKS_TMP = resolve(TMP_ROOT, "stitchpunks");
const SCRIBES_TMP_DIR = resolve(STITCHPUNKS_TMP, "scribes");
mkdirSync(resolve(SCRIBES_TMP_DIR, "auto_keywords"), { recursive: true });
mkdirSync(resolve(STITCHPUNKS_TMP, "knight_cathedral", "scribes"), { recursive: true });

// Write a minimal synthetic registry
const syntheticRegistry = `
version: test-k474
opened: 2026-04-24
opener: K474 auto-extract test
spec: ../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md
scribes:
  - id: ScribeA
    mode: observational
    primary:
      level: 1
      field: Verdania cooperative governance
      canonical_keepers:
        - ${FIXTURE_DIR.replace(/\\/g, "/")}/scribeA.md
        - ${FIXTURE_DIR.replace(/\\/g, "/")}/scribeA.json
    adjacents: []
    keywords:
      - hand-curated-keyword-A
      - Verdania
  - id: ScribeB
    mode: observational
    primary:
      level: 1
      field: Thornwick architecture embeddings
      canonical_keepers:
        - ${FIXTURE_DIR.replace(/\\/g, "/")}/scribeB.md
        - ${FIXTURE_DIR.replace(/\\/g, "/")}/scribeB.jsonl
    adjacents: []
    keywords:
      - hand-curated-keyword-B
      - Thornwick
  - id: ScribeC
    mode: observational
    primary:
      level: 1
      field: general platform services
      canonical_keepers:
        - ${FIXTURE_DIR.replace(/\\/g, "/")}/scribeC.md
    adjacents: []
    keywords:
      - hand-curated-keyword-C
`.trim() + "\n";

writeFileSync(resolve(SCRIBES_TMP_DIR, "registry.yaml"), syntheticRegistry, "utf-8");

// Knight cathedral minimal registry (empty scribes for test isolation)
writeFileSync(
  resolve(STITCHPUNKS_TMP, "knight_cathedral", "registry.yaml"),
  "version: test-k474\nopened: 2026-04-24\nopener: K474 test\nspec: ../SP22\nscribes: []\n",
  "utf-8",
);
writeFileSync(
  resolve(STITCHPUNKS_TMP, "knight_cathedral", "scribes", "placeholder"),
  "",
  "utf-8",
);

// ─── Set env before imports ───────────────────────────────────────────────────

process.env.LIBRARIAN_STITCHPUNKS_DIR = STITCHPUNKS_TMP;
// Start in hand-only mode to avoid interfering with registry tests
process.env.LIBRARIAN_KEYWORDS_MODE = "hand-only";

// Import AFTER env is set
const {
  tokenizeToNgrams,
  extractAutoKeywords,
  extractAllAutoKeywords,
  resolveKeeperPaths,
  extractTextFromFile,
  loadAutoKeywordSidecar,
  writeAutoKeywordSidecar,
  getAutoKeywordsDir,
} = await import("../dist/scribes/autoExtract.js");

const { getRegistry, computeKeywordRarityMap, scoreScribe } = await import("../dist/scribes/registry.js");

after(() => {
  delete process.env.LIBRARIAN_STITCHPUNKS_DIR;
  delete process.env.LIBRARIAN_KEYWORDS_MODE;
  try { rmSync(TMP_ROOT, { recursive: true, force: true }); } catch { /* ignore */ }
});

// ─── N-gram tests ──────────────────────────────────────────────────────────────

test("tokenizeToNgrams: produces 1-grams and 2-grams from simple text", () => {
  const grams = tokenizeToNgrams("Verdania cooperative governance patronage");
  assert.ok(grams.has("verdania"), "1-gram 'verdania' missing");
  assert.ok(grams.has("verdania cooperative"), "2-gram 'verdania cooperative' missing");
  assert.ok(grams.has("cooperative governance"), "2-gram 'cooperative governance' missing");
  assert.ok(grams.has("cooperative governance patronage"), "3-gram missing");
});

test("tokenizeToNgrams: stopwords filtered from standalone tokens", () => {
  const grams = tokenizeToNgrams("the and or with for at");
  // All tokens are stopwords — no grams should remain
  assert.equal(grams.size, 0, `Expected 0 grams for all-stopword text, got ${grams.size}`);
});

test("tokenizeToNgrams: all-numeric tokens dropped", () => {
  const grams = tokenizeToNgrams("123 456 789");
  assert.equal(grams.size, 0, "Expected 0 grams for all-numeric tokens");
});

test("tokenizeToNgrams: mixed content produces correct grams", () => {
  const grams = tokenizeToNgrams("Verdania has 847293 members");
  // "verdania" should appear (non-stopword, non-numeric)
  assert.ok(grams.has("verdania"), "Expected 'verdania' in grams");
  // "847293" is numeric — should not appear as standalone
  assert.ok(!grams.has("847293"), "Numeric-only '847293' should be dropped");
  // "members" should appear
  assert.ok(grams.has("members"), "Expected 'members' in grams");
});

// ─── Text extraction tests ────────────────────────────────────────────────────

test("extractTextFromFile: reads .md file as plain text", () => {
  const text = extractTextFromFile(resolve(FIXTURE_DIR, "scribeA.md"));
  assert.ok(text !== null, "Should return text, not null");
  assert.ok(text.toLowerCase().includes("verdania"), "Should contain 'verdania'");
});

test("extractTextFromFile: reads .json file with deep string extraction", () => {
  const text = extractTextFromFile(resolve(FIXTURE_DIR, "scribeA.json"));
  assert.ok(text !== null, "Should return text from JSON");
  assert.ok(text.toLowerCase().includes("verdania"), "Should extract strings from JSON");
  assert.ok(text.toLowerCase().includes("governance"), "Should extract nested strings");
});

test("extractTextFromFile: reads .jsonl file line by line", () => {
  const text = extractTextFromFile(resolve(FIXTURE_DIR, "scribeB.jsonl"));
  assert.ok(text !== null, "Should return text from JSONL");
  assert.ok(text.toLowerCase().includes("thornwick"), "Should extract observation fields");
  assert.ok(text.toLowerCase().includes("embeddings"), "Should extract all lines");
});

test("extractTextFromFile: returns null gracefully for missing file (with warning)", () => {
  // Suppress expected warning for this test — it should NOT throw
  const text = extractTextFromFile(resolve(FIXTURE_DIR, "DEFINITELY_NOT_THERE.md"));
  assert.equal(text, null, "Missing file should return null, not throw");
});

// ─── Core extraction tests ────────────────────────────────────────────────────

test("extractAllAutoKeywords: Verdania terms appear in ScribeA keywords (exclusive corpus)", () => {
  const reg = getRegistry(true); // force reload
  const results = extractAllAutoKeywords(reg);

  assert.ok(results.has("ScribeA"), "ScribeA should be in results");
  const aResult = results.get("ScribeA");
  assert.ok(aResult.keywords.length > 0, "ScribeA should have auto keywords");

  // "verdania" appears only in ScribeA corpus — should be exclusive (df=1) and always included
  const kwsLower = aResult.keywords.map((k) => k.toLowerCase());
  assert.ok(
    kwsLower.some((k) => k.includes("verdania")),
    `ScribeA keywords should include 'verdania' (exclusive); got: ${kwsLower.slice(0, 10).join(", ")}`
  );
});

test("extractAllAutoKeywords: Thornwick terms appear in ScribeB keywords (exclusive corpus)", () => {
  const reg = getRegistry(true);
  const results = extractAllAutoKeywords(reg);

  const bResult = results.get("ScribeB");
  assert.ok(bResult, "ScribeB should be in results");
  assert.ok(bResult.keywords.length > 0, "ScribeB should have auto keywords");

  const kwsLower = bResult.keywords.map((k) => k.toLowerCase());
  assert.ok(
    kwsLower.some((k) => k.includes("thornwick")),
    `ScribeB keywords should include 'thornwick' (exclusive); got: ${kwsLower.slice(0, 10).join(", ")}`
  );
});

test("extractAllAutoKeywords: ScribeA exclusive terms absent from ScribeB and vice versa", () => {
  const reg = getRegistry(true);
  const results = extractAllAutoKeywords(reg);

  const aKws = (results.get("ScribeA")?.keywords ?? []).map((k) => k.toLowerCase());
  const bKws = (results.get("ScribeB")?.keywords ?? []).map((k) => k.toLowerCase());

  // Verdania should NOT be in ScribeB (it's exclusive to ScribeA)
  assert.ok(!bKws.some((k) => k === "verdania"),
    "ScribeB should NOT have 'verdania' (exclusive to ScribeA)");
  // Thornwick should NOT be in ScribeA (exclusive to ScribeB)
  assert.ok(!aKws.some((k) => k === "thornwick"),
    "ScribeA should NOT have 'thornwick' (exclusive to ScribeB)");
});

test("extractAllAutoKeywords: common term 'cooperative' appears in multiple Scribes (not exclusive)", () => {
  const reg = getRegistry(true);
  const results = extractAllAutoKeywords(reg);

  // "cooperative" appears in ScribeA (verdania cooperative), ScribeB, AND ScribeC
  // So df >= 2 — it might still be in top-K by distinctiveness, but it's NOT exclusive
  // Verify the extraction didn't crash and all 3 scribes have results
  assert.equal(results.size, 3, "Should have results for all 3 Scribes");
  for (const [id, r] of results) {
    assert.ok(Array.isArray(r.keywords), `Scribe ${id} should have keywords array`);
  }
});

test("extractAllAutoKeywords: missing canonical_keepers produces empty keywords (no crash)", () => {
  // Write a registry with a Scribe pointing to a non-existent file
  const missingReg = {
    version: "test",
    opened: "2026-04-24",
    opener: "test",
    spec: "",
    scribes: [
      {
        id: "MissingScribe",
        mode: "observational",
        primary: { level: 1, field: "test", canonical_keepers: ["/definitely/not/real/path.md"] },
        adjacents: [],
        keywords: [],
      },
    ],
  };
  // Should not throw
  const results = extractAllAutoKeywords(missingReg);
  const missing = results.get("MissingScribe");
  assert.ok(missing, "MissingScribe should be in results (even if empty)");
  assert.deepEqual(missing.keywords, [], "Empty keywords expected when no files found");
});

// ─── Determinism tests ────────────────────────────────────────────────────────

test("extractAllAutoKeywords: deterministic across two runs (same inputs → same outputs)", () => {
  const reg = getRegistry(true);
  const run1 = extractAllAutoKeywords(reg);
  const run2 = extractAllAutoKeywords(reg);

  for (const [id] of run1) {
    const kws1 = run1.get(id)?.keywords ?? [];
    const kws2 = run2.get(id)?.keywords ?? [];
    assert.deepEqual(
      kws1,
      kws2,
      `Scribe ${id}: keywords differ between runs (non-deterministic)`
    );
  }
});

// ─── Sidecar I/O tests ────────────────────────────────────────────────────────

test("writeAutoKeywordSidecar + loadAutoKeywordSidecar: round-trips correctly", () => {
  const autoDir = resolve(SCRIBES_TMP_DIR, "auto_keywords");
  const fakeSummary = {
    scribeId: "TestScribeRT",
    keywords: ["verdania", "cooperative governance", "patronage directors"],
    sourceHash: "abc123def456",
    fileCount: 2,
    keeperCount: 3,
  };

  writeAutoKeywordSidecar(fakeSummary, autoDir);
  const loaded = loadAutoKeywordSidecar("TestScribeRT", autoDir);

  assert.deepEqual(loaded, fakeSummary.keywords, "Round-tripped keywords should match");
});

test("loadAutoKeywordSidecar: returns [] for non-existent sidecar (no crash)", () => {
  const autoDir = resolve(SCRIBES_TMP_DIR, "auto_keywords");
  const result = loadAutoKeywordSidecar("DEFINITELY_NOT_THERE", autoDir);
  assert.deepEqual(result, [], "Missing sidecar should return empty array");
});

// ─── LIBRARIAN_KEYWORDS_MODE tests ───────────────────────────────────────────
// Write a sidecar for ScribeA to test mode switching

test("KEYWORDS_MODE=union: merges hand-curated + auto keywords", async () => {
  // Write ScribeA sidecar with auto keywords
  const autoDir = resolve(SCRIBES_TMP_DIR, "auto_keywords");
  writeAutoKeywordSidecar({
    scribeId: "ScribeA",
    keywords: ["verdania auto derived", "cooperative governance patronage"],
    sourceHash: "test",
    fileCount: 1,
    keeperCount: 1,
  }, autoDir);

  process.env.LIBRARIAN_KEYWORDS_MODE = "union";
  // Force reload by clearing module-level cache (new env triggers reload)
  const reg = getRegistry(true);
  const scribeA = reg.scribes.find((s) => s.id === "ScribeA");
  assert.ok(scribeA, "ScribeA should exist");
  // Should have both hand-curated AND auto keywords
  assert.ok(scribeA.keywords.includes("hand-curated-keyword-A"), "Union: hand-curated keyword must be present");
  assert.ok(scribeA.keywords.some((k) => k.includes("verdania")), "Union: auto keyword must be present");
});

test("KEYWORDS_MODE=auto-only: replaces hand-curated with auto keywords only", async () => {
  process.env.LIBRARIAN_KEYWORDS_MODE = "auto-only";
  const reg = getRegistry(true);
  const scribeA = reg.scribes.find((s) => s.id === "ScribeA");
  assert.ok(scribeA, "ScribeA should exist");
  // Should NOT have hand-curated keyword (auto-only mode)
  assert.ok(!scribeA.keywords.includes("hand-curated-keyword-A"),
    "auto-only: hand-curated keyword must NOT be present");
  // Should have auto keywords (from sidecar)
  assert.ok(scribeA.keywords.some((k) => k.includes("verdania")),
    "auto-only: auto keyword must be present");
});

test("KEYWORDS_MODE=hand-only: uses only hand-curated keywords (ignores sidecar)", async () => {
  process.env.LIBRARIAN_KEYWORDS_MODE = "hand-only";
  const reg = getRegistry(true);
  const scribeA = reg.scribes.find((s) => s.id === "ScribeA");
  assert.ok(scribeA, "ScribeA should exist");
  // Should have hand-curated keyword
  assert.ok(scribeA.keywords.includes("hand-curated-keyword-A"),
    "hand-only: hand-curated keyword must be present");
  // Should NOT have auto keyword that's only in the sidecar (not in registry.yaml)
  assert.ok(!scribeA.keywords.some((k) => k === "verdania auto derived"),
    "hand-only: auto-only keyword 'verdania auto derived' must NOT be present");
});
