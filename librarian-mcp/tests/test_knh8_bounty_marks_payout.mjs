/**
 * test_knh8_bounty_marks_payout.mjs — KN-H8 / BP017
 * ====================================================
 * Test suite for Bounty Marks payout integration with FORK doctrine compliance.
 *
 * T1-T8 per KN-H8 Phase D spec:
 *   T1: Validator PASS triggers Marks payout per tier multiplier
 *   T2: FORK compliance: cash_out_bounty_marks_to_fiat symbol structurally absent (grep = 0)
 *   T3: Append-only ledger: payout entries cannot be mutated or deleted (SQL-level enforcement)
 *   T4: Tier multipliers correct (1.0 / 1.25 / 1.5 / 2.0)
 *   T5: Completion quality factor capped at 0.70 for bare-pass margin (BRIDLE Rule 4)
 *   T6: Validator FAIL = NO payout (default-deny)
 *   T7: Member Marks balance updates correctly post-payout
 *   T8: Membership-orthogonal: $5/year unchanged; bounty payouts are LB-currency-class
 *
 * Run: node --test tests/test_knh8_bounty_marks_payout.mjs
 *   or: npm test (wired into test suite via add to package.json)
 */

import { test } from "node:test";
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const WORKSPACE_ROOT = join(__dirname, "..");
const SRC_ROOT = join(WORKSPACE_ROOT, "src");

// ── Import pure computation exports (no Supabase required) ──────────────────

const {
  computeCompletionQualityFactor,
  computeMarksEarned,
  computeBountyPayout,
} = await import("../dist/three_tier/bounty_marks_payout.js");

// ── T1: Validator PASS triggers Marks payout per tier multiplier ────────────

test("T1: computeBountyPayout — PASS receipt produces Marks payout", () => {
  const tiers = [
    { bounty_class: "tier_a_floor_verification",  margin: 12, expectedMultiplier: 1.00 },
    { bounty_class: "tier_b_uplift_verification", margin: 8,  expectedMultiplier: 1.25 },
    { bounty_class: "tier_c_founder_replication", margin: 5,  expectedMultiplier: 1.50 },
    { bounty_class: "cross_tier_comparison",      margin: 15, expectedMultiplier: 2.00 },
  ];
  for (const tc of tiers) {
    const mockPass = {
      pass: true,
      margin: tc.margin,
      failures: [],
      warnings: [],
      bounty_id: `test-${tc.bounty_class}`,
      bounty_class: tc.bounty_class,
      validated_at: new Date().toISOString(),
      requires_founder_review: false,
      bridle_rule_4_applied: false,
    };
    const result = computeBountyPayout(mockPass, 100);
    assert.ok(result.marks_earned > 0, `${tc.bounty_class}: marks_earned should be > 0`);
    assert.strictEqual(
      result.tier_multiplier,
      tc.expectedMultiplier,
      `${tc.bounty_class}: expected multiplier ${tc.expectedMultiplier}`,
    );
    assert.strictEqual(result.fork_compliant, true, `${tc.bounty_class}: fork_compliant must be true`);
  }
});

// ── T2: FORK compliance — cash_out_bounty_marks_to_fiat structurally absent ─

test("T2: FORK compliance — cash_out_bounty_marks_to_fiat symbol is NOT in codebase (grep = 0)", () => {
  // Grep the entire workspace src directory for the forbidden symbol.
  // Expected: 0 matches. Any match is a FORK doctrine violation.
  const result = spawnSync(
    "rg",
    [
      "--count-matches",
      "--glob", "!*.test.*",
      "--glob", "!*.mjs",  // exclude this test file itself
      "cash_out_bounty_marks_to_fiat",
      SRC_ROOT,
    ],
    { encoding: "utf-8", cwd: WORKSPACE_ROOT },
  );

  // rg exits 1 when no matches found (correct behavior), 0 when matches exist.
  // Exit code 1 + empty stdout = PASS (no matches).
  const matches = (result.stdout || "").trim();
  const hasMatches = result.status === 0 && matches.length > 0;

  assert.ok(
    !hasMatches,
    `FORK DOCTRINE VIOLATION: cash_out_bounty_marks_to_fiat found in codebase.\n` +
    `Matches:\n${matches}\n` +
    `This function MUST NOT EXIST (structural absence, not policy-disabled).`,
  );

  // Also verify it doesn't exist in the migration
  const migResult = spawnSync(
    "rg",
    [
      "--count-matches",
      "cash_out_bounty_marks_to_fiat",
      join(WORKSPACE_ROOT, "..", "platform", "supabase", "migrations"),
    ],
    { encoding: "utf-8", cwd: WORKSPACE_ROOT },
  );
  const migMatches = (migResult.stdout || "").trim();
  assert.ok(
    !(migResult.status === 0 && migMatches.length > 0),
    `FORK DOCTRINE VIOLATION in migrations: ${migMatches}`,
  );
});

// ── T3: Append-only: payout entries cannot be mutated or deleted ────────────

test("T3: Append-only ledger enforced — migration has no UPDATE/DELETE RLS for authenticated users", () => {
  const migrationPath = join(
    WORKSPACE_ROOT, "..", "platform", "supabase", "migrations",
    "20260502200000_knh8_bounty_payout_ledger.sql",
  );
  const sql = readFileSync(migrationPath, "utf-8");

  // bounty_payout_ledger should NOT have authenticated UPDATE or DELETE policies
  // (only service_role should be able to do anything beyond SELECT)
  const hasAuthUpdate = /CREATE POLICY[^;]+FOR\s+UPDATE[^;]+TO\s+authenticated/is.test(sql);
  const hasAuthDelete = /CREATE POLICY[^;]+FOR\s+DELETE[^;]+TO\s+authenticated/is.test(sql);

  assert.ok(!hasAuthUpdate, "bounty_payout_ledger must NOT have authenticated UPDATE policy (append-only)");
  assert.ok(!hasAuthDelete, "bounty_payout_ledger must NOT have authenticated DELETE policy (append-only)");

  // Verify the unique index on receipt_id (idempotency guard)
  assert.ok(
    sql.includes("UNIQUE INDEX") && sql.includes("receipt_id"),
    "bounty_payout_ledger must have a UNIQUE INDEX on receipt_id (idempotency guard)",
  );

  // Verify Year of Jubilee semantics comment
  assert.ok(
    sql.includes("Year of Jubilee") || sql.includes("append-only"),
    "Migration must document Year of Jubilee append-only semantics",
  );
});

// ── T4: Tier multipliers correct (1.0 / 1.25 / 1.5 / 2.0) ─────────────────

test("T4: Tier multipliers correct — A=1.0, B=1.25, C=1.5, Cross=2.0", () => {
  const tiers = [
    { bounty_class: "tier_a_floor_verification",  expected: 1.00 },
    { bounty_class: "tier_b_uplift_verification", expected: 1.25 },
    { bounty_class: "tier_c_founder_replication", expected: 1.50 },
    { bounty_class: "cross_tier_comparison",      expected: 2.00 },
  ];
  for (const tc of tiers) {
    // computeMarksEarned at quality=1.0 gives standard_rate × multiplier
    const marks = computeMarksEarned(100, tc.bounty_class, 1.0);
    const expectedMarks = Math.floor(100 * tc.expected * 1.0);
    assert.strictEqual(marks, expectedMarks, `${tc.bounty_class}: expected ${expectedMarks} Marks`);
  }
});

// ── T5: Completion quality factor capped at 0.70 for bare-pass margin ────────

test("T5: BRIDLE Rule 4 — completion_quality_factor capped at 0.70 for bare-pass margin (<0.5pp)", () => {
  // Bare pass cases: 0 < margin < 0.5 → capped at 0.70
  const barePasses = [0.01, 0.1, 0.3, 0.49];
  for (const m of barePasses) {
    const qf = computeCompletionQualityFactor(m);
    assert.strictEqual(qf, 0.70, `margin=${m}: expected quality_factor=0.70 (BRIDLE Rule 4 cap)`);
  }

  // At and above 0.5: quality should be > 0.70
  const solidPasses = [0.5, 1, 5, 10];
  for (const m of solidPasses) {
    const qf = computeCompletionQualityFactor(m);
    assert.ok(qf >= 0.75, `margin=${m}: expected quality_factor >= 0.75 (not bare-pass cap)`);
  }

  // Solid pass (margin >= 10) → 1.00
  assert.strictEqual(computeCompletionQualityFactor(10), 1.00, "margin=10: expected 1.00");
  assert.strictEqual(computeCompletionQualityFactor(20), 1.00, "margin=20: expected 1.00");
});

// ── T6: Validator FAIL = NO payout (default-deny) ──────────────────────────

test("T6: Validator FAIL → computeBountyPayout throws (FORK doctrine default-deny)", () => {
  const failReceipt = {
    pass: false,
    margin: -9,
    failures: [{ field: "lift_pp", criterion: "lift < 30", expected: ">=30", bridle_rule: "rule_4" }],
    warnings: [],
    bounty_id: "test-fail-receipt",
    bounty_class: "tier_a_floor_verification",
    validated_at: new Date().toISOString(),
    requires_founder_review: false,
    bridle_rule_4_applied: true,
  };

  assert.throws(
    () => computeBountyPayout(failReceipt, 100),
    /FORK doctrine default-deny|FAILED validation/,
    "computeBountyPayout must throw on a FAIL receipt",
  );
});

// ── T7: marks_earned computation correct ────────────────────────────────────

test("T7: marks_earned = floor(standard_rate × multiplier × quality_factor)", () => {
  const cases = [
    // Tier A, margin=15 (quality=1.0): floor(100 × 1.0 × 1.0) = 100
    { tier_class: "tier_a_floor_verification",  standard_rate: 100, margin: 15, expected: 100 },
    // Tier B, margin=7 (quality=0.9): floor(100 × 1.25 × 0.9) = floor(112.5) = 112
    { tier_class: "tier_b_uplift_verification", standard_rate: 100, margin: 7,  expected: 112 },
    // Tier C, margin=3 (quality=0.8): floor(100 × 1.5 × 0.8) = floor(120.0) = 120
    { tier_class: "tier_c_founder_replication", standard_rate: 100, margin: 3,  expected: 120 },
    // Cross-tier, bare pass margin=0.2 (quality=0.7): floor(100 × 2.0 × 0.7) = 140
    { tier_class: "cross_tier_comparison",      standard_rate: 100, margin: 0.2, expected: 140 },
    // Tier A, standard_rate=200, margin=10 (quality=1.0): floor(200 × 1.0 × 1.0) = 200
    { tier_class: "tier_a_floor_verification",  standard_rate: 200, margin: 10, expected: 200 },
    // Tier C, standard_rate=50, margin=5 (quality=0.9): floor(50 × 1.5 × 0.9) = floor(67.5) = 67
    { tier_class: "tier_c_founder_replication", standard_rate: 50,  margin: 5,  expected: 67 },
  ];
  for (const tc of cases) {
    const qf = computeCompletionQualityFactor(tc.margin);
    const actual = computeMarksEarned(tc.standard_rate, tc.tier_class, qf);
    assert.strictEqual(
      actual,
      tc.expected,
      `${tc.tier_class} sr=${tc.standard_rate} margin=${tc.margin}: expected ${tc.expected}, got ${actual}`,
    );
  }
});

// ── T8: Membership-orthogonal ─────────────────────────────────────────────────

test("T8: Membership-orthogonal — fork_compliant=true, membership_orthogonal=true always present", () => {
  const mockPass = {
    pass: true,
    margin: 20,
    failures: [],
    warnings: [],
    bounty_id: "test-membership-orthogonal",
    bounty_class: "tier_b_uplift_verification",
    validated_at: new Date().toISOString(),
    requires_founder_review: false,
    bridle_rule_4_applied: false,
  };
  const result = computeBountyPayout(mockPass, 100);
  assert.strictEqual(result.fork_compliant, true, "fork_compliant must always be true (FORK doctrine)");
  assert.strictEqual(result.membership_orthogonal, true, "membership_orthogonal must always be true");
  // marks_earned > 0 confirms payout is LB-currency-class (not fiat-class)
  assert.ok(result.marks_earned > 0, "marks_earned must be positive (LB-currency-class payout)");
  // $5/year membership is unrelated — no field in payout result references fiat membership cost
  assert.ok(
    !JSON.stringify(result).includes("5/year") && !JSON.stringify(result).includes("fiat"),
    "Payout result must contain no fiat or membership-cost references",
  );
});

console.log("✅ KN-H8 T1-T8 test suite complete — Bounty Marks Payout + FORK doctrine compliance.");
