/**
 * Reminder Scribe Substrate Write-Back — KN-I3 / BP017
 * =====================================================
 * Wires Reminder Scribe violation/correction events to:
 *   1. Provenance chain (Cathedral-prefixed serial + Chronos HMAC)
 *   2. Pheromone substrate (Detective TEAM searchable)
 *   3. Local-log retry queue (BRIDLE Rule 4 fallback when substrate unavailable)
 *
 * Three event-classes:
 *   violation_detected  — pattern-match fires above threshold
 *   correction_applied  — AI member accepts correction proposal
 *   override_applied    — AI member overrides flag (Marks-cost if marks-cost class)
 *
 * Cathedral-prefixed serial: RS subclass (Reminder Scribe)
 *   bishop RS: LB-RS.M-NNNN
 *   knight RS: LB-RS.K-NNNN
 *   pawn RS:   LB-RS.P-NNNN
 *
 * FORK compliance: override_marks_cost is Marks-class ONLY. No fiat-bridge.
 * BRIDLE Rule 4: substrate failure → retry queue, never silent loss.
 *
 * Composes with:
 *   KN-I1 pattern_match_engine.ts (e16a8ff)
 *   KN-I2 catechist/grader.ts (af966c3)
 *   KN104 provenance_chain.ts (5e7f540)
 */
/** Provenance ledger for Reminder Scribe events (RS-class serial scheme). */
export declare const RS_PROVENANCE_LEDGER: string;
/** Local-log retry queue for substrate-unavailable fallback (BRIDLE Rule 4). */
export declare const RS_RETRY_QUEUE: string;
/**
 * Allocate next RS serial for a given AI member.
 * Format: LB-RS.<CATHEDRAL_CODE>-NNNN
 * Example: LB-RS.M-0042 (bishop Reminder Scribe entry #42)
 */
export declare function allocateRsSerial(ai_member: string): string;
/**
 * Compute Chronos HMAC for tamper-evidence.
 * Uses HMAC-SHA256 over payload string with timestamp-based key.
 * NOT cryptographic secret — integrity verification for audit trail.
 */
export declare function computeChronosHmac(payload: string, timestamp: string): string;
export type RsEventType = "violation_detected" | "correction_applied" | "override_applied";
export interface RsProvenanceEntry {
    provenance_class: "reminder_scribe_violation_correction";
    cathedral_prefixed_serial: string;
    chronos_hmac: string;
    ai_member: string;
    session_id: string;
    event_type: RsEventType;
    timestamp: string;
    rule_id: string;
    rule_class: string;
    violation_pattern_match_score: number;
    violation_excerpt: string;
    pre_send_block_triggered: boolean;
    correction_applied: boolean;
    correction_applied_at: string | null;
    correction_proposal: string;
    override_applied: boolean;
    override_marks_cost: number;
    override_rationale: string | null;
    override_class: string;
    composing_canon_pointers: string[];
    feedback_memory_pointer: string;
    post_send_audit_only: boolean;
}
export interface WriteBackOpts {
    ai_member: string;
    session_id: string;
    event_type: RsEventType;
    rule_id: string;
    rule_class: string;
    violation_pattern_match_score: number;
    violation_excerpt: string;
    pre_send_block_triggered: boolean;
    correction_applied: boolean;
    correction_applied_at?: string | null;
    correction_proposal: string;
    override_applied: boolean;
    override_marks_cost?: number;
    override_rationale?: string | null;
    override_class: string;
    composing_canon_pointers?: string[];
    feedback_memory_pointer?: string;
    post_send_audit_only?: boolean;
}
export interface WriteBackResult {
    success: boolean;
    serial: string;
    chronos_hmac: string;
    fallback_to_retry_queue: boolean;
    error?: string;
}
/**
 * Write a Reminder Scribe violation/correction event to the provenance chain.
 * On substrate failure, falls back to local retry queue (BRIDLE Rule 4).
 */
export declare function writeBackViolationEvent(opts: WriteBackOpts): WriteBackResult;
export interface HistoryQueryOpts {
    ai_member?: string;
    rule_id?: string;
    event_type?: RsEventType;
    rolling_days?: number;
    limit?: number;
}
/**
 * Query the RS provenance ledger for violation/correction history.
 * Used by reminder_scribe_query_history MCP tool and Catechist KN-I2.
 */
export declare function queryRsHistory(opts?: HistoryQueryOpts): RsProvenanceEntry[];
export interface RetryDrainResult {
    drained: number;
    failed: number;
    errors: string[];
}
/**
 * Drain the local retry queue into the provenance ledger.
 * Called at substrate-recovery time (eventual-consistency BRIDLE Rule 4 pattern).
 */
export declare function drainRetryQueue(): RetryDrainResult;
export interface RsViolationAggregate {
    rule_id: string;
    total_violations: number;
    corrections_applied: number;
    overrides: number;
    marks_spent: number;
    correction_stickiness_pct: number;
    last_violation_session: string | null;
    last_event_ts: string | null;
}
/** Aggregate RS history entries per rule for Catechist-class consumption. */
export declare function aggregateByRule(entries: RsProvenanceEntry[]): RsViolationAggregate[];
