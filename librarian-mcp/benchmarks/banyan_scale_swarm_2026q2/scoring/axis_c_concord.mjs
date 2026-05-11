// scoring/axis_c_concord.mjs
// Banyan Scale Axis C — Concord (cooperation quality)

/**
 * Score Axis C from a set of RunResults.
 * Inputs: inter-agent messages, cross-verification rate, failure-recovery agent-handoff.
 * Composite 0-100 score.
 *
 * @param {import('./types.mjs').RunResult[]} runs
 * @param {{ crossVerificationRate?: number; failureRecoveryObserved?: boolean }} opts
 * @param {number} tier
 */
export function scoreAxisC(runs, opts, tier) {
  if (!runs || runs.length === 0) {
    return { tier, score: 0, inter_agent_messages_p50: 0, cross_verification_rate: 0, failure_recovery_handoff: false };
  }
  const messages = runs.map(r => r.observedMessages ?? 0).sort((a, b) => a - b);
  const msgP50 = percentile(messages, 50);
  const crossVerRate = opts?.crossVerificationRate ?? 0;
  const failureRecovery = opts?.failureRecoveryObserved ?? false;

  // Scoring:
  // inter-agent messages: 0-40 pts (bands: 0=5, 1-3=15, 4-10=25, 11-20=35, >20=40)
  // cross-verification rate: 0-40 pts (rate * 40)
  // failure recovery: 0-20 pts
  const msgScore = msgPoints(msgP50);
  const cvScore = Math.round(Math.min(crossVerRate, 1) * 40);
  const recScore = failureRecovery ? 20 : 0;
  const total = Math.min(msgScore + cvScore + recScore, 100);

  return {
    tier,
    score: total,
    inter_agent_messages_p50: Math.round(msgP50),
    cross_verification_rate: crossVerRate,
    failure_recovery_handoff: failureRecovery,
  };
}

function msgPoints(n) {
  if (n === 0) return 5;
  if (n <= 3)  return 15;
  if (n <= 10) return 25;
  if (n <= 20) return 35;
  return 40;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
