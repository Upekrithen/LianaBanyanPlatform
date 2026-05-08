/**
 * Contingency Operator — Branch
 * Wraps a K29 Oracle Circuit per-branch with ballot emission.
 * K30 (LB-STACK-0185) — Bushel 74 BP032.
 */

import type { Branch, BranchBallot, SyntheticProblem, StrategySpec } from "./types.js";

let branchCounter = 0;

/** Create a fresh branch for a given strategy. */
export function createBranch(
  strategy: StrategySpec,
  problem: SyntheticProblem,
  initialBudget: number,
): Branch {
  return {
    id: `branch_${++branchCounter}`,
    strategy_index: strategy.index,
    steps_taken: 0,
    total_steps: initialBudget,
    ballots: [],
    status: "active",
    accuracy_ceiling: strategy.accuracy_ceiling,
    correct_answer: problem.correct_answer,
    compute_budget: initialBudget,
    steps_to_converge: strategy.steps_to_converge,
    convergence_rate: strategy.convergence_rate,
  };
}

/**
 * Advance a branch by one simulation step.
 * Emits a ballot representing current convergence state.
 * The ballot outcome models whether this strategy has found the correct answer
 * with probability proportional to convergence progress.
 */
export function stepBranch(branch: Branch, rng: () => number): BranchBallot | null {
  if (branch.status !== "active") return null;
  if (branch.steps_taken >= branch.compute_budget) return null;

  branch.steps_taken++;

  // Convergence model: accuracy ramps to ceiling within the first 25% of steps_to_converge.
  // This ensures good branches (high ceiling) are clearly distinguishable from bad ones
  // by warm-up time (step 18), while still leaving room for the full convergence arc.
  const fastWindow = Math.max(1, branch.steps_to_converge * 0.25);
  const progress = Math.min(1, branch.steps_taken / fastWindow);
  const currentAccuracy = branch.accuracy_ceiling * progress;

  // Ballot: correct with probability = currentAccuracy
  const outcome = rng() < currentAccuracy ? "CORRECT" : "INCORRECT";
  const confidence = Math.abs(currentAccuracy - 0.5) * 2; // 0 at 50%, 1 at 0% or 100%

  const ballot: BranchBallot = {
    branch_id: branch.id,
    step: branch.steps_taken,
    outcome,
    confidence,
  };
  branch.ballots.push(ballot);
  return ballot;
}

/**
 * Current estimated accuracy of a branch based on ballot history.
 */
export function estimateBranchAccuracy(branch: Branch): number {
  if (branch.ballots.length === 0) return 0;
  const correct = branch.ballots.filter(b => b.outcome === "CORRECT").length;
  return correct / branch.ballots.length;
}

/**
 * Latest confidence from branch (used by meta-Oracle for discard decisions).
 */
export function latestConfidence(branch: Branch): number {
  if (branch.ballots.length === 0) return 0;
  return branch.ballots[branch.ballots.length - 1].confidence;
}
