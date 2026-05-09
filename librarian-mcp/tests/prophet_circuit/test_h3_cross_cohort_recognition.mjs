/**
 * Bushel 79 — H3: Cross-Cohort Recognition Test
 * K31 Prophet Circuit (LB-STACK-0195) — BP034 reduction-to-practice.
 *
 * H3: Axis 3 correctly classifies events as canon-class (spans ≥3 BP-cohorts)
 * vs Bushel-class (within-cohort) ≥80% accuracy.
 *
 * G4 gate: classification metadata includes BP-cohort span for all patterns.
 * G9 gate: H3 accuracy ≥ 80%.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const { generateSubstrateCorpus } = await import("../../dist/prophet_circuit/substrate_corpus_loader.js");
const { runAxis1PatternDetection } = await import("../../dist/prophet_circuit/axes/pattern_detection.js");
const { runAxis3CrossCohortRecognition } = await import("../../dist/prophet_circuit/axes/cross_cohort_recognition.js");

const SESSION = "B79_BP034";
const CORPUS = generateSubstrateCorpus({ n_per_cohort: 50, rng_seed: 31 });

let patterns;
let axis3Result;

test("B79 G2 prerequisite — Axis 1 pattern library available", () => {
  const axis1 = runAxis1PatternDetection(CORPUS, SESSION, 42);
  patterns = axis1.patterns;
  assert(patterns.length >= 10, `G4 prerequisite FAIL: need ≥10 patterns, got ${patterns.length}`);
  console.log(`Prerequisite: ${patterns.length} patterns from Axis 1`);
});

test("B79 G4 — Axis 3 classifications include BP-cohort span metadata", () => {
  axis3Result = runAxis3CrossCohortRecognition(patterns, CORPUS, SESSION, 44);
  assert(axis3Result.classifications.length > 0, "G4 FAIL: no classifications produced");
  console.log(`G4 classifications: ${axis3Result.classifications.length} patterns classified`);
  console.log(`G4 K30 winning strategy: [${axis3Result.k30_winning_strategy}] ${axis3Result.k30_strategy_name}`);

  // Verify all classifications have cohort_span metadata
  for (const c of axis3Result.classifications) {
    assert(Array.isArray(c.cohort_span), `G4 FAIL: pattern ${c.pattern_id} missing cohort_span`);
    assert(c.cohort_span.length >= 1, `G4 FAIL: pattern ${c.pattern_id} has empty cohort_span`);
  }
  console.log(`G4 PASS: all ${axis3Result.classifications.length} classifications have BP-cohort span`);

  const canonCount = axis3Result.classifications.filter(c => c.canon_class).length;
  const bushelCount = axis3Result.classifications.filter(c => !c.canon_class).length;
  console.log(`G4 canon-class: ${canonCount}, Bushel-class: ${bushelCount}`);
});

test("B79 G9 — H3: Cross-cohort recognition accuracy ≥ 80%", () => {
  const { h3 } = axis3Result;
  console.log(`H3 accuracy: ${(h3.accuracy * 100).toFixed(1)}% (target ≥80%)`);
  console.log(`H3 total: ${h3.total_patterns}, correct: ${h3.correct_classifications}`);
  console.log(`H3 canon TP: ${h3.canon_true_positives}, canon FN: ${h3.canon_false_negatives}`);
  console.log(`H3 PASS: ${h3.h3_pass}`);
  assert(h3.h3_pass, `G9 FAIL: H3 accuracy ${(h3.accuracy * 100).toFixed(1)}% < 80%`);
});

test("B79 G9 receipt — Print H3 summary", () => {
  const { h3 } = axis3Result;
  console.log("\n" + "=".repeat(70));
  console.log("BUSHEL 79 — PROPHET CIRCUIT — H3 CROSS-COHORT RECOGNITION RECEIPT");
  console.log("=".repeat(70));
  console.log(`Corpus: ${CORPUS.length} samples, ${patterns.length} patterns classified`);
  console.log(`K30 winning strategy: ${axis3Result.k30_strategy_name} [idx=${axis3Result.k30_winning_strategy}]`);
  console.log(`H3 accuracy: ${(h3.accuracy * 100).toFixed(1)}% → ${h3.h3_pass ? "PASS" : "FAIL"}`);
  console.log(`Canon-class TP: ${h3.canon_true_positives}, FN: ${h3.canon_false_negatives}`);
  console.log(`LB-STACK-0195: ${h3.h3_pass ? "H3 CONFIRMED" : "H3 REVISION REQUIRED"}`);
  assert(h3.h3_pass, "G9 final check FAIL");
});
