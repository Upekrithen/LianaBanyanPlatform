/**
 * MoneyPenny Priority Taxonomy — Bushel 82 / LB-STACK-0170
 *
 * Re-exports core types from ../types.ts and adds routing helpers:
 * priority ordering, interrupt-permission guards, and Kissaki rank assignment.
 */

export type {
  CallerClass,
  CallerIdentifier,
  CallerProfile,
  RoutingDecision,
  HoldHandle,
  KissakiRank,
  ISO8601,
  InboundChannel,
  RoutingOutcome,
} from "../types.js";

import type {
  CallerClass, KissakiRank, AvailabilityClass, CallerIdentifier, CallerProfile,
} from "../types.js";

/** Priority ordering: lower index = higher priority */
export const CLASS_PRIORITY_ORDER: CallerClass[] = [
  "WARREN_BUFFETT",
  "FAMILY",
  "COUNSEL",
  "MACKENZIE_SCOTT",
  "PRESS",
  "TALENTS_PRACTITIONER",
  "UNKNOWN",
  "INTERNAL_AI",
];

export function getClassPriority(c: CallerClass): number {
  const idx = CLASS_PRIORITY_ORDER.indexOf(c);
  return idx === -1 ? 99 : idx;
}

export function canInterruptDeepWork(c: CallerClass): boolean {
  return c === "WARREN_BUFFETT" || c === "FAMILY" || c === "COUNSEL";
}

export function requiresSubstantiveHold(c: CallerClass): boolean {
  return c === "MACKENZIE_SCOTT" || c === "PRESS" || c === "TALENTS_PRACTITIONER" || c === "UNKNOWN";
}

export function requiresHumanReview(c: CallerClass): boolean {
  return c === "UNKNOWN";
}

/** Maps caller class + role to the Kissaki rank of the agent assigned */
export function assignKissakiRank(c: CallerClass, role: string): KissakiRank {
  if (role === "triage") return "APPRENTICE";
  if (role === "compress") return "APPRENTICE";
  if (role === "resurrect") return "JOURNEYMAN";

  switch (c) {
    case "WARREN_BUFFETT":
    case "MACKENZIE_SCOTT":
      return role === "transition" ? "MASTER" : "JOURNEYMAN";
    case "FAMILY":
    case "COUNSEL":
      return "MASTER";
    case "PRESS":
    case "TALENTS_PRACTITIONER":
      return "JOURNEYMAN";
    case "UNKNOWN":
      return "APPRENTICE";
    case "INTERNAL_AI":
      return "JOURNEYMAN";
    default:
      return "APPRENTICE";
  }
}

/**
 * canInterrupt — checks if a caller class is allowed to interrupt the Founder
 * given the current availability state and family emergency flag.
 */
export function canInterrupt(
  c: CallerClass,
  availability: AvailabilityClass,
  isFamilyEmergency = false,
): boolean {
  if (availability === "SLEEP") {
    return (c === "FAMILY" && isFamilyEmergency) || c === "WARREN_BUFFETT";
  }
  if (availability === "OUT") return false;
  if (availability === "DEEP_WORK") return canInterruptDeepWork(c);
  if (availability === "FAMILY") return c === "WARREN_BUFFETT";
  if (availability === "COUNSEL") return c === "WARREN_BUFFETT";
  // OPEN_BLOCK: all except UNKNOWN get through (UNKNOWN flagged for human review)
  return c !== "UNKNOWN";
}

/**
 * kissakiRankForCaller — quick Kissaki rank lookup for a hold assignment
 * based only on caller class (role defaults to "hold").
 */
export function kissakiRankForCaller(c: CallerClass): KissakiRank {
  return assignKissakiRank(c, "hold");
}

/**
 * prepWindowMinutes — returns the substantive-prep window in minutes for
 * each caller class, or "HUMAN_REVIEW" for unknown callers.
 */
export function prepWindowMinutes(c: CallerClass): number | "HUMAN_REVIEW" {
  switch (c) {
    case "WARREN_BUFFETT": return 60;
    case "MACKENZIE_SCOTT": return 30;
    case "FAMILY": return 15;
    case "COUNSEL": return 30;
    case "PRESS": return 20;
    case "TALENTS_PRACTITIONER": return 10;
    case "INTERNAL_AI": return 0;
    case "UNKNOWN": return "HUMAN_REVIEW";
    default: return "HUMAN_REVIEW";
  }
}

/**
 * classifyCaller — wraps classifyCallerHeuristic for CallerIdentifier input.
 * If an override class is supplied, returns it immediately.
 */
export function classifyCaller(
  caller: CallerIdentifier,
  overrideClass?: CallerClass,
): CallerClass {
  if (overrideClass) return overrideClass;
  return classifyCallerHeuristic(
    caller.id + (caller.display_name ? ` ${caller.display_name}` : ""),
  );
}

/**
 * buildCallerProfile — constructs a CallerProfile for a CallerIdentifier.
 */
export function buildCallerProfile(
  caller: CallerIdentifier,
  history: string[] = [],
  overrideClass?: CallerClass,
): CallerProfile {
  const now = new Date().toISOString();
  return {
    class: classifyCaller(caller, overrideClass),
    identifier: caller,
    history,
    metadata: {
      first_contact: now,
      last_contact: now,
      interaction_count: history.length,
      substantive_summary: "",
    },
  };
}

/** Classify a raw identifier string into a CallerClass using known patterns */
export function classifyCallerHeuristic(
  identifier: string,
  knownContacts?: Map<string, CallerClass>,
): CallerClass {
  if (knownContacts) {
    const normalized = identifier.toLowerCase().trim();
    for (const [key, cls] of knownContacts) {
      if (normalized.includes(key.toLowerCase())) return cls;
    }
  }

  // Internal AI surfaces
  if (
    identifier.startsWith("AI:") ||
    identifier.includes("cursor") ||
    identifier.includes("claude") ||
    identifier.includes("bishop") ||
    identifier.includes("knight") ||
    identifier.includes("pawn") ||
    identifier.includes("rook")
  ) {
    return "INTERNAL_AI";
  }

  // Family domain heuristics
  if (identifier.includes("@family") || identifier.includes("jones")) {
    return "FAMILY";
  }

  // Legal counsel heuristics
  if (
    identifier.includes("counsel") ||
    identifier.includes("attorney") ||
    identifier.includes("harrity") ||
    identifier.includes("lloyd")
  ) {
    return "COUNSEL";
  }

  // Press heuristics
  if (
    identifier.includes("press") ||
    identifier.includes("media") ||
    identifier.includes("journalist") ||
    identifier.includes("reporter")
  ) {
    return "PRESS";
  }

  return "UNKNOWN";
}
