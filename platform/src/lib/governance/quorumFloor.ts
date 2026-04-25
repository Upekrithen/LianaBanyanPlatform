/**
 * GOVERNANCE QUORUM FLOOR — Phase C countermeasure (K501)
 * =========================================================
 * Closes attack vector A.1 (Quorum Exhaustion) from Pawn red-team B119.
 *
 * A proposal cannot pass during a low-visibility attention window if its
 * Rep-weighted votes fall below a rolling 90-day floor.
 *
 * Floor formula: floor = mean(rep_weighted_votes_per_proposal_last_90_days) × 0.70
 *
 * "Low-visibility window" = the 7-day window preceding proposal close had
 *   rep-weighted participation in any other proposal > 1.5× the rolling mean
 *   (attention was elsewhere; the proposal was quiet by comparison).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuorumBaseline {
  id: string;
  computed_at: string;
  trailing_90d_mean_rep_votes: number;
  floor_threshold: number;
  baseline_provisional: boolean;
  days_of_data_used: number;
  proposal_count_used: number;
}

export interface ProposalQuorumCheck {
  proposal_id: string;
  baseline_id: string;
  rep_weighted_votes_cast: number;
  floor_at_time: number;
  is_low_visibility_window: boolean;
  passed_quorum_floor: boolean;
  checked_at: string;
}

export interface ProposalVoteRecord {
  proposal_id: string;
  closed_at: string;
  rep_weighted_votes: number;
}

export interface GovernanceQuorumDB {
  getLatestBaseline(): Promise<QuorumBaseline | null>;
  saveBaseline(baseline: Omit<QuorumBaseline, "id">): Promise<QuorumBaseline>;
  getProposalVoteHistory(trailingDays: number, now?: Date): Promise<ProposalVoteRecord[]>;
  saveQuorumCheck(check: Omit<ProposalQuorumCheck, "checked_at">): Promise<ProposalQuorumCheck>;
  getParallelProposalPeak(
    windowStartDate: Date,
    windowEndDate: Date,
    excludeProposalId: string,
  ): Promise<number>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const QUORUM_FLOOR_MULTIPLIER = 0.70;
export const LOW_VISIBILITY_WINDOW_DAYS = 7;
export const LOW_VISIBILITY_ATTENTION_RATIO = 1.5;
export const TRAILING_WINDOW_DAYS = 90;

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Compute the rolling 90-day quorum baseline from vote history.
 * If < 90 days of data, mark as provisional.
 */
export function computeBaseline(
  proposals: ProposalVoteRecord[],
  now = new Date(),
): Omit<QuorumBaseline, "id"> {
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - TRAILING_WINDOW_DAYS);

  const inWindow = proposals.filter((p) => new Date(p.closed_at) >= windowStart);
  const count = inWindow.length;

  if (count === 0) {
    return {
      computed_at: now.toISOString(),
      trailing_90d_mean_rep_votes: 0,
      floor_threshold: 0,
      baseline_provisional: true,
      days_of_data_used: 0,
      proposal_count_used: 0,
    };
  }

  const mean = inWindow.reduce((sum, p) => sum + p.rep_weighted_votes, 0) / count;
  const floor = mean * QUORUM_FLOOR_MULTIPLIER;

  // Estimate days of data from earliest record in window
  const earliest = inWindow.reduce(
    (min, p) => (new Date(p.closed_at) < new Date(min) ? p.closed_at : min),
    inWindow[0].closed_at,
  );
  const daysOfData = Math.round(
    (now.getTime() - new Date(earliest).getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    computed_at: now.toISOString(),
    trailing_90d_mean_rep_votes: mean,
    floor_threshold: floor,
    baseline_provisional: daysOfData < TRAILING_WINDOW_DAYS,
    days_of_data_used: Math.min(daysOfData, TRAILING_WINDOW_DAYS),
    proposal_count_used: count,
  };
}

/**
 * Determine if a proposal closed during a "low-visibility" attention window.
 *
 * Low-visibility = any other proposal in the preceding 7 days attracted
 *   more than 1.5× the rolling mean in Rep-weighted votes (crowding out attention).
 */
export async function isLowVisibilityWindow(
  db: GovernanceQuorumDB,
  proposalId: string,
  proposalClosedAt: Date,
  baseline: QuorumBaseline,
): Promise<boolean> {
  if (baseline.trailing_90d_mean_rep_votes === 0) return false;

  const windowStart = new Date(proposalClosedAt);
  windowStart.setDate(windowStart.getDate() - LOW_VISIBILITY_WINDOW_DAYS);

  const peakParallelVotes = await db.getParallelProposalPeak(
    windowStart,
    proposalClosedAt,
    proposalId,
  );

  return peakParallelVotes > baseline.trailing_90d_mean_rep_votes * LOW_VISIBILITY_ATTENTION_RATIO;
}

/**
 * Return the effective rolling quorum floor from the latest baseline.
 * Used by governance subsystem to gate proposal passage.
 */
export async function getRollingQuorumFloor(
  db: GovernanceQuorumDB,
): Promise<{ floor: number; provisional: boolean }> {
  const baseline = await db.getLatestBaseline();
  if (!baseline) return { floor: 0, provisional: true };
  return { floor: baseline.floor_threshold, provisional: baseline.baseline_provisional };
}

/**
 * Evaluate whether a proposal passes the quorum floor.
 *
 * A proposal FAILS the floor only when:
 *   - rep_weighted_votes < floor  AND
 *   - the proposal closed during a low-visibility window
 *
 * High-turnout quiet proposals still pass.
 */
export async function checkProposalQuorum(
  db: GovernanceQuorumDB,
  proposalId: string,
  repWeightedVotesCast: number,
  proposalClosedAt: Date,
  now = new Date(),
): Promise<ProposalQuorumCheck> {
  const baseline = await db.getLatestBaseline();
  const floorAtTime = baseline?.floor_threshold ?? 0;
  const baselineId = baseline?.id ?? "no-baseline";

  const lowVisibility = baseline
    ? await isLowVisibilityWindow(db, proposalId, proposalClosedAt, baseline)
    : false;

  const passedQuorumFloor =
    repWeightedVotesCast >= floorAtTime || !lowVisibility;

  const check: Omit<ProposalQuorumCheck, "checked_at"> = {
    proposal_id: proposalId,
    baseline_id: baselineId,
    rep_weighted_votes_cast: repWeightedVotesCast,
    floor_at_time: floorAtTime,
    is_low_visibility_window: lowVisibility,
    passed_quorum_floor: passedQuorumFloor,
  };

  return db.saveQuorumCheck(check);
}
