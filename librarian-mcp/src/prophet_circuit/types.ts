/**
 * Prophet Circuit — K31 (LB-STACK-0195 / LB-CODEX-0185)
 * Types for the recursive K30-of-K30 forward-pattern-projection decision-class kernel.
 * Bushel 79 reduction-to-practice — BP034.
 */

export type PatternClass = "rising" | "falling" | "periodic" | "noise";
export type DetectionBranchStrategy =
  | "regex_scanner"
  | "periodicity_detector"
  | "correlation_scanner"
  | "motif_finder";
export type ProjectionMethod =
  | "linear_projection"
  | "exponential_smoothing"
  | "arima_approx"
  | "ensemble_avg";
export type ClassifierStrategy =
  | "single_cohort"
  | "multi_cohort"
  | "founder_signal"
  | "meta_pattern";

/** One substrate sample from the corpus. */
export interface SubstrateSample {
  id: string;
  metric_name: string;
  value: number;
  cohort_id: string;        // e.g. "BP031", "BP032", "BP033", "BP034"
  cohort_index: number;     // 0-based
  timestamp: string;
  pattern_class: PatternClass;
  is_canon_class: boolean;  // true if this pattern appears in ≥3 BP-cohorts
  cohort_span: number;      // how many cohorts contain this pattern
  ground_truth_label: string;
}

/** A detected pattern emitted by Axis 1. */
export interface PatternEntry {
  pattern_id: string;
  structure_description: string;
  pattern_class: PatternClass;
  confidence: number;
  substrate_evidence: string[];
  winning_branch: DetectionBranchStrategy;
}

/** A forward projection emitted by Axis 2. */
export interface TrendProjection {
  pattern_id: string;
  horizon: 5 | 10 | 20;
  projected_value: number;
  confidence_interval_50: [number, number];
  confidence_interval_80: [number, number];
  confidence_interval_95: [number, number];
  method: ProjectionMethod;
  within_20pct: boolean;
}

/** A cross-cohort classification emitted by Axis 3. */
export interface CohortClassification {
  pattern_id: string;
  is_canon_class: boolean;
  cohort_span: number[];
  founder_correlation: number;
  winning_classifier: ClassifierStrategy;
  correct: boolean;
}

/** Sample-level canon classification for H3 accuracy measurement. */
export interface SampleCanonResult {
  sample_id: string;
  predicted_canon: boolean;
  ground_truth_canon: boolean;
  correct: boolean;
  winning_classifier: ClassifierStrategy;
}

/** Final synthesized forecast from Meta-Prophet (K30-of-K30). */
export interface ProphetForecast {
  session: string;
  authored: string;
  patterns_detected: PatternEntry[];
  trend_projections: TrendProjection[];
  cohort_classifications: CohortClassification[];
  almanac_trends: AlmanacTrend[];
  meta_strategy: "ensemble_synthesis" | "single_axis_dominant" | "conflict_resolved";
  forward_horizon_bushels: number;
}

export interface AlmanacTrend {
  trend_id: string;
  description: string;
  projected_direction: "rising" | "falling" | "periodic" | "stable";
  confidence: number;
  canon_class: boolean;
  horizon_bushels: number;
}

/** H1 result: pattern detection accuracy ≥75%. */
export interface H1PatternDetectionResult {
  total_samples: number;
  correctly_detected: number;
  accuracy: number;
  h1_pass: boolean;
}

/** H2 result: trend extrapolation calibration ≥70%. */
export interface H2TrendCalibrationResult {
  total_projections: number;
  within_20pct_count: number;
  calibration_rate: number;
  h2_pass: boolean;
}

/** H3 result: cross-cohort recognition accuracy ≥80%. */
export interface H3CrossCohortResult {
  total_samples: number;
  correctly_classified: number;
  accuracy: number;
  h3_pass: boolean;
}

export interface ProphetCircuitReceipt {
  session: string;
  authored: string;
  method: string;
  corpus_size: number;
  bp_cohort_count: number;
  rng_seed: number;
  h1: H1PatternDetectionResult;
  h2: H2TrendCalibrationResult;
  h3: H3CrossCohortResult;
  k31_verdict: "CONFIRMED" | "ADOPTED_PROVISIONAL_HELD" | "REVISION_REQUIRED";
  iron_tablet_receipts: number;
  trinity_integration_verified: boolean;
}
