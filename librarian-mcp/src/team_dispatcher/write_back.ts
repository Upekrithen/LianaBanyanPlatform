/**
 * Team Dispatcher Write-Back — KN104 / BP016 PRE-COLOSSUS
 * ========================================================
 * Extended pheromone substrate write-back with TEAM role breakdown,
 * cohort-class metadata, Miner ROOT-lineage, and Chronos Chronicler signatures.
 *
 * Extends the existing emitPheromone call with the full KN104 schema.
 */

import { emitPheromone } from "../scribes/pheromone.js";
import type { AgentReport, CohortClass, TeamPheromoneRecord, TeamRole } from "./types.js";

// ─── Write-Back ───────────────────────────────────────────────────────────

export interface TeamWriteBackOptions {
  claim: string;
  reports: AgentReport[];
  cohortClass: CohortClass;
  consistency: "consistent" | "contested" | "uninvestigated";
  synthesisStatement: string;
  memberDataStampingProvenance: string[];
  flavorClass?: { domain?: string; cognition?: string; audience?: string };
  replayClass?: string;
}

export interface TeamWriteBackResult {
  ok: boolean;
  record_id?: string;
  pheromone_record?: TeamPheromoneRecord;
  error?: string;
}

/** Computes a stable decay score from report hit density. */
function calculateDecayScore(reports: AgentReport[]): number {
  const total = reports.reduce((s, r) => {
    if (r.role === "detective") return s + (r as any).hits;
    if (r.role === "miner") return s + (r as any).topics_discovered.length;
    return s;
  }, 0);
  return Math.min(1.0, total / 10);
}

/**
 * Writes the extended TEAM synthesis back to the pheromone substrate.
 * Only called when cohort_class permits write-back (enforced by cohort_class_enforcement.ts).
 */
export function writeTeamFindingToSubstrate(opts: TeamWriteBackOptions): TeamWriteBackResult {
  try {
    const ts = Date.now();
    const record_id = `team_dispatch_${ts}_${opts.claim.slice(0, 20).replace(/\s+/g, "_")}`;

    const roleBreakdown: TeamPheromoneRecord["team_role_breakdown"] = opts.reports.map(r => {
      const base = {
        role: r.role as TeamRole,
        agent_id: r.agent_id,
        cathedral: r.cathedral,
        findings_count: 0,
      };
      if (r.role === "detective") {
        const dr = r as import("./types.js").DetectiveAgentReport;
        return {
          ...base,
          findings_count: dr.hits,
          phase_used: dr.phase_used as 0 | 1,
        };
      } else if (r.role === "miner") {
        const mr = r as import("./types.js").MinerAgentReport;
        return {
          ...base,
          findings_count: mr.topics_discovered.length,
          mitotic_lineage: mr.mitotic_lineage,
          ip_ledger_locked: mr.ip_ledger_locked,
          chronos_chronicler_sig: mr.chronos_chronicler_sig,
          halved_offspring: mr.halved_offspring,
        };
      }
      return base;
    });

    const pheromoneRecord: TeamPheromoneRecord = {
      topic: opts.claim,
      synthesis_class: opts.replayClass === "detective_team_backfill"
        ? "detective_team_backfill"
        : "detective_team_finding",
      team_role_breakdown: roleBreakdown,
      cohort_class_at_dispatch: opts.cohortClass,
      member_data_stamping_provenance: opts.memberDataStampingProvenance,
      cross_cathedral_consistency: opts.consistency,
      decay_score: calculateDecayScore(opts.reports),
    };

    // Use full synthesis statement as tablet content for topic extraction
    const tabletContent = [
      opts.synthesisStatement,
      `team_roles: ${[...new Set(opts.reports.map(r => r.role))].join(", ")}`,
      `cohort_class: ${opts.cohortClass}`,
      `consistency: ${opts.consistency}`,
    ].join("\n");

    emitPheromone(
      "DetectiveTEAM",
      record_id,
      tabletContent,
      {
        cathedral: "bishop",
        decayConstantDays: 90,
        flavorClass: opts.flavorClass,
        synthesisClass: pheromoneRecord.synthesis_class,
      }
    );

    return { ok: true, record_id, pheromone_record: pheromoneRecord };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
