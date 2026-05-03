/**
 * Synthesis Aggregator — KN104 / BP016 PRE-COLOSSUS
 * ===================================================
 * Cross-team-role synthesis layer for TEAM dispatch results.
 * Receives N agent reports (Detectives + Miners + others) and produces:
 *   - Synthesis statement with cross-cathedral consistency verdict
 *   - Aggregated bibliography per team role
 *   - Provenance chain (ROOT-lineage for Miner outputs)
 */
import type { AgentReport, TeamDispatchSynthesis, ProvenanceChain, CohortClass } from "./types.js";
export declare function buildProvenanceChain(reports: AgentReport[]): ProvenanceChain;
export declare function synthesizeTeamFindings(claim: string, reports: AgentReport[], cathedrals: string[], cohortClass: CohortClass): Omit<TeamDispatchSynthesis, "write_back_pheromone_id">;
