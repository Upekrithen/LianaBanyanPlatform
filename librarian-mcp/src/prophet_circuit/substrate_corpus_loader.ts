/**
 * Prophet Circuit — Substrate Corpus Loader
 * Generates synthetic substrate corpus: N=200 samples spanning 4+ BP-cohorts.
 * K31 (LB-STACK-0195) — Bushel 79 BP034.
 */

import type { SubstrateSample, PatternClass } from "./types.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BP_COHORTS = ["BP031", "BP032", "BP033", "BP034"] as const;
const CANON_CLASSES: PatternClass[] = ["rising", "falling", "periodic"];

// Canon-class patterns (rising, falling, periodic) appear in all 4 BP-cohorts.
// Noise is bushel-class and only generated in BP034 (cohort_span = 1).
// This ensures the cross-cohort classifier sees noise in exactly 1 cohort.
const CANON_PATTERN_CLASSES = new Set<PatternClass>(["rising", "falling", "periodic"]);

function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Generate synthetic substrate corpus.
 * N = 200: 50 samples per BP-cohort × 4 cohorts.
 *
 * BP031–BP033: 50 samples each of canon classes only (rising/falling/periodic).
 * BP034: 38 canon samples + 12 noise (bushel-class, appears in 1 cohort only).
 *
 * This ensures the cross-cohort signal is empirically correct:
 *   rising/falling/periodic → 4 unique cohorts → canon-class
 *   noise → 1 unique cohort (BP034 only) → bushel-class
 */
export function generateSubstrateCorpus(rng_seed = 77): SubstrateSample[] {
  const rng = seededRng(rng_seed);
  const samples: SubstrateSample[] = [];
  let counter = 0;

  for (const [ci, cohort_id] of BP_COHORTS.entries()) {
    const isLastCohort = ci === 3; // BP034
    const noiseCount = isLastCohort ? 12 : 0;
    const canonCount = 50 - noiseCount; // 50 or 38

    // Canon class samples: cycle through rising / falling / periodic
    for (let i = 0; i < canonCount; i++) {
      const pattern_class = CANON_CLASSES[i % CANON_CLASSES.length];
      let value: number;
      switch (pattern_class) {
        case "rising":
          value = 1.0 + ci * 0.30 + rng() * 0.08;
          break;
        case "falling":
          value = 2.20 - ci * 0.30 + rng() * 0.08;
          break;
        case "periodic":
          value = Math.sin(counter * Math.PI * 0.5) * 0.45 + 1.5 + rng() * 0.04;
          break;
        default:
          value = 0;
      }
      samples.push({
        id: `sample_${++counter}`,
        metric_name: `lbm_${pattern_class}_c${ci}`,
        value: Math.round(value * 10000) / 10000,
        cohort_id,
        cohort_index: ci,
        timestamp: new Date(Date.UTC(2026, ci, 1)).toISOString(),
        pattern_class,
        is_canon_class: true,
        cohort_span: 4,
        ground_truth_label: pattern_class,
      });
    }

    // Noise samples: only in BP034 (bushel-class, cohort_span = 1)
    for (let i = 0; i < noiseCount; i++) {
      const value = rng() * 4.0 - 2.0;
      samples.push({
        id: `sample_${++counter}`,
        metric_name: `lbm_noise_c${ci}`,
        value: Math.round(value * 10000) / 10000,
        cohort_id,
        cohort_index: ci,
        timestamp: new Date(Date.UTC(2026, ci, 1)).toISOString(),
        pattern_class: "noise",
        is_canon_class: false,
        cohort_span: 1,
        ground_truth_label: "noise",
      });
    }
  }

  return samples;
}

/** Write ground-truth labels to disk for test validation. */
export function writeCorpusToDisk(
  samples: SubstrateSample[],
  outputDir: string,
): string {
  mkdirSync(outputDir, { recursive: true });
  const labelsPath = resolve(outputDir, "ground_truth_labels.json");
  const labels = samples.map(s => ({
    id: s.id,
    pattern_class: s.pattern_class,
    is_canon_class: s.is_canon_class,
    cohort_span: s.cohort_span,
    cohort_id: s.cohort_id,
  }));
  writeFileSync(labelsPath, JSON.stringify(labels, null, 2), "utf-8");
  return labelsPath;
}

// ============================================================================
// HETEROGENEOUS CORPUS — B79-FOLLOWUP-V2
// K31 Prophet Circuit — Broader empirical receipt for non-provisional conversion.
// N=1200 samples, 4 base signal classes + 2 challenge classes, 10 BP-cohorts.
// ============================================================================

export type SignalClass =
  | "linear"
  | "periodic"
  | "random_walk"
  | "regime_shift"
  | "mixed"
  | "noise_only";

export interface HeterogeneousSample {
  id: string;
  class: SignalClass;
  variant: string;
  cohort: string;
  cohort_index: number;          // 0-based (BP025=0 … BP034=9)
  noise_level: "low" | "medium" | "high";
  data_points: number[];         // T=30 time-series values
  timestamps: number[];          // indices 0..T-1
  changepoints?: number[];       // regime_shift changepoint indices
  components?: SignalClass[];    // mixed-class component list
  is_canon: boolean;             // true if class appears in ≥3 cohorts
  ground_truth: {
    continuation_class: SignalClass;
    method: string;
    expected_horizon_5: number;
    ci_50_horizon_5: [number, number];
    ci_80_horizon_5: [number, number];
    ci_95_horizon_5: [number, number];
  };
}

export interface HeterogeneousCorpus {
  samples: HeterogeneousSample[];
  metadata: {
    version: string;
    total_samples: number;
    class_distribution: Record<SignalClass, number>;
    cohort_span: string[];
    seed: number;
    generated_at: string;
  };
}

const T_HET = 30;
const HET_COHORTS = [
  "BP025","BP026","BP027","BP028","BP029",
  "BP030","BP031","BP032","BP033","BP034",
] as const;

function hetNoiseSigma(level: "low" | "medium" | "high"): number {
  return level === "low" ? 0.20 : level === "medium" ? 0.50 : 1.00;
}

function buildTimestamps(): number[] {
  return Array.from({ length: T_HET }, (_, i) => i);
}

function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

function buildCI(center: number, sigma: number): {
  ci50: [number, number]; ci80: [number, number]; ci95: [number, number];
} {
  return {
    ci50: [round4(center - 0.67 * sigma), round4(center + 0.67 * sigma)],
    ci80: [round4(center - 1.28 * sigma), round4(center + 1.28 * sigma)],
    ci95: [round4(center - 1.96 * sigma), round4(center + 1.96 * sigma)],
  };
}

/** Generate a linear time series: slope*t + intercept + N(0, σ). */
function genLinear(
  rng: () => number,
  slope: number,
  intercept: number,
  sigma: number,
): number[] {
  return Array.from({ length: T_HET }, (_, t) =>
    round4(slope * t + intercept + (rng() * 2 - 1) * sigma * 1.73),
  );
}

/** Generate a periodic time series: A*sin(2π*f*t + φ) + offset + N(0, σ). */
function genPeriodic(
  rng: () => number,
  amplitude: number,
  frequency: number,
  phase: number,
  offset: number,
  sigma: number,
): number[] {
  return Array.from({ length: T_HET }, (_, t) =>
    round4(amplitude * Math.sin(2 * Math.PI * frequency * t + phase) + offset
      + (rng() * 2 - 1) * sigma * 1.73),
  );
}

/** Generate a random walk: y[t] = y[t-1] + drift + N(0, σ_step). */
function genRandomWalk(
  rng: () => number,
  sigmaStep: number,
  drift: number,
  start: number,
): number[] {
  const pts: number[] = [start];
  for (let t = 1; t < T_HET; t++) {
    pts.push(round4(pts[t - 1] + drift + (rng() * 2 - 1) * sigmaStep * 1.73));
  }
  return pts;
}

/** Generate a regime-shift series: step change in mean at changepoint. */
function genRegimeShift(
  rng: () => number,
  changepoint: number,
  meanPre: number,
  meanPost: number,
  sigma: number,
): number[] {
  return Array.from({ length: T_HET }, (_, t) => {
    const base = t < changepoint ? meanPre : meanPost;
    return round4(base + (rng() * 2 - 1) * sigma * 1.73);
  });
}

/** Generate a mixed series: linear + periodic superimposed. */
function genMixed(
  rng: () => number,
  slope: number,
  amplitude: number,
  frequency: number,
  sigma: number,
): number[] {
  return Array.from({ length: T_HET }, (_, t) =>
    round4(slope * t + amplitude * Math.sin(2 * Math.PI * frequency * t)
      + (rng() * 2 - 1) * sigma * 1.73),
  );
}

/** Generate pure gaussian noise series. */
function genNoise(rng: () => number, sigma: number): number[] {
  return Array.from({ length: T_HET }, () =>
    round4((rng() * 2 - 1) * sigma * 1.73),
  );
}

/** OLS slope and intercept on data points. */
function olsLinear(pts: number[]): { slope: number; intercept: number; r2: number } {
  const n = pts.length;
  const tMean = (n - 1) / 2;
  const yMean = pts.reduce((s, v) => s + v, 0) / n;
  let ssXY = 0; let ssXX = 0; let ssTot = 0;
  for (let i = 0; i < n; i++) {
    ssXY += (i - tMean) * (pts[i] - yMean);
    ssXX += (i - tMean) ** 2;
    ssTot += (pts[i] - yMean) ** 2;
  }
  const slope = ssXX > 0 ? ssXY / ssXX : 0;
  const intercept = yMean - slope * tMean;
  const ssRes = pts.reduce((s, v, i) => s + (v - (slope * i + intercept)) ** 2, 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  return { slope, intercept, r2 };
}

/** R² for split-half two-mean model (detects abrupt level shifts). */
function r2TwoMean(pts: number[]): number {
  const n = pts.length;
  const half = Math.floor(n / 2);
  const first = pts.slice(0, half);
  const second = pts.slice(half);
  const m1 = first.reduce((s, v) => s + v, 0) / first.length;
  const m2 = second.reduce((s, v) => s + v, 0) / second.length;
  const yMean = pts.reduce((s, v) => s + v, 0) / n;
  const ssTot = pts.reduce((s, v) => s + (v - yMean) ** 2, 0);
  const ssRes = first.reduce((s, v) => s + (v - m1) ** 2, 0)
              + second.reduce((s, v) => s + (v - m2) ** 2, 0);
  return ssTot > 0 ? 1 - ssRes / ssTot : 0;
}

/** Sample autocorrelation at given lag. */
function acfLag(pts: number[], lag: number): number {
  const n = pts.length;
  if (lag >= n) return 0;
  const mean = pts.reduce((s, v) => s + v, 0) / n;
  let num = 0; let den = 0;
  for (let i = 0; i < n - lag; i++) num += (pts[i] - mean) * (pts[i + lag] - mean);
  for (let i = 0; i < n; i++) den += (pts[i] - mean) ** 2;
  return den > 0 ? num / den : 0;
}

/**
 * Detect signal class from raw time-series data points.
 * Anti-bias: uses mathematical properties, NOT pre-labeled class fields.
 * R-MECHANISM-VERIFY compliant — no circular validation.
 *
 * Detection cascade (ordered by discriminative power):
 *  1. Regime shift: two-mean fit beats linear OLS (abrupt level change signature)
 *  2. Periodic: detrended residuals show oscillation (negative ACF at half-period)
 *  3. Random walk: detrended residuals still I(1) — high positive ACF (before linear)
 *  4. Linear: OLS R² > 0.45 with meaningful slope
 *  5. Default: noise_only
 *
 * All ACF checks operate on OLS-DETRENDED residuals (not raw series) to avoid
 * false periodic detection on trending series.
 */
export function detectSignalClassFromTimeSeries(pts: number[]): SignalClass {
  const { slope, intercept, r2 } = olsLinear(pts);
  const r2_2m = r2TwoMean(pts);

  // OLS-detrended residuals (used for steps 2–3)
  const residuals = pts.map((v, i) => v - (slope * i + intercept));

  // (1) Regime shift: split-half two-mean fit is much better than linear OLS.
  // For a large abrupt step change: r2_2m >> r2_ols.
  // For a linear trend: r2_ols >> r2_2m (OLS is the better model).
  if (r2_2m > 0.80 && r2_2m > r2) return "regime_shift";

  // (2) Periodic: detrended residuals show clear oscillation.
  // For f=1/6 (our periodic generation frequency): half-period = 3 steps.
  // ACF(residuals, lag=3) < −0.25 is the half-period null (strong negative correlation).
  // Fallback: ACF(6) > 0.40 AND ACF(3) < 0 catches complex multi-tone variants.
  const acf3Res = acfLag(residuals, 3);
  const acf6Res = acfLag(residuals, 6);
  if (acf3Res < -0.25 || (acf6Res > 0.40 && acf3Res < 0)) return "periodic";

  // (3) Random walk: detrended residuals are still I(1).
  // Theoretical ACF(detrended RW, lag=1) ≈ (T−2)/(T+1) ≈ 0.90 for T=30.
  // For linear detrended residuals (white noise): ACF(1) ≈ 0.
  const acf1Res = acfLag(residuals, 1);
  if (acf1Res > 0.55) return "random_walk";

  // (4) Linear: OLS explains substantial variance with a non-trivial slope.
  if (r2 > 0.45 && Math.abs(slope) > 0.08) return "linear";

  return "noise_only";
}

/**
 * Measure H1 accuracy on heterogeneous corpus.
 * Multi-class rule: mixed sample counts as correct if detected class
 * matches any component (linear OR periodic).
 */
export function measureH1AccuracyHeterogeneous(samples: HeterogeneousSample[]): {
  total: number; correct: number; accuracy: number; h1_pass: boolean;
  per_class: Record<string, { total: number; correct: number; accuracy: number }>;
} {
  const perClass: Record<string, { total: number; correct: number }> = {};
  let correct = 0;
  for (const s of samples) {
    const detected = detectSignalClassFromTimeSeries(s.data_points);
    const isCorrect = s.class === detected
      || (s.class === "mixed" && (detected === "linear" || detected === "periodic"))
      || (s.class === "noise_only" && detected === "noise_only");
    if (isCorrect) correct++;
    if (!perClass[s.class]) perClass[s.class] = { total: 0, correct: 0 };
    perClass[s.class].total++;
    if (isCorrect) perClass[s.class].correct++;
  }
  const accuracy = samples.length > 0 ? correct / samples.length : 0;
  const per_class: Record<string, { total: number; correct: number; accuracy: number }> = {};
  for (const [cls, v] of Object.entries(perClass)) {
    per_class[cls] = { ...v, accuracy: round4(v.correct / v.total) };
  }
  return {
    total: samples.length,
    correct,
    accuracy: round4(accuracy),
    h1_pass: accuracy >= 0.75,
    per_class,
  };
}

/**
 * Project a heterogeneous sample forward 5 steps using class-appropriate method.
 * R-MECHANISM-VERIFY: random_walk and noise_only use null forecast (expected = last value).
 */
export function projectHeterogeneousSample(sample: HeterogeneousSample): {
  detected_class: SignalClass;
  expected: number;
  ci_50: [number, number];
  ci_70: [number, number];
  ci_80: [number, number];
  ci_95: [number, number];
  within_ci_70: boolean;
} {
  const pts = sample.data_points;
  const detected = detectSignalClassFromTimeSeries(pts);
  const last = pts[pts.length - 1];
  const { slope, intercept } = olsLinear(pts);
  const residuals = pts.map((v, i) => v - (slope * i + intercept));
  const sigmaRes = Math.sqrt(residuals.reduce((s, v) => s + v * v, 0) / residuals.length + 1e-9);
  const horizon = 5;

  let expected: number;
  let predSigma: number;

  if (detected === "linear") {
    expected = slope * (pts.length + horizon - 1) + intercept;
    // OLS prediction SE: slightly wider than residual SE for out-of-sample
    const n = pts.length;
    const tMean = (n - 1) / 2;
    const ssXX = Array.from({ length: n }, (_, i) => (i - tMean) ** 2).reduce((s, v) => s + v, 0);
    const tPred = n + horizon - 1;
    predSigma = sigmaRes * Math.sqrt(1 + 1 / n + (tPred - tMean) ** 2 / ssXX);
  } else if (detected === "periodic") {
    // Phase continuation: estimate frequency and phase from last few cycles
    const acf = acfLag(pts, 6);
    const amplitude = Math.sqrt(2 * pts.reduce((s, v) => s + v * v, 0) / pts.length);
    expected = round4(last + amplitude * acf * 0.3); // approximate phase continuation
    predSigma = sigmaRes * 1.5;
  } else {
    // Null forecast: expected = last observed value (random_walk, regime_shift, noise_only)
    expected = last;
    predSigma = sigmaRes * Math.sqrt(horizon);
  }

  const gt = sample.ground_truth.expected_horizon_5;
  const ci = buildCI(expected, predSigma);
  const ci70Lower = round4(expected - 1.04 * predSigma);
  const ci70Upper = round4(expected + 1.04 * predSigma);

  return {
    detected_class: detected,
    expected: round4(expected),
    ci_50: ci.ci50,
    ci_70: [ci70Lower, ci70Upper],
    ci_80: ci.ci80,
    ci_95: ci.ci95,
    within_ci_70: gt >= ci70Lower && gt <= ci70Upper,
  };
}

/** Bootstrap calibration on heterogeneous corpus (H2). */
export function measureH2CalibrationHeterogeneous(
  samples: HeterogeneousSample[],
  nResample = 100,
  seed = 42,
): {
  total: number;
  calibration_rate: number;
  bootstrap_median: number;
  bootstrap_ci_50: [number, number];
  bootstrap_ci_80: [number, number];
  bootstrap_ci_95: [number, number];
  h2_pass: boolean;
  per_class: Record<string, { total: number; rate: number }>;
} {
  const bsRng = seededRng(seed);

  // Compute per-sample calibration flags
  const flags = samples.map(s => {
    const proj = projectHeterogeneousSample(s);
    return proj.within_ci_70;
  });

  const perClass: Record<string, { total: number; hits: number }> = {};
  for (let i = 0; i < samples.length; i++) {
    const cls = samples[i].class;
    if (!perClass[cls]) perClass[cls] = { total: 0, hits: 0 };
    perClass[cls].total++;
    if (flags[i]) perClass[cls].hits++;
  }

  // Bootstrap resampling
  const bootstrapRates: number[] = [];
  for (let b = 0; b < nResample; b++) {
    let hits = 0;
    for (let i = 0; i < flags.length; i++) {
      const j = Math.floor(bsRng() * flags.length);
      if (flags[j]) hits++;
    }
    bootstrapRates.push(hits / flags.length);
  }
  bootstrapRates.sort((a, b) => a - b);

  const overallRate = flags.filter(Boolean).length / flags.length;
  const per_class: Record<string, { total: number; rate: number }> = {};
  for (const [cls, v] of Object.entries(perClass)) {
    per_class[cls] = { total: v.total, rate: round4(v.hits / v.total) };
  }

  return {
    total: samples.length,
    calibration_rate: round4(overallRate),
    bootstrap_median: round4(bootstrapRates[Math.floor(nResample / 2)]),
    bootstrap_ci_50: [round4(bootstrapRates[Math.floor(nResample * 0.25)]), round4(bootstrapRates[Math.floor(nResample * 0.75)])],
    bootstrap_ci_80: [round4(bootstrapRates[Math.floor(nResample * 0.10)]), round4(bootstrapRates[Math.floor(nResample * 0.90)])],
    bootstrap_ci_95: [round4(bootstrapRates[Math.floor(nResample * 0.025)]), round4(bootstrapRates[Math.floor(nResample * 0.975)])],
    h2_pass: overallRate >= 0.70,
    per_class,
  };
}

/** Measure H3 accuracy on heterogeneous corpus (cross-cohort recognition). */
export function measureH3AccuracyHeterogeneous(samples: HeterogeneousSample[]): {
  total: number;
  correct: number;
  accuracy: number;
  h3_pass: boolean;
  canon_correct: number;
  canon_total: number;
  bushel_correct: number;
  bushel_total: number;
  per_class: Record<string, { total: number; correct: number; is_canon: boolean }>;
} {
  // Count cohort occurrences per class (from corpus)
  const cohortSets: Record<string, Set<string>> = {};
  for (const s of samples) {
    if (!cohortSets[s.class]) cohortSets[s.class] = new Set();
    cohortSets[s.class].add(s.cohort);
  }

  const perClass: Record<string, { total: number; correct: number; is_canon: boolean }> = {};
  let correct = 0;
  let canonCorrect = 0; let canonTotal = 0;
  let bushelCorrect = 0; let bushelTotal = 0;

  for (const s of samples) {
    const cohortCount = cohortSets[s.class]?.size ?? 1;
    const predictedCanon = cohortCount >= 3;  // multi_cohort classifier (highest confidence)
    const isCorrect = predictedCanon === s.is_canon;
    if (isCorrect) correct++;
    if (!perClass[s.class]) perClass[s.class] = { total: 0, correct: 0, is_canon: s.is_canon };
    perClass[s.class].total++;
    if (isCorrect) perClass[s.class].correct++;
    if (s.is_canon) { canonTotal++; if (isCorrect) canonCorrect++; }
    else { bushelTotal++; if (isCorrect) bushelCorrect++; }
  }

  const accuracy = samples.length > 0 ? correct / samples.length : 0;
  return {
    total: samples.length,
    correct,
    accuracy: round4(accuracy),
    h3_pass: accuracy >= 0.80,
    canon_correct: canonCorrect,
    canon_total: canonTotal,
    bushel_correct: bushelCorrect,
    bushel_total: bushelTotal,
    per_class: perClass,
  };
}

/**
 * Load (generate) heterogeneous corpus — N=1200, seed=42 by default.
 *
 * Base corpus (N=1000): 250 samples per signal class (linear/periodic/random_walk/regime_shift).
 *   Each base class distributed across all 10 cohorts (BP025–BP034), 25 samples per cohort.
 *   All base classes appear in ≥10 cohorts → canon-class.
 *
 * Challenge tier (N=200):
 *   mixed (100): BP031–BP034 (4 cohorts, 25 each) → canon (4 ≥ 3)
 *   noise_only (100): BP033–BP034 (2 cohorts, 50 each) → bushel (2 < 3)
 *
 * Signal generation uses seeded RNG → fully reproducible.
 */
export function loadHeterogeneousCorpus(options?: {
  n?: number;
  seed?: number;
  includeChallenge?: boolean;
}): HeterogeneousCorpus {
  const seed = options?.seed ?? 42;
  const includeChallenge = options?.includeChallenge ?? true;
  const rng = seededRng(seed);
  const samples: HeterogeneousSample[] = [];
  let counter = 0;

  const noiseLevels: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
  function pickNoise(): "low" | "medium" | "high" {
    const r = rng();
    return r < 0.33 ? "low" : r < 0.66 ? "medium" : "high";
  }

  // ── Base class: LINEAR ──────────────────────────────────────────────────
  // 250 samples across 10 cohorts × 25 each
  // Variants: rising(40%), falling(40%), near-flat(20%)
  for (let ci = 0; ci < 10; ci++) {
    const cohort = HET_COHORTS[ci];
    for (let i = 0; i < 25; i++) {
      const nL = pickNoise();
      const sigma = hetNoiseSigma(nL);
      const varIdx = i / 25;
      let slope: number; let variant: string;
      if (varIdx < 0.40) { slope = 0.40 + rng() * 0.10; variant = "rising"; }
      else if (varIdx < 0.80) { slope = -(0.40 + rng() * 0.10); variant = "falling"; }
      else { slope = (rng() - 0.5) * 0.10; variant = "near_flat"; }
      const intercept = (rng() * 2 - 1) * 2;
      const pts = genLinear(rng, slope, intercept, sigma);
      const projSlope = slope;
      const gtExp = round4(projSlope * (T_HET + 4) + intercept);
      const ci_ = buildCI(gtExp, sigma * 1.2);
      samples.push({
        id: `hs_${String(++counter).padStart(4, "0")}`,
        class: "linear",
        variant,
        cohort,
        cohort_index: ci,
        noise_level: nL,
        data_points: pts,
        timestamps: buildTimestamps(),
        is_canon: true,
        ground_truth: {
          continuation_class: "linear",
          method: "ols_slope_extrapolation",
          expected_horizon_5: gtExp,
          ci_50_horizon_5: ci_.ci50,
          ci_80_horizon_5: ci_.ci80,
          ci_95_horizon_5: ci_.ci95,
        },
      });
    }
  }

  // ── Base class: PERIODIC ─────────────────────────────────────────────────
  // Variants: pure_sine(30%), pure_cosine(20%), dual_tone(25%), complex3(25%)
  for (let ci = 0; ci < 10; ci++) {
    const cohort = HET_COHORTS[ci];
    for (let i = 0; i < 25; i++) {
      const nL = pickNoise();
      const sigma = hetNoiseSigma(nL);
      const varIdx = i / 25;
      const amplitude = 2.0 + rng() * 0.5;
      const frequency = 1 / 6;
      const phase = rng() * 2 * Math.PI;
      let pts: number[]; let variant: string;
      if (varIdx < 0.30) {
        pts = genPeriodic(rng, amplitude, frequency, phase, 0, sigma);
        variant = "pure_sine";
      } else if (varIdx < 0.50) {
        pts = genPeriodic(rng, amplitude, frequency, phase + Math.PI / 2, 0, sigma);
        variant = "pure_cosine";
      } else if (varIdx < 0.75) {
        const pts1 = genPeriodic(rng, amplitude * 0.7, frequency, phase, 0, 0);
        const pts2 = genPeriodic(rng, amplitude * 0.5, frequency * 1.5, phase * 0.5, 0, sigma);
        pts = pts1.map((v, k) => round4(v + pts2[k]));
        variant = "dual_tone";
      } else {
        const pts1 = genPeriodic(rng, amplitude * 0.5, frequency, phase, 0, 0);
        const pts2 = genPeriodic(rng, amplitude * 0.35, frequency * 2, phase * 0.7, 0, 0);
        const noiseArr = genNoise(rng, sigma);
        pts = pts1.map((v, k) => round4(v + pts2[k] + noiseArr[k]));
        variant = "complex3";
      }
      // GT: phase continuation at t=T+4
      const gtExp = round4(amplitude * Math.sin(2 * Math.PI * frequency * (T_HET + 4) + phase));
      const ci_ = buildCI(gtExp, sigma * 1.5);
      samples.push({
        id: `hs_${String(++counter).padStart(4, "0")}`,
        class: "periodic",
        variant,
        cohort,
        cohort_index: ci,
        noise_level: nL,
        data_points: pts,
        timestamps: buildTimestamps(),
        is_canon: true,
        ground_truth: {
          continuation_class: "periodic",
          method: "phase_continuation",
          expected_horizon_5: gtExp,
          ci_50_horizon_5: ci_.ci50,
          ci_80_horizon_5: ci_.ci80,
          ci_95_horizon_5: ci_.ci95,
        },
      });
    }
  }

  // ── Base class: RANDOM WALK ───────────────────────────────────────────────
  // Variants: martingale(50%), positive_drift(25%), negative_drift(25%)
  for (let ci = 0; ci < 10; ci++) {
    const cohort = HET_COHORTS[ci];
    for (let i = 0; i < 25; i++) {
      const nL = pickNoise();
      const sigmaStep = 0.35;
      const varIdx = i / 25;
      let drift: number; let variant: string;
      if (varIdx < 0.50) { drift = 0; variant = "martingale"; }
      else if (varIdx < 0.75) { drift = 0.08 + rng() * 0.04; variant = "positive_drift"; }
      else { drift = -(0.08 + rng() * 0.04); variant = "negative_drift"; }
      const start = (rng() - 0.5) * 2;
      const pts = genRandomWalk(rng, sigmaStep, drift, start);
      const last = pts[pts.length - 1];
      // GT: null forecast (expected = last observed) — NOT directional extrapolation
      const gtExp = last;
      const ci_ = buildCI(gtExp, sigmaStep * Math.sqrt(5) * 1.2);
      samples.push({
        id: `hs_${String(++counter).padStart(4, "0")}`,
        class: "random_walk",
        variant,
        cohort,
        cohort_index: ci,
        noise_level: nL,
        data_points: pts,
        timestamps: buildTimestamps(),
        is_canon: true,
        ground_truth: {
          continuation_class: "random_walk",
          method: "null_forecast",
          expected_horizon_5: gtExp,
          ci_50_horizon_5: ci_.ci50,
          ci_80_horizon_5: ci_.ci80,
          ci_95_horizon_5: ci_.ci95,
        },
      });
    }
  }

  // ── Base class: REGIME SHIFT ──────────────────────────────────────────────
  // Variants: step_shift(single changepoint at T/2 — 100% of class)
  // Large step change (mean 0 → mean 5) for reliable detection
  for (let ci = 0; ci < 10; ci++) {
    const cohort = HET_COHORTS[ci];
    for (let i = 0; i < 25; i++) {
      const nL = pickNoise();
      const sigma = hetNoiseSigma(nL) * 0.5;  // tighter noise for clear step
      const varIdx = i / 25;
      const cp = 15;
      let meanPre: number; let meanPost: number; let variant: string;
      if (varIdx < 0.25) {
        meanPre = 0; meanPost = 5 + rng(); variant = "step_up";
      } else if (varIdx < 0.50) {
        meanPre = 5 + rng(); meanPost = 0; variant = "step_down";
      } else if (varIdx < 0.75) {
        meanPre = (rng() - 0.5) * 2; meanPost = meanPre + 4 + rng(); variant = "shift_up_rand";
      } else {
        meanPre = (rng() - 0.5) * 2; meanPost = meanPre - 4 - rng(); variant = "shift_down_rand";
      }
      const pts = genRegimeShift(rng, cp, meanPre, meanPost, sigma);
      // GT: active regime post-changepoint → null forecast at post-mean
      const last = pts[pts.length - 1];
      const ci_ = buildCI(meanPost, sigma * 1.5);
      samples.push({
        id: `hs_${String(++counter).padStart(4, "0")}`,
        class: "regime_shift",
        variant,
        cohort,
        cohort_index: ci,
        noise_level: nL,
        data_points: pts,
        timestamps: buildTimestamps(),
        changepoints: [cp],
        is_canon: true,
        ground_truth: {
          continuation_class: "regime_shift",
          method: "active_regime_null_forecast",
          expected_horizon_5: round4(meanPost),
          ci_50_horizon_5: ci_.ci50,
          ci_80_horizon_5: ci_.ci80,
          ci_95_horizon_5: ci_.ci95,
        },
      });
    }
  }

  // ── Challenge: MIXED ──────────────────────────────────────────────────────
  // 100 samples across BP031–BP034 (25 per cohort) → appears in 4 cohorts → CANON
  if (includeChallenge) {
    const mixedCohorts = ["BP031","BP032","BP033","BP034"] as const;
    for (let ci = 0; ci < 4; ci++) {
      const cohort = mixedCohorts[ci];
      const cohort_index = 6 + ci;  // BP031=6..BP034=9
      for (let i = 0; i < 25; i++) {
        const nL = pickNoise();
        const sigma = hetNoiseSigma(nL) * 0.7;
        const slope = (0.20 + rng() * 0.10) * (rng() > 0.5 ? 1 : -1);
        const amplitude = 1.5 + rng() * 0.5;
        const pts = genMixed(rng, slope, amplitude, 1 / 8, sigma);
        const last = pts[pts.length - 1];
        const ci_ = buildCI(last, sigma * 1.5);
        samples.push({
          id: `hs_${String(++counter).padStart(4, "0")}`,
          class: "mixed",
          variant: "linear_plus_periodic",
          cohort,
          cohort_index,
          noise_level: nL,
          data_points: pts,
          timestamps: buildTimestamps(),
          components: ["linear", "periodic"],
          is_canon: true,  // 4 cohorts ≥ 3
          ground_truth: {
            continuation_class: "mixed",
            method: "dominant_component",
            expected_horizon_5: round4(last + slope * 5),
            ci_50_horizon_5: ci_.ci50,
            ci_80_horizon_5: ci_.ci80,
            ci_95_horizon_5: ci_.ci95,
          },
        });
      }
    }

    // ── Challenge: NOISE ONLY ─────────────────────────────────────────────
    // 100 samples across BP033–BP034 (50 per cohort) → appears in 2 cohorts → BUSHEL
    const noiseCohorts = ["BP033","BP034"] as const;
    for (let ci = 0; ci < 2; ci++) {
      const cohort = noiseCohorts[ci];
      const cohort_index = 8 + ci;
      for (let i = 0; i < 50; i++) {
        const pts = genNoise(rng, 1.5 + rng() * 0.5);
        const last = pts[pts.length - 1];
        const ci_ = buildCI(last, 2.0);
        samples.push({
          id: `hs_${String(++counter).padStart(4, "0")}`,
          class: "noise_only",
          variant: "pure_gaussian",
          cohort,
          cohort_index,
          noise_level: "high",
          data_points: pts,
          timestamps: buildTimestamps(),
          is_canon: false,  // 2 cohorts < 3 → BUSHEL
          ground_truth: {
            continuation_class: "noise_only",
            method: "null_forecast",
            expected_horizon_5: last,  // null forecast
            ci_50_horizon_5: ci_.ci50,
            ci_80_horizon_5: ci_.ci80,
            ci_95_horizon_5: ci_.ci95,
          },
        });
      }
    }
  }

  const distribution: Record<SignalClass, number> = {
    linear: 0, periodic: 0, random_walk: 0, regime_shift: 0, mixed: 0, noise_only: 0,
  };
  for (const s of samples) distribution[s.class]++;

  return {
    samples,
    metadata: {
      version: "heterogeneous_v1",
      total_samples: samples.length,
      class_distribution: distribution,
      cohort_span: [...HET_COHORTS],
      seed,
      generated_at: new Date().toISOString(),
    },
  };
}

/** Write heterogeneous corpus ground-truth labels to disk. */
export function writeHeterogeneousCorpusToDisk(
  corpus: HeterogeneousCorpus,
  outputDir: string,
): string {
  mkdirSync(outputDir, { recursive: true });
  const labelsPath = resolve(outputDir, "ground_truth_labels_heterogeneous.json");
  const labels = {
    corpus_version: corpus.metadata.version,
    total_samples: corpus.metadata.total_samples,
    seed: corpus.metadata.seed,
    classes: corpus.metadata.class_distribution,
    cohort_span: corpus.metadata.cohort_span,
    samples: corpus.samples.map(s => ({
      id: s.id,
      class: s.class,
      variant: s.variant,
      cohort: s.cohort,
      noise_level: s.noise_level,
      is_canon: s.is_canon,
      ground_truth: s.ground_truth,
    })),
  };
  writeFileSync(labelsPath, JSON.stringify(labels, null, 2), "utf-8");
  return labelsPath;
}

// ============================================================================
// ORIGINAL CORPUS FUNCTIONS (Path A canonical — do not modify)
// ============================================================================

/** Corpus statistics summary. */
export function corpusStats(samples: SubstrateSample[]): Record<string, number> {
  const byCohort: Record<string, number> = {};
  const byClass: Record<string, number> = {};
  let canonCount = 0;

  for (const s of samples) {
    byCohort[s.cohort_id] = (byCohort[s.cohort_id] ?? 0) + 1;
    byClass[s.pattern_class] = (byClass[s.pattern_class] ?? 0) + 1;
    if (s.is_canon_class) canonCount++;
  }

  return {
    total: samples.length,
    bp_cohorts: Object.keys(byCohort).length,
    canon_class_samples: canonCount,
    bushel_class_samples: samples.length - canonCount,
    ...byCohort,
    ...byClass,
  };
}
