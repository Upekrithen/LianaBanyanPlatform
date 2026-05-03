/**
 * Team Dispatcher — KN104 / BP016 PRE-COLOSSUS
 * ==============================================
 * Main TEAM orchestration layer.
 * Dispatches multi-class teams (Detectives + Miners + others),
 * enforces cohort-class Scribe-access boundaries,
 * aggregates cross-role findings, and writes synthesis to pheromone substrate.
 *
 * This is the PRE-COLOSSUS version: fan-out is sequential per role
 * (parallel fan-out = COLOSSUS-era upgrade, not yet built).
 */
import { enforceAllowedCathedrals, canWriteBack, buildAccessAuditSummary } from "./cohort_class_enforcement.js";
import type { TeamDispatchRequest, TeamDispatchResult, AgentReport } from "./types.js";
/**
 * Dispatches a multi-class TEAM (Detectives + Miners + others) for a claim.
 *
 * PRE-COLOSSUS: sequential per-role fan-out.
 * COLOSSUS upgrade: parallel fan-out (future build).
 */
export declare function teamDispatch(request: TeamDispatchRequest, dispatchMiner: (claim: string, cathedral: string, agentIdx: number) => Promise<AgentReport>): Promise<TeamDispatchResult>;
export { enforceAllowedCathedrals, canWriteBack, buildAccessAuditSummary };
export type { TeamDispatchRequest, TeamDispatchResult };
