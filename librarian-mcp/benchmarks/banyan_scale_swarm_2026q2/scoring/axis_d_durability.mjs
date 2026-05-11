// scoring/axis_d_durability.mjs
// Banyan Scale Axis D — Durability (crash rate + soak test)

/**
 * Score Axis D.
 * Inputs: crash rate (0-1), partial-output-on-failure recovery rate (0-1), soak 60-min recovery.
 *
 * @param {import('./types.mjs').RunResult[]} runs
 * @param {{ soakRecovery?: boolean }} opts
 * @param {number} tier
 */
export function scoreAxisD(runs, opts, tier) {
  if (!runs || runs.length === 0) {
    return { tier, score: 0, crash_rate: 0, partial_recovery_rate: 0, soak_60min_recovery: false };
  }
  const crashes = runs.filter(r => r.exitClass === 'crash').length;
  const partials = runs.filter(r => r.exitClass === 'partial').length;
  const crashRate = crashes / runs.length;
  const partialRecoveryRate = partials > 0 ? (partials / runs.length) : 0;
  const soakRecovery = opts?.soakRecovery ?? false;

  // Scoring: crash_rate 0-50 pts, partial_recovery 0-25 pts, soak 0-25 pts
  const crashScore = Math.round((1 - crashRate) * 50);
  const recScore = Math.round((1 - partialRecoveryRate) * 25);
  const soakScore = soakRecovery ? 25 : 0;
  const total = Math.min(crashScore + recScore + soakScore, 100);

  return {
    tier,
    score: total,
    crash_rate: parseFloat(crashRate.toFixed(3)),
    partial_recovery_rate: parseFloat(partialRecoveryRate.toFixed(3)),
    soak_60min_recovery: soakRecovery,
  };
}
