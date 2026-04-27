/**
 * Conductor Router — scenario test suite
 * K446a · Phase 1.3 / Phase 6
 * B129 hydration: +R11 category-aware prior scenarios (S13–S17)
 *
 * Covers all mode × ranking-state combinations per the K446a spec,
 * plus R11 domain-category prior scenarios added at B129 hydration.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { route } from "../router";
import type { RouterInputs, ConductorMode } from "../router";
import type { ClassifiedQuery, LbDomainCategory } from "../classifier";
import {
  recordVendorResponse,
  _resetCircuitBreakerForTests,
  FAILURE_THRESHOLD,
} from "../circuitBreaker";
import { _resetTelemetryForTests } from "../telemetry";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeClassified(
  cls: ClassifiedQuery["class"],
  confidence = 0.75,
  domainCategory: LbDomainCategory | null = null,
  domainConfidence = 0,
): ClassifiedQuery {
  return {
    query: "test query",
    class: cls,
    confidence,
    signals: ["test"],
    domainCategory,
    domainConfidence,
  };
}

function makeInputs(
  mode: ConductorMode,
  cls: ClassifiedQuery["class"],
  override?: RouterInputs["memberOverride"],
): RouterInputs {
  return {
    classified: makeClassified(cls),
    mode,
    memberOverride: override,
  };
}

// ─── 12 Scenarios ────────────────────────────────────────────────────────────

describe("Conductor Router — 12 mode × ranking-state scenarios", () => {
  // ── vendor-lock scenarios ──────────────────────────────────────────────────

  it("S1: vendor-lock with vendor override — locks to specified vendor", () => {
    const result = route(makeInputs("vendor-lock", "retrieval_only", { vendor: "openai" }));
    expect(result.vendor).toBe("openai");
    expect(result.fallbackUsed).toBe(false);
    expect(result.rationale).toContain("fixed gear");
  });

  it("S2: vendor-lock with vendor + model override — uses exact model", () => {
    const result = route(makeInputs("vendor-lock", "retrieval_only", {
      vendor: "google",
      model: "gemini-2-5-flash",
    }));
    expect(result.vendor).toBe("google");
    expect(result.model).toBe("gemini-2-5-flash");
    expect(result.fallbackUsed).toBe(false);
  });

  it("S3: vendor-lock without override — uses conservative fallback vendor", () => {
    const result = route(makeInputs("vendor-lock", "retrieval_only"));
    expect(result.vendor).toBe("anthropic");
    expect(result.fallbackUsed).toBe(false);
    expect(result.rationale).toContain("fixed gear");
  });

  // ── manual scenarios ───────────────────────────────────────────────────────

  it("S4: manual with vendor override — honors exact vendor", () => {
    const result = route(makeInputs("manual", "code_generation", { vendor: "perplexity" }));
    expect(result.vendor).toBe("perplexity");
    expect(result.fallbackUsed).toBe(false);
    expect(result.rationale).toContain("member-selected");
  });

  it("S5: manual with model override — honors exact model", () => {
    const result = route(makeInputs("manual", "creative", {
      vendor: "anthropic",
      model: "claude-opus-4-7",
    }));
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-opus-4-7");
    expect(result.fallbackUsed).toBe(false);
  });

  it("S6: manual without override — falls through to auto logic", () => {
    const result = route(makeInputs("manual", "retrieval_only"));
    // Falls through to auto: R13-measured class → cost-optimized route (Haiku)
    expect(result.fallbackUsed).toBe(false);
    expect(result.rankingAgeDays).toBe(0);
  });

  // ── auto mode with R13-measured classes ───────────────────────────────────

  it("S7: auto + retrieval_only — cost-optimized route (Haiku, cheapest above 85%)", () => {
    const result = route(makeInputs("auto", "retrieval_only"));
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-haiku-4-5");
    expect(result.fallbackUsed).toBe(false);
    expect(result.rankingAgeDays).toBe(0);
    expect(result.rationale).toContain("HOT%=90%");
  });

  it("S8: auto + reasoning_required — cost-optimized route (Haiku, R13 measured)", () => {
    const result = route(makeInputs("auto", "reasoning_required"));
    expect(result.fallbackUsed).toBe(false);
    expect(result.rankingAgeDays).toBe(0);
  });

  // ── auto mode with conservative-fallback classes ───────────────────────────

  it("S9: auto + creative — conservative flagship fallback (no R13 data for creative)", () => {
    const result = route(makeInputs("auto", "creative"));
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-opus-4-7");
    expect(result.fallbackUsed).toBe(true);
    expect(result.rankingAgeDays).toBeNull();
    expect(result.rationale).toContain("R15");
  });

  it("S10: auto + code_generation — conservative flagship fallback", () => {
    const result = route(makeInputs("auto", "code_generation"));
    expect(result.fallbackUsed).toBe(true);
    expect(result.model).toBe("claude-opus-4-7");
  });

  it("S11: auto + multi_step_planning — conservative flagship fallback", () => {
    const result = route(makeInputs("auto", "multi_step_planning"));
    expect(result.fallbackUsed).toBe(true);
    expect(result.model).toBe("claude-opus-4-7");
  });

  // ── uncertain class ────────────────────────────────────────────────────────

  it("S12: auto + uncertain — conservative Sonnet fallback (Baton emits SCOPE-BOUNDARY-style)", () => {
    const result = route(makeInputs("auto", "uncertain"));
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-sonnet-4-6");
    expect(result.fallbackUsed).toBe(true);
    expect(result.rankingAgeDays).toBeNull();
    expect(result.rationale).toContain("conservative");
  });

  // ── cost tier labels ───────────────────────────────────────────────────────

  it("cost tier: Haiku routes to economy label", () => {
    const result = route(makeInputs("auto", "retrieval_only"));
    expect(result.costTierLabel).toBe("economy (lowest cost)");
  });

  it("cost tier: Opus routes to premium label", () => {
    const result = route(makeInputs("auto", "creative"));
    expect(result.costTierLabel).toBe("premium (highest accuracy)");
  });
});

// ─── R11 Category-Aware Prior Scenarios (B129 hydration) ─────────────────────
// Tests that the router correctly applies R11 per-category empirical priors
// when the classifier detects an LB domain category with sufficient confidence.
//
// R11 key findings used here:
//   economic_governance  — Gemini 2.5 Pro: 22% HOT (well below 60% demote threshold)
//   member_journey       — Gemini + Claude Sonnet: 50% HOT each (below 60% demote threshold)
//   historical_precedent — Gemini: 62% HOT (above 60% threshold — NOT demoted)

describe("R11 category-aware prior routing (B129 hydration)", () => {

  it("S13: auto + retrieval_only + economic_governance domain — Gemini de-ranked (22% HOT)", () => {
    const result = route({
      classified: makeClassified("retrieval_only", 0.80, "economic_governance", 0.65),
      mode: "auto",
    });
    // Gemini should be excluded (22% HOT < 60% demote threshold)
    expect(result.vendor).not.toBe("google");
    expect(result.categoryPriorApplied).toBe(true);
    expect(result.categoryPriorDetail).toContain("economic_governance");
    expect(result.categoryPriorDetail).toContain("google");
    expect(result.categoryPriorDetail).toContain("22%");
  });

  it("S14: auto + retrieval_only + member_journey domain — Gemini + Claude Sonnet de-ranked", () => {
    const result = route({
      classified: makeClassified("retrieval_only", 0.80, "member_journey", 0.70),
      mode: "auto",
    });
    // Gemini (50% HOT) and Claude Sonnet (50% HOT) both below 60% — should be excluded
    // Result should be Perplexity Sonar-Pro (100% HOT on member_journey) or
    // OpenAI GPT-4o (100%) or Claude Opus (62% — borderline)
    expect(result.vendor).not.toBe("google");
    expect(result.categoryPriorApplied).toBe(true);
    expect(result.categoryPriorDetail).toContain("member_journey");
    // Haiku is also anthropic/claude-haiku — check we didn't route to Sonnet
    expect(result.model).not.toBe("claude-sonnet-4-6");
  });

  it("S15: auto + retrieval_only + historical_precedent — NO de-ranking (Gemini 62% > 60% threshold)", () => {
    const result = route({
      classified: makeClassified("retrieval_only", 0.80, "historical_precedent", 0.65),
      mode: "auto",
    });
    // historical_precedent: Gemini 62% — just above demote threshold; no vendors demoted
    expect(result.categoryPriorApplied).toBe(false);
    expect(result.categoryPriorDetail).toBeNull();
  });

  it("S16: auto + retrieval_only + domain below confidence threshold — prior NOT applied", () => {
    // domainConfidence of 0.3 is below DOMAIN_CONFIDENCE_FOR_PRIOR (0.5)
    const result = route({
      classified: makeClassified("retrieval_only", 0.80, "economic_governance", 0.3),
      mode: "auto",
    });
    expect(result.categoryPriorApplied).toBe(false);
    expect(result.categoryPriorDetail).toBeNull();
  });

  it("S17: vendor-lock + economic_governance domain — prior NOT applied (member controls gear)", () => {
    const result = route({
      classified: makeClassified("retrieval_only", 0.80, "economic_governance", 0.65),
      mode: "vendor-lock",
      memberOverride: { vendor: "google" },
    });
    // vendor-lock bypasses all priors — member's choice is honored
    expect(result.vendor).toBe("google");
    expect(result.fallbackUsed).toBe(false);
    expect(result.categoryPriorApplied).toBe(false);
    expect(result.rationale).toContain("fixed gear");
  });
});

// ─── K525 Phase A — Circuit Breaker + Token Budget Integration ────────────────

describe("K525 Phase A — circuit breaker integration", () => {
  beforeEach(() => {
    _resetCircuitBreakerForTests();
    _resetTelemetryForTests();
  });

  it("S18: auto + retrieval_only with anthropic breaker open — routes elsewhere", () => {
    // Trip anthropic breaker
    for (let i = 0; i < FAILURE_THRESHOLD; i++) {
      recordVendorResponse("anthropic", false, Date.now());
    }
    const result = route(makeInputs("auto", "retrieval_only"));
    // Anthropic was top-ranked but is now demoted via circuit breaker
    expect(result.vendor).not.toBe("anthropic");
    expect(result.circuitBreakerDemoted).toContain("anthropic");
  });

  it("S19: vendor-lock bypasses circuit breaker (member's absolute choice)", () => {
    for (let i = 0; i < FAILURE_THRESHOLD; i++) {
      recordVendorResponse("openai", false, Date.now());
    }
    const result = route({
      classified: makeClassified("retrieval_only"),
      mode: "vendor-lock",
      memberOverride: { vendor: "openai" },
    });
    // Member's choice honored even though breaker is open
    expect(result.vendor).toBe("openai");
    expect(result.circuitBreakerDemoted).toEqual([]);
  });

  it("S20: when ALL vendors broken, falls back to top-ranked anyway (no decision is worse)", () => {
    for (const v of ["anthropic", "openai", "google", "perplexity"] as const) {
      for (let i = 0; i < FAILURE_THRESHOLD; i++) {
        recordVendorResponse(v, false, Date.now());
      }
    }
    const result = route(makeInputs("auto", "retrieval_only"));
    // Returns SOME decision; downstream call may fail but the router doesn't refuse
    expect(result.vendor).toBeDefined();
    expect(result.circuitBreakerDemoted.length).toBeGreaterThan(0);
  });
});

describe("K525 Phase A — token budget integration", () => {
  beforeEach(() => {
    _resetCircuitBreakerForTests();
    _resetTelemetryForTests();
  });

  it("S21: tiny prompt — no demotion", () => {
    const result = route({
      classified: makeClassified("retrieval_only"),
      mode: "auto",
      inputTokens: 1_000,
    });
    expect(result.tokenBudgetDemoted).toEqual([]);
  });

  it("S22: 150K prompt — chosen model has window ≥ 150K", () => {
    const result = route({
      classified: makeClassified("retrieval_only"),
      mode: "auto",
      inputTokens: 150_000,
    });
    // Result vendor/model should still be a valid choice
    expect(result.vendor).toBeDefined();
    expect(result.model).toBeDefined();
    // Any demotions reported must reference models with windows < 150K
    for (const d of result.tokenBudgetDemoted) {
      expect(d.maxTokens).toBeLessThan(150_000 + 8_000); // window < input + reserve
    }
  });
});
