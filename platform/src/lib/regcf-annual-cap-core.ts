/**
 * Reg CF annual-cap pure computation — no DB dependency.
 * Importable by tests without triggering Supabase client init.
 */

export const REGCF_ANNUAL_CAP_USD = 5_000_000;

export interface RollingRaiseResult {
  raisedLast12Months: number;
  remainingHeadroom: number;
  percentOfCap: number;
}

/**
 * Pure computation variant (no DB) for unit testing and server-side use.
 * Accepts an array of raise entries and a reference date.
 */
export function computeRollingRaisePure(
  entries: Array<{ cumulative_raised_usd: number; period_start: string }>,
  now: Date = new Date()
): RollingRaiseResult {
  const windowStart = new Date(now);
  windowStart.setFullYear(windowStart.getFullYear() - 1);
  const windowStartStr = windowStart.toISOString().slice(0, 10);
  const nowStr = now.toISOString().slice(0, 10);

  const inWindow = entries.filter((e) => {
    const d = e.period_start.slice(0, 10);
    return d >= windowStartStr && d <= nowStr;
  });

  const raisedLast12Months = inWindow.reduce(
    (sum, r) => sum + (r.cumulative_raised_usd || 0),
    0
  );

  const remainingHeadroom = Math.max(0, REGCF_ANNUAL_CAP_USD - raisedLast12Months);
  const percentOfCap =
    REGCF_ANNUAL_CAP_USD > 0
      ? (raisedLast12Months / REGCF_ANNUAL_CAP_USD) * 100
      : 0;

  return { raisedLast12Months, remainingHeadroom, percentOfCap };
}
