/**
 * Contingency Operator — K30 (LB-STACK-0185 / LB-CODEX-0179)
 * Types for the recursive Oracle-of-Oracles structure.
 * Bushel 74 reduction-to-practice — BP032.
 */

export type OperatorCommand = "SPECULATE" | "PURSUE" | "DISCARD" | "MERGE";

/** A single ballot emitted by a branch at each simulation step. */
export interface BranchBallot {
  branch_id: string;
  step: number;
  outcome: string;
  confidence: number;
}

/** A candidate strategy branch in the contingency fleet. */
export interface Branch {
  id: string;
  strategy_index: number;
  steps_taken: number;
  total_steps: number;
  ballots: BranchBallot[];
  status: "active" | "discarded" | "committed" | "merged";
  accuracy_ceiling: number;     // known-true ceiling for scoring
  correct_answer: string;       // ground truth for this branch's strategy
  compute_budget: number;       // steps allocated (can grow via PURSUE)
  steps_to_converge: number;    // strategy's natural convergence point
  convergence_rate: number;     // fraction of ceiling captured per unit progress
}

/** A synthetic multi-strategy problem for the corpus. */
export interface SyntheticProblem {
  id: string;
  n_strategies: number;
  best_strategy_index: number;
  best_strategy_accuracy: number;
  correct_answer: string;
  strategies: StrategySpec[];
}

export interface StrategySpec {
  index: number;
  accuracy_ceiling: number;
  steps_to_converge: number;   // steps before this strategy reaches its ceiling
  convergence_rate: number;     // fraction of ceiling captured per step
}

/** Output of the Contingency Operator for one problem. */
export interface ContingencyResult {
  problem_id: string;
  committed_branch_id: string | null;
  committed_strategy_index: number | null;
  committed_accuracy: number;
  best_individual_accuracy: number;
  speedup_ratio: number;         // K30 steps / serial steps (lower = faster)
  compute_recycled_steps: number;
  discarded_branches: number;
  pursued_branches: number;
  merged_branches: number;
  correct: boolean;
  discard_events: number;
  pursue_events: number;
  merge_events: number;
}

/** H1 speedup: K30 total_steps / serial_oracle total_steps at equal accuracy. */
export interface H1SpeedupResult {
  k30_total_steps: number;
  serial_total_steps: number;
  speedup_ratio: number;
  h1_pass: boolean;
}

/** H2 correctness: committed accuracy vs best individual. */
export interface H2CorrectnessResult {
  committed_vs_best_mean: number;
  h2_pass: boolean;
}

/** H3 compute recycling. */
export interface H3RecyclingResult {
  total_recycled_steps: number;
  mean_extra_depth: number;
  h3_pass: boolean;
}

export interface ContingencyOperatorReceipt {
  session: string;
  authored: string;
  method: string;
  corpus_size: number;
  n_strategies: number;
  discard_floor: number;
  warm_up: number;
  consecutive_below: number;
  rng_seed: number;
  h1: H1SpeedupResult;
  h2: H2CorrectnessResult;
  h3: H3RecyclingResult;
  k30_verdict: "CONFIRMED" | "ADOPTED_PROVISIONAL_HELD" | "REVISION_REQUIRED";
  iron_tablet_receipts: number;
}
