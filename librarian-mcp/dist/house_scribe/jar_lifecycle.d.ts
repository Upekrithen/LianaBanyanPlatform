/**
 * House Scribe Jar Lifecycle State Machine — KN-J1 / BP017
 * =========================================================
 * Long-term archive keeper at population-scale.
 * Manages the 4-state Jar of Honey lifecycle:
 *   created → indexed → sealed → retrievable
 *
 * Cathedral-prefixed serial: HS subclass (House Scribe)
 *   bishop: LB-BISHOP.HS-NNNN
 *   knight: LB-KNIGHT.HS-NNNN
 *   pawn:   LB-PAWN.HS-NNNN
 *
 * Jar sealing is STRUCTURALLY-IMMUTABLE (forever-stamp class):
 *   - No mutation after sealed state
 *   - Composes with FORK doctrine: sealed Jars cannot be fiat-converted
 *   - Chronos HMAC computed at seal time
 *
 * Pixie Dust events (per Pixie Dust canon BP017 turn 30):
 *   - Jar creation = Layer 6 Pixie Dust event
 *   - Jar sealing = Pixie Dust event emitted to Pheromone substrate
 *
 * Composes with:
 *   KN104 provenance_chain.ts (5e7f540) — Cathedral-prefixed serial + HMAC
 *   KN-D3 Hive-thread state machine — closure triggers Jar creation
 *   KN-J2 (8-digit grid) — provides coordinate for indexed state
 *   Pheromone substrate (#2317 B128) — Pixie Dust write-events
 */
export declare const JARS_LEDGER: string;
/**
 * Allocate next HS serial for a cathedral.
 * Format: LB-<CATHEDRAL>.HS-NNNN
 * Example: LB-BISHOP.HS-0042
 */
export declare function allocateHsSerial(cathedral: string): string;
export declare function computeJarHmac(jarId: string, sealedAt: string): string;
export type JarState = "created" | "indexed" | "sealed" | "retrievable";
export type ContentType = "synthesis" | "comb_artifact" | "royal_jelly_class" | "innovation_corpus" | "session_archive" | "detective_finding";
export type CohortMinimum = "lone_wolf" | "pied_piper_tier_1" | "federation_member" | "excalibur_subscriber" | "thirteenth_warrior";
export interface JarOfHoney {
    jar_id: string;
    cathedral_prefixed_serial: string;
    chronos_hmac: string;
    state: JarState;
    created_at: string;
    indexed_at: string | null;
    sealed_at: string | null;
    retrievable_at: string | null;
    cathedral: string;
    source_hive_thread_id: string;
    contributing_members: string[];
    queen_member_id: string | null;
    coordinate: string | null;
    content_type: ContentType;
    content_summary: string;
    content_blob_pointer: string;
    excalibur_class_eligible: boolean;
    read_cohort_minimum: CohortMinimum;
    write_cohort_minimum: CohortMinimum;
    layer: 6;
}
export interface JarEvent {
    event_id: string;
    jar_id: string;
    event_type: "jar_created" | "jar_indexed" | "jar_sealed" | "jar_retrieved" | "jar_mutation_rejected";
    timestamp: string;
    cathedral: string;
    detail?: string;
}
export interface CreateJarOpts {
    cathedral: string;
    source_hive_thread_id: string;
    contributing_members?: string[];
    queen_member_id?: string;
    content_type: ContentType;
    content_summary: string;
    content_blob_pointer: string;
    excalibur_class_eligible?: boolean;
    read_cohort_minimum?: CohortMinimum;
    write_cohort_minimum?: CohortMinimum;
}
export interface CreateJarResult {
    success: boolean;
    jar: JarOfHoney | null;
    error?: string;
}
/**
 * Create a new Jar of Honey in `created` state.
 * Triggered by Hive-thread closure (KN-D3 `closed` state transition).
 */
export declare function createJar(opts: CreateJarOpts): CreateJarResult;
export interface IndexJarResult {
    success: boolean;
    jar: JarOfHoney | null;
    error?: string;
}
export declare function indexJar(jar_id: string, coordinate: string): IndexJarResult;
export interface SealJarResult {
    success: boolean;
    jar: JarOfHoney | null;
    serial?: string;
    hmac?: string;
    error?: string;
}
/**
 * Seal a Jar — finalizes provenance, assigns Cathedral-prefixed serial + HMAC.
 * STRUCTURALLY-IMMUTABLE after this point. Mutation attempts are REJECTED.
 * Requires jar to be in `indexed` state (coordinate must be assigned).
 */
export declare function sealJar(jar_id: string): SealJarResult;
export interface MutationResult {
    allowed: boolean;
    reason: string;
}
/**
 * Check whether a mutation is allowed.
 * SEALED / RETRIEVABLE jars are structurally-immutable — no mutation allowed.
 */
export declare function checkMutationAllowed(jar: JarOfHoney): MutationResult;
/**
 * Verify cohort-class access for a given operation.
 * Returns true if requester's cohort meets the Jar's minimum requirement.
 */
export declare function verifyCohortAccess(jar: JarOfHoney, requester_cohort: CohortMinimum, operation: "read" | "write"): {
    allowed: boolean;
    reason: string;
};
export interface JarQuery {
    state?: JarState;
    cathedral?: string;
    coordinate?: string;
    content_type?: ContentType;
    excalibur_eligible?: boolean;
    requester_cohort?: CohortMinimum;
    limit?: number;
}
export declare function queryJars(query?: JarQuery): JarOfHoney[];
export declare function readAllJars(): JarOfHoney[];
export declare function logJarEvent(evt: JarEvent): void;
export declare function readJarEvents(jar_id?: string): JarEvent[];
