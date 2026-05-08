/**
 * Axis 4 — Ballot Accumulator (Predictive)
 * Weighted ballot stream → outcome class + confidence.
 * K29 Oracle Circuit — LB-STACK-0184
 */

import type { DecisionTask, AxisOutput, BallotEntry } from "../types.js";

export const CONFIDENCE_THRESHOLD = 0.85;

/**
 * Axis 4: Ballot accumulator with partial-observation support.
 * @param observeFraction fraction of ballots to observe (1.0 = all; used for H2 measurement)
 */
export function axis4BallotAccumulator(
  task: DecisionTask,
  observeFraction = 1.0,
): AxisOutput | null {
  if (!task.ballots || task.ballots.length === 0) return null;

  const nObserve = Math.max(1, Math.floor(task.ballots.length * observeFraction));
  const observed: BallotEntry[] = task.ballots.slice(0, nObserve);

  const counts: Record<string, number> = {};
  let total = 0;
  for (const b of observed) {
    counts[b.outcome] = (counts[b.outcome] ?? 0) + b.weight;
    total += b.weight;
  }
  if (total === 0) return null;

  let bestOutcome = "";
  let bestWeight = -Infinity;
  for (const [outcome, weight] of Object.entries(counts)) {
    if (weight > bestWeight) { bestWeight = weight; bestOutcome = outcome; }
  }

  return { kind: "ballot", outcome: bestOutcome, confidence: bestWeight / total };
}

/**
 * Score Axis 4: compare outcome only (confidence not in ground truth).
 * groundTruth is [outcome, null] per fast-prototype convention.
 */
export function scoreAxis4(output: AxisOutput | null, groundTruth: unknown): boolean {
  if (output === null) return false;
  if (output.kind !== "ballot") return false;
  const gt = groundTruth as [string, null];
  return output.outcome === gt[0];
}
