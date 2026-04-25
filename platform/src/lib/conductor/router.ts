/**
 * Conductor's Baton — Routing Decision Layer
 * K446a · Phase 1.3 · Innovation #2277
 *
 * Routes a classified query to the optimal vendor/model pair based on:
 *   - Empirical ranking table (R13, sourced from rankings.ts)
 *   - Conductor mode (auto / manual / vendor-lock)
 *   - Member override (per-query vendor or model preference)
 *
 * The Inuka Pattern operationalized:
 *   - Don't suppress the flagship (restrictionist)
 *   - Don't always reach for the flagship (maximalist)
 *   - DIRECT the system to the right model for the task
 *
 * Metaphor discipline:
 *   - Orchestra terms (conductor, section, instrument) → variable names, internal docs
 *   - Automatic-transmission terms (gear, drive, mode) → user-facing strings/logs
 *   - "#40 Always Offer What You Would Want" — the routing decision should be the one
 *     the member would have made if they had full knowledge.
 */

import type { ClassifiedQuery, QueryClass } from "./classifier.js";
import type { VendorName } from "./adapters/types.js";
import { getRankingForClass, getCheapestAboveThreshold } from "./rankings.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConductorMode = "auto" | "manual" | "vendor-lock";

export interface MemberOverride {
  vendor?: VendorName;
  model?: string;
}

export interface RouterInputs {
  classified: ClassifiedQuery;
  mode: ConductorMode;
  memberOverride?: MemberOverride;
}

export interface RoutingDecision {
  vendor: VendorName;
  model: string;
  rationale: string;
  fallbackUsed: boolean;
  rankingAgeDays: number | null;  // null = no empirical data for this class
  costTierLabel: string;          // Human-readable cost tier for member display
}

// ---------------------------------------------------------------------------
// Default models per vendor (used when vendor-lock specifies vendor but no model)
// ---------------------------------------------------------------------------

const DEFAULT_MODEL_PER_VENDOR: Record<VendorName, string> = {
  anthropic: "claude-sonnet-4-6",  // Conservative mid-tier default
  openai: "gpt-5-4-mini",
  google: "gemini-2-5-flash",
  perplexity: "sonar-pro",
};

// ---------------------------------------------------------------------------
// Conservative fallback (used when: no ranking data, uncertain class, etc.)
// #37 "Let your yea be yea, and your nay be nay" — when uncertain, the Baton
// emits a transparent fallback rather than guessing a ranking.
// ---------------------------------------------------------------------------

const CONSERVATIVE_FALLBACK_VENDOR: VendorName = "anthropic";
const CONSERVATIVE_FALLBACK_MODEL = "claude-sonnet-4-6";
const CONSERVATIVE_FALLBACK_RATIONALE =
  "No empirical ranking data available for this query class; " +
  "defaulting to Sonnet 4.6 (conservative mid-tier, automatic gear).";

// Minimum HOT% for cost-optimized auto-route (Route to cheapest above this threshold)
const MIN_HOT_PERCENT_FOR_CHEAP_ROUTE = 85;

// ---------------------------------------------------------------------------
// Cost tier label (for member-facing display)
// ---------------------------------------------------------------------------

function _costTierLabel(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("haiku") || lower.includes("flash") || lower.includes("mini")) {
    return "economy (lowest cost)";
  }
  if (lower.includes("opus") || lower.includes("sonar-pro") || lower.includes("gpt-5-5") || lower.includes("pro")) {
    return "premium (highest accuracy)";
  }
  return "standard";
}

// ---------------------------------------------------------------------------
// Core routing function
// ---------------------------------------------------------------------------

/**
 * Route a classified query to a vendor/model pair.
 *
 * Decision tree (in priority order):
 *   1. vendor-lock mode → lock to override.vendor, pick vendor's default model
 *   2. manual mode + override → honor exactly
 *   3. auto mode + ranking available → pick optimal from ranking
 *   4. auto mode + no ranking (stub/uncertain) → conservative Sonnet fallback
 */
export function route(inputs: RouterInputs): RoutingDecision {
  const { classified, mode, memberOverride } = inputs;

  // ── Mode: vendor-lock ──────────────────────────────────────────────────────
  // Member has pinned to a specific vendor (audit/regulatory use case).
  // "#29 This is Your World. Shape it, or Someone Else WILL." — vendor-lock IS
  // the active-shaping override the member retains.
  if (mode === "vendor-lock") {
    const lockVendor: VendorName = memberOverride?.vendor ?? CONSERVATIVE_FALLBACK_VENDOR;
    const lockModel = memberOverride?.model ?? DEFAULT_MODEL_PER_VENDOR[lockVendor];
    return {
      vendor: lockVendor,
      model: lockModel,
      rationale: `Vendor-locked to ${lockVendor} (fixed gear — member retains full control).`,
      fallbackUsed: false,
      rankingAgeDays: null,
      costTierLabel: _costTierLabel(lockModel),
    };
  }

  // ── Mode: manual ──────────────────────────────────────────────────────────
  // Member specifies vendor/model per-query.
  if (mode === "manual") {
    if (memberOverride?.vendor || memberOverride?.model) {
      const manualVendor: VendorName =
        memberOverride.vendor ?? CONSERVATIVE_FALLBACK_VENDOR;
      const manualModel =
        memberOverride.model ?? DEFAULT_MODEL_PER_VENDOR[manualVendor];
      return {
        vendor: manualVendor,
        model: manualModel,
        rationale: `Manual override: ${manualVendor}/${manualModel} (member-selected gear).`,
        fallbackUsed: false,
        rankingAgeDays: null,
        costTierLabel: _costTierLabel(manualModel),
      };
    }
    // manual mode with no override → fall through to auto logic
  }

  // ── Mode: auto (or manual with no override) ────────────────────────────────
  // "#22 I don't build escape tunnels. I build more arrows." — auto-route IS
  // the more-arrows posture: each ranking entry is an arrow, not a fallback.

  // uncertain class → conservative fallback immediately
  if (classified.class === "uncertain") {
    return {
      vendor: CONSERVATIVE_FALLBACK_VENDOR,
      model: CONSERVATIVE_FALLBACK_MODEL,
      rationale: CONSERVATIVE_FALLBACK_RATIONALE,
      fallbackUsed: true,
      rankingAgeDays: null,
      costTierLabel: _costTierLabel(CONSERVATIVE_FALLBACK_MODEL),
    };
  }

  const ranking = getRankingForClass(classified.class);

  // No ranking data (empty or stub) → conservative fallback
  if (ranking.length === 0) {
    return {
      vendor: CONSERVATIVE_FALLBACK_VENDOR,
      model: CONSERVATIVE_FALLBACK_MODEL,
      rationale: CONSERVATIVE_FALLBACK_RATIONALE,
      fallbackUsed: true,
      rankingAgeDays: null,
      costTierLabel: _costTierLabel(CONSERVATIVE_FALLBACK_MODEL),
    };
  }

  const topRanked = ranking[0];

  // Conservative-fallback source (unmeasured task class) → use the fallback entry directly
  // but still mark fallbackUsed=true so the member sees the rationale
  if (topRanked.source === "conservative-fallback") {
    return {
      vendor: topRanked.vendor,
      model: topRanked.model,
      rationale:
        `Query class '${classified.class}' has no R13 empirical data yet. ` +
        `Routing to ${topRanked.vendor}/${topRanked.model} (flagship conservative fallback until R15 lands).`,
      fallbackUsed: true,
      rankingAgeDays: null,
      costTierLabel: _costTierLabel(topRanked.model),
    };
  }

  // R13-measured class: try cost-optimized routing first
  // (cheapest model above MIN_HOT_PERCENT_FOR_CHEAP_ROUTE)
  const cheapOptimal = getCheapestAboveThreshold(
    classified.class,
    MIN_HOT_PERCENT_FOR_CHEAP_ROUTE,
  );

  if (cheapOptimal) {
    return {
      vendor: cheapOptimal.vendor,
      model: cheapOptimal.model,
      rationale:
        `Auto-routed to ${cheapOptimal.vendor}/${cheapOptimal.model} ` +
        `(HOT%=${cheapOptimal.hotPercent}%, cost-per-HOT=${cheapOptimal.costPerHot != null ? "$" + cheapOptimal.costPerHot.toFixed(4) : "TBD"}, ` +
        `economy gear — automatic transmission engaged).`,
      fallbackUsed: false,
      rankingAgeDays: topRanked.rankingAgeDays,
      costTierLabel: _costTierLabel(cheapOptimal.model),
    };
  }

  // No cheap option above threshold → use top-ranked (highest accuracy)
  return {
    vendor: topRanked.vendor,
    model: topRanked.model,
    rationale:
      `Auto-routed to ${topRanked.vendor}/${topRanked.model} ` +
      `(HOT%=${topRanked.hotPercent}%, top-ranked for '${classified.class}', premium gear).`,
    fallbackUsed: false,
    rankingAgeDays: topRanked.rankingAgeDays,
    costTierLabel: _costTierLabel(topRanked.model),
  };
}
