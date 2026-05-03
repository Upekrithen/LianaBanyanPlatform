/**
 * Provenance Chain — ROOT-Lineage Tracking for Miner Outputs (KN104 / BP016)
 * ===========================================================================
 * Cathedral-prefixed serial-number scheme for Miner lineage.
 * Every daughter Miner traces back to its Root Miner via this chain.
 *
 * Serial format: LB-CAT.<origin>-<zero-padded-seq>[.<suffix>]
 *   origin = cathedral identifier (M=bishop, K=knight, P=pawn, X=cross-cathedral)
 *   seq    = monotonically increasing per-cathedral counter (4 digits)
 *   suffix = lineage depth marker (a, b, c, ..., aa, ab, ...)
 *
 * Examples:
 *   LB-CAT.M-0042        — Root Miner #42 from bishop cathedral
 *   LB-CAT.M-0042.a      — first halved daughter of LB-CAT.M-0042
 *   LB-CAT.M-0042.a.b    — second-generation daughter
 *   LB-CAT.K-0007        — Root Miner #7 from knight cathedral
 */
import type { ProvenanceChain, ProvenanceChainEntry } from "./types.js";
/** Allocates the next sequential serial for a cathedral. Thread-safe within single process. */
export declare function allocateSerial(cathedral: string): string;
/**
 * Generates a daughter serial from a parent serial.
 * Appends the next letter in the suffix alphabet.
 *
 * LB-CAT.M-0042        → LB-CAT.M-0042.a (first daughter)
 * LB-CAT.M-0042.a      → LB-CAT.M-0042.a.a (next generation)
 */
export declare function allocateDaughterSerial(parentSerial: string): string;
export declare function appendProvenanceEntry(entry: ProvenanceChainEntry): void;
/** Reads all entries for a given root serial (includes all descendants). */
export declare function queryProvenanceChain(rootSerial: string): ProvenanceChain;
/**
 * Compose a House Scribe serial string from parts.
 * allocateHsSerial in jar_lifecycle.ts performs the actual counter increment.
 * This function is for display / validation use only.
 */
export declare function formatHsSerial(cathedral: string, seq: number): string;
/**
 * Returns true if the given serial string is a valid HS subclass serial.
 */
export declare function isHsSerial(serial: string): boolean;
/** Returns all root-level Miner serials (no parent_serial). */
export declare function listRootMiners(): ProvenanceChainEntry[];
