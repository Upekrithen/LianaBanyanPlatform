import { describe, it, expect } from "vitest";
import {
  computeRollingRaisePure,
  REGCF_ANNUAL_CAP_USD,
} from "./regcf-annual-cap-core";

const NOW = new Date("2026-04-22T12:00:00Z");

describe("computeRollingRaisePure", () => {
  it("returns zero for empty entries", () => {
    const result = computeRollingRaisePure([], NOW);
    expect(result.raisedLast12Months).toBe(0);
    expect(result.remainingHeadroom).toBe(REGCF_ANNUAL_CAP_USD);
    expect(result.percentOfCap).toBe(0);
  });

  it("sums a single entry within window", () => {
    const result = computeRollingRaisePure(
      [{ cumulative_raised_usd: 100_000, period_start: "2026-01-15" }],
      NOW
    );
    expect(result.raisedLast12Months).toBe(100_000);
    expect(result.remainingHeadroom).toBe(REGCF_ANNUAL_CAP_USD - 100_000);
    expect(result.percentOfCap).toBeCloseTo(2, 0);
  });

  it("excludes entries older than 12 months", () => {
    const result = computeRollingRaisePure(
      [
        { cumulative_raised_usd: 500_000, period_start: "2024-01-01" },
        { cumulative_raised_usd: 200_000, period_start: "2026-02-01" },
      ],
      NOW
    );
    expect(result.raisedLast12Months).toBe(200_000);
  });

  it("includes entries straddling the window boundary", () => {
    const windowEdge = new Date(NOW);
    windowEdge.setFullYear(windowEdge.getFullYear() - 1);
    const edgeStr = windowEdge.toISOString().slice(0, 10);

    const result = computeRollingRaisePure(
      [
        { cumulative_raised_usd: 50_000, period_start: edgeStr },
        { cumulative_raised_usd: 75_000, period_start: "2026-04-01" },
      ],
      NOW
    );
    expect(result.raisedLast12Months).toBe(125_000);
  });

  it("handles exactly-at-cap", () => {
    const result = computeRollingRaisePure(
      [
        { cumulative_raised_usd: REGCF_ANNUAL_CAP_USD, period_start: "2026-03-01" },
      ],
      NOW
    );
    expect(result.raisedLast12Months).toBe(REGCF_ANNUAL_CAP_USD);
    expect(result.remainingHeadroom).toBe(0);
    expect(result.percentOfCap).toBe(100);
  });

  it("handles above-cap (should not happen but graceful)", () => {
    const result = computeRollingRaisePure(
      [
        { cumulative_raised_usd: 3_000_000, period_start: "2025-12-01" },
        { cumulative_raised_usd: 3_000_000, period_start: "2026-03-01" },
      ],
      NOW
    );
    expect(result.raisedLast12Months).toBe(6_000_000);
    expect(result.remainingHeadroom).toBe(0);
    expect(result.percentOfCap).toBe(120);
  });

  it("excludes future-dated entries", () => {
    const result = computeRollingRaisePure(
      [
        { cumulative_raised_usd: 100_000, period_start: "2026-01-01" },
        { cumulative_raised_usd: 999_999, period_start: "2027-01-01" },
      ],
      NOW
    );
    expect(result.raisedLast12Months).toBe(100_000);
  });

  it("sums multiple entries from different months in window", () => {
    const entries = [
      { cumulative_raised_usd: 100_000, period_start: "2025-06-01" },
      { cumulative_raised_usd: 200_000, period_start: "2025-09-01" },
      { cumulative_raised_usd: 300_000, period_start: "2025-12-01" },
      { cumulative_raised_usd: 150_000, period_start: "2026-03-01" },
    ];
    const result = computeRollingRaisePure(entries, NOW);
    expect(result.raisedLast12Months).toBe(750_000);
    expect(result.remainingHeadroom).toBe(REGCF_ANNUAL_CAP_USD - 750_000);
  });
});

describe("REGCF_ANNUAL_CAP_USD constant", () => {
  it("is $5,000,000", () => {
    expect(REGCF_ANNUAL_CAP_USD).toBe(5_000_000);
  });
});
