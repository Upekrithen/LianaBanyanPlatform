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
export interface ScribeAccessDescriptor {
    tier_label: string;
    can_read_agpl_baseline: boolean;
    can_read_federation_library: boolean;
    can_read_excalibur_slice: boolean;
    can_write_back_to_shared_library: boolean;
    can_trade_scribes: boolean;
    allowed_cathedrals: string[];
    access_note: string;
}
/** Returns the access descriptor for a given cohort class. */
export declare function getScribeAccessDescriptor(cohortClass: CohortClass): ScribeAccessDescriptor;
/**
 * Filters requested cathedrals to only those permitted for the cohort.
 * Returns the intersection of requested + allowed.
 */
export declare function enforceAllowedCathedrals(requested: string[], cohortClass: CohortClass): {
    allowed: string[];
    blocked: string[];
};
/**
 * Checks whether a given cohort class may write back to the shared library.
 * BRIDLE Rule 4: if ambiguous, default to NOT writing (conservative).
 */
export declare function canWriteBack(cohortClass: CohortClass): boolean;
/**
 * Builds a human-readable access audit summary for TEAM dispatch logging.
 */
export declare function buildAccessAuditSummary(cohortClass: CohortClass, requestedCathedrals: string[], requestedWriteBack: boolean): string;
