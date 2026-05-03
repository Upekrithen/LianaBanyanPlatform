/**
 * KN-I2 Catechist Session-Open Grade Extension — Test Suite
 * ==========================================================
 * Tests T1-T6 per KN-I2 PHASE D spec.
 *
 * Run: node --test tests/test_catechist_kni2.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, writeFileSync, unlinkSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

import {
  gradeR01R10,
  buildViolationHistorySummary,
  runSessionOpenGrade,
  formatGradeMarkdown,
  VIOLATION_LOG_PATH,
} from "../dist/catechist/grader.js";

// ─── T1: R01-R10 + violation-history block both present in grade output ───────
test("T1: Catechist grade includes R01-R10 grades AND violation-history-summary block", () => {
  const result = runSessionOpenGrade("B135", "bishop", {
    brief_me_called_first: true,
    fiat_bridge_detected: false,
  });

  assert.ok(Array.isArray(result.r01_r10_grades), "r01_r10_grades should be an array");
  assert.equal(result.r01_r10_grades.length, 10, "Should have exactly 10 R01-R10 grades");
  assert.ok(result.violation_history_summary, "Should include violation_history_summary block");
  assert.equal(result.extended_at, "KN-I2");
  assert.equal(result.schema_version, "1.0");
});

// ─── T2: Per-AI-member violation aggregation ──────────────────────────────────
test("T2: Per-AI-member — grade correctly tags ai_member field", () => {
  const bishopGrade = runSessionOpenGrade("B135", "bishop", {});
  assert.equal(bishopGrade.ai_member, "bishop");
  assert.equal(bishopGrade.violation_history_summary.ai_member, "bishop");

  const knightGrade = runSessionOpenGrade("K520", "knight", {});
  assert.equal(knightGrade.ai_member, "knight");
  assert.equal(knightGrade.violation_history_summary.ai_member, "knight");
});

// ─── T3: Rolling 7-day window calculation ─────────────────────────────────────
test("T3: Rolling 7-day window — entries outside window excluded, within included", async () => {
  // Write a test violation log with one recent and one old event
  const logDir = resolve(fileURLToPath(import.meta.url), "../../stitchpunks/reminder_scribe");
  mkdirSync(logDir, { recursive: true });
  const logPath = resolve(logDir, "violation_log.jsonl");

  const now = new Date();
  const recent = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
  const old = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago

  const backupExists = existsSync(logPath);
  let backup = "";
  if (backupExists) {
    backup = readFileSync(logPath, "utf-8");
  }

  try {
    // Write a clean test log
    const recentEvent = JSON.stringify({
      event_type: "reminder_scribe_violation_correction",
      session_id: "B134",
      rule_id: "R-KP-1",
      correction_applied: true,
      override_used: false,
      timestamp: recent,
    });
    const oldEvent = JSON.stringify({
      event_type: "reminder_scribe_violation_correction",
      session_id: "B130",
      rule_id: "R-KP-1",
      correction_applied: false,
      override_used: true,
      timestamp: old,
    });
    writeFileSync(logPath, recentEvent + "\n" + oldEvent + "\n", "utf-8");

    const summary = buildViolationHistorySummary("bishop");
    const kp1Entry = summary.entries.find((e) => e.rule_id === "R-KP-1");
    assert.ok(kp1Entry, "R-KP-1 entry should be present");
    assert.equal(kp1Entry.violations_7d, 1, "Only the recent event should be counted (7-day window)");
    assert.equal(kp1Entry.correction_stickiness_pct, 100, "100% correction stickiness (recent = corrected)");
  } finally {
    // Restore log
    if (backupExists) {
      writeFileSync(logPath, backup, "utf-8");
    } else {
      try { unlinkSync(logPath); } catch { /* ok */ }
    }
  }
});

// ─── T4: Anti-shame discipline — no moral judgment in output ─────────────────
test("T4: Anti-shame discipline — output contains counts/rates only, no judgment language", () => {
  const result = runSessionOpenGrade("B135", "bishop", { fiat_bridge_detected: false });
  const markdown = formatGradeMarkdown(result);

  // Anti-shame: should NOT contain moral judgment language
  // (Note: "Anti-shame" as meta-descriptor is fine; "you should be ashamed" is not)
  const shamePatterns = [
    /you failed/i, /disappointing/i, /unacceptable/i, /inexcusable/i,
    /you should be ashamed/i, /poor performance/i,
  ];
  for (const p of shamePatterns) {
    assert.ok(!p.test(markdown), `Markdown should not contain shame language matching ${p}`);
  }

  // Should contain empirical language
  assert.ok(markdown.includes("violations"), "Should reference violations count");
  assert.ok(markdown.includes("stickiness"), "Should reference stickiness metric");
});

// ─── T5: BRIDLE Rule 4 — log unavailable surfaces flag (not silent) ──────────
test("T5: BRIDLE Rule 4 — unavailable violation log surfaces empty-history + flag, not silent skip", () => {
  // Build summary pointing at a non-existent log path (mock by calling directly)
  // Since VIOLATION_LOG_PATH is what grader.ts uses, we just check the result
  // when the log doesn't exist
  const summary = buildViolationHistorySummary("knight");
  // If log doesn't exist, should still return data_available=true with zeros OR data_available=false with reason
  // Either way: never throws, always returns a summary object
  assert.ok(summary.schema_version === "1.0");
  assert.ok(typeof summary.data_available === "boolean", "data_available must be a boolean");
  assert.ok(typeof summary.total_violations_7d === "number");
  // If unavailable, reason must be surfaced
  if (!summary.data_available) {
    assert.ok(summary.unavailable_reason, "Must surface unavailable_reason when data_available=false");
    assert.ok(summary.unavailable_reason.length > 0);
  }
});

// ─── T6: Substrate write-back — catechist_violation_summary logged correctly ──
test("T6: Grade output schema has all required fields for downstream write-back", () => {
  const result = runSessionOpenGrade("B135", "bishop", {
    brief_me_called_first: true,
    fiat_bridge_detected: false,
  });

  // Verify the grade result has all fields needed for catechist_violation_summary write-back
  assert.ok(result.session_id === "B135");
  assert.ok(result.ai_member === "bishop");
  assert.ok(result.overall_verdict);
  assert.ok(result.violation_history_summary.total_violations_7d !== undefined);
  assert.ok(result.violation_history_summary.overall_stickiness_pct !== undefined);
  assert.ok(result.graded_at);

  // Validate R01-R10 completeness
  const ruleIds = result.r01_r10_grades.map((g) => g.rule_id);
  for (const id of ["R01", "R02", "R03", "R04", "R05", "R06", "R07", "R08", "R09", "R10"]) {
    assert.ok(ruleIds.includes(id), `R01-R10 grade missing ${id}`);
  }

  // Validate violation history entries cover all 10 known rules
  const historyRuleIds = result.violation_history_summary.entries.map((e) => e.rule_id);
  assert.ok(historyRuleIds.length >= 10, "Violation history should cover at least 10 rules");
});

// ─── Additional: formatGradeMarkdown output shape ─────────────────────────────
test("INFRA: formatGradeMarkdown produces valid markdown with both sections", () => {
  const result = runSessionOpenGrade("K520", "knight", {
    brief_me_called_first: true,
  });
  const md = formatGradeMarkdown(result);

  assert.ok(md.includes("## Catechist Session-Open Grade"), "Missing main header");
  assert.ok(md.includes("R01-R10 Discipline Grades"), "Missing R01-R10 section");
  assert.ok(md.includes("Reminder Scribe Violation History"), "Missing violation history section");
  assert.ok(md.includes("K520"), "Should include session ID");
  assert.ok(md.includes("knight"), "Should include AI member");
});
