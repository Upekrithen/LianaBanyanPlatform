/**
 * Bushel 74 — Contingency Operator Tests (H1, H2, H3)
 * K30 (LB-STACK-0185 / LB-CODEX-0179) — BP032 reduction-to-practice.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const { generateCorpus } = await import("../../dist/contingency_operator/corpus.js");
const { runCorpus, computeH1, computeH2, computeH3, writeReceipt } = await import("../../dist/contingency_operator/measure.js");

const SESSION = "K533_BP032";
const CORPUS = generateCorpus({ n_per_class: 30, n_strategies: 4, rng_seed: 99 });

console.log(`Corpus: ${CORPUS.length} problems (30 per class × 6 classes, 4 strategies each)`);

let results;

test("B74 G-base — Run all corpus problems", () => {
  results = runCorpus(CORPUS, SESSION, 42);
  assert.equal(results.length, CORPUS.length, "Should produce one result per problem");
  console.log(`Results: ${results.length} problems processed`);
  const committed = results.filter(r => r.committed_branch_id !== null).length;
  console.log(`Committed: ${committed}/${results.length}`);
});

test("B74 H1 — Speedup: K30 steps ≤80% of serial (parallel beats sequential)", () => {
  const h1 = computeH1(results);
  console.log(`H1 speedup_ratio: ${h1.speedup_ratio.toFixed(3)} (target ≤0.80)`);
  console.log(`H1 PASS: ${h1.h1_pass}`);
  assert(h1.h1_pass, `H1 FAIL: speedup_ratio ${h1.speedup_ratio.toFixed(3)} > 0.80`);
});

test("B74 H2 — Correctness: committed accuracy ≥90% of best individual", () => {
  const h2 = computeH2(results);
  console.log(`H2 committed_vs_best: ${(h2.committed_vs_best_mean*100).toFixed(1)}% (target ≥90%)`);
  console.log(`H2 PASS: ${h2.h2_pass}`);
  assert(h2.h2_pass, `H2 FAIL: ratio ${h2.committed_vs_best_mean.toFixed(3)} < 0.90`);
});

test("B74 H3 — Compute recycling: discarded branches had their steps recycled", () => {
  const h3 = computeH3(results);
  const totalDiscards = results.reduce((s, r) => s + r.discard_events, 0);
  const totalPursues = results.reduce((s, r) => s + r.pursue_events, 0);
  const totalMerges = results.reduce((s, r) => s + r.merge_events, 0);
  console.log(`H3 total_discards: ${totalDiscards}, pursues: ${totalPursues}, merges: ${totalMerges}`);
  console.log(`H3 PASS: ${h3.h3_pass}`);
  assert(h3.h3_pass, "H3 FAIL: no discard events observed — recycling not demonstrated");
});

test("B74 G-verdict — Write Iron Tablet receipt", async () => {
  const h1 = computeH1(results);
  const h2 = computeH2(results);
  const h3 = computeH3(results);
  const allPass = h1.h1_pass && h2.h2_pass && h3.h3_pass;

  const receipt = {
    session: SESSION,
    authored: new Date().toISOString(),
    method: "Bushel 74 rigorous TS — 6-class corpus, 4 strategies, seeded rng",
    corpus_size: CORPUS.length,
    n_strategies: 4,
    discard_floor: 0.45,
    warm_up: 18,
    consecutive_below: 3,
    h1: { ...h1 },
    h2: { ...h2 },
    h3: { ...h3 },
    k30_verdict: allPass ? "CONFIRMED" : h2.h2_pass ? "ADOPTED_PROVISIONAL_HELD" : "REVISION_REQUIRED",
    iron_tablet_receipts: 1,
  };

  await writeReceipt("B74_full_receipt", receipt, SESSION);

  console.log("\n" + "=".repeat(70));
  console.log("BUSHEL 74 — CONTINGENCY OPERATOR — REDUCTION-TO-PRACTICE RECEIPT");
  console.log("=".repeat(70));
  console.log(`H1 speedup: ${h1.speedup_ratio.toFixed(3)} ≤ 0.80 → ${h1.h1_pass ? "PASS" : "FAIL"}`);
  console.log(`H2 accuracy ratio: ${(h2.committed_vs_best_mean*100).toFixed(1)}% ≥ 90% → ${h2.h2_pass ? "PASS" : "FAIL"}`);
  console.log(`H3 recycling: ${h3.h3_pass ? "PASS" : "FAIL"}`);
  console.log(`K30 VERDICT: ${receipt.k30_verdict}`);
  console.log(`LB-STACK-0185 row: ${allPass ? "CONFIRMED" : "PROVISIONAL"}`);
  console.log(`LB-CODEX-0179: ${allPass ? "BIND" : "HOLD"}`);

  assert(allPass, `Not all G-gates passed: H1=${h1.h1_pass} H2=${h2.h2_pass} H3=${h3.h3_pass}`);
});
