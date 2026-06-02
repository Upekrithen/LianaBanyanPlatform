export declare const STITCHPUNKS_DIR: string;
export declare const PHEROMONE_DIR: string;
export declare const PHEROMONE_INDEX_PATH: string;
/**
 * Multi-Trail Pheromone-Flavor Class System (KN100/BP015 Priority 3)
 * Three independent class-axes for 4D substrate routing.
 * Existing records carry flavor_class = undefined (null flavor = cross-trail).
 * New entries can carry tags on any/all axes.
 *
 * Domain (a): what the content is ABOUT (food-metaphor chain seed)
 * Cognition (b): what reasoning mode produced it
 * Audience (c): who it's FOR
 */
export interface FlavorClass {
    domain?: string;
    cognition?: string;
    audience?: string;
}
/**
 * SAGA 16 BP046B — 3-class pheromone hybrid
 * Three independent decay classes:
 *   transient (default) — exponential decay with decay_constant_days half-life
 *   anchor              — permanent, no decay; for BLOOD RULES + Founder-ratified canon
 *   linked              — decays, but uses most-recent timestamp of self OR any linked record
 *
 * Fully backward-compatible: existing records with no pheromone_class = transient.
 */
export type PheromoneClass = 'transient' | 'anchor' | 'linked';
export interface PheromoneRecord {
    ts: string;
    scribe: string;
    tablet_id: string;
    topics: string[];
    decay_constant_days: number;
    cathedral?: string;
    flavor_class?: FlavorClass;
    synthesis_class?: string;
    pheromone_class?: PheromoneClass;
    linked_ids?: string[];
    se4?: import('../se4/se4_envelope.js').SE4Envelope;
    se4_shadow_id?: string;
}
export interface PheromoneHit {
    scribe: string;
    tablet_id: string;
    match_strength: number;
    decay_score: number;
    ts: string;
    cathedral?: string;
    flavor_class?: FlavorClass;
    synthesis_class?: string;
    pheromone_class?: PheromoneClass;
}
export interface PheromoneQueryResult {
    hits: PheromoneHit[];
    build_ms: number;
    query_ms: number;
    phase_0_used: boolean;
    fallback_to_rpc: boolean;
    index_age_seconds: number;
    topic_count: number;
    record_count: number;
}
export declare function extractTopics(text: string): string[];
interface IndexState {
    /** topic -> array of pheromone records */
    byTopic: Map<string, PheromoneRecord[]>;
    /** (scribe, tablet_id, cathedral) -> most-recent PheromoneRecord */
    byKey: Map<string, PheromoneRecord>;
    recordCount: number;
    topicCount: number;
    builtAtMs: number;
    fileModMs: number;
}
/** Force rebuild (used by build-from-scratch path). */
export declare function forceRebuild(): IndexState;
/**
 * Emit a pheromone record for a tablet write.
 * Sync-fast: target <5ms. Does NOT call costly ML extraction.
 * Appends to PHEROMONE_INDEX_PATH, then updates in-memory index.
 *
 * Idempotent: re-emitting same (scribe, tablet_id, cathedral) updates the record.
 */
export declare function emitPheromone(scribe: string, tabletId: string, content: string, options?: {
    cathedral?: string;
    decayConstantDays?: number;
    ts?: string;
    flavorClass?: FlavorClass;
    synthesisClass?: string;
    pheromoneClass?: PheromoneClass;
    linkedIds?: string[];
}): PheromoneRecord;
export interface QueryOptions {
    freshnessThresholdSeconds?: number;
    sufficiencyThreshold?: number;
    decayActive?: boolean;
    topK?: number;
    cathedral?: string;
    flavorClass?: Partial<FlavorClass>;
    synthesisClass?: string;
}
/**
 * Query the pheromone substrate for a claim.
 * Returns ranked hits, build/query timing, and phase-0 flags.
 *
 * This is the Detective Phase 0 fast path — constant-time vs N-Scribe RPC.
 */
export declare function queryPheromone(claim: string, options?: QueryOptions): PheromoneQueryResult;
interface BuildResult {
    scribeCount: number;
    tabletCount: number;
    recordsEmitted: number;
    topicCount: number;
    buildMs: number;
}
/**
 * Scan all Scribe JSONL files across all Cathedrals and rebuild the
 * pheromone substrate from scratch. Used by:
 *  - Phase D Bloodhound cron
 *  - CLI `npm run pheromone:build`
 *  - npm run rebuild (via SP-7 Courier hook)
 */
export declare function buildPheromoneIndex(options?: {
    force?: boolean;
    decayConstantDays?: number;
    verbose?: boolean;
}): BuildResult;
export {};
