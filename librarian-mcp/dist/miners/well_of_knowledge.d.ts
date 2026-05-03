/**
 * Well of Knowledge — Miner-Scribe Seed + Topic Specialization (KN104 / BP016)
 * ==============================================================================
 * When a Miner halves on discovering a new category, the daughter Miner is
 * seeded to a Well of Knowledge — a specialized topic domain.
 *
 * The Well records:
 *   - Which daughter serial owns this Well
 *   - The originating topic seed
 *   - The parent Miner serial (for ROOT-lineage tracing)
 *   - The cathedral where the Well lives
 *
 * Wells are the future Scribe-specialization anchors — when Colossus is built,
 * each Well becomes a full Scribe substrate entry in its cathedral.
 */
export interface WellOfKnowledgeEntry {
    daughter_serial: string;
    parent_serial: string;
    topic_seed: string;
    cathedral: string;
    created_at: string;
    status: "seeded" | "active" | "exhausted";
}
/**
 * Seeds a Well of Knowledge for a daughter Miner.
 * Called when a parent Miner halves upon category-discovery.
 */
export declare function seedWellOfKnowledge(daughterSerial: string, topicSeed: string, parentSerial: string, cathedral: string): WellOfKnowledgeEntry;
/** Returns all Wells for a given cathedral. */
export declare function listWellsForCathedral(cathedral: string): WellOfKnowledgeEntry[];
/** Returns the Well owned by a given daughter serial. */
export declare function getWellForSerial(serial: string): WellOfKnowledgeEntry | null;
/** Lists all Wells (all cathedrals). */
export declare function listAllWells(): WellOfKnowledgeEntry[];
