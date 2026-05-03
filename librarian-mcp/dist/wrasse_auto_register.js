/**
 * Wrasse Auto-Register — K550/B133
 *
 * TypeScript counterpart to wrasse_registry_writer.py.
 * Called from detective_investigate handler after successful resolution.
 * Architecture decision D.1 = α: direct write from Detective.
 *
 * Stone Tablet Imperative: append-only writes via fs.appendFileSync + fsync.
 * Brick Wall: lock acquisition failure logs and skips — never throws to caller.
 *
 * Config flag: WRASSE_AUTO_REGISTER_ENABLED in librarian-mcp/config/wrasse.json
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, "..", "config", "wrasse.json");
const REGISTRY_RELATIVE = "stitchpunks/wrasse/wrasse_registry.jsonl";
const REGISTRY_PATH = path.join(__dirname, "..", REGISTRY_RELATIVE);
const LOCK_PATH = path.join(path.dirname(REGISTRY_PATH), ".wrasse_registry.lock");
// ─── Config ─────────────────────────────────────────────────────────────────
function isEnabled() {
    try {
        const raw = fs.readFileSync(CONFIG_PATH, "utf8");
        const cfg = JSON.parse(raw);
        return cfg.WRASSE_AUTO_REGISTER_ENABLED !== false;
    }
    catch {
        return false; // default safe: disabled if config unreadable
    }
}
// ─── Trigger extraction ──────────────────────────────────────────────────────
const K_PREFIX_RX = /\bK(\d+)\b/g;
const TS_PREFIX_RX = /\bTS-(\d+)\b/g;
const CALL_SIGN_RX = /v-[\w-]+(?:-K\d+)?/g;
export function extractTriggers(claim) {
    const found = [];
    const seen = new Set();
    const add = (p, c) => {
        const k = p.toLowerCase();
        if (!seen.has(k)) {
            seen.add(k);
            found.push({ trigger_pattern: p, trigger_class: c });
        }
    };
    for (const m of claim.matchAll(K_PREFIX_RX))
        add(m[0], "k_prefix");
    for (const m of claim.matchAll(TS_PREFIX_RX))
        add(m[0], "ts_prefix");
    for (const m of claim.matchAll(CALL_SIGN_RX))
        add(m[0], "call_sign");
    return found;
}
function loadExistingPatterns() {
    const patterns = new Map(); // lower(pattern) -> trigger_id
    if (!fs.existsSync(REGISTRY_PATH))
        return patterns;
    const lines = fs.readFileSync(REGISTRY_PATH, "utf8").split("\n");
    for (const raw of lines) {
        const line = raw.trim();
        if (!line)
            continue;
        try {
            const obj = JSON.parse(line);
            if (obj.record_type === "supersedes")
                continue;
            if (obj.trigger_pattern && obj.trigger_id) {
                patterns.set(obj.trigger_pattern.toLowerCase().trim(), obj.trigger_id);
            }
        }
        catch {
            /* skip malformed lines */
        }
    }
    return patterns;
}
function nextTriggerId() {
    let maxN = 0;
    if (!fs.existsSync(REGISTRY_PATH))
        return "W-001";
    const lines = fs.readFileSync(REGISTRY_PATH, "utf8").split("\n");
    for (const raw of lines) {
        const line = raw.trim();
        if (!line)
            continue;
        try {
            const obj = JSON.parse(line);
            const m = obj.trigger_id?.match(/^W-(\d+)$/);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n > maxN)
                    maxN = n;
            }
        }
        catch {
            /* skip */
        }
    }
    return `W-${String(maxN + 1).padStart(3, "0")}`;
}
function buildTriggerRegex(pattern, triggerClass) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (triggerClass === "k_prefix") {
        const m = pattern.match(/K(\d+)/);
        return m ? `\\bK${m[1]}\\b` : `\\b${escaped}\\b`;
    }
    if (triggerClass === "ts_prefix") {
        const m = pattern.match(/TS-(\d+)/);
        return m ? `\\bTS-${m[1]}\\b` : `\\b${escaped}\\b`;
    }
    if (triggerClass === "call_sign") {
        const base = pattern.replace(/-K\d+$/, "");
        return base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    return `\\b${escaped}\\b`;
}
// ─── Advisory lock (filename-based, cross-platform) ─────────────────────────
function tryAcquireLock(timeout_ms = 3000) {
    const deadline = Date.now() + timeout_ms;
    while (Date.now() < deadline) {
        try {
            const fd = fs.openSync(LOCK_PATH, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
            fs.writeSync(fd, String(process.pid));
            fs.closeSync(fd);
            return true;
        }
        catch (e) {
            if (e.code === "EEXIST") {
                // spin-wait 50ms
                const end = Date.now() + 50;
                while (Date.now() < end) { /* busy wait */ }
            }
            else {
                console.error("[wrasse_auto_register] Lock acquire OS error:", e);
                return false;
            }
        }
    }
    console.warn("[wrasse_auto_register] Lock timeout after", timeout_ms, "ms — skipping write");
    return false;
}
function releaseLock() {
    try {
        if (fs.existsSync(LOCK_PATH))
            fs.unlinkSync(LOCK_PATH);
    }
    catch { /* best effort */ }
}
function appendLine(record) {
    const line = JSON.stringify(record) + "\n";
    const fd = fs.openSync(REGISTRY_PATH, "a");
    try {
        fs.writeSync(fd, line);
        fs.fdatasyncSync(fd);
    }
    finally {
        fs.closeSync(fd);
    }
}
/**
 * Append a new Wrasse registry entry if trigger_pattern is novel.
 * Called from detective_investigate after successful resolution.
 * Brick Wall: never throws; lock failure logs and returns unchanged.
 */
export function appendIfNew(triggerPattern, triggerClass, canonicalResolution, sourceSession) {
    if (!isEnabled())
        return { action: "unchanged", trigger_id: "" };
    if (!triggerPattern.trim() || !canonicalResolution.trim()) {
        return { action: "unchanged", trigger_id: "" };
    }
    try {
        const existing = loadExistingPatterns();
        const key = triggerPattern.toLowerCase().trim();
        if (existing.has(key)) {
            const existingTid = existing.get(key);
            const locked = tryAcquireLock();
            if (!locked)
                return { action: "unchanged", trigger_id: existingTid };
            try {
                appendLine({
                    record_type: "supersedes",
                    trigger_id: existingTid,
                    trigger_pattern: triggerPattern,
                    verification_count_bump: 1,
                    bumped_at: new Date().toISOString(),
                    source_session: sourceSession,
                });
                return { action: "bumped", trigger_id: existingTid };
            }
            finally {
                releaseLock();
            }
        }
        // Novel trigger
        const locked = tryAcquireLock();
        if (!locked)
            return { action: "unchanged", trigger_id: "" };
        try {
            const triggerId = nextTriggerId();
            const triggerRegex = buildTriggerRegex(triggerPattern, triggerClass);
            appendLine({
                trigger_id: triggerId,
                trigger_class: triggerClass,
                trigger_pattern: triggerPattern,
                trigger_regex: triggerRegex,
                canonical_resolution: canonicalResolution,
                last_verified_ts: new Date().toISOString(),
                verification_count: 1,
                source_session: sourceSession,
                scope: "public",
            });
            return { action: "appended", trigger_id: triggerId };
        }
        finally {
            releaseLock();
        }
    }
    catch (e) {
        console.error("[wrasse_auto_register] appendIfNew failed:", e, "— skipping");
        return { action: "unchanged", trigger_id: "" };
    }
}
/**
 * Auto-register all trigger patterns extracted from a Detective claim string.
 * Called after detective_investigate resolves (phase0 hits > 0 OR phase1 results > 0).
 * Resolution summary is built from the detective result object.
 */
export function autoRegisterFromDetective(claim, resolutionSummary, sourceSession) {
    if (!isEnabled())
        return [];
    const triggers = extractTriggers(claim);
    const results = [];
    for (const { trigger_pattern, trigger_class } of triggers) {
        const result = appendIfNew(trigger_pattern, trigger_class, resolutionSummary, sourceSession);
        if (result.action !== "unchanged") {
            results.push(result);
        }
    }
    return results;
}
//# sourceMappingURL=wrasse_auto_register.js.map
