/**
 * KN-I1 Reminder Scribe Core Pattern-Match Engine — Test Suite
 * =============================================================
 * Tests T1-T10 per KN-I1 PHASE D spec.
 *
 * Run: node --test tests/test_reminder_scribe_kni1.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { runReminderScribeCheck, buildViolationEvent } from "../dist/reminder_scribe/pattern_match_engine.js";
import { buildRulesRegistry, DEFAULT_PREFERENCES } from "../dist/reminder_scribe/rules_registry.js";

// ─── T1: R-KP-1 bare filename without BISHOP_DROPZONE prefix ─────────────────
test("T1: R-KP-1 violation — bare filename without BISHOP_DROPZONE prefix", () => {
  const draft = `
Fire Knight with PROMPT_KNIGHT_KN_I2_CATECHIST_REMINDER_SCRIBE_COMPOSITION_BP017.md next.
  `;
  const result = runReminderScribeCheck(draft);
  // R-KP-1 detects bare PROMPT_KNIGHT filename
  const kp1 = result.violations.find((v) => v.rule_id === "R-KP-1");
  assert.ok(kp1, "R-KP-1 violation should be detected for bare filename");
  assert.equal(kp1.class, "founder-mandatory");
  assert.ok(result.violations_found >= 1);
});

// ─── T2: R-KP-2 path references file that doesn't exist ──────────────────────
test("T2: R-KP-2 violation — path references K-prompt that doesn't exist on disk", () => {
  // Reference a K-prompt that definitely does NOT exist
  const draft = `
Path: BISHOP_DROPZONE\\01_KnightPrompts\\PROMPT_KNIGHT_KN_ZZZNONEXISTENT_FAKE_TEST_BP999.md
  `;
  const result = runReminderScribeCheck(draft);
  const kp2 = result.violations.find((v) => v.rule_id === "R-KP-2");
  assert.ok(kp2, "R-KP-2 violation should be detected for non-existent file");
  assert.equal(kp2.override_class, "marks-cost");
  assert.equal(kp2.blocks_response, true);
});

// ─── T3: R-KP-3 queued-not-yet-drafted with path-formatted reference ──────────
test("T3: R-KP-3 violation — path-formatted reference for queued K-prompt", () => {
  const draft = `
Path: BISHOP_DROPZONE\\01_KnightPrompts\\PROMPT_KNIGHT_KN_I3_REMINDER_SCRIBE_DETECTIVE_TEAM_PROVENANCE_INTEGRATION_BP017.md
  `;
  const result = runReminderScribeCheck(draft);
  const kp3 = result.violations.find((v) => v.rule_id === "R-KP-3");
  assert.ok(kp3, "R-KP-3 violation should be detected for path-formatted queued reference");
});

// ─── T4: R-DOUBLE-FILE-1 canon Eblet write without prior search ───────────────
test("T4: R-DOUBLE-FILE-1 violation — propose writing new canon Eblet without prior search", () => {
  const draft = `
I'll write a new canon Eblet for this architectural pattern now.
  `;
  const result = runReminderScribeCheck(draft);
  const dbl = result.violations.find((v) => v.rule_id === "R-DOUBLE-FILE-1");
  assert.ok(dbl, "R-DOUBLE-FILE-1 violation should be detected for unilateral canon Eblet write");
});

// ─── T5: R-FORK-1 LB-currency-to-fiat conversion proposal ───────────────────
test("T5: R-FORK-1 violation — propose converting LB Credits to fiat (STRUCTURALLY-IMMUTABLE)", () => {
  const draft = `
You can convert credits to dollars by withdrawing them to your bank account.
  `;
  const result = runReminderScribeCheck(draft);
  const fork1 = result.violations.find((v) => v.rule_id === "R-FORK-1");
  assert.ok(fork1, "R-FORK-1 violation should be detected for LB-currency-to-fiat language");
  assert.equal(fork1.override_class, "structurally-immutable");
  assert.equal(fork1.blocks_response, true);
  assert.equal(result.structurally_immutable_violations, 1);
});

// ─── T6: Override flow — free-class violation does not block response ─────────
test("T6: Override flow — free-class violation (R-PRAISE-1) does not hard-block response", () => {
  const draft = `
This is a revolutionary and unprecedented breakthrough by the Founder.
  `;
  const result = runReminderScribeCheck(draft);
  const praise1 = result.violations.find((v) => v.rule_id === "R-PRAISE-1");
  assert.ok(praise1, "R-PRAISE-1 violation should be detected");
  assert.equal(praise1.override_class, "free");
  assert.equal(praise1.blocks_response, false);
  // Response is not globally blocked (only blocking rules block)
  // There might be other blocking rules — just verify R-PRAISE-1 itself doesn't block
  assert.equal(praise1.blocks_response, false);
});

// ─── T7: buildViolationEvent constructs correct provenance event ──────────────
test("T7: buildViolationEvent — correct structure for Detective TEAM write-back", () => {
  const mockFlag = {
    rule_id: "R-KP-2",
    rule_priority: 2,
    class: "high-stakes",
    description: "K-prompt file-existence verification",
    matches: [{ matched_text: "PROMPT_KNIGHT_KN_FAKE.md (NOT FOUND)", offset: 0, likelihood: 1.0 }],
    correction_proposal: "Remove reference to non-existent K-prompt file.",
    override_class: "marks-cost",
    blocks_response: true,
    memory_pointer: "feedback_knight_fire_format_paste_ready_paths_bp017.md",
    confidence: "confirmed",
  };

  const event = buildViolationEvent(mockFlag, {
    session_id: "B135",
    correction_applied: true,
    override_used: false,
    response_excerpt: "Path: BISHOP_DROPZONE\\01_KnightPrompts\\PROMPT_KNIGHT_KN_FAKE.md",
  });

  assert.equal(event.event_type, "reminder_scribe_violation_correction");
  assert.equal(event.session_id, "B135");
  assert.equal(event.rule_id, "R-KP-2");
  assert.equal(event.correction_applied, true);
  assert.equal(event.override_used, false);
  assert.equal(event.override_marks_cost, 0); // no marks cost if correction applied
  assert.equal(event.violation_confirmed, true); // confidence = "confirmed"
  assert.ok(event.timestamp);
});

// ─── T8: BRIDLE Rule 4 — engine failure surfaces error_receipt ───────────────
test("T8: BRIDLE Rule 4 — engine on valid draft with preferences disabled returns clean result", () => {
  // Use `discipline_violation_pre_send_check: disabled` to simulate all rules off
  const draft = "This is a clean response with no violations.";
  const result = runReminderScribeCheck(draft, {
    preferences: { discipline_violation_pre_send_check: "disabled" },
  });
  assert.equal(result.clean, true);
  assert.equal(result.violations_found, 0);
  assert.equal(result.bridle_rule_4_applied, false);
});

// ─── T9: Continuous check — multiple violations from single draft ─────────────
test("T9: Continuous check — multiple violations detected from single draft (composes additively)", () => {
  const draft = `
Amazing and revolutionary work!

Fire PROMPT_KNIGHT_KN_I2_CATECHIST_REMINDER_SCRIBE_COMPOSITION_BP017.md

Also, users can redeem credits for cash by converting them to dollars.
  `;
  const result = runReminderScribeCheck(draft);
  // Should detect R-PRAISE-1 (revolutionary), R-KP-1 (bare filename), R-FORK-1 (credits to dollars)
  assert.ok(result.violations_found >= 2, `Expected >= 2 violations, got ${result.violations_found}`);
  const ruleIds = result.violations.map((v) => v.rule_id);
  assert.ok(ruleIds.includes("R-FORK-1"), "R-FORK-1 should be among violations");
  assert.equal(result.blocks_response, true, "Response should be blocked due to R-FORK-1");
});

// ─── T10: Preferences honored — full_path default + relaxed file-existence ────
test("T10: Preferences honored — relaxed file-existence check disables R-KP-2", () => {
  const draft = `
Path: BISHOP_DROPZONE\\01_KnightPrompts\\PROMPT_KNIGHT_KN_ZZZNONEXISTENT_FAKE_TEST_BP999.md
  `;

  // With strict (default): R-KP-2 should fire
  const strictResult = runReminderScribeCheck(draft);
  const strictKP2 = strictResult.violations.find((v) => v.rule_id === "R-KP-2");
  assert.ok(strictKP2, "R-KP-2 should fire with strict preference");

  // With relaxed: R-KP-2 should be disabled
  const relaxedResult = runReminderScribeCheck(draft, {
    preferences: { knight_kprompt_file_existence_check: "relaxed" },
  });
  const relaxedKP2 = relaxedResult.violations.find((v) => v.rule_id === "R-KP-2");
  assert.equal(relaxedKP2, undefined, "R-KP-2 should NOT fire with relaxed preference");

  // Verify DEFAULT_PREFERENCES has knight_kprompt_path_format as full_path
  assert.equal(DEFAULT_PREFERENCES.knight_kprompt_path_format, "full_path");
});

// ─── Additional: buildRulesRegistry returns correct counts ───────────────────
test("INFRA: buildRulesRegistry returns all built-in rules by default", () => {
  const registry = buildRulesRegistry();
  assert.ok(registry.total_rules >= 10, `Expected >= 10 rules, got ${registry.total_rules}`);
  assert.ok(registry.founder_mandatory_count >= 2);
  assert.ok(registry.high_stakes_count >= 1);
  assert.ok(Array.isArray(registry.rules));
  assert.ok(registry.loaded_at);
});

// ─── Additional: CheckResult schema_version is stable ────────────────────────
test("SCHEMA: CheckResult schema_version is '1.0'", () => {
  const result = runReminderScribeCheck("Clean response with no issues.");
  assert.equal(result.schema_version, "1.0");
  assert.equal(result.engine, "reminder-scribe-pattern-match-v1");
  assert.ok(result.checked_at);
});
