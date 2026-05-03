/**
 * Team Dispatcher Types — KN104 / BP016 PRE-COLOSSUS
 * ====================================================
 * Shared type surface for multi-class TEAM dispatch (Detectives + Miners + others).
 * Cohort-class-aware Scribe-access enforcement per BP016 Founder ratification.
 */
/**
 * Four-tier cohort classification per KN102 brittle-vs-fluid librarian canon.
 *
 * lone_wolf          — AGPL-baseline Scribes only; no Scribe-trade
 * pied_piper         — AGPL + limited Federation Library read-only; no write-back
 * federation_member  — Full Scribe-trade + write-back to shared library
 * excalibur_class_subscriber — Curated Excalibur-slice access only (NOT full Scribe-trade)
 */
export type CohortClass = "lone_wolf" | "pied_piper" | "federation_member" | "excalibur_class_subscriber";
/**
 * Recognized team roles for TEAM dispatcher.
 * Miners are TEAM-members, not Detectives (different specialty).
 */
export type TeamRole = "detective" | "miner" | "house" | "reminder";
export interface DetectiveAgentReport {
    role: "detective";
    agent_id: string;
    cathedral: string;
    hits: number;
    phase_used: 0 | 1;
    top_hit: string | null;
    hits_detail: Array<{
        scribe: string;
        tablet_id: string;
        decay_score: number;
    }>;
    scribe_access_tier: string;
}
export interface MinerAgentReport {
    role: "miner";
    agent_id: string;
    cathedral: string;
    mitotic_lineage: string;
    ip_ledger_locked: boolean;
    chronos_chronicler_sig: string;
    halved_offspring: string[];
    topics_discovered: string[];
    knowledge_depth: number;
}
export type AgentReport = DetectiveAgentReport | MinerAgentReport;
export interface ProvenanceChainEntry {
    serial: string;
    parent_serial: string | null;
    cathedral: string;
    role: TeamRole;
    ts: string;
    topic_seed: string;
    ip_ledger_hash: string;
}
export type ProvenanceChain = ProvenanceChainEntry[];
export interface TeamDispatchRequest {
    claim: string;
    team_composition: TeamRole[];
    cohort_class: CohortClass;
    cathedrals?: string[];
    max_agents_per_role: number;
    write_back: boolean;
    flavor_class?: {
        domain?: string;
        cognition?: string;
        audience?: string;
    };
    replay_class?: string;
}
export interface TeamDispatchSynthesis {
    statement: string;
    cross_cathedral_consistency: "consistent" | "contested" | "uninvestigated";
    aggregated_bibliography: Array<{
        role: TeamRole;
        scribe: string;
        tablet_id: string;
        decay_score: number;
        cathedral: string;
    }>;
    write_back_pheromone_id?: string;
}
export interface TeamDispatchResult {
    claim: string;
    cohort_class: CohortClass;
    team_composition: TeamRole[];
    per_role_findings: AgentReport[];
    synthesis: TeamDispatchSynthesis;
    provenance_chain: ProvenanceChain;
    write_back_result: {
        ok: boolean;
        record_id?: string;
        error?: string;
    };
}
export interface TeamPheromoneRecord {
    topic: string;
    synthesis_class: "detective_team_finding" | "detective_team_backfill";
    team_role_breakdown: Array<{
        role: TeamRole;
        agent_id: string;
        cathedral: string;
        findings_count: number;
        phase_used?: 0 | 1;
        mitotic_lineage?: string;
        ip_ledger_locked?: boolean;
        chronos_chronicler_sig?: string;
        halved_offspring?: string[];
    }>;
    cohort_class_at_dispatch: CohortClass;
    member_data_stamping_provenance: string[];
    cross_cathedral_consistency: "consistent" | "contested" | "uninvestigated";
    decay_score: number;
}
