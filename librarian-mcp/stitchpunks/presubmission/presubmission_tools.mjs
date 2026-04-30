/**
 * presubmission_tools.mjs — Cephas Pre-Submission Voting + Rewards logic (#2288)
 * KN006 / BP002 / 2026-04-29
 *
 * Composes: Glass Door Open Outreach + Six Degrees + Marks currency + IP 60/20/10/10
 * Stone Tablet: append-only reward log; no in-place edits to vote records
 * ONE LEVEL ONLY: no MLM attribution chains (feedback_attribution_one_level.md)
 * Anti-gaming: 100-Mark cap per member per pre_submission; self-vote prevention
 *
 * Toolsmith log: TS-CEPHAS-PRESUBMISSION-KN006-BP002
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const STATUS = Object.freeze({
  OPEN:     'PRE_SUBMISSION_OPEN',
  SUBMITTED: 'SUBMITTED',
  ACCEPTED:  'ACCEPTED',
  PUBLISHED: 'PUBLISHED_EXTERNAL',
  REJECTED:  'REJECTED',
});

export const REWARD_MULTIPLIER = 2;           // 2× stakes to YES voters on ACCEPTED
export const MAX_MARKS_PER_MEMBER = 100;      // anti-whale cap
export const FUNDING_SOURCE = 'global_sponsor_pool_10pct'; // IP 60/20/10/10 slice

// Valid state transitions (Founder retains submission authority)
export const VALID_TRANSITIONS = [
  [STATUS.OPEN,      STATUS.SUBMITTED],
  [STATUS.SUBMITTED, STATUS.ACCEPTED],
  [STATUS.SUBMITTED, STATUS.REJECTED],
  [STATUS.ACCEPTED,  STATUS.PUBLISHED],
  [STATUS.REJECTED,  STATUS.OPEN],   // re-target: allowed
];

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Validate a cast-vote operation against business rules.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateVoteCast({
  preSubmission,
  memberId,
  targetPublication,
  marksStake,
  existingMemberStake = 0,
  memberMarksBalance = 0,
}) {
  if (!preSubmission) return { valid: false, error: 'Pre-submission not found.' };

  if (preSubmission.status !== STATUS.OPEN) {
    return { valid: false, error: `Pre-submission not open for voting (status: ${preSubmission.status}).` };
  }

  // Self-vote prevention
  if (preSubmission.createdBy === memberId) {
    return { valid: false, error: 'Self-vote prohibited: creator cannot vote on their own pre-submission.' };
  }

  // Target must be in the candidate list
  const targets = (preSubmission.targetPublications || []).map(t =>
    typeof t === 'string' ? t : t.name
  );
  if (!targets.includes(targetPublication)) {
    return { valid: false, error: `Target '${targetPublication}' not in candidate list.` };
  }

  // Per-member cap: total stake across ALL targets for this pre_submission
  if (existingMemberStake + marksStake > MAX_MARKS_PER_MEMBER) {
    return {
      valid: false,
      error: `Per-member cap exceeded: ${existingMemberStake} already staked; adding ${marksStake} would exceed ${MAX_MARKS_PER_MEMBER}-Mark cap.`,
    };
  }

  // Marks range: 1..100 per call
  if (marksStake < 1 || marksStake > MAX_MARKS_PER_MEMBER) {
    return { valid: false, error: `Marks stake must be 1–${MAX_MARKS_PER_MEMBER}.` };
  }

  // Balance check
  if (memberMarksBalance < marksStake) {
    return { valid: false, error: `Insufficient Marks: balance=${memberMarksBalance}, required=${marksStake}.` };
  }

  return { valid: true };
}

/**
 * Validate a state transition.
 */
export function validateTransition(currentStatus, targetStatus) {
  const allowed = VALID_TRANSITIONS.some(
    ([from, to]) => from === currentStatus && to === targetStatus
  );
  if (!allowed) {
    return { valid: false, error: `Invalid transition: ${currentStatus} → ${targetStatus}` };
  }
  return { valid: true };
}

// ── Vote tally ────────────────────────────────────────────────────────────────

/**
 * Compute vote tallies from an array of vote records.
 * Returns { [targetPublication]: { totalMarks, voteCount, sixDegreesCount } }
 */
export function computeVoteTallies(votes) {
  const tallies = {};
  for (const vote of votes) {
    const target = vote.targetPublication;
    if (!tallies[target]) {
      tallies[target] = { totalMarks: 0, voteCount: 0, sixDegreesCount: 0 };
    }
    tallies[target].totalMarks += vote.marksStaked;
    tallies[target].voteCount += 1;
    if (vote.sixDegreesFlag) tallies[target].sixDegreesCount += 1;
  }
  return tallies;
}

/**
 * Determine top-voted target from tallies.
 */
export function topVotedTarget(tallies) {
  let top = null;
  let topMarks = -1;
  for (const [target, t] of Object.entries(tallies)) {
    if (t.totalMarks > topMarks) {
      topMarks = t.totalMarks;
      top = target;
    }
  }
  return top;
}

// ── Six-Degrees activation ────────────────────────────────────────────────────

/**
 * Build Six-Degrees fan-out list for a submitted pre_submission.
 * Returns members who flagged six_degrees_flag=true for the submitted target.
 * Called at SUBMITTED transition time (separate from vote).
 */
export function buildSixDegreesFanOut(votes, submittedTo) {
  return votes.filter(v => v.targetPublication === submittedTo && v.sixDegreesFlag === true)
    .map(v => ({
      memberId: v.memberId,
      targetPublication: v.targetPublication,
      networkNote: v.sixDegreesNetworkNote || null,
    }));
}

// ── Reward distribution (in-memory simulation) ───────────────────────────────

/**
 * Compute reward distribution for an ACCEPTED pre_submission.
 * Returns array of { memberId, marksStaked, marksRewarded, fundingSource }.
 * In production this is executed by distribute_acceptance_rewards() SQL function.
 * This JS version is used for testing and pre-computation auditing.
 */
export function computeAcceptanceRewards(escrowRecords, acceptedTarget) {
  const rewarded = [];
  const consumed = [];

  for (const record of escrowRecords) {
    if (record.status !== 'held') continue;

    if (record.targetPublication === acceptedTarget) {
      rewarded.push({
        memberId: record.memberId,
        targetPublication: record.targetPublication,
        marksStaked: record.marksStaked,
        marksRewarded: record.marksStaked * REWARD_MULTIPLIER,
        rewardMultiplier: REWARD_MULTIPLIER,
        fundingSource: FUNDING_SOURCE,
        newEscrowStatus: 'rewarded',
      });
    } else {
      consumed.push({
        memberId: record.memberId,
        targetPublication: record.targetPublication,
        marksStaked: record.marksStaked,
        newEscrowStatus: 'consumed',
      });
    }
  }

  return {
    rewarded,
    consumed,
    totalMarksDistributed: rewarded.reduce((s, r) => s + r.marksRewarded, 0),
    votersRewarded: rewarded.length,
    fundingSource: FUNDING_SOURCE,
    multiplier: REWARD_MULTIPLIER,
  };
}

// ── ONE LEVEL ONLY enforcement ────────────────────────────────────────────────

/**
 * Verify attribution chain doesn't exceed 1 level.
 * Per feedback_attribution_one_level.md: only direct voters are rewarded.
 * referrer_of_referrer chains are prohibited.
 */
export function verifyOneLevelOnly(rewardItems) {
  // In the pre_submission system, all rewards go to direct voters only.
  // There is no referrer-of-referrer chain. This function verifies that
  // no rewardItem has a 'referredBy' or 'chain' field indicating MLM depth.
  const violations = rewardItems.filter(item =>
    item.referredBy !== undefined || item.chain !== undefined
  );
  return {
    compliant: violations.length === 0,
    violations,
  };
}
