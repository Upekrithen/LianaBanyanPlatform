import type { PheromoneRecord } from "./pheromone.js";
/** Returns the inbound_pheromones.jsonl path for a given Cathedral. */
export declare function inboundPheromonePathFor(cathedral: string): string;
/** Summary record broadcast to sibling Cathedrals. */
export interface InboundPheromoneRecord {
    ts: string;
    source_cathedral: string;
    scribe: string;
    tablet_id: string;
    topics_compact: string[];
    decay_constant_days: number;
    original_index_ref: string;
}
/**
 * Propagate a pheromone record from sourceCathedral to all sibling Cathedrals.
 *
 * Each sibling receives a compact InboundPheromoneRecord appended to
 * `stitchpunks/<sibling>_cathedral/inbound_pheromones.jsonl`.
 * The sourceCathedral itself does NOT receive a copy.
 *
 * Non-fatal: individual sibling failures are caught and written to stderr.
 * A failure for one sibling never blocks the other.
 */
export declare function propagatePheromone(record: PheromoneRecord, sourceCathedral: "bishop" | "knight" | "pawn"): void;
export interface InboundStatus {
    cathedral: string;
    path: string;
    exists: boolean;
    record_count: number;
}
/**
 * Returns the count of inbound pheromone records per Cathedral.
 * "Inbound" = present in inbound_pheromones.jsonl (not yet merged into the
 * unified pheromone index by Bloodhound). Bloodhound deduplicates on merge.
 */
export declare function getInboundStatus(): InboundStatus[];
