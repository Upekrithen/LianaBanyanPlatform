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
import type { ProvenanceReceipt, IronTabletLedgerEntry } from "./types.js";
declare function getLedgerPath(ebletPath: string): string;
export declare function readLedgerEntries(ledgerPath: string): IronTabletLedgerEntry[];
/** Compute SHA-256 hex hash of a content string. */
export declare function computeHash(content: string): string;
/**
 * Append a provenance record to the Stone Tablet ledger, holding the mutex
 * for this ledger while doing so. Returns the completed ProvenanceReceipt.
 *
 * The mutex ensures: if multiple callers race, each gets a unique, monotonically
 * increasing sequence number and the file is never partially-written.
 */
export declare function stoneAppend(params: {
    scribeId: string;
    ebletPath: string;
    hash: string;
    session: string;
    decisionId?: string;
    conflict?: boolean;
}): Promise<ProvenanceReceipt>;
/**
 * Read provenance entries for a specific eblet path from the Stone Tablet ledger.
 * Filters to only entries belonging to this ebletPath (ledger is shared per-directory).
 */
export declare function stoneReadProvenance(ebletPath: string): ProvenanceReceipt[];
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
export declare function pruneOldHeartbeatAppends(ledgerPath: string, retentionDays: number, currentTimestamp?: number): {
    pruned: number;
    preserved: number;
};
/** Expose the ledger path for tests/diagnostics. */
export { getLedgerPath };
