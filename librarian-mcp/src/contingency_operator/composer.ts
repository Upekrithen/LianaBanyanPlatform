/**
 * Contingency Operator Composer — K30 (LB-STACK-0185)
 * Orchestrates SPECULATE / PURSUE / DISCARD / MERGE operators over a branch fleet.
 * Bushel 74 reduction-to-practice — BP032.
 */

import type {
  Branch, SyntheticProblem, ContingencyResult, OperatorCommand,
} from "./types.js";
import { createBranch, stepBranch, estimateBranchAccuracy } from "./branch.js";
import { metaOracleEvaluate, identifyMergeCandidates } from "./meta_oracle.js";
import { emitDiscardEblit } from "./eblit_emitter.js";
import { emitContingencyPheromone } from "./pheromone_emitter.js";

export interface ContingencyParams {
  discard_floor: number;
  warm_up: number;
  consecutive_below: number;
  initial_budget_per_branch: number;
  pursue_bonus: number;           // extra steps added on PURSUE
  rng: () => number;
}

export const DEFAULT_PARAMS: ContingencyParams = {
  discard_floor: 0.32,
  warm_up: 25,
  consecutive_below: 3,
  initial_budget_per_branch: 150,
  pursue_bonus: 30,
  rng: Math.random,
};

/**
 * Run the Contingency Operator over one synthetic problem.
 * Returns structured result with speedup, correctness, and recycling metrics.
 */
export function runContingencyOperator(
  problem: SyntheticProblem,
  params: ContingencyParams,
  session: string,
): ContingencyResult {
  const { rng } = params;

  // SPECULATE: launch N parallel branches
  const branches: Branch[] = problem.strategies.map(s =>
    createBranch(s, problem, params.initial_budget_per_branch)
  );

  let k30TotalSteps = 0;
  let discardEvents = 0;
  let pursueEvents = 0;
  let mergeEvents = 0;
  let computeRecycled = 0;
  let committedBranch: Branch | null = null;

  // Main loop: advance all active branches one step at a time
  const maxIterations = params.initial_budget_per_branch * problem.n_strategies * 3;
  for (let iter = 0; iter < maxIterations; iter++) {
    const active = branches.filter(b => b.status === "active");
    if (active.length === 0) break;

    // Advance each active branch one step
    for (const branch of active) {
      const ballot = stepBranch(branch, rng);
      if (ballot) k30TotalSteps++;
    }

    // Meta-Oracle evaluates all active branches
    const verdicts = metaOracleEvaluate(branches, params);

    // DISCARD: kill losing branches, recycle their remaining compute
    for (const verdict of verdicts) {
      if (!verdict.should_discard) continue;
      const branch = branches.find(b => b.id === verdict.branch_id);
      if (!branch || branch.status !== "active") continue;

      // Never discard the last surviving active branch
      if (branches.filter(b => b.status === "active").length <= 1) continue;

      const remainingBudget = branch.compute_budget - branch.steps_taken;
      computeRecycled += remainingBudget;
      branch.status = "discarded";
      discardEvents++;

      emitDiscardEblit(branch.id, verdict.estimated_accuracy, session);
      emitContingencyPheromone("DISCARD", branch.id, verdict.estimated_accuracy);
    }

    // PURSUE: allocate recycled compute to promising branches
    if (computeRecycled > 0) {
      const pursuing = verdicts.filter(v => v.should_pursue && !v.should_discard);
      if (pursuing.length > 0) {
        const bonus = Math.floor(computeRecycled / pursuing.length);
        for (const v of pursuing) {
          const branch = branches.find(b => b.id === v.branch_id);
          if (branch && branch.status === "active") {
            branch.compute_budget += bonus;
            emitContingencyPheromone("PURSUE", branch.id, v.estimated_accuracy);
          }
        }
        computeRecycled = 0;
        pursueEvents += pursuing.length;
      }
    }

    // MERGE: compatible converging branches
    const mergePairs = identifyMergeCandidates(branches);
    for (const [b1, b2] of mergePairs) {
      if (b1.status !== "active" || b2.status !== "active") continue;
      // Merge: keep higher-accuracy branch, absorb other's ballots
      const acc1 = estimateBranchAccuracy(b1);
      const acc2 = estimateBranchAccuracy(b2);
      const [winner, loser] = acc1 >= acc2 ? [b1, b2] : [b2, b1];
      winner.ballots.push(...loser.ballots);
      loser.status = "merged";
      mergeEvents++;
      emitContingencyPheromone("MERGE", loser.id, estimateBranchAccuracy(loser));
    }

    // COMMIT: if one branch has clearly converged, commit it
    const active2 = branches.filter(b => b.status === "active");
    if (active2.length === 1) {
      const branch = active2[0];
      const acc = estimateBranchAccuracy(branch);
      if (acc >= 0.75 && branch.steps_taken >= params.warm_up) {
        branch.status = "committed";
        committedBranch = branch;
        break;
      }
    }

    // If all budgets exhausted, commit the best remaining
    if (active2.every(b => b.steps_taken >= b.compute_budget)) {
      const best = active2.sort((a, b) => estimateBranchAccuracy(b) - estimateBranchAccuracy(a))[0];
      if (best) { best.status = "committed"; committedBranch = best; }
      break;
    }
  }

  // Fallback: commit best active
  if (!committedBranch) {
    const remaining = branches.filter(b => b.status === "active");
    if (remaining.length > 0) {
      const best = remaining.sort((a, b) => estimateBranchAccuracy(b) - estimateBranchAccuracy(a))[0];
      best.status = "committed";
      committedBranch = best;
    }
  }

  const committedAcc = committedBranch ? estimateBranchAccuracy(committedBranch) : 0;
  const bestIndividual = Math.max(...problem.strategies.map(s => s.accuracy_ceiling));

  // Speedup = wall-time ratio: K30 commits after WINNER's steps; serial tries all N strategies.
  // Parallel execution means the wall-clock latency is the committed branch's step count,
  // while serial must exhaust each strategy one-by-one.
  const committedWallSteps = committedBranch?.steps_taken ?? k30TotalSteps;
  const serialSteps = problem.strategies.reduce((sum, s) => sum + s.steps_to_converge, 0);
  const speedupRatio = serialSteps > 0 ? committedWallSteps / serialSteps : 1;

  const correct = committedBranch
    ? estimateBranchAccuracy(committedBranch) >= bestIndividual * 0.90
    : false;

  return {
    problem_id: problem.id,
    committed_branch_id: committedBranch?.id ?? null,
    committed_strategy_index: committedBranch?.strategy_index ?? null,
    committed_accuracy: committedAcc,
    best_individual_accuracy: bestIndividual,
    speedup_ratio: speedupRatio,
    compute_recycled_steps: computeRecycled,
    discarded_branches: discardEvents,
    pursued_branches: pursueEvents,
    merged_branches: mergeEvents,
    correct,
    discard_events: discardEvents,
    pursue_events: pursueEvents,
    merge_events: mergeEvents,
  };
}
