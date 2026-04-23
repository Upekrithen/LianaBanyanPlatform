/**
 * Reg CF annual-raise-cap helper.
 *
 * Computes rolling 12-month aggregate raised against the SEC $5M/year cap.
 * Reads from upekrithen.regcf_offering_raises — each row is one issuance event.
 * The rolling window is date-based: include any issuance whose timestamp falls
 * within [now - 365 days, now].
 */

import { upekrithen } from "./upekrithen-client";
import {
  REGCF_ANNUAL_CAP_USD,
  computeRollingRaisePure,
  type RollingRaiseResult,
} from "./regcf-annual-cap-core";

export { REGCF_ANNUAL_CAP_USD, computeRollingRaisePure };
export type { RollingRaiseResult };

/**
 * Query upekrithen.regcf_offering_raises for all rows whose period_start
 * falls within the trailing 12-month window, then sum cumulative_raised_usd.
 */
export async function computeRollingRaise(
  now: Date = new Date()
): Promise<RollingRaiseResult> {
  const windowStart = new Date(now);
  windowStart.setFullYear(windowStart.getFullYear() - 1);

  const { data, error } = await upekrithen()
    .from("regcf_offering_raises")
    .select("cumulative_raised_usd, period_start")
    .gte("period_start", windowStart.toISOString().slice(0, 10))
    .lte("period_start", now.toISOString().slice(0, 10));

  if (error) throw error;

  const rows = (data || []) as Array<{
    cumulative_raised_usd: number;
    period_start: string;
  }>;

  return computeRollingRaisePure(rows, now);
}
