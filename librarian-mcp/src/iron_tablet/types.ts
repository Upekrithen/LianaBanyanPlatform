/**
 * Iron Tablet Types — KN089 / BP011 Pod W Bean 1
 * ================================================
 * Shared type surface for the fused Stone Tablet + Eblet primitive.
 *
 * "Iron" carries the non-weaponization semantics of BP011 Iron E-Giant tagline:
 * multi-organism shared ledger as architectural form of the cooperative pledge.
 */

/** Immutable record of a single Iron Tablet write, persisted in the Stone Tablet ledger. */
export interface ProvenanceReceipt {
  /** Organism's scribe-id (e.g., "R11_shadow_alpha"). */
  scribeId: string;
  /** Absolute path to the eblet file this write touched. */
  ebletPath: string;
  /** SHA-256 hex of the content written. */
  hash: string;
  /** Monotonically increasing position in this tablet's Stone ledger. */
  sequence: number;
  /** ISO-8601 timestamp of the write. */
  ts: string;
  /** Session that performed the write. */
  session: string;
  /** Optional decision ID for traceability. */
  decisionId?: string;
}

/** Surfaced when concurrent writers diverge on Eblet content. */
export interface ConcurrencyConflict {
  type: "hash_divergence";
  /** Hash the caller observed when it read the eblet before acquiring the mutex. */
  callerHash: string;
  /** Hash found in the eblet when the mutex was acquired (written by a prior organism). */
  existingHash: string;
  /** Scribe ID of the write that detected the conflict. */
  scribeId: string;
  /** ISO-8601 timestamp of conflict detection. */
  ts: string;
}

/** Parameters for a single Iron Tablet write. */
export interface IronTabletWriteParams {
  scribeId: string;
  ebletPath: string;
  content: string;
  provenance: { session: string; decisionId?: string };
}

/** Return value from ironTabletWrite. */
export interface IronTabletWriteResult {
  stoneReceipt: ProvenanceReceipt;
  ebletHash: string;
  conflict?: ConcurrencyConflict;
}

/** Return value from ironTabletRead. */
export interface IronTabletReadResult {
  content: string;
  ebletHash: string;
  stoneProvenance: ProvenanceReceipt[];
}

/** Raw ledger entry persisted in the Stone Tablet JSONL file. */
export interface IronTabletLedgerEntry {
  ts: string;
  scribeId: string;
  ebletPath: string;
  hash: string;
  sequence: number;
  session: string;
  decisionId?: string;
  conflict?: boolean;
}
