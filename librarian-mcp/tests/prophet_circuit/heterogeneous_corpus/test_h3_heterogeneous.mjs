/**
 * B79-FOLLOWUP-V2 — G4 Gate
 * H3: Cross-Cohort Recognition accuracy ≥80% on BP025–BP034 span (N=1200).
 * K31 (LB-STACK-0195 / LB-CODEX-0185) — BP034 non-prov strengthening.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const {
  loadHeterogeneousCorpus,
  measureH3AccuracyHeterogeneous,
} = await import("../../../dist/prophet_circuit/substrate_corpus_loader.js");

const CORPUS = loadHeterogeneousCorpus({ seed: 42, includeChallenge: true });

let h3Result;

test("G4 — H3 cohort span covers BP025–BP034 (10 cohorts)", () => {
  const cohorts = new Set(CORPUS.samples.map(s => s.cohort));
  const required = [
    "BP025","BP026","BP027","BP028","BP029",
    "BP030","BP031","BP032","BP033","BP034",
  ];
  for (const c of required) {
    assert.ok(cohorts.has(c), `G4 FAIL: missing cohort ${c}`);
  }
  console.log(`G4 PASS: all 10 cohorts present (${[...cohorts].sort().join(", ")})`);
});

test("G4 — H3 cross-cohort recognition accuracy ≥80% (N=1200)", () => {
  h3Result = measureH3AccuracyHeterogeneous(CORPUS.samples);

  console.log("\n" + "=".repeat(70));
  console.log("H3 CROSS-COHORT RECOGNITION — HETEROGENEOUS CORPUS");
  console.log("=".repeat(70));
  console.log(`Total samples: ${h3Result.total}`);
  console.log(`Correct: ${h3Result.correct}`);
  console.log(`H3 accuracy: ${(h3Result.accuracy * 100).toFixed(2)}% (target ≥80%)`);
  console.log(`Canon: ${h3Result.canon_correct}/${h3Result.canon_total}`);
  console.log(`Bushel: ${h3Result.bushel_correct}/${h3Result.bushel_total}`);
  console.log("\nPer-class breakdown:");
  for (const [cls, v] of Object.entries(h3Result.per_class)) {
    const acc = (v.correct / v.total * 100).toFixed(1);
    console.log(`  ${cls.padEnd(15)}: ${acc}% (${v.correct}/${v.total}) canon=${v.is_canon}`);
  }
  console.log(`H3 PASS: ${h3Result.h3_pass}`);

  assert.ok(
    h3Result.h3_pass,
    `G4 FAIL: H3 accuracy ${(h3Result.accuracy * 100).toFixed(2)}% < 80%`,
  );
  console.log("=".repeat(70));
});

test("G4 — H3 base classes correctly identified as canon (≥10 cohorts each)", () => {
  for (const cls of ["linear", "periodic", "random_walk", "regime_shift"]) {
    const clsSamples = CORPUS.samples.filter(s => s.class === cls);
    const allCanon = clsSamples.every(s => s.is_canon);
    assert.ok(allCanon, `G4 FAIL: ${cls} samples not all canon`);
    const cohorts = new Set(clsSamples.map(s => s.cohort));
    assert.ok(cohorts.size >= 10, `G4 FAIL: ${cls} in only ${cohorts.size} cohorts`);
  }
  console.log("G4 PASS: all 4 base classes confirmed canon across 10 cohorts");
});

test("G4 — H3 noise_only correctly identified as bushel (<3 cohorts)", () => {
  const noiseSamples = CORPUS.samples.filter(s => s.class === "noise_only");
  const cohorts = new Set(noiseSamples.map(s => s.cohort));
  assert.ok(cohorts.size < 3, `G4 FAIL: noise_only in ${cohorts.size} cohorts (expected <3)`);
  const allBushel = noiseSamples.every(s => !s.is_canon);
  assert.ok(allBushel, "G4 FAIL: noise_only samples not all marked bushel");
  console.log(`G4 PASS: noise_only is bushel (${cohorts.size} cohorts < 3)`);
});

test("G4 — H3 extended cohort span: BP025–BP030 (extrapolated-synthetic cohorts)", () => {
  const syntheticCohorts = ["BP025","BP026","BP027","BP028","BP029","BP030"];
  const cohortSet = new Set(CORPUS.samples.map(s => s.cohort));
  for (const c of syntheticCohorts) {
    assert.ok(cohortSet.has(c), `G4 FAIL: missing synthetic cohort ${c}`);
  }
  const syntheticSamples = CORPUS.samples.filter(s => syntheticCohorts.includes(s.cohort));
  console.log(`G4 PASS: ${syntheticSamples.length} samples in extended cohort span BP025–BP030`);
});
