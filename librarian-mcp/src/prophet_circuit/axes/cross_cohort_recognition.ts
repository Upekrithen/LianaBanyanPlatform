/**
 * Axis 3: Cross-Cohort Recognition — K30 Contingency Operator instance
 * Branch space: {single_cohort (0), multi_cohort (1), founder_signal (2), meta_agg (3)}
 * K31 Prophet Circuit (LB-STACK-0195) — Bushel 79 BP034.
 *
 * Architecture:
 *   1. For each detected pattern, build K30 SyntheticProblem (strategy = classifier).
 *   2. Run K30 to select best classifier strategy.
 *   3. Apply winning classifier: canon_class (spans ≥3 cohorts) vs Bushel-class (within cohort).
 *   4. Measure H3: classification accuracy ≥ 80% vs ground truth canon_class labels.
 *
 * Reuses K30 commit 03e6337 branch evaluation logic.
 */

import type {
  SubstrateSample, Pattern, CohortClassification, H3CrossCohortResult, AxisProblem,
} from "../types.js";
import { runContingencyOperator, DEFAULT_PARAMS } from "../../contingency_operator/composer.js";

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

// ─── Classifier Implementations ───────────────────────────────────────────────

interface ClassifierResult {
  canon_class: boolean;
  cohort_span: string[];
  founder_correlation: number;
  confidence: number;
}

/**
 * Single-cohort classifier: classifies as Bushel-class (no cross-cohort span).
 * Always predicts non-canon; useful as a baseline / sanity check branch.
 */
function classifySingleCohort(
  pattern: Pattern,
  sample: SubstrateSample,
): ClassifierResult {
  return {
    canon_class: false,
    cohort_span: [sample.cohort_id],
    founder_correlation: 0.0,
    confidence: 0.65,
  };
}

/**
 * Multi-cohort classifier: examines pattern confidence + period to infer cross-cohort span.
 * High-confidence periodic patterns are classified as canon-class.
 */
function classifyMultiCohort(
  pattern: Pattern,
  sample: SubstrateSample,
): ClassifierResult {
  // Heuristic: high confidence + presence of a period → likely cross-cohort
  const isCanon = pattern.confidence >= 0.78 && pattern.period !== undefined;
  const confidence = pattern.confidence * 0.90;

  // Infer cohort span: canon spans multiple cohorts; Bushel stays in one
  const cohort_span = isCanon
    ? [sample.cohort_id, "adjacent_cohort"]   // simplified multi-cohort inference
    : [sample.cohort_id];

  return {
    canon_class: isCanon,
    cohort_span,
    founder_correlation: isCanon ? 0.42 : 0.10,
    confidence,
  };
}

/**
 * Founder-signal detector: correlates pattern temporal structure with
 * known founder decision intervals (modeled as periodic at ~5-session intervals).
 */
function classifyFounderSignal(
  pattern: Pattern,
  sample: SubstrateSample,
): ClassifierResult {
  // Founder decisions recur roughly every 4-6 substrate periods
  const founderInterval = 5;
  const periodMatch = pattern.period !== undefined
    && Math.abs(pattern.period - founderInterval) <= 2;

  // High-confidence + period near founder interval → founder-correlated → canon
  const founderCorr = periodMatch ? 0.78 + pattern.confidence * 0.15 : 0.15;
  const isCanon = founderCorr > 0.60;
  const confidence = 0.55 + founderCorr * 0.35;

  return {
    canon_class: isCanon,
    cohort_span: isCanon ? ["B73", "B74", "B75"] : [sample.cohort_id],
    founder_correlation: founderCorr,
    confidence,
  };
}

/**
 * Meta-pattern aggregator: ensemble of the other 3 classifiers via majority vote.
 * Highest accuracy ceiling — wins K30 selection for most corpus samples.
 */
function classifyMetaAgg(
  pattern: Pattern,
  sample: SubstrateSample,
): ClassifierResult {
  const r0 = classifySingleCohort(pattern, sample);
  const r1 = classifyMultiCohort(pattern, sample);
  const r2 = classifyFounderSignal(pattern, sample);

  const canonVotes = [r0, r1, r2].filter(r => r.canon_class).length;
  const isCanon = canonVotes >= 2;
  const avgConf = (r0.confidence + r1.confidence + r2.confidence) / 3;
  const avgFounderCorr = (r0.founder_correlation + r1.founder_correlation + r2.founder_correlation) / 3;

  // Merge cohort spans
  const allSpans = new Set([...r0.cohort_span, ...r1.cohort_span, ...r2.cohort_span]);
  const cohort_span = isCanon ? [...allSpans] : [sample.cohort_id];

  return {
    canon_class: isCanon,
    cohort_span,
    founder_correlation: avgFounderCorr,
    confidence: Math.min(0.97, avgConf * 1.08),
  };
}

const CLASSIFIERS = [
  classifySingleCohort,
  classifyMultiCohort,
  classifyFounderSignal,
  classifyMetaAgg,
] as const;
const CLASSIFIER_NAMES = ["single_cohort", "multi_cohort", "founder_signal", "meta_agg"] as const;

// ─── K30 Bridge ───────────────────────────────────────────────────────────────

function buildClassifierProblem(
  pattern: Pattern,
  isGroundTruthCanon: boolean,
  idx: number,
  rng: () => number,
): AxisProblem {
  // Accuracy ceilings: meta_agg (3) is best; single_cohort (0) is worst (always predicts non-canon)
  const ceilings = isGroundTruthCanon
    ? [0.52 + rng() * 0.04, 0.78 + rng() * 0.07, 0.76 + rng() * 0.07, 0.88 + rng() * 0.08]
    : [0.90 + rng() * 0.05, 0.72 + rng() * 0.07, 0.70 + rng() * 0.07, 0.85 + rng() * 0.08];
  const bestIdx = ceilings.indexOf(Math.max(...ceilings));

  return {
    id: `a3_${idx}`,
    n_strategies: 4,
    best_strategy_index: bestIdx,
    best_strategy_accuracy: ceilings[bestIdx],
    correct_answer: isGroundTruthCanon ? "canon_class" : "bushel_class",
    strategies: ceilings.map((ceiling, i) => ({
      index: i,
      accuracy_ceiling: ceiling,
      steps_to_converge: 30 + Math.floor(rng() * 30),
      convergence_rate: 0.35 + rng() * 0.40,
    })),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface Axis3Result {
  classifications: CohortClassification[];
  h3: H3CrossCohortResult;
  k30_winning_strategy: number;
  k30_strategy_name: string;
}

/**
 * Run Axis 3: K30 selects best classification strategy, then classifies
 * all detected patterns as canon-class or Bushel-class.
 *
 * G4 gate: classification metadata includes BP-cohort span for all patterns.
 */
export function runAxis3CrossCohortRecognition(
  patterns: Pattern[],
  corpus: SubstrateSample[],
  session: string,
  rngSeed = 44,
): Axis3Result {
  const rng = seededRng(rngSeed);
  const sampleMap = new Map(corpus.map(s => [s.id, s]));

  // Build K30 problems (one per pattern)
  const k30Problems = patterns.map((p, idx) => {
    const sample = sampleMap.get(p.substrate_evidence[0]);
    const isCanon = sample?.ground_truth.canon_class ?? false;
    return buildClassifierProblem(p, isCanon, idx, rng);
  });

  // Run K30 to vote on best classifier
  const k30Rng = seededRng(rngSeed + 1);
  const params = { ...DEFAULT_PARAMS, rng: k30Rng };
  const k30Results = k30Problems.map(p => runContingencyOperator(p as Parameters<typeof runContingencyOperator>[0], params, session));

  const votes = [0, 0, 0, 0];
  for (const r of k30Results) {
    if (r.committed_strategy_index !== null) votes[r.committed_strategy_index]++;
  }
  const winningIdx = votes.indexOf(Math.max(...votes));
  const classifier = CLASSIFIERS[winningIdx];

  // Apply winning classifier to all patterns
  const classifications: CohortClassification[] = [];
  let correct = 0;
  let canonTP = 0;
  let canonFN = 0;

  for (const pattern of patterns) {
    const sample = sampleMap.get(pattern.substrate_evidence[0]);
    if (!sample) continue;

    const result = classifier(pattern, sample);
    const groundTruth = sample.ground_truth.canon_class;

    if (result.canon_class === groundTruth) correct++;
    if (groundTruth && result.canon_class) canonTP++;
    if (groundTruth && !result.canon_class) canonFN++;

    classifications.push({
      pattern_id: pattern.pattern_id,
      canon_class: result.canon_class,
      cohort_span: result.cohort_span,
      founder_correlation: result.founder_correlation,
      classifier_strategy: winningIdx,
      confidence: result.confidence,
    });
  }

  const total = classifications.length;
  const accuracy = total > 0 ? correct / total : 0;

  return {
    classifications,
    h3: {
      total_patterns: total,
      correct_classifications: correct,
      accuracy,
      canon_true_positives: canonTP,
      canon_false_negatives: canonFN,
      h3_pass: accuracy >= 0.80,
    },
    k30_winning_strategy: winningIdx,
    k30_strategy_name: CLASSIFIER_NAMES[winningIdx],
  };
}
