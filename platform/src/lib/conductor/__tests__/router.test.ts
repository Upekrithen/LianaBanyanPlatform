/**
 * Conductor Router — 12-scenario test suite
 * K446a · Phase 1.3 / Phase 6
 *
 * Covers all mode × ranking-state combinations per the K446a spec.
 */

import { describe, it, expect } from "vitest";
import { route } from "../router";
import type { RouterInputs, ConductorMode } from "../router";
import type { ClassifiedQuery } from "../classifier";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeClassified(
  cls: ClassifiedQuery["class"],
  confidence = 0.75,
): ClassifiedQuery {
  return { query: "test query", class: cls, confidence, signals: ["test"] };
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
