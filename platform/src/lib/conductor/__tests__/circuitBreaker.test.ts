/**
 * Conductor Circuit Breaker — test suite
 * K525 · Phase A.1
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  recordVendorResponse,
  isVendorAvailable,
  getCircuitStatus,
  getAllCircuitStatuses,
  _resetCircuitBreakerForTests,
  FAILURE_THRESHOLD,
  COOLDOWN_MS,
  FAILURE_WINDOW_MS,
} from "../circuitBreaker";

describe("Circuit Breaker — failure detection + cooldown", () => {
  beforeEach(() => {
    _resetCircuitBreakerForTests();
  });

  it("starts closed for every vendor", () => {
    expect(isVendorAvailable("anthropic")).toBe(true);
    expect(isVendorAvailable("openai")).toBe(true);
    expect(isVendorAvailable("google")).toBe(true);
    expect(isVendorAvailable("perplexity")).toBe(true);
  });

  it("opens after FAILURE_THRESHOLD failures within window", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < FAILURE_THRESHOLD; i++) {
      recordVendorResponse("openai", false, t0 + i * 1000);
    }
    expect(isVendorAvailable("openai", t0 + FAILURE_THRESHOLD * 1000)).toBe(false);
    const status = getCircuitStatus("openai", t0 + FAILURE_THRESHOLD * 1000);
    expect(status.state).toBe("open");
    expect(status.failuresInWindow).toBe(FAILURE_THRESHOLD);
  });

  it("does NOT open if failures are spread beyond the window", () => {
    const t0 = 1_000_000;
    // Failures spaced FAILURE_WINDOW_MS apart — only the most recent one is "in window"
    for (let i = 0; i < FAILURE_THRESHOLD; i++) {
      recordVendorResponse("google", false, t0 + i * (FAILURE_WINDOW_MS + 1000));
    }
    const lastT = t0 + (FAILURE_THRESHOLD - 1) * (FAILURE_WINDOW_MS + 1000);
    expect(isVendorAvailable("google", lastT + 100)).toBe(true);
  });

  it("transitions open → half_open after cooldown elapses", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < FAILURE_THRESHOLD; i++) {
      recordVendorResponse("anthropic", false, t0 + i);
    }
    const lastFailureT = t0 + (FAILURE_THRESHOLD - 1);
    // Open
    expect(getCircuitStatus("anthropic", t0 + 100).state).toBe("open");
    // Just before cooldown end
    expect(getCircuitStatus("anthropic", lastFailureT + COOLDOWN_MS - 10).state).toBe("open");
    // After cooldown end → half_open
    expect(getCircuitStatus("anthropic", lastFailureT + COOLDOWN_MS + 10).state).toBe(
      "half_open",
    );
    // half_open is still considered AVAILABLE (probe allowed)
    expect(isVendorAvailable("anthropic", lastFailureT + COOLDOWN_MS + 10)).toBe(true);
  });

  it("half_open → closed after a successful probe", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < FAILURE_THRESHOLD; i++) {
      recordVendorResponse("perplexity", false, t0 + i);
    }
    const probeT = t0 + (FAILURE_THRESHOLD - 1) + COOLDOWN_MS + 100;
    // Probe succeeds
    const status = recordVendorResponse("perplexity", true, probeT);
    expect(status.state).toBe("closed");
    expect(status.failuresInWindow).toBe(0);
  });

  it("half_open → open again after a failed probe", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < FAILURE_THRESHOLD; i++) {
      recordVendorResponse("openai", false, t0 + i);
    }
    // Probe must be AFTER the cooldown of the last failure ends.
    // Last failure at t0 + (FAILURE_THRESHOLD - 1) opens cooldownEndsAt to
    // t0 + (FAILURE_THRESHOLD - 1) + COOLDOWN_MS, so probe at +100 past that.
    const probeT = t0 + (FAILURE_THRESHOLD - 1) + COOLDOWN_MS + 100;
    const status = recordVendorResponse("openai", false, probeT);
    expect(status.state).toBe("open");
    expect(status.cooldownEndsAt).toBe(probeT + COOLDOWN_MS);
  });

  it("getAllCircuitStatuses returns all four canonical vendors", () => {
    const all = getAllCircuitStatuses();
    expect(all).toHaveLength(4);
    const vendors = all.map((s) => s.vendor).sort();
    expect(vendors).toEqual(["anthropic", "google", "openai", "perplexity"]);
  });
});
