/**
 * Excalibur Tag Assignment Gates — KN105 / BP016
 * ================================================
 * A Scribe slice earns the Excalibur tag ONLY if ALL 4 gates pass:
 *
 *   Gate 1: Cathedral Effect cross-vendor verification — lift ≥ +30pp (configurable)
 *   Gate 2: Furnace gear-tooth-fit verification — slice engages cleanly with Wrasse Registry
 *   Gate 3: Adversarial Fence Testing — slice holds under probe (per BP015 protocol)
 *   Gate 4: Federation member-vote — quorum + approval threshold met
 *
 * BRIDLE Rule 4: if gate results ambiguous (e.g., Cathedral Effect lift 28pp vs 30pp threshold),
 * default to NOT assigning tag. Conservative. Only the worthy wield Excalibur.
 *
 * Slices that fail any gate stay as "raw Federation Library" — NOT "Excalibur Class".
 */
export const DEFAULT_GATE_THRESHOLDS = {
    cathedral_effect_min_lift_pp: 30,
    furnace_min_verification_score: 0.70,
    adversarial_fence_min_pass_rate: 1.0,
    federation_vote_quorum: 0.5,
    federation_vote_approval_threshold: 0.6,
};
/**
 * Evaluates all 4 Excalibur tag-assignment gates for a slice.
 * BRIDLE Rule 4: ambiguous (borderline) results default to FAIL.
 */
export function evaluateExcaliburGates(gates, thresholds = DEFAULT_GATE_THRESHOLDS, totalEligibleVoters = 1) {
    // Gate 1: Cathedral Effect cross-vendor verification
    const cathedraPassed = gates.cathedral_effect_verification.lift_pp >= thresholds.cathedral_effect_min_lift_pp;
    const cathedraNote = cathedraPassed
        ? `lift ${gates.cathedral_effect_verification.lift_pp}pp ≥ ${thresholds.cathedral_effect_min_lift_pp}pp threshold`
        : `lift ${gates.cathedral_effect_verification.lift_pp}pp < ${thresholds.cathedral_effect_min_lift_pp}pp threshold — FAIL`;
    // Gate 2: Furnace gear-tooth-fit
    const furnacePassed = gates.furnace_gate.verification_score >= thresholds.furnace_min_verification_score;
    const furnaceNote = furnacePassed
        ? `score ${gates.furnace_gate.verification_score.toFixed(2)} ≥ ${thresholds.furnace_min_verification_score} threshold`
        : `score ${gates.furnace_gate.verification_score.toFixed(2)} < ${thresholds.furnace_min_verification_score} threshold — FAIL`;
    // Gate 3: Adversarial Fence Testing
    const passRate = gates.adversarial_fence_testing.probes_total > 0
        ? gates.adversarial_fence_testing.probes_passed / gates.adversarial_fence_testing.probes_total
        : 0;
    const adversarialPassed = passRate >= thresholds.adversarial_fence_min_pass_rate;
    const adversarialNote = adversarialPassed
        ? `${gates.adversarial_fence_testing.probes_passed}/${gates.adversarial_fence_testing.probes_total} probes passed`
        : `${gates.adversarial_fence_testing.probes_passed}/${gates.adversarial_fence_testing.probes_total} probes — FAIL`;
    // Gate 4: Federation member-vote
    const totalVotes = gates.federation_member_vote.yes_count + gates.federation_member_vote.no_count;
    const quorumMet = totalVotes > 0
        ? (totalVotes / totalEligibleVoters) >= thresholds.federation_vote_quorum
        : false;
    const approvalMet = totalVotes > 0
        ? (gates.federation_member_vote.yes_count / totalVotes) >= thresholds.federation_vote_approval_threshold
        : false;
    const votePassed = quorumMet && approvalMet;
    const voteNote = votePassed
        ? `quorum met + ${Math.round(gates.federation_member_vote.yes_count / Math.max(1, totalVotes) * 100)}% approval`
        : !quorumMet
            ? `quorum NOT met (${totalVotes}/${totalEligibleVoters} voted) — FAIL`
            : `approval below threshold (${Math.round(gates.federation_member_vote.yes_count / Math.max(1, totalVotes) * 100)}% < ${thresholds.federation_vote_approval_threshold * 100}%) — FAIL`;
    const allPassed = cathedraPassed && furnacePassed && adversarialPassed && votePassed;
    // BRIDLE Rule 4: ambiguous → NOT assigning tag
    const bridleNote = allPassed
        ? "All 4 gates passed. Excalibur tag may be assigned."
        : "One or more gates failed. Slice remains raw Federation Library per BRIDLE Rule 4 (conservative default — only the worthy wield Excalibur).";
    return {
        all_passed: allPassed,
        gates: {
            cathedral_effect: { passed: cathedraPassed, lift_pp: gates.cathedral_effect_verification.lift_pp, threshold: thresholds.cathedral_effect_min_lift_pp, note: cathedraNote },
            furnace: { passed: furnacePassed, score: gates.furnace_gate.verification_score, threshold: thresholds.furnace_min_verification_score, note: furnaceNote },
            adversarial_fence: { passed: adversarialPassed, pass_rate: passRate, threshold: thresholds.adversarial_fence_min_pass_rate, note: adversarialNote },
            federation_vote: { passed: votePassed, quorum_met: quorumMet, threshold_met: approvalMet, note: voteNote },
        },
        bridle_note: bridleNote,
        recommended_status: allPassed ? "excalibur_class" : "raw_federation_library",
    };
}
/**
 * Checks if a specific gate has passed for a slice.
 * Used for incremental gate evaluation (e.g., after each vote).
 */
export function checkSingleGate(gate, gates, thresholds = DEFAULT_GATE_THRESHOLDS, totalEligibleVoters = 1) {
    const result = evaluateExcaliburGates(gates, thresholds, totalEligibleVoters);
    switch (gate) {
        case "cathedral_effect_verification": return result.gates.cathedral_effect.passed;
        case "furnace_gate": return result.gates.furnace.passed;
        case "adversarial_fence_testing": return result.gates.adversarial_fence.passed;
        case "federation_member_vote": return result.gates.federation_vote.passed;
    }
}
//# sourceMappingURL=tag_assignment_gates.js.map
