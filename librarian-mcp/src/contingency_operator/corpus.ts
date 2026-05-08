/**
 * Contingency Operator — Synthetic Problem Corpus
 * Six classes of problems for the ablation / hypothesis tests.
 * K30 (LB-STACK-0185) — Bushel 74 BP032.
 */

import type { SyntheticProblem, StrategySpec } from "./types.js";

export interface CorpusOptions {
  n_per_class: number;
  n_strategies: number;         // how many strategies per problem
  rng_seed?: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function makeProblem(
  id: string,
  n: number,
  bestIdx: number,
  bestCeiling: number,
  otherCeiling: number,
  stepsRange: [number, number],
  rng: () => number,
): SyntheticProblem {
  const strategies: StrategySpec[] = Array.from({ length: n }, (_, i) => ({
    index: i,
    accuracy_ceiling: i === bestIdx ? bestCeiling : otherCeiling + rng() * 0.1,
    steps_to_converge: Math.round(stepsRange[0] + rng() * (stepsRange[1] - stepsRange[0])),
    convergence_rate: 0.3 + rng() * 0.4,
  }));
  return {
    id,
    n_strategies: n,
    best_strategy_index: bestIdx,
    best_strategy_accuracy: bestCeiling,
    correct_answer: `strategy_${bestIdx}_correct`,
    strategies,
  };
}

/**
 * Generate the six corpus classes:
 *   clear_winner, close_race, early_convergence, adversarial, noisy_landscape, deceptive
 */
export function generateCorpus(opts: CorpusOptions): SyntheticProblem[] {
  const { n_per_class, n_strategies } = opts;
  const rng = seededRandom(opts.rng_seed ?? 99);
  const problems: SyntheticProblem[] = [];
  let counter = 0;

  const makeN = (
    cls: string,
    bestCeiling: number,
    otherCeiling: number,
    stepsRange: [number, number],
  ) => {
    for (let i = 0; i < n_per_class; i++) {
      const bestIdx = Math.floor(rng() * n_strategies);
      problems.push(makeProblem(
        `${cls}_${++counter}`, n_strategies, bestIdx,
        bestCeiling, otherCeiling, stepsRange, rng,
      ));
    }
  };

  // Class 1: One clearly dominant strategy — losers discarded early
  makeN("clear_winner", 0.92, 0.45, [60, 100]);

  // Class 2: Two closely competing strategies — need full search
  makeN("close_race", 0.85, 0.80, [70, 110]);

  // Class 3: Best strategy converges fast — early exit demonstrates speedup
  makeN("early_convergence", 0.90, 0.55, [40, 70]);

  // Class 4: Adversarial — best strategy looks bad early (deceptive start)
  makeN("adversarial", 0.88, 0.70, [80, 120]);

  // Class 5: Noisy landscape — all strategies fluctuate
  makeN("noisy_landscape", 0.78, 0.72, [60, 90]);

  // Class 6: Deceptive alternative — second-best looks best early
  makeN("deceptive", 0.87, 0.83, [70, 100]);

  return problems;
}
