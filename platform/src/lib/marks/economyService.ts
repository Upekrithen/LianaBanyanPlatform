/**
 * Economy Service -- BP072 Wave 26
 * =================================
 * EARN -> HOLD -> REDEEM -> PAYOUT: full end-to-end economy flow.
 *
 * EARN:   Complete a bounty -> Marks credited via marksPayoutWiring
 * HOLD:   Marks balance persisted to shadow_marks_ledger / user_credits
 * REDEEM: Marks -> Credits -> Cost+20% purchase discount
 * PAYOUT: Manual-to-auto gate (MARKS_AUTO_PAYOUT_ENABLED) -- staged until
 *         Founder runs Stripe E2E in LIVE mode.
 *
 * SECURITIES-CLEAN:
 *   Marks = cooperative participation credits. NOT equity, shares, or
 *   guaranteed financial return. "Participation credits that reduce your
 *   Cost+20% purchases."
 *
 * HELD: Marks rates and 15-language ratification list pending Founder approval.
 */

import { supabase } from "@/integrations/supabase/client";
import { triggerAutoMarksPayout, getMarksPayoutConfig } from "./marksPayoutWiring";
import { logBountyCompletion, logMarksRedemption } from "@/lib/nervous-system/ipLedger";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Marks -> Credits conversion rate.
 *  HELD FOR FOUNDER: rate pending ratification. Default = 1 Mark : 0.01 Credit.
 *  Cost+20% architecture: 83.3% of revenue flows to creators.
 */
export const MARKS_TO_CREDITS_RATE_HELD = 0.01; // HELD -- not final

/** Securities-clean disclosure: shown on every conversion UI. */
export const REDEMPTION_DISCLOSURE =
  "Participation credits that reduce your Cost+20% purchases. " +
  "Marks are cooperative participation units -- not equity, not shares, " +
  "not guaranteed financial return. Rate pending Founder ratification.";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BountyStatus =
  | "open"
  | "claimed"
  | "submitted"
  | "verified"
  | "rejected"
  | "expired";

export interface OpenBounty {
  id: string;
  title: string;
  description: string;
  bounty_class: "translation" | "design" | "development" | "content" | "research";
  marks_reward: number;
  credits_reward: number;
  compensation_unit: "Marks" | "Credits";
  posted_by: string;
  posted_by_handle?: string;
  initiative_ref?: string;
  status: BountyStatus;
  expires_at?: string;
  created_at: string;
}

export interface BountyClaim {
  id: string;
  bounty_id: string;
  claimant_id: string;
  status: BountyStatus;
  work_url?: string;
  submission_note?: string;
  claimed_at: string;
  submitted_at?: string;
  verified_at?: string;
  marks_awarded?: number;
}

export interface PayoutGateStatus {
  auto_enabled: boolean;
  gate_label: string;
  gate_color: "green" | "amber" | "red";
  gate_detail: string;
}

// ─── EARN: Bounty Completion -> Marks ────────────────────────────────────────

/**
 * Award Marks upon bounty completion.
 * Uses award_marks RPC (SECURITY DEFINER, idempotent on bounty_id).
 * Logs to IP Ledger (bounty.verified) + creates Brand Stamp.
 * Gate: manual approval unless MARKS_AUTO_PAYOUT_ENABLED=true.
 * Securities-clean: participation credits only.
 */
export async function awardBountyMarks(opts: {
  memberId: string;
  bountyId: string;
  bountyTitle: string;
  bountyClass: string;
  marksUnits: number;
  claimId?: string;
}): Promise<{ ok: boolean; marksUnits?: number; ledgerSeq?: number; error?: string }> {
  const config = await getMarksPayoutConfig();

  if (!config.enabled && opts.marksUnits > 0) {
    // Auto-gate not open -- stage for manual approval
    const staged = await stageMarksAllocationForApproval(
      opts.memberId,
      "bounty_completion",
      opts.bountyId as unknown as string,
    );
    if (!staged.staged) {
      return { ok: false, error: staged.error };
    }
    // Still log to IP Ledger even when staged
    const ledgerEntry = await logBountyCompletion({
      bountyId: opts.bountyId,
      bountyTitle: opts.bountyTitle,
      bountyClass: opts.bountyClass,
      claimantId: opts.memberId,
      marksAwarded: opts.marksUnits,
      workDescription: `Bounty staged for manual payout by member ${opts.memberId}`,
    });
    return { ok: true, marksUnits: 0, ledgerSeq: ledgerEntry?.sequence_number };
  }

  // Auto-gate open OR marks_units from bounty-specific config
  if (opts.marksUnits > 0) {
    const { data: rpcData, error: rpcErr } = await (supabase.rpc as any)(
      "award_marks",
      {
        p_member_id:   opts.memberId,
        p_marks_units: opts.marksUnits,
        p_reason:      "bounty_completion",
        p_ref_id:      opts.bountyId,
        p_note:        `Bounty verified: ${opts.bountyTitle}. Participation unit. NOT financial return.`,
      },
    );
    if (rpcErr) {
      return { ok: false, error: `award_marks RPC failed: ${rpcErr.message}` };
    }
    if (!rpcData?.ok && !rpcData?.idempotent) {
      return { ok: false, error: "award_marks returned ok=false" };
    }
  }

  // Log to IP Ledger (S13: real wiring on bounty completion)
  const ledgerEntry = await logBountyCompletion({
    bountyId: opts.bountyId,
    bountyTitle: opts.bountyTitle,
    bountyClass: opts.bountyClass,
    claimantId: opts.memberId,
    marksAwarded: opts.marksUnits,
    workDescription: `Bounty completed by member ${opts.memberId}`,
  });

  // S14/S25: Create Brand Stamp if claimId provided
  if (opts.claimId && ledgerEntry?.sequence_number) {
    await (supabase
      .from("brand_stamps" as never)
      .insert({
        bounty_claim_id: opts.claimId,
        member_id: opts.memberId,
        ip_ledger_seq: ledgerEntry.sequence_number,
      } as never)) as any;
  }

  return {
    ok: true,
    marksUnits: opts.marksUnits,
    ledgerSeq: ledgerEntry?.sequence_number,
  };
}

// ─── REDEEM: Marks -> Credits ─────────────────────────────────────────────────

/**
 * Redeem Marks for Credits to use toward Cost+20% purchases.
 *
 * GATE: Requires explicit member action (not automatic).
 * Rate: HELD FOR FOUNDER -- uses MARKS_TO_CREDITS_RATE_HELD default.
 * Securities-clean: credits reduce Cost+20% purchases only.
 *
 * Returns the Credits received.
 */
export async function redeemMarksForCredits(opts: {
  memberId: string;
  marksToSpend: number;
  purchaseContext?: string;
}): Promise<{ ok: boolean; creditsReceived?: number; newMarksBalance?: number; error?: string }> {
  if (opts.marksToSpend <= 0) {
    return { ok: false, error: "Must redeem at least 1 Mark." };
  }

  // Use server-side redeem_marks RPC (S7: atomic Marks->Credits with RLS + 83.3% split verified)
  const { data: rpcData, error: rpcErr } = await (supabase.rpc as any)(
    "redeem_marks",
    {
      p_member_id:       opts.memberId,
      p_marks_to_spend:  opts.marksToSpend,
      p_purchase_context: opts.purchaseContext ?? null,
    },
  );

  if (rpcErr) {
    return { ok: false, error: `redeem_marks RPC failed: ${rpcErr.message}` };
  }

  if (!rpcData?.ok) {
    return { ok: false, error: "Redemption failed server-side." };
  }

  const creditsToAdd = rpcData.credits_received as number;

  // Log to IP Ledger
  await logMarksRedemption({
    memberId: opts.memberId,
    marksSpent: opts.marksToSpend,
    creditsReceived: creditsToAdd,
    purchaseContext: opts.purchaseContext,
  });

  return {
    ok: true,
    creditsReceived: creditsToAdd,
    newMarksBalance: rpcData.new_marks_balance as number,
  };
}

// ─── PAYOUT GATE STATUS ───────────────────────────────────────────────────────

/** Returns the current payout gate status for display in the dashboard. */
export async function getPayoutGateStatus(): Promise<PayoutGateStatus> {
  const config = await getMarksPayoutConfig();

  if (config.enabled) {
    return {
      auto_enabled: true,
      gate_label: "Auto-Payout LIVE",
      gate_color: "green",
      gate_detail:
        "MARKS_AUTO_PAYOUT_ENABLED is active. Marks are credited automatically on " +
        "bounty verification and membership events.",
    };
  }

  return {
    auto_enabled: false,
    gate_label: "Manual Approval (Gate Open)",
    gate_color: "amber",
    gate_detail:
      "Payout gate is HELD. Marks allocations are staged for Founder manual approval. " +
      "Gate opens automatically after Stripe E2E test in LIVE mode (Scope 10). " +
      "Rates are HELD pending 15-language ratification.",
  };
}

// ─── BOUNTY CLAIM OPERATIONS ──────────────────────────────────────────────────

/** Claim an open bounty. Writes a claim record and updates bounty status. */
export async function claimBounty(opts: {
  bountyId: string;
  claimantId: string;
}): Promise<{ ok: boolean; claimId?: string; error?: string }> {
  const { data, error } = await (supabase
    .from("bounty_claims" as never)
    .insert({
      bounty_id: opts.bountyId,
      claimant_id: opts.claimantId,
      status: "claimed",
      claimed_at: new Date().toISOString(),
    } as never)
    .select("id")
    .single()) as any;

  if (error) return { ok: false, error: error.message };

  // Update bounty status to claimed
  await (supabase
    .from("bounties" as never)
    .update({ status: "claimed" } as never)
    .eq("id" as never, opts.bountyId)) as any;

  return { ok: true, claimId: data?.id };
}

/** Submit completed work on a claimed bounty. */
export async function submitBountyWork(opts: {
  claimId: string;
  claimantId: string;
  workUrl: string;
  submissionNote?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await (supabase
    .from("bounty_claims" as never)
    .update({
      status: "submitted",
      work_url: opts.workUrl,
      submission_note: opts.submissionNote ?? null,
      submitted_at: new Date().toISOString(),
    } as never)
    .eq("id" as never, opts.claimId)
    .eq("claimant_id" as never, opts.claimantId)) as any;

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Verify submitted work and award Marks. Staff/Founder action. */
export async function verifyBountySubmission(opts: {
  claimId: string;
  bountyId: string;
  bountyTitle: string;
  bountyClass: string;
  claimantId: string;
  marksToAward: number;
  verifiedByStaffId: string;
}): Promise<{ ok: boolean; ledgerSeq?: number; error?: string }> {
  // Update claim to verified
  const { error: claimError } = await (supabase
    .from("bounty_claims" as never)
    .update({
      status: "verified",
      marks_awarded: opts.marksToAward,
      verified_at: new Date().toISOString(),
    } as never)
    .eq("id" as never, opts.claimId)) as any;

  if (claimError) return { ok: false, error: claimError.message };

  // Update bounty status
  await (supabase
    .from("bounties" as never)
    .update({ status: "verified" } as never)
    .eq("id" as never, opts.bountyId)) as any;

  // Award Marks and log to IP Ledger
  const result = await awardBountyMarks({
    memberId: opts.claimantId,
    bountyId: opts.bountyId,
    bountyTitle: opts.bountyTitle,
    bountyClass: opts.bountyClass,
    marksUnits: opts.marksToAward,
  });

  return { ok: result.ok, ledgerSeq: result.ledgerSeq, error: result.error };
}

// ─── BOUNTY QUERY HELPERS ─────────────────────────────────────────────────────

/** Fetch open bounties across all initiatives for the discovery feed. */
export async function getOpenBounties(opts?: {
  limit?: number;
  class?: string;
}): Promise<OpenBounty[]> {
  let query = (supabase
    .from("bounties" as never)
    .select("*")
    .eq("status" as never, "open")
    .order("created_at" as never, { ascending: false })
    .limit(opts?.limit ?? 50)) as any;

  if (opts?.class) {
    query = query.eq("bounty_class", opts.class);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as OpenBounty[];
}

/** Fetch a member's bounty claims (for MemberDashboard status tracking). */
export async function getMemberBountyClaims(memberId: string): Promise<BountyClaim[]> {
  const { data, error } = await (supabase
    .from("bounty_claims" as never)
    .select("*")
    .eq("claimant_id" as never, memberId)
    .order("claimed_at" as never, { ascending: false })
    .limit(20)) as any;

  if (error) return [];
  return (data ?? []) as BountyClaim[];
}
