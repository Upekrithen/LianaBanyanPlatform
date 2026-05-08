/**
 * Axis 2 — Derived-Class State (Responsive)
 * Input fusion → derived class → mode selector.
 * K29 Oracle Circuit — LB-STACK-0184
 */

import type { DecisionTask, AxisOutput, DerivedMode } from "../types.js";

/**
 * Derive mode from fusion vector mean.
 * emit > 3 | reflect > 1 | divert > -1 | absorb ≤ -1
 */
export function deriveMode(fusion: number[]): DerivedMode {
  if (fusion.length === 0) return "absorb";
  const mean = fusion.reduce((a, b) => a + b, 0) / fusion.length;
  if (mean > 3)  return "emit";
  if (mean > 1)  return "reflect";
  if (mean > -1) return "divert";
  return "absorb";
}

/**
 * Axis 2: Input fusion → derived mode.
 * Returns null if fusion channel absent.
 */
export function axis2DerivedClass(task: DecisionTask): AxisOutput | null {
  if (!task.fusion || task.fusion.length === 0) return null;
  return { kind: "derived", value: deriveMode(task.fusion) };
}

export function scoreAxis2(output: AxisOutput | null, groundTruth: unknown): boolean {
  if (output === null) return false;
  if (output.kind !== "derived") return false;
  return output.value === groundTruth;
}
