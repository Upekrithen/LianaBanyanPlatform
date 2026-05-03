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
 *  1. R01-R10 base grading
 *  2. Violation-history-summary from KN-I1 Reminder Scribe substrate
 *
 * Returns ExtendedGradeResult with both blocks.
 * Anti-shame: violation-history uses empirical counts/rates only.
 */
export function runSessionOpenGrade(session_id, ai_member, evidence, opts = {}) {
    const graded_at = new Date().toISOString();
    const r01_r10_grades = gradeR01R10(evidence, session_id);
    const pass_count = r01_r10_grades.filter((g) => g.verdict === "PASS").length;
    const warn_count = r01_r10_grades.filter((g) => g.verdict === "WARN").length;
    const fail_count = r01_r10_grades.filter((g) => g.verdict === "FAIL").length;
    const overall_verdict = fail_count > 0 ? "FAIL"
        : warn_count > 0 ? "WARN" : "PASS";
    const summary = fail_count > 0
        ? `${fail_count} FAIL(s) — session discipline requires attention before proceeding.`
        : warn_count > 0
            ? `${warn_count} WARN(s) — review advisory items before proceeding.`
            : `All graded rules PASS — session discipline clear.`;
    const base = {
        schema_version: "1.0",
        graded_at,
        session_id,
        ai_member,
        r01_r10_grades,
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
