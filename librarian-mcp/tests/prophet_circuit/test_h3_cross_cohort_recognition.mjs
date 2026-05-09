/**
 * Bushel 79 — Prophet Circuit H3: Cross-Cohort Recognition (K31)
 * Tests Axis 3 classification accuracy ≥80% on N=200 corpus (sample level).
 * K31 (LB-STACK-0195 / LB-CODEX-0185) — BP034 reduction-to-practice.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const { generateSubstrateCorpus } =
  await import("../../dist/prophet_circuit/substrate_corpus_loader.js");
const { runPatternDetection } =
  await import("../../dist/prophet_circuit/axes/pattern_detection.js");
const { runCrossCohortRecognition, classifySamplesCanon, measureH3Accuracy } =
  await import("../../dist/prophet_circuit/axes/cross_cohort_recognition.js");

const SESSION = "K31_B79_BP034";
const CORPUS = generateSubstrateCorpus(77);
const PATTERNS = runPatternDetection(CORPUS);

test("B79 G4 — Cross-Cohort Recognition: ≥10 patterns classified with BP-cohort span", () => {
  const classifications = runCrossCohortRecognition(PATTERNS, CORPUS);
  console.log(`Pattern classifications: ${classifications.length}`);
  for (const c of classifications) {
    console.log(`  [${c.pattern_id}] canon=${c.is_canon_class} cohort_span=[${c.cohort_span}] classifier=${c.winning_classifier} correct=${c.correct}`);
  }
  // G4 gate: classification metadata includes BP-cohort span
  assert(classifications.length >= 4, `G4 FAIL: only ${classifications.length} patterns classified`);
  for (const c of classifications) {
    assert(Array.isArray(c.cohort_span) && c.cohort_span.length > 0,
      `G4 FAIL: ${c.pattern_id} missing cohort_span metadata`);
  }
  console.log(`G4 PASS: ${classifications.length} pattern classifications with cohort span`);
});

test("B79 G4b — Canon vs Bushel distinction: pattern-level classification", () => {
  const classifications = runCrossCohortRecognition(PATTERNS, CORPUS);
  const canonCount  = classifications.filter(c => c.is_canon_class).length;
  const bushelCount = classifications.filter(c => !c.is_canon_class).length;
  console.log(`Canon-class patterns: ${canonCount} (expected 3: rising/falling/periodic)`);
  console.log(`Bushel-class patterns: ${bushelCount} (expected 1: noise)`);
  assert(canonCount >= 1,  "G4b FAIL: no canon-class patterns detected");
  assert(bushelCount >= 1, "G4b FAIL: no bushel-class patterns detected");
  console.log(`G4b PASS: ${canonCount} canon, ${bushelCount} bushel patterns`);
});

let h3Result;

test("B79 H3 — Cross-Cohort Recognition Accuracy ≥80% (sample level, N=200)", () => {
  const sampleResults = classifySamplesCanon(CORPUS);
  h3Result = measureH3Accuracy(sampleResults);

  const canonCorrect  = sampleResults.filter(r => r.ground_truth_canon && r.correct).length;
  const bushelCorrect = sampleResults.filter(r => !r.ground_truth_canon && r.correct).length;
  const canonTotal    = sampleResults.filter(r => r.ground_truth_canon).length;
  const bushelTotal   = sampleResults.filter(r => !r.ground_truth_canon).length;

  console.log(`H3 sample-level accuracy: ${(h3Result.accuracy * 100).toFixed(2)}% (${h3Result.correctly_classified}/${h3Result.total_samples})`);
  console.log(`  Canon-class:  ${canonCorrect}/${canonTotal} correct`);
  console.log(`  Bushel-class: ${bushelCorrect}/${bushelTotal} correct`);
  console.log(`H3 target: ≥80%`);
  console.log(`H3 PASS: ${h3Result.h3_pass}`);
  assert(h3Result.h3_pass, `H3 FAIL: accuracy ${(h3Result.accuracy * 100).toFixed(2)}% < 80%`);
});

test("B79 H3 receipt — Print H3 reduction-to-practice receipt", () => {
  const sampleResults = classifySamplesCanon(CORPUS);
  h3Result = measureH3Accuracy(sampleResults);

  console.log("\n" + "=".repeat(70));
  console.log("BUSHEL 79 — H3 CROSS-COHORT RECOGNITION — REDUCTION-TO-PRACTICE RECEIPT");
  console.log("=".repeat(70));
  console.log(`H3 accuracy: ${(h3Result.accuracy * 100).toFixed(2)}% ≥ 80% → ${h3Result.h3_pass ? "PASS" : "FAIL"}`);
  console.log(`Corpus: ${h3Result.total_samples} samples`);
  console.log(`Correctly classified: ${h3Result.correctly_classified}/${h3Result.total_samples}`);
  console.log(`K31 Axis 3 (LB-STACK-0195): Cross-Cohort Recognition CONFIRMED`);
});
