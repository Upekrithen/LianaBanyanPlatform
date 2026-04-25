/**
 * Tests: trust_match/cycleDetector — Phase E (K501)
 */

import { describe, it, expect } from "vitest";
import {
  detectCycles,
  runDailyCycleAudit,
  type TrustMatchBond,
  type CycleDetectorDB,
  type TrustMatchCycleAuditRow,
  MIN_CYCLE_LENGTH,
  MAX_CYCLE_LENGTH,
} from "../cycleDetector";

// ── Helpers ───────────────────────────────────────────────────────────────────

function bond(id: string, a: string, b: string, stake = 100): TrustMatchBond {
  return { id, member_a_id: a, member_b_id: b, stake_marks: stake };
}

function makeDB(overrides: Partial<CycleDetectorDB> = {}): CycleDetectorDB {
  const rows: TrustMatchCycleAuditRow[] = [];
  return {
    getAllActiveBonds: async () => [],
    getExistingCycles: async () => rows,
    insertCycle: async (c) => {
      const row = { ...c, id: `cycle-${rows.length + 1}`, created_at: new Date().toISOString() };
      rows.push(row);
      return row;
    },
    updateCycleLastSeen: async () => undefined,
    getCyclesByCuratorVerdict: async () => [],
    updateCycleVerdict: async (id, verdict, curatorMemberId, notes, now) => {
      const row = rows.find((r) => r.id === id);
      if (!row) throw new Error(`Cycle ${id} not found`);
      Object.assign(row, { curator_verdict: verdict, curator_member_id: curatorMemberId, curator_notes: notes, curator_reviewed_at: now.toISOString() });
      return row;
    },
    applyCoordinatedRingConsequences: async () => undefined,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("detectCycles — basic topology", () => {
  it("detects a 3-member ring (A→B→C→A)", () => {
    const bonds = [bond("b1", "A", "B"), bond("b2", "B", "C"), bond("b3", "C", "A")];
    const cycles = detectCycles(bonds);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].cycle_length).toBe(3);
    expect(cycles[0].member_ids).toHaveLength(3);
    expect(cycles[0].member_ids).toEqual(expect.arrayContaining(["A", "B", "C"]));
  });

  it("detects a 5-member ring", () => {
    const bonds = [
      bond("b1", "A", "B"),
      bond("b2", "B", "C"),
      bond("b3", "C", "D"),
      bond("b4", "D", "E"),
      bond("b5", "E", "A"),
    ];
    const cycles = detectCycles(bonds);
    expect(cycles.some((c) => c.cycle_length === 5)).toBe(true);
  });

  it("does NOT flag 6+ member rings", () => {
    const bonds = [
      bond("b1", "A", "B"),
      bond("b2", "B", "C"),
      bond("b3", "C", "D"),
      bond("b4", "D", "E"),
      bond("b5", "E", "F"),
      bond("b6", "F", "A"),
    ];
    const cycles = detectCycles(bonds);
    const longCycles = cycles.filter((c) => c.cycle_length > MAX_CYCLE_LENGTH);
    expect(longCycles).toHaveLength(0);
  });

  it("returns empty array when no cycles exist", () => {
    const bonds = [bond("b1", "A", "B"), bond("b2", "B", "C")];
    const cycles = detectCycles(bonds);
    expect(cycles).toHaveLength(0);
  });

  it("deduplicates: ring A→B→C→A and C→B→A→C are the same cycle", () => {
    const bonds = [bond("b1", "A", "B"), bond("b2", "B", "C"), bond("b3", "C", "A")];
    const cycles = detectCycles(bonds);
    expect(cycles).toHaveLength(1);
  });

  it("accumulates total stake across all bonds in the cycle", () => {
    const bonds = [
      bond("b1", "A", "B", 200),
      bond("b2", "B", "C", 300),
      bond("b3", "C", "A", 500),
    ];
    const cycles = detectCycles(bonds);
    expect(cycles[0].total_stake_marks).toBe(1000);
  });
});

describe("runDailyCycleAudit", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("inserts new cycles not seen before", async () => {
    const db = makeDB({
      getAllActiveBonds: async () => [
        bond("b1", "A", "B"),
        bond("b2", "B", "C"),
        bond("b3", "C", "A"),
      ],
      getExistingCycles: async () => [],
    });
    const result = await runDailyCycleAudit(db, now);
    expect(result.newCycles).toBeGreaterThanOrEqual(1);
    expect(result.updatedCycles).toBe(0);
  });

  it("updates last_seen for existing cycles instead of re-inserting", async () => {
    const existingRow: TrustMatchCycleAuditRow = {
      id: "cycle-1",
      cycle_member_ids: ["A", "B", "C"],
      cycle_trust_match_ids: ["b1", "b2", "b3"],
      cycle_length: 3,
      total_stake_marks: 300,
      first_detected_at: "2026-04-24T12:00:00Z",
      last_seen_at: "2026-04-24T12:00:00Z",
      curator_verdict: "pending",
      curator_member_id: null,
      curator_reviewed_at: null,
      curator_notes: null,
      consequences_applied: false,
      created_at: "2026-04-24T12:00:00Z",
    };

    let lastSeenUpdated = false;
    const db = makeDB({
      getAllActiveBonds: async () => [
        bond("b1", "A", "B"),
        bond("b2", "B", "C"),
        bond("b3", "C", "A"),
      ],
      getExistingCycles: async () => [existingRow],
      updateCycleLastSeen: async () => { lastSeenUpdated = true; },
    });
    const result = await runDailyCycleAudit(db, now);
    expect(result.newCycles).toBe(0);
    expect(result.updatedCycles).toBe(1);
    expect(lastSeenUpdated).toBe(true);
  });

  it("legitimate_collaboration exclusion: existing cycle with that verdict is not re-flagged", async () => {
    const legitimateRow: TrustMatchCycleAuditRow = {
      id: "cycle-legit",
      cycle_member_ids: ["A", "B", "C"],
      cycle_trust_match_ids: ["b1", "b2", "b3"],
      cycle_length: 3,
      total_stake_marks: 300,
      first_detected_at: "2026-04-01T00:00:00Z",
      last_seen_at: "2026-04-20T00:00:00Z",
      curator_verdict: "legitimate_collaboration",
      curator_member_id: "curator-1",
      curator_reviewed_at: "2026-04-20T00:00:00Z",
      curator_notes: "Verified Pedestal contributors",
      consequences_applied: false,
      created_at: "2026-04-01T00:00:00Z",
    };

    let insertCalled = false;
    const db = makeDB({
      getAllActiveBonds: async () => [
        bond("b1", "A", "B"),
        bond("b2", "B", "C"),
        bond("b3", "C", "A"),
      ],
      getExistingCycles: async () => [legitimateRow],
      insertCycle: async (c) => { insertCalled = true; return { ...c, id: "x", created_at: "" }; },
    });
    await runDailyCycleAudit(db, now);
    // Known cycle → update last_seen, NOT re-insert
    expect(insertCalled).toBe(false);
  });
});
