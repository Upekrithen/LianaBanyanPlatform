/**
 * B79-FOLLOWUP-V2 — G3 Gate
 * H2: Trend Extrapolation Calibration ≥70% via Bootstrap CI 50/80/95.
 * K31 (LB-STACK-0195 / LB-CODEX-0185) — BP034 non-prov strengthening.
 *
 * R-MECHANISM-VERIFY: random_walk uses null forecast (expected = last observed).
 * No directional extrapolation for stochastic series.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));

const {
  loadHeterogeneousCorpus,
  measureH2CalibrationHeterogeneous,
} = await import("../../../dist/prophet_circuit/substrate_corpus_loader.js");

const CORPUS = loadHeterogeneousCorpus({ seed: 42, includeChallenge: true });

let h2Result;

test("G3 — H2 calibration ≥70% via bootstrap CI (N=1200)", () => {
  h2Result = measureH2CalibrationHeterogeneous(CORPUS.samples, 100, 42);

  console.log("\n" + "=".repeat(70));
  console.log("H2 TREND CALIBRATION — HETEROGENEOUS CORPUS");
  console.log("=".repeat(70));
  console.log(`Total samples: ${h2Result.total}`);
  console.log(`Calibration rate: ${(h2Result.calibration_rate * 100).toFixed(2)}% (target ≥70%)`);
  console.log(`Bootstrap median: ${(h2Result.bootstrap_median * 100).toFixed(2)}%`);
  console.log(`Bootstrap CI 50: [${(h2Result.bootstrap_ci_50[0]*100).toFixed(1)}%, ${(h2Result.bootstrap_ci_50[1]*100).toFixed(1)}%]`);
  console.log(`Bootstrap CI 80: [${(h2Result.bootstrap_ci_80[0]*100).toFixed(1)}%, ${(h2Result.bootstrap_ci_80[1]*100).toFixed(1)}%]`);
  console.log(`Bootstrap CI 95: [${(h2Result.bootstrap_ci_95[0]*100).toFixed(1)}%, ${(h2Result.bootstrap_ci_95[1]*100).toFixed(1)}%]`);
  console.log("\nPer-class calibration:");
  for (const [cls, v] of Object.entries(h2Result.per_class)) {
    console.log(`  ${cls.padEnd(15)}: ${(v.rate * 100).toFixed(1)}% (N=${v.total})`);
  }
  console.log(`H2 PASS: ${h2Result.h2_pass}`);

  assert.ok(
    h2Result.h2_pass,
    `G3 FAIL: H2 calibration ${(h2Result.calibration_rate * 100).toFixed(2)}% < 70%`,
  );
  console.log("=".repeat(70));
});

test("G3 — H2 R-MECHANISM-VERIFY: random_walk uses null forecast", () => {
  // Verify that random_walk ground truth method = null_forecast (no directional extrapolation)
  const rwSamples = CORPUS.samples.filter(s => s.class === "random_walk");
  for (const s of rwSamples) {
    assert.equal(
      s.ground_truth.method, "null_forecast",
      `MECHANISM-VERIFY FAIL: random_walk sample ${s.id} uses method '${s.ground_truth.method}' not null_forecast`,
    );
    // expected_horizon_5 must equal last observed value (null forecast)
    const last = s.data_points[s.data_points.length - 1];
    assert.equal(
      s.ground_truth.expected_horizon_5, last,
      `MECHANISM-VERIFY FAIL: ${s.id} expected_horizon_5=${s.ground_truth.expected_horizon_5} ≠ last=${last}`,
    );
  }
  console.log(`R-MECHANISM-VERIFY PASS: ${rwSamples.length} random_walk samples use null forecast ✓`);
});

test("G3 — H2 R-MECHANISM-VERIFY: noise_only uses null forecast", () => {
  const noiseSamples = CORPUS.samples.filter(s => s.class === "noise_only");
  for (const s of noiseSamples) {
    assert.equal(
      s.ground_truth.method, "null_forecast",
      `MECHANISM-VERIFY FAIL: noise_only sample ${s.id} uses method '${s.ground_truth.method}'`,
    );
  }
  console.log(`R-MECHANISM-VERIFY PASS: ${noiseSamples.length} noise_only samples use null forecast ✓`);
});

test("G3 — H2 bootstrap CI structure valid (100 resamples)", () => {
  assert.ok(Array.isArray(h2Result.bootstrap_ci_50), "CI 50 not array");
  assert.ok(Array.isArray(h2Result.bootstrap_ci_80), "CI 80 not array");
  assert.ok(Array.isArray(h2Result.bootstrap_ci_95), "CI 95 not array");
  // CI ordering: 95 outer > 80 outer > 50 outer
  assert.ok(
    h2Result.bootstrap_ci_95[1] >= h2Result.bootstrap_ci_80[1],
    "CI ordering FAIL: 95 upper < 80 upper",
  );
  assert.ok(
    h2Result.bootstrap_ci_80[1] >= h2Result.bootstrap_ci_50[1],
    "CI ordering FAIL: 80 upper < 50 upper",
  );
  console.log("G3 PASS: Bootstrap CI structure valid (50/80/95)");
});
