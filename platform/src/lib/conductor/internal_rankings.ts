/**
 * Conductor Internal Rankings — Dual-Priority Internal Cohort Table
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Two routing axes:
 *
 *   CANONICAL defaults (canonical-lock mode — no behavioral change):
 *     Bishop → Anthropic / claude-opus-4-7  (Opus)
 *     Knight → Anthropic / claude-sonnet-4-6 (Sonnet)
 *     Pawn   → Perplexity / sonar-pro
 *
 *   EMPIRICAL rankings (auto mode — replaces canonical only when data says so):
 *     Seeded from BP020 Bushel 2 scaling-curve receipt +
 *     BP021 Sonnet-on-both probe receipt + R13 baseline.
 *     When Recurring Diagnostic Bushel (weekly) runs, this file is
 *     hot-reloaded with updated empirical seeds.
 *
 * Cost-priority axis:
 *   Each InternalTaskClass × cost_priority (quality | balanced | economy) cell
 *   holds an ordered candidate list. auto mode picks the optimal cell for the
 *   current Conductor cost_priority setting.
 *
 * Schema note:
 *   InternalModelVendorPair extends the member-query ModelVendorPair shape with
 *   two additional fields: task_class and applicable_roles.
 *
 * THIS FILE is the ONLY place internal ranking data is hand-edited.
 * internal_router.ts calls getRankingForInternalClass() to route.
 * When the Recurring Diagnostic Bushel returns new probe data, add entries
 * under the empirical section and remove the corresponding "bp021-seed" stubs.
 */

import type { VendorName } from "./adapters/types.js";
import type { InternalTaskClass, AgentRole } from "./internal_classifier.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InternalCostPriority = "quality" | "balanced" | "economy";

export interface InternalModelVendorPair {
  vendor: VendorName;
  model: string;
  /** HOT% from empirical internal benchmark (0–100). 0 = unmeasured seed. */
  hotPercent: number;
  /** USD per correctly-completed internal task unit. null = not yet measured. */
  costPerTask: number | null;
  tier: "top" | "mid" | "cheap";
  source: "bp021-seed" | "probe-receipt" | "recurring-diagnostic" | "canonical-default";
  /** Null = no empirical data yet for this class. */
  rankingAgeDays: number | null;
  /** Applicable cost priorities for this entry. */
  costPriorities: InternalCostPriority[];
}

// ---------------------------------------------------------------------------
// Canonical defaults (canonical-lock mode — immutable baseline)
// ---------------------------------------------------------------------------

/**
 * CANONICAL_ROLE_ASSIGNMENTS is the immutable source of truth for canonical-lock mode.
 * DO NOT modify these assignments without a Founder fire decision.
 * The internal router reads this map when mode === "canonical-lock".
 */
export const CANONICAL_ROLE_ASSIGNMENTS: Record<
  AgentRole,
  { vendor: VendorName; model: string }
> = {
  bishop: { vendor: "anthropic", model: "claude-opus-4-7"   },
  knight: { vendor: "anthropic", model: "claude-sonnet-4-6" },
  pawn:   { vendor: "perplexity", model: "sonar-pro"        },
};

// ---------------------------------------------------------------------------
// BP021 seed rankings — initial empirical foundation
//
// Sources:
//   - BP020 Bushel 2 scaling-curve receipt: substrate-IS-the-lift finding
//     (Haiku 4.5 with Cathedral = 90% HOT; near Opus baseline level)
//   - BP021 Sonnet-on-both probe: informs cross-class Sonnet vs Opus routing
//   - R13 (K499, 2026-04-25): 8-model cross-vendor benchmark
//
// HOT% seeds are conservative estimates; replace with hard probe receipts
// when Recurring Diagnostic Bushel returns.
// ---------------------------------------------------------------------------

const BISHOP_CANON_RANKINGS: InternalModelVendorPair[] = [
  {
    vendor: "anthropic",
    model: "claude-opus-4-7",
    hotPercent: 95,
    costPerTask: null,
    tier: "top",
    source: "canonical-default",
    rankingAgeDays: null,
    costPriorities: ["quality"],
  },
  {
    vendor: "anthropic",
    model: "claude-sonnet-4-6",
    hotPercent: 82,
    costPerTask: null,
    tier: "mid",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["balanced", "economy"],
  },
];

const BISHOP_FOREMAN_RANKINGS: InternalModelVendorPair[] = [
  {
    vendor: "anthropic",
    model: "claude-opus-4-7",
    hotPercent: 93,
    costPerTask: null,
    tier: "top",
    source: "canonical-default",
    rankingAgeDays: null,
    costPriorities: ["quality"],
  },
  {
    vendor: "anthropic",
    model: "claude-sonnet-4-6",
    hotPercent: 88,
    costPerTask: null,
    tier: "mid",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["balanced", "economy"],
  },
];

const KNIGHT_AUTHORING_RANKINGS: InternalModelVendorPair[] = [
  {
    vendor: "anthropic",
    model: "claude-sonnet-4-6",
    hotPercent: 90,
    costPerTask: null,
    tier: "mid",
    source: "canonical-default",
    rankingAgeDays: null,
    costPriorities: ["quality", "balanced"],
  },
  {
    vendor: "anthropic",
    model: "claude-opus-4-7",
    hotPercent: 92,
    costPerTask: null,
    tier: "top",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["quality"],
  },
  {
    vendor: "anthropic",
    model: "claude-haiku-4-5",
    hotPercent: 72,
    costPerTask: null,
    tier: "cheap",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["economy"],
  },
];

const KNIGHT_AUDIT_RANKINGS: InternalModelVendorPair[] = [
  {
    vendor: "anthropic",
    model: "claude-sonnet-4-6",
    hotPercent: 91,
    costPerTask: null,
    tier: "mid",
    source: "canonical-default",
    rankingAgeDays: null,
    costPriorities: ["quality", "balanced"],
  },
  {
    vendor: "anthropic",
    model: "claude-haiku-4-5",
    hotPercent: 85,
    costPerTask: null,
    tier: "cheap",
    source: "probe-receipt",
    rankingAgeDays: 8,
    costPriorities: ["economy"],
  },
];

const KNIGHT_IMPL_RANKINGS: InternalModelVendorPair[] = [
  {
    vendor: "anthropic",
    model: "claude-sonnet-4-6",
    hotPercent: 93,
    costPerTask: null,
    tier: "mid",
    source: "canonical-default",
    rankingAgeDays: null,
    costPriorities: ["quality", "balanced"],
  },
  {
    vendor: "anthropic",
    model: "claude-haiku-4-5",
    hotPercent: 80,
    costPerTask: null,
    tier: "cheap",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["economy"],
  },
];

const PAWN_RESEARCH_RANKINGS: InternalModelVendorPair[] = [
  {
    vendor: "perplexity",
    model: "sonar-pro",
    hotPercent: 96,
    costPerTask: null,
    tier: "top",
    source: "canonical-default",
    rankingAgeDays: null,
    costPriorities: ["quality", "balanced", "economy"],
  },
  {
    vendor: "openai",
    model: "gpt-5-5",
    hotPercent: 88,
    costPerTask: null,
    tier: "top",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["quality"],
  },
];

const PAWN_VALIDATION_RANKINGS: InternalModelVendorPair[] = [
  {
    vendor: "perplexity",
    model: "sonar-pro",
    hotPercent: 94,
    costPerTask: null,
    tier: "top",
    source: "canonical-default",
    rankingAgeDays: null,
    costPriorities: ["quality", "balanced"],
  },
  {
    vendor: "anthropic",
    model: "claude-opus-4-7",
    hotPercent: 96,
    costPerTask: null,
    tier: "top",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["quality"],
  },
  {
    vendor: "anthropic",
    model: "claude-sonnet-4-6",
    hotPercent: 88,
    costPerTask: null,
    tier: "mid",
    source: "bp021-seed",
    rankingAgeDays: null,
    costPriorities: ["balanced", "economy"],
  },
];

// ---------------------------------------------------------------------------
// Ranking map
// ---------------------------------------------------------------------------

const INTERNAL_CLASS_RANKINGS: Record<InternalTaskClass, InternalModelVendorPair[]> = {
  bishop_canon_substrate_keeping: BISHOP_CANON_RANKINGS,
  bishop_foreman_coordination:    BISHOP_FOREMAN_RANKINGS,
  knight_authoring:               KNIGHT_AUTHORING_RANKINGS,
  knight_audit:                   KNIGHT_AUDIT_RANKINGS,
  knight_implementation:          KNIGHT_IMPL_RANKINGS,
  pawn_research:                  PAWN_RESEARCH_RANKINGS,
  pawn_validation:                PAWN_VALIDATION_RANKINGS,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return the ordered ranking for an internal task class, optionally filtered
 * to entries applicable for the given cost priority.
 *
 * Sorted by hotPercent descending. Returns full list when costPriority is null.
 */
export function getRankingForInternalClass(
  taskClass: InternalTaskClass,
  costPriority: InternalCostPriority | null = null,
): InternalModelVendorPair[] {
  const full = INTERNAL_CLASS_RANKINGS[taskClass] ?? [];
  const filtered = costPriority
    ? full.filter((m) => m.costPriorities.includes(costPriority))
    : full;
  return [...filtered].sort((a, b) => b.hotPercent - a.hotPercent);
}

/**
 * Return the canonical (canonical-lock) model/vendor for a given agent role.
 * This is the immutable default — auto mode may override it; canonical-lock
 * mode always returns this entry.
 */
export function getCanonicalAssignment(
  role: AgentRole,
): { vendor: VendorName; model: string } {
  return CANONICAL_ROLE_ASSIGNMENTS[role];
}

/**
 * Return the cheapest entry above a HOT% threshold for a class + cost priority.
 * Used by auto-mode cost-optimized routing.
 */
export function getCheapestInternalAboveThreshold(
  taskClass: InternalTaskClass,
  minHotPercent: number,
  costPriority: InternalCostPriority | null = null,
): InternalModelVendorPair | null {
  const ranking = getRankingForInternalClass(taskClass, costPriority);
  const eligible = ranking.filter(
    (m) =>
      m.source !== "canonical-default" &&
      m.hotPercent >= minHotPercent &&
      m.costPerTask !== null,
  );
  if (eligible.length === 0) return null;
  return [...eligible].sort((a, b) => (a.costPerTask ?? Infinity) - (b.costPerTask ?? Infinity))[0];
}

/**
 * Inject a hot-reloaded ranking entry (called by the Recurring Diagnostic Bushel).
 * Adds or replaces the entry matching vendor+model for the given task class.
 * This is the hot-reload path — no server restart needed.
 */
export function injectRankingEntry(
  taskClass: InternalTaskClass,
  entry: InternalModelVendorPair,
): void {
  const list = INTERNAL_CLASS_RANKINGS[taskClass];
  const idx = list.findIndex((m) => m.vendor === entry.vendor && m.model === entry.model);
  if (idx >= 0) {
    list.splice(idx, 1, entry);
  } else {
    list.push(entry);
  }
}
