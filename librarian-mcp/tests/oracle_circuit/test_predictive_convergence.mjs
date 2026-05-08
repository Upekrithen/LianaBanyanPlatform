/**
 * Bushel 73 — Oracle Circuit H2: Predictive Convergence Test
 * Axis 4 ballot accumulator predicts correct outcome with ≥85% accuracy
 * after observing ≤70% of ballots.
 * K29 (LB-STACK-0184 / LB-CODEX-0178) — BP032.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

const { generateCorpus } = await import("../../dist/oracle_circuit/corpus.js");
const { measurePredictiveConvergence, writeIronTabletReceipt } = await import("../../dist/oracle_circuit/measure.js");

const SESSION = "K533_BP032";
const RECEIPT_DIR = resolve(homedir(), ".lb-session", "oracle_circuit");

test("B73 G4 — H2: Axis 4 median stabilization ≤70% ballots, accuracy at 70% ≥85%", async () => {
  const corpus = generateCorpus({ n_per_class: 50, noise_level: 0.1, include_adversarial: false, rng_seed: 42 });
  const result = measurePredictiveConvergence(corpus);

  console.log(`\nH2 Predictive Convergence:`);
  console.log(`  Ballot tasks: ${result.tasks_evaluated}`);
  console.log(`  Tasks stabilized (conf≥0.85): ${result.tasks_stabilized}/${result.tasks_evaluated}`);
  console.log(`  Median stabilization: ${result.median_stabilization_fraction !== null ? (result.median_stabilization_fraction * 100).toFixed(1) + "%" : "N/A"}`);
  console.log(`  Mean stabilization: ${result.mean_stabilization_fraction !== null ? (result.mean_stabilization_fraction * 100).toFixed(1) + "%" : "N/A"}`);
  console.log(`  Accuracy at 70% observation: ${(result.accuracy_at_70pct * 100).toFixed(1)}% [target ≥85%]`);

  assert(result.median_stabilization_fraction !== null,
    "No tasks stabilized — median is null");
  assert(result.median_stabilization_fraction <= 0.70,
    `Median stabilization ${(result.median_stabilization_fraction * 100).toFixed(1)}% exceeds 70% target`);
  assert(result.accuracy_at_70pct >= 0.85,
    `Accuracy at 70%: ${(result.accuracy_at_70pct * 100).toFixed(1)}% < 85% target`);

  console.log(`  H2 OVERALL: ${result.h2_pass ? "PASS" : "FAIL"}`);

  // Write Iron Tablet receipt (G8)
  await writeIronTabletReceipt("h2_predictive_convergence", result, SESSION);
  mkdirSync(RECEIPT_DIR, { recursive: true });
  writeFileSync(resolve(RECEIPT_DIR, "h2_convergence.json"), JSON.stringify(result, null, 2));
  console.log(`  G8: Receipt written`);
});

test("B73 G4 — H2 stabilization curve (detailed per-fraction table)", async () => {
  const corpus = generateCorpus({ n_per_class: 50, noise_level: 0.1, include_adversarial: false, rng_seed: 42 });
  const ballotTasks = corpus.filter(t => t.class === "ballot_convergent");

  const { axis4BallotAccumulator } = await import("../../dist/oracle_circuit/axes/ballot.js");

  // Sample stabilization curve at 10 evenly-spaced fractions
  const fractions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  console.log("\nStabilization curve (% of tasks with correct prediction ≥0.85 confidence):");
  for (const frac of fractions) {
    let correct = 0;
    for (const task of ballotTasks) {
      const gtOutcome = task.ground_truth[4][0];
      const result = axis4BallotAccumulator(task, frac);
      if (result?.kind === "ballot" && result.outcome === gtOutcome && result.confidence >= 0.85) correct++;
    }
    const pct = (correct / ballotTasks.length * 100).toFixed(1);
    const bar = "█".repeat(Math.round(correct / ballotTasks.length * 20));
    console.log(`  ${(frac * 100).toFixed(0)}% ballots: ${pct}% stable ${bar}`);
  }
});
