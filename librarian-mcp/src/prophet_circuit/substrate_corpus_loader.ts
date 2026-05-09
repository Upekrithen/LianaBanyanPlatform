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
