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

import {
  queryPheromone,
} from "../scribes/pheromone.js";
import { consultScribes } from "../scribes/consult.js";
import {
  enforceAllowedCathedrals,
  canWriteBack,
  buildAccessAuditSummary,
} from "./cohort_class_enforcement.js";
import { synthesizeTeamFindings, buildProvenanceChain } from "./synthesis_aggregator.js";
import { writeTeamFindingToSubstrate } from "./write_back.js";
import type {
  TeamDispatchRequest,
  TeamDispatchResult,
  DetectiveAgentReport,
  AgentReport,
  CohortClass,
} from "./types.js";

// ─── Detective Agent Dispatch ─────────────────────────────────────────────

async function dispatchDetectiveAgent(
  claim: string,
  cathedral: string,
  cohortClass: CohortClass,
  topK: number,
): Promise<DetectiveAgentReport> {
  const agentId = `det_${cathedral}_${Date.now()}`;

  // Phase 0: pheromone fast-path (constant-time)
  const phase0Result = queryPheromone(claim, {
    topK,
    cathedral,
    decayActive: true,
  });

  let hits = phase0Result.hits.length;
  let phaseUsed: 0 | 1 = 0;
  let hitsDetail = phase0Result.hits.map(h => ({
    scribe: h.scribe,
    tablet_id: h.tablet_id,
    decay_score: Math.round(h.decay_score * 100) / 100,
  }));

  // Phase 1: RPC consult_scribes fallback if Phase 0 sparse
  if (hits === 0) {
    try {
      const allowedCathedral = (cathedral === "bishop" || cathedral === "knight") ? cathedral : "bishop";
      const phase1Result = await consultScribes({
        topic: claim,
        cathedral: allowedCathedral,
        scope: "public",
        max_entries: topK,
      });
      if (phase1Result && (phase1Result as any).entries?.length > 0) {
        hits = (phase1Result as any).entries.length;
        hitsDetail = (phase1Result as any).entries.slice(0, topK).map((e: any) => ({
          scribe: e.scribeId ?? cathedral,
          tablet_id: e.id ?? e.tablet_id ?? "rpc_entry",
          decay_score: 0.5,
        }));
        phaseUsed = 1;
      }
    } catch {
      // Phase 1 fallback failed; remain with zero hits
    }
  }

  const descriptor = buildAccessAuditSummary(cohortClass, [cathedral], false);

  return {
    role: "detective",
    agent_id: agentId,
    cathedral,
    hits,
    phase_used: phaseUsed,
    top_hit: hitsDetail[0] ? `${hitsDetail[0].scribe}/${hitsDetail[0].tablet_id}` : null,
    hits_detail: hitsDetail,
    scribe_access_tier: descriptor.split(" | ")[0],
  };
}

// ─── Main Dispatcher ───────────────────────────────────────────────────────

/**
 * Dispatches a multi-class TEAM (Detectives + Miners + others) for a claim.
 *
 * PRE-COLOSSUS: sequential per-role fan-out.
 * COLOSSUS upgrade: parallel fan-out (future build).
 */
export async function teamDispatch(
  request: TeamDispatchRequest,
  dispatchMiner: (claim: string, cathedral: string, agentIdx: number) => Promise<AgentReport>,
): Promise<TeamDispatchResult> {
  const {
    claim,
    team_composition,
    cohort_class,
    cathedrals: requestedCathedrals,
    max_agents_per_role,
    write_back,
    flavor_class,
    replay_class,
  } = request;

  const allCathedrals = requestedCathedrals ?? ["bishop", "knight", "pawn"];

  // Enforce cohort-class Scribe-access boundaries
  const { allowed: permittedCathedrals, blocked } = enforceAllowedCathedrals(
    allCathedrals,
    cohort_class,
  );

  const accessAudit = buildAccessAuditSummary(cohort_class, allCathedrals, write_back);

  const allReports: AgentReport[] = [];

  // ── Detective fan-out ────────────────────────────────────────────────────
  if (team_composition.includes("detective")) {
    const numAgents = Math.min(max_agents_per_role, permittedCathedrals.length);
    for (let i = 0; i < numAgents; i++) {
      const cathedral = permittedCathedrals[i % permittedCathedrals.length] ?? "bishop";
      const report = await dispatchDetectiveAgent(claim, cathedral, cohort_class, 10);
      allReports.push(report);
    }
  }

  // ── Miner fan-out ────────────────────────────────────────────────────────
  if (team_composition.includes("miner")) {
    const numAgents = Math.min(max_agents_per_role, permittedCathedrals.length);
    for (let i = 0; i < numAgents; i++) {
      const cathedral = permittedCathedrals[i % permittedCathedrals.length] ?? "bishop";
      const report = await dispatchMiner(claim, cathedral, i);
      allReports.push(report);
    }
  }

  // ── Synthesis ────────────────────────────────────────────────────────────
  const synthesisBase = synthesizeTeamFindings(claim, allReports, permittedCathedrals, cohort_class);
  const provenanceChain = buildProvenanceChain(allReports);

  // ── Write-back ────────────────────────────────────────────────────────────
  let writeBackResult: TeamDispatchResult["write_back_result"] = { ok: false };
  const shouldWriteBack = write_back && canWriteBack(cohort_class);

  if (shouldWriteBack) {
    writeBackResult = writeTeamFindingToSubstrate({
      claim,
      reports: allReports,
      cohortClass: cohort_class,
      consistency: synthesisBase.cross_cathedral_consistency,
      synthesisStatement: synthesisBase.statement,
      memberDataStampingProvenance: [],
      flavorClass: flavor_class,
      replayClass: replay_class,
    });
  }

  const synthesis = {
    ...synthesisBase,
    write_back_pheromone_id: writeBackResult.record_id,
  };

  return {
    claim,
    cohort_class,
    team_composition,
    per_role_findings: allReports,
    synthesis,
    provenance_chain: provenanceChain,
    write_back_result: writeBackResult,
  };
}

export { enforceAllowedCathedrals, canWriteBack, buildAccessAuditSummary };
export type { TeamDispatchRequest, TeamDispatchResult };
