// scoring/axis_b_burden.mjs
// Banyan Scale Axis B — Burden (token cost)

/**
 * Score Axis B from a set of RunResults.
 * Scoring bands (USD per task, lower is better):
 *   <$0.01  → 100
 *   <$0.05  → 90
 *   <$0.20  → 75
 *   <$0.50  → 60
 *   <$2.00  → 40
 *   >=$2.00 → 20
 *
 * @param {import('./types.mjs').RunResult[]} runs
 * @param {number} tier
 * @returns {{ tier: number; score: number; measured_usd_per_task: number; equivalent_usd_per_task: number; total_input_tokens: number; total_output_tokens: number }}
 */
export function scoreAxisB(runs, tier) {
  if (!runs || runs.length === 0) {
    return { tier, score: 0, measured_usd_per_task: 0, equivalent_usd_per_task: 0, total_input_tokens: 0, total_output_tokens: 0 };
  }
  const measuredPerRun = runs.map(r => r.observedCostUSD);
  const equivalentPerRun = runs.map(r => r.observedCostEquivalentUSD);
  const avgMeasured = avg(measuredPerRun);
  const avgEquivalent = avg(equivalentPerRun);
  const totalInput = runs.reduce((s, r) => s + (r.observedTokens?.input ?? 0), 0);
  const totalOutput = runs.reduce((s, r) => s + (r.observedTokens?.output ?? 0), 0);

  return {
    tier,
    score: costScore(avgMeasured || avgEquivalent),
    measured_usd_per_task: round(avgMeasured),
    equivalent_usd_per_task: round(avgEquivalent),
    total_input_tokens: totalInput,
    total_output_tokens: totalOutput,
  };
}

function costScore(usd) {
  if (usd < 0.01) return 100;
  if (usd < 0.05) return 90;
  if (usd < 0.20) return 75;
  if (usd < 0.50) return 60;
  if (usd < 2.00) return 40;
  return 20;
}

function avg(arr) {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length;
}

function round(v, places = 6) {
  return parseFloat(v.toFixed(places));
}
