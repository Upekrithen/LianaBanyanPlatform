/**
 * THREE-GEAR CURRENCY SERVICE
 * ============================
 * Gear 1: Credits — service access (buy/earn/spend)
 * Gear 2: MARKS — reputation (earn only, permanent, public)
 * Gear 3: Joules — locked-value (earn by backing, permanent, public)
 *
 * "Credits access. Marks unlock. Joules protect."
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ───

export type MarkLevel = "seedling" | "sprout" | "sapling" | "tree" | "grove" | "forest";

export type JoulesBacking = "premint" | "minted" | "production" | "distribution" | "established";

export interface MemberCurrency {
  credits: number;
  marks: number;
  markLevel: MarkLevel;
  votingMultiplier: number;
  crownEligible: boolean;
  joules: number;
  joulesLockedValue: number;
}

export interface MarkTransaction {
  id: string;
  amount: number;
  reason: string;
  reasonType: string;
  balanceAfter: number;
  createdAt: string;
}

export interface JouleTransaction {
  id: string;
  joulesAmount: number;
  creditsSpent: number;
  multiplierUsed: number;
  lockedValue: number;
  reason: string;
  reasonType: string;
  balanceAfter: number;
  createdAt: string;
}

// ─── Joule Multipliers by Backing Stage ───

export const JOULE_MULTIPLIERS: Record<JoulesBacking, number> = {
  premint: 5,
  minted: 3,
  production: 2,
  distribution: 1.5,
  established: 1,
};

// ─── MARKS Level Thresholds ───

export const MARK_LEVELS: { level: MarkLevel; min: number; title: string; multiplier: number; benefits: string }[] = [
  { level: "seedling", min: 0, title: "Seedling", multiplier: 1.0, benefits: "Basic access" },
  { level: "sprout", min: 100, title: "Sprout", multiplier: 1.0, benefits: "Priority support" },
  { level: "sapling", min: 500, title: "Sapling", multiplier: 1.0, benefits: "Beta features" },
  { level: "tree", min: 1000, title: "Tree", multiplier: 1.5, benefits: "1.5x voting multiplier" },
  { level: "grove", min: 5000, title: "Grove", multiplier: 2.0, benefits: "2x voting multiplier" },
  { level: "forest", min: 10000, title: "Forest", multiplier: 3.0, benefits: "3x multiplier, Crown eligible" },
];

// ─── MARKS Earning Rules ───

export const MARKS_EARNING: Record<string, { amount: number; description: string }> = {
  bounty_complete: { amount: 50, description: "Complete a bounty" },
  project_shipped: { amount: 25, description: "Project you backed ships" },
  referral: { amount: 15, description: "Refer a new member" },
  helpful_review: { amount: 5, description: "Write a helpful review" },
  valid_issue: { amount: 10, description: "Report a valid issue" },
  crown_nomination: { amount: 50, description: "Crown nomination" },
  golden_key: { amount: 10, description: "Golden Key found" },
  beacon_map_complete: { amount: 1, description: "Complete a beacon map" },
  service_delivered: { amount: 0, description: "Deliver a MARKS-for-MARKS service (variable)" },
};

// ─── MATCHTRADE — MARKS-for-MARKS Reciprocal Services ───
//
// From Cephas: "I'll babysit if you fix my air conditioner."
// Innovation #945 — Stake Account backed.
//
// How it works (per spec):
//   1. Buy Joules (any amount)
//   2. Joules go to your Stake Account (collateral)
//   3. Stake Account Joules = maximum MARKS you can offer
//   4. You cannot spend what you haven't backed
//
// The flow:
//   - Post what you NEED (costs 1 MARK bounty)
//   - Post what you OFFER (free)
//   - LB matches by location + service type
//   - Provider accepts → does the work → requester confirms
//   - MARKS transfer on confirmation
//
// If provider doesn't deliver → their Stake Account Joules cover the penalty
//
// Geographic limiting: postal code / city → only shows local matches
// Solvency: every MARK is backed by Joules in someone's Stake Account

export interface MatchTradeOffer {
  id: string;
  offererId: string;
  offererName?: string;
  serviceTitle: string;
  serviceDescription: string;
  category: string;
  marksPrice: number;           // MARKS value of the service
  joulesCollateral: number;     // Joules backing the guarantee (from Stake Account)
  seekingCategory?: string;
  seekingDescription?: string;
  postalCode?: string;          // Geographic filter
  radiusMiles?: number;
  status: "open" | "matched" | "in_progress" | "delivered" | "disputed" | "cancelled" | "completed";
  matchedWithId?: string;
}

export interface MatchTradeMatch {
  id: string;
  offerA: string;
  offerB: string;
  status: "active" | "a_delivered" | "b_delivered" | "completed" | "disputed";
  aDeliveredAt?: string;
  bDeliveredAt?: string;
  completedAt?: string;
}

/**
 * Calculate Joules needed in Stake Account to back a MatchTrade offer.
 * 1:1 ratio — 500 MARKS offer needs 500 Joules in Stake Account.
 */
export function calculateMatchTradeCacheRequired(marksPrice: number): number {
  return marksPrice; // 1:1 Joules backing
}

/**
 * Cost to post a bounty (need).
 */
export const MATCHTRADE_BOUNTY_COST = 1; // 1 MARK to post a need

// ─── API Functions ───

/**
 * Get the current user's full currency dashboard.
 */
export async function getMemberCurrency(): Promise<MemberCurrency | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get credits
  const { data: credits } = await supabase
    .from("user_credits")
    .select("eoi_credits, eoi_used_credits")
    .eq("user_id", user.id)
    .single();

  // Get marks
  const { data: marks } = await supabase
    .from("user_marks")
    .select("total_marks, mark_level, voting_multiplier, crown_eligible")
    .eq("user_id", user.id)
    .single();

  // Get joules
  const { data: joules } = await supabase
    .from("user_joules")
    .select("total_joules, total_locked_value")
    .eq("user_id", user.id)
    .single();

  return {
    credits: Number(credits?.eoi_credits || 0) - Number(credits?.eoi_used_credits || 0),
    marks: Number(marks?.total_marks || 0),
    markLevel: (marks?.mark_level as MarkLevel) || "seedling",
    votingMultiplier: Number(marks?.voting_multiplier || 1),
    crownEligible: marks?.crown_eligible || false,
    joules: Number(joules?.total_joules || 0),
    joulesLockedValue: Number(joules?.total_locked_value || 0),
  };
}

/**
 * Get MARKS transaction history for current user.
 */
export async function getMarksHistory(limit = 50): Promise<MarkTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("marks_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    reason: t.reason,
    reasonType: t.reason_type,
    balanceAfter: Number(t.balance_after),
    createdAt: t.created_at,
  }));
}

/**
 * Get Joules transaction history for current user.
 */
export async function getJoulesHistory(limit = 50): Promise<JouleTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("joules_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map((t) => ({
    id: t.id,
    joulesAmount: Number(t.joules_amount),
    creditsSpent: Number(t.credits_spent),
    multiplierUsed: Number(t.multiplier_used),
    lockedValue: Number(t.locked_value),
    reason: t.reason,
    reasonType: t.reason_type,
    balanceAfter: Number(t.balance_after),
    createdAt: t.created_at,
  }));
}

/**
 * Calculate Cost+20% split for a given amount.
 * Does NOT execute — just shows the math.
 */
export function calculateCostPlus20(grossAmount: number) {
  const creatorPercent = 0.833; // 83.3% — from DNA Lock
  const creatorShare = Math.round(grossAmount * creatorPercent * 100) / 100;
  const platformMargin = Math.round((grossAmount - creatorShare) * 100) / 100;
  const initiativeFund = Math.round(platformMargin * 0.5 * 100) / 100;

  return {
    grossAmount,
    creatorShare,
    platformMargin,
    initiativeFund,
    creatorPercent: 83.3,
    isCompliant: true, // Always true — these are constitutional constants
  };
}

/**
 * Read a DNA Lock parameter (public, logged).
 */
export async function readDnaLock(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("dna_lock")
    .select("parameter_value")
    .eq("parameter_key", key)
    .single();

  return data?.parameter_value || null;
}

/**
 * Get all DNA Lock parameters (public, for transparency display).
 */
export async function getAllDnaLockParams(): Promise<Array<{
  key: string;
  value: string;
  description: string;
  category: string;
  isLocked: boolean;
}>> {
  const { data } = await supabase
    .from("dna_lock")
    .select("parameter_key, parameter_value, description, category, is_locked")
    .order("category");

  return (data || []).map((d) => ({
    key: d.parameter_key,
    value: d.parameter_value,
    description: d.description,
    category: d.category,
    isLocked: d.is_locked,
  }));
}
