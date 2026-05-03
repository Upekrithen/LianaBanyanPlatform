/**
 * Cohort-Class Probe (KN102 / BP016)
 * ===================================
 * Detects a member's cohort class and assigns the corresponding Librarian mode.
 * Called at LB Frame Handshake Phase 1 Discovery.
 *
 * Priority order (highest wins):
 *   1. federation_member       — profiles.membership_status = 'active' ($5/year)
 *   2. excalibur_class_subscriber — entity_memberships.status = 'active'
 *   3. pied_piper_tier_2_plus  — ≥3 qualifying Cue Cards in last 7 days
 *   4. pied_piper_tier_1       — ≥1 qualifying Cue Card in last 7 days
 *   5. lone_wolf               — no qualifying pathway (default)
 *
 * Mode assignment:
 *   lone_wolf                 → "brittle"   (batch-snapshot; npm-run-rebuild)
 *   pied_piper_tier_1+        → "fluid"     (direct-from-disk via Pheromone)
 *   federation_member         → "fluid"     (permanent; no recency gate)
 *   excalibur_class_subscriber → "fluid"   (permanent; no recency gate)
 *
 * BRIDLE Rule 4: if detection is ambiguous or DB unreachable, default to brittle.
 */
import { type VestingStateResult } from "./cue_card_recency.js";
export type LibrarianMode = "brittle" | "fluid";
export type CohortClass = "lone_wolf" | "pied_piper_tier_1" | "pied_piper_tier_2_plus" | "federation_member" | "excalibur_class_subscriber";
export interface CohortClassResult {
    cohort_class: CohortClass;
    librarian_mode: LibrarianMode;
    membership_status: string | null;
    cue_card_vesting: VestingStateResult | null;
    /** ISO-8601 timestamp when this probe ran */
    probed_at: string;
    /** True if detection fell back to brittle due to error */
    fallback_brittle: boolean;
    error?: string;
}
/**
 * Probe cohort class from Supabase for a given member_id.
 * Calls `get_member_cohort_class(member_id)` RPC (defined in KN102/KN103 migration).
 * Falls back to brittle/lone_wolf if DB is unavailable.
 */
export declare function probeCohortClass(memberId: string): Promise<CohortClassResult>;
/**
 * Lightweight cohort-class probe for session metadata.
 * Returns a plain summary string for brief_me / get_system_overview output.
 */
export declare function formatCohortSummary(result: CohortClassResult): string;
/**
 * Quick check: does a given mode string map to fluid?
 * Used by fingerprint.ts to gate direct-from-disk reads.
 */
export declare function isFluidMode(mode: LibrarianMode): boolean;
