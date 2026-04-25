/**
 * Tests: puzzle_rotation — Phase A (K501)
 */

import { describe, it, expect } from "vitest";
import {
  getActivePuzzle,
  checkRotationsDue,
  recordPuzzleCompletion,
  queueNextRotation,
  type PuzzleRotationDB,
  type PuzzleContentRotationRow,
  type PuzzleClass,
  type SparkVelocityAnomaly,
  ROTATION_ADVANCE_NOTICE_DAYS,
  ROTATION_PERIOD_DAYS,
} from "../index";

// ── Test-doubles ──────────────────────────────────────────────────────────────

function makeRow(overrides: Partial<PuzzleContentRotationRow> = {}): PuzzleContentRotationRow {
  const now = new Date("2026-04-25T12:00:00Z");
  const until = new Date(now);
  until.setDate(until.getDate() + 30);
  return {
    id: "row-1",
    puzzle_class: "codebreakers",
    content_payload: { version: 1, questions: [] },
    active_from: now.toISOString(),
    active_until: until.toISOString(),
    expected_completion_time_seconds: 300,
    created_at: now.toISOString(),
    ...overrides,
  };
}

function makeDB(overrides: Partial<PuzzleRotationDB> = {}): PuzzleRotationDB {
  return {
    getActivePuzzle: async () => makeRow(),
    insertRotation: async (row) => ({ ...row, id: "new-row", created_at: new Date().toISOString() }),
    getExpiringSoon: async () => [],
    getSparkVelocityAnomalies: async () => [],
    flagCompletionForReview: async () => undefined,
    getCompletionTimePercentile: async () => null,
    getMemberAccountAgeDays: async () => 90,
    updateCompletionTimestamps: async () => undefined,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("getActivePuzzle", () => {
  it("returns the active row when one exists", async () => {
    const db = makeDB();
    const result = await getActivePuzzle(db, "codebreakers");
    expect(result).not.toBeNull();
    expect(result?.puzzle_class).toBe("codebreakers");
  });

  it("returns null when no active row", async () => {
    const db = makeDB({ getActivePuzzle: async () => null });
    const result = await getActivePuzzle(db, "golden_keys_treasure_map");
    expect(result).toBeNull();
  });
});

describe("checkRotationsDue", () => {
  it("returns empty array when nothing is expiring soon", async () => {
    const db = makeDB({ getExpiringSoon: async () => [] });
    const result = await checkRotationsDue(db, new Date("2026-04-25T12:00:00Z"));
    expect(result).toHaveLength(0);
  });

  it("returns classes that need new content when expiring within notice period", async () => {
    const expiringRow = makeRow({ puzzle_class: "codebreakers" });
    const db = makeDB({ getExpiringSoon: async () => [expiringRow] });
    const result = await checkRotationsDue(db, new Date("2026-04-25T12:00:00Z"));
    expect(result).toHaveLength(1);
    expect(result[0].puzzleClass).toBe("codebreakers");
  });
});

describe("queueNextRotation", () => {
  it("sets active_from = current active_until and active_until = +30 days", async () => {
    const current = makeRow({ active_until: "2026-05-25T12:00:00Z" });
    let inserted: Omit<PuzzleContentRotationRow, "id" | "created_at"> | undefined;
    const db = makeDB({
      insertRotation: async (row) => {
        inserted = row;
        return { ...row, id: "new-row", created_at: new Date().toISOString() };
      },
    });

    await queueNextRotation(db, "codebreakers", { version: 2 }, 300, current);

    expect(inserted!.active_from).toBe("2026-05-25T12:00:00.000Z");
    const expectedUntil = new Date("2026-05-25T12:00:00Z");
    expectedUntil.setDate(expectedUntil.getDate() + ROTATION_PERIOD_DAYS);
    expect(inserted!.active_until).toBe(expectedUntil.toISOString());
  });
});

describe("recordPuzzleCompletion", () => {
  it("does NOT flag when completion time is above 5th percentile", async () => {
    const db = makeDB({
      getCompletionTimePercentile: async () => 60,  // p5 = 60s
      getMemberAccountAgeDays: async () => 10,      // new member
    });
    const started = new Date("2026-04-25T12:00:00Z");
    const completed = new Date("2026-04-25T12:02:00Z"); // 120s (above p5)
    const result = await recordPuzzleCompletion(db, "cpl-1", "mem-1", "codebreakers", started, completed);
    expect(result.flagged).toBe(false);
  });

  it("does NOT flag when member account is old, even if fast", async () => {
    const db = makeDB({
      getCompletionTimePercentile: async () => 60,
      getMemberAccountAgeDays: async () => 45,  // established member (≥ 30 days)
    });
    const started = new Date("2026-04-25T12:00:00Z");
    const completed = new Date("2026-04-25T12:00:10Z"); // 10s — very fast
    const result = await recordPuzzleCompletion(db, "cpl-2", "mem-2", "codebreakers", started, completed);
    expect(result.flagged).toBe(false);
  });

  it("flags when fast AND new member (both conditions met)", async () => {
    let flagCalled = false;
    const db = makeDB({
      getCompletionTimePercentile: async () => 60,
      getMemberAccountAgeDays: async () => 5,   // new member
      flagCompletionForReview: async () => { flagCalled = true; },
    });
    const started = new Date("2026-04-25T12:00:00Z");
    const completed = new Date("2026-04-25T12:00:10Z"); // 10s < 60s p5
    const result = await recordPuzzleCompletion(db, "cpl-3", "mem-3", "codebreakers", started, completed);
    expect(result.flagged).toBe(true);
    expect(flagCalled).toBe(true);
  });

  it("does NOT flag when p5 percentile is null (insufficient population data)", async () => {
    const db = makeDB({
      getCompletionTimePercentile: async () => null,
      getMemberAccountAgeDays: async () => 1,
    });
    const started = new Date("2026-04-25T12:00:00Z");
    const completed = new Date("2026-04-25T12:00:01Z"); // 1s
    const result = await recordPuzzleCompletion(db, "cpl-4", "mem-4", "codebreakers", started, completed);
    expect(result.flagged).toBe(false);
  });
});
