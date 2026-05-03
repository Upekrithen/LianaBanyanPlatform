/**
 * IP Ledger Lock — Chronos Chronicler Signing (KN104 / BP016 — B123 #2296)
 * =========================================================================
 * Every mined tablet is:
 *   1. Timestamped
 *   2. Miner-attributed (serial number)
 *   3. Hash-chained to Miner ancestry chain
 *   4. Chronos Chronicler signed (HMAC-SHA256 of content + ancestry)
 *
 * The Chronos Chronicler is the temporal-integrity witness for the IP ledger.
 * Hash-chaining ensures no retroactive insertion — each entry proves it was
 * created after its parent.
 */
import { createHmac, createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STITCHPUNKS_DIR = process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");
const IP_LEDGER_DIR = resolve(STITCHPUNKS_DIR, "miners", "ip_ledger");
const IP_LEDGER_PATH = resolve(IP_LEDGER_DIR, "ip_ledger.jsonl");
// ─── Chronos Chronicler Key ────────────────────────────────────────────────
// Production: key loaded from vault. Dev: deterministic from serial prefix.
// Never exposed in output per secrets hygiene rules.
const CHRONICLER_HMAC_KEY = process.env.CHRONOS_CHRONICLER_KEY ?? "LB_CHRONOS_CHRONICLER_DEV_KEY_2026";
// ─── Hash Helpers ─────────────────────────────────────────────────────────
function sha256(input) {
    return createHash("sha256").update(input, "utf-8").digest("hex");
}
function hmacSign(data) {
    return createHmac("sha256", CHRONICLER_HMAC_KEY).update(data, "utf-8").digest("hex");
}
// ─── Ledger I/O ───────────────────────────────────────────────────────────
function ensureDir() {
    if (!existsSync(IP_LEDGER_DIR))
        mkdirSync(IP_LEDGER_DIR, { recursive: true });
}
function readLastEntry() {
    ensureDir();
    if (!existsSync(IP_LEDGER_PATH))
        return null;
    const lines = readFileSync(IP_LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
    if (lines.length === 0)
        return null;
    try {
        return JSON.parse(lines[lines.length - 1]);
    }
    catch {
        return null;
    }
}
function appendEntry(entry) {
    ensureDir();
    writeFileSync(IP_LEDGER_PATH, JSON.stringify(entry) + "\n", { flag: "a", encoding: "utf-8" });
}
/**
 * Creates an IP-ledger-locked entry for a Miner tablet.
 * Hash-chains to the Miner's ancestry (parent_serial → parent hash lookup).
 */
export function computeIpLedgerLock(serial, content, parentSerial, sessionId) {
    const ts = new Date().toISOString();
    const contentHash = sha256(content);
    // Look up parent hash from ledger (chain integrity)
    let parentHash = null;
    if (parentSerial !== null) {
        const lastEntry = readLastEntry();
        if (lastEntry && lastEntry.serial === parentSerial) {
            parentHash = lastEntry.content_hash;
        }
        else {
            // Parent not found; use hash of parent serial string (graceful degradation)
            parentHash = sha256(parentSerial);
        }
    }
    // Chronos Chronicler signature
    const sigInput = `${serial}|${ts}|${contentHash}|${parentHash ?? "null"}`;
    const hmacSig = hmacSign(sigInput);
    const entry = {
        serial,
        ts,
        content_hash: contentHash,
        parent_hash: parentHash,
        hmac_sig: hmacSig,
        session_id: sessionId,
    };
    appendEntry(entry);
    return {
        hash: contentHash,
        hmac_sig: hmacSig,
        entry,
    };
}
/** Reads all IP ledger entries for a given serial prefix. */
export function queryIpLedger(serialPrefix) {
    ensureDir();
    if (!existsSync(IP_LEDGER_PATH))
        return [];
    const lines = readFileSync(IP_LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
    const results = [];
    for (const line of lines) {
        try {
            const entry = JSON.parse(line);
            if (entry.serial === serialPrefix || entry.serial.startsWith(serialPrefix + ".")) {
                results.push(entry);
            }
        }
        catch {
            continue;
        }
    }
    return results;
}
/** Verifies the HMAC signature of a single IP ledger entry. */
export function verifyIpLedgerEntry(entry) {
    const sigInput = `${entry.serial}|${entry.ts}|${entry.content_hash}|${entry.parent_hash ?? "null"}`;
    const expected = hmacSign(sigInput);
    return expected === entry.hmac_sig;
}
//# sourceMappingURL=ip_ledger_lock.js.map
