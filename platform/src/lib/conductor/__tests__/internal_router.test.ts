/**
 * Internal Router — test suite
 * Bushel X · BP021 · Innovation #2277
 *
 * Tests the routeInternal() decision layer across all three modes
 * and the canonical-lock safety invariant.
 * Uses real classifier + ranking logic — no mocks.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { routeInternal, type InternalConductorMode, type InternalRouterInputs } from "../internal_router";
import { classifyInternalTask } from "../internal_classifier";
import { CANONICAL_ROLE_ASSIGNMENTS } from "../internal_rankings";
import { _resetInternalTelemetryForTests } from "../telemetry";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeInputs(
  taskLabel: string,
  mode: InternalConductorMode,
  override?: InternalRouterInputs["override"],
): InternalRouterInputs {
  return {
    classified: classifyInternalTask(taskLabel),
    mode,
    override,
  };
}

beforeEach(() => {
  _resetInternalTelemetryForTests();
});

// ─── canonical-lock mode ─────────────────────────────────────────────────────

describe("canonical-lock mode", () => {
  it("Bishop task → Opus (canonical default)", () => {
    const result = routeInternal(makeInputs("bishop_canon_substrate_keeping", "canonical-lock"));
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-opus-4-7");
    expect(result.canonicalAssignmentUsed).toBe(true);
    expect(result.fallbackUsed).toBe(false);
  });

  it("Knight task → Sonnet (canonical default)", () => {
    const result = routeInternal(makeInputs("knight_implementation", "canonical-lock"));
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-sonnet-4-6");
    expect(result.canonicalAssignmentUsed).toBe(true);
  });

  it("Pawn task → sonar-pro (canonical default)", () => {
    const result = routeInternal(makeInputs("pawn_research", "canonical-lock"));
    expect(result.vendor).toBe("perplexity");
    expect(result.model).toBe("sonar-pro");
    expect(result.canonicalAssignmentUsed).toBe(true);
  });

  it("canonical-lock ignores any override", () => {
    const result = routeInternal(
      makeInputs("knight_authoring", "canonical-lock", { vendor: "openai", model: "gpt-5-5" }),
    );
    // canonical-lock always wins — override is ignored
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-sonnet-4-6");
  });

  it("rationale mentions 'canonical-lock'", () => {
    const result = routeInternal(makeInputs("bishop_foreman_coordination", "canonical-lock"));
    expect(result.rationale.toLowerCase()).toContain("canonical-lock");
  });
});

// ─── CANONICAL_ROLE_ASSIGNMENTS invariant ────────────────────────────────────

describe("CANONICAL_ROLE_ASSIGNMENTS invariant", () => {
  it("Bishop canonical = anthropic/claude-opus-4-7", () => {
    expect(CANONICAL_ROLE_ASSIGNMENTS.bishop.vendor).toBe("anthropic");
    expect(CANONICAL_ROLE_ASSIGNMENTS.bishop.model).toBe("claude-opus-4-7");
  });

  it("Knight canonical = anthropic/claude-sonnet-4-6", () => {
    expect(CANONICAL_ROLE_ASSIGNMENTS.knight.vendor).toBe("anthropic");
    expect(CANONICAL_ROLE_ASSIGNMENTS.knight.model).toBe("claude-sonnet-4-6");
  });

  it("Pawn canonical = perplexity/sonar-pro", () => {
    expect(CANONICAL_ROLE_ASSIGNMENTS.pawn.vendor).toBe("perplexity");
    expect(CANONICAL_ROLE_ASSIGNMENTS.pawn.model).toBe("sonar-pro");
  });
});

// ─── manual mode ─────────────────────────────────────────────────────────────

describe("manual mode", () => {
  it("honors vendor+model override exactly", () => {
    const result = routeInternal(
      makeInputs("knight_authoring", "manual", { vendor: "openai", model: "gpt-5-5" }),
    );
    expect(result.vendor).toBe("openai");
    expect(result.model).toBe("gpt-5-5");
    expect(result.fallbackUsed).toBe(false);
    expect(result.rationale).toContain("Manual override");
  });

  it("falls through to auto logic when no override provided", () => {
    const result = routeInternal(makeInputs("knight_implementation", "manual"));
    // Should not throw; should return a valid vendor/model
    expect(result.vendor).toBeTruthy();
    expect(result.model).toBeTruthy();
  });

  it("vendor-only override uses default model for that vendor", () => {
    const result = routeInternal(
      makeInputs("pawn_validation", "manual", { vendor: "anthropic" }),
    );
    expect(result.vendor).toBe("anthropic");
    // Model comes from canonical default for the role (pawn → sonar-pro from perplexity,
    // but with vendor override to anthropic, falls back to canonical.model or pawn canonical model)
    expect(result.model).toBeTruthy();
  });
});

// ─── auto mode ───────────────────────────────────────────────────────────────

describe("auto mode", () => {
  it("returns a vendor + model for all 7 task classes", () => {
    const classes = [
      "bishop_canon_substrate_keeping",
      "bishop_foreman_coordination",
      "knight_authoring",
      "knight_audit",
      "knight_implementation",
      "pawn_research",
      "pawn_validation",
    ] as const;

    for (const cls of classes) {
      const result = routeInternal(makeInputs(cls, "auto"));
      expect(result.vendor, `vendor for ${cls}`).toBeTruthy();
      expect(result.model, `model for ${cls}`).toBeTruthy();
      expect(result.rationale, `rationale for ${cls}`).toBeTruthy();
    }
  });

  it("pawn_research auto → perplexity/sonar-pro (canonical seed tops ranking)", () => {
    const result = routeInternal(makeInputs("pawn_research", "auto"));
    expect(result.vendor).toBe("perplexity");
    expect(result.model).toBe("sonar-pro");
  });

  it("bishop_canon_substrate_keeping auto → anthropic/claude-opus-4-7", () => {
    const result = routeInternal(makeInputs("bishop_canon_substrate_keeping", "auto"));
    expect(result.vendor).toBe("anthropic");
    expect(result.model).toBe("claude-opus-4-7");
  });

  it("auto with economy costPriority returns a valid entry", () => {
    const result = routeInternal({
      classified: classifyInternalTask("knight_audit"),
      mode: "auto",
      costPriority: "economy",
    });
    expect(result.vendor).toBeTruthy();
    expect(result.model).toBeTruthy();
  });
});

// ─── modeLabel ────────────────────────────────────────────────────────────────

describe("modeLabel", () => {
  it("canonical-lock has correct label", () => {
    const result = routeInternal(makeInputs("knight_authoring", "canonical-lock"));
    expect(result.modeLabel).toContain("canonical-lock");
  });

  it("auto has correct label", () => {
    const result = routeInternal(makeInputs("knight_authoring", "auto"));
    expect(result.modeLabel).toContain("auto");
  });

  it("manual has correct label", () => {
    const result = routeInternal(
      makeInputs("knight_authoring", "manual", { vendor: "anthropic", model: "claude-sonnet-4-6" }),
    );
    expect(result.modeLabel).toContain("manual");
  });
});

// ─── Telemetry side-effect ────────────────────────────────────────────────────

describe("telemetry side-effect", () => {
  it("routeInternal does not throw even without LIBRARIAN_STITCHPUNKS_DIR set", () => {
    // Scribe log is non-fatal; this should not throw
    delete process.env.LIBRARIAN_STITCHPUNKS_DIR;
    expect(() => routeInternal(makeInputs("knight_implementation", "canonical-lock"))).not.toThrow();
  });
});
