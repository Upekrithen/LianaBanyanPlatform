/**
 * Team Dispatcher Write-Back — KN104 / BP016 PRE-COLOSSUS
 * ========================================================
 * Extended pheromone substrate write-back with TEAM role breakdown,
 * cohort-class metadata, Miner ROOT-lineage, and Chronos Chronicler signatures.
 *
 * Extends the existing emitPheromone call with the full KN104 schema.
 */
import type { AgentReport, CohortClass, TeamPheromoneRecord } from "./types.js";
export interface TeamWriteBackOptions {
    claim: string;
    reports: AgentReport[];
    cohortClass: CohortClass;
    consistency: "consistent" | "contested" | "uninvestigated";
    synthesisStatement: string;
    memberDataStampingProvenance: string[];
    flavorClass?: {
        domain?: string;
        cognition?: string;
        audience?: string;
    };
    replayClass?: string;
}
export interface TeamWriteBackResult {
    ok: boolean;
    record_id?: string;
    pheromone_record?: TeamPheromoneRecord;
    error?: string;
}
/**
 * Writes the extended TEAM synthesis back to the pheromone substrate.
 * Only called when cohort_class permits write-back (enforced by cohort_class_enforcement.ts).
 */
export declare function writeTeamFindingToSubstrate(opts: TeamWriteBackOptions): TeamWriteBackResult;
