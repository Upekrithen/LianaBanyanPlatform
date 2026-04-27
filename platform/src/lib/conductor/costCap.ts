/**
 * Conductor Cost Cap Guard — Per-Member Monthly Spend Enforcement
 * K525 · Phase A.2 · Innovation #2277 + #2272 (Cost-Slasher closure)
 *
 * Members can opt in to a monthly USD ceiling on Conductor-routed AI spend.
 * When spend exceeds the cap inside the active billing period, the router
 * forces `mode: "manual"` (the member must hand-pick a model — no auto-routes
 * incur further cost) until the next reset, OR routes to a free/cheapest tier
 * (caller's choice; the guard returns the decision, not the side effect).
 *
 * Two tiers of usage:
 *   1. In-memory aggregator (this module): fast running totals during a
 *      session; non-authoritative.
 *   2. Supabase persistence (members.monthly_conductor_spend_usd): canonical
 *      ledger updated on every successful route. Migration:
 *      `20260427120001_k525_conductor_cost_cap.sql`.
 *
 * The router calls `checkSpendCap()` BEFORE selecting a vendor, so the cap
 * decision is observed by the member before they incur any new cost.
 *
 * Privacy & metaphor: cap state is per-member; the aggregate dashboard
 * receives only hashed counts. "#40 Always Offer What You Would Want" — the
 * member who set a cap WANTS the system to honor it, not silently overspend.
 */

import { supabase } from "@/integrations/supabase/client";
import {
  currentPeriodStart,
  isPeriodStale,
  decideFromRecord,
  type SpendCapCheck,
  type MemberCostCapRecord,
} from "./costCap-pure";

export {
  currentPeriodStart,
  isPeriodStale,
  decideFromRecord,
  type SpendCapCheck,
  type MemberCostCapRecord,
};

// ---------------------------------------------------------------------------
// Supabase API
// ---------------------------------------------------------------------------

/**
 * Read the member's cap state from Supabase and decide the action.
 * Returns a "no cap" result on any read failure (fail-open: don't break
 * routing because the cap-check failed).
 */
export async function checkSpendCap(memberId: string): Promise<SpendCapCheck> {
  try {
    const { data, error } = await (supabase as any)
      .from("members")
      .select(
        "monthly_conductor_spend_usd, monthly_conductor_cap_usd, monthly_conductor_period_start",
      )
      .eq("id", memberId)
      .maybeSingle();

    if (error || !data) {
      return {
        capExceeded: false,
        monthlyTotalUsd: 0,
        monthlyCapUsd: null,
        periodStart: currentPeriodStart(),
        recommendedAction: "allow",
      };
    }

    return decideFromRecord(data as MemberCostCapRecord);
  } catch {
    return {
      capExceeded: false,
      monthlyTotalUsd: 0,
      monthlyCapUsd: null,
      periodStart: currentPeriodStart(),
      recommendedAction: "allow",
    };
  }
}

/**
 * Increment the member's monthly Conductor spend by `costUsd`.
 * Resets the period if stale. Non-fatal: log-and-continue on errors.
 *
 * Returns the new total AFTER increment for telemetry consumers.
 */
export async function recordSpend(
  memberId: string,
  costUsd: number,
): Promise<{ ok: boolean; newTotalUsd: number | null }> {
  if (costUsd < 0 || !isFinite(costUsd)) return { ok: false, newTotalUsd: null };

  try {
    const { data: existing, error: readErr } = await (supabase as any)
      .from("members")
      .select("monthly_conductor_spend_usd, monthly_conductor_period_start")
      .eq("id", memberId)
      .maybeSingle();
    if (readErr) return { ok: false, newTotalUsd: null };

    const stale = isPeriodStale(existing?.monthly_conductor_period_start ?? null);
    const prior = stale ? 0 : (existing?.monthly_conductor_spend_usd ?? 0);
    const newTotal = prior + costUsd;
    const newPeriod = currentPeriodStart();

    const { error: writeErr } = await (supabase as any)
      .from("members")
      .update({
        monthly_conductor_spend_usd: newTotal,
        monthly_conductor_period_start: newPeriod,
      })
      .eq("id", memberId);

    if (writeErr) return { ok: false, newTotalUsd: null };
    return { ok: true, newTotalUsd: newTotal };
  } catch {
    return { ok: false, newTotalUsd: null };
  }
}

/**
 * Set or clear a member's monthly Conductor spend cap (in USD).
 * Pass `null` to remove the cap.
 */
export async function setSpendCap(
  memberId: string,
  capUsd: number | null,
): Promise<boolean> {
  if (capUsd !== null && (capUsd < 0 || !isFinite(capUsd))) return false;
  try {
    const { error } = await (supabase as any)
      .from("members")
      .update({ monthly_conductor_cap_usd: capUsd })
      .eq("id", memberId);
    return !error;
  } catch {
    return false;
  }
}
