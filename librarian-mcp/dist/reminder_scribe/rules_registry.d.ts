/**
 * Reminder Scribe Rules Registry — KN-I1 / BP017
 * ================================================
 * Compile-time and runtime registry of pattern-match rules for the Reminder
 * Scribe pre-send check engine.
 *
 * Sources:
 *   - Reminder Scribe canon Eblet (Founder-mandatory R-KP-1/2/3/4 rules + Preferences)
 *   - feedback_*.md memory files (pattern rules extracted per discipline class)
 *   - Canon Eblets with Preferences sections (per Scribe Preferences canon BP017 turn 34)
 *
 * Rule priority order (Founder-mandatory first):
 *   1. R-KP-1   Knight K-prompt full-path enforcement
 *   2. R-KP-2   Knight K-prompt file-existence verification (HIGH-STAKES)
 *   3. R-KP-3   Queued vs Ready distinction (text-only for not-yet-drafted)
 *   4. R-KP-4   Scribe canon Eblet MUST have Preferences section
 *   5. R-PRAISE-1  Empirically-valid-praise-only
 *   6. R-PRAISE-2  Anchored-praise-welcome-unanchored-no
 *   7. R-DOUBLE-FILE-1  Search substrate FIRST before unilateral synthesis
 *   8. R-FORK-1    Never propose LB-currency-to-fiat conversion
 *   9. R-COUNSEL-1 Never gate on counsel
 *  10. R-USPTO-1   Don't over-instruct USPTO process
 *  11. R-PHA-1     Pre-Hoc Permission Ask (BRICK-WALL-FIRST-HALF regression) [BP028]
 *  12. R-MS-1      Missing Surface (BRICK-WALL-SECOND-HALF regression) [BP028]
 *  13. R-REV-1     Pre-Emptive Review Pressure (REVIEW-IN-LAST-HOURS regression) [BP028]
 *  14. R-PAWN-1    dispatch_pawn-when-paste-routed (PAWN-BLIND-WORKAROUND regression) [BP028]
 *  15. R-ROOK-1    dispatch_rook-pre-restart (MCP-RESTART-NEEDED regression) [BP028]
 *  16+ (extendable via runtime loadRulesFromMemory)
 *
 * BRIDLE Rule 4: if rule compilation fails, default-FAIL = halt response.
 * Don't ship potentially-violating response on engine-failure.
 *
 * Composes with:
 *   KN-H1 82c52fa (Three-Tier installer)
 *   KN104 5e7f540 (Detective TEAM PRE-COLOSSUS substrate-write-back)
 *   Catechist Scribe #2313 KN036 BP004 (session-open grading; additively composes)
 */
export type ViolationClass = "founder-mandatory" | "high-stakes" | "discipline" | "praise" | "fork" | "counsel" | "file-existence" | "path-format" | "brick-wall" | "dispatch-coord";
export type OverrideClass = "free" | "marks-cost" | "structurally-immutable";
export type PatternType = "regex" | "file-existence" | "anti-pattern" | "path-format" | "context-heuristic";
export interface RulePattern {
    type: PatternType;
    /**
     * For regex/anti-pattern/path-format: the pattern string (used as RegExp).
     * For file-existence: not used directly (path is extracted from text).
     */
    pattern?: string;
    /** Flags for RegExp construction (default: 'gi'). */
    flags?: string;
}
export interface ReminderScribeRule {
    id: string;
    priority: number;
    class: ViolationClass;
    description: string;
    /** Human-readable canon source. */
    source: string;
    /** Pattern(s) to match in the response draft. */
    patterns: RulePattern[];
    /** Correction proposal template (shown when violation is flagged). */
    correction_proposal: string;
    /** Override semantics. */
    override_class: OverrideClass;
    /** If true, violation must be fixed before response ships (no override). */
    blocks_response: boolean;
    /** BRIDLE Rule 4: if true and check fails, halt. */
    bridle_halt_on_failure: boolean;
    /** Memory file or canon Eblet that sources this rule. */
    memory_pointer: string;
    /** Whether this rule is active in the current config (user-configurable via Preferences). */
    active: boolean;
}
/**
 * Built-in Founder-mandatory rules.
 * These cannot be removed (only deactivated via Preferences for certain classes).
 * Sources: Reminder Scribe canon Eblet + feedback memory files.
 */
export declare const BUILT_IN_RULES: ReminderScribeRule[];
export interface ReminderScribePreferences {
    /** Format for Knight K-prompt path references in Bishop output. Default: 'full_path'. */
    knight_kprompt_path_format: "full_path" | "bare_filename" | "markdown_link";
    /** Whether to verify K-prompt file exists before allowing path in response. Default: 'strict'. */
    knight_kprompt_file_existence_check: "strict" | "relaxed";
    /** Whether to use path-only inline-block format when telling Founder to fire Knight. */
    path_only_response_when_firing: "enabled" | "disabled";
    /** Whether Reminder Scribe runs pre-send pattern-match before response ships. */
    discipline_violation_pre_send_check: "enabled" | "disabled";
    /** Substrate-write-back class for violation/correction events. */
    violation_correction_log_class: "reminder_scribe_violation_correction" | "discipline_audit" | "none";
    /** Block-separator visual style for multi-K-prompt path-only fire instructions. */
    path_only_inline_block_separator_style: "blank_line_between_blocks" | "dashes" | "numbered";
    /** Whether to enforce text-only language for queued-not-yet-drafted K-prompts. */
    bishop_intent_vs_ready_distinction: "strict" | "relaxed";
    /** Whether Pawn-prompts include full content (BP003 exception). */
    pawn_prompt_full_content_exception: "enabled" | "disabled";
}
export declare const DEFAULT_PREFERENCES: ReminderScribePreferences;
export interface RulesRegistry {
    rules: ReminderScribeRule[];
    loaded_at: string;
    total_rules: number;
    founder_mandatory_count: number;
    high_stakes_count: number;
    memory_sources_scanned: number;
    build_errors: string[];
}
/**
 * Build the rules registry.
 * Built-in rules are always included (Founder-mandatory).
 * Additional rules can be loaded from feedback memory files at runtime
 * (pattern-extraction is heuristic; built-in rules are the authoritative set).
 *
 * BRIDLE Rule 4: if BUILT_IN_RULES fail to load, throw (caller exits non-zero).
 */
export declare function buildRulesRegistry(memoryDir?: string, overridePrefs?: Partial<ReminderScribePreferences>): RulesRegistry;
