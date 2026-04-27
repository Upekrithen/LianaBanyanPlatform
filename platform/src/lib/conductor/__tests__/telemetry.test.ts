/**
 * Conductor Telemetry — test suite
 * K525 · Phase A.4
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  recordRoute,
  recordRouteOutcome,
  getLatencyHistogram,
  getVendorMix,
  getCostSummary,
  getRecentRoutes,
  _resetTelemetryForTests,
  type RouteEvent,
} from "../telemetry";

function makeEvent(partial: Partial<RouteEvent>): RouteEvent {
  return {
    ts: Date.now(),
    vendor: "anthropic",
    model: "claude-haiku-4-5",
    queryClass: "retrieval_only",
    latencyMs: null,
    costUsd: null,
    fallbackUsed: false,
    baselineCostUsd: null,
    ...partial,
  };
}

describe("Telemetry — record + retrieve", () => {
  beforeEach(() => {
    _resetTelemetryForTests();
  });

  it("records routes and returns recent ones in newest-first order", () => {
    recordRoute(makeEvent({ ts: 1, vendor: "anthropic" }));
    recordRoute(makeEvent({ ts: 2, vendor: "openai" }));
    recordRoute(makeEvent({ ts: 3, vendor: "google" }));
    const recent = getRecentRoutes(3);
    expect(recent[0].vendor).toBe("google");
    expect(recent[1].vendor).toBe("openai");
    expect(recent[2].vendor).toBe("anthropic");
  });

  it("recordRouteOutcome patches latency + cost", () => {
    const ts = 12345;
    recordRoute(makeEvent({ ts, queryHash: "abc" }));
    recordRouteOutcome(ts, { latencyMs: 250, costUsd: 0.005 }, "abc");
    const recent = getRecentRoutes(1);
    expect(recent[0].latencyMs).toBe(250);
    expect(recent[0].costUsd).toBe(0.005);
  });
});

describe("Telemetry — vendor mix", () => {
  beforeEach(() => {
    _resetTelemetryForTests();
  });

  it("computes vendor share percentages", () => {
    const now = Date.now();
    for (let i = 0; i < 7; i++) {
      recordRoute(makeEvent({ ts: now - i * 1000, vendor: "anthropic" }));
    }
    for (let i = 0; i < 3; i++) {
      recordRoute(makeEvent({ ts: now - i * 1000, vendor: "openai" }));
    }
    const mix = getVendorMix();
    const anthropic = mix.find((m) => m.vendor === "anthropic");
    const openai = mix.find((m) => m.vendor === "openai");
    expect(anthropic?.count).toBe(7);
    expect(openai?.count).toBe(3);
    expect(anthropic?.percent).toBe(70);
    expect(openai?.percent).toBe(30);
  });
});

describe("Telemetry — cost summary + savings", () => {
  beforeEach(() => {
    _resetTelemetryForTests();
  });

  it("totals cost and savings vs baseline", () => {
    recordRoute(
      makeEvent({ ts: Date.now(), costUsd: 0.001, baselineCostUsd: 0.005 }),
    );
    recordRoute(
      makeEvent({ ts: Date.now(), costUsd: 0.002, baselineCostUsd: 0.010 }),
    );
    const summary = getCostSummary();
    expect(summary.count).toBe(2);
    expect(summary.totalCostUsd).toBeCloseTo(0.003, 6);
    expect(summary.totalBaselineCostUsd).toBeCloseTo(0.015, 6);
    expect(summary.totalSavingsUsd).toBeCloseTo(0.012, 6);
  });

  it("returns 0 savingsPercent when baseline is zero", () => {
    recordRoute(makeEvent({ ts: Date.now(), costUsd: 0.001, baselineCostUsd: null }));
    const summary = getCostSummary();
    expect(summary.savingsPercent).toBeNull();
  });
});

describe("Telemetry — latency histogram", () => {
  beforeEach(() => {
    _resetTelemetryForTests();
  });

  it("computes p50/p95/p99 + mean", () => {
    const ts = Date.now();
    const latencies = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    latencies.forEach((ms) => {
      recordRoute(makeEvent({ ts, latencyMs: ms, vendor: "anthropic" }));
    });
    const hist = getLatencyHistogram("anthropic");
    expect(hist.count).toBe(10);
    // p50 (idx 5 → 600). p95 (idx 9 → 1000). p99 (idx 9 → 1000).
    expect(hist.p50).toBe(600);
    expect(hist.p95).toBe(1000);
    expect(hist.p99).toBe(1000);
    expect(hist.mean).toBe(550);
  });

  it("returns empty histogram when no events match", () => {
    const hist = getLatencyHistogram("openai");
    expect(hist.count).toBe(0);
    expect(hist.p50).toBeNull();
  });
});
