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
import { existsSync } from "fs";
import { join, resolve } from "path";
import { buildRulesRegistry, DEFAULT_PREFERENCES, } from "./rules_registry.js";
// ─── Engine ────────────────────────────────────────────────────────────────────
const VIOLATION_THRESHOLD = 0.7;
const WORKSPACE_ROOT_MARKERS = ["package.json", "librarian-mcp", "platform"];
function detectWorkspaceRoot() {
    // Walk up from current file to find workspace root
    let dir = resolve(new URL(import.meta.url).pathname, "../../../..");
    for (let i = 0; i < 6; i++) {
        if (WORKSPACE_ROOT_MARKERS.some((m) => existsSync(join(dir, m)))) {
            return dir;
        }
        dir = resolve(dir, "..");
    }
    return dir;
}
/**
 * Match a single rule against the response draft text.
 * Returns array of ViolationMatch objects (empty if no match).
 */
function matchRule(rule, text, workspaceRoot, prefs) {
    const matches = [];
    for (const p of rule.patterns) {
        if (p.type === "regex" || p.type === "anti-pattern" || p.type === "path-format" || p.type === "context-heuristic") {
            if (!p.pattern)
                continue;
            const regex = new RegExp(p.pattern, p.flags ?? "gi");
            let m;
            if (p.type === "anti-pattern") {
                // Anti-pattern: presence is a violation
                while ((m = regex.exec(text)) !== null) {
                    matches.push({
                        matched_text: m[0].slice(0, 80),
                        offset: m.index,
                        likelihood: 0.9,
                    });
                }
            }
            else if (p.type === "regex") {
                // R-KP-1: presence of bare PROMPT_KNIGHT filename WITHOUT the BISHOP_DROPZONE prefix
                while ((m = regex.exec(text)) !== null) {
                    const matchStart = m.index;
                    // Check if immediately preceded by the correct prefix
                    const preceding = text.slice(Math.max(0, matchStart - 60), matchStart);
                    if (!preceding.match(/BISHOP_DROPZONE[/\\]01_KnightPrompts[/\\]\s*$/)) {
                        matches.push({
                            matched_text: m[0].slice(0, 80),
                            offset: matchStart,
                            likelihood: 0.85,
                        });
                    }
                }
            }
            else if (p.type === "path-format") {
                // R-KP-3: path-formatted reference for queued K-prompts
                while ((m = regex.exec(text)) !== null) {
                    matches.push({
                        matched_text: m[0].slice(0, 80),
                        offset: m.index,
                        likelihood: 0.75,
                    });
                }
            }
            else if (p.type === "context-heuristic") {
                // Context-heuristic patterns (R-MS-1, R-PAWN-1, R-ROOK-1):
                // Text-class trigger — flags text mention of the pattern.
                // Full tool-call-record / session-context integration is marked TODO in each rule's
                // correction_proposal. Likelihood is lower (0.72) to reflect partial coverage.
                // Engine caller should apply session-context exclusions before acting on the flag.
                while ((m = regex.exec(text)) !== null) {
                    matches.push({
                        matched_text: m[0].slice(0, 80),
                        offset: m.index,
                        likelihood: 0.72,
                    });
                }
            }
        }
        else if (p.type === "file-existence" && p.pattern) {
            // R-KP-2: extract referenced paths and verify they exist
            const pathRegex = new RegExp(p.pattern, p.flags ?? "gi");
            let m;
            while ((m = pathRegex.exec(text)) !== null) {
                // m[1] should be the filename (capture group 1)
                const filename = m[1] ?? m[0];
                const fullPath = join(workspaceRoot, "BISHOP_DROPZONE", "01_KnightPrompts", filename);
                if (!existsSync(fullPath)) {
                    matches.push({
                        matched_text: `${filename} (NOT FOUND AT ${fullPath})`,
                        offset: m.index,
                        likelihood: 1.0, // file-not-found is certain
                    });
                }
            }
        }
    }
    return matches;
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
export function runReminderScribeCheck(response_draft, opts = {}) {
    const checked_at = new Date().toISOString();
    const workspaceRoot = opts.workspaceRoot ?? detectWorkspaceRoot();
    const prefs = {
        ...DEFAULT_PREFERENCES,
        ...opts.preferences,
    };
    let registry;
    try {
        registry = buildRulesRegistry(opts.memoryDir, opts.preferences);
    }
    catch (err) {
        return {
            schema_version: "1.0",
            checked_at,
            engine: "reminder-scribe-pattern-match-v1",
            response_length_chars: response_draft.length,
            rules_checked: 0,
            violations_found: 0,
            blocks_response: false,
            structurally_immutable_violations: 0,
            violations: [],
            clean: false,
            summary: "BRIDLE Rule 4 HALT: Reminder Scribe engine failed to initialize rules registry. " +
                "Response NOT cleared for send. Fix rules_registry.ts and retry.",
            bridle_rule_4_applied: true,
            error_receipt: String(err),
            registry_stats: {
                total_rules: 0,
                founder_mandatory: 0,
                high_stakes: 0,
                memory_sources: 0,
                build_errors: [String(err)],
            },
        };
    }
    const violations = [];
    // Sort rules by priority (ascending = highest priority first)
    const sortedRules = [...registry.rules].sort((a, b) => a.priority - b.priority);
    for (const rule of sortedRules) {
        const matches = matchRule(rule, response_draft, workspaceRoot, prefs);
        // Filter by violation threshold
        const confirmedMatches = matches.filter((m) => m.likelihood >= VIOLATION_THRESHOLD);
        if (confirmedMatches.length === 0)
            continue;
        violations.push({
            rule_id: rule.id,
            rule_priority: rule.priority,
            class: rule.class,
            description: rule.description,
            matches: confirmedMatches,
            correction_proposal: rule.correction_proposal,
            override_class: rule.override_class,
            blocks_response: rule.blocks_response,
            memory_pointer: rule.memory_pointer,
            confidence: confirmedMatches.some((m) => m.likelihood >= 0.9) ? "confirmed" : "review",
        });
    }
    const blocks_response = violations.some((v) => v.blocks_response);
    const structurally_immutable_violations = violations.filter((v) => v.override_class === "structurally-immutable").length;
    const clean = violations.length === 0;
    const summary = buildSummary(violations, clean, blocks_response, registry.total_rules);
    return {
        schema_version: "1.0",
        checked_at,
        engine: "reminder-scribe-pattern-match-v1",
        response_length_chars: response_draft.length,
        rules_checked: sortedRules.length,
        violations_found: violations.length,
        blocks_response,
        structurally_immutable_violations,
        violations,
        clean,
        summary,
        bridle_rule_4_applied: false,
        registry_stats: {
            total_rules: registry.total_rules,
            founder_mandatory: registry.founder_mandatory_count,
            high_stakes: registry.high_stakes_count,
            memory_sources: registry.memory_sources_scanned,
            build_errors: registry.build_errors,
        },
    };
}
// ─── Helper ───────────────────────────────────────────────────────────────────
function buildSummary(violations, clean, blocks_response, rules_checked) {
    if (clean) {
        return `PASS: Reminder Scribe check clean — 0 violations across ${rules_checked} active rules. Response cleared for send.`;
    }
    const blocking = violations.filter((v) => v.blocks_response);
    const structural = violations.filter((v) => v.override_class === "structurally-immutable");
    const reviewable = violations.filter((v) => !v.blocks_response);
    const parts = [
        `VIOLATIONS DETECTED: ${violations.length} across ${rules_checked} rules.`,
    ];
    if (structural.length > 0) {
        parts.push(`STRUCTURALLY-IMMUTABLE (cannot override): ${structural.map((v) => v.rule_id).join(", ")}. ` +
            `Response BLOCKED. Fix these violations before send.`);
    }
    if (blocking.length > 0 && structural.length === 0) {
        parts.push(`BLOCKING violations (Marks-cost to override): ${blocking.map((v) => v.rule_id).join(", ")}. ` +
            `Response blocked until resolved or overridden.`);
    }
    if (reviewable.length > 0) {
        parts.push(`Review violations (free to override): ${reviewable.map((v) => v.rule_id).join(", ")}. ` +
            `Review correction proposals and apply or explicitly override.`);
    }
    return parts.join(" ");
}
/**
 * Build a ViolationEvent for Detective TEAM provenance write-back (KN-I3).
 */
export function buildViolationEvent(flag, opts) {
    const override_marks_cost = flag.override_class === "marks-cost" && opts.override_used ? 1 : 0;
    return {
        event_type: "reminder_scribe_violation_correction",
        session_id: opts.session_id,
        rule_id: flag.rule_id,
        rule_class: flag.class,
        violation_confirmed: flag.confidence === "confirmed",
        correction_applied: opts.correction_applied,
        override_used: opts.override_used,
        override_marks_cost,
        timestamp: new Date().toISOString(),
        response_excerpt: (opts.response_excerpt ?? "").slice(0, 120),
        memory_pointer: flag.memory_pointer,
        correction_proposal_excerpt: flag.correction_proposal.slice(0, 200),
    };
}
//# sourceMappingURL=pattern_match_engine.js.map
