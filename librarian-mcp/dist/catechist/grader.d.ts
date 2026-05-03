/**
 * Catechist Scribe Grader — KN036 (base) + KN-I2 extension / BP017
 * ================================================================
 * Session-open discipline-grading module (#2313, KN036 BP004 LANDED).
 *
 * Base (KN036): R01-R10 session-open checklist per Catechist canon.
 * KN-I2 extension: Surfaces per-AI-member rolling-7-day Reminder Scribe
 * violation-history alongside R01-R10 grading. Composes ADDITIVELY —
 * existing R01-R10 output is untouched; violation-history block appended.
 *
 * Anti-shame discipline (Reminder Scribe canon BP017 turn 22):
 *   Surfaces empirical counts + rates ONLY. No moral judgment language.
 *
 * BRIDLE Rule 4: if violation log unavailable, surface empty-history block
 * + UNAVAILABLE flag. Never silently skip.
 *
 * Composes with:
 *   KN-I1 Reminder Scribe engine (e16a8ff) — violation log source
 *   KN104 Detective TEAM PRE-COLOSSUS — substrate write-back
 *   Bouncer-Scales-Judge BP011 KN095 — sister composition
 */
export declare const VIOLATION_LOG_PATH: string;
export type GradeVerdict = "PASS" | "WARN" | "FAIL" | "SKIP";
export interface RuleGrade {
    rule_id: string;
    description: string;
    verdict: GradeVerdict;
    evidence?: string;
}
export interface BaseGradeResult {
    schema_version: "1.0";
    graded_at: string;
    session_id: string;
    ai_member: string;
    r01_r10_grades: RuleGrade[];
    overall_verdict: GradeVerdict;
    pass_count: number;
    warn_count: number;
    fail_count: number;
    summary: string;
}
/**
 * R01-R10 base rules per Catechist KN036 canon.
 * Each rule is checked against evidence provided by the AI member at session-open.
 */
export declare const R01_R10_RULES: Omit<RuleGrade, "verdict" | "evidence">[];
export interface SessionEvidenceMap {
    /** true if brief_me was called before any other tool */
    brief_me_called_first?: boolean;
    /** Session ID string to validate format */
    session_id?: string;
    /** Whether any K-prompt paths were referenced (triggers R05 check) */
    kprompt_paths_referenced?: boolean;
    /** Whether kprompt paths were verified before surfacing */
    kprompt_paths_verified?: boolean;
    /** Whether any canon Eblet writes were proposed */
    canon_eblet_write_proposed?: boolean;
    /** Whether prior Detective fan-out was done before Eblet write */
    prior_detective_fanout?: boolean;
    /** Whether fiat-bridge language appeared in the session */
    fiat_bridge_detected?: boolean;
    /** Whether session was debriefed at close */
    session_debrief_done?: boolean;
}
/**
 * Grade R01-R10 rules based on provided evidence.
 * Missing evidence → SKIP (not enough information to grade).
 */
export declare function gradeR01R10(evidence: SessionEvidenceMap, session_id: string): RuleGrade[];
export interface ViolationHistoryEntry {
    rule_id: string;
    rule_description: string;
    violations_7d: number;
    last_violation_session: string | null;
    correction_stickiness_pct: number;
}
export interface ViolationHistorySummary {
    schema_version: "1.0";
    ai_member: string;
    window_days: 7;
    generated_at: string;
    entries: ViolationHistoryEntry[];
    total_violations_7d: number;
    total_corrections_7d: number;
    overall_stickiness_pct: number;
    data_available: boolean;
    unavailable_reason?: string;
}
/**
 * KN-I2: Read reminder_scribe_violation_correction events from the dedicated
 * violation log (stitchpunks/reminder_scribe/violation_log.jsonl) within a
 * rolling 7-day window and aggregate per-rule.
 *
 * Log is written by reminder_scribe_log_violation MCP tool (server.ts KN-I1/I2).
 * Using dedicated JSONL (not pheromone substrate) because pheromone stores only
 * topic keywords — full event JSON needed for violation-rate analytics.
 *
 * BRIDLE Rule 4: returns data_available=false + reason if log unavailable.
 * Anti-shame: surfaces empirical counts + rates ONLY. No moral judgment.
 */
export declare function buildViolationHistorySummary(ai_member: string, _opts?: {
    workspaceRoot?: string;
}): ViolationHistorySummary;
export interface ExtendedGradeResult extends BaseGradeResult {
    violation_history_summary: ViolationHistorySummary;
    extended_at: "KN-I2";
}
/**
 * Run full Catechist session-open grade:
 *  1. R01-R10 base grading
 *  2. Violation-history-summary from KN-I1 Reminder Scribe substrate
 *
 * Returns ExtendedGradeResult with both blocks.
 * Anti-shame: violation-history uses empirical counts/rates only.
 */
export declare function runSessionOpenGrade(session_id: string, ai_member: string, evidence: SessionEvidenceMap, opts?: {
    workspaceRoot?: string;
}): ExtendedGradeResult;
/**
 * Format ExtendedGradeResult as human-readable Markdown for session-open display.
 */
export declare function formatGradeMarkdown(result: ExtendedGradeResult): string;
