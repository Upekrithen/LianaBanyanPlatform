/**
 * Bushel 79 — H1: Pattern Detection Test
 * K31 Prophet Circuit (LB-STACK-0195) — BP034 reduction-to-practice.
 *
 * H1: Axis 1 correctly identifies repeating structures on held-out corpus.
 * Target: accuracy ≥ 75% on corpus spanning 4+ BP-cohorts.
 *
 * G2 gate: K30 branch evaluation completes without error; ≥10 patterns detected.
 * G7 gate: H1 accuracy ≥ 75%.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const { generateSubstrateCorpus } = await import("../../dist/prophet_circuit/substrate_corpus_loader.js");
const { runAxis1PatternDetection } = await import("../../dist/prophet_circuit/axes/pattern_detection.js");

const SESSION = "B79_BP034";
const CORPUS = generateSubstrateCorpus({ n_per_cohort: 50, rng_seed: 31 });

console.log(`Corpus: ${CORPUS.length} samples (50 per cohort × 4 cohorts: B73-B76)`);
console.log(`Patterned samples: ${CORPUS.filter(s => s.ground_truth.has_pattern).length}`);
console.log(`Canon-class samples: ${CORPUS.filter(s => s.ground_truth.canon_class).length}`);

let axis1Result;

test("B79 G1 — Substrate corpus loaded: ≥100 samples across 4+ BP-cohorts", () => {
  const cohorts = new Set(CORPUS.map(s => s.cohort_id));
  assert(CORPUS.length >= 100, `G1 FAIL: only ${CORPUS.length} samples loaded`);
  assert(cohorts.size >= 4, `G1 FAIL: only ${cohorts.size} cohorts (need ≥4)`);
  console.log(`G1 PASS: ${CORPUS.length} samples, ${cohorts.size} cohorts: ${[...cohorts].join(", ")}`);
});

test("B79 G2 — Axis 1 K30 branch evaluation completes; ≥10 patterns detected", () => {
  axis1Result = runAxis1PatternDetection(CORPUS, SESSION, 42);
  assert(axis1Result.patterns.length >= 10,
    `G2 FAIL: only ${axis1Result.patterns.length} patterns detected (need ≥10)`);
  assert(axis1Result.k30_winning_strategy >= 0 && axis1Result.k30_winning_strategy <= 3,
    "G2 FAIL: invalid k30_winning_strategy index");
  console.log(`G2 PASS: ${axis1Result.patterns.length} patterns detected`);
  console.log(`G2 K30 winning strategy: [${axis1Result.k30_winning_strategy}] ${axis1Result.k30_strategy_name}`);
});

test("B79 G7 — H1: Pattern detection accuracy ≥ 75%", () => {
  const { h1 } = axis1Result;
  console.log(`H1 accuracy: ${(h1.accuracy * 100).toFixed(1)}% (target ≥75%)`);
  console.log(`H1 precision: ${(h1.precision * 100).toFixed(1)}%`);
  console.log(`H1 recall: ${(h1.recall * 100).toFixed(1)}%`);
  console.log(`H1 TP=${h1.true_positives} FP=${h1.false_positives} TN=${h1.true_negatives} FN=${h1.false_negatives}`);
  console.log(`H1 PASS: ${h1.h1_pass}`);
  assert(h1.h1_pass, `G7 FAIL: H1 accuracy ${(h1.accuracy * 100).toFixed(1)}% < 75%`);
});

test("B79 G7 receipt — Print H1 summary", () => {
  const { h1 } = axis1Result;
  console.log("\n" + "=".repeat(70));
  console.log("BUSHEL 79 — PROPHET CIRCUIT — H1 PATTERN DETECTION RECEIPT");
  console.log("=".repeat(70));
  console.log(`Corpus: ${CORPUS.length} samples (4 cohorts, seed=31)`);
  console.log(`K30 winning strategy: ${axis1Result.k30_strategy_name} [idx=${axis1Result.k30_winning_strategy}]`);
  console.log(`Patterns detected: ${axis1Result.patterns.length}`);
  console.log(`H1 accuracy: ${(h1.accuracy * 100).toFixed(1)}% → ${h1.h1_pass ? "PASS" : "FAIL"}`);
  console.log(`LB-STACK-0195: ${h1.h1_pass ? "H1 CONFIRMED" : "H1 REVISION REQUIRED"}`);
  assert(h1.h1_pass, "G7 final check FAIL");
});
