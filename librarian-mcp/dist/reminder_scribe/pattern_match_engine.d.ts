/**
 * Reminder Scribe Pattern-Match Engine — KN-I1 / BP017
 * =====================================================
 * Pre-send hook for AI cohort response-draft checking.
 * Runs pattern-match against rules registry; returns violations with
 * correction proposals BEFORE response ships to Founder.
 *
 * Flow:
 *   1. Parse response draft for trigger-class patterns
 *   2. Match against active rules in registry (priority order)
 *   3. For each match: compute violation-likelihood
 *   4. If violation-likelihood > threshold (default 0.7): flag + correction proposal
 *   5. Return structured ViolationReport for review
 *   6. Caller (MCP tool) logs to Detective TEAM provenance (KN-I3 extension)
 *
 * BRIDLE Rule 4: if engine itself fails, returns error_receipt (never silently passes).
 *
 * Composes with:
 *   rules_registry.ts (KN-I1) — rules and preferences
 *   librarian-mcp/src/server.ts — MCP tools reminder_scribe_check + reminder_scribe_log_violation
 *   KN-I2 — Catechist session-open grading composition extension
 *   KN-I3 — Detective TEAM provenance integration
 */
import { type ReminderScribePreferences } from "./rules_registry.js";
export interface ViolationMatch {
    /** The matched text or path (may be truncated for long inputs). */
    matched_text: string;
    /** Character offset in the response_draft where match was found. */
    offset: number;
    /** Violation likelihood score [0.0 – 1.0]. */
    likelihood: number;
}
export interface ViolationFlag {
    rule_id: string;
    rule_priority: number;
    class: string;
    description: string;
    matches: ViolationMatch[];
    correction_proposal: string;
    override_class: string;
    blocks_response: boolean;
    memory_pointer: string;
    /** Whether this violation was confirmed vs. flagged for review. */
    confidence: "confirmed" | "review";
}
export interface CheckResult {
    schema_version: "1.0";
    checked_at: string;
    engine: "reminder-scribe-pattern-match-v1";
    response_length_chars: number;
    rules_checked: number;
    violations_found: number;
    blocks_response: boolean;
    structurally_immutable_violations: number;
    violations: ViolationFlag[];
    clean: boolean;
    summary: string;
    bridle_rule_4_applied: boolean;
    error_receipt?: string;
    registry_stats: {
        total_rules: number;
        founder_mandatory: number;
        high_stakes: number;
        memory_sources: number;
        build_errors: string[];
    };
}
/**
 * Run the Reminder Scribe pattern-match engine against a response draft.
 *
 * @param response_draft  The AI cohort member's response text to check.
 * @param opts.workspaceRoot  Override workspace root (default: auto-detected).
 * @param opts.preferences  User-configurable Reminder Scribe preferences (default: canonical defaults).
 * @param opts.memoryDir  Path to feedback memory directory (for registry stats).
 * @returns CheckResult with violations, correction proposals, and engine stats.
 */
export declare function runReminderScribeCheck(response_draft: string, opts?: {
    workspaceRoot?: string;
    preferences?: Partial<ReminderScribePreferences>;
    memoryDir?: string;
}): CheckResult;
export interface ViolationEvent {
    event_type: "reminder_scribe_violation_correction";
    session_id: string;
    rule_id: string;
    rule_class: string;
    violation_confirmed: boolean;
    correction_applied: boolean;
    override_used: boolean;
    override_marks_cost: number;
    timestamp: string;
    response_excerpt: string;
    memory_pointer: string;
    correction_proposal_excerpt: string;
}
/**
 * Build a ViolationEvent for Detective TEAM provenance write-back (KN-I3).
 */
export declare function buildViolationEvent(flag: ViolationFlag, opts: {
    session_id: string;
    correction_applied: boolean;
    override_used: boolean;
    response_excerpt?: string;
}): ViolationEvent;
