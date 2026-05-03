/**
 * Internal Classifier — test suite
 * Bushel X · BP021 · Innovation #2277
 *
 * Tests the classifyInternalTask() heuristic classifier for all 7 task classes.
 * Uses the real classifier logic — no mocks.
 */

import { describe, it, expect } from "vitest";
import {
  classifyInternalTask,
  TASK_CLASS_ROLE,
  type AgentRole,
  type InternalTaskClass,
} from "../internal_classifier";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function expectClass(task: string, expectedClass: InternalTaskClass, roleHint?: AgentRole) {
  const result = classifyInternalTask(task, roleHint);
  expect(result.class, `Task: "${task}"`).toBe(expectedClass);
  expect(result.role, `Role for "${task}"`).toBe(TASK_CLASS_ROLE[expectedClass]);
}

// ─── Label fast-path ──────────────────────────────────────────────────────────

describe("label fast-path", () => {
  it("returns exact label match with confidence 1.0", () => {
    const result = classifyInternalTask("bishop_canon_substrate_keeping");
    expect(result.class).toBe("bishop_canon_substrate_keeping");
    expect(result.confidence).toBe(1.0);
    expect(result.labelDerived).toBe(true);
  });

  it("returns knight_authoring from exact label", () => {
    const result = classifyInternalTask("knight_authoring");
    expect(result.class).toBe("knight_authoring");
    expect(result.labelDerived).toBe(true);
  });

  it("returns pawn_validation from exact label", () => {
    const result = classifyInternalTask("pawn_validation");
    expect(result.class).toBe("pawn_validation");
    expect(result.labelDerived).toBe(true);
  });
});

// ─── Bishop tasks ─────────────────────────────────────────────────────────────

describe("bishop_canon_substrate_keeping", () => {
  it("detects Eblet write task", () => {
    expectClass("Write a new Eblet for the Conductor architecture", "bishop_canon_substrate_keeping");
  });

  it("detects A&A formal update", () => {
    expectClass("Update A&A formal #2277 with the internal routing extension scope", "bishop_canon_substrate_keeping");
  });

  it("detects session-close handoff record", () => {
    expectClass("Write the session-close handoff record for B121", "bishop_canon_substrate_keeping");
  });

  it("detects cathedral substrate write", () => {
    expectClass("Append new scribe entry to the Cathedral substrate", "bishop_canon_substrate_keeping");
  });

  it("detects milestone handoff", () => {
    expectClass("Update MILESTONE_HANDOFF document with today's landed items", "bishop_canon_substrate_keeping");
  });
});

describe("bishop_foreman_coordination", () => {
  it("detects Knight dispatch", () => {
    expectClass("Dispatch Knight K462 for the Conductor internal router build", "bishop_foreman_coordination");
  });

  it("detects KNIGHT_QUEUE update", () => {
    expectClass("Update KNIGHT_QUEUE with the new K462 task entry", "bishop_foreman_coordination");
  });

  it("detects Pawn dispatch", () => {
    expectClass("Dispatch Pawn to research prior art for provisional patent 15", "bishop_foreman_coordination");
  });

  it("detects cross-agent coordination", () => {
    expectClass("Cross-agent coordination: brief Knight on Bushel X deliverables", "bishop_foreman_coordination");
  });
});

// ─── Knight tasks ─────────────────────────────────────────────────────────────

describe("knight_authoring", () => {
  it("detects greenfield TypeScript component", () => {
    expectClass("Build the new internal_classifier.ts component for the conductor", "knight_authoring");
  });

  it("detects bushel build task", () => {
    expectClass("Execute Bushel X Shadow 1 build — classifier scaffold", "knight_authoring");
  });

  it("detects React component creation", () => {
    expectClass("Create a new React component for the Helm routing panel", "knight_authoring");
  });

  it("respects roleHint=knight", () => {
    const result = classifyInternalTask("Build the routing feature", "knight");
    expect(result.role).toBe("knight");
  });
});

describe("knight_audit", () => {
  it("detects audit task", () => {
    expectClass("Audit the internal_router.ts diff for correctness", "knight_audit");
  });

  it("detects test triage", () => {
    expectClass("Triage the failing test cases in the circuit breaker suite", "knight_audit");
  });

  it("detects schema compliance check", () => {
    expectClass("Verify schema compliance for the new Supabase migration", "knight_audit");
  });

  it("detects HMAC verification", () => {
    expectClass("Check HMAC and salt integrity on the shard JSONL entries", "knight_audit");
  });
});

describe("knight_implementation", () => {
  it("detects migration apply", () => {
    expectClass("Apply the supabase migration for the new conductor tables", "knight_implementation");
  });

  it("detects deployment", () => {
    expectClass("Deploy the updated platform to firebase hosting:main", "knight_implementation");
  });

  it("detects wiring task", () => {
    expectClass("Wire the internal router to the dispatch pipeline in the API layer", "knight_implementation");
  });

  it("detects git commit sequence", () => {
    expectClass("Git commit the Bushel X components and push tag", "knight_implementation");
  });
});

// ─── Pawn tasks ───────────────────────────────────────────────────────────────

describe("pawn_research", () => {
  it("detects web research task", () => {
    expectClass("Research prior art for the Conductor routing patent claim", "pawn_research");
  });

  it("detects Perplexity search task", () => {
    expectClass("Use Perplexity to search for competitor AI routing implementations", "pawn_research");
  });

  it("detects current events lookup", () => {
    expectClass("Look up the current status of the Anthropic API pricing changes", "pawn_research");
  });

  it("detects source verification", () => {
    expectClass("Source verification: confirm the R13 benchmark citation is accurate", "pawn_research");
  });
});

describe("pawn_validation", () => {
  it("detects spec compliance check", () => {
    expectClass("Validate the implementation against the spec compliance requirements", "pawn_validation");
  });

  it("detects patent claim check", () => {
    expectClass("Pawn review: check the patent claim against existing prior art", "pawn_validation");
  });

  it("detects contradiction detection", () => {
    expectClass("Contradiction check: does the Bushel X output contradict existing canon?", "pawn_validation");
  });

  it("detects canon-discipline grading", () => {
    expectClass("Grade the Knight output for canon-discipline accuracy and correctness", "pawn_validation");
  });
});

// ─── Fallback behavior ────────────────────────────────────────────────────────

describe("fallback behavior", () => {
  it("falls back to knight_implementation for ambiguous text with knight roleHint", () => {
    const result = classifyInternalTask("do the thing", "knight");
    expect(result.role).toBe("knight");
    expect(result.confidence).toBe(0);
  });

  it("falls back to bishop_canon_substrate_keeping for bishop roleHint", () => {
    const result = classifyInternalTask("do the thing", "bishop");
    expect(result.class).toBe("bishop_canon_substrate_keeping");
    expect(result.confidence).toBe(0);
  });

  it("falls back to pawn_research for pawn roleHint", () => {
    const result = classifyInternalTask("do the thing", "pawn");
    expect(result.class).toBe("pawn_research");
    expect(result.confidence).toBe(0);
  });

  it("falls back to knight_implementation with no roleHint", () => {
    const result = classifyInternalTask("xyzzy undefined gibberish qqq");
    expect(result.class).toBe("knight_implementation");
    expect(result.confidence).toBe(0);
  });
});

// ─── TASK_CLASS_ROLE integrity ────────────────────────────────────────────────

describe("TASK_CLASS_ROLE integrity", () => {
  it("all 7 task classes have a role mapping", () => {
    const classes: InternalTaskClass[] = [
      "bishop_canon_substrate_keeping",
      "bishop_foreman_coordination",
      "knight_authoring",
      "knight_audit",
      "knight_implementation",
      "pawn_research",
      "pawn_validation",
    ];
    for (const cls of classes) {
      expect(TASK_CLASS_ROLE[cls], `Missing role for ${cls}`).toBeDefined();
    }
  });

  it("bishop classes map to bishop role", () => {
    expect(TASK_CLASS_ROLE["bishop_canon_substrate_keeping"]).toBe("bishop");
    expect(TASK_CLASS_ROLE["bishop_foreman_coordination"]).toBe("bishop");
  });

  it("knight classes map to knight role", () => {
    expect(TASK_CLASS_ROLE["knight_authoring"]).toBe("knight");
    expect(TASK_CLASS_ROLE["knight_audit"]).toBe("knight");
    expect(TASK_CLASS_ROLE["knight_implementation"]).toBe("knight");
  });

  it("pawn classes map to pawn role", () => {
    expect(TASK_CLASS_ROLE["pawn_research"]).toBe("pawn");
    expect(TASK_CLASS_ROLE["pawn_validation"]).toBe("pawn");
  });
});
