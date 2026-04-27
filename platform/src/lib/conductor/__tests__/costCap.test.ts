/**
 * Conductor Cost Cap — test suite (pure helpers only)
 * K525 · Phase A.2
 */

import { describe, it, expect } from "vitest";
import {
  currentPeriodStart,
  isPeriodStale,
  decideFromRecord,
} from "../costCap-pure";

describe("currentPeriodStart", () => {
  it("returns YYYY-MM-01 in UTC for the given date", () => {
    expect(currentPeriodStart(new Date("2026-04-27T15:30:00Z"))).toBe("2026-04-01");
    expect(currentPeriodStart(new Date("2026-12-31T23:59:00Z"))).toBe("2026-12-01");
    expect(currentPeriodStart(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01");
  });
});

describe("isPeriodStale", () => {
  const now = new Date("2026-04-27T12:00:00Z");

  it("treats null as stale", () => {
    expect(isPeriodStale(null, now)).toBe(true);
  });

  it("treats prior-month period as stale", () => {
    expect(isPeriodStale("2026-03-01", now)).toBe(true);
  });

  it("treats current-month period as fresh", () => {
    expect(isPeriodStale("2026-04-01", now)).toBe(false);
  });

  it("treats future period as fresh (date string compare)", () => {
    expect(isPeriodStale("2026-05-01", now)).toBe(false);
  });
});

describe("decideFromRecord", () => {
  const now = new Date("2026-04-27T12:00:00Z");

  it("returns allow when no cap is set", () => {
    const result = decideFromRecord(
      {
        monthly_conductor_spend_usd: 5,
        monthly_conductor_cap_usd: null,
        monthly_conductor_period_start: "2026-04-01",
      },
      now,
    );
    expect(result.capExceeded).toBe(false);
    expect(result.recommendedAction).toBe("allow");
    expect(result.monthlyCapUsd).toBeNull();
  });

  it("returns allow when spend < cap", () => {
    const result = decideFromRecord(
      {
        monthly_conductor_spend_usd: 7,
        monthly_conductor_cap_usd: 10,
        monthly_conductor_period_start: "2026-04-01",
      },
      now,
    );
    expect(result.capExceeded).toBe(false);
    expect(result.recommendedAction).toBe("allow");
    expect(result.monthlyTotalUsd).toBe(7);
    expect(result.monthlyCapUsd).toBe(10);
  });

  it("returns force_manual when spend >= cap", () => {
    const result = decideFromRecord(
      {
        monthly_conductor_spend_usd: 10,
        monthly_conductor_cap_usd: 10,
        monthly_conductor_period_start: "2026-04-01",
      },
      now,
    );
    expect(result.capExceeded).toBe(true);
    expect(result.recommendedAction).toBe("force_manual");
  });

  it("resets to zero when period is stale", () => {
    const result = decideFromRecord(
      {
        monthly_conductor_spend_usd: 99, // last month's total
        monthly_conductor_cap_usd: 10,
        monthly_conductor_period_start: "2026-03-01", // last month
      },
      now,
    );
    expect(result.monthlyTotalUsd).toBe(0);
    expect(result.capExceeded).toBe(false);
    expect(result.recommendedAction).toBe("allow");
  });
});
