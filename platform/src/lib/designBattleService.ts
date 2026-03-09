/**
 * DESIGN BATTLE SERVICE
 * =====================
 * Competitive bounty system where 2+ participants compete for the same work.
 * 
 * Key Mechanics:
 * - Auto-triggers when 2+ people sign up for the same bounty
 * - Mixed currency ante (Credits, Marks, Joules)
 * - GAP rate conversion at contest time
 * - Winner takes 50% of pot + Crow Feathers
 * - Platform takes standard 16.7% margin
 *
 * From Founder:
 * "Joe: 1 day contest, 10 Joules (GAP rate 2x = 20 credits-equivalent)
 *  Mary: 1 week contest, 10 Credits
 *  Me: Join both with 1 Mark
 *  Winner gets 50% of pot"
 *
 * @see docs/MAKE_A_NAME_FOR_YOURSELF_SYSTEM.md
 */

import { supabase } from "@/integrations/supabase/client";
import { JOULE_MULTIPLIERS, type JoulesBacking } from "./currencyService";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type BattleStatus = 
  | "pending"      // Waiting for more participants
  | "active"       // Contest in progress
  | "voting"       // Submissions in, community voting
  | "completed"    // Winner declared, payouts distributed
  | "cancelled";   // Not enough participants or other issue

export type SkillTier = 
  | "novice"       // New to this type of work
  | "apprentice"   // Some experience
  | "journeyman"   // Solid experience
  | "expert"       // Highly skilled
  | "master"       // Top tier
  | "grandmaster"; // Elite

export type BattleTimeframe = 
  | "1hour"
  | "4hours"
  | "1day"
  | "3days"
  | "1week"
  | "2weeks"
  | "1month"
  | "3months";

export interface CurrencyAnte {
  credits: number;
  marks: number;
  joules: number;
}

export interface AnteEquivalent {
  original: CurrencyAnte;
  creditEquivalent: number; // Total value in credit-equivalent
  gapRateUsed: number;      // GAP rate at time of conversion
  convertedAt: Date;
}

export interface DesignBattle {
  id: string;
  bountyId: string;
  bountyTitle: string;
  status: BattleStatus;
  skillTier: SkillTier;
  timeframe: BattleTimeframe;
  startsAt: Date;
  endsAt: Date;
  minAnte: CurrencyAnte;
  totalPot: number;           // Credit-equivalent total
  platformCut: number;        // 16.7% of pot
  netPot: number;             // After platform cut
  winnerPayout: number;       // 50% of net pot
  participantCount: number;
  winnerId?: string;
  createdAt: Date;
}

export interface BattleParticipant {
  id: string;
  battleId: string;
  userId: string;
  displayName: string;
  ante: AnteEquivalent;
  submissionUrl?: string;
  submittedAt?: Date;
  voteCount: number;
  rank?: number;
  payout?: number;
  crowFeatherEarned?: boolean;
}

export interface PotCalculation {
  totalAnte: number;          // Sum of all antes (credit-equivalent)
  communityVotes: number;     // Additional credits from voting
  grossPot: number;           // totalAnte + communityVotes
  platformCut: number;        // 16.7% of gross
  netPot: number;             // grossPot - platformCut
  winnerShare: number;        // 50% of netPot
  runnerUpShare: number;      // Remaining split among others
  breakdown: {
    participantId: string;
    anteContribution: number;
    projectedPayout: number;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

// Platform margin (from DNA Lock)
const PLATFORM_MARGIN_PERCENT = 0.167; // 16.7%

// Winner takes 50% of net pot
const WINNER_SHARE_PERCENT = 0.50;

// Minimum antes by skill tier
export const MIN_ANTE_BY_TIER: Record<SkillTier, CurrencyAnte> = {
  novice:      { credits: 1, marks: 0, joules: 0 },
  apprentice:  { credits: 5, marks: 0, joules: 0 },
  journeyman:  { credits: 10, marks: 1, joules: 0 },
  expert:      { credits: 25, marks: 2, joules: 0 },
  master:      { credits: 50, marks: 5, joules: 1 },
  grandmaster: { credits: 100, marks: 10, joules: 5 },
};

// Timeframe durations in milliseconds
export const TIMEFRAME_MS: Record<BattleTimeframe, number> = {
  "1hour": 60 * 60 * 1000,
  "4hours": 4 * 60 * 60 * 1000,
  "1day": 24 * 60 * 60 * 1000,
  "3days": 3 * 24 * 60 * 60 * 1000,
  "1week": 7 * 24 * 60 * 60 * 1000,
  "2weeks": 14 * 24 * 60 * 60 * 1000,
  "1month": 30 * 24 * 60 * 60 * 1000,
  "3months": 90 * 24 * 60 * 60 * 1000,
};

// ═══════════════════════════════════════════════════════════════════════════════
// GAP RATE & CURRENCY CONVERSION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get current GAP (Global Appreciation Pool) rate.
 * This determines how Joules convert to credit-equivalent.
 * 
 * GAP rate reflects platform growth and locked value appreciation.
 * Early backers get higher multipliers (5x premint → 1x established).
 */
export async function getCurrentGapRate(): Promise<number> {
  // In production, this would query the current platform stage
  // For now, use the "minted" stage multiplier
  const { data } = await supabase
    .from("dna_lock")
    .select("parameter_value")
    .eq("parameter_key", "current_joule_stage")
    .single();

  const stage = (data?.parameter_value as JoulesBacking) || "minted";
  return JOULE_MULTIPLIERS[stage];
}

/**
 * Convert a mixed currency ante to credit-equivalent.
 * 
 * Conversion rules:
 * - Credits: 1:1 (1 Credit = 1 credit-equivalent)
 * - Marks: 1:1 (1 Mark = 1 credit-equivalent for ante purposes)
 * - Joules: GAP rate (e.g., 1 Joule at 2x GAP = 2 credit-equivalent)
 */
export async function convertAnteToCredits(ante: CurrencyAnte): Promise<AnteEquivalent> {
  const gapRate = await getCurrentGapRate();
  
  const creditEquivalent = 
    ante.credits + 
    ante.marks + 
    (ante.joules * gapRate);

  return {
    original: { ...ante },
    creditEquivalent: Math.round(creditEquivalent * 100) / 100,
    gapRateUsed: gapRate,
    convertedAt: new Date(),
  };
}

/**
 * Convert credit-equivalent back to mixed currency for payout.
 * 
 * Payout preference order:
 * 1. Credits (most liquid)
 * 2. Marks (if pot contained Marks)
 * 3. Joules (if pot contained Joules, at locked rate)
 */
export function calculatePayoutMix(
  creditEquivalent: number,
  potComposition: { totalCredits: number; totalMarks: number; totalJoules: number },
  gapRate: number
): CurrencyAnte {
  const totalPot = potComposition.totalCredits + potComposition.totalMarks + (potComposition.totalJoules * gapRate);
  
  if (totalPot === 0) {
    return { credits: creditEquivalent, marks: 0, joules: 0 };
  }

  // Proportional payout based on pot composition
  const creditRatio = potComposition.totalCredits / totalPot;
  const markRatio = potComposition.totalMarks / totalPot;
  const jouleRatio = (potComposition.totalJoules * gapRate) / totalPot;

  return {
    credits: Math.round(creditEquivalent * creditRatio * 100) / 100,
    marks: Math.round(creditEquivalent * markRatio * 100) / 100,
    joules: Math.round((creditEquivalent * jouleRatio / gapRate) * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// POT CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the full pot breakdown for a Design Battle.
 * 
 * Example from Founder:
 * Joe: 10 Joules @ 2x GAP = 20 credit-equiv
 * Me: 1 Mark = 1 credit-equiv
 * Community votes: 10 credits
 * ---
 * Total pot: 31 credit-equiv
 * Platform cut (16.7%): 5.18
 * Net pot: 25.82
 * Winner (50%): 12.91 credits
 */
export async function calculatePot(
  participants: { id: string; ante: AnteEquivalent }[],
  communityVotes: number = 0
): Promise<PotCalculation> {
  // Sum all antes
  const totalAnte = participants.reduce(
    (sum, p) => sum + p.ante.creditEquivalent, 
    0
  );

  // Gross pot = antes + community votes
  const grossPot = totalAnte + communityVotes;

  // Platform takes 16.7%
  const platformCut = Math.round(grossPot * PLATFORM_MARGIN_PERCENT * 100) / 100;

  // Net pot after platform cut
  const netPot = Math.round((grossPot - platformCut) * 100) / 100;

  // Winner takes 50% of net pot
  const winnerShare = Math.round(netPot * WINNER_SHARE_PERCENT * 100) / 100;

  // Remaining 50% split among other participants
  const runnerUpPool = netPot - winnerShare;
  const runnerUpCount = Math.max(participants.length - 1, 1);
  const runnerUpShare = Math.round((runnerUpPool / runnerUpCount) * 100) / 100;

  // Calculate individual breakdowns
  const breakdown = participants.map((p, index) => ({
    participantId: p.id,
    anteContribution: p.ante.creditEquivalent,
    projectedPayout: index === 0 ? winnerShare : runnerUpShare, // First is winner placeholder
  }));

  return {
    totalAnte,
    communityVotes,
    grossPot,
    platformCut,
    netPot,
    winnerShare,
    runnerUpShare,
    breakdown,
  };
}

/**
 * Calculate what a specific participant would win if they won.
 */
export async function calculateWinnerPayout(
  battleId: string,
  participantId: string
): Promise<{ payout: number; payoutMix: CurrencyAnte }> {
  // Get battle and participants
  const { data: battle } = await supabase
    .from("design_battles")
    .select("*")
    .eq("id", battleId)
    .single();

  const { data: participants } = await supabase
    .from("design_battle_participants")
    .select("*")
    .eq("battle_id", battleId);

  if (!battle || !participants) {
    return { payout: 0, payoutMix: { credits: 0, marks: 0, joules: 0 } };
  }

  // Calculate pot
  const participantAntes = participants.map(p => ({
    id: p.id,
    ante: {
      original: p.ante_original as CurrencyAnte,
      creditEquivalent: p.ante_credit_equivalent,
      gapRateUsed: p.gap_rate_used,
      convertedAt: new Date(p.converted_at),
    },
  }));

  const potCalc = await calculatePot(participantAntes, battle.community_votes || 0);

  // Get pot composition for payout mix
  const potComposition = participants.reduce(
    (acc, p) => {
      const ante = p.ante_original as CurrencyAnte;
      return {
        totalCredits: acc.totalCredits + (ante.credits || 0),
        totalMarks: acc.totalMarks + (ante.marks || 0),
        totalJoules: acc.totalJoules + (ante.joules || 0),
      };
    },
    { totalCredits: 0, totalMarks: 0, totalJoules: 0 }
  );

  const gapRate = await getCurrentGapRate();
  const payoutMix = calculatePayoutMix(potCalc.winnerShare, potComposition, gapRate);

  return {
    payout: potCalc.winnerShare,
    payoutMix,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATTLE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a Design Battle when 2+ people sign up for the same bounty.
 */
export async function createDesignBattle(
  bountyId: string,
  bountyTitle: string,
  skillTier: SkillTier,
  timeframe: BattleTimeframe
): Promise<DesignBattle | null> {
  const now = new Date();
  const endsAt = new Date(now.getTime() + TIMEFRAME_MS[timeframe]);
  const minAnte = MIN_ANTE_BY_TIER[skillTier];

  const { data, error } = await supabase
    .from("design_battles")
    .insert({
      bounty_id: bountyId,
      bounty_title: bountyTitle,
      status: "pending",
      skill_tier: skillTier,
      timeframe,
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      min_ante_credits: minAnte.credits,
      min_ante_marks: minAnte.marks,
      min_ante_joules: minAnte.joules,
      total_pot: 0,
      platform_cut: 0,
      net_pot: 0,
      winner_payout: 0,
      participant_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating design battle:", error);
    return null;
  }

  return mapBattleFromDb(data);
}

/**
 * Join a Design Battle with an ante.
 */
export async function joinDesignBattle(
  battleId: string,
  userId: string,
  ante: CurrencyAnte
): Promise<BattleParticipant | null> {
  // Convert ante to credit-equivalent
  const anteEquiv = await convertAnteToCredits(ante);

  // Get user display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  const { data, error } = await supabase
    .from("design_battle_participants")
    .insert({
      battle_id: battleId,
      user_id: userId,
      display_name: profile?.display_name || "Unknown",
      ante_original: ante,
      ante_credit_equivalent: anteEquiv.creditEquivalent,
      gap_rate_used: anteEquiv.gapRateUsed,
      converted_at: anteEquiv.convertedAt.toISOString(),
      vote_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining design battle:", error);
    return null;
  }

  // Update battle totals
  await updateBattleTotals(battleId);

  return mapParticipantFromDb(data);
}

/**
 * Submit work for a Design Battle.
 */
export async function submitBattleEntry(
  battleId: string,
  participantId: string,
  submissionUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from("design_battle_participants")
    .update({
      submission_url: submissionUrl,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", participantId)
    .eq("battle_id", battleId);

  return !error;
}

/**
 * Vote for a submission.
 */
export async function voteForSubmission(
  battleId: string,
  participantId: string,
  voterId: string,
  voteCredits: number = 1
): Promise<boolean> {
  // Record the vote
  const { error: voteError } = await supabase
    .from("design_battle_votes")
    .insert({
      battle_id: battleId,
      participant_id: participantId,
      voter_id: voterId,
      vote_credits: voteCredits,
    });

  if (voteError) {
    console.error("Error recording vote:", voteError);
    return false;
  }

  // Update participant vote count
  const { error: updateError } = await supabase.rpc("increment_battle_votes", {
    p_participant_id: participantId,
    p_vote_count: 1,
  });

  if (updateError) {
    // Fallback: manual increment
    const { data: participant } = await supabase
      .from("design_battle_participants")
      .select("vote_count")
      .eq("id", participantId)
      .single();

    await supabase
      .from("design_battle_participants")
      .update({ vote_count: (participant?.vote_count || 0) + 1 })
      .eq("id", participantId);
  }

  // Update battle community votes total
  await updateBattleTotals(battleId);

  return true;
}

/**
 * Complete a Design Battle and distribute payouts.
 */
export async function completeBattle(battleId: string): Promise<{
  winner: BattleParticipant;
  crowFeatherAwarded: boolean;
} | null> {
  // Get battle and participants
  const { data: battle } = await supabase
    .from("design_battles")
    .select("*")
    .eq("id", battleId)
    .single();

  const { data: participants } = await supabase
    .from("design_battle_participants")
    .select("*")
    .eq("battle_id", battleId)
    .order("vote_count", { ascending: false });

  if (!battle || !participants || participants.length === 0) {
    return null;
  }

  // Winner is participant with most votes
  const winner = participants[0];
  
  // Calculate final pot
  const participantAntes = participants.map(p => ({
    id: p.id,
    ante: {
      original: p.ante_original as CurrencyAnte,
      creditEquivalent: p.ante_credit_equivalent,
      gapRateUsed: p.gap_rate_used,
      convertedAt: new Date(p.converted_at),
    },
  }));

  const potCalc = await calculatePot(participantAntes, battle.community_votes || 0);

  // Update winner
  await supabase
    .from("design_battle_participants")
    .update({
      rank: 1,
      payout: potCalc.winnerShare,
      crow_feather_earned: true,
    })
    .eq("id", winner.id);

  // Update runner-ups
  for (let i = 1; i < participants.length; i++) {
    await supabase
      .from("design_battle_participants")
      .update({
        rank: i + 1,
        payout: potCalc.runnerUpShare,
        crow_feather_earned: false,
      })
      .eq("id", participants[i].id);
  }

  // Update battle status
  await supabase
    .from("design_battles")
    .update({
      status: "completed",
      winner_id: winner.user_id,
      total_pot: potCalc.grossPot,
      platform_cut: potCalc.platformCut,
      net_pot: potCalc.netPot,
      winner_payout: potCalc.winnerShare,
    })
    .eq("id", battleId);

  // Award Crow Feather to winner
  const { data: crowFeather } = await supabase
    .from("crow_feathers")
    .insert({
      user_id: winner.user_id,
      category: "design_battle",
      record_value: potCalc.winnerShare,
      metadata: { battleId, bountyId: battle.bounty_id },
    })
    .select()
    .single();

  return {
    winner: mapParticipantFromDb({ ...winner, rank: 1, payout: potCalc.winnerShare, crow_feather_earned: true }),
    crowFeatherAwarded: !!crowFeather,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function updateBattleTotals(battleId: string): Promise<void> {
  const { data: participants } = await supabase
    .from("design_battle_participants")
    .select("ante_credit_equivalent, vote_count")
    .eq("battle_id", battleId);

  if (!participants) return;

  const totalAnte = participants.reduce((sum, p) => sum + p.ante_credit_equivalent, 0);
  const communityVotes = participants.reduce((sum, p) => sum + p.vote_count, 0);
  const grossPot = totalAnte + communityVotes;
  const platformCut = Math.round(grossPot * PLATFORM_MARGIN_PERCENT * 100) / 100;
  const netPot = grossPot - platformCut;
  const winnerPayout = Math.round(netPot * WINNER_SHARE_PERCENT * 100) / 100;

  await supabase
    .from("design_battles")
    .update({
      participant_count: participants.length,
      total_pot: grossPot,
      platform_cut: platformCut,
      net_pot: netPot,
      winner_payout: winnerPayout,
      community_votes: communityVotes,
      status: participants.length >= 2 ? "active" : "pending",
    })
    .eq("id", battleId);
}

function mapBattleFromDb(data: any): DesignBattle {
  return {
    id: data.id,
    bountyId: data.bounty_id,
    bountyTitle: data.bounty_title,
    status: data.status,
    skillTier: data.skill_tier,
    timeframe: data.timeframe,
    startsAt: new Date(data.starts_at),
    endsAt: new Date(data.ends_at),
    minAnte: {
      credits: data.min_ante_credits,
      marks: data.min_ante_marks,
      joules: data.min_ante_joules,
    },
    totalPot: data.total_pot,
    platformCut: data.platform_cut,
    netPot: data.net_pot,
    winnerPayout: data.winner_payout,
    participantCount: data.participant_count,
    winnerId: data.winner_id,
    createdAt: new Date(data.created_at),
  };
}

function mapParticipantFromDb(data: any): BattleParticipant {
  return {
    id: data.id,
    battleId: data.battle_id,
    userId: data.user_id,
    displayName: data.display_name,
    ante: {
      original: data.ante_original,
      creditEquivalent: data.ante_credit_equivalent,
      gapRateUsed: data.gap_rate_used,
      convertedAt: new Date(data.converted_at),
    },
    submissionUrl: data.submission_url,
    submittedAt: data.submitted_at ? new Date(data.submitted_at) : undefined,
    voteCount: data.vote_count,
    rank: data.rank,
    payout: data.payout,
    crowFeatherEarned: data.crow_feather_earned,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get active Design Battles.
 */
export async function getActiveBattles(): Promise<DesignBattle[]> {
  const { data } = await supabase
    .from("design_battles")
    .select("*")
    .in("status", ["pending", "active", "voting"])
    .order("ends_at", { ascending: true });

  return (data || []).map(mapBattleFromDb);
}

/**
 * Get a specific Design Battle with participants.
 */
export async function getBattleWithParticipants(battleId: string): Promise<{
  battle: DesignBattle;
  participants: BattleParticipant[];
} | null> {
  const { data: battle } = await supabase
    .from("design_battles")
    .select("*")
    .eq("id", battleId)
    .single();

  const { data: participants } = await supabase
    .from("design_battle_participants")
    .select("*")
    .eq("battle_id", battleId)
    .order("vote_count", { ascending: false });

  if (!battle) return null;

  return {
    battle: mapBattleFromDb(battle),
    participants: (participants || []).map(mapParticipantFromDb),
  };
}

/**
 * Get user's battle history.
 */
export async function getUserBattleHistory(userId: string): Promise<{
  participated: number;
  won: number;
  totalEarnings: number;
  crowFeathers: number;
}> {
  const { data } = await supabase
    .from("design_battle_participants")
    .select("rank, payout, crow_feather_earned")
    .eq("user_id", userId);

  if (!data) {
    return { participated: 0, won: 0, totalEarnings: 0, crowFeathers: 0 };
  }

  return {
    participated: data.length,
    won: data.filter(p => p.rank === 1).length,
    totalEarnings: data.reduce((sum, p) => sum + (p.payout || 0), 0),
    crowFeathers: data.filter(p => p.crow_feather_earned).length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  // GAP & Conversion
  getCurrentGapRate,
  convertAnteToCredits,
  calculatePayoutMix,
  
  // Pot Calculation
  calculatePot,
  calculateWinnerPayout,
  
  // Battle Management
  createDesignBattle,
  joinDesignBattle,
  submitBattleEntry,
  voteForSubmission,
  completeBattle,
  
  // Queries
  getActiveBattles,
  getBattleWithParticipants,
  getUserBattleHistory,
  
  // Constants
  MIN_ANTE_BY_TIER,
  TIMEFRAME_MS,
};
