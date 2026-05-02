/**
 * Cohort-Class Scribe Access Enforcement — KN104 / BP016
 * =========================================================
 * Enforces per-cohort Scribe-access boundaries per the brittle-vs-fluid
 * librarian canon (KN102 dependency) and federation structural canon (BP016).
 *
 * Access tiers per BP016 Founder ratification:
 *   lone_wolf          → AGPL-baseline-only (R9/Landing/public-class); NO Scribe-trade
 *   pied_piper         → AGPL + limited Federation Library read-only; NO write-back
 *   federation_member  → Full Scribe-trade + write-back to shared library
 *   excalibur_class_subscriber → Curated Excalibur-slice access only (NOT full Scribe-trade)
 */

import type { CohortClass } from "./types.js";

// ─── Scribe Access Descriptor ─────────────────────────────────────────────

export interface ScribeAccessDescriptor {
  tier_label: string;
  can_read_agpl_baseline: boolean;
  can_read_federation_library: boolean;
  can_read_excalibur_slice: boolean;
  can_write_back_to_shared_library: boolean;
  can_trade_scribes: boolean;
  allowed_cathedrals: string[];    // which cathedral substrates may be queried
  access_note: string;
}

// ─── Access Rules per Cohort ──────────────────────────────────────────────

const ACCESS_RULES: Record<CohortClass, ScribeAccessDescriptor> = {
  lone_wolf: {
    tier_label: "Lone Wolf — AGPL baseline only",
    can_read_agpl_baseline: true,
    can_read_federation_library: false,
    can_read_excalibur_slice: false,
    can_write_back_to_shared_library: false,
    can_trade_scribes: false,
    allowed_cathedrals: ["bishop"],
    access_note: "R9 / Landing / public-class Scribes only. No cross-member Scribe-trade.",
  },
  pied_piper: {
    tier_label: "Pied Piper — AGPL + limited Federation read",
    can_read_agpl_baseline: true,
    can_read_federation_library: true,
    can_read_excalibur_slice: false,
    can_write_back_to_shared_library: false,
    can_trade_scribes: false,
    allowed_cathedrals: ["bishop", "knight"],
    access_note: "AGPL baseline + Federation Library read-only. No write-back, no Scribe-trade.",
  },
  federation_member: {
    tier_label: "Federation Member — full Scribe-trade",
    can_read_agpl_baseline: true,
    can_read_federation_library: true,
    can_read_excalibur_slice: false,
    can_write_back_to_shared_library: true,
    can_trade_scribes: true,
    allowed_cathedrals: ["bishop", "knight", "pawn"],
    access_note: "Full Scribe-trade + write-back to shared library. All three cathedrals accessible.",
  },
  excalibur_class_subscriber: {
    tier_label: "Excalibur Class — curated slice only",
    can_read_agpl_baseline: true,
    can_read_federation_library: false,
    can_read_excalibur_slice: true,
    can_write_back_to_shared_library: false,
    can_trade_scribes: false,
    allowed_cathedrals: ["bishop", "knight"],
    access_note: "Curated Excalibur-slice access only. NOT full Scribe-trade per BP016 anti-extraction structural form.",
  },
};

// ─── Enforcement API ──────────────────────────────────────────────────────

/** Returns the access descriptor for a given cohort class. */
export function getScribeAccessDescriptor(cohortClass: CohortClass): ScribeAccessDescriptor {
  return ACCESS_RULES[cohortClass];
}

/**
 * Filters requested cathedrals to only those permitted for the cohort.
 * Returns the intersection of requested + allowed.
 */
export function enforceAllowedCathedrals(
  requested: string[],
  cohortClass: CohortClass,
): { allowed: string[]; blocked: string[] } {
  const descriptor = ACCESS_RULES[cohortClass];
  const allowed = requested.filter(c => descriptor.allowed_cathedrals.includes(c));
  const blocked = requested.filter(c => !descriptor.allowed_cathedrals.includes(c));
  return { allowed, blocked };
}

/**
 * Checks whether a given cohort class may write back to the shared library.
 * BRIDLE Rule 4: if ambiguous, default to NOT writing (conservative).
 */
export function canWriteBack(cohortClass: CohortClass): boolean {
  return ACCESS_RULES[cohortClass].can_write_back_to_shared_library;
}

/**
 * Builds a human-readable access audit summary for TEAM dispatch logging.
 */
export function buildAccessAuditSummary(
  cohortClass: CohortClass,
  requestedCathedrals: string[],
  requestedWriteBack: boolean,
): string {
  const descriptor = ACCESS_RULES[cohortClass];
  const { allowed, blocked } = enforceAllowedCathedrals(requestedCathedrals, cohortClass);
  const writeBackGranted = requestedWriteBack && descriptor.can_write_back_to_shared_library;

  return [
    `Cohort: ${descriptor.tier_label}`,
    `Cathedrals allowed: [${allowed.join(", ")}]`,
    blocked.length > 0 ? `Cathedrals blocked: [${blocked.join(", ")}]` : null,
    `Scribe-trade: ${descriptor.can_trade_scribes ? "YES" : "NO"}`,
    `Write-back granted: ${writeBackGranted ? "YES" : "NO"}`,
    descriptor.access_note,
  ].filter(Boolean).join(" | ");
}
