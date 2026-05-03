/**
 * Synthesis Aggregator — KN104 / BP016 PRE-COLOSSUS
 * ===================================================
 * Cross-team-role synthesis layer for TEAM dispatch results.
 * Receives N agent reports (Detectives + Miners + others) and produces:
 *   - Synthesis statement with cross-cathedral consistency verdict
 *   - Aggregated bibliography per team role
 *   - Provenance chain (ROOT-lineage for Miner outputs)
 */
// ─── Cross-Cathedral Consistency ──────────────────────────────────────────
function assessCrossConsistency(reports, cathedrals) {
    const detectiveReports = reports.filter(r => r.role === "detective");
    if (detectiveReports.length === 0)
        return "uninvestigated";
    const cathsWithHits = new Set(detectiveReports.filter(r => r.hits > 0).map(r => r.cathedral));
    if (cathsWithHits.size === 0)
        return "uninvestigated";
    if (cathsWithHits.size >= cathedrals.length)
        return "consistent";
    return "contested";
}
// ─── Aggregated Bibliography ───────────────────────────────────────────────
function buildBibliography(reports) {
    const bib = [];
    for (const report of reports) {
        if (report.role === "detective") {
            const dr = report;
            for (const hit of dr.hits_detail) {
                bib.push({
                    role: "detective",
                    scribe: hit.scribe,
                    tablet_id: hit.tablet_id,
                    decay_score: hit.decay_score,
                    cathedral: dr.cathedral,
                });
            }
        }
        else if (report.role === "miner") {
            const mr = report;
            for (const topic of mr.topics_discovered) {
                bib.push({
                    role: "miner",
                    scribe: mr.mitotic_lineage,
                    tablet_id: `miner_topic::${topic}`,
                    decay_score: 1.0,
                    cathedral: mr.cathedral,
                });
            }
        }
    }
    // Sort by decay_score descending
    bib.sort((a, b) => b.decay_score - a.decay_score);
    return bib;
}
// ─── Synthesis Statement ──────────────────────────────────────────────────
function buildSynthesisStatement(claim, reports, consistency, cohortClass) {
    const detectiveReports = reports.filter(r => r.role === "detective");
    const minerReports = reports.filter(r => r.role === "miner");
    const totalDetectiveHits = detectiveReports.reduce((s, r) => s + r.hits, 0);
    const totalMinerTopics = minerReports.reduce((s, r) => s + r.topics_discovered.length, 0);
    const halvedOffspring = minerReports.flatMap(r => r.halved_offspring);
    const lines = [
        `TEAM finding (PRE-COLOSSUS) for: "${claim}"`,
        `Cohort class: ${cohortClass}`,
    ];
    if (detectiveReports.length > 0) {
        const cathedralsQueried = [...new Set(detectiveReports.map(r => r.cathedral))];
        lines.push(`Detective agents: ${detectiveReports.length} across [${cathedralsQueried.join(", ")}]; ${totalDetectiveHits} total hits`);
    }
    if (minerReports.length > 0) {
        lines.push(`Miner agents: ${minerReports.length}; ${totalMinerTopics} topics discovered; ${halvedOffspring.length} daughter Miners spawned`);
        lines.push(`Miner serials: ${minerReports.map(r => r.mitotic_lineage).join(", ")}`);
    }
    const verdictLabel = {
        consistent: "CANONICAL — all queried cathedrals agree",
        contested: "CONTESTED — partial cathedral coverage; further investigation recommended",
        uninvestigated: "UNINVESTIGATED — no substrate hits; may be novel or substrate needs backfill",
    }[consistency];
    lines.push(`Cross-cathedral consistency: ${verdictLabel}`);
    return lines.join("\n");
}
// ─── Provenance Chain Builder ─────────────────────────────────────────────
export function buildProvenanceChain(reports) {
    const chain = [];
    for (const report of reports) {
        if (report.role === "miner") {
            const mr = report;
            // Root entry
            const rootEntry = {
                serial: mr.mitotic_lineage,
                parent_serial: null,
                cathedral: mr.cathedral,
                role: "miner",
                ts: new Date().toISOString(),
                topic_seed: mr.topics_discovered[0] ?? "unknown",
                ip_ledger_hash: mr.chronos_chronicler_sig,
            };
            chain.push(rootEntry);
            // Daughter entries (from halving)
            for (const daughterSerial of mr.halved_offspring) {
                chain.push({
                    serial: daughterSerial,
                    parent_serial: mr.mitotic_lineage,
                    cathedral: mr.cathedral,
                    role: "miner",
                    ts: new Date().toISOString(),
                    topic_seed: "daughter_miner",
                    ip_ledger_hash: `${mr.chronos_chronicler_sig}::daughter::${daughterSerial}`,
                });
            }
        }
        else if (report.role === "detective") {
            const dr = report;
            chain.push({
                serial: `LB-CAT.D-${dr.agent_id}`,
                parent_serial: null,
                cathedral: dr.cathedral,
                role: "detective",
                ts: new Date().toISOString(),
                topic_seed: "detective_query",
                ip_ledger_hash: `detective::${dr.agent_id}::${dr.hits}hits`,
            });
        }
    }
    return chain;
}
// ─── Main Synthesis Function ──────────────────────────────────────────────
export function synthesizeTeamFindings(claim, reports, cathedrals, cohortClass) {
    const consistency = assessCrossConsistency(reports, cathedrals);
    const bibliography = buildBibliography(reports);
    const statement = buildSynthesisStatement(claim, reports, consistency, cohortClass);
    return {
        statement,
        cross_cathedral_consistency: consistency,
        aggregated_bibliography: bibliography,
    };
}
//# sourceMappingURL=synthesis_aggregator.js.map
