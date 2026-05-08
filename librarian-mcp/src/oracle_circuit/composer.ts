/**
 * Oracle Circuit Composer — K29 (LB-STACK-0184)
 * Cross-axis composition + conflict resolution + flip-the-script actuation.
 * Bushel 73 reduction-to-practice — BP032.
 */

import type { DecisionTask, AxisOutput, OracleResult, OracleFlipEvent } from "./types.js";
import { axis1HardcodedGate, scoreAxis1 } from "./axes/hardcoded.js";
import { axis2DerivedClass, scoreAxis2 } from "./axes/derived.js";
import { axis3VariableArity, scoreAxis3 } from "./axes/variable_arity.js";
import { axis4BallotAccumulator, scoreAxis4 } from "./axes/ballot.js";
import { emitOracleFlip } from "./pheromone_emitter.js";
import { emitEblit } from "./eblit_emitter.js";

export const AXIS_RUNNERS: Record<number, (task: DecisionTask, fraction?: number) => AxisOutput | null> = {
  1: (t) => axis1HardcodedGate(t),
  2: (t) => axis2DerivedClass(t),
  3: (t) => axis3VariableArity(t),
  4: (t, f) => axis4BallotAccumulator(t, f),
};

export const SCORERS: Record<number, (out: AxisOutput | null, gt: unknown) => boolean> = {
  1: scoreAxis1,
  2: scoreAxis2,
  3: scoreAxis3,
  4: scoreAxis4,
};

/**
 * Conflict resolution: when Axis 1 triggers and Axis 2 says absorb,
 * Axis 1 wins (reactive gates override responsive derivations).
 * Rationale: hardcoded pressure-threshold is higher-authority than input fusion.
 */
function resolveConflict(
  outputs: Partial<Record<number, AxisOutput>>,
): { resolved: boolean; winner: number | null } {
  const a1 = outputs[1];
  const a2 = outputs[2];
  if (a1?.kind === "reactive" && a1.value === "trigger" &&
      a2?.kind === "derived" && a2.value === "absorb") {
    return { resolved: true, winner: 1 };
  }
  return { resolved: false, winner: null };
}

/**
 * Run the Oracle Circuit over a task using the specified available axes.
 * Returns per-axis outputs, correctness score, and conflict resolution info.
 */
export function oracleCompose(
  task: DecisionTask,
  availableAxes: number[],
  circuitId: string,
  emitSignals = false,
): OracleResult {
  const outputs: Partial<Record<number, AxisOutput>> = {};

  for (const axisId of availableAxes) {
    const runner = AXIS_RUNNERS[axisId];
    if (!runner) continue;
    const out = runner(task);
    if (out !== null) outputs[axisId] = out;
  }

  const conflict = resolveConflict(outputs);
  let conflicts_detected = 0;
  if (conflict.resolved) conflicts_detected = 1;

  // Score: all needed axes must produce correct output
  let correct = true;
  for (const axisId of task.needed_axes) {
    if (!availableAxes.includes(axisId)) { correct = false; break; }
    const out = outputs[axisId] ?? null;
    const gt = task.ground_truth[axisId];
    const scorer = SCORERS[axisId];
    if (!scorer || !scorer(out, gt)) { correct = false; break; }
  }

  // Flip-the-script: emit Eblit + pheromone if any axis triggered a state change
  if (emitSignals && Object.keys(outputs).length > 0) {
    const flipEvent: OracleFlipEvent = {
      circuit_id: circuitId,
      axis_triggered: availableAxes[0] ?? 0,
      prior_state: null,
      new_state: outputs,
      timestamp: new Date().toISOString(),
    };
    emitOracleFlip(flipEvent);
    emitEblit(circuitId, task.id, outputs);
  }

  return {
    outputs,
    correct,
    conflict_detected: conflict.resolved,
    conflict_resolution: conflict.resolved ? `A${conflict.winner}_wins` : undefined,
  };
}
