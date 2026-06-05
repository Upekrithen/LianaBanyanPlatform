/**
 * Cap Enforcement Logic -- W12 / Phase beta
 * ==========================================
 * Pure TypeScript implementation of the 5% participation cap.
 * Mirrors the Postgres cast_vote_with_cap_check RPC (same invariants).
 *
 * This module is testable without a DB connection and is used by:
 *   - Unit tests (see tests/capEnforcement.test.ts)
 *   - Client-side pre-flight check before calling the RPC
 *
 * The canonical enforcement is server-side (Postgres function).
 * This TS copy is for UI feedback and test coverage.
 */

/** Hard cap: no single member may hold > 5% of total votes on any item. */
export const CAP_PCT = 0.05;

/** Cap only enforced once this many total votes exist (prevents false positives on first ~19 votes). */
export const CAP_MIN_TOTAL = 20;

export interface CapCheckResult {
  /** true if vote WOULD be allowed (cap not exceeded) */
  allowed: boolean;
  /** Percentage this member would hold after the new vote (0-1). */
  memberShareAfter: number;
  /** Total votes after the new vote. */
  totalAfter: number;
  /** Reason if rejected. */
  reason?: string;
}

/**
 * Check whether casting one additional vote would violate the 5% cap.
 *
 * @param memberCurrentVotes  How many votes this member has already cast on this item
 * @param totalCurrentVotes   Total votes from all members on this item
 * @returns CapCheckResult
 */
export function checkVoteCap(
  memberCurrentVotes: number,
  totalCurrentVotes: number
): CapCheckResult {
  const totalAfter = totalCurrentVotes + 1;
  const memberAfter = memberCurrentVotes + 1;
  const memberShareAfter = memberAfter / totalAfter;

  if (totalCurrentVotes < CAP_MIN_TOTAL) {
    return {
      allowed: true,
      memberShareAfter,
      totalAfter,
    };
  }

  if (memberShareAfter > CAP_PCT) {
    return {
      allowed: false,
      memberShareAfter,
      totalAfter,
      reason: `5% participation cap: your share would be ${(memberShareAfter * 100).toFixed(1)}% of total votes on this item.`,
    };
  }

  return {
    allowed: true,
    memberShareAfter,
    totalAfter,
  };
}

/**
 * Check whether a member has already voted on an item.
 * This is a client-side helper; the RPC also enforces this server-side.
 */
export function hasDuplicateVote(
  memberCurrentVotes: number
): boolean {
  return memberCurrentVotes > 0;
}

/**
 * Compute what percentage a member currently holds.
 * Returns 0 if totalVotes is 0 (avoids division by zero).
 */
export function memberSharePct(memberVotes: number, totalVotes: number): number {
  if (totalVotes === 0) return 0;
  return (memberVotes / totalVotes) * 100;
}

/**
 * Returns a human-readable cap status summary for display in UI.
 */
export function capStatusLabel(
  memberVotes: number,
  totalVotes: number
): string {
  if (totalVotes < CAP_MIN_TOTAL) {
    return `Early voting (${totalVotes} total votes — cap applies after ${CAP_MIN_TOTAL})`;
  }
  const pct = memberSharePct(memberVotes, totalVotes);
  if (pct >= CAP_PCT * 100) {
    return `Cap reached (${pct.toFixed(1)}% / ${CAP_PCT * 100}% max)`;
  }
  return `${pct.toFixed(1)}% of ${totalVotes} votes (cap: ${CAP_PCT * 100}%)`;
}
