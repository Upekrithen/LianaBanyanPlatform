/**
 * Axis 3 — Variable-Arity State Space
 * Meta-state → outcome cardinality → slot assignment.
 * K29 Oracle Circuit — LB-STACK-0184
 */

import type { DecisionTask, AxisOutput } from "../types.js";

export const CARDINALITIES = [1, 2, 8, 64, 128] as const;

/**
 * Axis 3: Meta-state determines cardinality; val selects slot.
 * Returns null if meta or val channel absent.
 */
export function axis3VariableArity(task: DecisionTask): AxisOutput | null {
  if (task.meta === undefined || task.val === undefined) return null;
  const cardinality = CARDINALITIES[task.meta % CARDINALITIES.length];
  const slot = task.val % cardinality;
  return { kind: "variable_arity", cardinality, slot };
}

export function scoreAxis3(output: AxisOutput | null, groundTruth: unknown): boolean {
  if (output === null) return false;
  if (output.kind !== "variable_arity") return false;
  const gt = groundTruth as [number, number];
  return output.cardinality === gt[0] && output.slot === gt[1];
}
