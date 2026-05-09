/**
 * Prophet Circuit — Substrate Corpus Loader
 * Generates / loads synthetic substrate corpus spanning 4+ BP-cohorts.
 * K31 (LB-STACK-0195) — Bushel 79 BP034.
 *
 * Corpus structure:
 *   N=200 samples, 50 per cohort × 4 cohorts (B73, B74, B75, B76)
 *   Four substrate_class types distributed evenly within each cohort.
 *   Ground truth labels: has_pattern, pattern_period, true_next_N,
 *   canon_class, cohort_span — all deterministic given seed.
 *
 * G1 gate: ≥100 samples loaded without error.
 */

import type { SubstrateSample, SubstrateClass, CohortId } from "./types.js";

const COHORT_IDS: CohortId[] = ["B73", "B74", "B75", "B76"];
const SUBSTRATE_CLASSES: SubstrateClass[] = [
  "af_ledger_eblit",
  "pheromone_tablet",
  "iron_tablet",
  "bp_cohort_canon",
];

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

/**
 * Generate a periodic time-series with known period and optional noise.
 * Used for has_pattern=true samples.
 */
function generatePeriodicSeries(
  period: number,
  length: number,
  amplitude: number,
  noise: number,
  rng: () => number,
): number[] {
  return Array.from({ length }, (_, i) => {
    const base = amplitude * Math.sin((2 * Math.PI * i) / period);
    return base + (rng() - 0.5) * noise * amplitude;
  });
}

/** Generate random walk (no discernible pattern). */
function generateRandomWalk(length: number, step: number, rng: () => number): number[] {
  const out: number[] = [rng() * 10];
  for (let i = 1; i < length; i++) {
    out.push(out[i - 1] + (rng() - 0.5) * step);
  }
  return out;
}

/** Project next-N values from a series using linear extrapolation (ground truth model). */
function projectNextN(series: number[], n: number): number[] {
  const last = series.length;
  if (last < 2) return Array(n).fill(series[last - 1] ?? 0);
  const slope = (series[last - 1] - series[last - 2]);
  return Array.from({ length: n }, (_, i) => series[last - 1] + slope * (i + 1));
}

/**
 * Determine canon_class: pattern repeats across ≥3 cohorts.
 * We assign ~40% of patterned samples as canon-class, spanning 3-4 cohorts.
 */
function determineCanonClass(
  cohortIdx: number,
  sampleIdx: number,
  period: number | undefined,
  rng: () => number,
): { canon_class: boolean; cohort_span: CohortId[] } {
  if (!period) return { canon_class: false, cohort_span: [] };
  // Samples whose sampleIdx % 5 === 0 in patterned cohorts are canon-class
  const isCanon = sampleIdx % 5 === 0 && rng() > 0.3;
  if (!isCanon) {
    return { canon_class: false, cohort_span: [COHORT_IDS[cohortIdx]] };
  }
  // Span across 3-4 cohorts
  const spanCount = rng() > 0.4 ? 4 : 3;
  const cohort_span = COHORT_IDS.slice(0, spanCount);
  return { canon_class: true, cohort_span };
}

export interface CorpusOptions {
  n_per_cohort?: number;      // samples per cohort, default 50
  rng_seed?: number;
  series_length?: number;     // metric_values length, default 20
}

/**
 * Generate synthetic substrate corpus.
 * Returns N=200 samples (default) spanning 4 BP-cohorts.
 */
export function generateSubstrateCorpus(opts: CorpusOptions = {}): SubstrateSample[] {
  const n_per_cohort = opts.n_per_cohort ?? 50;
  const series_length = opts.series_length ?? 20;
  const rng = seededRng(opts.rng_seed ?? 31);
  const samples: SubstrateSample[] = [];
  let idCounter = 0;

  for (let ci = 0; ci < COHORT_IDS.length; ci++) {
    const cohortId = COHORT_IDS[ci];
    for (let si = 0; si < n_per_cohort; si++) {
      const idx = ++idCounter;
      const substrateClass = SUBSTRATE_CLASSES[si % SUBSTRATE_CLASSES.length];
      // ~60% of samples have a detectable pattern
      const hasPattern = rng() > 0.40;
      const period = hasPattern
        ? Math.round(3 + rng() * 7)   // period between 3 and 10
        : undefined;

      const metric_values = hasPattern
        ? generatePeriodicSeries(period!, series_length, 5 + rng() * 5, 0.2 + rng() * 0.3, rng)
        : generateRandomWalk(series_length, 2 + rng() * 3, rng);

      const { canon_class, cohort_span } = determineCanonClass(ci, si, period, rng);

      samples.push({
        id: `S${String(idx).padStart(3, "0")}`,
        substrate_class: substrateClass,
        cohort_id: cohortId,
        metric_values,
        timestamp: new Date(Date.UTC(2026, 3 + ci, 1 + si)).toISOString(),
        ground_truth: {
          has_pattern: hasPattern,
          pattern_period: period,
          true_next_5: projectNextN(metric_values, 5),
          true_next_10: projectNextN(metric_values, 10),
          true_next_20: projectNextN(metric_values, 20),
          canon_class,
          cohort_span,
        },
      });
    }
  }

  return samples;
}

/** Write synthetic corpus to JSON for test fixtures. */
export async function writeCorpusFixture(
  corpus: SubstrateSample[],
  outPath: string,
): Promise<void> {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(corpus, null, 2));
}

/** Write ground truth labels only (for test harness). */
export async function writeGroundTruthLabels(
  corpus: SubstrateSample[],
  outPath: string,
): Promise<void> {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  mkdirSync(dirname(outPath), { recursive: true });
  const labels = corpus.map(s => ({
    id: s.id,
    cohort_id: s.cohort_id,
    substrate_class: s.substrate_class,
    has_pattern: s.ground_truth.has_pattern,
    pattern_period: s.ground_truth.pattern_period,
    canon_class: s.ground_truth.canon_class,
    cohort_span: s.ground_truth.cohort_span,
  }));
  writeFileSync(outPath, JSON.stringify({ n: corpus.length, labels }, null, 2));
}
