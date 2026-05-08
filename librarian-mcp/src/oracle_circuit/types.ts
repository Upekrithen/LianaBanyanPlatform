/**
 * Oracle Circuit — K29 (LB-STACK-0184 / LB-CODEX-0178)
 * Types for the four-axis runtime decision-flow primitive.
 * Bushel 73 reduction-to-practice — BP032.
 */

export type ReactiveValue = "trigger" | "no_trigger";
export type DerivedMode = "emit" | "reflect" | "divert" | "absorb";
export type TaskClass =
  | "pure_reactive"
  | "derived_criterion"
  | "variable_arity"
  | "ballot_convergent"
  | "mixed"
  | "adversarial";

export interface BallotEntry {
  outcome: string;
  weight: number;
}

export interface DecisionTask {
  id: string;
  class: TaskClass;
  // Input channels — each axis reads only its native channel
  scalar?: number;           // Axis 1
  fusion?: number[];         // Axis 2
  meta?: number;             // Axis 3
  val?: number;              // Axis 3
  ballots?: BallotEntry[];   // Axis 4
  needed_axes: number[];
  ground_truth: Record<number, unknown>;
  // Noise annotation (V2 hardened)
  noise_applied?: boolean;
}

export type AxisOutput =
  | { kind: "reactive"; value: ReactiveValue }
  | { kind: "derived"; value: DerivedMode }
  | { kind: "variable_arity"; cardinality: number; slot: number }
  | { kind: "ballot"; outcome: string; confidence: number };

export type ConditionName =
  | "A1-only" | "A2-only" | "A3-only" | "A4-only"
  | "Drop-A1" | "Drop-A2" | "Drop-A3" | "Drop-A4"
  | "Full Oracle";

export interface OracleResult {
  outputs: Partial<Record<number, AxisOutput>>;
  correct: boolean;
  conflict_detected: boolean;
  conflict_resolution?: string;
}

export interface ClassAccuracy {
  correct: number;
  total: number;
  accuracy: number;
  ci_low: number;    // 95% bootstrap CI
  ci_high: number;
}

export interface AblationRow {
  condition: ConditionName;
  axes: number[];
  per_class: Record<TaskClass, ClassAccuracy>;
}

export interface OracleFlipEvent {
  circuit_id: string;
  axis_triggered: number;
  prior_state: unknown;
  new_state: unknown;
  timestamp: string;
}

export interface PredictiveConvergenceResult {
  tasks_evaluated: number;
  tasks_stabilized: number;
  fractions_to_stabilize: number[];
  median_stabilization_fraction: number | null;
  mean_stabilization_fraction: number | null;
  accuracy_at_70pct: number;
  h2_pass: boolean;
}

export interface H1Result {
  mixed_full: number;
  mixed_best_three_of_four: number;
  delta_pp: number;
  adversarial_full: number;
  adversarial_delta_pp: number;
  graceful_tradeoff_passes: number;
  graceful_tradeoff_total: number;
  h1a_pass: boolean;
  h1b_pass: boolean;
  overall_pass: boolean;
}

export interface OracleCircuitReceipt {
  session: string;
  authored: string;
  method: string;
  noise_level: number;
  corpus_size: number;
  rng_seed: number;
  ablation_matrix: Record<ConditionName, Record<TaskClass, [number, number, number]>>;
  h1: H1Result;
  h2: PredictiveConvergenceResult;
  conflicts_detected: number;
  conflicts_resolved: number;
  iron_tablet_receipts: number;
  k29_verdict: "CONFIRMED" | "ADOPTED_PROVISIONAL_HELD" | "REVISION_REQUIRED";
}
