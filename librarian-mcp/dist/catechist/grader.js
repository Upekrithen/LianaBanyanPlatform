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
import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname_catechist = dirname(__filename);
// Violation log: stitchpunks/reminder_scribe/violation_log.jsonl
// Written by reminder_scribe_log_violation MCP tool (server.ts KN-I1)
export const VIOLATION_LOG_PATH = resolve(__dirname_catechist, "../../stitchpunks/reminder_scribe/violation_log.jsonl");
/**
 * R01-R10 base rules per Catechist KN036 canon.
 * Each rule is checked against evidence provided by the AI member at session-open.
 */
export const R01_R10_RULES = [
    {
        rule_id: "R01",
        description: "brief_me called first (before any other tool at session-open)",
    },
    {
        rule_id: "R02",
        description: "codecopy_ask_second: ask before copying large code blocks (per KN036)",
    },
    {
        rule_id: "R03",
        description: "No orphan synthesis: every synthesis anchored to substrate entry",
    },
    {
        rule_id: "R04",
        description: "FORK doctrine: no fiat-bridge proposal at any point in session",
    },
    {
        rule_id: "R05",
        description: "K-prompt paths verified on disk before surface to Founder",
    },
    {
        rule_id: "R06",
        description: "Canon Eblets: prior Detective fan-out before any new Eblet draft",
    },
    {
        rule_id: "R07",
        description: "Marks-class payouts only: no cash-out / fiat-class references",
    },
    {
        rule_id: "R08",
        description: "Session-ID format valid (K/B/R/P + digits, no TEST_ prefix in production)",
    },
    {
        rule_id: "R09",
        description: "Update session record at session-close (moneypenny_debrief or equivalent)",
    },
    {
        rule_id: "R10",
        description: "Empirical-praise-only: no unanchored superlatives in AI member response",
    },
];
// ─── R12-R17 BP028 operational-discipline rules ───────────────────────────────
/**
 * R12-R17 rule descriptor table (parallel to R01_R10_RULES).
 * Stack rows LB-STACK-0071..0076.
 */
export const R12_R17_RULES = [
    {
        rule_id: "R12",
        description: "Toolbelt-On Confirmation: brief_me + tool schemas + substrate cache fresh before substantive work",
    },
    {
        rule_id: "R13",
        description: "Cold Start Ritual Sequence-Integrity: gather→collect→apply→execute→assess→adjust in canonical order",
    },
    {
        rule_id: "R14",
        description: "Brick-Wall Full-Loop Discipline: first-half (fire without asking) + second-half (post-hoc surface-as-ask)",
    },
    {
        rule_id: "R15",
        description: "Last-Hours Founder Review Cohort Readiness: counsel-prep brief §12 accurate; no pre-emptive review asks",
    },
    {
        rule_id: "R16",
        description: "Pawn-Blind-Workaround Respect: honor explicit Founder directive to route Pawn tasks manually",
    },
    {
        rule_id: "R17",
        description: "MCP-Restart-Needed Regression: do not dispatch_rook until librarian-mcp restart confirmed post schema-cache fix",
    },
];
/**
 * Grade R12-R17 rules (BP028 operational-discipline extension).
 * Missing evidence → SKIP. R01-R10 is NEVER modified by this function.
 *
 * LB-STACK-0071..0076
 */
export function gradeR12R17(evidence, _session_id) {
    const grades = [];
    // ── R12: Toolbelt-On Confirmation ─────────────────────────────────────────
    (() => {
        const { r12_brief_me_returned, r12_tool_schemas_loaded, r12_substrate_cache_fresh, r12_work_before_toolbelt } = evidence;
        // Critical FAIL: substantive work before toolbelt confirmed
        if (r12_work_before_toolbelt === true) {
            grades.push({
                rule_id: "R12",
                description: R12_R17_RULES[0].description,
                verdict: "FAIL",
                evidence: "Substantive work fired before Toolbelt confirmation — canonical sequence breach",
            });
            return;
        }
        // Critical FAIL: brief_me not called
        if (r12_brief_me_returned === false) {
            grades.push({
                rule_id: "R12",
                description: R12_R17_RULES[0].description,
                verdict: "FAIL",
                evidence: "brief_me not called at session-open — state pulse missing",
            });
            return;
        }
        const noEvidence = r12_brief_me_returned === undefined &&
            r12_tool_schemas_loaded === undefined &&
            r12_substrate_cache_fresh === undefined &&
            r12_work_before_toolbelt === undefined;
        if (noEvidence) {
            grades.push({
                rule_id: "R12",
                description: R12_R17_RULES[0].description,
                verdict: "SKIP",
                evidence: "No R12 evidence provided",
            });
            return;
        }
        // WARN cases
        const warnReasons = [];
        if (r12_substrate_cache_fresh === false)
            warnReasons.push("substrate cache stale (>24h) and refresh not triggered");
        if (r12_tool_schemas_loaded === false)
            warnReasons.push("deferred tools listed but not yet loaded");
        if (warnReasons.length > 0) {
            grades.push({
                rule_id: "R12",
                description: R12_R17_RULES[0].description,
                verdict: "WARN",
                evidence: warnReasons.join("; "),
            });
            return;
        }
        // All three criteria met → PASS
        grades.push({
            rule_id: "R12",
            description: R12_R17_RULES[0].description,
            verdict: "PASS",
            evidence: "brief_me returned; tool schemas loaded; substrate cache fresh",
        });
    })();
    // ── R13: Cold Start Ritual Sequence-Integrity ──────────────────────────────
    (() => {
        const { r13_steps_out_of_order, r13_gather_step_present, r13_assess_step_evidenced, r13_collect_deferred, r13_adjust_skipped, } = evidence;
        const noEvidence = r13_steps_out_of_order === undefined &&
            r13_gather_step_present === undefined &&
            r13_assess_step_evidenced === undefined &&
            r13_collect_deferred === undefined &&
            r13_adjust_skipped === undefined;
        if (noEvidence) {
            grades.push({
                rule_id: "R13",
                description: R12_R17_RULES[1].description,
                verdict: "SKIP",
                evidence: "No R13 evidence provided",
            });
            return;
        }
        // FAIL: steps out of canonical order
        if (r13_steps_out_of_order === true) {
            grades.push({
                rule_id: "R13",
                description: R12_R17_RULES[1].description,
                verdict: "FAIL",
                evidence: "Steps executed out of canonical gather→collect→apply→execute→assess→adjust order",
            });
            return;
        }
        // FAIL: Gather missing
        if (r13_gather_step_present === false) {
            grades.push({
                rule_id: "R13",
                description: R12_R17_RULES[1].description,
                verdict: "FAIL",
                evidence: "Gather step absent — Execute fired on pre-hoc assumption without substrate detection",
            });
            return;
        }
        // FAIL: Assess missing or narrative-only
        if (r13_assess_step_evidenced === false) {
            grades.push({
                rule_id: "R13",
                description: R12_R17_RULES[1].description,
                verdict: "FAIL",
                evidence: "Assess step missing or narrative-only (no numbers / A/B result / empirical-receipt language)",
            });
            return;
        }
        // WARN cases
        const warnReasons = [];
        if (r13_collect_deferred === true)
            warnReasons.push("Collect (Toolbelt-on) deferred until mid-Apply");
        if (r13_adjust_skipped === true)
            warnReasons.push("Adjust step skipped; no tactical replan queued for next iteration");
        if (warnReasons.length > 0) {
            grades.push({
                rule_id: "R13",
                description: R12_R17_RULES[1].description,
                verdict: "WARN",
                evidence: warnReasons.join("; "),
            });
            return;
        }
        grades.push({
            rule_id: "R13",
            description: R12_R17_RULES[1].description,
            verdict: "PASS",
            evidence: "Six-step ritual executed in canonical order with all steps evidenced",
        });
    })();
    // ── R14: Brick-Wall Full-Loop Discipline ───────────────────────────────────
    (() => {
        const { r14_prehoc_ask_detected, r14_missing_surface_after_action, r14_separate_ok_ask_appended, r14_surface_sparse, } = evidence;
        const noEvidence = r14_prehoc_ask_detected === undefined &&
            r14_missing_surface_after_action === undefined &&
            r14_separate_ok_ask_appended === undefined &&
            r14_surface_sparse === undefined;
        if (noEvidence) {
            grades.push({
                rule_id: "R14",
                description: R12_R17_RULES[2].description,
                verdict: "SKIP",
                evidence: "No R14 evidence provided",
            });
            return;
        }
        // FAIL: pre-hoc ask creep (first-half violation)
        if (r14_prehoc_ask_detected === true) {
            grades.push({
                rule_id: "R14",
                description: R12_R17_RULES[2].description,
                verdict: "FAIL",
                evidence: "Pre-hoc 'should I…?' / 'may I…?' ask detected before action — brick-wall first-half violation",
            });
            return;
        }
        // FAIL: missing surface after action (second-half violation)
        if (r14_missing_surface_after_action === true) {
            grades.push({
                rule_id: "R14",
                description: R12_R17_RULES[2].description,
                verdict: "FAIL",
                evidence: "Action landed without completion-block surface — brick-wall second-half violation",
            });
            return;
        }
        // FAIL: separate "was that OK?" line (spirit violation)
        if (r14_separate_ok_ask_appended === true) {
            grades.push({
                rule_id: "R14",
                description: R12_R17_RULES[2].description,
                verdict: "FAIL",
                evidence: "Separate 'was that OK?' line appended — misses spirit of embedded-ask (surface IS the post-hoc ask)",
            });
            return;
        }
        // WARN: sparse surface
        if (r14_surface_sparse === true) {
            grades.push({
                rule_id: "R14",
                description: R12_R17_RULES[2].description,
                verdict: "WARN",
                evidence: "Dense parallel firing but surface sparse — completion-blocks hard to parse; redirect point unclear",
            });
            return;
        }
        grades.push({
            rule_id: "R14",
            description: R12_R17_RULES[2].description,
            verdict: "PASS",
            evidence: "Both halves confirmed: first-half (fire without asking) + second-half (post-hoc surface-as-ask)",
        });
    })();
    // ── R15: Last-Hours Founder Review Cohort Readiness ───────────────────────
    // TODO(Bishop-integration): cross-reference counsel-prep brief §12 audit data
    // from BISHOP_DROPZONE at runtime. Currently stubs on r15_counsel_prep_brief_current
    // when not provided. PATTERN_NOT_FULLY_IMPLEMENTED for automated brief scan.
    (() => {
        const { r15_counsel_prep_brief_current, r15_file_paths_staged, r15_critical_gap_late_discovered, r15_preemptive_review_ask, } = evidence;
        // FAIL: pre-emptive review ask (first-half pre-emption)
        if (r15_preemptive_review_ask === true) {
            grades.push({
                rule_id: "R15",
                description: R12_R17_RULES[3].description,
                verdict: "FAIL",
                evidence: "Pre-emptive review ask detected in session chat ('can you prose-pass this?' before last-hours window) — first-half violated",
            });
            return;
        }
        // FAIL: counsel-prep brief status inaccurate
        if (r15_counsel_prep_brief_current === false) {
            grades.push({
                rule_id: "R15",
                description: R12_R17_RULES[3].description,
                verdict: "FAIL",
                evidence: "Counsel-prep brief §12 status stale or inaccurate — PROSE-PASS-READY claimed but scaffold not ready",
            });
            return;
        }
        const noEvidence = r15_counsel_prep_brief_current === undefined &&
            r15_file_paths_staged === undefined &&
            r15_critical_gap_late_discovered === undefined &&
            r15_preemptive_review_ask === undefined;
        if (noEvidence) {
            // Stub: WARN with PATTERN_NOT_FULLY_IMPLEMENTED per spec
            grades.push({
                rule_id: "R15",
                description: R12_R17_RULES[3].description,
                verdict: "WARN",
                evidence: "PATTERN_NOT_FULLY_IMPLEMENTED — counsel-prep brief §12 automated scan pending Bishop runtime integration; provide r15_* evidence fields for full grading",
            });
            return;
        }
        // WARN cases
        const warnReasons = [];
        if (r15_file_paths_staged === false)
            warnReasons.push("file paths scattered; paste-ready code not staged for batch review");
        if (r15_critical_gap_late_discovered === true)
            warnReasons.push("critical gap discovered at last-minute (<15min before fire) instead of flagged ahead");
        if (warnReasons.length > 0) {
            grades.push({
                rule_id: "R15",
                description: R12_R17_RULES[3].description,
                verdict: "WARN",
                evidence: warnReasons.join("; "),
            });
            return;
        }
        grades.push({
            rule_id: "R15",
            description: R12_R17_RULES[3].description,
            verdict: "PASS",
            evidence: "Cohort readiness confirmed: brief §12 current; file paths staged; no pre-emptive review asks",
        });
    })();
    // ── R16: Pawn-Blind-Workaround Respect ────────────────────────────────────
    // TODO(Bishop-integration): cross-reference Toolsmith scribe_log for prior-session
    // workaround directive at runtime. PATTERN_NOT_FULLY_IMPLEMENTED for automated log scan.
    (() => {
        const { r16_prior_session_workaround_directive, r16_dispatch_pawn_attempted_after_directive, r16_dispatch_pawn_scope_unclear, } = evidence;
        // No prior directive on record → SKIP (rule not triggered)
        if (r16_prior_session_workaround_directive === undefined) {
            grades.push({
                rule_id: "R16",
                description: R12_R17_RULES[4].description,
                verdict: "SKIP",
                evidence: "PATTERN_NOT_FULLY_IMPLEMENTED — no prior-session Toolsmith scribe_log workaround directive found; provide r16_* evidence fields for full grading",
            });
            return;
        }
        if (r16_prior_session_workaround_directive === false) {
            grades.push({
                rule_id: "R16",
                description: R12_R17_RULES[4].description,
                verdict: "SKIP",
                evidence: "No prior-session Founder workaround directive on record — rule not triggered",
            });
            return;
        }
        // Directive exists — check for violations
        if (r16_dispatch_pawn_attempted_after_directive === true) {
            grades.push({
                rule_id: "R16",
                description: R12_R17_RULES[4].description,
                verdict: "FAIL",
                evidence: "dispatch_pawn attempted after Founder explicitly routed to paste-to-perplexity-web workaround — silent regression to tool dispatch",
            });
            return;
        }
        if (r16_dispatch_pawn_scope_unclear === true) {
            grades.push({
                rule_id: "R16",
                description: R12_R17_RULES[4].description,
                verdict: "WARN",
                evidence: "dispatch_pawn attempted with unclear scope relative to Founder workaround directive — caution warranted",
            });
            return;
        }
        grades.push({
            rule_id: "R16",
            description: R12_R17_RULES[4].description,
            verdict: "PASS",
            evidence: "Founder workaround directive honored — no dispatch_pawn regression detected for this task class",
        });
    })();
    // ── R17: MCP-Restart-Needed Regression ────────────────────────────────────
    // TODO(Bishop-integration): scan recent Knight commits for "restart required" pattern
    // at runtime via git log. PATTERN_NOT_FULLY_IMPLEMENTED for automated commit scan.
    (() => {
        const { r17_mcp_restart_required_in_commits, r17_dispatch_rook_before_restart, r17_dispatch_rook_restart_status_unclear, } = evidence;
        // No "restart required" commit found → SKIP (rule not triggered)
        if (r17_mcp_restart_required_in_commits === undefined) {
            grades.push({
                rule_id: "R17",
                description: R12_R17_RULES[5].description,
                verdict: "SKIP",
                evidence: "PATTERN_NOT_FULLY_IMPLEMENTED — automated Knight commit scan pending Bishop runtime integration; provide r17_* evidence fields for full grading",
            });
            return;
        }
        if (r17_mcp_restart_required_in_commits === false) {
            grades.push({
                rule_id: "R17",
                description: R12_R17_RULES[5].description,
                verdict: "SKIP",
                evidence: "No 'librarian-mcp restart required' found in recent Knight commits — rule not triggered",
            });
            return;
        }
        // Restart required — check for violations
        if (r17_dispatch_rook_before_restart === true) {
            grades.push({
                rule_id: "R17",
                description: R12_R17_RULES[5].description,
                verdict: "FAIL",
                evidence: "dispatch_rook attempted on stale librarian-mcp env — cached schema / connection state before required restart",
            });
            return;
        }
        if (r17_dispatch_rook_restart_status_unclear === true) {
            grades.push({
                rule_id: "R17",
                description: R12_R17_RULES[5].description,
                verdict: "WARN",
                evidence: "dispatch_rook attempted with unclear Knight restart status — Founder may have restarted manually but confirmation absent from session chat",
            });
            return;
        }
        grades.push({
            rule_id: "R17",
            description: R12_R17_RULES[5].description,
            verdict: "PASS",
            evidence: "librarian-mcp restart confirmed complete before dispatch_rook — cross-lane gating satisfied",
        });
    })();
    return grades;
}
const SESSION_ID_FORMAT = /^(K|B|R|P)\d+$/;
/**
 * Grade R01-R10 rules based on provided evidence.
 * Missing evidence → SKIP (not enough information to grade).
 */
export function gradeR01R10(evidence, session_id) {
    const grades = [];
    // R01: brief_me first
    grades.push({
        rule_id: "R01",
        description: R01_R10_RULES[0].description,
        verdict: evidence.brief_me_called_first === undefined ? "SKIP"
            : evidence.brief_me_called_first ? "PASS" : "FAIL",
        evidence: evidence.brief_me_called_first !== undefined
            ? `brief_me_called_first = ${evidence.brief_me_called_first}`
            : undefined,
    });
    // R02: SKIP — evidence not available at grade-time (style rule, not verifiable without log)
    grades.push({
        rule_id: "R02",
        description: R01_R10_RULES[1].description,
        verdict: "SKIP",
        evidence: "Self-assessed rule; no automated evidence source",
    });
    // R03: SKIP — substrate anchoring is continuous, not session-open verifiable
    grades.push({
        rule_id: "R03",
        description: R01_R10_RULES[2].description,
        verdict: "SKIP",
        evidence: "Continuous discipline; verified via Detective TEAM audit",
    });
    // R04: FORK doctrine
    grades.push({
        rule_id: "R04",
        description: R01_R10_RULES[3].description,
        verdict: evidence.fiat_bridge_detected === undefined ? "SKIP"
            : evidence.fiat_bridge_detected ? "FAIL" : "PASS",
        evidence: evidence.fiat_bridge_detected !== undefined
            ? `fiat_bridge_detected = ${evidence.fiat_bridge_detected}`
            : undefined,
    });
    // R05: K-prompt file-existence verification
    if (evidence.kprompt_paths_referenced === false || evidence.kprompt_paths_referenced === undefined) {
        grades.push({
            rule_id: "R05",
            description: R01_R10_RULES[4].description,
            verdict: "SKIP",
            evidence: "No K-prompt paths referenced in this session",
        });
    }
    else {
        grades.push({
            rule_id: "R05",
            description: R01_R10_RULES[4].description,
            verdict: evidence.kprompt_paths_verified ? "PASS" : "FAIL",
            evidence: `kprompt_paths_verified = ${evidence.kprompt_paths_verified}`,
        });
    }
    // R06: Canon Eblet prior fan-out
    if (evidence.canon_eblet_write_proposed === false || evidence.canon_eblet_write_proposed === undefined) {
        grades.push({
            rule_id: "R06",
            description: R01_R10_RULES[5].description,
            verdict: "SKIP",
            evidence: "No canon Eblet writes proposed in this session",
        });
    }
    else {
        grades.push({
            rule_id: "R06",
            description: R01_R10_RULES[5].description,
            verdict: evidence.prior_detective_fanout ? "PASS" : "FAIL",
            evidence: `prior_detective_fanout = ${evidence.prior_detective_fanout}`,
        });
    }
    // R07: Marks-class payouts only (same as R04 class — check for fiat-bridge)
    grades.push({
        rule_id: "R07",
        description: R01_R10_RULES[6].description,
        verdict: evidence.fiat_bridge_detected ? "FAIL" : "PASS",
        evidence: `fiat_bridge_detected = ${evidence.fiat_bridge_detected ?? false}`,
    });
    // R08: Session ID format
    const validFormat = SESSION_ID_FORMAT.test(session_id ?? "");
    grades.push({
        rule_id: "R08",
        description: R01_R10_RULES[7].description,
        verdict: validFormat ? "PASS" : "WARN",
        evidence: `session_id = "${session_id}" — format ${validFormat ? "valid" : "INVALID (expected K/B/R/P + digits)"}`,
    });
    // R09: Session debrief at close
    grades.push({
        rule_id: "R09",
        description: R01_R10_RULES[8].description,
        verdict: evidence.session_debrief_done === undefined ? "SKIP"
            : evidence.session_debrief_done ? "PASS" : "WARN",
        evidence: evidence.session_debrief_done !== undefined
            ? `session_debrief_done = ${evidence.session_debrief_done}`
            : undefined,
    });
    // R10: Empirical-praise-only — SKIP (Reminder Scribe handles this continuously)
    grades.push({
        rule_id: "R10",
        description: R01_R10_RULES[9].description,
        verdict: "SKIP",
        evidence: "Continuously enforced by Reminder Scribe (KN-I1); see violation-history-summary below",
    });
    return grades;
}
const RULE_DESCRIPTIONS = {
    "R-KP-1": "Full-path enforcement (BISHOP_DROPZONE prefix required)",
    "R-KP-2": "K-prompt file-existence verification (HIGH-STAKES)",
    "R-KP-3": "Queued-vs-ready distinction (text-only for not-yet-drafted)",
    "R-KP-4": "Scribe canon Eblet must have Preferences section",
    "R-PRAISE-1": "Empirically-valid-praise-only",
    "R-PRAISE-2": "Anchored-praise-welcome-unanchored-no",
    "R-DOUBLE-FILE-1": "Search substrate first before unilateral synthesis",
    "R-FORK-1": "Never propose LB-currency-to-fiat conversion (STRUCTURALLY-IMMUTABLE)",
    "R-COUNSEL-1": "Never gate on counsel",
    "R-USPTO-1": "Do not over-instruct USPTO filing process",
};
const ALL_RULE_IDS = Object.keys(RULE_DESCRIPTIONS);
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
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
export function buildViolationHistorySummary(ai_member, _opts = {}) {
    const generated_at = new Date().toISOString();
    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
    try {
        if (!existsSync(VIOLATION_LOG_PATH)) {
            return {
                schema_version: "1.0",
                ai_member,
                window_days: 7,
                generated_at,
                entries: ALL_RULE_IDS.map((ruleId) => ({
                    rule_id: ruleId,
                    rule_description: RULE_DESCRIPTIONS[ruleId] ?? ruleId,
                    violations_7d: 0,
                    last_violation_session: null,
                    correction_stickiness_pct: 100,
                })),
                total_violations_7d: 0,
                total_corrections_7d: 0,
                overall_stickiness_pct: 100,
                data_available: true,
            };
        }
        const raw = readFileSync(VIOLATION_LOG_PATH, "utf-8");
        const lines = raw.split("\n").filter((l) => l.trim());
        const eventsByRule = {};
        for (const line of lines) {
            try {
                const event = JSON.parse(line);
                const ts = typeof event.timestamp === "string" ? event.timestamp : "";
                if (ts < cutoff)
                    continue; // outside rolling 7-day window
                const ruleId = typeof event.rule_id === "string" ? event.rule_id : null;
                if (!ruleId)
                    continue;
                if (!eventsByRule[ruleId])
                    eventsByRule[ruleId] = [];
                eventsByRule[ruleId].push({
                    corrected: Boolean(event.correction_applied),
                    session: typeof event.session_id === "string" ? event.session_id : "unknown",
                    ts,
                });
            }
            catch {
                continue;
            }
        }
        const entries = ALL_RULE_IDS.map((ruleId) => {
            const events = eventsByRule[ruleId] ?? [];
            const violations_7d = events.length;
            const corrected_7d = events.filter((e) => e.corrected).length;
            const stickiness = violations_7d === 0 ? 100
                : Math.round((corrected_7d / violations_7d) * 100);
            const sorted = [...events].sort((a, b) => b.ts.localeCompare(a.ts));
            return {
                rule_id: ruleId,
                rule_description: RULE_DESCRIPTIONS[ruleId] ?? ruleId,
                violations_7d,
                last_violation_session: sorted[0]?.session ?? null,
                correction_stickiness_pct: stickiness,
            };
        });
        const total_violations_7d = entries.reduce((s, e) => s + e.violations_7d, 0);
        const total_corrections_7d = Object.values(eventsByRule)
            .flat()
            .filter((e) => e.corrected).length;
        const overall_stickiness_pct = total_violations_7d === 0 ? 100
            : Math.round((total_corrections_7d / total_violations_7d) * 100);
        return {
            schema_version: "1.0",
            ai_member,
            window_days: 7,
            generated_at,
            entries,
            total_violations_7d,
            total_corrections_7d,
            overall_stickiness_pct,
            data_available: true,
        };
    }
    catch (err) {
        return {
            schema_version: "1.0",
            ai_member,
            window_days: 7,
            generated_at,
            entries: [],
            total_violations_7d: 0,
            total_corrections_7d: 0,
            overall_stickiness_pct: 100,
            data_available: false,
            unavailable_reason: `Reminder Scribe violation log unavailable: ${String(err)}`,
        };
    }
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
export function runSessionOpenGrade(session_id, ai_member, evidence, opts = {}) {
    const graded_at = new Date().toISOString();
    const r01_r10_grades = gradeR01R10(evidence, session_id);
    const r12_r17_grades = gradeR12R17(evidence, session_id);
    const allGrades = [...r01_r10_grades, ...r12_r17_grades];
    const pass_count = allGrades.filter((g) => g.verdict === "PASS").length;
    const warn_count = allGrades.filter((g) => g.verdict === "WARN").length;
    const fail_count = allGrades.filter((g) => g.verdict === "FAIL").length;
    const overall_verdict = fail_count > 0 ? "FAIL"
        : warn_count > 0 ? "WARN" : "PASS";
    const summary = fail_count > 0
        ? `${fail_count} FAIL(s) across R01-R17 — session discipline requires attention before proceeding.`
        : warn_count > 0
            ? `${warn_count} WARN(s) across R01-R17 — review advisory items before proceeding.`
            : `All graded rules PASS (R01-R17) — session discipline clear.`;
    const base = {
        schema_version: "1.0",
        graded_at,
        session_id,
        ai_member,
        r01_r10_grades,
        r12_r17_grades,
        overall_verdict,
        pass_count,
        warn_count,
        fail_count,
        summary,
    };
    const violation_history_summary = buildViolationHistorySummary(ai_member, opts);
    return {
        ...base,
        violation_history_summary,
        extended_at: "KN-I2",
    };
}
// ─── Markdown formatter ───────────────────────────────────────────────────────
/**
 * Format ExtendedGradeResult as human-readable Markdown for session-open display.
 */
export function formatGradeMarkdown(result) {
    const lines = [];
    lines.push(`## Catechist Session-Open Grade — ${result.session_id} (${result.ai_member})`);
    lines.push(`Graded at: ${result.graded_at}`);
    lines.push(`Overall: **${result.overall_verdict}** | PASS: ${result.pass_count} | WARN: ${result.warn_count} | FAIL: ${result.fail_count}`);
    lines.push(`${result.summary}`);
    lines.push("");
    lines.push("### R01-R10 Discipline Grades");
    lines.push("| Rule | Description | Verdict | Evidence |");
    lines.push("|---|---|---|---|");
    for (const g of result.r01_r10_grades) {
        const evidence = g.evidence ?? "—";
        lines.push(`| ${g.rule_id} | ${g.description} | **${g.verdict}** | ${evidence} |`);
    }
    lines.push("");
    lines.push("### R12-R17 Operational Discipline Grades (BP028 — LB-STACK-0071..0076)");
    lines.push("| Rule | Description | Verdict | Evidence |");
    lines.push("|---|---|---|---|");
    for (const g of result.r12_r17_grades) {
        const evidence = g.evidence ?? "—";
        lines.push(`| ${g.rule_id} | ${g.description} | **${g.verdict}** | ${evidence} |`);
    }
    lines.push("");
    const vh = result.violation_history_summary;
    lines.push("### Reminder Scribe Violation History (rolling 7-day window)");
    if (!vh.data_available) {
        lines.push(`**UNAVAILABLE**: ${vh.unavailable_reason ?? "Unknown error"}`);
        lines.push("Reminder Scribe violation log could not be accessed. Discipline tracking suspended for this session.");
    }
    else {
        lines.push(`Total violations (7d): **${vh.total_violations_7d}** | Corrected: ${vh.total_corrections_7d} | Overall stickiness: **${vh.overall_stickiness_pct}%**`);
        lines.push("");
        lines.push("| Rule | Violations (7d) | Last violation session | Correction stickiness |");
        lines.push("|---|---|---|---|");
        for (const entry of vh.entries) {
            const last = entry.last_violation_session ?? "—";
            const sticky = entry.violations_7d === 0 ? "100% (no violations)" : `${entry.correction_stickiness_pct}%`;
            lines.push(`| ${entry.rule_id} | ${entry.violations_7d} | ${last} | ${sticky} |`);
        }
        lines.push("");
        lines.push("*Empirical receipt — counts and rates only. Anti-shame discipline preserved per Reminder Scribe canon BP017 turn 22.*");
    }
    return lines.join("\n");
}
//# sourceMappingURL=grader.js.map
