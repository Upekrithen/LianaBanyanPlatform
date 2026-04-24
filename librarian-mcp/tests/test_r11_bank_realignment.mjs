/**
 * test_r11_bank_realignment.mjs — K471 (B121): R11 corpus-bank realignment tests
 * =================================================================================
 * Five tests per K471 dispatch:
 *
 *   Test A: K471 bank file exists, valid JSON, 50 questions across 6 categories
 *   Test B: Every K471 question's hot_required_elements are exact substrings of
 *           r11_canonical_corpus.md (alignment guarantee — 100% answerable ceiling)
 *   Test C: Legacy K444 bank is preserved as R11_QUESTION_BANK_SEALED_K444_LEGACY.json
 *           and is marked with K444 corpus_id
 *   Test D: run_r11.py defaults to K471 bank; --legacy-k444 flag opts into old bank
 *   Test E: Two re-runs of reseal-question-bank.mjs produce identical alignment output
 *           (reproducibility — same pass/fail for all 50 questions)
 *
 * Run: node --test tests/test_r11_bank_realignment.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const BENCH = resolve(__dir, "../r10_cross_vendor");

const K471_BANK   = resolve(BENCH, "R11_QUESTION_BANK_SEALED_K471.json");
const K444_LEGACY = resolve(BENCH, "R11_QUESTION_BANK_SEALED_K444_LEGACY.json");
const CORPUS      = resolve(BENCH, "r11_canonical_corpus.md");
const RESEAL_SCRIPT = resolve(BENCH, "scripts/reseal-question-bank.mjs");
const RUN_R11_PY  = resolve(BENCH, "run_r11.py");

// ── Test A ───────────────────────────────────────────────────────────────────
test("A: K471 bank exists, valid JSON, 50 questions across 6 expected categories", () => {
  assert.ok(existsSync(K471_BANK), `K471 bank not found: ${K471_BANK}`);

  const raw = readFileSync(K471_BANK, "utf-8");
  let bank;
  try {
    bank = JSON.parse(raw);
  } catch (e) {
    assert.fail(`K471 bank is not valid JSON: ${e.message}`);
  }

  assert.ok(Array.isArray(bank.questions), "bank.questions must be an array");
  assert.strictEqual(bank.questions.length, 50, `Expected 50 questions, got ${bank.questions.length}`);

  const expectedCategories = {
    canonical_statistics:  9,
    architecture_mechanics: 8,
    economic_governance:   9,
    member_journey:        8,
    regulatory_compliance: 8,
    historical_precedent:  8,
  };
  const catCounts = {};
  for (const q of bank.questions) {
    assert.ok(q.id, `Question missing id: ${JSON.stringify(q)}`);
    assert.ok(q.question, `Question ${q.id} missing question text`);
    assert.ok(Array.isArray(q.hot_required_elements) && q.hot_required_elements.length > 0,
      `Question ${q.id} missing hot_required_elements`);
    catCounts[q.category] = (catCounts[q.category] ?? 0) + 1;
  }

  for (const [cat, expectedN] of Object.entries(expectedCategories)) {
    assert.strictEqual(
      catCounts[cat] ?? 0, expectedN,
      `Category '${cat}': expected ${expectedN}, got ${catCounts[cat] ?? 0}`
    );
  }

  assert.strictEqual(bank.corpus_id, "R11-CANONICAL-K471",
    `Expected corpus_id "R11-CANONICAL-K471", got "${bank.corpus_id}"`);
});

// ── Test B ───────────────────────────────────────────────────────────────────
test("B: Every K471 question's hot_required_elements are exact substrings of r11_canonical_corpus.md", () => {
  assert.ok(existsSync(CORPUS), `Corpus not found: ${CORPUS}`);
  assert.ok(existsSync(K471_BANK), `K471 bank not found: ${K471_BANK}`);

  const corpusLower = readFileSync(CORPUS, "utf-8").toLowerCase();
  const bank = JSON.parse(readFileSync(K471_BANK, "utf-8"));

  const failures = [];
  for (const q of bank.questions) {
    const missing = (q.hot_required_elements ?? []).filter(
      el => !corpusLower.includes(el.toLowerCase())
    );
    if (missing.length > 0) {
      failures.push({ id: q.id, missing });
    }
  }

  if (failures.length > 0) {
    const detail = failures.map(f => `  ${f.id}: missing [${f.missing.join(", ")}]`).join("\n");
    assert.fail(
      `${failures.length} questions NOT answerable from corpus:\n${detail}\n` +
      `Answerable: ${bank.questions.length - failures.length}/50`
    );
  }
});

// ── Test C ───────────────────────────────────────────────────────────────────
test("C: Legacy K444 bank preserved as R11_QUESTION_BANK_SEALED_K444_LEGACY.json with K444 corpus_id", () => {
  assert.ok(existsSync(K444_LEGACY),
    `Legacy K444 bank not found: ${K444_LEGACY}\n` +
    `The original bank must be preserved as R11_QUESTION_BANK_SEALED_K444_LEGACY.json`);

  const legacy = JSON.parse(readFileSync(K444_LEGACY, "utf-8"));
  assert.ok(
    (legacy.corpus_id ?? "").includes("K444"),
    `Legacy bank corpus_id should contain "K444", got "${legacy.corpus_id}"`
  );
  assert.ok(
    Array.isArray(legacy.questions) && legacy.questions.length === 50,
    `Legacy bank should have 50 questions, got ${legacy.questions?.length}`
  );
  // Verify the legacy bank does NOT have corpus_id R11-CANONICAL-K471
  assert.notStrictEqual(legacy.corpus_id, "R11-CANONICAL-K471",
    "Legacy bank must NOT have corpus_id R11-CANONICAL-K471 — it should keep its K444 id");
});

// ── Test D ───────────────────────────────────────────────────────────────────
test("D: run_r11.py defaults to K471 bank; --legacy-k444 flag references K444 legacy bank", () => {
  assert.ok(existsSync(RUN_R11_PY), `run_r11.py not found: ${RUN_R11_PY}`);

  const src = readFileSync(RUN_R11_PY, "utf-8");

  // K471 bank path must be the default BANK_PATH
  assert.ok(
    src.includes("R11_QUESTION_BANK_SEALED_K471.json"),
    "run_r11.py must reference R11_QUESTION_BANK_SEALED_K471.json"
  );
  // Legacy flag must be defined
  assert.ok(
    src.includes("--legacy-k444") || src.includes("legacy_k444"),
    "run_r11.py must implement a --legacy-k444 CLI flag"
  );
  // Legacy bank path must be referenced
  assert.ok(
    src.includes("R11_QUESTION_BANK_SEALED_K444_LEGACY.json"),
    "run_r11.py must reference R11_QUESTION_BANK_SEALED_K444_LEGACY.json for legacy mode"
  );

  // Confirm grade_r11.py and summarize_r11.py also updated
  const GRADE_PY = resolve(BENCH, "grade_r11.py");
  const SUMMARIZE_PY = resolve(BENCH, "summarize_r11.py");
  if (existsSync(GRADE_PY)) {
    const gradeSrc = readFileSync(GRADE_PY, "utf-8");
    assert.ok(
      gradeSrc.includes("R11_QUESTION_BANK_SEALED_K471.json"),
      "grade_r11.py must default to K471 bank"
    );
  }
  if (existsSync(SUMMARIZE_PY)) {
    const summarizeSrc = readFileSync(SUMMARIZE_PY, "utf-8");
    assert.ok(
      summarizeSrc.includes("K471") || summarizeSrc.includes("R11-CANONICAL-K471"),
      "summarize_r11.py must reference K471"
    );
  }
});

// ── Test E ───────────────────────────────────────────────────────────────────
test("E: reseal-question-bank.mjs produces identical passing results on two consecutive runs (reproducibility)", () => {
  assert.ok(existsSync(RESEAL_SCRIPT), `reseal-question-bank.mjs not found: ${RESEAL_SCRIPT}`);

  function runReseal() {
    return spawnSync(process.execPath, [RESEAL_SCRIPT], {
      encoding: "utf-8",
      cwd: BENCH,
    });
  }

  const run1 = runReseal();
  const run2 = runReseal();

  assert.strictEqual(run1.status, 0,
    `First run of reseal-question-bank.mjs failed (exit ${run1.status}):\n${run1.stderr}`);
  assert.strictEqual(run2.status, 0,
    `Second run of reseal-question-bank.mjs failed (exit ${run2.status}):\n${run2.stderr}`);

  // Both runs must report 50/50 answerable
  const matchAnswerable = (out) => {
    const m = out.match(/Answerable from corpus:\s*(\d+)\/50/);
    return m ? parseInt(m[1], 10) : null;
  };

  const run1Count = matchAnswerable(run1.stdout);
  const run2Count = matchAnswerable(run2.stdout);

  assert.strictEqual(run1Count, 50, `Run 1 answerable count: expected 50, got ${run1Count}`);
  assert.strictEqual(run2Count, 50, `Run 2 answerable count: expected 50, got ${run2Count}`);

  // Both should report ALL CHECKS PASSED
  assert.ok(run1.stdout.includes("ALL CHECKS PASSED"), "Run 1 must report ALL CHECKS PASSED");
  assert.ok(run2.stdout.includes("ALL CHECKS PASSED"), "Run 2 must report ALL CHECKS PASSED");
});
