/**
 * House Scribe Apiarist Hive Subscriber — KN-J4 / BP017
 * =======================================================
 * Subscribes to KN-D3 Hive-thread `thread_closed_with_synthesis` event.
 * When a Hive thread closes, House Scribe:
 *   1. Creates a Jar via KN-J1 (createJar)
 *   2. Assigns 8-digit-grid coordinate via KN-J2 (assignCoordinate)
 *   3. Registers with KN-J3 living-gridwork (updateCellOnEvent)
 *   4. Seals the Jar (sealJar) — forever-stamp class
 *   5. Computes per-role Marks-attribution (Workers/Drones/Queen)
 *
 * Bee-canon role mapping (per Apiarist Hive canon BP016):
 *   Workers  → contributing_members; pro-rata Marks-attribution
 *   Drones   → contributing_members with drone_specialty flag; Excalibur promotion eligible
 *   Queen    → queen_member_id; supervisor-class Marks multiplier
 *   House Scribe → seals Jar; assigns coordinate; logs provenance (Comb-builder + Honey-keeper)
 *
 * Project-cohort GREATER % payment (per KN-D4 per-cohort routing):
 *   Tribe / Family / Guild Hives: standard Marks-attribution (1.0x)
 *   Project Hive: GREATER % multiplier (configurable; default 1.25x)
 *
 * BRIDLE Rule 4 conservative defaults:
 *   - Incomplete synthesis → HALT Jar creation; flag for Queen review
 *   - Missing contribution map → fallback to historical aggregation; never silent-zero
 *   - Provenance chain failure → retry queue (per KN-J1)
 *   - FORK doctrine: Marks-attribution NEVER bridges to fiat
 *
 * Composes with:
 *   KN-D3 Hive-thread state machine (closed transition)
 *   KN-D4 per-cohort routing + Project GREATER % payment
 *   KN-J1 jar_lifecycle.ts
 *   KN-J2 coordinate_assignment.ts
 *   KN-J3 living_gridwork.ts
 *   KN105 Excalibur Class (Jar promotion eligibility)
 */
import { type ContentType, type CohortMinimum, type JarOfHoney } from "./jar_lifecycle.js";
export type HiveCohortType = "tribe" | "family" | "guild" | "project";
export interface ContributorRecord {
    member_id: string;
    role: "worker" | "drone" | "queen";
    contribution_weight: number;
    drone_specialty?: string;
}
export interface ThreadClosedWithSynthesisEvent {
    thread_id: string;
    cathedral: string;
    cohort_type: HiveCohortType;
    closed_at: string;
    synthesis_summary: string;
    synthesis_blob_pointer: string;
    contributors: ContributorRecord[];
    queen_member_id: string | null;
    /** Maps to KN-J1 ContentType. Defaults to "synthesis" for Hive thread closures. */
    content_type?: ContentType;
    read_cohort_minimum?: CohortMinimum;
    write_cohort_minimum?: CohortMinimum;
    /** Optional: Marks units available for this thread (for attribution). */
    total_marks_pool?: number;
}
export interface MarksAttribution {
    member_id: string;
    role: "worker" | "drone" | "queen";
    base_contribution_weight: number;
    cohort_multiplier: number;
    attributed_marks_fraction: number;
    drone_specialty?: string;
    fork_doctrine_validated: boolean;
}
export declare const PROJECT_COHORT_MULTIPLIER = 1.25;
export declare const QUEEN_SUPERVISOR_MULTIPLIER = 1.5;
export interface JarCreationOrchestrationResult {
    success: boolean;
    jar?: JarOfHoney;
    coordinate?: string;
    serial?: string;
    marks_attribution?: MarksAttribution[];
    bridle_flag?: string;
    error?: string;
    incomplete_synthesis?: boolean;
    fork_doctrine_validated: boolean;
}
export interface HiveJarStatusResult {
    data_available: boolean;
    thread_id: string;
    jars: JarOfHoney[];
    marks_attribution?: MarksAttribution[];
    unavailable_reason?: string;
}
/**
 * Full Jar creation orchestration on Hive-thread closure.
 * Chains: create → assign-coordinate → living-gridwork-register → seal
 *
 * BRIDLE Rule 4:
 *   - Incomplete synthesis (empty summary or blob pointer) → HALT; flag for Queen
 *   - Missing contributors → fallback attribution (equal weight); never silent-zero
 */
export declare function onThreadClosedWithSynthesis(event: ThreadClosedWithSynthesisEvent): JarCreationOrchestrationResult;
/**
 * Query Jars created from a specific Hive thread.
 * Returns Jar + Marks-attribution from the closure event log.
 */
export declare function queryHiveJarStatus(thread_id: string): HiveJarStatusResult;
/**
 * Count active Hive threads by reading the closure event log.
 * Returns number of threads that have NOT yet closed (based on known closed ones).
 * This provides the active_hive_threads count for KN-J1 population audit.
 */
export declare function countActiveHiveThreads(): number;
