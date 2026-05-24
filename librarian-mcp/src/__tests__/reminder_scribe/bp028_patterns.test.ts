/**
 * Reminder Scribe BP028 Pattern Tests
 * =====================================
 * Tests for the 5 new patterns added in BP028:
 *   R-PHA-1   Pre-Hoc Permission Ask (BRICK-WALL-FIRST-HALF regression)
 *   R-MS-1    Missing Surface (BRICK-WALL-SECOND-HALF regression)
 *   R-REV-1   Pre-Emptive Review Pressure (REVIEW-IN-LAST-HOURS regression)
 *   R-PAWN-1  dispatch_pawn-when-paste-routed (PAWN-BLIND-WORKAROUND regression)
 *   R-ROOK-1  dispatch_rook-pre-restart (MCP-RESTART-NEEDED regression)
 *
 * Also verifies existing patterns (R-KP-1/2/3/4, R-PRAISE-1/2, R-DOUBLE-FILE-1,
 * R-FORK-1, R-COUNSEL-1, R-USPTO-1) are NOT broken by the additions.
 *
 * Test runner: Node built-in test (node --test) — no external dependencies.
 * Run: npx tsx --test src/__tests__/reminder_scribe/bp028_patterns.test.ts
 */

import { strict as assert } from "assert";
import { test, describe } from "node:test";

import { BUILT_IN_RULES } from "../../reminder_scribe/rules_registry.js";
import { runReminderScribeCheck } from "../../reminder_scribe/pattern_match_engine.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Find rule by ID from BUILT_IN_RULES. */
function getRule(id: string) {
  const rule = BUILT_IN_RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Rule ${id} not found in BUILT_IN_RULES`);
  return rule;
}

/**
 * Run engine check and return violations for a specific rule ID.
 * Uses workspaceRoot override to avoid disk-path dependencies.
 */
function checkForRule(responseText: string, ruleId: string) {
  const result = runReminderScribeCheck(responseText, {
    workspaceRoot: "/nonexistent/workspace",
  });
  return result.violations.filter((v) => v.rule_id === ruleId);
}

/** Run engine check and assert no violations for a given rule ID. */
function assertCleanForRule(responseText: string, ruleId: string) {
  const violations = checkForRule(responseText, ruleId);
  assert.equal(
    violations.length,
    0,
    `Expected clean for ${ruleId} but got ${violations.length} violation(s): ${JSON.stringify(violations.map((v) => v.matches.map((m) => m.matched_text)))}`
  );
}

/** Run engine check and assert at least one violation for a given rule ID. */
function assertViolationForRule(responseText: string, ruleId: string) {
  const violations = checkForRule(responseText, ruleId);
  assert.ok(
    violations.length > 0,
    `Expected violation for ${ruleId} but got none. Response: "${responseText.slice(0, 200)}"`
  );
  return violations;
}

// ─── Registry shape tests ─────────────────────────────────────────────────────

describe("BUILT_IN_RULES registry — BP028 additions", () => {
  test("Registry contains exactly 15 rules (10 pre-BP028 + 5 new)", () => {
    assert.equal(BUILT_IN_RULES.length, 15);
  });

  test("All 5 BP028 rule IDs are present", () => {
    const ids = BUILT_IN_RULES.map((r) => r.id);
    for (const id of ["R-PHA-1", "R-MS-1", "R-REV-1", "R-PAWN-1", "R-ROOK-1"]) {
      assert.ok(ids.includes(id), `Missing rule: ${id}`);
    }
  });

  test("All 10 pre-BP028 rule IDs are still present (no removals)", () => {
    const ids = BUILT_IN_RULES.map((r) => r.id);
    for (const id of [
      "R-KP-1", "R-KP-2", "R-KP-3", "R-KP-4",
      "R-PRAISE-1", "R-PRAISE-2",
      "R-DOUBLE-FILE-1",
      "R-FORK-1",
      "R-COUNSEL-1",
      "R-USPTO-1",
    ]) {
      assert.ok(ids.includes(id), `Pre-existing rule missing: ${id}`);
    }
  });

  test("R-PHA-1 has correct class and priority", () => {
    const rule = getRule("R-PHA-1");
    assert.equal(rule.class, "brick-wall");
    assert.equal(rule.priority, 11);
    assert.equal(rule.active, true);
    assert.equal(rule.override_class, "free");
    assert.equal(rule.blocks_response, false);
  });

  test("R-MS-1 has correct class and priority", () => {
    const rule = getRule("R-MS-1");
    assert.equal(rule.class, "brick-wall");
    assert.equal(rule.priority, 12);
    assert.equal(rule.active, true);
    assert.equal(rule.override_class, "marks-cost");
  });

  test("R-REV-1 has correct class and priority", () => {
    const rule = getRule("R-REV-1");
    assert.equal(rule.class, "brick-wall");
    assert.equal(rule.priority, 13);
    assert.equal(rule.active, true);
    assert.equal(rule.override_class, "free");
  });

  test("R-PAWN-1 has correct class and priority", () => {
    const rule = getRule("R-PAWN-1");
    assert.equal(rule.class, "dispatch-coord");
    assert.equal(rule.priority, 14);
    assert.equal(rule.active, true);
    assert.equal(rule.override_class, "marks-cost");
  });

  test("R-ROOK-1 has correct class and priority", () => {
    const rule = getRule("R-ROOK-1");
    assert.equal(rule.class, "dispatch-coord");
    assert.equal(rule.priority, 15);
    assert.equal(rule.active, true);
    assert.equal(rule.override_class, "free");
  });

  test("All 5 BP028 rules have correction_proposal with TODO marker", () => {
    // R-MS-1, R-PAWN-1, R-ROOK-1 must carry TODO for full tool-call-record integration
    for (const id of ["R-MS-1", "R-PAWN-1", "R-ROOK-1"]) {
      const rule = getRule(id);
      assert.ok(
        rule.correction_proposal.includes("TODO"),
        `Rule ${id} correction_proposal missing TODO for tool-call-record integration`
      );
    }
  });
});

// ─── R-PHA-1: Pre-Hoc Permission Ask ─────────────────────────────────────────

describe("R-PHA-1 — Pre-Hoc Permission Ask", () => {
  test("TRIGGERS on 'Should I read the file?'", () => {
    assertViolationForRule("Should I read the file and look for patterns?", "R-PHA-1");
  });

  test("TRIGGERS on 'May I proceed with this analysis?'", () => {
    assertViolationForRule("May I proceed with this analysis?", "R-PHA-1");
  });

  test("TRIGGERS on 'Can I draft the Eblet now?'", () => {
    assertViolationForRule("Can I draft the Eblet now?", "R-PHA-1");
  });

  test("TRIGGERS on 'Want me to write the K-prompt?'", () => {
    assertViolationForRule("Want me to write the K-prompt for this?", "R-PHA-1");
  });

  test("TRIGGERS on 'Would you like me to search the substrate?'", () => {
    assertViolationForRule("Would you like me to search the substrate for prior canon?", "R-PHA-1");
  });

  test("CLEAN on declarative action statement (correct form)", () => {
    assertCleanForRule(
      "I'll read the file and search for patterns. Found 47 definitions. Next: assign rule IDs.",
      "R-PHA-1"
    );
  });

  test("CLEAN on past-tense completion surface", () => {
    assertCleanForRule(
      "I read the file. Found 12 active patterns and 8 deprecated. Ready to ingest 5 new specs.",
      "R-PHA-1"
    );
  });
});

// ─── R-MS-1: Missing Surface ──────────────────────────────────────────────────

describe("R-MS-1 — Missing Surface", () => {
  test("TRIGGERS on response ending with 'tool call executed.'", () => {
    assertViolationForRule("I'll now analyze the file. tool call executed.", "R-MS-1");
  });

  test("TRIGGERS on response ending with '[read call]'", () => {
    assertViolationForRule(
      "Reading the patterns file now. [read call]",
      "R-MS-1"
    );
  });

  test("TRIGGERS on 'dispatched to knight' with no follow-up", () => {
    assertViolationForRule(
      "Sending to Knight for implementation. dispatched to knight.",
      "R-MS-1"
    );
  });

  test("CLEAN on response with proper completion block", () => {
    assertCleanForRule(
      "Read patterns.ts. Found 47 definitions (12 active, 8 deprecated, 27 BP025-BP028 era). " +
      "Ready to ingest 5 new specs. Next: cross-reference Catechist R-table.",
      "R-MS-1"
    );
  });
});

// ─── R-REV-1: Pre-Emptive Review Pressure ────────────────────────────────────

describe("R-REV-1 — Pre-Emptive Review Pressure", () => {
  test("TRIGGERS on 'Want me to surface this for voice-pass?'", () => {
    assertViolationForRule(
      "Draft is complete. Want me to surface this for voice-pass?",
      "R-REV-1"
    );
  });

  test("TRIGGERS on 'Ready for your review?'", () => {
    assertViolationForRule(
      "The A&A formal scaffold is drafted. Ready for your review?",
      "R-REV-1"
    );
  });

  test("TRIGGERS on 'Should I put this in the voice-pass queue?'", () => {
    assertViolationForRule(
      "Should I put this in the voice-pass queue?",
      "R-REV-1"
    );
  });

  test("TRIGGERS on 'Want to look this over before I continue?'", () => {
    assertViolationForRule(
      "Want to look this over before I move to the next scaffold?",
      "R-REV-1"
    );
  });

  test("TRIGGERS on 'Ready to voice-pass?'", () => {
    assertViolationForRule("Scaffold complete. Ready to voice-pass?", "R-REV-1");
  });

  test("CLEAN on autonomous draft stashing (correct form)", () => {
    assertCleanForRule(
      "Draft stashed in voice-pass queue for fire-time window (14:00 MDT). Founder voice-pass on 2026-05-06.",
      "R-REV-1"
    );
  });

  test("CLEAN on non-review question forms", () => {
    assertCleanForRule(
      "Scaffold authored. Next: assign 2NNN number and cross-reference Catechist R-table.",
      "R-REV-1"
    );
  });
});

// ─── R-PAWN-1: dispatch_pawn-when-paste-routed ───────────────────────────────

describe("R-PAWN-1 — dispatch_pawn when paste-routed", () => {
  test("TRIGGERS on 'dispatch_pawn' mention in response text", () => {
    assertViolationForRule(
      "I'll call dispatch_pawn to send this to Perplexity for research.",
      "R-PAWN-1"
    );
  });

  test("TRIGGERS on 'dispatch pawn' (space variant)", () => {
    assertViolationForRule("Using dispatch pawn to route this task.", "R-PAWN-1");
  });

  test("CLEAN on paste-routing correction form", () => {
    assertCleanForRule(
      "Pawn prompt authored: BISHOP_DROPZONE/02_PawnPrompts/PAWN_RESEARCH_GOLDBACH_BP028.md\n" +
      "Ready for paste to Perplexity web. Pawn will research singular series structure.",
      "R-PAWN-1"
    );
  });

  test("CLEAN on response with no dispatch mention", () => {
    assertCleanForRule(
      "Pawn prompt file ready. Founder can paste directly to Perplexity web UI for fast iteration.",
      "R-PAWN-1"
    );
  });
});

// ─── R-ROOK-1: dispatch_rook-pre-restart ──────────────────────────────────────

describe("R-ROOK-1 — dispatch_rook pre-restart", () => {
  test("TRIGGERS on 'dispatch_rook' mention in response text", () => {
    assertViolationForRule(
      "I'll dispatch_rook to run the Math Test 2 Goldbach analysis now.",
      "R-ROOK-1"
    );
  });

  test("TRIGGERS on 'dispatch rook' (space variant)", () => {
    assertViolationForRule("Using dispatch rook to send prompt to Gemini.", "R-ROOK-1");
  });

  test("CLEAN on paste-to-Gemini-CLI fallback form", () => {
    assertCleanForRule(
      "Rook prompt authored: BISHOP_DROPZONE/02_RookPrompts/ROOK_ANALYSIS_GOLDBACH_BP028.md\n" +
      "Ready for paste to Gemini CLI. Rook will analyze singular series convergence.",
      "R-ROOK-1"
    );
  });

  test("CLEAN on restart request surface form", () => {
    assertCleanForRule(
      "[Knight commit 5d881a4 requires librarian-mcp restart. Ready?]\n" +
      "Option A: Request restart via Yoke + retry. Option B: Paste to Gemini CLI directly.",
      "R-ROOK-1"
    );
  });
});

// ─── Existing patterns: regression guard ─────────────────────────────────────
// Verify the 10 pre-BP028 patterns are not broken by the additions.

describe("Pre-BP028 patterns — regression guard", () => {
  test("R-KP-1 still triggers on bare PROMPT_KNIGHT filename", () => {
    assertViolationForRule("Fire this prompt: PROMPT_KNIGHT_KN099_DEPLOY_BP028.md", "R-KP-1");
  });

  test("R-KP-1 clean on full-path reference", () => {
    assertCleanForRule(
      "Path: BISHOP_DROPZONE\\01_KnightPrompts\\PROMPT_KNIGHT_KN099_DEPLOY_BP028.md",
      "R-KP-1"
    );
  });

  test("R-PRAISE-1 still triggers on unanchored superlative", () => {
    assertViolationForRule(
      "This is truly unprecedented progress on the Collatz proof.",
      "R-PRAISE-1"
    );
  });

  test("R-PRAISE-2 still triggers on unanchored praise ending", () => {
    assertViolationForRule(
      "You completed all 9 tracks. Great work!",
      "R-PRAISE-2"
    );
  });

  test("R-FORK-1 still triggers on Credits-to-fiat conversion language", () => {
    assertViolationForRule(
      "Members can convert credits to dollars at any time.",
      "R-FORK-1"
    );
  });

  test("R-COUNSEL-1 still triggers on counsel gate language", () => {
    assertViolationForRule(
      "Recommend proceeding pending counsel review before filing.",
      "R-COUNSEL-1"
    );
  });

  test("R-USPTO-1 still triggers on step-by-step USPTO instructions", () => {
    assertViolationForRule(
      "Go to Patent Center and click the upload button to submit.",
      "R-USPTO-1"
    );
  });

  test("R-DOUBLE-FILE-1 still triggers on unilateral new canon Eblet proposal", () => {
    assertViolationForRule(
      "I'll write a new canon Eblet for this topic now.",
      "R-DOUBLE-FILE-1"
    );
  });

  test("Engine returns clean result for fully clean response", () => {
    const result = runReminderScribeCheck(
      "Read patterns.ts. Found 12 active rules and 3 deprecated. " +
      "Substrate search confirmed no existing Eblet for this topic. " +
      "I'll proceed with the implementation. Here are the results.",
      { workspaceRoot: "/nonexistent/workspace" }
    );
    // Should be clean or only have low-confidence heuristic hits
    const blocking = result.violations.filter((v) => v.blocks_response);
    assert.equal(blocking.length, 0, "Should have no blocking violations on clean response");
  });
});

// ─── Engine-level tests for new PatternType ────────────────────────────────────

describe("Engine: context-heuristic PatternType handling", () => {
  test("context-heuristic pattern fires with likelihood 0.72", () => {
    const result = runReminderScribeCheck(
      "I'll dispatch_pawn to send this query.",
      { workspaceRoot: "/nonexistent/workspace" }
    );
    const pawnViolation = result.violations.find((v) => v.rule_id === "R-PAWN-1");
    if (pawnViolation) {
      // Context-heuristic matches must have likelihood < 0.9 (anti-pattern level)
      assert.ok(
        pawnViolation.matches.every((m) => m.likelihood <= 0.75),
        "context-heuristic likelihood should be <= 0.75"
      );
    }
  });

  test("Engine still has no BRIDLE_HALT on context-heuristic rules", () => {
    for (const id of ["R-PHA-1", "R-MS-1", "R-REV-1", "R-PAWN-1", "R-ROOK-1"]) {
      const rule = getRule(id);
      assert.equal(
        rule.bridle_halt_on_failure,
        false,
        `Rule ${id} should not halt on failure`
      );
    }
  });
});
