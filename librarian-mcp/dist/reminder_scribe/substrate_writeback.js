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
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createHmac } from "crypto";
const __filename = fileURLToPath(import.meta.url);
const __dirname_rs = dirname(__filename);
// ─── Paths ────────────────────────────────────────────────────────────────────
const STITCHPUNKS_DIR = resolve(__dirname_rs, "../../stitchpunks");
const RS_DIR = resolve(STITCHPUNKS_DIR, "reminder_scribe");
/** Provenance ledger for Reminder Scribe events (RS-class serial scheme). */
export const RS_PROVENANCE_LEDGER = resolve(RS_DIR, "provenance_ledger.jsonl");
/** Serial counter file for RS cathedral-prefix allocation. */
const RS_SERIAL_COUNTER = resolve(RS_DIR, "rs_serial_counters.json");
/** Local-log retry queue for substrate-unavailable fallback (BRIDLE Rule 4). */
export const RS_RETRY_QUEUE = resolve(RS_DIR, "retry_queue.jsonl");
function ensureRsDir() {
    if (!existsSync(RS_DIR))
        mkdirSync(RS_DIR, { recursive: true });
}
// ─── Cathedral-prefixed serial (RS subclass) ──────────────────────────────────
const RS_CATHEDRAL_CODE = {
    bishop: "M",
    knight: "K",
    pawn: "P",
    rook: "R",
    shadow_alpha: "SA",
    shadow_beta: "SB",
    cross: "X",
};
function readRsCounters() {
    ensureRsDir();
    if (!existsSync(RS_SERIAL_COUNTER))
        return {};
    try {
        return JSON.parse(readFileSync(RS_SERIAL_COUNTER, "utf-8"));
    }
    catch {
        return {};
    }
}
/**
 * Allocate next RS serial for a given AI member.
 * Format: LB-RS.<CATHEDRAL_CODE>-NNNN
 * Example: LB-RS.M-0042 (bishop Reminder Scribe entry #42)
 */
export function allocateRsSerial(ai_member) {
    ensureRsDir();
    const counters = readRsCounters();
    const code = RS_CATHEDRAL_CODE[ai_member] ?? "X";
    const key = `rs_${ai_member}`;
    const current = counters[key] ?? 0;
    const next = current + 1;
    counters[key] = next;
    writeFileSync(RS_SERIAL_COUNTER, JSON.stringify(counters, null, 2), "utf-8");
    return `LB-RS.${code}-${String(next).padStart(4, "0")}`;
}
// ─── Chronos HMAC ─────────────────────────────────────────────────────────────
/**
 * Compute Chronos HMAC for tamper-evidence.
 * Uses HMAC-SHA256 over payload string with timestamp-based key.
 * NOT cryptographic secret — integrity verification for audit trail.
 */
export function computeChronosHmac(payload, timestamp) {
    const key = `lb-rs-chronos-${timestamp.slice(0, 10)}`; // date-keyed (per-day rotation)
    return createHmac("sha256", key).update(payload).digest("hex").slice(0, 16);
}
/**
 * Write a Reminder Scribe violation/correction event to the provenance chain.
 * On substrate failure, falls back to local retry queue (BRIDLE Rule 4).
 */
export function writeBackViolationEvent(opts) {
    ensureRsDir();
    const timestamp = new Date().toISOString();
    const serial = allocateRsSerial(opts.ai_member);
    const payload = {
        provenance_class: "reminder_scribe_violation_correction",
        cathedral_prefixed_serial: serial,
        chronos_hmac: "", // filled below after payload construction
        ai_member: opts.ai_member,
        session_id: opts.session_id,
        event_type: opts.event_type,
        timestamp,
        rule_id: opts.rule_id,
        rule_class: opts.rule_class,
        violation_pattern_match_score: opts.violation_pattern_match_score,
        violation_excerpt: (opts.violation_excerpt ?? "").slice(0, 200),
        pre_send_block_triggered: opts.pre_send_block_triggered,
        correction_applied: opts.correction_applied,
        correction_applied_at: opts.correction_applied_at ?? null,
        correction_proposal: (opts.correction_proposal ?? "").slice(0, 400),
        override_applied: opts.override_applied,
        override_marks_cost: opts.override_marks_cost ?? 0,
        override_rationale: opts.override_rationale ?? null,
        override_class: opts.override_class,
        composing_canon_pointers: opts.composing_canon_pointers ?? [
            "reminder_scribe_class_purpose_scoped_canon_bp017.eblet.md",
        ],
        feedback_memory_pointer: opts.feedback_memory_pointer ?? "",
        post_send_audit_only: opts.post_send_audit_only ?? false,
    };
    const hmac = computeChronosHmac(JSON.stringify(payload), timestamp);
    payload.chronos_hmac = hmac;
    try {
        appendFileSync(RS_PROVENANCE_LEDGER, JSON.stringify(payload) + "\n", "utf-8");
        return { success: true, serial, chronos_hmac: hmac, fallback_to_retry_queue: false };
    }
    catch (err) {
        // BRIDLE Rule 4: substrate unavailable → local retry queue
        try {
            appendFileSync(RS_RETRY_QUEUE, JSON.stringify(payload) + "\n", "utf-8");
        }
        catch {
            // Cannot even write to retry queue — surface error
        }
        return {
            success: false,
            serial,
            chronos_hmac: hmac,
            fallback_to_retry_queue: true,
            error: String(err),
        };
    }
}
/**
 * Query the RS provenance ledger for violation/correction history.
 * Used by reminder_scribe_query_history MCP tool and Catechist KN-I2.
 */
export function queryRsHistory(opts = {}) {
    ensureRsDir();
    if (!existsSync(RS_PROVENANCE_LEDGER))
        return [];
    const rolling_days = opts.rolling_days ?? 7;
    const cutoff = new Date(Date.now() - rolling_days * 24 * 60 * 60 * 1000).toISOString();
    const limit = opts.limit ?? 100;
    let raw;
    try {
        raw = readFileSync(RS_PROVENANCE_LEDGER, "utf-8");
    }
    catch {
        return [];
    }
    const entries = [];
    for (const line of raw.split("\n").reverse()) { // most recent first
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        try {
            const entry = JSON.parse(trimmed);
            // Time filter
            if (entry.timestamp < cutoff)
                continue;
            // Optional filters
            if (opts.ai_member && entry.ai_member !== opts.ai_member)
                continue;
            if (opts.rule_id && entry.rule_id !== opts.rule_id)
                continue;
            if (opts.event_type && entry.event_type !== opts.event_type)
                continue;
            entries.push(entry);
            if (entries.length >= limit)
                break;
        }
        catch {
            continue;
        }
    }
    return entries;
}
/**
 * Drain the local retry queue into the provenance ledger.
 * Called at substrate-recovery time (eventual-consistency BRIDLE Rule 4 pattern).
 */
export function drainRetryQueue() {
    ensureRsDir();
    if (!existsSync(RS_RETRY_QUEUE))
        return { drained: 0, failed: 0, errors: [] };
    let raw;
    try {
        raw = readFileSync(RS_RETRY_QUEUE, "utf-8");
    }
    catch {
        return { drained: 0, failed: 0, errors: ["Could not read retry queue"] };
    }
    const lines = raw.split("\n").filter((l) => l.trim());
    const errors = [];
    let drained = 0;
    let failed = 0;
    const successfulLines = [];
    const failedLines = [];
    for (const line of lines) {
        try {
            appendFileSync(RS_PROVENANCE_LEDGER, line + "\n", "utf-8");
            drained++;
            successfulLines.push(line);
        }
        catch (err) {
            failed++;
            errors.push(String(err));
            failedLines.push(line);
        }
    }
    // Rewrite retry queue with only the lines that failed
    try {
        writeFileSync(RS_RETRY_QUEUE, failedLines.join("\n") + (failedLines.length > 0 ? "\n" : ""), "utf-8");
    }
    catch {
        errors.push("Could not update retry queue after drain");
    }
    return { drained, failed, errors };
}
/** Aggregate RS history entries per rule for Catechist-class consumption. */
export function aggregateByRule(entries) {
    const byRule = new Map();
    for (const e of entries) {
        const existing = byRule.get(e.rule_id) ?? [];
        existing.push(e);
        byRule.set(e.rule_id, existing);
    }
    return Array.from(byRule.entries()).map(([ruleId, ruleEntries]) => {
        const violations = ruleEntries.filter((e) => e.event_type === "violation_detected");
        const corrections = ruleEntries.filter((e) => e.event_type === "correction_applied" || e.correction_applied);
        const overrides_list = ruleEntries.filter((e) => e.event_type === "override_applied" || e.override_applied);
        const marks_spent = ruleEntries.reduce((s, e) => s + (e.override_marks_cost ?? 0), 0);
        const stickiness = violations.length === 0 ? 100
            : Math.round((corrections.length / violations.length) * 100);
        const sorted = [...ruleEntries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        return {
            rule_id: ruleId,
            total_violations: violations.length,
            corrections_applied: corrections.length,
            overrides: overrides_list.length,
            marks_spent,
            correction_stickiness_pct: stickiness,
            last_violation_session: violations[0]?.session_id ?? null,
            last_event_ts: sorted[0]?.timestamp ?? null,
        };
    });
}
//# sourceMappingURL=substrate_writeback.js.map
