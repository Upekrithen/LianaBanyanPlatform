// scoring/axis_g_governance.mjs
// Banyan Scale Axis G — Governance
// 5-dimension rubric per §6, 20 pts each = 100 max.

/**
 * @typedef {Object} GovernanceRubric
 * @property {number} policy         Agent-policy configurability (0-20)
 * @property {number} safety         Safety-rail integration (0-20)
 * @property {number} audit          Audit trail (0-20)
 * @property {number} discipline     Discipline-rule compliance (0-20)
 * @property {number} cooperative    Cooperative-substrate posture (0-20)
 */

/**
 * Predefined rubric scores per known stack (v0.1 heuristic estimates — VERIFY-PER-PAWN-P12).
 * These are scaffold defaults; update with empirical values after full runs.
 */
export const RUBRIC_DEFAULTS = {
  S1: { policy: 14, safety: 10, audit: 12, discipline: 10, cooperative: 14 }, // Ruflo
  S2: { policy: 16, safety: 12, audit: 12, discipline: 12, cooperative: 16 }, // wshobson
  S3: { policy: 10, safety: 8,  audit: 10, discipline: 8,  cooperative: 10 }, // HiveCLI
  S4: { policy: 18, safety: 14, audit: 14, discipline: 12, cooperative: 14 }, // Composio
  S5: { policy: 14, safety: 10, audit: 10, discipline: 10, cooperative: 16 }, // Maestro
  S6: { policy: 20, safety: 18, audit: 18, discipline: 18, cooperative: 18 }, // LB substrate
};

/**
 * Score Axis G from a rubric object.
 *
 * @param {GovernanceRubric} rubric
 * @param {number} tier
 */
export function scoreAxisG(rubric, tier) {
  const total = (rubric.policy ?? 0) + (rubric.safety ?? 0) + (rubric.audit ?? 0)
              + (rubric.discipline ?? 0) + (rubric.cooperative ?? 0);
  const score = Math.min(total, 100);

  return {
    tier,
    score,
    rubric_breakdown: {
      policy: rubric.policy,
      safety: rubric.safety,
      audit: rubric.audit,
      discipline: rubric.discipline,
      cooperative_posture: rubric.cooperative,
    },
  };
}
