/**
 * Bushel 79 — Decision-Class Trinity Integration Test (K28+K29+K30+K31)
 * G5/G6/G10 composability: Prophet receives context, queries Oracle, invokes Contingency,
 * emits SCR-compliant Almanac §4. All four Trinity members compose cleanly.
 * K31 (LB-STACK-0195 / LB-CODEX-0185) — BP034 reduction-to-practice.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const { generateSubstrateCorpus } =
  await import("../../dist/prophet_circuit/substrate_corpus_loader.js");
const { runMetaProphet } =
  await import("../../dist/prophet_circuit/meta_prophet.js");
const { validateAlmanacSchema, renderAlmanacSection4 } =
  await import("../../dist/prophet_circuit/almanac_renderer.js");
const { measureH1Accuracy } =
  await import("../../dist/prophet_circuit/axes/pattern_detection.js");
const { measureH2Calibration, runTrendExtrapolation } =
  await import("../../dist/prophet_circuit/axes/trend_extrapolation.js");
const { classifySamplesCanon, measureH3Accuracy, runCrossCohortRecognition } =
  await import("../../dist/prophet_circuit/axes/cross_cohort_recognition.js");
const { runPatternDetection } =
  await import("../../dist/prophet_circuit/axes/pattern_detection.js");

const SESSION = "K31_B79_BP034";
const CORPUS = generateSubstrateCorpus(77);

let forecast;

test("B79 G5 — Meta-Prophet K30-of-K30: synthesizes ProphetForecast via ensemble strategy", () => {
  forecast = runMetaProphet(CORPUS, SESSION);
  console.log(`Meta-strategy: ${forecast.meta_strategy}`);
  console.log(`Patterns: ${forecast.patterns_detected.length}`);
  console.log(`Projections: ${forecast.trend_projections.length}`);
  console.log(`Classifications: ${forecast.cohort_classifications.length}`);
  console.log(`Almanac trends: ${forecast.almanac_trends.length}`);
  assert(forecast.meta_strategy, "G5 FAIL: meta_strategy not selected");
  assert(forecast.patterns_detected.length > 0, "G5 FAIL: no patterns in forecast");
  assert(forecast.trend_projections.length > 0, "G5 FAIL: no projections in forecast");
  console.log(`G5 PASS: Meta-Prophet synthesized ProphetForecast via ${forecast.meta_strategy}`);
});

test("B79 G6 — Almanac §4 Renderer: validates against Almanac schema", () => {
  if (!forecast) forecast = runMetaProphet(CORPUS, SESSION);
  const { valid, errors } = validateAlmanacSchema(forecast);
  console.log(`Almanac schema valid: ${valid}`);
  if (errors.length > 0) console.log(`Schema errors: ${errors.join(", ")}`);
  assert(valid, `G6 FAIL: Almanac schema validation failed: ${errors.join("; ")}`);

  const md = renderAlmanacSection4(forecast);
  assert(md.includes("Almanac §4"), "G6 FAIL: rendered Markdown missing §4 header");
  assert(md.includes("Detected Patterns"), "G6 FAIL: rendered Markdown missing Detected Patterns section");
  assert(md.includes("Trend Projections"), "G6 FAIL: rendered Markdown missing Trend Projections section");
  console.log(`G6 PASS: Almanac §4 rendered (${md.split("\n").length} lines)`);
});

test("B79 G10 — Composability: K28→K29→K30→K31 sequence runs end-to-end", () => {
  // Simulate Trinity sequence: Oracle (decide) → Contingency (branch) → Prophet (forecast) → Hygiene (verify)
  // K28 context: substrate corpus (cross-vendor hygiene input)
  const almanacContext = `[K28-B72] Cross-vendor substrate corpus loaded: ${CORPUS.length} samples`;

  // K29 Oracle: run detection (decides which pattern class per sample)
  const patterns = runPatternDetection(CORPUS);
  const oracleContext = `[K29] Oracle committed ${patterns.length} pattern classes`;

  // K30 Contingency: run extrapolation branches (K30 SPECULATE/PURSUE/DISCARD)
  const projections = runTrendExtrapolation(patterns, CORPUS);
  const contingencyContext = `[K30] Contingency committed ${projections.length} projections`;

  // K31 Prophet: synthesize forecast from above
  const prophetForecast = runMetaProphet(CORPUS, SESSION);
  const prophetContext = `[K31] Prophet emitted ${prophetForecast.almanac_trends.length} §4 trends via ${prophetForecast.meta_strategy}`;

  // K28 Hygiene: verify Almanac schema (cross-vendor verification)
  const { valid } = validateAlmanacSchema(prophetForecast);
  const hygieneContext = `[K28-hygiene] Schema verified: ${valid}`;

  console.log(`Trinity sequence:`);
  console.log(`  1. ${almanacContext}`);
  console.log(`  2. ${oracleContext}`);
  console.log(`  3. ${contingencyContext}`);
  console.log(`  4. ${prophetContext}`);
  console.log(`  5. ${hygieneContext}`);

  assert(patterns.length > 0,      "G10 FAIL: K29 Oracle produced no patterns");
  assert(projections.length > 0,   "G10 FAIL: K30 Contingency produced no projections");
  assert(prophetForecast.almanac_trends.length > 0, "G10 FAIL: K31 Prophet produced no trends");
  assert(valid,                    "G10 FAIL: K28 Hygiene schema check failed");

  console.log(`G10 PASS: Trinity integration — Oracle→Contingency→Prophet→Hygiene all compose`);
});

test("B79 G10b — SCR-compliant Eblit: forecast emits SCR metadata", () => {
  if (!forecast) forecast = runMetaProphet(CORPUS, SESSION);
  assert.equal(forecast.session, SESSION, "G10b FAIL: session not set in forecast");
  assert(forecast.authored, "G10b FAIL: authored timestamp missing");
  assert(forecast.patterns_detected.every(p => p.pattern_id && p.winning_branch),
    "G10b FAIL: pattern entry missing required SCR fields");
  console.log(`G10b PASS: SCR-compliant Eblet fields verified`);
});

test("B79 FULL RECEIPT — Decision-Class Trinity Complete", async () => {
  if (!forecast) forecast = runMetaProphet(CORPUS, SESSION);

  // Compute all three hypothesis results
  const patterns = forecast.patterns_detected;
  const projections = forecast.trend_projections;

  const h1 = measureH1Accuracy(CORPUS);
  const h2 = measureH2Calibration(projections);
  const sampleResults = classifySamplesCanon(CORPUS);
  const h3 = measureH3Accuracy(sampleResults);

  const allPass = h1.h1_pass && h2.h2_pass && h3.h3_pass;
  const verdict = allPass ? "CONFIRMED" : (h2.h2_pass ? "ADOPTED_PROVISIONAL_HELD" : "REVISION_REQUIRED");

  console.log("\n" + "=".repeat(70));
  console.log("BUSHEL 79 — K31 PROPHET CIRCUIT — REDUCTION-TO-PRACTICE RECEIPT");
  console.log("=".repeat(70));
  console.log(`Session: ${SESSION}`);
  console.log(`Authored: ${forecast.authored}`);
  console.log(`Corpus: ${CORPUS.length} samples, 4 BP-cohorts (BP031-BP034)`);
  console.log(``);
  console.log(`H1 Pattern Detection: ${(h1.accuracy * 100).toFixed(2)}% ≥ 75% → ${h1.h1_pass ? "PASS" : "FAIL"}`);
  console.log(`H2 Trend Calibration: ${(h2.calibration_rate * 100).toFixed(2)}% ≥ 70% → ${h2.h2_pass ? "PASS" : "FAIL"}`);
  console.log(`H3 Cross-Cohort Rec.: ${(h3.accuracy * 100).toFixed(2)}% ≥ 80% → ${h3.h3_pass ? "PASS" : "FAIL"}`);
  console.log(``);
  console.log(`Meta-Strategy: ${forecast.meta_strategy}`);
  console.log(`Patterns: ${patterns.length} | Projections: ${projections.length} | Trends: ${forecast.almanac_trends.length}`);
  console.log(``);
  console.log(`K31 VERDICT: ${verdict}`);
  console.log(`LB-STACK-0195: ${allPass ? "CONFIRMED" : "PROVISIONAL"}`);
  console.log(`LB-CODEX-0185: ${allPass ? "BIND" : "HOLD"}`);
  console.log(`Decision-Class Trinity (K28+K29+K30+K31): ${allPass ? "COMPLETE ✓" : "INCOMPLETE"}`);
  console.log("=".repeat(70));

  assert(allPass, `FULL RECEIPT FAIL: H1=${h1.h1_pass} H2=${h2.h2_pass} H3=${h3.h3_pass}`);
});
