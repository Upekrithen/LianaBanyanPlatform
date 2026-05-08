/**
 * Oracle Circuit — Decision Task Corpus Generator
 * 5 task classes × 50 instances = 250 tasks (plus optional adversarial class).
 * Deterministic RNG seed 42 — fully reproducible.
 * K29 (LB-STACK-0184) — Bushel 73 BP032.
 */

import type { DecisionTask, TaskClass, BallotEntry } from "./types.js";
import { CARDINALITIES } from "./axes/variable_arity.js";
import { AXIS_1_THRESHOLD } from "./axes/hardcoded.js";
import { deriveMode } from "./axes/derived.js";

// Minimal seeded LCG RNG for full reproducibility (no external deps)
function makeLcg(seed: number) {
  let s = seed >>> 0;
  return {
    next(): number {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    },
    int(lo: number, hi: number): number {
      return Math.floor(this.next() * (hi - lo + 1)) + lo;
    },
    float(lo: number, hi: number): number {
      return this.next() * (hi - lo) + lo;
    },
    choice<T>(arr: readonly T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
  };
}

const OUTCOME_CLASSES = ["A", "B", "C"] as const;

function genPureReactive(rng: ReturnType<typeof makeLcg>, n = 50): DecisionTask[] {
  return Array.from({ length: n }, (_, i) => {
    const scalar = rng.float(-2, 12);
    const gt: ReactiveGT = scalar > AXIS_1_THRESHOLD ? "trigger" : "no_trigger";
    return {
      id: `pure_reactive_${i}`,
      class: "pure_reactive" as TaskClass,
      scalar,
      needed_axes: [1],
      ground_truth: { 1: gt },
    };
  });
}

type ReactiveGT = "trigger" | "no_trigger";

function genDerivedCriterion(rng: ReturnType<typeof makeLcg>, n = 50): DecisionTask[] {
  return Array.from({ length: n }, (_, i) => {
    const fusion = [rng.float(-3, 5), rng.float(-3, 5), rng.float(-3, 5), rng.float(-3, 5)];
    return {
      id: `derived_criterion_${i}`,
      class: "derived_criterion" as TaskClass,
      fusion,
      needed_axes: [2],
      ground_truth: { 2: deriveMode(fusion) },
    };
  });
}

function genVariableArity(rng: ReturnType<typeof makeLcg>, n = 50): DecisionTask[] {
  return Array.from({ length: n }, (_, i) => {
    const meta = rng.int(0, 4);
    const val = rng.int(0, 500);
    const cardinality = CARDINALITIES[meta % CARDINALITIES.length];
    return {
      id: `variable_arity_${i}`,
      class: "variable_arity" as TaskClass,
      meta, val,
      needed_axes: [3],
      ground_truth: { 3: [cardinality, val % cardinality] },
    };
  });
}

function genBallotConvergent(
  rng: ReturnType<typeof makeLcg>,
  n = 50,
  ballotCount = 20,
  dominance = 0.7,
): DecisionTask[] {
  return Array.from({ length: n }, (_, i) => {
    const dominant = rng.choice(OUTCOME_CLASSES);
    const ballots: BallotEntry[] = Array.from({ length: ballotCount }, () => {
      const outcome = rng.next() < dominance
        ? dominant
        : rng.choice(OUTCOME_CLASSES.filter(o => o !== dominant));
      return { outcome, weight: 1.0 };
    });
    return {
      id: `ballot_convergent_${i}`,
      class: "ballot_convergent" as TaskClass,
      ballots,
      needed_axes: [4],
      ground_truth: { 4: [dominant, null] },
    };
  });
}

function genMixed(rng: ReturnType<typeof makeLcg>, n = 50): DecisionTask[] {
  return Array.from({ length: n }, (_, i) => {
    const scalar = rng.float(-2, 12);
    const fusion = [rng.float(-3, 5), rng.float(-3, 5), rng.float(-3, 5), rng.float(-3, 5)];
    const meta = rng.int(0, 4);
    const val = rng.int(0, 500);
    const dominant = rng.choice(OUTCOME_CLASSES);
    const ballots: BallotEntry[] = Array.from({ length: 20 }, () => ({
      outcome: rng.next() < 0.7 ? dominant : rng.choice(OUTCOME_CLASSES),
      weight: 1.0,
    }));
    const cardinality = CARDINALITIES[meta % CARDINALITIES.length];
    return {
      id: `mixed_${i}`,
      class: "mixed" as TaskClass,
      scalar, fusion, meta, val, ballots,
      needed_axes: [1, 2, 3, 4],
      ground_truth: {
        1: scalar > AXIS_1_THRESHOLD ? "trigger" : "no_trigger",
        2: deriveMode(fusion),
        3: [cardinality, val % cardinality],
        4: [dominant, null],
      },
    };
  });
}

/**
 * Adversarial class: tasks designed to fool single-axis ablations.
 * Each task requires all four axes; no subset of three can solve it.
 * The "confounding" signal is added to interfere with partial compositions.
 */
function genAdversarial(rng: ReturnType<typeof makeLcg>, n = 50): DecisionTask[] {
  return Array.from({ length: n }, (_, i) => {
    // Force each axis into an adversarial-but-correct regime
    // Axis 1: scalar near boundary (adds noise challenge)
    const scalar = AXIS_1_THRESHOLD + rng.float(-0.5, 0.5); // near threshold
    const gt1: ReactiveGT = scalar > AXIS_1_THRESHOLD ? "trigger" : "no_trigger";

    // Axis 2: fusion values near mode boundaries
    const fusion = [rng.float(0.5, 1.5), rng.float(0.5, 1.5), rng.float(0.5, 1.5), rng.float(0.5, 1.5)];

    // Axis 3: high cardinality (128) for larger slot space
    const meta = 4; // always cardinality 128
    const val = rng.int(0, 500);

    // Axis 4: lower dominance (0.55 vs 0.70) — harder convergence
    const dominant = rng.choice(OUTCOME_CLASSES);
    const ballots: BallotEntry[] = Array.from({ length: 20 }, () => ({
      outcome: rng.next() < 0.55 ? dominant : rng.choice(OUTCOME_CLASSES),
      weight: 1.0,
    }));
    const cardinality = CARDINALITIES[meta % CARDINALITIES.length];
    return {
      id: `adversarial_${i}`,
      class: "adversarial" as TaskClass,
      scalar, fusion, meta, val, ballots,
      needed_axes: [1, 2, 3, 4],
      ground_truth: {
        1: gt1,
        2: deriveMode(fusion),
        3: [cardinality, val % cardinality],
        4: [dominant, null],
      },
    };
  });
}

/**
 * Apply noise to a task's input channels (V2 hardened: 10% perturbation).
 */
export function applyNoise(task: DecisionTask, rng: ReturnType<typeof makeLcg>, noiseLevel = 0.1): DecisionTask {
  const noisy = { ...task };
  if (noisy.scalar !== undefined) {
    noisy.scalar += rng.float(-noiseLevel * 12, noiseLevel * 12);
  }
  if (noisy.fusion) {
    noisy.fusion = noisy.fusion.map(v => v + rng.float(-noiseLevel * 8, noiseLevel * 8));
  }
  // Note: meta/val/ballots not noised (discrete channels; noise would change ground truth)
  noisy.noise_applied = true;
  return noisy;
}

/**
 * Generate the full decision task corpus (250 + 50 adversarial = 300 tasks).
 * Deterministic with seed=42.
 */
export function generateCorpus(
  options: { n_per_class?: number; noise_level?: number; include_adversarial?: boolean; rng_seed?: number } = {}
): DecisionTask[] {
  const {
    n_per_class = 50,
    noise_level = 0.1,
    include_adversarial = true,
    rng_seed = 42,
  } = options;

  const rng = makeLcg(rng_seed);
  const noiseRng = makeLcg(rng_seed + 1000);

  const classes = [
    genPureReactive(rng, n_per_class),
    genDerivedCriterion(rng, n_per_class),
    genVariableArity(rng, n_per_class),
    genBallotConvergent(rng, n_per_class),
    genMixed(rng, n_per_class),
    ...(include_adversarial ? [genAdversarial(rng, n_per_class)] : []),
  ];

  const corpus = classes.flat();

  if (noise_level > 0) {
    return corpus.map(t => applyNoise(t, noiseRng, noise_level));
  }
  return corpus;
}
