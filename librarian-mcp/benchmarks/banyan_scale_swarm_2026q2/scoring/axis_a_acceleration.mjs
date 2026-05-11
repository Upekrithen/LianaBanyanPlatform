// scoring/axis_a_acceleration.mjs
// Banyan Scale Axis A — Acceleration (wall-clock time)

/**
 * Score Axis A from a set of RunResults (N runs).
 * Returns P50 + P95 wall-clock seconds and a 0-100 score.
 * Scoring bands (seconds, lower is better):
 *   <30s     → 100
 *   <120s    → 90
 *   <300s    → 75
 *   <600s    → 60
 *   <1800s   → 40
 *   >=1800s  → 20
 *
 * @param {import('./types.mjs').RunResult[]} runs
 * @param {number} tier
 * @returns {{ tier: number; score: number; score_p50: number; score_p95: number; wall_clock_p50_seconds: number; wall_clock_p95_seconds: number }}
 */
export function scoreAxisA(runs, tier) {
  if (!runs || runs.length === 0) {
    return { tier, score: 0, score_p50: 0, score_p95: 0, wall_clock_p50_seconds: 0, wall_clock_p95_seconds: 0 };
  }
  const durations = runs
    .map(r => (new Date(r.endTs).getTime() - new Date(r.startTs).getTime()) / 1000)
    .sort((a, b) => a - b);

  const p50 = percentile(durations, 50);
  const p95 = percentile(durations, 95);

  return {
    tier,
    score: wallClockScore(p50),
    score_p50: wallClockScore(p50),
    score_p95: wallClockScore(p95),
    wall_clock_p50_seconds: Math.round(p50),
    wall_clock_p95_seconds: Math.round(p95),
  };
}

function wallClockScore(seconds) {
  if (seconds < 30)   return 100;
  if (seconds < 120)  return 90;
  if (seconds < 300)  return 75;
  if (seconds < 600)  return 60;
  if (seconds < 1800) return 40;
  return 20;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
