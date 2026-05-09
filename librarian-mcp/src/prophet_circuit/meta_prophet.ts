/**
 * Prophet Circuit — Meta-Prophet: K30-of-K30 Orchestration
 * Treats Axis 1 (detection), Axis 2 (extrapolation), Axis 3 (recognition)
 * each as a K30 Contingency Operator instance, then runs a meta-K30 over
 * their three outputs to synthesize the final ProphetForecast.
 *
 * "Prophet Circuit = recursive K30-of-K30 composition."
 * K31 (LB-STACK-0195) — Bushel 79 BP034.
 */

import type {
  PatternEntry,
  TrendProjection,
  CohortClassification,
  ProphetForecast,
  AlmanacTrend,
} from "./types.js";
import { runPatternDetection } from "./axes/pattern_detection.js";
import { runTrendExtrapolation } from "./axes/trend_extrapolation.js";
import { runCrossCohortRecognition } from "./axes/cross_cohort_recognition.js";
import type { SubstrateSample } from "./types.js";

/** Axis "ballot" at the meta-level — K30 SPECULATE equivalent. */
interface AxisBallot {
  axis: "pattern_detection" | "trend_extrapolation" | "cross_cohort_recognition";
  confidence_mean: number;
  output_count: number;
  quality_score: number;  // synthetic ballot weight for meta-K30
}

/** Compute mean confidence from pattern entries. */
function meanPatternConfidence(patterns: PatternEntry[]): number {
  if (patterns.length === 0) return 0;
  return patterns.reduce((s, p) => s + p.confidence, 0) / patterns.length;
}

/** Compute calibration score from trend projections. */
function calibrationScore(projections: TrendProjection[]): number {
  if (projections.length === 0) return 0;
  return projections.filter(p => p.within_20pct).length / projections.length;
}

/** Compute classification accuracy proxy from CohortClassification. */
function classificationScore(classifications: CohortClassification[]): number {
  if (classifications.length === 0) return 0;
  return classifications.filter(c => c.correct).length / classifications.length;
}

/**
 * Meta-Oracle at K30-of-K30 level.
 * Determines which synthesis strategy to use based on axis quality scores.
 */
function metaOracleStrategy(ballots: AxisBallot[]): {
  strategy: ProphetForecast["meta_strategy"];
  dominant?: AxisBallot;
} {
  const maxQ = Math.max(...ballots.map(b => b.quality_score));
  const minQ = Math.min(...ballots.map(b => b.quality_score));
  const spread = maxQ - minQ;

  if (spread < 0.15) {
    // All axes roughly equal quality → ensemble synthesis
    return { strategy: "ensemble_synthesis" };
  }

  const dominant = ballots.reduce((a, b) => a.quality_score >= b.quality_score ? a : b);
  if (spread > 0.35) {
    // One axis dramatically better → single axis dominates
    return { strategy: "single_axis_dominant", dominant };
  }

  // Moderate spread → conflict resolution via ensemble with dominant weighting
  return { strategy: "conflict_resolved", dominant };
}

/** Build AlmanacTrend entries from the three-axis outputs. */
function buildAlmanacTrends(
  patterns: PatternEntry[],
  projections: TrendProjection[],
  classifications: CohortClassification[],
  horizon: number,
): AlmanacTrend[] {
  const classMap = new Map(classifications.map(c => [c.pattern_id, c]));
  const horizonProj = projections.filter(p => p.horizon === horizon);
  const projMap = new Map(horizonProj.map(p => [p.pattern_id, p]));

  return patterns.map(pattern => {
    const cls = classMap.get(pattern.pattern_id);
    const proj = projMap.get(pattern.pattern_id);

    const direction =
      pattern.pattern_class === "noise" ? "stable" : pattern.pattern_class;

    return {
      trend_id: `trend_${pattern.pattern_id}_h${horizon}`,
      description: `${pattern.structure_description} — ${horizon}-Bushel outlook`,
      projected_direction: direction as AlmanacTrend["projected_direction"],
      confidence: proj
        ? Math.round(((pattern.confidence + (proj.within_20pct ? 0.95 : 0.55)) / 2) * 10000) / 10000
        : pattern.confidence,
      canon_class: cls?.is_canon_class ?? false,
      horizon_bushels: horizon,
    };
  });
}

/**
 * Run the full Meta-Prophet K30-of-K30 orchestration.
 *
 * Sequence:
 *   1. SPECULATE — launch all three K30 axis instances
 *   2. PURSUE    — evaluate ballot weights from each axis output
 *   3. META-COMMIT — meta-oracle selects synthesis strategy
 *   4. SYNTHESIZE — build ProphetForecast from winning strategy
 */
export function runMetaProphet(
  samples: SubstrateSample[],
  session: string,
): ProphetForecast {
  // SPECULATE: launch three K30 axis instances in parallel (simulated)
  const patterns      = runPatternDetection(samples);
  const projections   = runTrendExtrapolation(patterns, samples);
  const classifications = runCrossCohortRecognition(patterns, samples);

  // PURSUE: score each axis output (ballot weights for meta-K30)
  const ballots: AxisBallot[] = [
    {
      axis: "pattern_detection",
      confidence_mean: meanPatternConfidence(patterns),
      output_count: patterns.length,
      quality_score: meanPatternConfidence(patterns),
    },
    {
      axis: "trend_extrapolation",
      confidence_mean: calibrationScore(projections),
      output_count: projections.length,
      quality_score: calibrationScore(projections),
    },
    {
      axis: "cross_cohort_recognition",
      confidence_mean: classificationScore(classifications),
      output_count: classifications.length,
      quality_score: classificationScore(classifications),
    },
  ];

  // META-COMMIT: meta-oracle determines synthesis strategy
  const { strategy } = metaOracleStrategy(ballots);

  // SYNTHESIZE: build ProphetForecast — Almanac §4 Trends at 5-Bushel horizon
  const almanacTrends = buildAlmanacTrends(patterns, projections, classifications, 5);

  return {
    session,
    authored: new Date().toISOString(),
    patterns_detected: patterns,
    trend_projections: projections,
    cohort_classifications: classifications,
    almanac_trends: almanacTrends,
    meta_strategy: strategy,
    forward_horizon_bushels: 20,
  };
}
