/**
 * Team Dispatcher Write-Back — KN104 / BP016 PRE-COLOSSUS
 * ========================================================
 * Extended pheromone substrate write-back with TEAM role breakdown,
 * cohort-class metadata, Miner ROOT-lineage, and Chronos Chronicler signatures.
 *
 * Extends the existing emitPheromone call with the full KN104 schema.
 */
import { emitPheromone } from "../scribes/pheromone.js";
/** Computes a stable decay score from report hit density. */
function calculateDecayScore(reports) {
    const total = reports.reduce((s, r) => {
        if (r.role === "detective")
            return s + r.hits;
        if (r.role === "miner")
            return s + r.topics_discovered.length;
        return s;
    }, 0);
    return Math.min(1.0, total / 10);
}
/**
 * Writes the extended TEAM synthesis back to the pheromone substrate.
 * Only called when cohort_class permits write-back (enforced by cohort_class_enforcement.ts).
 */
export function writeTeamFindingToSubstrate(opts) {
    try {
        const ts = Date.now();
        const record_id = `team_dispatch_${ts}_${opts.claim.slice(0, 20).replace(/\s+/g, "_")}`;
        const roleBreakdown = opts.reports.map(r => {
            const base = {
                role: r.role,
                agent_id: r.agent_id,
                cathedral: r.cathedral,
                findings_count: 0,
            };
            if (r.role === "detective") {
                const dr = r;
                return {
                    ...base,
                    findings_count: dr.hits,
                    phase_used: dr.phase_used,
                };
            }
            else if (r.role === "miner") {
                const mr = r;
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
        const pheromoneRecord = {
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
        emitPheromone("DetectiveTEAM", record_id, tabletContent, {
            cathedral: "bishop",
            decayConstantDays: 90,
            flavorClass: opts.flavorClass,
            synthesisClass: pheromoneRecord.synthesis_class,
        });
        return { ok: true, record_id, pheromone_record: pheromoneRecord };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
//# sourceMappingURL=write_back.js.map
