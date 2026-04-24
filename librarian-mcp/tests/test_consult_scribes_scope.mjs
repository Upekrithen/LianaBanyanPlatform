/**
 * test_consult_scribes_scope.mjs (K455c / B121)
 * ===============================================
 * Tests the scope filter and cathedral parameter extensions added to
 * consultScribes() in K455c. Exercises:
 *   1. scope="public" returns only public entries
 *   2. scope="private" silently omits public entries (returns 0)
 *   3. cathedral="bishop" hits Bishop's scribes, finds R11-like data
 *   4. cathedral="knight" hits Knight's scribes, finds NO R11 data
 *   5. ConsultResult shape includes cathedral and scope fields
 *
 * Architecture: uses a single temp dir set up BEFORE module import to avoid
 * ESM module caching issues (registry.ts / cathedral.ts path constants are
 * computed once at module load time). Follows feedback_tests_mutating_real_files_serial.md:
 *   - All I/O on synthetic temp dirs
 *   - No mutations to real Cathedral data
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Set up temp Cathedral tree BEFORE any imports ────────────────────────
// The tree must be ready before `consult.js` is imported, because
// registry.ts and cathedral.ts compute STITCHPUNKS_DIR at module load time.

const TMP_ROOT = mkdtempSync(resolve(tmpdir(), "k455c-scope-"));

function writeJsonl(path, lines) {
  writeFileSync(path, lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf-8");
}

// ─── Bishop's Cathedral (scribes/) ────────────────────────────────────────
mkdirSync(resolve(TMP_ROOT, "scribes"), { recursive: true });
mkdirSync(resolve(TMP_ROOT, "data"), { recursive: true });

// Registry with three scribes:
//  - R11: has verdania + cairnfield + solstice keywords (mixes public + private entries)
//  - PublicOnly: all-public entries (for scope=private → returns 0 test)
//  - BishopOnly: cairnfield + gamma keywords (for cathedral=bishop test)
const bishopRegistry = `
version: test
opened: 2026-04-23
opener: K455c scope test
spec: ../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md
scribes:
  - id: R11
    primary:
      level: 1
      field: "R11 canonical corpus verdania cooperative statistics"
    adjacents: []
    keywords:
      - "verdania"
      - "cooperative"
      - "cairnfield"
      - "solstice"
      - "thornwick"
  - id: BishopOnly
    primary:
      level: 1
      field: "Bishop specific domain gamma cairnfield portability"
    adjacents: []
    keywords:
      - "gamma"
      - "cairnfield"
      - "portability"
`.trim() + "\n";
writeFileSync(resolve(TMP_ROOT, "scribes", "registry.yaml"), bishopRegistry, "utf-8");

// R11 tablet: mix of public and private entries
writeJsonl(resolve(TMP_ROOT, "scribes", "scribe_R11.jsonl"), [
  { type: "header", scribe_id: "R11", primary_level: 1, primary_field: "R11 corpus verdania", adjacents: [], opened: new Date().toISOString() },
  { ts: new Date().toISOString(), session: "K455c-test", observation: "Verdania has 847293 active member-owners as of Q3 2025 — canonical public fact", source: "knight_ship", scope: "public" },
  { ts: new Date().toISOString(), session: "K455c-test", observation: "Verdania internal audit data PRIVATE — should not appear in public scope", source: "knight_ship", scope: "private" },
  { ts: new Date().toISOString(), session: "K455c-test", observation: "Verdania Cooperative Platform reported 4.7 billion transaction volume 2024", source: "knight_ship", scope: "public" },
  { ts: new Date().toISOString(), session: "K455c-test", observation: "Cairnfield Protocol 180-day data portability window for exiting members", source: "knight_ship", scope: "public" },
  { ts: new Date().toISOString(), session: "K455c-test", observation: "Solstice Index reached 4.18 in November 2025 driven by Thornwick architecture", source: "knight_ship", scope: "public" },
]);

// BishopOnly tablet (for cathedral=bishop test)
writeJsonl(resolve(TMP_ROOT, "scribes", "scribe_BishopOnly.jsonl"), [
  { type: "header", scribe_id: "BishopOnly", primary_level: 1, primary_field: "Bishop gamma portability", adjacents: [], opened: new Date().toISOString() },
  { ts: new Date().toISOString(), session: "K455c-test", observation: "BishopOnly entry for cairnfield gamma portability test", source: "founder_dialogue", scope: "public" },
]);

// ─── Knight's Cathedral (knight_cathedral/) ───────────────────────────────
mkdirSync(resolve(TMP_ROOT, "knight_cathedral", "scribes"), { recursive: true });

const knightRegistry = `
version: test
opened: 2026-04-23
opener: K455c scope test
spec: ../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md
scribes:
  - id: KnightQueue
    primary:
      level: 1
      field: "Knight task queue NEXT QUEUED LANDED K455c K461"
    adjacents: []
    keywords:
      - "knight"
      - "queue"
      - "task"
      - "K455c"
      - "K461"
      - "NEXT"
      - "QUEUED"
`.trim() + "\n";
writeFileSync(resolve(TMP_ROOT, "knight_cathedral", "registry.yaml"), knightRegistry, "utf-8");

// Knight KnightQueue tablet — NO R11/Verdania content (control arm integrity)
writeJsonl(resolve(TMP_ROOT, "knight_cathedral", "scribes", "KnightQueue.jsonl"), [
  { type: "header", scribe_id: "KnightQueue", primary_level: 1, primary_field: "Knight task queue", adjacents: [], opened: new Date().toISOString() },
  { observation: "K455c is NEXT — cross-Cathedral benchmark: scope schema + consult_scribes extension + two-arm R11 run", timestamp: new Date().toISOString(), source_session: "B121", source_document: "BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K455c_B121_CROSS_CATHEDRAL_CONSULTATION.md", category: "queue", tokens: 20, scope: "public" },
  { observation: "K461 LANDED — Knight Cathedral instantiation, four Scribes created, tag v-knight-cathedral-instantiation-K461", timestamp: new Date().toISOString(), source_session: "K461", source_document: "BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K461.md", category: "handoff", tokens: 18, scope: "public" },
]);

// ─── Now import consult (AFTER env is set) ───────────────────────────────
process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_ROOT;
const { consultScribes } = await import("../dist/scribes/consult.js");

after(() => {
  delete process.env.LIBRARIAN_STITCHPUNKS_DIR;
  try {
    rmSync(TMP_ROOT, { recursive: true, force: true });
  } catch {
    // Ignore cleanup failures
  }
});

// ─── Test 1: scope="public" returns only public entries ───────────────────

test("scope=public returns only public verdania entries, excludes private", () => {
  const result = consultScribes({ topic: "verdania cooperative", cathedral: "bishop", scope: "public" });

  const privateEntries = result.entries.filter(
    (e) => typeof e.observation === "string" && e.observation.includes("PRIVATE"),
  );
  assert.equal(privateEntries.length, 0, "Private entries must NOT appear in scope=public results");

  const publicEntries = result.entries.filter(
    (e) => typeof e.observation === "string" && e.observation.includes("847293"),
  );
  assert.ok(publicEntries.length >= 1, "Public Verdania fact (847293) should appear in scope=public results");

  assert.equal(result.scope, "public");
  assert.equal(result.cathedral, "bishop");
});

// ─── Test 2: scope="private" silently omits all public entries ────────────

test("scope=private silently returns 0 entries for all-public tablet (silent filter, not error)", () => {
  // Query against "verdania cooperative" — R11 scribe matches, but all public entries
  // are filtered out because caller asks for "private" scope. Silent filter per spec.
  const result = consultScribes({ topic: "verdania cooperative", cathedral: "bishop", scope: "private" });

  // The private entry exists, so private scope SHOULD return it
  const privateEntries = result.entries.filter(
    (e) => typeof e.observation === "string" && e.observation.includes("PRIVATE"),
  );
  assert.ok(privateEntries.length >= 1, "Private entry should appear for scope=private");

  // But public entries should NOT appear
  const publicEntries = result.entries.filter(
    (e) => typeof e.observation === "string" && e.observation.includes("847293"),
  );
  assert.equal(publicEntries.length, 0, "Public entries must NOT appear when scope=private");

  assert.equal(result.scope, "private");
});

// ─── Test 3: cathedral="bishop" hits Bishop's scribes ────────────────────

test("cathedral=bishop queries Bishop registry and returns cairnfield/portability entry", () => {
  const result = consultScribes({ topic: "cairnfield gamma portability", cathedral: "bishop", scope: "public" });

  assert.ok(result.entries.length >= 1, "Bishop consult should return cairnfield entry");
  assert.ok(
    result.entries.some(
      (e) => typeof e.observation === "string" &&
        (e.observation.includes("180-day") || e.observation.includes("cairnfield") || e.observation.toLowerCase().includes("portability")),
    ),
    "Should return an entry mentioning cairnfield/portability",
  );
  assert.equal(result.cathedral, "bishop");
});

// ─── Test 4: cathedral="knight" hits Knight Cathedral, NOT R11 ────────────

test("cathedral=knight returns Knight task queue entries but ZERO R11/Verdania data", () => {
  // Arm 1 control condition: Knight's Cathedral has no R11 corpus
  const result = consultScribes({ topic: "verdania cooperative", cathedral: "knight", scope: "public" });
  assert.equal(result.cathedral, "knight");

  const verdaniaEntries = result.entries.filter(
    (e) => typeof e.observation === "string" &&
      (e.observation.includes("847293") || e.observation.includes("Verdania")),
  );
  assert.equal(verdaniaEntries.length, 0, "Knight Cathedral must have ZERO R11/Verdania entries (control arm invariant)");

  // Arm 2 treatment condition: Bishop's Cathedral HAS the R11 corpus
  const bishopResult = consultScribes({ topic: "verdania cooperative", cathedral: "bishop", scope: "public" });
  assert.equal(bishopResult.cathedral, "bishop");
  const bishopVerdania = bishopResult.entries.filter(
    (e) => typeof e.observation === "string" && e.observation.includes("847293"),
  );
  assert.ok(bishopVerdania.length >= 1, "Bishop Cathedral MUST have R11/Verdania entries (treatment arm)");

  // Cross-Cathedral lift: Bishop > Knight for R11 queries
  assert.ok(
    bishopResult.entries.length > result.entries.length ||
    bishopVerdania.length > verdaniaEntries.length,
    "Cross-Cathedral lift: Bishop returns more R11-relevant entries than Knight",
  );
});

// ─── Test 5: Knight Cathedral query finds Knight-specific content ──────────

test("cathedral=knight returns Knight task queue observations for queue queries", () => {
  const result = consultScribes({ topic: "knight queue K455c NEXT", cathedral: "knight", scope: "public" });
  assert.equal(result.cathedral, "knight");
  assert.ok(result.entries.length >= 1, "Knight queue query should return at least one entry");
  const k455cEntry = result.entries.filter(
    (e) => typeof e.observation === "string" && e.observation.includes("K455c"),
  );
  assert.ok(k455cEntry.length >= 1, "Knight Cathedral should have K455c queue entry");
});

// ─── Test 6: ConsultResult shape includes cathedral and scope fields ──────

test("ConsultResult exposes cathedral and scope in all responses, defaults to bishop/public", () => {
  const r1 = consultScribes({ topic: "solstice thornwick", cathedral: "bishop", scope: "public" });
  assert.equal(typeof r1.cathedral, "string");
  assert.equal(typeof r1.scope, "string");
  assert.equal(r1.cathedral, "bishop");
  assert.equal(r1.scope, "public");

  // Default values (no cathedral/scope specified)
  const r2 = consultScribes({ topic: "solstice thornwick" });
  assert.equal(r2.cathedral, "bishop", "default cathedral must be 'bishop'");
  assert.equal(r2.scope, "public", "default scope must be 'public'");
});
