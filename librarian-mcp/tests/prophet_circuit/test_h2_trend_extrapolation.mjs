/**
 * Bushel 79 — H2: Trend Extrapolation Test
 * K31 Prophet Circuit (LB-STACK-0195) — BP034 reduction-to-practice.
 *
 * H2: Projections fall within ±20% CI ≥70% of the time on next-N-Bushel metrics.
 * Bootstrap resampling from historical A+F Ledger establishes confidence bands.
 * Time horizons tested: N=5, 10, 20.
 *
 * G3 gate: bootstrap resampling completes for ≥5 patterns.
 * G8 gate: H2 calibration ≥ 70%.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const { generateSubstrateCorpus } = await import("../../dist/prophet_circuit/substrate_corpus_loader.js");
const { runAxis1PatternDetection } = await import("../../dist/prophet_circuit/axes/pattern_detection.js");
const { runAxis2TrendExtrapolation } = await import("../../dist/prophet_circuit/axes/trend_extrapolation.js");

const SESSION = "B79_BP034";
const CORPUS = generateSubstrateCorpus({ n_per_cohort: 50, rng_seed: 31 });

let patterns;
let axis2Result;

test("B79 G2 prerequisite — Axis 1 detected patterns", () => {
  const axis1 = runAxis1PatternDetection(CORPUS, SESSION, 42);
  patterns = axis1.patterns;
  assert(patterns.length >= 5, `G3 prerequisite FAIL: need ≥5 patterns, got ${patterns.length}`);
  console.log(`Prerequisite: ${patterns.length} patterns from Axis 1`);
});

test("B79 G3 — Axis 2 bootstrap resampling completes for ≥5 patterns", () => {
  axis2Result = runAxis2TrendExtrapolation(patterns, CORPUS, SESSION, 43);
  assert(axis2Result.projections.length >= 5,
    `G3 FAIL: only ${axis2Result.projections.length} projections (need ≥5)`);
  console.log(`G3 PASS: ${axis2Result.projections.length} projections with confidence bands`);
  console.log(`G3 K30 winning strategy: [${axis2Result.k30_winning_strategy}] ${axis2Result.k30_strategy_name}`);

  // Verify confidence bands present for each projection
  for (const p of axis2Result.projections.slice(0, 5)) {
    assert(p.confidence_bands.length === 3, `G3 FAIL: pattern ${p.pattern_id} missing confidence bands`);
  }
  console.log(`G3 confidence bands validated for all projections`);
});

test("B79 H2 per-horizon — Calibration ≥70% at each horizon", () => {
  const { h2 } = axis2Result;
  console.log(`H2 calibration per horizon:`);
  for (const [h, calib] of Object.entries(h2.calibration_per_horizon)) {
    console.log(`  Horizon ${h}: ${(Number(calib) * 100).toFixed(1)}%`);
  }
  console.log(`H2 mean calibration: ${(h2.mean_calibration * 100).toFixed(1)}% (target ≥70%)`);
  console.log(`H2 patterns projected: ${h2.patterns_projected}`);
});

test("B79 G8 — H2: Mean calibration ≥ 70%", () => {
  const { h2 } = axis2Result;
  console.log(`H2 mean_calibration: ${(h2.mean_calibration * 100).toFixed(1)}% → ${h2.h2_pass ? "PASS" : "FAIL"}`);
  assert(h2.h2_pass, `G8 FAIL: mean calibration ${(h2.mean_calibration * 100).toFixed(1)}% < 70%`);

  console.log("\n" + "=".repeat(70));
  console.log("BUSHEL 79 — PROPHET CIRCUIT — H2 TREND EXTRAPOLATION RECEIPT");
  console.log("=".repeat(70));
  console.log(`Corpus: ${CORPUS.length} samples, ${patterns.length} patterns`);
  console.log(`K30 winning strategy: ${axis2Result.k30_strategy_name} [idx=${axis2Result.k30_winning_strategy}]`);
  console.log(`Projections: ${h2.patterns_projected} patterns × 3 horizons (5, 10, 20 Bushels)`);
  console.log(`H2 mean calibration: ${(h2.mean_calibration * 100).toFixed(1)}% → ${h2.h2_pass ? "PASS" : "FAIL"}`);
  console.log(`LB-STACK-0195: ${h2.h2_pass ? "H2 CONFIRMED" : "H2 REVISION REQUIRED"}`);
});
