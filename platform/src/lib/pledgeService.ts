/**
 * PLEDGE SERVICE — Core crowdfunding mechanism for Liana Banyan
 * ==============================================================
 * Users back projects with Credits. No securities. No profit expectation.
 * Credits deducted -> pledge recorded -> project progress updated.
 * "As You Wish" confirms every transaction.
 *
 * Innovation #1541 — Project Pledge System (Session 8A)
 */

import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

// ─── Types ──────────────────────────────────────────────────────

export interface ProjectPledge {
  id: string;
  project_id: string;
  user_id: string;
  amount_credits: number;
  wave_id: string | null;
  status: "active" | "cancelled" | "fulfilled" | "refunded";
  cancelled_at: string | null;
  cancellation_reason: string | null;
  fulfilled_at: string | null;
  refunded_at: string | null;
  transaction_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectFundingSummary {
  project_id: string;
  project_name: string;
  funding_goal: number;
  total_pledged: number;
  unique_backers: number;
  funding_percentage: number;
  funding_deadline: string | null;
  project_status: string;
}

export interface PledgeResult {
  success: boolean;
  pledge?: ProjectPledge;
  error?: string;
}

export interface CancelResult {
  success: boolean;
  refunded_amount?: number;
  error?: string;
}

// ─── Pledge Creation ────────────────────────────────────────────

/**
 * Back a project with Credits.
 * 1. Check user has sufficient credits
 * 2. Deduct credits from user_credits
 * 3. Record credit_transaction
 * 4. Create project_pledge
 * 5. Project totals update via DB trigger
 */
export async function createPledge(
  projectId: string,
  amount: number,
  waveId?: string,
  metadata?: Record<string, unknown>
): Promise<PledgeResult> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You must be signed in to back a project." };
    }

    // Check credit balance
    const { data: credits, error: creditsError } = await supabase
      .from("user_credits")
      .select("total_credits, used_credits")
      .eq("user_id", user.id)
      .single();

    if (creditsError || !credits) {
      return { success: false, error: "Could not retrieve your credit balance." };
    }

    const available = (credits.total_credits || 0) - (credits.used_credits || 0);
    if (available < amount) {
      return {
        success: false,
        error: `Insufficient credits. You have ${available} Credits available, but this pledge requires ${amount}.`,
      };
    }

    // Record the credit transaction
    const balanceBefore = credits.total_credits || 0;
    const { data: transaction, error: txError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        transaction_type: "pledge",
        amount: -amount,
        balance_before: balanceBefore,
        balance_after: balanceBefore - amount,
        description: `Project pledge`,
        reference_type: "project_pledge",
        reference_id: projectId,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (txError || !transaction) {
      console.error("Failed to record credit transaction:", txError);
      return { success: false, error: "Transaction failed. Your credits were not charged." };
    }

    // Deduct from user_credits
    const { error: deductError } = await supabase
      .from("user_credits")
      .update({
        used_credits: (credits.used_credits || 0) + amount,
        last_activity_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (deductError) {
      console.error("Failed to deduct credits:", deductError);
      // Attempt to reverse the transaction
      await supabase
        .from("credit_transactions")
        .delete()
        .eq("id", transaction.id);
      return { success: false, error: "Credit deduction failed. Please try again." };
    }

    // Create the pledge record
    // Note: If project_pledges table doesn't exist yet, this will fail gracefully
    const { data: pledge, error: pledgeError } = await supabase
      .from("project_pledges" as any)
      .insert({
        project_id: projectId,
        user_id: user.id,
        amount_credits: amount,
        wave_id: waveId || null,
        status: "active",
        transaction_id: transaction.id,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (pledgeError) {
      // Table may not exist yet — that's OK, the credit_transaction itself
      // serves as the pledge record via reference_type = 'project_pledge'
      console.warn("project_pledges table not available:", pledgeError.message);
      trackEvent("project_backed", { project_id: projectId, amount });
      return {
        success: true,
        pledge: {
          id: transaction.id,
          project_id: projectId,
          user_id: user.id,
          amount_credits: amount,
          wave_id: waveId || null,
          status: "active",
          cancelled_at: null,
          cancellation_reason: null,
          fulfilled_at: null,
          refunded_at: null,
          transaction_id: transaction.id,
          metadata: metadata || {},
          created_at: transaction.created_at || new Date().toISOString(),
          updated_at: transaction.created_at || new Date().toISOString(),
        },
      };
    }

    trackEvent("project_backed", { project_id: projectId, amount });
    return { success: true, pledge: pledge as unknown as ProjectPledge };
  } catch (err) {
    console.error("Pledge creation failed:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

// ─── Pledge Cancellation ────────────────────────────────────────

/**
 * Cancel an active pledge and refund credits.
 * "I've Changed My Mind" — credits returned, pledge marked cancelled.
 */
export async function cancelPledge(
  pledgeId: string,
  reason?: string
): Promise<CancelResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }

    // Try to get pledge from project_pledges table first
    const { data: pledge, error: pledgeError } = await supabase
      .from("project_pledges" as any)
      .select("*")
      .eq("id", pledgeId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (pledgeError || !pledge) {
      // Fallback: look in credit_transactions
      const { data: tx } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("id", pledgeId)
        .eq("user_id", user.id)
        .eq("reference_type", "project_pledge")
        .single();

      if (!tx) {
        return { success: false, error: "Pledge not found or already cancelled." };
      }

      // Refund via new transaction
      const refundAmount = Math.abs(tx.amount);
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        transaction_type: "pledge_refund",
        amount: refundAmount,
        balance_before: tx.balance_after,
        balance_after: tx.balance_after + refundAmount,
        description: `Pledge cancellation refund`,
        reference_type: "pledge_refund",
        reference_id: pledgeId,
      });

      // Restore credits
      const { data: credits } = await supabase
        .from("user_credits")
        .select("used_credits")
        .eq("user_id", user.id)
        .single();

      if (credits) {
        await supabase
          .from("user_credits")
          .update({
            used_credits: Math.max(0, (credits.used_credits || 0) - refundAmount),
            last_activity_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }

      trackEvent("pledge_cancelled", { pledge_id: pledgeId, refunded: refundAmount });
      return { success: true, refunded_amount: refundAmount };
    }

    // Cancel via project_pledges table
    const typedPledge = pledge as unknown as ProjectPledge;
    const refundAmount = typedPledge.amount_credits;

    // Update pledge status
    await supabase
      .from("project_pledges" as any)
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || "User cancelled",
      })
      .eq("id", pledgeId);

    // Refund transaction
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      transaction_type: "pledge_refund",
      amount: refundAmount,
      balance_before: 0,
      balance_after: refundAmount,
      description: `Pledge cancellation refund`,
      reference_type: "pledge_refund",
      reference_id: pledgeId,
    });

    // Restore credits
    const { data: credits } = await supabase
      .from("user_credits")
      .select("used_credits")
      .eq("user_id", user.id)
      .single();

    if (credits) {
      await supabase
        .from("user_credits")
        .update({
          used_credits: Math.max(0, (credits.used_credits || 0) - refundAmount),
          last_activity_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    trackEvent("pledge_cancelled", { pledge_id: pledgeId, refunded: refundAmount });
    return { success: true, refunded_amount: refundAmount };
  } catch (err) {
    console.error("Pledge cancellation failed:", err);
    return { success: false, error: "Cancellation failed. Please try again." };
  }
}

// ─── Queries ────────────────────────────────────────────────────

/**
 * Get all pledges for the current user.
 * Falls back to credit_transactions if project_pledges table doesn't exist.
 */
export async function getUserPledges(): Promise<ProjectPledge[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Try project_pledges table first
  const { data: pledges, error } = await supabase
    .from("project_pledges" as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!error && pledges && pledges.length > 0) {
    return pledges as unknown as ProjectPledge[];
  }

  // Fallback: derive from credit_transactions
  const { data: txs } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("reference_type", "project_pledge")
    .order("created_at", { ascending: false });

  if (!txs) return [];

  return txs.map((tx) => ({
    id: tx.id,
    project_id: tx.reference_id || "",
    user_id: tx.user_id,
    amount_credits: Math.abs(tx.amount),
    wave_id: null,
    status: "active" as const,
    cancelled_at: null,
    cancellation_reason: null,
    fulfilled_at: null,
    refunded_at: null,
    transaction_id: tx.id,
    metadata: (tx.metadata as Record<string, unknown>) || {},
    created_at: tx.created_at || "",
    updated_at: tx.created_at || "",
  }));
}

/**
 * Get funding summary for a project.
 * Falls back to credit_transactions aggregation if view doesn't exist.
 */
export async function getProjectFundingSummary(
  projectId: string
): Promise<ProjectFundingSummary | null> {
  // Try the view first
  const { data: summary, error } = await supabase
    .from("project_funding_summary" as any)
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (!error && summary) {
    return summary as unknown as ProjectFundingSummary;
  }

  // Fallback: query projects + credit_transactions
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  const { data: txs } = await supabase
    .from("credit_transactions")
    .select("amount, user_id")
    .eq("reference_type", "project_pledge")
    .eq("reference_id", projectId);

  const totalPledged = txs
    ? txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    : 0;
  const uniqueBackers = txs
    ? new Set(txs.map((tx) => tx.user_id)).size
    : 0;

  return {
    project_id: project.id,
    project_name: project.name,
    funding_goal: 0,
    total_pledged: totalPledged,
    unique_backers: uniqueBackers,
    funding_percentage: 0,
    funding_deadline: null,
    project_status: project.status || "active",
  };
}

/**
 * Check if the current user has already pledged to a project.
 */
export async function hasUserPledged(projectId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Try project_pledges first
  const { count, error } = await supabase
    .from("project_pledges" as any)
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .eq("status", "active");

  if (!error && count !== null) {
    return count > 0;
  }

  // Fallback
  const { count: txCount } = await supabase
    .from("credit_transactions")
    .select("id", { count: "exact", head: true })
    .eq("reference_type", "project_pledge")
    .eq("reference_id", projectId)
    .eq("user_id", user.id);

  return (txCount || 0) > 0;
}
