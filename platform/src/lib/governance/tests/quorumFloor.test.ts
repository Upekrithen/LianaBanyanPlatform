/**
 * Tests: governance/quorumFloor — Phase C (K501)
 */

import { describe, it, expect } from "vitest";
import {
  computeBaseline,
  checkProposalQuorum,
  getRollingQuorumFloor,
  isLowVisibilityWindow,
  type GovernanceQuorumDB,
  type QuorumBaseline,
  type ProposalVoteRecord,
  type ProposalQuorumCheck,
  QUORUM_FLOOR_MULTIPLIER,
  TRAILING_WINDOW_DAYS,
} from "../quorumFloor";

// ── Test doubles ──────────────────────────────────────────────────────────────

function makeBaseline(overrides: Partial<QuorumBaseline> = {}): QuorumBaseline {
  return {
    id: "baseline-1",
    computed_at: "2026-04-25T00:00:00Z",
    trailing_90d_mean_rep_votes: 1000,
    floor_threshold: 700,
    baseline_provisional: false,
    days_of_data_used: 90,
    proposal_count_used: 20,
    ...overrides,
  };
}

function makeDB(overrides: Partial<GovernanceQuorumDB> = {}): GovernanceQuorumDB {
  const baseline = makeBaseline();
  return {
    getLatestBaseline: async () => baseline,
    saveBaseline: async (b) => ({ ...b, id: "new-baseline" }),
    getProposalVoteHistory: async () => [],
    saveQuorumCheck: async (c): Promise<ProposalQuorumCheck> => ({
      ...c,
      checked_at: new Date().toISOString(),
    }),
    getParallelProposalPeak: async () => 0,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("computeBaseline", () => {
  it("returns provisional baseline with zero floor when no data", () => {
    const result = computeBaseline([], new Date("2026-04-25T00:00:00Z"));
    expect(result.baseline_provisional).toBe(true);
    expect(result.floor_threshold).toBe(0);
    expect(result.proposal_count_used).toBe(0);
  });

  it("computes floor = mean × 0.70", () => {
    const now = new Date("2026-04-25T00:00:00Z");
    const proposals: ProposalVoteRecord[] = [
      { proposal_id: "p1", closed_at: "2026-04-01T00:00:00Z", rep_weighted_votes: 1000 },
      { proposal_id: "p2", closed_at: "2026-04-10T00:00:00Z", rep_weighted_votes: 2000 },
    ];
    const result = computeBaseline(proposals, now);
    expect(result.trailing_90d_mean_rep_votes).toBe(1500);
    expect(result.floor_threshold).toBe(1500 * QUORUM_FLOOR_MULTIPLIER);
    expect(result.proposal_count_used).toBe(2);
  });

  it("marks provisional when less than 90 days of data", () => {
    const now = new Date("2026-04-25T00:00:00Z");
    const proposals: ProposalVoteRecord[] = [
      { proposal_id: "p1", closed_at: "2026-04-01T00:00:00Z", rep_weighted_votes: 500 },
    ];
    const result = computeBaseline(proposals, now);
    expect(result.baseline_provisional).toBe(true);
  });

  it("marks NOT provisional when 90 days of data is available", () => {
    const now = new Date("2026-04-25T00:00:00Z");
    // Earliest proposal is 90 days ago
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const proposals: ProposalVoteRecord[] = [
      { proposal_id: "p1", closed_at: ninetyDaysAgo.toISOString(), rep_weighted_votes: 1000 },
      { proposal_id: "p2", closed_at: "2026-04-15T00:00:00Z", rep_weighted_votes: 1000 },
    ];
    const result = computeBaseline(proposals, now);
    expect(result.baseline_provisional).toBe(false);
  });
});

describe("isLowVisibilityWindow", () => {
  const proposalClosedAt = new Date("2026-04-25T12:00:00Z");

  it("returns false when mean is zero (no data)", async () => {
    const db = makeDB({
      getLatestBaseline: async () => makeBaseline({ trailing_90d_mean_rep_votes: 0, floor_threshold: 0 }),
    });
    const baseline = makeBaseline({ trailing_90d_mean_rep_votes: 0, floor_threshold: 0 });
    const result = await isLowVisibilityWindow(db, "prop-1", proposalClosedAt, baseline);
    expect(result).toBe(false);
  });

  it("returns false when parallel proposals have normal participation", async () => {
    const baseline = makeBaseline({ trailing_90d_mean_rep_votes: 1000 });
    const db = makeDB({
      getParallelProposalPeak: async () => 1200,  // 1.2× mean (< 1.5×)
    });
    const result = await isLowVisibilityWindow(db, "prop-1", proposalClosedAt, baseline);
    expect(result).toBe(false);
  });

  it("returns true when parallel proposal drew > 1.5× the mean (attention was elsewhere)", async () => {
    const baseline = makeBaseline({ trailing_90d_mean_rep_votes: 1000 });
    const db = makeDB({
      getParallelProposalPeak: async () => 1600,  // 1.6× mean (> 1.5×)
    });
    const result = await isLowVisibilityWindow(db, "prop-1", proposalClosedAt, baseline);
    expect(result).toBe(true);
  });
});

describe("checkProposalQuorum", () => {
  const now = new Date("2026-04-25T12:00:00Z");
  const closedAt = new Date("2026-04-25T10:00:00Z");

  it("passes when votes meet floor, regardless of visibility window", async () => {
    const db = makeDB({
      getLatestBaseline: async () => makeBaseline({ floor_threshold: 700 }),
      getParallelProposalPeak: async () => 2000,  // low-visibility
    });
    // 800 votes > 700 floor → PASS regardless
    const check = await checkProposalQuorum(db, "prop-1", 800, closedAt, now);
    expect(check.passed_quorum_floor).toBe(true);
  });

  it("fails: low-turnout proposal during quiet attention window", async () => {
    const db = makeDB({
      getLatestBaseline: async () => makeBaseline({
        trailing_90d_mean_rep_votes: 1000,
        floor_threshold: 700,
      }),
      getParallelProposalPeak: async () => 1600,  // > 1.5× mean = low-visibility
    });
    const check = await checkProposalQuorum(db, "prop-1", 500, closedAt, now);  // 500 < 700
    expect(check.passed_quorum_floor).toBe(false);
    expect(check.is_low_visibility_window).toBe(true);
  });

  it("passes: same low-turnout proposal at normal-attention time", async () => {
    const db = makeDB({
      getLatestBaseline: async () => makeBaseline({
        trailing_90d_mean_rep_votes: 1000,
        floor_threshold: 700,
      }),
      getParallelProposalPeak: async () => 900,  // 0.9× mean — normal attention
    });
    const check = await checkProposalQuorum(db, "prop-1", 500, closedAt, now);  // 500 < 700 but NOT quiet window
    expect(check.passed_quorum_floor).toBe(true);
    expect(check.is_low_visibility_window).toBe(false);
  });

  it("high-Rep coalition cannot game quiet window — absent peer weight doesn't count", async () => {
    // Scenario: 3 high-rep members who hold 60% of rep all vote YES in a quiet window.
    // But the remaining 40% rep-weight was absent. Cast votes = 600, floor = 700.
    const db = makeDB({
      getLatestBaseline: async () => makeBaseline({
        trailing_90d_mean_rep_votes: 1000,
        floor_threshold: 700,
      }),
      getParallelProposalPeak: async () => 1600,  // quiet window
    });
    const check = await checkProposalQuorum(db, "prop-ring", 600, closedAt, now);
    // 600 < 700 floor AND low-visibility → FAILS
    expect(check.passed_quorum_floor).toBe(false);
  });
});
