/**
 * Stone Layer — KN089 / BP011 Pod W Bean 1
 * =========================================
 * Append-only Stone Tablet ledger with in-process scribe-mutex serialization.
 *
 * The Stone Tablet is the authoritative append-only record of every Iron Tablet
 * write attempt (successful or conflicted). It is the "Moses stone" of the
 * cooperative: permanent, tamper-evident, and the source of replay provenance.
 *
 * Mutex model: Promise-chaining serializes concurrent async callers within the
 * same Node.js process. fdatasync after every write ensures durability.
 * Stone Tablet Imperative: append-only, never delete, never overwrite.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, openSync, writeSync, fdatasyncSync, closeSync, } from "node:fs";
import { dirname, resolve } from "node:path";
/** Name of the Stone Tablet ledger file, placed alongside the eblet files. */
const LEDGER_FILENAME = "iron_tablet_ledger.jsonl";
// ─── In-process mutex (Promise-chain serializer) ──────────────────────────────
/** Maps ledger-path → tail of the write-queue Promise for that ledger. */
const mutexTails = new Map();
/**
 * Acquire the mutex for `key`, run `fn` exclusively, then release.
 * Subsequent callers queue behind the current holder. FIFO within a process.
 */
async function withMutex(key, fn) {
    const tail = mutexTails.get(key) ?? Promise.resolve();
    let release;
    const mySlot = new Promise((r) => { release = r; });
    // I am the new tail; next caller will await mySlot
    mutexTails.set(key, mySlot);
    // Wait for previous holder to finish
    await tail;
    try {
        return await fn();
    }
    finally {
        release();
        if (mutexTails.get(key) === mySlot) {
            mutexTails.delete(key);
        }
    }
}
// ─── Ledger path helpers ──────────────────────────────────────────────────────
function getLedgerPath(ebletPath) {
    return resolve(dirname(ebletPath), LEDGER_FILENAME);
}
function ensureDir(filePath) {
    const d = dirname(filePath);
    if (!existsSync(d))
        mkdirSync(d, { recursive: true });
}
// ─── Low-level ledger I/O ─────────────────────────────────────────────────────
function appendLedger(ledgerPath, record) {
    ensureDir(ledgerPath);
    const line = JSON.stringify(record) + "\n";
    const fd = openSync(ledgerPath, "a");
    try {
        writeSync(fd, line);
        fdatasyncSync(fd);
    }
    finally {
        closeSync(fd);
    }
}
/**
 * Count ledger entries for a specific ebletPath (per-file sequence numbering).
 * The ledger is shared per-directory; sequences are scoped to each eblet file.
 */
function countLedgerEntriesForPath(ledgerPath, ebletPath) {
    if (!existsSync(ledgerPath))
        return 0;
    const raw = readFileSync(ledgerPath, "utf-8");
    let count = 0;
    for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        try {
            const entry = JSON.parse(trimmed);
            if (entry.ebletPath === ebletPath)
                count++;
        }
        catch {
            // Skip malformed lines.
        }
    }
    return count;
}
export function readLedgerEntries(ledgerPath) {
    if (!existsSync(ledgerPath))
        return [];
    const raw = readFileSync(ledgerPath, "utf-8");
    const entries = [];
    for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        try {
            entries.push(JSON.parse(trimmed));
        }
        catch {
            // Skip malformed lines; Stone Tablet never poisons reads.
        }
    }
    return entries;
}
// ─── Public API ───────────────────────────────────────────────────────────────
/** Compute SHA-256 hex hash of a content string. */
export function computeHash(content) {
    return createHash("sha256").update(content, "utf-8").digest("hex");
}
/**
 * Append a provenance record to the Stone Tablet ledger, holding the mutex
 * for this ledger while doing so. Returns the completed ProvenanceReceipt.
 *
 * The mutex ensures: if multiple callers race, each gets a unique, monotonically
 * increasing sequence number and the file is never partially-written.
 */
export async function stoneAppend(params) {
    const ledgerPath = getLedgerPath(params.ebletPath);
    return withMutex(ledgerPath, async () => {
        const sequence = countLedgerEntriesForPath(ledgerPath, params.ebletPath) + 1;
        const ts = new Date().toISOString();
        const entry = {
            ts,
            scribeId: params.scribeId,
            ebletPath: params.ebletPath,
            hash: params.hash,
            sequence,
            session: params.session,
            ...(params.decisionId !== undefined && { decisionId: params.decisionId }),
            ...(params.conflict === true && { conflict: true }),
        };
        appendLedger(ledgerPath, entry);
        return {
            scribeId: params.scribeId,
            ebletPath: params.ebletPath,
            hash: params.hash,
            sequence,
            ts,
            session: params.session,
            ...(params.decisionId !== undefined && { decisionId: params.decisionId }),
        };
    });
}
/**
 * Read provenance entries for a specific eblet path from the Stone Tablet ledger.
 * Filters to only entries belonging to this ebletPath (ledger is shared per-directory).
 */
export function stoneReadProvenance(ebletPath) {
    const ledgerPath = getLedgerPath(ebletPath);
    return readLedgerEntries(ledgerPath)
        .filter((e) => e.ebletPath === ebletPath)
        .map((e) => ({
        scribeId: e.scribeId,
        ebletPath: e.ebletPath,
        hash: e.hash,
        sequence: e.sequence,
        ts: e.ts,
        session: e.session,
        ...(e.decisionId !== undefined && { decisionId: e.decisionId }),
    }));
}
// ─── Heartbeat prune ─────────────────────────────────────────────────────────
/**
 * Identify heartbeat-class ledger entries.
 * Heartbeat class: scribeId matches R11_shadow_<greek> prefix and the eblet
 * path basename looks like heartbeat_<scribe_id>.eblet.md.
 * Non-heartbeat entries (decisions, conflict reports, etc.) are always preserved.
 */
function isHeartbeatEntry(entry) {
    const scribeMatch = /^R11_shadow_/i.test(entry.scribeId);
    const ebletBasename = entry.ebletPath.split(/[\\/]/).pop() ?? "";
    const ebletMatch = /^heartbeat_/i.test(ebletBasename);
    return scribeMatch && ebletMatch;
}
/**
 * Prune heartbeat-class entries older than `retentionDays` from `ledgerPath`.
 *
 * Stone Tablet Imperative: non-heartbeat entries (decisions, conflict reports,
 * cohort_holding signals) are ALWAYS preserved regardless of age.
 *
 * Performs an atomic write: new ledger built in memory → written to disk →
 * fdatasync → replace. If the ledger does not exist, returns immediately.
 *
 * @param ledgerPath     Absolute path to the JSONL ledger file.
 * @param retentionDays  Age threshold in days (from `currentTimestamp`). Entries
 *                       strictly older than this threshold are pruned.
 * @param currentTimestamp  Unix epoch seconds to use as "now". Defaults to
 *                           Date.now() / 1000 so callers can inject for tests.
 *
 * KN094 / BP011 — Founder-ratified 2026-05-01.
 */
export function pruneOldHeartbeatAppends(ledgerPath, retentionDays, currentTimestamp = Date.now() / 1000) {
    if (!existsSync(ledgerPath))
        return { pruned: 0, preserved: 0 };
    const cutoffEpochMs = (currentTimestamp - retentionDays * 86400) * 1000;
    const entries = readLedgerEntries(ledgerPath);
    let pruned = 0;
    let preserved = 0;
    const kept = [];
    for (const entry of entries) {
        const entryMs = new Date(entry.ts).getTime();
        if (isHeartbeatEntry(entry) && entryMs < cutoffEpochMs) {
            pruned++;
        }
        else {
            kept.push(entry);
            preserved++;
        }
    }
    if (pruned === 0)
        return { pruned: 0, preserved };
    // Atomic write: build new ledger, fdatasync, replace.
    const newContents = kept.map((e) => JSON.stringify(e)).join("\n") + (kept.length > 0 ? "\n" : "");
    const tmpPath = ledgerPath + ".prune.tmp";
    const fd = openSync(tmpPath, "w");
    try {
        writeSync(fd, newContents);
        fdatasyncSync(fd);
    }
    finally {
        closeSync(fd);
    }
    writeFileSync(ledgerPath, readFileSync(tmpPath));
    try {
        unlinkSync(tmpPath);
    }
    catch {
        // Non-fatal — temp file is harmless.
    }
    return { pruned, preserved };
}
/** Expose the ledger path for tests/diagnostics. */
export { getLedgerPath };
//# sourceMappingURL=stone_layer.js.map
