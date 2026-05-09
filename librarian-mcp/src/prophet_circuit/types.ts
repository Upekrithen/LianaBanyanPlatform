/**
 * Prophet Circuit — K31 (LB-STACK-0195 / LB-CODEX-0185)
 * Types for the recursive K30-of-K30 forward-pattern-projection primitive.
 * Bushel 79 reduction-to-practice — BP034.
 *
 * Core innovation: Prophet Circuit = recursive K30-of-K30 composition.
 * Each of three axes (Pattern Detection / Trend Extrapolation / Cross-Cohort Recognition)
 * IS a K30 Contingency Operator instance managing branches over its respective domain.
 * Meta-Prophet orchestrates K30-over-K30 to synthesize forward-projection forecasts.
 */

export type SubstrateClass =
  | "af_ledger_eblit"
  | "pheromone_tablet"
  | "iron_tablet"
  | "bp_cohort_canon";

export type CohortId = string;

export type ProjectionHorizon = 5 | 10 | 20;

/** One substrate state sample from the A+F Ledger / pheromone substrate. */
export interface SubstrateSample {
  id: string;
  substrate_class: SubstrateClass;
  cohort_id: CohortId;
  metric_values: number[];    // time-series values to analyze (min length 8)
  timestamp: string;
  ground_truth: {
    has_pattern: boolean;
    pattern_period?: number;        // periodicity in metric_values if has_pattern
    true_next_5: number[];          // true next-5-Bushel metric values
    true_next_10: number[];
    true_next_20: number[];
    canon_class: boolean;           // true = pattern repeats across ≥3 BP-cohorts
    cohort_span: CohortId[];        // cohorts in which this pattern appears
  };
}

/** A detected pattern emitted by Axis 1. */
export interface Pattern {
  pattern_id: string;
  structure_description: string;
  confidence: number;
  substrate_evidence: string[];   // sample IDs exhibiting this pattern
  period?: number;                 // periodicity if temporal
  detected_by_strategy: number;   // 0=regex, 1=periodicity, 2=correlation, 3=graph_motif
}

/** Bootstrap confidence band for one projection horizon. */
export interface ConfidenceBand {
  horizon: ProjectionHorizon;
  predicted_values: number[];
  ci_80_low: number;
  ci_80_high: number;
  within_20pct_fraction: number;   // fraction of true values within ±20% of predicted
}

/** Output of Axis 2 for one pattern. */
export interface PatternProjection {
  pattern_id: string;
  strategy_index: number;          // 0=linear, 1=exp_smooth, 2=arima, 3=ensemble
  confidence_bands: ConfidenceBand[];
  calibration_score: number;       // mean within_20pct_fraction across horizons
}

/** Output of Axis 3 for one pattern. */
export interface CohortClassification {
  pattern_id: string;
  canon_class: boolean;
  cohort_span: CohortId[];
  founder_correlation: number;
  classifier_strategy: number;     // 0=single_cohort, 1=multi_cohort, 2=founder_signal, 3=meta_agg
  confidence: number;
}

/** Synthesized forward-projection forecast (Meta-Prophet output). */
export interface ProphetForecast {
  forecast_id: string;
  session: string;
  authored: string;
  patterns_detected: Pattern[];
  projections: PatternProjection[];
  classifications: CohortClassification[];
  synthesis_strategy: "full_pipeline" | "pattern_dominant" | "trend_dominant" | "classifier_dominant" | "ensemble";
  meta_k30_committed_strategy: number;
  forward_summary: string;
}

// ─── Hypothesis Result Types ───────────────────────────────────────────────

/** H1: Pattern detection accuracy ≥ 75% on held-out corpus. */
export interface H1PatternResult {
  total_samples: number;
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  accuracy: number;
  h1_pass: boolean;         // accuracy ≥ 0.75
}

/** H2: Trend extrapolation calibration ≥ 70% (projections within ±20% CI ≥70% of time). */
export interface H2TrendResult {
  patterns_projected: number;
  horizons_tested: ProjectionHorizon[];
  calibration_per_horizon: Record<string, number>;
  mean_calibration: number;
  h2_pass: boolean;         // mean_calibration ≥ 0.70
}

/** H3: Cross-cohort recognition ≥ 80% accuracy. */
export interface H3CrossCohortResult {
  total_patterns: number;
  correct_classifications: number;
  accuracy: number;
  canon_true_positives: number;
  canon_false_negatives: number;
  h3_pass: boolean;         // accuracy ≥ 0.80
}

/** K31 full receipt for Iron Tablet + canon Eblet. */
export interface ProphetCircuitReceipt {
  session: string;
  authored: string;
  method: string;
  corpus_size: number;
  bp_cohorts: number;
  rng_seed: number;
  k30_winning_strategy_axis1: number;
  k30_winning_strategy_axis2: number;
  k30_winning_strategy_axis3: number;
  meta_k30_committed_strategy: number;
  h1: H1PatternResult;
  h2: H2TrendResult;
  h3: H3CrossCohortResult;
  composability_pass: boolean;
  k31_verdict: "CONFIRMED" | "ADOPTED_PROVISIONAL_HELD" | "REVISION_REQUIRED";
  iron_tablet_receipts: number;
  canon_eblet_path: string;
  stack_ledger_entry: string;
  codex_entry: string;
}

// ─── Internal K30-bridge types ─────────────────────────────────────────────

/** Strategy specification for K30-bridge SyntheticProblem. */
export interface AxisStrategySpec {
  index: number;
  accuracy_ceiling: number;
  steps_to_converge: number;
  convergence_rate: number;
}

/** K30-bridge problem: one axis evaluation over one domain sample. */
export interface AxisProblem {
  id: string;
  n_strategies: number;
  best_strategy_index: number;
  best_strategy_accuracy: number;
  correct_answer: string;
  strategies: AxisStrategySpec[];
}
