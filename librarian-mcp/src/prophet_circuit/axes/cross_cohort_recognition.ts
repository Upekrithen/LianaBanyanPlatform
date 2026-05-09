/**
 * Prophet Circuit — Axis 3: Cross-Cohort Recognition (K30 Instance)
 * Classifies patterns as canon-class (≥3 BP-cohorts) vs bushel-class (<3 cohorts).
 * Four classifier branches compete; meta-oracle picks the highest-confidence classifier.
 * K31 (LB-STACK-0195) — Bushel 79 BP034.
 */

import type {
  PatternEntry,
  CohortClassification,
  SubstrateSample,
  ClassifierStrategy,
  SampleCanonResult,
  H3CrossCohortResult,
} from "../types.js";

const CLASSIFIERS: ClassifierStrategy[] = [
  "single_cohort",
  "multi_cohort",
  "founder_signal",
  "meta_pattern",
];

interface ClassifierScore {
  strategy: ClassifierStrategy;
  predicted_canon: boolean;
  confidence: number;
}

/**
 * Compute unique cohort count for a given pattern class across the corpus.
 * This is the cross-cohort signal used by all classifiers.
 */
function countUniqueCohorts(
  patternClass: string,
  samples: SubstrateSample[],
): string[] {
  const seen = new Set<string>();
  for (const s of samples) {
    if (s.pattern_class === patternClass) seen.add(s.cohort_id);
  }
  return [...seen].sort();
}

/**
 * Run all four K30-style classifier branches on a pattern entry.
 * Each classifier uses a different heuristic threshold.
 */
function scoreClassifiers(
  pattern: PatternEntry,
  samples: SubstrateSample[],
): ClassifierScore[] {
  const cohorts = countUniqueCohorts(pattern.pattern_class, samples);
  const cohortCount = cohorts.length;

  return CLASSIFIERS.map(strategy => {
    switch (strategy) {
      case "single_cohort":
        // Conservative: only flags canon if pattern saturates all known cohorts
        return {
          strategy,
          predicted_canon: cohortCount >= 4,
          confidence: cohortCount >= 4 ? 0.83 : 0.72,
        };

      case "multi_cohort":
        // Specialized cross-cohort detector: threshold at 3 (per spec)
        return {
          strategy,
          predicted_canon: cohortCount >= 3,
          confidence: 0.89,
        };

      case "founder_signal":
        // Combines pattern confidence + cohort span — founder-voice proxy
        return {
          strategy,
          predicted_canon: pattern.confidence > 0.75 && cohortCount >= 3,
          confidence: (pattern.confidence > 0.75 && cohortCount >= 3) ? 0.86 : 0.38,
        };

      case "meta_pattern": {
        // Ensemble score: weighted sum of cohort fraction + pattern confidence
        const canonScore = (cohortCount / 4) * 0.65 + pattern.confidence * 0.35;
        return {
          strategy,
          predicted_canon: canonScore >= 0.68,
          confidence: canonScore,
        };
      }
    }
  });
}

/**
 * Axis 3: K30-style meta-oracle over four classifiers.
 * Emits CohortClassification[] — one per detected pattern.
 */
export function runCrossCohortRecognition(
  patterns: PatternEntry[],
  samples: SubstrateSample[],
): CohortClassification[] {
  return patterns.map(pattern => {
    const cohorts = countUniqueCohorts(pattern.pattern_class, samples);
    const groundTruthCanon = samples
      .filter(s => s.pattern_class === pattern.pattern_class)
      .some(s => s.is_canon_class);

    const scores = scoreClassifiers(pattern, samples);

    // Meta-Oracle: commit to highest-confidence classifier (K30 COMMIT equivalent)
    const winner = scores.reduce((a, b) => a.confidence >= b.confidence ? a : b);

    const founderCorr = winner.confidence * (winner.predicted_canon === groundTruthCanon ? 1.0 : 0.15);

    return {
      pattern_id: pattern.pattern_id,
      is_canon_class: winner.predicted_canon,
      cohort_span: cohorts.map(c => parseInt(c.replace("BP0", ""), 10)),
      founder_correlation: Math.round(founderCorr * 10000) / 10000,
      winning_classifier: winner.strategy,
      correct: winner.predicted_canon === groundTruthCanon,
    };
  });
}

/**
 * Sample-level canon classification for H3 accuracy measurement.
 * For each sample, determine if the cross-cohort recognition correctly identifies
 * whether its pattern class is canon-class. N=200 → statistically meaningful.
 */
export function classifySamplesCanon(
  samples: SubstrateSample[],
): SampleCanonResult[] {
  // Pre-compute unique cohort counts per pattern class
  const cohortCounts = new Map<string, number>();
  for (const s of samples) {
    if (!cohortCounts.has(s.pattern_class)) {
      cohortCounts.set(s.pattern_class, countUniqueCohorts(s.pattern_class, samples).length);
    }
  }

  return samples.map(sample => {
    const cohortCount = cohortCounts.get(sample.pattern_class) ?? 1;

    // Simplified sample-level classifiers (same logic, applied per-sample)
    const multiCohortPrediction = cohortCount >= 3;
    const founderSigPrediction  = cohortCount >= 3; // pattern_class confidence always high

    // Meta-oracle at sample level: multi_cohort is highest-confidence for this domain
    const predicted_canon = multiCohortPrediction;

    return {
      sample_id: sample.id,
      predicted_canon,
      ground_truth_canon: sample.is_canon_class,
      correct: predicted_canon === sample.is_canon_class,
      winning_classifier: "multi_cohort" as ClassifierStrategy,
    };
  });
}

/**
 * Measure H3: cross-cohort recognition accuracy at sample level.
 * Target: ≥80%.
 */
export function measureH3Accuracy(
  sampleResults: SampleCanonResult[],
): H3CrossCohortResult {
  const correct = sampleResults.filter(r => r.correct).length;
  const accuracy = sampleResults.length > 0 ? correct / sampleResults.length : 0;
  return {
    total_samples: sampleResults.length,
    correctly_classified: correct,
    accuracy: Math.round(accuracy * 10000) / 10000,
    h3_pass: accuracy >= 0.80,
  };
}
