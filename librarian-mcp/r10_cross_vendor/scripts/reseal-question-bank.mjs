#!/usr/bin/env node
/**
 * reseal-question-bank.mjs
 * ========================
 * K471 — R11 Corpus + Question Bank Realignment
 *
 * Reads the current r11_canonical_corpus.md and verifies that every
 * hot_required_element in R11_QUESTION_BANK_SEALED_K471.json is a
 * case-insensitive substring of the corpus text. Prints a full alignment
 * report and exits non-zero if any question is not answerable from the corpus.
 *
 * Also verifies:
 *   - The legacy K444 bank exists (was preserved, not deleted)
 *   - The K471 bank has exactly 50 questions
 *   - All 6 categories are represented
 *
 * Usage:
 *   node scripts/reseal-question-bank.mjs
 *   node scripts/reseal-question-bank.mjs --verbose
 *
 * Run from the r10_cross_vendor directory.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');

const CORPUS_PATH   = resolve(ROOT, 'r11_canonical_corpus.md');
const K471_BANK     = resolve(ROOT, 'R11_QUESTION_BANK_SEALED_K471.json');
const K444_LEGACY   = resolve(ROOT, 'R11_QUESTION_BANK_SEALED_K444_LEGACY.json');

const VERBOSE = process.argv.includes('--verbose');

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
  } else {
    console.error(`  ✗  ${label}${detail ? ': ' + detail : ''}`);
  }
  return condition;
}

// ── Load files ──────────────────────────────────────────────────────────────
console.log('\n=== K471 Reseal Verification ===\n');

let allPassed = true;
const fail = (msg) => { allPassed = false; console.error(`FAIL: ${msg}`); };

// 1. Corpus exists
if (!existsSync(CORPUS_PATH)) {
  fail(`Corpus not found: ${CORPUS_PATH}`);
  process.exit(1);
}
const corpusRaw = readFileSync(CORPUS_PATH, 'utf-8');
const corpusLower = corpusRaw.toLowerCase();
console.log(`Corpus loaded: ${corpusRaw.length} chars, ${corpusRaw.split('\n').length} lines`);

// 2. K471 bank exists
if (!existsSync(K471_BANK)) {
  fail(`K471 bank not found: ${K471_BANK}`);
  process.exit(1);
}
const bank = JSON.parse(readFileSync(K471_BANK, 'utf-8'));
console.log(`K471 bank loaded: ${bank.questions.length} questions, corpus_id=${bank.corpus_id}`);

// 3. Legacy bank preserved
const legacyExists = existsSync(K444_LEGACY);
check('Legacy K444 bank preserved (R11_QUESTION_BANK_SEALED_K444_LEGACY.json)', legacyExists);
if (!legacyExists) allPassed = false;

console.log('\n--- Alignment Check (K471 bank vs corpus) ---\n');

// 4. Exactly 50 questions
const qCount = bank.questions.length;
const has50 = check(`Bank has exactly 50 questions (found ${qCount})`, qCount === 50);
if (!has50) allPassed = false;

// 5. Category distribution
const catCounts = {};
for (const q of bank.questions) {
  catCounts[q.category] = (catCounts[q.category] ?? 0) + 1;
}
const expectedCats = {
  canonical_statistics: 9,
  architecture_mechanics: 8,
  economic_governance: 9,
  member_journey: 8,
  regulatory_compliance: 8,
  historical_precedent: 8,
};
let catOk = true;
for (const [cat, expectedN] of Object.entries(expectedCats)) {
  const got = catCounts[cat] ?? 0;
  const ok = got === expectedN;
  check(`Category ${cat}: ${got} questions (expected ${expectedN})`, ok);
  if (!ok) { catOk = false; allPassed = false; }
}

// 6. Alignment: every hot_required_element is a substring of the corpus
console.log('\n--- Per-question alignment ---\n');
let answerable = 0;
let unanswerable = 0;
const unanswList = [];

for (const q of bank.questions) {
  const elements = q.hot_required_elements ?? [];
  const missingElements = elements.filter(el => !corpusLower.includes(el.toLowerCase()));

  if (missingElements.length === 0) {
    answerable++;
    if (VERBOSE) {
      console.log(`  ✓  ${q.id}  [${q.category}]`);
    }
  } else {
    unanswerable++;
    allPassed = false;
    unanswList.push({ id: q.id, missing: missingElements });
    console.error(`  ✗  ${q.id}  [${q.category}]  — MISSING elements: ${missingElements.join(', ')}`);
    if (VERBOSE) {
      console.error(`       Question: ${q.question}`);
      console.error(`       Expected: ${elements.join(', ')}`);
    }
  }
}

console.log(`\nAnswerable from corpus: ${answerable}/50 (${(answerable * 2).toFixed(0)}%)`);
console.log(`NOT answerable:         ${unanswerable}/50`);

// 7. Verify corpus_id in bank
const corpusIdOk = bank.corpus_id === 'R11-CANONICAL-K471';
check(`Bank corpus_id = "R11-CANONICAL-K471"`, corpusIdOk, `got "${bank.corpus_id}"`);
if (!corpusIdOk) allPassed = false;

// 8. Verify legacy corpus_id in bank
const legacyIdOk = bank.predecessor_corpus_id === 'R11-CANONICAL-K444';
check(`Bank predecessor_corpus_id = "R11-CANONICAL-K444"`, legacyIdOk);
if (!legacyIdOk) allPassed = false;

// 9. Legacy bank sanity check (its corpus_id should be K444)
if (legacyExists) {
  const legacy = JSON.parse(readFileSync(K444_LEGACY, 'utf-8'));
  const legacyCorpusId = legacy.corpus_id ?? '';
  const legacyOk = legacyCorpusId.includes('K444');
  check(`Legacy bank identifies as K444 corpus (corpus_id="${legacyCorpusId}")`, legacyOk);
  if (!legacyOk) allPassed = false;
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('\n=== Summary ===\n');
if (unanswList.length > 0) {
  console.error('Questions NOT answerable from corpus:');
  for (const item of unanswList) {
    console.error(`  ${item.id}: missing [${item.missing.join(', ')}]`);
  }
}

if (allPassed) {
  console.log('✓ ALL CHECKS PASSED — K471 bank is aligned with corpus.');
  console.log(`  Answerable ceiling: ${answerable}/50 = 100%`);
  console.log(`  Corpus ID: ${bank.corpus_id}`);
  console.log(`  Sealed: ${bank.sealed} by ${bank.sealed_by}`);
} else {
  console.error('\n✗ ALIGNMENT FAILED — Do NOT use this bank for publication-grade benchmarks.');
  console.error('  Fix all missing elements and re-run this script.');
  process.exit(1);
}
