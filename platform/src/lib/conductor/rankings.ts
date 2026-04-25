/**
 * Conductor Rankings — R13 Hydrated Ranking Table
 * K446 · Phase 3 · R13 (K499, 2026-04-25)
 *
 * Source: BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K499_B123_R13_CROSS_VENDOR_BENCHMARK.md
 * Commit: v-r13-cross-vendor-benchmark-K499
 * Cross-vendor mean lift: +86.2pp (R10 baseline: +86.1pp — stable across 3 generations, 4 vendors)
 * Cost-per-HOT spread: 21.6× within Anthropic; 78× across vendors (Gemini Flash $0.0040 → Opus $0.3140)
 *
 * R13 measures ONE task class: substrate-grounded factual answering on sealed adversarial banks.
 * Task classes NOT measured by R13 (conservative flagship fallback until R15 lands):
 *   - multi_step_planning  → conservative default: claude-opus-4-7 (flagship reasoning tier)
 *   - creative             → conservative default: claude-opus-4-7
 *   - code_generation      → conservative default: claude-opus-4-7
 * R15 (post-R14, queued) will measure these and populate per-class ranking data.
 *
 * Architecture note:
 *   This file is the ONLY place ranking data is hand-edited.
 *   router.ts calls getRankingForClass() to retrieve the ordered list.
 *   When R15 lands, add entries to the `R15_RANKING_TABLE` and remove the
 *   conservative-fallback entries from the relevant classes.
 */

import type { QueryClass } from "./classifier.js";
import type { VendorName } from "./adapters/types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelVendorPair {
  vendor: VendorName;
  model: string;           // Exact model ID for adapter calls
  hotPercent: number;      // HOT% from empirical benchmark (0–100)
  costPerHot: number | null; // USD per correct answer (null = not yet measured)
  tier: "top" | "mid" | "cheap";
  source: "R13" | "R15" | "stub" | "conservative-fallback";
  rankingAgeDays: number | null; // null = no empirical data for this class
}

// ---------------------------------------------------------------------------
// R13 ranking data — substrate-grounded factual answering
// Measured: K499, 2026-04-25, 8 models × 2 conditions × 50 questions
// ---------------------------------------------------------------------------

const R13_RANKINGS: ModelVendorPair[] = [
  {
    vendor: "anthropic",
    model: "claude-opus-4-7",
    hotPercent: 98,
    costPerHot: 0.3140,
    tier: "top",
    source: "R13",
    rankingAgeDays: 0,
  },
  {
    vendor: "perplexity",
    model: "sonar-pro",
    hotPercent: 94,
    costPerHot: null, // web-search overhead makes per-HOT cost non-trivial; TODO R15
    tier: "top",
    source: "R13",
    rankingAgeDays: 0,
  },
  {
    vendor: "anthropic",
    model: "claude-haiku-4-5",
    hotPercent: 90,
    costPerHot: 0.0157,
    tier: "cheap",
    source: "R13",
    rankingAgeDays: 0,
  },
  {
    vendor: "openai",
    model: "gpt-5-5",
    hotPercent: 88,
    costPerHot: null, // TBD per R13 report
    tier: "top",
    source: "R13",
    rankingAgeDays: 0,
  },
  {
    vendor: "anthropic",
    model: "claude-sonnet-4-6",
    hotPercent: 86,
    costPerHot: null, // TBD per R13 report
    tier: "mid",
    source: "R13",
    rankingAgeDays: 0,
  },
  {
    vendor: "openai",
    model: "gpt-5-4-mini",
    hotPercent: 82,
    costPerHot: null, // TBD per R13 report
    tier: "mid",
    source: "R13",
    rankingAgeDays: 0,
  },
  {
    vendor: "google",
    model: "gemini-2-5-flash",
    hotPercent: 80,
    costPerHot: 0.0040,
    tier: "mid",
    source: "R13",
    rankingAgeDays: 0,
  },
  {
    vendor: "google",
    model: "gemini-2-5-pro",
    hotPercent: 74,
    costPerHot: null, // TBD per R13 report
    tier: "top",
    source: "R13",
    rankingAgeDays: 0,
  },
];

// ---------------------------------------------------------------------------
// Conservative fallback for task classes NOT yet measured by R13
// Remove each entry when R15 provides empirical data for that class.
// ---------------------------------------------------------------------------

const CONSERVATIVE_FALLBACK_FLAGSHIP: ModelVendorPair = {
  vendor: "anthropic",
  model: "claude-opus-4-7",
  hotPercent: 0,         // Not measured for this class
  costPerHot: null,
  tier: "top",
  source: "conservative-fallback",
  rankingAgeDays: null,  // null signals: "no empirical data for this class"
};

// ---------------------------------------------------------------------------
// Per-class ranking tables
// ---------------------------------------------------------------------------

const CLASS_RANKINGS: Partial<Record<QueryClass, ModelVendorPair[]>> = {
  // R13-measured: substrate-grounded factual answering
  retrieval_only: R13_RANKINGS,
  reasoning_required: R13_RANKINGS, // R13 measured substrate-grounded reasoning too

  // NOT R13-measured: conservative flagship fallback (Opus, flagship reasoning)
  // TODO(R15): replace with empirical per-class ranking when R15 lands
  creative: [CONSERVATIVE_FALLBACK_FLAGSHIP],
  code_generation: [CONSERVATIVE_FALLBACK_FLAGSHIP],
  multi_step_planning: [CONSERVATIVE_FALLBACK_FLAGSHIP],

  // uncertain: no data — router falls back to Sonnet 4.6 conservative default
  uncertain: [],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return the ordered ranking for a query class, sorted by HOT% descending.
 * Returns an empty array for "uncertain" (router handles fallback).
 * Returns conservative-fallback entry for classes not yet measured by R13.
 */
export function getRankingForClass(queryClass: QueryClass): ModelVendorPair[] {
  return CLASS_RANKINGS[queryClass] ?? [];
}

/**
 * Return the top-ranked model/vendor pair for a query class.
 * Returns null for "uncertain" or empty ranking lists.
 */
export function getTopRankedModel(queryClass: QueryClass): ModelVendorPair | null {
  const ranking = getRankingForClass(queryClass);
  return ranking[0] ?? null;
}

/**
 * Return the cheapest model/vendor pair for a query class that meets a minimum
 * HOT% threshold. Used by cost-optimizing auto-route logic.
 */
export function getCheapestAboveThreshold(
  queryClass: QueryClass,
  minHotPercent: number,
): ModelVendorPair | null {
  const ranking = getRankingForClass(queryClass);
  const eligible = ranking.filter(
    (m) => m.source !== "conservative-fallback" && m.hotPercent >= minHotPercent,
  );
  if (eligible.length === 0) return null;

  // Sort by costPerHot ascending (null = unknown cost → deprioritize)
  const sorted = [...eligible].sort((a, b) => {
    if (a.costPerHot === null && b.costPerHot === null) return 0;
    if (a.costPerHot === null) return 1;
    if (b.costPerHot === null) return -1;
    return a.costPerHot - b.costPerHot;
  });
  return sorted[0];
}
