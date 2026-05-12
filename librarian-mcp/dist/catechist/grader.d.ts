/**
 * Catechist Scribe Grader — KN036 (base) + KN-I2 extension / BP017
 *   + R12-R17 BP028 operational-discipline extension
 * ================================================================
 * Session-open discipline-grading module (#2313, KN036 BP004 LANDED).
 *
 * Base (KN036): R01-R10 session-open checklist per Catechist canon.
 * KN-I2 extension: Surfaces per-AI-member rolling-7-day Reminder Scribe
 * violation-history alongside R01-R10 grading. Composes ADDITIVELY —
 * existing R01-R10 output is untouched; violation-history block appended.
 *
 * BP028 R12-R17 extension (LB-STACK-0071..0076):
 *   R12 — Toolbelt-On Confirmation
 *   R13 — Cold Start Ritual Sequence-Integrity
 *   R14 — Brick-Wall Full-Loop Discipline
 *   R15 — Last-Hours Founder Review Cohort Readiness
 *   R16 — Pawn-Blind-Workaround Respect
 *   R17 — MCP-Restart-Needed Regression
 *   All six are ADDITIVE; R01-R10 behavior is UNCHANGED.
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
    /** R12-R17 BP028 operational-discipline grades (additive; R01-R10 unchanged) */
    r12_r17_grades: RuleGrade[];
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
 * R12-R17 rule descriptor table (parallel to R01_R10_RULES).
 * Stack rows LB-STACK-0071..0076.
 */
export declare const R12_R17_RULES: Omit<RuleGrade, "verdict" | "evidence">[];
/**
 * Evidence fields for R12-R17 grading.
 * All fields optional — missing evidence → SKIP (not enough info).
 */
export interface SessionEvidenceMapR12R17 {
    /** Was brief_me called and returned before substantive work? (R12 criterion 1) */
    r12_brief_me_returned?: boolean;
    /** Are work-class tool schemas loaded/listed (Codex/Yoke/dispatch/GADGETs)? (R12 criterion 2) */
    r12_tool_schemas_loaded?: boolean;
    /**
     * Is substrate cache fresh (within 24h) or explicitly refreshed this session?
     * (R12 criterion 3 — composed with R05 Augur Living Gate pattern)
     */
    r12_substrate_cache_fresh?: boolean;
    /** Did substantive work fire before Toolbelt confirmation? (R12 critical FAIL) */
    r12_work_before_toolbelt?: boolean;
    /**
     * Steps executed out of canonical order (e.g. Execute before Gather)?
     * true = out-of-order detected → FAIL.
     */
    r13_steps_out_of_order?: boolean;
    /** Was the Gather step (pheromone_query / detective_team / consult_scribes) present? */
    r13_gather_step_present?: boolean;
    /** Was the Assess step evidenced by measurement language / numbers / empirical receipt? */
    r13_assess_step_evidenced?: boolean;
    /**
     * Was the Collect (Toolbelt-on) step deferred until mid-Apply?
     * true → WARN.
     */
    r13_collect_deferred?: boolean;
    /**
     * Was Adjust skipped entirely (no tactical replan or queued-next notation)?
     * true → WARN.
     */
    r13_adjust_skipped?: boolean;
    /** Was a pre-hoc "should I…?" / "may I…?" ask detected before an action? (first-half violation) */
    r14_prehoc_ask_detected?: boolean;
    /** Did an action land without a completion-block surface? (second-half violation) */
    r14_missing_surface_after_action?: boolean;
    /**
     * Was a separate "was that OK?" line appended after surface?
     * (misses spirit of embedded-ask → FAIL)
     */
    r14_separate_ok_ask_appended?: boolean;
    /**
     * Firing happened but surface was sparse (hard to parse; redirect point unclear)?
     * → WARN.
     */
    r14_surface_sparse?: boolean;
    /**
     * Is counsel-prep brief Section 12 scaffold-status current and accurate?
     * TODO(Bishop-integration): cross-reference counsel-prep brief audit data at runtime.
     * Stub returns WARN with PATTERN_NOT_FULLY_IMPLEMENTED until integrated.
     */
    r15_counsel_prep_brief_current?: boolean;
    /** Were file paths staged / paste-ready code accessible for batch review? */
    r15_file_paths_staged?: boolean;
    /** Was a critical gap discovered at last-minute (<15min before fire) instead of flagged ahead? */
    r15_critical_gap_late_discovered?: boolean;
    /**
     * Did session chat show a pre-emptive review ask ("can you prose-pass this?")
     * before the last-hours window? → FAIL.
     */
    r15_preemptive_review_ask?: boolean;
    /**
     * Did the prior session's Founder directive route a Pawn task to
     * paste-to-perplexity-web workaround (recorded by Toolsmith scribe_log)?
     * undefined → SKIP (no directive on record).
     */
    r16_prior_session_workaround_directive?: boolean;
    /**
     * Was dispatch_pawn attempted for the same task class after the workaround directive?
     * Only evaluated when r16_prior_session_workaround_directive = true.
     */
    r16_dispatch_pawn_attempted_after_directive?: boolean;
    /**
     * Was dispatch_pawn scope unclear relative to the Founder directive?
     * (partial match → WARN)
     */
    r16_dispatch_pawn_scope_unclear?: boolean;
    /**
     * Does recent Knight commit history contain a "librarian-mcp restart required" note?
     * undefined → SKIP (no such commit found; rule not triggered).
     */
    r17_mcp_restart_required_in_commits?: boolean;
    /**
     * Was dispatch_rook attempted while MCP restart is still pending?
     * → FAIL.
     */
    r17_dispatch_rook_before_restart?: boolean;
    /**
     * Was dispatch_rook attempted with unclear restart status
     * (Founder may have restarted manually but no confirmation in chat)?
     * → WARN.
     */
    r17_dispatch_rook_restart_status_unclear?: boolean;
}
/** Combined evidence map passed to runSessionOpenGrade — R01-R10 + R12-R17. */
export type FullSessionEvidenceMap = SessionEvidenceMap & SessionEvidenceMapR12R17;
/**
 * Grade R12-R17 rules (BP028 operational-discipline extension).
 * Missing evidence → SKIP. R01-R10 is NEVER modified by this function.
 *
 * LB-STACK-0071..0076
 */
export declare function gradeR12R17(evidence: SessionEvidenceMapR12R17, _session_id: string): RuleGrade[];
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
 *  1. R01-R10 base grading (KN036 / BP004)
 *  2. R12-R17 BP028 operational-discipline grading (additive; R01-R10 unchanged)
 *  3. Violation-history-summary from KN-I1 Reminder Scribe substrate
 *
 * Returns ExtendedGradeResult with all blocks.
 * Anti-shame: violation-history uses empirical counts/rates only.
 *
 * Accepts FullSessionEvidenceMap (R01-R10 fields + R12-R17 fields).
 * For backward compatibility, plain SessionEvidenceMap is also accepted —
 * R12-R17 fields will all be undefined → all six rules grade as SKIP.
 */
export declare function runSessionOpenGrade(session_id: string, ai_member: string, evidence: FullSessionEvidenceMap | SessionEvidenceMap, opts?: {
    workspaceRoot?: string;
}): ExtendedGradeResult;
/**
 * Format ExtendedGradeResult as human-readable Markdown for session-open display.
 */
export declare function formatGradeMarkdown(result: ExtendedGradeResult): string;
