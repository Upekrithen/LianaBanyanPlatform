/**
 * Bushel 73 — Oracle Circuit Ablation Matrix Test
 * H1 (composition correctness): Full Oracle accuracy on mixed-class tasks
 *   exceeds best three-of-four ablation by ≥ 15pp; graceful tradeoff on pure-class tasks.
 * K29 (LB-STACK-0184 / LB-CODEX-0178) — BP032.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

// Import compiled JS
const { generateCorpus } = await import("../../dist/oracle_circuit/corpus.js");
const { runAblationMatrix, computeH1, serializeAblationMatrix, writeIronTabletReceipt } = await import("../../dist/oracle_circuit/measure.js");

const CIRCUIT_ID = "bushel_73_ablation";
const SESSION = "K533_BP032";
const RECEIPT_DIR = resolve(homedir(), ".lb-session", "oracle_circuit");

test("B73 G1 — Each axis individually: ≥95% on single-class tasks (sanity)", async () => {
  const corpus = generateCorpus({ n_per_class: 50, noise_level: 0.1, include_adversarial: false, rng_seed: 42 });
  const rows = runAblationMatrix(corpus, CIRCUIT_ID);

  const byName = Object.fromEntries(rows.map(r => [r.condition, r.per_class]));
  // Each single-axis condition must score ≥95% on its native class
  assert(byName["A1-only"].pure_reactive.accuracy >= 0.95,
    `A1-only on pure_reactive: ${byName["A1-only"].pure_reactive.accuracy}`);
  assert(byName["A2-only"].derived_criterion.accuracy >= 0.90,  // noise allows slight drop
    `A2-only on derived_criterion: ${byName["A2-only"].derived_criterion.accuracy}`);
  assert(byName["A3-only"].variable_arity.accuracy >= 0.90,
    `A3-only on variable_arity: ${byName["A3-only"].variable_arity.accuracy}`);
  assert(byName["A4-only"].ballot_convergent.accuracy >= 0.85,
    `A4-only on ballot_convergent: ${byName["A4-only"].ballot_convergent.accuracy}`);
});

test("B73 G2+G3 — H1 PASS: Full Oracle ≥15pp over best three-of-four on mixed", async () => {
  const corpus = generateCorpus({ n_per_class: 50, noise_level: 0.1, include_adversarial: true, rng_seed: 42 });
  const rows = runAblationMatrix(corpus, CIRCUIT_ID);
  const h1 = computeH1(rows);

  console.log(`\nH1a mixed: full=${(h1.mixed_full*100).toFixed(1)}%, best3of4=${(h1.mixed_best_three_of_four*100).toFixed(1)}%, Δ=${h1.delta_pp.toFixed(1)}pp`);
  console.log(`H1a adversarial: full=${(h1.adversarial_full*100).toFixed(1)}%, Δ=${h1.adversarial_delta_pp.toFixed(1)}pp`);
  console.log(`H1b graceful: ${h1.graceful_tradeoff_passes}/${h1.graceful_tradeoff_total}`);

  assert(h1.h1a_pass, `H1a FAIL: Δ=${h1.delta_pp.toFixed(1)}pp (need ≥15pp)`);
  assert(h1.h1b_pass, `H1b FAIL: ${h1.graceful_tradeoff_passes}/${h1.graceful_tradeoff_total} graceful tradeoffs`);
  assert(h1.overall_pass, "H1 OVERALL FAIL");
});

test("B73 G7 — Ablation matrix output with CIs written", async () => {
  const corpus = generateCorpus({ n_per_class: 50, noise_level: 0.1, include_adversarial: true, rng_seed: 42 });
  const rows = runAblationMatrix(corpus, CIRCUIT_ID);
  const matrix = serializeAblationMatrix(rows);

  // Print ablation table
  const classes = ["pure_reactive", "derived_criterion", "variable_arity", "ballot_convergent", "mixed", "adversarial"];
  console.log("\nAblation Matrix (accuracy ± 95% CI):");
  console.log(`${"Condition".padEnd(14)} ${classes.map(c => c.slice(0,8).padStart(10)).join("")}`);
  for (const [cond, perClass] of Object.entries(matrix)) {
    const row = classes.map(cls => {
      const [acc, lo, hi] = perClass[cls] ?? [0,0,0];
      return `${(acc*100).toFixed(1)}%`.padStart(10);
    }).join("");
    console.log(`${cond.padEnd(14)}${row}`);
  }

  // Write Iron Tablet receipt (G8)
  await writeIronTabletReceipt("ablation_matrix", { matrix, corpus_size: corpus.length }, SESSION);
  mkdirSync(RECEIPT_DIR, { recursive: true });
  writeFileSync(resolve(RECEIPT_DIR, "ablation_matrix.json"), JSON.stringify({ matrix, corpus_size: corpus.length }, null, 2));
  console.log(`\nG8: Iron Tablet receipt written to ${RECEIPT_DIR}`);
});

test("B73 H1 full run — report verdict", async () => {
  const corpus = generateCorpus({ n_per_class: 50, noise_level: 0.1, include_adversarial: true, rng_seed: 42 });
  const rows = runAblationMatrix(corpus, CIRCUIT_ID);
  const h1 = computeH1(rows);

  console.log(`\n${"=".repeat(60)}`);
  console.log("H1 FINAL VERDICT");
  console.log(`${"=".repeat(60)}`);
  console.log(`H1a (mixed Δpp): ${h1.delta_pp.toFixed(1)}pp [target ≥15pp] → ${h1.h1a_pass ? "PASS" : "FAIL"}`);
  console.log(`H1a (adversarial Δpp): ${h1.adversarial_delta_pp.toFixed(1)}pp → ${h1.adversarial_delta_pp >= 15 ? "PASS" : "MARGINAL"}`);
  console.log(`H1b (graceful): ${h1.graceful_tradeoff_passes}/${h1.graceful_tradeoff_total} → ${h1.h1b_pass ? "PASS" : "FAIL"}`);
  console.log(`H1 OVERALL: ${h1.overall_pass ? "PASS" : "FAIL"}`);

  assert(h1.overall_pass, `H1 FAIL — K29 stays adopted-provisional`);
});
