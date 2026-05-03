/**
 * Miner Base — KN104 / BP016 (B123 #2296 Mitotic Mechanic)
 * ==========================================================
 * Miner subclass for TEAM dispatcher.
 * Miners are TEAM-members, NOT Detectives — distinct specialty:
 *   mitotic corpus-prospecting + ROOT-lineage preservation + IP-ledger-locked
 *
 * Core mechanic:
 *   1. Miner traverses raw material (topic corpus)
 *   2. On new-category-discovery: HALVES itself (configurable halve threshold)
 *   3. One half resumes original topic; other half seeds New Miner-Scribe to new Well of Knowledge
 *   4. Six-level knowledge depth + unlimited graph connections
 *   5. Every tablet timestamped + Miner-attributed + hash-chained + Chronos Chronicler signed
 */
import type { MinerAgentReport } from "../team_dispatcher/types.js";
export interface MinerProspectInput {
    claim: string;
    cathedral: string;
    raw_corpus: string[];
    parent_serial?: string;
    halve_threshold_config?: {
        keyword_density_delta: number;
        semantic_drift_threshold: number;
        founder_ratification_override?: boolean;
    };
    session_id?: string;
}
export interface MinerProspectResult extends MinerAgentReport {
    role: "miner";
    well_of_knowledge_seeds: string[];
    knowledge_depth_map: Record<string, number>;
}
/**
 * Runs a single Miner prospecting pass over a corpus.
 * May spawn daughter Miners if new categories are discovered above the halve threshold.
 * BRIDLE Rule 4: if halve detection is ambiguous (low confidence), default to NOT halving.
 */
export declare function runMinerProspect(input: MinerProspectInput): Promise<MinerProspectResult>;
