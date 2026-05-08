/**
 * Contingency Operator — Meta-Oracle (K29 over branch-ballot-streams)
 * Identifies converging vs diverging branches via Axis 4 ballot accumulation.
 * K30 (LB-STACK-0185) — Bushel 74 BP032.
 */

import type { Branch } from "./types.js";
import { estimateBranchAccuracy } from "./branch.js";

export interface MetaOracleVerdict {
  branch_id: string;
  estimated_accuracy: number;
  ballot_count: number;
  converging: boolean;
  should_discard: boolean;
  should_pursue: boolean;
}

/**
 * Meta-Oracle: applies K29 Axis 4 (ballot accumulator) over each branch's
 * ballot stream to decide whether to PURSUE, DISCARD, or continue.
 *
 * Best-config parameters from Bishop V2 fast-prototype:
 *   discard_floor=0.45, warm_up=18, consecutive_below=3
 */
export function metaOracleEvaluate(
  branches: Branch[],
  params: { discard_floor: number; warm_up: number; consecutive_below: number },
): MetaOracleVerdict[] {
  const { discard_floor, warm_up, consecutive_below } = params;

  return branches
    .filter(b => b.status === "active")
    .map(branch => {
      const est = estimateBranchAccuracy(branch);
      const ballotCount = branch.ballots.length;

      // Warm-up: don't evaluate until enough ballots accumulated
      if (ballotCount < warm_up) {
        return { branch_id: branch.id, estimated_accuracy: est, ballot_count: ballotCount, converging: false, should_discard: false, should_pursue: false };
      }

      // Count consecutive below-floor observations (secondary-evidence requirement)
      const recent = branch.ballots.slice(-consecutive_below);
      const consecutiveBelowFloor = recent.filter(b => b.outcome === "INCORRECT").length;

      const shouldDiscard = est < discard_floor && consecutiveBelowFloor >= consecutive_below;
      const shouldPursue = est >= 0.80 && ballotCount >= warm_up;
      const converging = est >= 0.70;

      return {
        branch_id: branch.id,
        estimated_accuracy: est,
        ballot_count: ballotCount,
        converging,
        should_discard: shouldDiscard,
        should_pursue: shouldPursue,
      };
    });
}

/**
 * Identify which branches are compatible for merging
 * (both converging toward same outcome, similar accuracy).
 */
export function identifyMergeCandidates(
  branches: Branch[],
  threshold = 0.75,
): [Branch, Branch][] {
  const converging = branches.filter(b => b.status === "active" && estimateBranchAccuracy(b) >= threshold);
  const pairs: [Branch, Branch][] = [];
  for (let i = 0; i < converging.length; i++) {
    for (let j = i + 1; j < converging.length; j++) {
      const accDiff = Math.abs(estimateBranchAccuracy(converging[i]) - estimateBranchAccuracy(converging[j]));
      if (accDiff < 0.15) pairs.push([converging[i], converging[j]]);
    }
  }
  return pairs;
}
