/**
 * tests_kn006.mjs — Cephas Pre-Submission Voting + Rewards Tests
 * KN006 / BP002 / 2026-04-29 — 15 tests covering vote flow, escrow,
 * acceptance distribution, anti-gaming, ONE LEVEL ONLY, status transitions,
 * Six-Degrees activation, funding flow, per-member cap, self-vote prevention.
 *
 * Usage: node --test librarian-mcp/stitchpunks/presubmission/tests_kn006.mjs
 *        (from workspace root)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  STATUS,
  REWARD_MULTIPLIER,
  MAX_MARKS_PER_MEMBER,
  FUNDING_SOURCE,
  validateVoteCast,
  validateTransition,
  computeVoteTallies,
  topVotedTarget,
  buildSixDegreesFanOut,
  computeAcceptanceRewards,
  verifyOneLevelOnly,
} from './presubmission_tools.mjs';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FOUNDER_ID = 'founder-uuid-001';
const MEMBER_A   = 'member-uuid-AAA';
const MEMBER_B   = 'member-uuid-BBB';
const MEMBER_C   = 'member-uuid-CCC';

function makePreSubmission(overrides = {}) {
  return {
    id: 'pre-sub-001',
    status: STATUS.OPEN,
    createdBy: FOUNDER_ID,
    targetPublications: [
      { name: 'WIRED', url: 'https://wired.com' },
      { name: 'MIT Tech Review', url: 'https://technologyreview.com' },
      { name: 'The Atlantic', url: 'https://theatlantic.com' },
    ],
    ...overrides,
  };
}

function makeEscrowRecords() {
  return [
    { id: 'esc-1', memberId: MEMBER_A, targetPublication: 'WIRED', marksStaked: 50, status: 'held' },
    { id: 'esc-2', memberId: MEMBER_B, targetPublication: 'WIRED', marksStaked: 30, status: 'held' },
    { id: 'esc-3', memberId: MEMBER_C, targetPublication: 'MIT Tech Review', marksStaked: 20, status: 'held' },
  ];
}

// ── T01: Status enum values are correct ──────────────────────────────────────
test('T01: Status enum contains all required states', () => {
  assert.equal(STATUS.OPEN, 'PRE_SUBMISSION_OPEN');
  assert.equal(STATUS.SUBMITTED, 'SUBMITTED');
  assert.equal(STATUS.ACCEPTED, 'ACCEPTED');
  assert.equal(STATUS.PUBLISHED, 'PUBLISHED_EXTERNAL');
  assert.equal(STATUS.REJECTED, 'REJECTED');
});

// ── T02: Valid vote passes all checks ─────────────────────────────────────────
test('T02: Valid vote cast — returns valid=true', () => {
  const result = validateVoteCast({
    preSubmission: makePreSubmission(),
    memberId: MEMBER_A,
    targetPublication: 'WIRED',
    marksStake: 50,
    existingMemberStake: 0,
    memberMarksBalance: 200,
  });
  assert.equal(result.valid, true);
});

// ── T03: Self-vote is blocked ─────────────────────────────────────────────────
test('T03: Self-vote prevention — creator cannot vote on own work', () => {
  const result = validateVoteCast({
    preSubmission: makePreSubmission(),
    memberId: FOUNDER_ID, // same as createdBy
    targetPublication: 'WIRED',
    marksStake: 10,
    existingMemberStake: 0,
    memberMarksBalance: 100,
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /self-vote prohibited/i);
});

// ── T04: Per-member 100-Mark cap is enforced ─────────────────────────────────
test('T04: Per-member cap — exceeding 100 Marks across targets is blocked', () => {
  const result = validateVoteCast({
    preSubmission: makePreSubmission(),
    memberId: MEMBER_A,
    targetPublication: 'MIT Tech Review',
    marksStake: 60,
    existingMemberStake: 50, // already staked 50 on WIRED
    memberMarksBalance: 200,
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /cap exceeded/i);
});

// ── T05: Exactly 100 Marks total is allowed ───────────────────────────────────
test('T05: Exactly 100-Mark total stake is allowed (boundary)', () => {
  const result = validateVoteCast({
    preSubmission: makePreSubmission(),
    memberId: MEMBER_A,
    targetPublication: 'MIT Tech Review',
    marksStake: 50,
    existingMemberStake: 50, // 50 + 50 = 100 exactly
    memberMarksBalance: 200,
  });
  assert.equal(result.valid, true);
});

// ── T06: Insufficient Marks balance is blocked ───────────────────────────────
test('T06: Insufficient Marks balance blocks vote', () => {
  const result = validateVoteCast({
    preSubmission: makePreSubmission(),
    memberId: MEMBER_B,
    targetPublication: 'WIRED',
    marksStake: 30,
    existingMemberStake: 0,
    memberMarksBalance: 20, // only 20, needs 30
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /insufficient marks/i);
});

// ── T07: Non-open pre_submission blocks vote ─────────────────────────────────
test('T07: Voting on non-open pre_submission is blocked', () => {
  const result = validateVoteCast({
    preSubmission: makePreSubmission({ status: STATUS.SUBMITTED }),
    memberId: MEMBER_A,
    targetPublication: 'WIRED',
    marksStake: 10,
    existingMemberStake: 0,
    memberMarksBalance: 100,
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /not open for voting/i);
});

// ── T08: Target not in candidate list is blocked ─────────────────────────────
test('T08: Vote for non-candidate target is blocked', () => {
  const result = validateVoteCast({
    preSubmission: makePreSubmission(),
    memberId: MEMBER_A,
    targetPublication: 'Rolling Stone', // not in candidate list
    marksStake: 10,
    existingMemberStake: 0,
    memberMarksBalance: 100,
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /not in candidate list/i);
});

// ── T09: Vote tally computation is correct ───────────────────────────────────
test('T09: computeVoteTallies aggregates marks and vote counts correctly', () => {
  const votes = [
    { targetPublication: 'WIRED', marksStaked: 50, sixDegreesFlag: false, memberId: MEMBER_A },
    { targetPublication: 'WIRED', marksStaked: 30, sixDegreesFlag: true,  memberId: MEMBER_B },
    { targetPublication: 'MIT Tech Review', marksStaked: 20, sixDegreesFlag: false, memberId: MEMBER_C },
  ];
  const tallies = computeVoteTallies(votes);

  assert.equal(tallies['WIRED'].totalMarks, 80);
  assert.equal(tallies['WIRED'].voteCount, 2);
  assert.equal(tallies['WIRED'].sixDegreesCount, 1);
  assert.equal(tallies['MIT Tech Review'].totalMarks, 20);
  assert.equal(tallies['MIT Tech Review'].voteCount, 1);

  const top = topVotedTarget(tallies);
  assert.equal(top, 'WIRED');
});

// ── T10: Six-Degrees fan-out at SUBMITTED time ───────────────────────────────
test('T10: buildSixDegreesFanOut returns only flaggers for submitted target', () => {
  const votes = [
    { memberId: MEMBER_A, targetPublication: 'WIRED', sixDegreesFlag: true, sixDegreesNetworkNote: 'know the editor', marksStaked: 50 },
    { memberId: MEMBER_B, targetPublication: 'WIRED', sixDegreesFlag: false, marksStaked: 30 },
    { memberId: MEMBER_C, targetPublication: 'MIT Tech Review', sixDegreesFlag: true, marksStaked: 20 },
  ];

  const fanOut = buildSixDegreesFanOut(votes, 'WIRED');
  assert.equal(fanOut.length, 1);
  assert.equal(fanOut[0].memberId, MEMBER_A);
  assert.equal(fanOut[0].networkNote, 'know the editor');
});

// ── T11: Acceptance reward distributes 2× to YES voters for accepted target ──
test('T11: computeAcceptanceRewards — 2× marks to WIRED voters on ACCEPTED', () => {
  const escrow = makeEscrowRecords();
  const result = computeAcceptanceRewards(escrow, 'WIRED');

  assert.equal(result.rewarded.length, 2);    // MEMBER_A and MEMBER_B voted WIRED
  assert.equal(result.consumed.length, 1);    // MEMBER_C voted MIT Tech Review

  const memberA = result.rewarded.find(r => r.memberId === MEMBER_A);
  assert.equal(memberA.marksRewarded, 100);   // 50 × 2
  assert.equal(memberA.rewardMultiplier, REWARD_MULTIPLIER);
  assert.equal(memberA.fundingSource, FUNDING_SOURCE);
  assert.equal(memberA.newEscrowStatus, 'rewarded');

  assert.equal(result.totalMarksDistributed, 160); // (50+30) × 2
  assert.equal(result.votersRewarded, 2);
  assert.equal(result.fundingSource, 'global_sponsor_pool_10pct');
});

// ── T12: Rejected target consumes stakes ─────────────────────────────────────
test('T12: computeAcceptanceRewards — non-accepted targets are consumed', () => {
  const escrow = makeEscrowRecords();
  const result = computeAcceptanceRewards(escrow, 'MIT Tech Review');

  assert.equal(result.rewarded.length, 1); // only MEMBER_C voted MIT Tech Review
  assert.equal(result.consumed.length, 2); // MEMBER_A and MEMBER_B

  const consumed = result.consumed.find(r => r.memberId === MEMBER_A);
  assert.equal(consumed.newEscrowStatus, 'consumed');
  assert.equal(consumed.marksStaked, 50);
});

// ── T13: Valid state transitions pass ────────────────────────────────────────
test('T13: All valid state transitions pass validation', () => {
  const validPairs = [
    [STATUS.OPEN, STATUS.SUBMITTED],
    [STATUS.SUBMITTED, STATUS.ACCEPTED],
    [STATUS.SUBMITTED, STATUS.REJECTED],
    [STATUS.ACCEPTED, STATUS.PUBLISHED],
    [STATUS.REJECTED, STATUS.OPEN],
  ];
  for (const [from, to] of validPairs) {
    const result = validateTransition(from, to);
    assert.equal(result.valid, true, `Expected valid transition: ${from} → ${to}`);
  }
});

// ── T14: Invalid state transitions are blocked ───────────────────────────────
test('T14: Invalid state transitions are blocked', () => {
  const invalidPairs = [
    [STATUS.OPEN, STATUS.ACCEPTED],       // must go through SUBMITTED
    [STATUS.ACCEPTED, STATUS.REJECTED],   // cannot reject after accepted
    [STATUS.PUBLISHED, STATUS.OPEN],      // no rollback from published
    [STATUS.OPEN, STATUS.PUBLISHED],      // must flow through pipeline
  ];
  for (const [from, to] of invalidPairs) {
    const result = validateTransition(from, to);
    assert.equal(result.valid, false, `Expected invalid transition: ${from} → ${to}`);
  }
});

// ── T15: ONE LEVEL ONLY attribution enforcement ───────────────────────────────
test('T15: verifyOneLevelOnly — no MLM chains in reward records', () => {
  const cleanRewards = [
    { memberId: MEMBER_A, marksRewarded: 100 },
    { memberId: MEMBER_B, marksRewarded: 60 },
  ];
  const clean = verifyOneLevelOnly(cleanRewards);
  assert.equal(clean.compliant, true);
  assert.equal(clean.violations.length, 0);

  const mlmRewards = [
    { memberId: MEMBER_A, marksRewarded: 100 },
    { memberId: MEMBER_B, marksRewarded: 60, referredBy: MEMBER_A }, // MLM chain!
  ];
  const dirty = verifyOneLevelOnly(mlmRewards);
  assert.equal(dirty.compliant, false);
  assert.equal(dirty.violations.length, 1);
});

// ── T16 (bonus): REWARD_MULTIPLIER and MAX_MARKS_PER_MEMBER constants ────────
test('T16: Constants — REWARD_MULTIPLIER=2, MAX_MARKS=100, funding=global_sponsor_pool_10pct', () => {
  assert.equal(REWARD_MULTIPLIER, 2);
  assert.equal(MAX_MARKS_PER_MEMBER, 100);
  assert.equal(FUNDING_SOURCE, 'global_sponsor_pool_10pct');
});
