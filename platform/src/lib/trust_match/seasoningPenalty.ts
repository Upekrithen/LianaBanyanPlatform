/**
 * TRUST MATCH SEASONING PENALTY — Phase B countermeasure (K501)
 * ==============================================================
 * Closes attack vector D.1 (Oscillation) from Pawn red-team B119.
 *
 * When a Trust Match defaults, the defaulting member's effective Seasoning age
 * is reduced by 30 days for 30 days — they cannot exploit fresh-member trust tiers.
 * Their XP and Rep are not affected; only Seasoning age is penalized.
 *
 * Multi-default Good Standing Review trigger: 3 defaults within any 90-day window
 * triggers a Good Standing Roll review (existing GSR flow; this module adds the trigger).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MemberTrustState {
  id: string;
  member_id: string;
  seasoning_penalty_until: string | null;   // ISO timestamp or null
  trust_match_defaults_90d_count: number;
  last_default_at: string | null;
  good_standing_review_triggered: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberDefaultLogEntry {
  id: string;
  member_id: string;
  trust_match_bond_id: string;
  defaulted_at: string;
  penalty_applied_until: string | null;
  gsr_triggered: boolean;
  created_at: string;
}

/** DB interface — inject real Supabase client or mock in tests. */
export interface TrustMatchSeasoningDB {
  getMemberTrustState(memberId: string): Promise<MemberTrustState | null>;
  upsertMemberTrustState(state: Omit<MemberTrustState, "id" | "created_at">): Promise<MemberTrustState>;
  appendDefaultLog(entry: Omit<MemberDefaultLogEntry, "id" | "created_at">): Promise<MemberDefaultLogEntry>;
  getDefaultsInWindow(memberId: string, windowDays: number, now?: Date): Promise<number>;
  triggerGoodStandingReview(memberId: string): Promise<void>;
  getMemberAccountCreatedAt(memberId: string): Promise<Date>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const SEASONING_PENALTY_DAYS = 30;
export const GSR_TRIGGER_THRESHOLD = 3;
export const GSR_WINDOW_DAYS = 90;

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Returns the effective Seasoning age in days for a member.
 *
 * If the member is within a seasoning penalty window, their effective age is
 * current_age_days - SEASONING_PENALTY_DAYS.
 * The floor is 0 — effective age never goes negative.
 */
export function getEffectiveSeasoningAge(
  currentAgeDays: number,
  seasoningPenaltyUntil: string | null,
  now = new Date(),
): number {
  if (!seasoningPenaltyUntil) return currentAgeDays;

  const penaltyEnd = new Date(seasoningPenaltyUntil);
  if (now < penaltyEnd) {
    return Math.max(0, currentAgeDays - SEASONING_PENALTY_DAYS);
  }

  return currentAgeDays;
}

/**
 * Apply a Seasoning penalty to a defaulting member.
 *
 * 1. Sets seasoning_penalty_until = now + 30 days.
 * 2. Increments trust_match_defaults_90d_count (rolling window computed separately).
 * 3. If 3+ defaults in 90 days: triggers Good Standing Roll review.
 * 4. Writes immutable audit log entry.
 *
 * Returns the updated trust state and whether a GSR was triggered.
 */
export async function applySeasoningPenalty(
  db: TrustMatchSeasoningDB,
  memberId: string,
  trustMatchBondId: string,
  now = new Date(),
): Promise<{ trustState: MemberTrustState; gsrTriggered: boolean }> {
  const penaltyUntil = new Date(now);
  penaltyUntil.setDate(penaltyUntil.getDate() + SEASONING_PENALTY_DAYS);

  const defaultsInWindow = await db.getDefaultsInWindow(memberId, GSR_WINDOW_DAYS, now);
  const newCount = defaultsInWindow + 1;
  const gsrTriggered = newCount >= GSR_TRIGGER_THRESHOLD;

  const updatedState = await db.upsertMemberTrustState({
    member_id: memberId,
    seasoning_penalty_until: penaltyUntil.toISOString(),
    trust_match_defaults_90d_count: newCount,
    last_default_at: now.toISOString(),
    good_standing_review_triggered: gsrTriggered,
    updated_at: now.toISOString(),
  });

  await db.appendDefaultLog({
    member_id: memberId,
    trust_match_bond_id: trustMatchBondId,
    defaulted_at: now.toISOString(),
    penalty_applied_until: penaltyUntil.toISOString(),
    gsr_triggered: gsrTriggered,
  });

  if (gsrTriggered) {
    await db.triggerGoodStandingReview(memberId);
  }

  return { trustState: updatedState, gsrTriggered };
}

/**
 * Check whether a member's seasoning penalty is currently active.
 */
export function isSeasoningPenaltyActive(
  seasoningPenaltyUntil: string | null,
  now = new Date(),
): boolean {
  if (!seasoningPenaltyUntil) return false;
  return now < new Date(seasoningPenaltyUntil);
}
