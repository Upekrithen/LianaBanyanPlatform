/**
 * Conductor Internal Router — Decision Layer for AI Cohort Task Assignment
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Routes a classified internal task to the optimal vendor/model pair based on:
 *   - Empirical internal ranking table (seeded from BP020/BP021 probe receipts)
 *   - Internal Conductor mode (auto / manual / canonical-lock)
 *   - Founder/agent override (per-task vendor or model preference)
 *
 * Three-mode toggle (mirrors member-query router.ts):
 *
 *   canonical-lock (default): Lock to canonical role assignments.
 *     Bishop=Opus, Knight=Sonnet, Pawn=Perplexity — no behavioral change.
 *     This is the safe default until auto-mode is explicitly enabled.
 *     Equivalent to member "vendor-lock" but preserving existing defaults.
 *
 *   auto: Conductor picks the optimal vendor/model per task class using
 *     the internal_rankings table. Falls back to canonical-lock assignment
 *     when no empirical data is available for the class + cost priority.
 *     *** Requires explicit Founder fire decision to activate in production. ***
 *
 *   manual: Founder or agent specifies vendor/model per task. Honored exactly.
 *     "Drive in stick-shift mode" per agent role.
 *
 * Inuka Pattern applied to internal cohort:
 *   - Don't suppress the flagship (restrictionist) — Opus stays available
 *   - Don't always reach for the flagship (maximalist) — use data, not reflex
 *   - DIRECT each task to the right model for that task class
 *
 * Safety discipline (DO NOT REMOVE):
 *   - canonical-lock mode = zero behavioral change from pre-Conductor defaults
 *   - auto mode rollout to production = Founder fire decision
 *   - Canonical defaults are PRESERVED even in auto mode when ranking data is
 *     absent or ambiguous — the router falls back to the canonical assignment.
 */

import type { VendorName } from "./adapters/types.js";
import type { ClassifiedInternalTask, AgentRole } from "./internal_classifier.js";
import type { InternalCostPriority } from "./internal_rankings.js";
import {
  getRankingForInternalClass,
  getCanonicalAssignment,
  getCheapestInternalAboveThreshold,
} from "./internal_rankings.js";
import { recordInternalRoute } from "./telemetry.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The three modes for internal AI cohort routing. */
export type InternalConductorMode = "auto" | "manual" | "canonical-lock";

export interface InternalOverride {
  vendor?: VendorName;
  model?: string;
}

export interface InternalRouterInputs {
  classified: ClassifiedInternalTask;
  mode: InternalConductorMode;
  /** Per-task manual override (for manual mode or Founder stick-shift). */
  override?: InternalOverride;
  /**
   * Cost priority passed from the session cost-cap setting.
   * null = no cost priority; router picks best by HOT% only.
   */
  costPriority?: InternalCostPriority;
}

export interface InternalRoutingDecision {
  vendor: VendorName;
  model: string;
  rationale: string;
  fallbackUsed: boolean;
  /** null = no empirical ranking data for this task class. */
  rankingAgeDays: number | null;
  /** Human-readable mode label for dashboard display. */
  modeLabel: string;
  /** true = routed to canonical assignment (canonical-lock or auto fallback). */
  canonicalAssignmentUsed: boolean;
}

// ---------------------------------------------------------------------------
// Minimum HOT% for auto cost-optimized routing (mirrors member router threshold)
// ---------------------------------------------------------------------------
const MIN_HOT_PERCENT_FOR_CHEAP_ROUTE = 85;

// ---------------------------------------------------------------------------
// Cost tier label helpers
// ---------------------------------------------------------------------------

function _costTierLabel(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("haiku") || lower.includes("flash") || lower.includes("mini")) {
    return "economy";
  }
  if (lower.includes("opus") || lower.includes("sonar-pro") || lower.includes("gpt-5-5")) {
    return "premium";
  }
  return "standard";
}

function _modeLabelFor(mode: InternalConductorMode): string {
  switch (mode) {
    case "canonical-lock": return "canonical-lock (default gear)";
    case "auto":           return "auto (conductor-optimized gear)";
    case "manual":         return "manual (stick-shift gear)";
  }
}

// ---------------------------------------------------------------------------
// Core routing function
// ---------------------------------------------------------------------------

/**
 * Route a classified internal task to a vendor/model pair.
 *
 * Decision tree (priority order):
 *   1. canonical-lock mode → use canonical assignment for the task's agent role
 *   2. manual mode + override → honor exactly
 *   3. auto mode + ranking available → pick optimal from internal_rankings
 *   4. auto mode + no ranking (stub/absent) → fall back to canonical assignment
 */
export function routeInternal(inputs: InternalRouterInputs): InternalRoutingDecision {
  const decision = _routeInternal(inputs);

  // Fire-and-forget internal telemetry (non-fatal)
  recordInternalRoute({
    ts: Date.now(),
    vendor: decision.vendor,
    model: decision.model,
    taskClass: inputs.classified.class,
    agentRole: inputs.classified.role,
    mode: inputs.mode,
    fallbackUsed: decision.fallbackUsed,
    canonicalAssignmentUsed: decision.canonicalAssignmentUsed,
  });

  return decision;
}

function _routeInternal(inputs: InternalRouterInputs): InternalRoutingDecision {
  const { classified, mode, override, costPriority } = inputs;
  const modeLabel = _modeLabelFor(mode);

  // ── Mode: canonical-lock ──────────────────────────────────────────────────
  // The safe default. Preserves Bishop=Opus / Knight=Sonnet / Pawn=Perplexity
  // exactly. No ranking data consulted; no behavioral change.
  if (mode === "canonical-lock") {
    const canonical = getCanonicalAssignment(classified.role);
    return {
      vendor: canonical.vendor,
      model: canonical.model,
      rationale:
        `Canonical-lock: ${classified.role} → ${canonical.vendor}/${canonical.model} ` +
        `(default gear — no change from pre-Conductor assignment).`,
      fallbackUsed: false,
      rankingAgeDays: null,
      modeLabel,
      canonicalAssignmentUsed: true,
    };
  }

  // ── Mode: manual ─────────────────────────────────────────────────────────
  // Founder or agent specifies vendor/model explicitly. Honored exactly.
  if (mode === "manual") {
    if (override?.vendor || override?.model) {
      const canonical = getCanonicalAssignment(classified.role);
      const manualVendor: VendorName = override.vendor ?? canonical.vendor;
      const manualModel = override.model ?? canonical.model;
      return {
        vendor: manualVendor,
        model: manualModel,
        rationale:
          `Manual override: ${classified.role}/${classified.class} → ` +
          `${manualVendor}/${manualModel} (stick-shift — Founder/agent-selected gear).`,
        fallbackUsed: false,
        rankingAgeDays: null,
        modeLabel,
        canonicalAssignmentUsed: false,
      };
    }
    // manual mode with no override → fall through to auto logic
  }

  // ── Mode: auto (or manual with no override) ───────────────────────────────
  // Consult internal_rankings. Falls back to canonical assignment when no
  // empirical data is available for this task class.

  const ranking = getRankingForInternalClass(classified.class, costPriority ?? null);

  if (ranking.length === 0) {
    return _canonicalFallback(classified.role, modeLabel, "no ranking data for task class");
  }

  const topRanked = ranking[0];

  // Only depart from canonical if the top-ranked entry is NOT a canonical-default
  // or if it genuinely improves on canonical (higher hotPercent + known cost).
  const canonical = getCanonicalAssignment(classified.role);

  if (topRanked.source === "canonical-default") {
    // Auto mode agrees with canonical → use it
    return {
      vendor: topRanked.vendor,
      model: topRanked.model,
      rationale:
        `Auto-routed: ${classified.class} → ${topRanked.vendor}/${topRanked.model} ` +
        `(HOT%=${topRanked.hotPercent}, top-ranked; agrees with canonical assignment, premium gear).`,
      fallbackUsed: false,
      rankingAgeDays: topRanked.rankingAgeDays,
      modeLabel,
      canonicalAssignmentUsed: true,
    };
  }

  // Try cost-optimized routing first (mirrors member router pattern)
  const cheapOptimal = getCheapestInternalAboveThreshold(
    classified.class,
    MIN_HOT_PERCENT_FOR_CHEAP_ROUTE,
    costPriority ?? null,
  );

  if (cheapOptimal) {
    return {
      vendor: cheapOptimal.vendor,
      model: cheapOptimal.model,
      rationale:
        `Auto-routed (economy): ${classified.class} → ${cheapOptimal.vendor}/${cheapOptimal.model} ` +
        `(HOT%=${cheapOptimal.hotPercent}, cost-per-task=${cheapOptimal.costPerTask != null ? "$" + cheapOptimal.costPerTask.toFixed(4) : "TBD"}, ` +
        `economy gear — automatic transmission engaged).`,
      fallbackUsed: false,
      rankingAgeDays: cheapOptimal.rankingAgeDays,
      modeLabel,
      canonicalAssignmentUsed:
        cheapOptimal.vendor === canonical.vendor && cheapOptimal.model === canonical.model,
    };
  }

  // No cheap option above threshold → top-ranked
  return {
    vendor: topRanked.vendor,
    model: topRanked.model,
    rationale:
      `Auto-routed (premium): ${classified.class} → ${topRanked.vendor}/${topRanked.model} ` +
      `(HOT%=${topRanked.hotPercent}, top-ranked for task class, premium gear).`,
    fallbackUsed: false,
    rankingAgeDays: topRanked.rankingAgeDays,
    modeLabel,
    canonicalAssignmentUsed:
      topRanked.vendor === canonical.vendor && topRanked.model === canonical.model,
  };
}

function _canonicalFallback(
  role: AgentRole,
  modeLabel: string,
  reason: string,
): InternalRoutingDecision {
  const canonical = getCanonicalAssignment(role);
  return {
    vendor: canonical.vendor,
    model: canonical.model,
    rationale:
      `Auto-fallback to canonical assignment for ${role}: ` +
      `${canonical.vendor}/${canonical.model} (${reason}; conservative default gear).`,
    fallbackUsed: true,
    rankingAgeDays: null,
    modeLabel,
    canonicalAssignmentUsed: true,
  };
}
