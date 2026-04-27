/**
 * Conductor Rankings — Dual-Dimension Hydrated Ranking Table
 * K446 · Phase 3 · B129 hydration
 *
 * TWO empirical sources:
 *
 * R13 (K499, 2026-04-25) — model-performance WITH LB Cathedral attached
 *   Source: REPORT_KNIGHT_K499_B123_R13_CROSS_VENDOR_BENCHMARK.md
 *   Commit: v-r13-cross-vendor-benchmark-K499
 *   Measures: substrate-grounded factual answering, 8 models × 2 conditions × 50 questions
 *   Mean lift: +86.2pp (R10 baseline +86.1pp — stable across 3 generations, 4 vendors)
 *   Cost-per-HOT spread: 21.6× within Anthropic; 78× across vendors ($0.0040 Gemini → $0.3140 Opus)
 *
 * R11 (K444/B129, 2026-04-27) — vendor-native memory product comparison
 *   Source: REPORT_KNIGHT_K444_B129_R11_CROSS_VENDOR_MEMORY_BENCHMARK.md
 *   Commit: ec6073e
 *   Measures: 5 vendor-native memory products × 6 domain categories × 50 questions (K471 sealed bank)
 *   Key finding: Gemini 2.5 Pro only 22% HOT on economic_governance, 50% on member_journey
 *   Key finding: Perplexity Sonar-Pro 89–100% HOT across all domain categories
 *   Architecture: corpus-in-prompt (vendor-native) vs indexed retrieval (LB Cathedral)
 *
 * Routing architecture:
 *   R13 → primary task-class ranking (which model performs best overall WITH Cathedral)
 *   R11 → category-aware prior (which vendor to avoid for specific LB domain questions)
 *   When both fire: R11 domain prior narrows the candidate set BEFORE R13 ranking applies.
 *
 * Architecture note:
 *   This file is the ONLY place ranking data is hand-edited.
 *   router.ts calls getRankingForClass() + getDemotedVendorsForCategory() to route.
 *   When R15 lands, add entries to the R15-measured classes; remove conservative-fallback entries.
 */

import type { QueryClass, LbDomainCategory } from "./classifier.js";
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
  source: "R13" | "R11" | "R15" | "stub" | "conservative-fallback";
  rankingAgeDays: number | null; // null = no empirical data for this class
}

// ---------------------------------------------------------------------------
// R11 per-category vendor results
// R11 measured vendor-native memory products (corpus-in-prompt) across 6 LB
// domain categories on the sealed K471 question bank (50 questions).
// ---------------------------------------------------------------------------

export interface R11CategoryResult {
  vendor: VendorName;
  /** Exact model used for the vendor-native condition */
  model: string;
  /** Domain category this result applies to */
  category: LbDomainCategory;
  /** HOT% for this vendor × category pairing (0–100) */
  hotPercent: number;
  /** Sample size (number of questions in this category) */
  n: number;
  source: "R11";
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
// R11 category-level data
// Source: K444/B129, 2026-04-27. Conditions: vendor-native memory products
// (corpus in system prompt). 50 questions, 6 LB domain categories.
//
// Key routing priors:
//  - Gemini 2.5 Pro: 22% HOT on economic_governance — DO NOT ROUTE there for
//    governance/economics queries when alternatives exist
//  - Gemini 2.5 Pro: 50% HOT on member_journey — below acceptable threshold
//  - Claude Projects Sonnet: 50% HOT on member_journey — de-rank for that domain
//  - Perplexity Sonar-Pro: 89–100% across all categories — always safe choice
//  - ChatGPT / Claude Opus: 62–100% across categories — generally safe
// ---------------------------------------------------------------------------

const R11_CATEGORY_TABLE: R11CategoryResult[] = [
  // ── architecture_mechanics ──────────────────────────────────────────────
  { vendor: "openai",       model: "gpt-4o",            category: "architecture_mechanics", hotPercent: 100, n: 5,  source: "R11" },
  { vendor: "anthropic",    model: "claude-opus-4-7",   category: "architecture_mechanics", hotPercent: 100, n: 16, source: "R11" },
  { vendor: "anthropic",    model: "claude-sonnet-4-6", category: "architecture_mechanics", hotPercent: 88,  n: 16, source: "R11" },
  { vendor: "perplexity",   model: "sonar-pro",         category: "architecture_mechanics", hotPercent: 100, n: 16, source: "R11" },
  { vendor: "google",       model: "gemini-2-5-pro",    category: "architecture_mechanics", hotPercent: 50,  n: 16, source: "R11" },

  // ── canonical_statistics ────────────────────────────────────────────────
  { vendor: "openai",       model: "gpt-4o",            category: "canonical_statistics",   hotPercent: 100, n: 5,  source: "R11" },
  { vendor: "anthropic",    model: "claude-opus-4-7",   category: "canonical_statistics",   hotPercent: 100, n: 18, source: "R11" },
  { vendor: "anthropic",    model: "claude-sonnet-4-6", category: "canonical_statistics",   hotPercent: 100, n: 18, source: "R11" },
  { vendor: "perplexity",   model: "sonar-pro",         category: "canonical_statistics",   hotPercent: 100, n: 18, source: "R11" },
  { vendor: "google",       model: "gemini-2-5-pro",    category: "canonical_statistics",   hotPercent: 56,  n: 18, source: "R11" },

  // ── economic_governance — Gemini's worst category (22%) ─────────────────
  { vendor: "openai",       model: "gpt-4o",            category: "economic_governance",    hotPercent: 100, n: 8,  source: "R11" },
  { vendor: "anthropic",    model: "claude-opus-4-7",   category: "economic_governance",    hotPercent: 89,  n: 18, source: "R11" },
  { vendor: "anthropic",    model: "claude-sonnet-4-6", category: "economic_governance",    hotPercent: 89,  n: 18, source: "R11" },
  { vendor: "perplexity",   model: "sonar-pro",         category: "economic_governance",    hotPercent: 89,  n: 18, source: "R11" },
  { vendor: "google",       model: "gemini-2-5-pro",    category: "economic_governance",    hotPercent: 22,  n: 18, source: "R11" },

  // ── historical_precedent ─────────────────────────────────────────────────
  { vendor: "openai",       model: "gpt-4o",            category: "historical_precedent",   hotPercent: 100, n: 8,  source: "R11" },
  { vendor: "anthropic",    model: "claude-opus-4-7",   category: "historical_precedent",   hotPercent: 100, n: 16, source: "R11" },
  { vendor: "anthropic",    model: "claude-sonnet-4-6", category: "historical_precedent",   hotPercent: 100, n: 16, source: "R11" },
  { vendor: "perplexity",   model: "sonar-pro",         category: "historical_precedent",   hotPercent: 100, n: 16, source: "R11" },
  { vendor: "google",       model: "gemini-2-5-pro",    category: "historical_precedent",   hotPercent: 62,  n: 16, source: "R11" },

  // ── member_journey — Claude Sonnet and Gemini both weak (50%) ───────────
  { vendor: "openai",       model: "gpt-4o",            category: "member_journey",         hotPercent: 100, n: 5,  source: "R11" },
  { vendor: "anthropic",    model: "claude-opus-4-7",   category: "member_journey",         hotPercent: 62,  n: 16, source: "R11" },
  { vendor: "anthropic",    model: "claude-sonnet-4-6", category: "member_journey",         hotPercent: 50,  n: 16, source: "R11" },
  { vendor: "perplexity",   model: "sonar-pro",         category: "member_journey",         hotPercent: 100, n: 16, source: "R11" },
  { vendor: "google",       model: "gemini-2-5-pro",    category: "member_journey",         hotPercent: 50,  n: 16, source: "R11" },

  // ── regulatory_compliance ────────────────────────────────────────────────
  { vendor: "openai",       model: "gpt-4o",            category: "regulatory_compliance",  hotPercent: 100, n: 8,  source: "R11" },
  { vendor: "anthropic",    model: "claude-opus-4-7",   category: "regulatory_compliance",  hotPercent: 100, n: 16, source: "R11" },
  { vendor: "anthropic",    model: "claude-sonnet-4-6", category: "regulatory_compliance",  hotPercent: 88,  n: 16, source: "R11" },
  { vendor: "perplexity",   model: "sonar-pro",         category: "regulatory_compliance",  hotPercent: 100, n: 16, source: "R11" },
  { vendor: "google",       model: "gemini-2-5-pro",    category: "regulatory_compliance",  hotPercent: 62,  n: 16, source: "R11" },
];

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

// ---------------------------------------------------------------------------
// R11 category-aware API
// ---------------------------------------------------------------------------

/**
 * Return the R11 HOT% for a specific vendor × domain category pairing.
 * Returns null if no R11 data exists for this vendor+category combination.
 */
export function getR11CategoryHot(
  vendor: VendorName,
  category: LbDomainCategory,
): number | null {
  const result = R11_CATEGORY_TABLE.find(
    (r) => r.vendor === vendor && r.category === category,
  );
  return result?.hotPercent ?? null;
}

/**
 * Return all R11 results for a domain category, sorted by HOT% descending.
 * Used by the router to assess vendor quality for a specific LB domain.
 */
export function getR11CategoryRanking(category: LbDomainCategory): R11CategoryResult[] {
  return R11_CATEGORY_TABLE
    .filter((r) => r.category === category)
    .sort((a, b) => b.hotPercent - a.hotPercent);
}

/**
 * Return the set of vendors whose R11 HOT% for this domain category is below
 * `demoteThreshold`. The router uses this to exclude weak vendors before
 * applying the R13 task-class ranking.
 *
 * Threshold rationale:
 *   - < 60%: definitely avoid (Gemini on economic_governance: 22%)
 *   - Default 60% chosen to catch Gemini's worst cases without over-pruning.
 */
export function getDemotedVendorsForCategory(
  category: LbDomainCategory,
  demoteThreshold = 60,
): Array<{ vendor: VendorName; hotPercent: number }> {
  return R11_CATEGORY_TABLE
    .filter((r) => r.category === category && r.hotPercent < demoteThreshold)
    .map((r) => ({ vendor: r.vendor, hotPercent: r.hotPercent }));
}
