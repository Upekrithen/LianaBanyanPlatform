/**
 * Bushel 73 — G1: Each axis sanity check on its native task class.
 * K29 (LB-STACK-0184 / LB-CODEX-0178) — BP032.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const { generateCorpus } = await import("../../dist/oracle_circuit/corpus.js");
const { axis1HardcodedGate, scoreAxis1 } = await import("../../dist/oracle_circuit/axes/hardcoded.js");
const { axis2DerivedClass, scoreAxis2 } = await import("../../dist/oracle_circuit/axes/derived.js");
const { axis3VariableArity, scoreAxis3 } = await import("../../dist/oracle_circuit/axes/variable_arity.js");
const { axis4BallotAccumulator, scoreAxis4 } = await import("../../dist/oracle_circuit/axes/ballot.js");

// Clean corpus (no noise) for axis sanity checks
const CLEAN = generateCorpus({ n_per_class: 50, noise_level: 0, include_adversarial: false, rng_seed: 42 });

test("B73 G1a — Axis 1: 50/50 pure_reactive tasks correct (no noise)", () => {
  const tasks = CLEAN.filter(t => t.class === "pure_reactive");
  let correct = 0;
  for (const t of tasks) {
    const out = axis1HardcodedGate(t);
    if (scoreAxis1(out, t.ground_truth[1])) correct++;
  }
  console.log(`Axis 1: ${correct}/${tasks.length} correct`);
  assert.equal(correct, tasks.length, `Expected 50/50, got ${correct}`);
});

test("B73 G1b — Axis 2: 50/50 derived_criterion tasks correct (no noise)", () => {
  const tasks = CLEAN.filter(t => t.class === "derived_criterion");
  let correct = 0;
  for (const t of tasks) {
    const out = axis2DerivedClass(t);
    if (scoreAxis2(out, t.ground_truth[2])) correct++;
  }
  console.log(`Axis 2: ${correct}/${tasks.length} correct`);
  assert.equal(correct, tasks.length, `Expected 50/50, got ${correct}`);
});

test("B73 G1c — Axis 3: 50/50 variable_arity tasks correct (no noise)", () => {
  const tasks = CLEAN.filter(t => t.class === "variable_arity");
  let correct = 0;
  for (const t of tasks) {
    const out = axis3VariableArity(t);
    if (scoreAxis3(out, t.ground_truth[3])) correct++;
  }
  console.log(`Axis 3: ${correct}/${tasks.length} correct`);
  assert.equal(correct, tasks.length, `Expected 50/50, got ${correct}`);
});

test("B73 G1d — Axis 4: ≥85% ballot_convergent tasks correct (probabilistic)", () => {
  const tasks = CLEAN.filter(t => t.class === "ballot_convergent");
  let correct = 0;
  for (const t of tasks) {
    const out = axis4BallotAccumulator(t);
    if (scoreAxis4(out, t.ground_truth[4])) correct++;
  }
  const rate = correct / tasks.length;
  console.log(`Axis 4: ${correct}/${tasks.length} correct (${(rate*100).toFixed(1)}%)`);
  assert(rate >= 0.85, `Axis 4 < 85% on ballot_convergent: ${correct}/${tasks.length}`);
});

test("B73 G1e — Channel exclusivity: each axis returns null on foreign channels", () => {
  // Axis 1 should return null on a derived_criterion task (no scalar channel)
  const dcTask = CLEAN.find(t => t.class === "derived_criterion");
  assert(dcTask, "derived_criterion task not found");
  assert.equal(axis1HardcodedGate(dcTask), null, "Axis 1 should return null without scalar");

  // Axis 2 should return null on a pure_reactive task (no fusion channel)
  const prTask = CLEAN.find(t => t.class === "pure_reactive");
  assert(prTask, "pure_reactive task not found");
  assert.equal(axis2DerivedClass(prTask), null, "Axis 2 should return null without fusion");

  // Axis 3 should return null on a ballot task (no meta/val channels)
  const bcTask = CLEAN.find(t => t.class === "ballot_convergent");
  assert(bcTask, "ballot_convergent task not found");
  assert.equal(axis3VariableArity(bcTask), null, "Axis 3 should return null without meta/val");

  // Axis 4 should return null on a variable_arity task (no ballots)
  const vaTask = CLEAN.find(t => t.class === "variable_arity");
  assert(vaTask, "variable_arity task not found");
  assert.equal(axis4BallotAccumulator(vaTask), null, "Axis 4 should return null without ballots");

  console.log("G1e: All axis channel-exclusivity checks PASS");
});
