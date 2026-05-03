/**
 * Iron Tablet — KN089 / BP011 Pod W Bean 1
 * ==========================================
 * Public API surface: fused Stone Tablet + Eblet primitive.
 *
 * Crown-Jewel-class. "Iron" carries the non-weaponization semantics of the
 * BP011 Iron E-Giant tagline: the multi-organism shared ledger is the
 * architectural form of the cooperative pledge ("help each other help ourselves").
 *
 * API:
 *   ironTabletWrite(params)      → single read/write touching both layers atomically
 *   ironTabletRead(ebletPath)    → current Eblet content + full Stone provenance
 *   ironTabletList(dir)          → list known eblet paths in a directory (by ledger)
 *   ironTabletProvenance(path)   → Stone Tablet provenance chain only (no Eblet read)
 *
 * Default scribeId falls back to env var IRON_TABLET_SCRIBE_ID or "iron_tablet_default".
 *
 * Foundation for BP011 Pod W:
 *   KN090 — Shadow promotion
 *   KN091 — In-concert protocol
 *   KN092 — Pawn-Librarian access
 */
import type { IronTabletWriteParams, IronTabletWriteResult, IronTabletReadResult, ProvenanceReceipt } from "./types.js";
export type { IronTabletWriteParams, IronTabletWriteResult, IronTabletReadResult, ProvenanceReceipt, };
/**
 * Write content to an Iron Tablet atomically.
 *
 * Touches both the Stone Tablet ledger (append-only, authoritative) and the
 * Eblet file (content-addressed, last-write-wins). Returns a ProvenanceReceipt
 * and the final Eblet content hash. If a concurrent write was detected, also
 * returns a ConcurrencyConflict (not auto-resolved — caller's responsibility).
 *
 * @param params.scribeId   Organism's scribe-id. Defaults to IRON_TABLET_SCRIBE_ID env or "iron_tablet_default".
 * @param params.ebletPath  Absolute or ~-prefixed path to the .eblet.md file.
 * @param params.content    Full content to write.
 * @param params.provenance { session, decisionId? } — recorded in Stone ledger.
 */
export declare function ironTabletWrite(params: IronTabletWriteParams): Promise<IronTabletWriteResult>;
/**
 * Read an Iron Tablet: returns current Eblet content + full Stone provenance.
 *
 * Returns null if the Eblet file does not exist (uninitialized or deleted).
 * The Stone provenance is still available via ironTabletProvenance even if the
 * Eblet file is gone — use it for partial-state recovery.
 */
export declare function ironTabletRead(ebletPath: string): Promise<IronTabletReadResult | null>;
/**
 * Return the Stone Tablet provenance chain for an eblet path.
 *
 * Always returns the full ledger even if the Eblet file has been deleted.
 * Empty array if the tablet has never been written.
 */
export declare function ironTabletProvenance(ebletPath: string): Promise<ProvenanceReceipt[]>;
/**
 * List eblet paths that have Stone Tablet ledger entries in a given directory.
 *
 * Reads the single iron_tablet_ledger.jsonl in the directory and returns the
 * unique set of ebletPaths recorded there. Does NOT require the Eblet files
 * to still exist.
 *
 * @param dir  Absolute path to directory containing iron_tablet_ledger.jsonl.
 */
export declare function ironTabletList(dir: string): Promise<string[]>;
