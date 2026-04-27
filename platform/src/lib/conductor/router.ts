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

import type { ClassifiedQuery } from "./classifier.js";
import type { VendorName } from "./adapters/types.js";
import {
  getRankingForClass,
  getDemotedVendorsForCategory,
  getR11CategoryHot,
} from "./rankings.js";

// ─── K524 Phase B: Conductor scribe_log (Option β — direct JSONL, non-fatal) ──
// Privacy guarantee: raw query is NEVER logged; SHA-256 hash only.
// Runs only in Node.js environments (silently skips in browser builds).
async function _logConductorDecision(
  rawQuery: string,
  queryClass: string,
  vendor: string,
  model: string,
  mode: string,
  rankingBasis: string,
): Promise<void> {
  try {
    if (typeof process === "undefined" || !process.versions?.node) return;

    const { createHash } = await import("node:crypto");
    const { appendFileSync, mkdirSync, existsSync } = await import("node:fs");
    const { resolve, dirname } = await import("node:path");

    const stitchpunksDir = process.env.LIBRARIAN_STITCHPUNKS_DIR
      ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
      : null;

    if (!stitchpunksDir) return; // No path configured; skip logging silently

    const conductorPath = resolve(stitchpunksDir, "scribes", "scribe_Conductor.jsonl");
    const parentDir = dirname(conductorPath);
    if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true });

    const queryHash = createHash("sha256").update(rawQuery).digest("hex");
    const record = {
      query_hash: queryHash,
      query_class: queryClass,
      vendor,
      model,
      mode,
      ranking_basis: rankingBasis,
      ts: new Date().toISOString(),
    };

    appendFileSync(conductorPath, JSON.stringify(record) + "\n", "utf-8");
  } catch {
    // Non-fatal: router decisions must never fail because the log write failed
  }
}


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
  categoryPriorApplied: boolean;  // true if R11 domain-category prior filtered the ranking
  categoryPriorDetail: string | null; // Summary of category prior action (e.g., demoted vendors)
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

// Minimum domain confidence to apply R11 category-aware priors.
// Below this threshold, domain is treated as undetected (priors not applied).
const DOMAIN_CONFIDENCE_FOR_PRIOR = 0.5;

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
  const decision = _route(inputs);

  // K524 Phase B: fire-and-forget Conductor scribe_log (Option β, non-fatal)
  void _logConductorDecision(
    classified.query,
    classified.class,
    decision.vendor,
    decision.model,
    mode,
    decision.rationale.split("(")[0].trim(),
  );

  return decision;
}

function _route(inputs: RouterInputs): RoutingDecision {
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
      categoryPriorApplied: false,
      categoryPriorDetail: null,
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
        categoryPriorApplied: false,
        categoryPriorDetail: null,
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
      categoryPriorApplied: false,
      categoryPriorDetail: null,
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
      categoryPriorApplied: false,
      categoryPriorDetail: null,
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
      categoryPriorApplied: false,
      categoryPriorDetail: null,
    };
  }

  // ── R11 Category-aware priors ──────────────────────────────────────────────
  // When the classifier detected an LB domain category with sufficient confidence,
  // use R11 per-category HOT% data to filter out vendors that underperform for
  // this domain BEFORE applying R13 task-class ranking.
  //
  // This is the Inuka Pattern at the domain level: don't blindly pick the cheapest
  // model when R11 empirical data says it will fail 78% of the time on this domain.
  //
  // Demote threshold: 60% HOT. At this threshold:
  //   - Gemini is demoted for: economic_governance (22%), architecture_mechanics (50%),
  //     member_journey (50%), canonical_statistics (56%) — all below 60%
  //   - Claude Sonnet is demoted for: member_journey (50%)
  //   - No vendor is demoted for historical_precedent or regulatory_compliance
  //     (all above 60% on those categories)

  let effectiveRanking = ranking;
  let categoryPriorApplied = false;
  let categoryPriorDetail: string | null = null;

  const domainCat = classified.domainCategory;
  const domainConf = classified.domainConfidence ?? 0;

  if (domainCat !== null && domainConf >= DOMAIN_CONFIDENCE_FOR_PRIOR) {
    const demoted = getDemotedVendorsForCategory(domainCat);

    if (demoted.length > 0) {
      const demotedVendors = new Set(demoted.map((d) => d.vendor));
      const filtered = ranking.filter((m) => !demotedVendors.has(m.vendor));

      if (filtered.length > 0) {
        // Only apply the filter if it doesn't eliminate ALL candidates
        effectiveRanking = filtered;
        categoryPriorApplied = true;

        const demoteDetails = demoted
          .map((d) => {
            const r11Hot = getR11CategoryHot(d.vendor, domainCat);
            return `${d.vendor} (R11 ${domainCat} HOT%=${r11Hot ?? "?"}%)`;
          })
          .join(", ");
        categoryPriorDetail =
          `R11 domain prior '${domainCat}' (conf=${domainConf.toFixed(2)}): ` +
          `de-ranked ${demoteDetails}`;
      }
    }
  }

  // R13-measured class: try cost-optimized routing first
  // Use the category-filtered ranking if priors applied; otherwise full ranking.
  const cheapOptimal = _getCheapestFromList(effectiveRanking, MIN_HOT_PERCENT_FOR_CHEAP_ROUTE);

  if (cheapOptimal) {
    return {
      vendor: cheapOptimal.vendor,
      model: cheapOptimal.model,
      rationale:
        `Auto-routed to ${cheapOptimal.vendor}/${cheapOptimal.model} ` +
        `(HOT%=${cheapOptimal.hotPercent}%, cost-per-HOT=${cheapOptimal.costPerHot != null ? "$" + cheapOptimal.costPerHot.toFixed(4) : "TBD"}, ` +
        `economy gear — automatic transmission engaged).`,
      fallbackUsed: false,
      rankingAgeDays: effectiveRanking[0]?.rankingAgeDays ?? null,
      costTierLabel: _costTierLabel(cheapOptimal.model),
      categoryPriorApplied,
      categoryPriorDetail,
    };
  }

  // No cheap option above threshold → use top-ranked (highest accuracy) from effective list
  const effectiveTop = effectiveRanking[0];
  return {
    vendor: effectiveTop.vendor,
    model: effectiveTop.model,
    rationale:
      `Auto-routed to ${effectiveTop.vendor}/${effectiveTop.model} ` +
      `(HOT%=${effectiveTop.hotPercent}%, top-ranked for '${classified.class}', premium gear).`,
    fallbackUsed: false,
    rankingAgeDays: effectiveTop.rankingAgeDays,
    costTierLabel: _costTierLabel(effectiveTop.model),
    categoryPriorApplied,
    categoryPriorDetail,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

import type { ModelVendorPair } from "./rankings.js";

/**
 * Return the cheapest model above a HOT% threshold from an arbitrary list.
 * Mirrors getCheapestAboveThreshold() but operates on a pre-filtered list.
 */
function _getCheapestFromList(
  list: ModelVendorPair[],
  minHotPercent: number,
): ModelVendorPair | null {
  const eligible = list.filter(
    (m) => m.source !== "conservative-fallback" && m.hotPercent >= minHotPercent,
  );
  if (eligible.length === 0) return null;

  const sorted = [...eligible].sort((a, b) => {
    if (a.costPerHot === null && b.costPerHot === null) return 0;
    if (a.costPerHot === null) return 1;
    if (b.costPerHot === null) return -1;
    return a.costPerHot - b.costPerHot;
  });
  return sorted[0];
}
