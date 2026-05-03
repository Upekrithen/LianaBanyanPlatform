/**
 * KN-M2 Joules Operations — T1-T7 test suite
 * =============================================
 * Tests: mintFromMarksSurplus, transfer, redeem, backing rule lookup,
 * ONE-WAY VALVE preserved, full round-trip with provenance.
 */

import { strictEqual, ok } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import { JoulesOperations } from "../dist/joules/operations.js";
import { computeBalance, isInCirculation } from "../dist/joules/balance.js";
import { assertForeverStampInvariant } from "../dist/joules/ledger.js";
import { withStatsCapture } from "../dist/stats_capture/harness.js";

const ops = new JoulesOperations();

// ─── T1: mintFromMarksSurplus succeeds when Marks surplus available ────────────

test("T1: mintFromMarksSurplus succeeds when Marks surplus available", async () => {
  await withStatsCapture({
    test_id: "knm2_t1",
    test_file: "test_joules_operations_knm2.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_mint_success" });

    const member = `member_${randomUUID().slice(0, 8)}`;
    const result = await ops.mintFromMarksSurplus({
      member_id: member,
      marks_surplus: 500,
      backing_rule_id: "LB-GOLD-STUB-001",
    });

    ok(result.success, `mint should succeed: ${result.error}`);
    ok(result.entry, "entry should be returned");
    strictEqual(result.entry.tx_type, "mint");
    ok(result.face_value !== undefined && result.face_value > 0, "face_value should be positive");
    strictEqual(result.entry.mark_backing_rule_pointer, "LB-GOLD-STUB-001");
  });
});

// ─── T2: mint fails when Marks insufficient ──────────────────────────────────

test("T2: mint fails when marks_surplus <= 0", async () => {
  await withStatsCapture({
    test_id: "knm2_t2",
    test_file: "test_joules_operations_knm2.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_mint_fail_insufficient" });

    const result = await ops.mintFromMarksSurplus({
      member_id: "member_insufficient",
      marks_surplus: 0,
      backing_rule_id: "LB-GOLD-STUB-001",
    });

    ok(!result.success, "mint should fail with 0 marks_surplus");
    ok(result.error, "error message should be present");
  });
});

// ─── T3: Backing rule lookup correct (Gold tablet pointer resolves) ────────────

test("T3: backing rule lookup resolves non-empty pointer; empty pointer fails", async () => {
  await withStatsCapture({
    test_id: "knm2_t3",
    test_file: "test_joules_operations_knm2.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_backing_rule_lookup" });

    // Valid pointer
    const valid = await ops.mintFromMarksSurplus({
      member_id: "member_rule_test",
      marks_surplus: 100,
      backing_rule_id: "LB-GOLD-0042",
    });
    ok(valid.success, "valid backing_rule_id should succeed");

    // Empty pointer
    const invalid = await ops.mintFromMarksSurplus({
      member_id: "member_rule_test",
      marks_surplus: 100,
      backing_rule_id: "",
    });
    ok(!invalid.success, "empty backing_rule_id should fail");
  });
});

// ─── T4: Transfer between members succeeds ────────────────────────────────────

test("T4: transfer between members succeeds", async () => {
  await withStatsCapture({
    test_id: "knm2_t4",
    test_file: "test_joules_operations_knm2.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_transfer_success" });

    const alice = `alice_${randomUUID().slice(0, 6)}`;
    const bob   = `bob_${randomUUID().slice(0, 6)}`;

    const mintResult = await ops.mintFromMarksSurplus({
      member_id: alice,
      marks_surplus: 200,
      backing_rule_id: "LB-GOLD-STUB-002",
    });
    ok(mintResult.success);

    const transferResult = await ops.transfer({
      from: alice,
      to: bob,
      joule_uuid: mintResult.joule_uuid,
    });

    ok(transferResult.success, `transfer should succeed: ${transferResult.error}`);
    strictEqual(transferResult.entry.face_value, mintResult.face_value, "face_value preserved");
    strictEqual(transferResult.entry.tx_type, "transfer");
  });
});

// ─── T5: Redeem to civilization-class target succeeds ────────────────────────

test("T5: redeem to civilization-class target succeeds", async () => {
  await withStatsCapture({
    test_id: "knm2_t5",
    test_file: "test_joules_operations_knm2.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_redeem_success" });

    const member = `member_${randomUUID().slice(0, 8)}`;
    const mintResult = await ops.mintFromMarksSurplus({
      member_id: member,
      marks_surplus: 300,
      backing_rule_id: "LB-GOLD-STUB-003",
    });
    ok(mintResult.success);

    const redeemResult = await ops.redeem({
      member_id: member,
      joule_uuid: mintResult.joule_uuid,
      redemption_target: "Building the Liana Banyan Cathedral infrastructure",
    });

    ok(redeemResult.success, `redeem should succeed: ${redeemResult.error}`);
    ok(!isInCirculation(mintResult.joule_uuid), "Joule should no longer be in circulation");
  });
});

// ─── T6: Full mint → transfer → redeem cycle round-trips with provenance ──────

test("T6: full mint → transfer → redeem cycle round-trips with provenance", async () => {
  await withStatsCapture({
    test_id: "knm2_t6",
    test_file: "test_joules_operations_knm2.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_full_cycle_provenance" });

    const alice = `provenance_alice_${randomUUID().slice(0, 6)}`;
    const bob   = `provenance_bob_${randomUUID().slice(0, 6)}`;

    const mintResult = await ops.mintFromMarksSurplus({
      member_id: alice,
      marks_surplus: 400,
      backing_rule_id: "LB-GOLD-CYCLE-001",
    });
    ok(mintResult.success, "mint must succeed");
    const joule_uuid = mintResult.joule_uuid;

    const xferResult = await ops.transfer({ from: alice, to: bob, joule_uuid });
    ok(xferResult.success, "transfer must succeed");
    strictEqual(xferResult.entry.face_value, mintResult.face_value);

    const redeemResult = await ops.redeem({
      member_id: bob,
      joule_uuid,
      redemption_target: "Help each other help ourselves — civilization-class commons",
    });
    ok(redeemResult.success, "redeem must succeed");

    // Provenance: entry has mark_backing_rule_pointer
    ok(mintResult.entry.mark_backing_rule_pointer, "mint must carry backing rule pointer");
    // Forever-stamp invariant holds through full cycle
    assertForeverStampInvariant(joule_uuid); // does NOT throw (redeem entry has correct face_value)
  });
});

// ─── T7: ONE-WAY VALVE — Marks never recoverable from Joules ─────────────────

test("T7: ONE-WAY VALVE preserved — no cash-out-marks-from-joules function exists", async () => {
  await withStatsCapture({
    test_id: "knm2_t7",
    test_file: "test_joules_operations_knm2.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T7_one_way_valve" });

    // Structural absence check: JoulesOperations must NOT have cash-out / convert-to-marks methods
    const opsInstance = new JoulesOperations();
    ok(typeof opsInstance["cashOutToMarks"] === "undefined",
      "cashOutToMarks must not exist (structural absence / ONE-WAY VALVE)");
    ok(typeof opsInstance["convertToMarks"] === "undefined",
      "convertToMarks must not exist");
    ok(typeof opsInstance["redeemForMarks"] === "undefined",
      "redeemForMarks must not exist");

    // Verify mint deducts conceptually (minted_from_marks is tracked)
    const member = `valve_member_${randomUUID().slice(0, 6)}`;
    const result = await ops.mintFromMarksSurplus({
      member_id: member,
      marks_surplus: 1000,
      backing_rule_id: "LB-GOLD-VALVE-001",
    });
    ok(result.success);
    strictEqual(result.entry.minted_from_marks, 1000, "Marks consumed tracked in ledger");
    // No function exists to reverse this — ONE-WAY VALVE structural absence confirmed above
  });
});
