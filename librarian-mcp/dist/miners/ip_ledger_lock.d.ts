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
export interface IpLedgerEntry {
    serial: string;
    ts: string;
    content_hash: string;
    parent_hash: string | null;
    hmac_sig: string;
    session_id: string;
}
export interface IpLockResult {
    hash: string;
    hmac_sig: string;
    entry: IpLedgerEntry;
}
/**
 * Creates an IP-ledger-locked entry for a Miner tablet.
 * Hash-chains to the Miner's ancestry (parent_serial → parent hash lookup).
 */
export declare function computeIpLedgerLock(serial: string, content: string, parentSerial: string | null, sessionId: string): IpLockResult;
/** Reads all IP ledger entries for a given serial prefix. */
export declare function queryIpLedger(serialPrefix: string): IpLedgerEntry[];
/** Verifies the HMAC signature of a single IP ledger entry. */
export declare function verifyIpLedgerEntry(entry: IpLedgerEntry): boolean;
