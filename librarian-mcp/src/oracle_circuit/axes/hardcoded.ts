/**
 * Axis 1 — Hardcoded Gates (Reactive)
 * Pressure-threshold triggers on the scalar input channel.
 * K29 Oracle Circuit — LB-STACK-0184
 */

import type { DecisionTask, AxisOutput } from "../types.js";

export const AXIS_1_THRESHOLD = 5.0;

/**
 * Axis 1: Hardcoded gate on scalar channel.
 * Returns null if scalar channel absent (axis does not fire).
 */
export function axis1HardcodedGate(task: DecisionTask): AxisOutput | null {
  if (task.scalar === undefined || task.scalar === null) return null;
  const value = task.scalar > AXIS_1_THRESHOLD ? "trigger" : "no_trigger";
  return { kind: "reactive", value };
}

/**
 * Score Axis 1 output against ground truth.
 */
export function scoreAxis1(output: AxisOutput | null, groundTruth: unknown): boolean {
  if (output === null) return false;
  if (output.kind !== "reactive") return false;
  return output.value === groundTruth;
}
