/**
 * Tests: trust_match/seasoningPenalty — Phase B (K501)
 */

import { describe, it, expect } from "vitest";
import {
  getEffectiveSeasoningAge,
  applySeasoningPenalty,
  isSeasoningPenaltyActive,
  type TrustMatchSeasoningDB,
  type MemberTrustState,
  type MemberDefaultLogEntry,
  SEASONING_PENALTY_DAYS,
  GSR_TRIGGER_THRESHOLD,
  GSR_WINDOW_DAYS,
} from "../seasoningPenalty";

// ── Test doubles ──────────────────────────────────────────────────────────────

function makeState(overrides: Partial<MemberTrustState> = {}): MemberTrustState {
  return {
    id: "state-1",
    member_id: "mem-1",
    seasoning_penalty_until: null,
    trust_match_defaults_90d_count: 0,
    last_default_at: null,
    good_standing_review_triggered: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeDB(overrides: Partial<TrustMatchSeasoningDB> = {}): TrustMatchSeasoningDB {
  let state = makeState();
  let gsrCalled = false;

  return {
    getMemberTrustState: async () => state,
    upsertMemberTrustState: async (s) => {
      state = { ...state, ...s };
      return state;
    },
    appendDefaultLog: async (entry): Promise<MemberDefaultLogEntry> => ({
      ...entry,
      id: "log-1",
      created_at: new Date().toISOString(),
    }),
    getDefaultsInWindow: async () => 0,
    triggerGoodStandingReview: async () => { gsrCalled = true; },
    getMemberAccountCreatedAt: async () => new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("getEffectiveSeasoningAge", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("returns current age when no penalty is active", () => {
    expect(getEffectiveSeasoningAge(100, null, now)).toBe(100);
  });

  it("returns current age when penalty has expired", () => {
    const expired = "2026-04-01T12:00:00Z";  // in the past
    expect(getEffectiveSeasoningAge(100, expired, now)).toBe(100);
  });

  it("returns current_age - 30 when penalty is active", () => {
    const future = "2026-05-25T12:00:00Z";
    expect(getEffectiveSeasoningAge(100, future, now)).toBe(70);
  });

  it("floors at 0 — effective age never goes negative", () => {
    const future = "2026-05-25T12:00:00Z";
    expect(getEffectiveSeasoningAge(15, future, now)).toBe(0);
  });
});

describe("isSeasoningPenaltyActive", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("returns false when penalty is null", () => {
    expect(isSeasoningPenaltyActive(null, now)).toBe(false);
  });

  it("returns false when penalty has expired", () => {
    expect(isSeasoningPenaltyActive("2026-04-01T00:00:00Z", now)).toBe(false);
  });

  it("returns true when penalty is in the future", () => {
    expect(isSeasoningPenaltyActive("2026-05-25T12:00:00Z", now)).toBe(true);
  });
});

describe("applySeasoningPenalty", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("sets seasoning_penalty_until to now + 30 days", async () => {
    const db = makeDB();
    const { trustState } = await applySeasoningPenalty(db, "mem-1", "bond-1", now);

    const expectedUntil = new Date(now);
    expectedUntil.setDate(expectedUntil.getDate() + SEASONING_PENALTY_DAYS);
    expect(trustState.seasoning_penalty_until).toBe(expectedUntil.toISOString());
  });

  it("does NOT trigger GSR for 1 default (need 3 in 90 days)", async () => {
    const db = makeDB({ getDefaultsInWindow: async () => 0 });
    const { gsrTriggered } = await applySeasoningPenalty(db, "mem-1", "bond-1", now);
    expect(gsrTriggered).toBe(false);
  });

  it("does NOT trigger GSR for 2 defaults (day 1 and day 80) — under threshold", async () => {
    const db = makeDB({ getDefaultsInWindow: async () => 1 }); // 1 existing + 1 new = 2
    const { gsrTriggered } = await applySeasoningPenalty(db, "mem-1", "bond-2", now);
    expect(gsrTriggered).toBe(false);
  });

  it("triggers GSR when 3 defaults within 90-day window", async () => {
    let gsrTriggered = false;
    const db = makeDB({
      getDefaultsInWindow: async () => 2,  // 2 existing + 1 new = 3
      triggerGoodStandingReview: async () => { gsrTriggered = true; },
    });
    const result = await applySeasoningPenalty(db, "mem-1", "bond-3", now);
    expect(result.gsrTriggered).toBe(true);
    expect(gsrTriggered).toBe(true);
  });

  it("penalty active: effective age = current_age - 30 for 30 days, then full age restored", () => {
    const penaltyStart = new Date("2026-04-25T12:00:00Z");
    const penaltyEnd = new Date(penaltyStart);
    penaltyEnd.setDate(penaltyEnd.getDate() + SEASONING_PENALTY_DAYS);
    const penaltyUntilStr = penaltyEnd.toISOString();

    // During penalty: age is reduced
    const duringPenalty = new Date("2026-05-10T12:00:00Z");
    expect(getEffectiveSeasoningAge(100, penaltyUntilStr, duringPenalty)).toBe(70);

    // After penalty: full age restored
    const afterPenalty = new Date("2026-06-01T12:00:00Z");
    expect(getEffectiveSeasoningAge(100, penaltyUntilStr, afterPenalty)).toBe(100);
  });
});
