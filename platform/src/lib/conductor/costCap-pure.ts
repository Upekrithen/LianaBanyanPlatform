/**
 * Conductor Cost Cap — Pure Helpers (no Supabase / no DOM)
 * K525 · Phase A.2
 *
 * Extracted into a separate module so tests can import these without pulling
 * in the Supabase client (which requires `localStorage`). The Supabase-aware
 * functions live in `costCap.ts` and re-export these helpers.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpendCapCheck {
  /** True iff the member has spent ≥ their monthly cap this period. */
  capExceeded: boolean;
  /** Total USD spent through Conductor this billing period. */
  monthlyTotalUsd: number;
  /** The cap the member set, or null if no cap. */
  monthlyCapUsd: number | null;
  /** ISO date string (YYYY-MM-01) for the start of the current period. */
  periodStart: string;
  /** Recommended action when cap is exceeded. */
  recommendedAction: "allow" | "force_manual" | "force_cheapest";
}

export interface MemberCostCapRecord {
  monthly_conductor_spend_usd: number | null;
  monthly_conductor_cap_usd: number | null;
  monthly_conductor_period_start: string | null; // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Returns the YYYY-MM-01 string for the current month (UTC). */
export function currentPeriodStart(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

/** True if the stored period_start is older than the current period. */
export function isPeriodStale(
  storedPeriodStart: string | null,
  now: Date = new Date(),
): boolean {
  if (!storedPeriodStart) return true;
  return storedPeriodStart < currentPeriodStart(now);
}

/**
 * Compute the cap decision from a record. Pure function; no DB access.
 * The router uses this when it has the record cached; otherwise it calls
 * `checkSpendCap()` which round-trips to Supabase.
 */
export function decideFromRecord(
  rec: MemberCostCapRecord,
  now: Date = new Date(),
): SpendCapCheck {
  const periodStart = currentPeriodStart(now);
  const stale = isPeriodStale(rec.monthly_conductor_period_start, now);

  // Stale period → reset to zero (next persist will roll over the row)
  const monthlyTotalUsd = stale ? 0 : (rec.monthly_conductor_spend_usd ?? 0);
  const monthlyCapUsd = rec.monthly_conductor_cap_usd ?? null;

  if (monthlyCapUsd === null) {
    return {
      capExceeded: false,
      monthlyTotalUsd,
      monthlyCapUsd: null,
      periodStart,
      recommendedAction: "allow",
    };
  }

  const capExceeded = monthlyTotalUsd >= monthlyCapUsd;
  return {
    capExceeded,
    monthlyTotalUsd,
    monthlyCapUsd,
    periodStart,
    recommendedAction: capExceeded ? "force_manual" : "allow",
  };
}
