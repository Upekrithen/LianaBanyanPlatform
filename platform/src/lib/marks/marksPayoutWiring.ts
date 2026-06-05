/**
 * Marks Payout Wiring -- BP072 Wave 3 / Scope 17
 * ================================================
 * Connects the membership activation (Stripe checkout complete) to
 * the first Marks allocation for a new member.
 *
 * GATE: This module only activates AFTER scope 10 (Stripe E2E) is
 * validated in LIVE mode by the Founder. The manual-to-automatic gate
 * is controlled by the MARKS_AUTO_PAYOUT_ENABLED feature flag.
 *
 * SECURITIES-CLEAN REMINDER:
 *   Marks are cooperative PARTICIPATION credits -- not equity, not shares,
 *   not guaranteed financial return. Every function in this module must
 *   treat Marks as participation units only.
 *
 * Two-phase payout model:
 *   Phase 1 (manual): Founder manually approves first-Marks allocation
 *   Phase 2 (automatic): MARKS_AUTO_PAYOUT_ENABLED=true; allocation fires
 *                        automatically on webhook confirmation
 *
 * Marks rates: HELD FOR FOUNDER (15-language list, Pawn-gated)
 * This file wires the mechanics only -- not the rates.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

/** The reason a Marks allocation was created. */
export type MarksAllocationReason =
  | "membership_join"      // first-ever membership payment
  | "membership_renewal"   // annual renewal
  | "bounty_completion"    // bounty work completed
  | "mesh_participation"   // folder shared to the cooperative mesh
  | "referral_credit"      // referred a new member
  | "governance_vote"      // participated in a cooperative vote
  | "content_contribution"; // content contributed to the platform corpus

/** A single Marks allocation event. Securities-clean: units, not currency. */
export interface MarksAllocation {
  allocation_id: string;
  member_id: string;
  reason: MarksAllocationReason;
  marks_units: number;     // participation units -- never "dollars" or "returns"
  triggered_by?: string;   // the event or record ID that triggered this
  allocated_at: string;    // ISO timestamp
  phase: "manual" | "automatic";
  approved_by?: string;    // staff ID (manual phase only)
  note: string;            // human-readable note for the ledger
}

/** Feature flag interface (from platform_canonical or env). */
export interface MarksAutoPayoutConfig {
  enabled: boolean;
  join_marks_units: number;   // units awarded on first membership join
  renewal_marks_units: number;
}

// ─── Feature flag ────────────────────────────────────────────────────────────

/** Returns the current payout config from Supabase or falls back to safe defaults. */
export async function getMarksPayoutConfig(): Promise<MarksAutoPayoutConfig> {
  // MARKS_AUTO_PAYOUT_ENABLED must be set to 'true' in platform_canonical
  // OR as a Supabase env variable before automatic phase activates.
  const { data } = await supabase
    .from("platform_canonical" as never)
    .select("key, value")
    .in("key", ["marks_auto_payout_enabled", "marks_join_units", "marks_renewal_units"]) as any;

  const rows: { key: string; value: string | number }[] = data || [];
  const rowMap: Record<string, string | number> = {};
  for (const r of rows) rowMap[r.key] = r.value;

  const enabled = rowMap["marks_auto_payout_enabled"] === "true" || rowMap["marks_auto_payout_enabled"] === true;
  // Rates: HELD FOR FOUNDER -- default to 0 until Founder sets them in canonical table.
  const join_marks_units = Number(rowMap["marks_join_units"] ?? 0);
  const renewal_marks_units = Number(rowMap["marks_renewal_units"] ?? 0);

  return { enabled, join_marks_units, renewal_marks_units };
}

// ─── Manual phase ─────────────────────────────────────────────────────────────

/**
 * Stage a Marks allocation for manual Founder approval.
 * Call this from the membership webhook handler until auto-payout is enabled.
 *
 * The allocation is written to marks_allocation_queue with status='pending_approval'.
 * Founder approves from the staff dashboard.
 */
export async function stageMarksAllocationForApproval(
  memberId: string,
  reason: MarksAllocationReason,
  triggeredBy?: string,
): Promise<{ staged: boolean; queueId?: string; error?: string }> {
  const config = await getMarksPayoutConfig();
  if (config.enabled) {
    // Auto-payout is live -- this function should not be called
    return { staged: false, error: "Auto-payout is enabled; use triggerAutoMarksPayout instead." };
  }

  const units =
    reason === "membership_join" ? config.join_marks_units
    : reason === "membership_renewal" ? config.renewal_marks_units
    : 0;

  const { data, error } = await (supabase
    .from("marks_allocation_queue" as never)
    .insert({
      member_id: memberId,
      reason,
      marks_units: units,
      triggered_by: triggeredBy ?? null,
      phase: "manual",
      status: "pending_approval",
      note: `Staged for Founder approval. Reason: ${reason}. Rate: HELD FOR FOUNDER.`,
    } as never)
    .select("id")
    .single()) as any;

  if (error) return { staged: false, error: error.message };
  return { staged: true, queueId: data?.id };
}

// ─── Automatic phase (GATE: MARKS_AUTO_PAYOUT_ENABLED) ───────────────────────

/**
 * Trigger an automatic Marks allocation.
 *
 * GATE: Only executes when MARKS_AUTO_PAYOUT_ENABLED is true in platform_canonical.
 * This is set by the Founder after the Stripe E2E test (scope 10) validates in LIVE mode.
 *
 * Securities-clean: allocates participation units only. Does not promise financial return.
 */
export async function triggerAutoMarksPayout(
  memberId: string,
  reason: MarksAllocationReason,
  triggeredBy?: string,
): Promise<{ ok: boolean; marksUnits?: number; error?: string }> {
  const config = await getMarksPayoutConfig();

  if (!config.enabled) {
    // Auto gate not open -- fall back to staging for manual approval
    const staged = await stageMarksAllocationForApproval(memberId, reason, triggeredBy);
    return {
      ok: staged.staged,
      error: staged.error ?? "Auto-payout not enabled; staged for manual approval.",
    };
  }

  const units =
    reason === "membership_join" ? config.join_marks_units
    : reason === "membership_renewal" ? config.renewal_marks_units
    : 0;

  if (units === 0) {
    return {
      ok: false,
      error: "Marks units for this reason are 0 -- Founder must set rates in platform_canonical.",
    };
  }

  // Insert the allocation
  const { error: insertError } = await (supabase
    .from("marks_allocation_queue" as never)
    .insert({
      member_id: memberId,
      reason,
      marks_units: units,
      triggered_by: triggeredBy ?? null,
      phase: "automatic",
      status: "approved",
      note: `Auto-payout. Reason: ${reason}. Units: ${units}. ` +
            `Marks = cooperative participation -- not equity, not guaranteed return.`,
    } as never)) as any;

  if (insertError) return { ok: false, error: insertError.message };

  // Update user_credits.marks_balance
  const { error: creditsError } = await (supabase.rpc as any)(
    "increment_marks_balance",
    { p_user_id: memberId, p_delta: units },
  );

  if (creditsError) {
    return { ok: false, error: `Marks balance update failed: ${creditsError.message}` };
  }

  return { ok: true, marksUnits: units };
}

// ─── Disclosure ───────────────────────────────────────────────────────────────

/**
 * Returns the standard securities-clean disclosure text for any UI that
 * mentions Marks.
 */
export function marksDisclosureText(): string {
  return (
    "Marks represent your participation in the Liana Banyan cooperative -- " +
    "not equity, shares, or any guaranteed financial return. " +
    "Marks accumulate as you contribute to the cooperative and may be " +
    "used to access platform features. " +
    "Cost+20% architecture; 83.3% of platform revenue flows to creators."
  );
}
