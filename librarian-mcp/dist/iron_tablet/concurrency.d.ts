/**
 * Concurrency — KN089 / BP011 Pod W Bean 1
 * ==========================================
 * Fused write semantics: Stone Tablet mutex serializes; Eblet atomic replace;
 * ConcurrencyConflict surfaced (not auto-resolved).
 *
 * Fused write sequence:
 *   1. Read current eblet hash (caller's snapshot before mutex).
 *   2. Acquire Stone Tablet mutex for this ledger.
 *   3. Re-read eblet hash (authoritative — mutex is held).
 *   4. If on-disk hash ≠ caller snapshot hash → hash_divergence conflict.
 *   5. Write new content to Eblet atomically (last-write-wins regardless of conflict).
 *   6. Append to Stone Tablet ledger (authoritative, append-only — always succeeds).
 *   7. Release mutex.
 *
 * The Stone Tablet ledger records EVERY write attempt, including conflicted ones.
 * This makes Stone the authoritative replay log: even if the Eblet file is lost,
 * the ledger preserves the hash + session + scribeId of every intent.
 */
import { computeHash } from "./stone_layer.js";
import type { IronTabletWriteParams, IronTabletWriteResult, IronTabletReadResult, ProvenanceReceipt } from "./types.js";
export declare function fusedWrite(params: IronTabletWriteParams): Promise<IronTabletWriteResult>;
export declare function fusedRead(ebletPath: string): IronTabletReadResult | null;
export declare function fusedProvenance(ebletPath: string): ProvenanceReceipt[];
export { computeHash };
