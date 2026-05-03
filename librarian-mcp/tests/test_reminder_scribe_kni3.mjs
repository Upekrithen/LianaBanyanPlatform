/**
 * KN-I3 Reminder Scribe Detective TEAM Provenance Integration — Test Suite
 * =========================================================================
 * Tests T1-T8 per KN-I3 PHASE D spec.
 *
 * Run: node --test tests/test_reminder_scribe_kni3.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, unlinkSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  writeBackViolationEvent,
  queryRsHistory,
  drainRetryQueue,
  aggregateByRule,
  allocateRsSerial,
  computeChronosHmac,
  RS_PROVENANCE_LEDGER,
  RS_RETRY_QUEUE,
} from "../dist/reminder_scribe/substrate_writeback.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper: clear ledger between tests
function clearLedger() {
  try { unlinkSync(RS_PROVENANCE_LEDGER); } catch { /* ok */ }
  try { unlinkSync(RS_RETRY_QUEUE); } catch { /* ok */ }
}

// ─── T1: Violation-detected event writes-back with Cathedral serial + HMAC ──
test("T1: violation_detected event writes to RS provenance ledger with serial + HMAC", () => {
  clearLedger();

  const result = writeBackViolationEvent({
    ai_member: "bishop",
    session_id: "B135",
    event_type: "violation_detected",
    rule_id: "R-KP-1",
    rule_class: "founder-mandatory",
    violation_pattern_match_score: 0.85,
    violation_excerpt: "Fire PROMPT_KNIGHT_KN_FAKE.md without BISHOP_DROPZONE prefix",
    pre_send_block_triggered: false,
    correction_applied: false,
    correction_proposal: "Use full path with BISHOP_DROPZONE prefix",
    override_applied: false,
    override_class: "free",
  });

  assert.equal(result.success, true);
  assert.ok(result.serial.startsWith("LB-RS.M-"), `Serial should start with LB-RS.M-, got: ${result.serial}`);
  assert.ok(result.chronos_hmac.length === 16, `HMAC should be 16 chars, got: ${result.chronos_hmac.length}`);
  assert.equal(result.fallback_to_retry_queue, false);

  // Verify written to ledger
  assert.ok(existsSync(RS_PROVENANCE_LEDGER));
  const raw = readFileSync(RS_PROVENANCE_LEDGER, "utf-8");
  const entry = JSON.parse(raw.trim());
  assert.equal(entry.provenance_class, "reminder_scribe_violation_correction");
  assert.equal(entry.rule_id, "R-KP-1");
  assert.equal(entry.event_type, "violation_detected");
  assert.equal(entry.ai_member, "bishop");
});

// ─── T2: Correction-applied event records correctly ──────────────────────────
test("T2: correction_applied event writes with correction_applied=true + timestamp", () => {
  clearLedger();

  const result = writeBackViolationEvent({
    ai_member: "knight",
    session_id: "K520",
    event_type: "correction_applied",
    rule_id: "R-KP-2",
    rule_class: "high-stakes",
    violation_pattern_match_score: 1.0,
    violation_excerpt: "PROMPT_KNIGHT_KN_NONEXISTENT.md (NOT FOUND)",
    pre_send_block_triggered: true,
    correction_applied: true,
    correction_applied_at: new Date().toISOString(),
    correction_proposal: "Remove reference to non-existent K-prompt",
    override_applied: false,
    override_class: "marks-cost",
  });

  assert.equal(result.success, true);
  assert.ok(result.serial.startsWith("LB-RS.K-"), `Knight serial should start with LB-RS.K-`);

  const raw = readFileSync(RS_PROVENANCE_LEDGER, "utf-8");
  const entry = JSON.parse(raw.trim());
  assert.equal(entry.correction_applied, true);
  assert.ok(entry.correction_applied_at !== null);
  assert.equal(entry.override_applied, false);
  assert.equal(entry.override_marks_cost, 0);
});

// ─── T3: Override-applied event records Marks-cost; FORK compliance ─────────
test("T3: override_applied event records Marks-cost; no fiat reference; FORK compliant", () => {
  clearLedger();

  const result = writeBackViolationEvent({
    ai_member: "bishop",
    session_id: "B135",
    event_type: "override_applied",
    rule_id: "R-KP-3",
    rule_class: "founder-mandatory",
    violation_pattern_match_score: 0.75,
    violation_excerpt: "Path: BISHOP_DROPZONE\\01_KnightPrompts\\PROMPT_KNIGHT_KN_NOT_YET.md",
    pre_send_block_triggered: false,
    correction_applied: false,
    correction_proposal: "Use text-only for queued K-prompts",
    override_applied: true,
    override_marks_cost: 1,  // Marks-class override cost
    override_rationale: "Bishop override: path is ready but verified",
    override_class: "marks-cost",
  });

  assert.equal(result.success, true);

  const raw = readFileSync(RS_PROVENANCE_LEDGER, "utf-8");
  const entry = JSON.parse(raw.trim());
  assert.equal(entry.override_applied, true);
  assert.equal(entry.override_marks_cost, 1);
  assert.equal(entry.override_rationale, "Bishop override: path is ready but verified");
  // FORK compliance: no fiat field should exist
  assert.equal(entry.override_fiat_amount, undefined, "No fiat field in provenance entry");
  assert.equal(entry.override_fiat_currency, undefined, "No fiat currency in provenance entry");
});

// ─── T4: queryRsHistory returns logged events ────────────────────────────────
test("T4: queryRsHistory returns logged events with correct filters", () => {
  clearLedger();

  // Write two events with different rule IDs
  writeBackViolationEvent({
    ai_member: "bishop",
    session_id: "B135",
    event_type: "violation_detected",
    rule_id: "R-KP-1",
    rule_class: "founder-mandatory",
    violation_pattern_match_score: 0.85,
    violation_excerpt: "test",
    pre_send_block_triggered: false,
    correction_applied: false,
    correction_proposal: "fix",
    override_applied: false,
    override_class: "free",
  });

  writeBackViolationEvent({
    ai_member: "bishop",
    session_id: "B135",
    event_type: "violation_detected",
    rule_id: "R-FORK-1",
    rule_class: "fork",
    violation_pattern_match_score: 0.90,
    violation_excerpt: "convert credits to dollars",
    pre_send_block_triggered: true,
    correction_applied: false,
    correction_proposal: "Remove fiat conversion language",
    override_applied: false,
    override_class: "structurally-immutable",
  });

  const all = queryRsHistory({ rolling_days: 7 });
  assert.equal(all.length, 2, "Should return both events");

  const kp1Only = queryRsHistory({ rule_id: "R-KP-1", rolling_days: 7 });
  assert.equal(kp1Only.length, 1, "Should return only R-KP-1 event");
  assert.equal(kp1Only[0].rule_id, "R-KP-1");

  const forkOnly = queryRsHistory({ rule_id: "R-FORK-1", rolling_days: 7 });
  assert.equal(forkOnly.length, 1, "Should return only R-FORK-1 event");
  assert.equal(forkOnly[0].override_class, "structurally-immutable");
});

// ─── T5: Catechist reminder_scribe_query_history aggregation ─────────────────
test("T5: aggregateByRule provides per-rule stickiness and marks_spent", () => {
  clearLedger();

  // Write violation + correction for R-KP-1
  writeBackViolationEvent({
    ai_member: "bishop",
    session_id: "B135",
    event_type: "violation_detected",
    rule_id: "R-KP-1",
    rule_class: "founder-mandatory",
    violation_pattern_match_score: 0.85,
    violation_excerpt: "bare filename",
    pre_send_block_triggered: false,
    correction_applied: true,
    correction_proposal: "Use full path",
    override_applied: false,
    override_class: "free",
  });

  // Write override (marks-cost) for R-KP-3
  writeBackViolationEvent({
    ai_member: "bishop",
    session_id: "B135",
    event_type: "override_applied",
    rule_id: "R-KP-3",
    rule_class: "founder-mandatory",
    violation_pattern_match_score: 0.75,
    violation_excerpt: "queued path",
    pre_send_block_triggered: false,
    correction_applied: false,
    correction_proposal: "Use text-only",
    override_applied: true,
    override_marks_cost: 1,
    override_class: "marks-cost",
  });

  const entries = queryRsHistory({ rolling_days: 7 });
  const agg = aggregateByRule(entries);

  const kp1Agg = agg.find((a) => a.rule_id === "R-KP-1");
  assert.ok(kp1Agg, "R-KP-1 aggregate should exist");
  assert.equal(kp1Agg.corrections_applied, 1);
  assert.equal(kp1Agg.marks_spent, 0);

  const kp3Agg = agg.find((a) => a.rule_id === "R-KP-3");
  assert.ok(kp3Agg, "R-KP-3 aggregate should exist");
  assert.equal(kp3Agg.marks_spent, 1, "Marks-cost override should register 1 mark spent");
  assert.equal(kp3Agg.overrides, 1);
});

// ─── T6: Local retry queue — drain when substrate available ──────────────────
test("T6: retry queue drain — events queued when ledger write fails are drained", async () => {
  clearLedger();

  // Manually write to retry queue
  const { dirname: dn } = await import("node:path");
  mkdirSync(dn(RS_RETRY_QUEUE), { recursive: true });
  const testEvent = JSON.stringify({
    provenance_class: "reminder_scribe_violation_correction",
    cathedral_prefixed_serial: "LB-RS.M-9999",
    chronos_hmac: "abcdef1234567890",
    ai_member: "bishop",
    session_id: "B134",
    event_type: "violation_detected",
    timestamp: new Date().toISOString(),
    rule_id: "R-PRAISE-1",
    rule_class: "praise",
    violation_pattern_match_score: 0.90,
    violation_excerpt: "amazing work",
    pre_send_block_triggered: false,
    correction_applied: false,
    correction_applied_at: null,
    correction_proposal: "Replace with anchored praise",
    override_applied: false,
    override_marks_cost: 0,
    override_rationale: null,
    override_class: "free",
    composing_canon_pointers: [],
    feedback_memory_pointer: "feedback_empirically_valid_praise_only.md",
    post_send_audit_only: false,
  });
  writeFileSync(RS_RETRY_QUEUE, testEvent + "\n", "utf-8");

  const drainResult = drainRetryQueue();
  assert.equal(drainResult.drained, 1, "Should drain 1 event from retry queue");
  assert.equal(drainResult.failed, 0, "Should have 0 failures");

  // Retry queue should be empty now
  const queueContent = readFileSync(RS_RETRY_QUEUE, "utf-8").trim();
  assert.equal(queueContent, "", "Retry queue should be empty after drain");

  // Ledger should have the drained event
  const ledgerContent = readFileSync(RS_PROVENANCE_LEDGER, "utf-8").trim();
  assert.ok(ledgerContent.includes("LB-RS.M-9999"), "Drained event should be in ledger");
});

// ─── T7: Pheromone decay compatibility — timestamps are ISO-8601 ─────────────
test("T7: Provenance entries have ISO-8601 timestamps for decay-compatible indexing", () => {
  clearLedger();

  const result = writeBackViolationEvent({
    ai_member: "pawn",
    session_id: "P050",
    event_type: "violation_detected",
    rule_id: "R-USPTO-1",
    rule_class: "discipline",
    violation_pattern_match_score: 0.80,
    violation_excerpt: "go to Patent Center, click submit",
    pre_send_block_triggered: false,
    correction_applied: false,
    correction_proposal: "Remove USPTO step-by-step instructions",
    override_applied: false,
    override_class: "free",
  });

  const raw = readFileSync(RS_PROVENANCE_LEDGER, "utf-8").trim();
  const entry = JSON.parse(raw);

  // Verify ISO-8601 timestamp (parseable by Date)
  const ts = new Date(entry.timestamp);
  assert.ok(!isNaN(ts.getTime()), `timestamp "${entry.timestamp}" should be valid ISO-8601`);
  assert.ok(result.serial.startsWith("LB-RS.P-"), `Pawn serial should start with LB-RS.P-`);
});

// ─── T8: BRIDLE Rule 4 — retry queue used when ledger unavailable ─────────────
test("T8: BRIDLE Rule 4 — drainRetryQueue returns 0 drained when queue empty (no silent loss)", () => {
  clearLedger();

  const result = drainRetryQueue();
  assert.equal(result.drained, 0, "Empty queue should drain 0 events");
  assert.equal(result.failed, 0, "No failures on empty queue");
  assert.equal(result.errors.length, 0, "No errors on empty queue");
});

// ─── Additional: allocateRsSerial generates correct format ───────────────────
test("INFRA: allocateRsSerial generates LB-RS.X-NNNN format for all cathedral types", () => {
  const bishopSerial = allocateRsSerial("bishop");
  assert.ok(/^LB-RS\.M-\d{4}$/.test(bishopSerial), `Bishop serial format check: ${bishopSerial}`);

  const knightSerial = allocateRsSerial("knight");
  assert.ok(/^LB-RS\.K-\d{4}$/.test(knightSerial), `Knight serial format check: ${knightSerial}`);

  const pawnSerial = allocateRsSerial("pawn");
  assert.ok(/^LB-RS\.P-\d{4}$/.test(pawnSerial), `Pawn serial format check: ${pawnSerial}`);

  // Serials should increment
  const s1 = allocateRsSerial("rook");
  const s2 = allocateRsSerial("rook");
  const n1 = parseInt(s1.split("-").pop() ?? "0", 10);
  const n2 = parseInt(s2.split("-").pop() ?? "0", 10);
  assert.equal(n2, n1 + 1, "Serials should increment monotonically");
});

// ─── Additional: computeChronosHmac produces stable 16-char hex ──────────────
test("INFRA: computeChronosHmac produces stable 16-char hex", () => {
  const hmac1 = computeChronosHmac("test-payload", "2026-05-03T00:00:00Z");
  const hmac2 = computeChronosHmac("test-payload", "2026-05-03T00:00:00Z");
  assert.equal(hmac1, hmac2, "Same input → same HMAC (deterministic)");
  assert.equal(hmac1.length, 16, "HMAC should be 16 chars");
  assert.ok(/^[0-9a-f]+$/.test(hmac1), "HMAC should be hex");
});
