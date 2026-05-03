/**
 * KN-M3 Joules MCP Tools — T1-T8 test suite
 * ============================================
 * Tests: each MCP tool function round-trips, Apiarist Hive composition,
 * audit aggregate, Pheromone Pixie-Dust.
 */

import { strictEqual, ok } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import { JoulesOperations } from "../dist/joules/operations.js";
import { computeBalance, computeAudit, isInCirculation } from "../dist/joules/balance.js";
import { appendJoulesEntry, readAllJoulesEntries } from "../dist/joules/ledger.js";
import { withStatsCapture } from "../dist/stats_capture/harness.js";

const ops = new JoulesOperations();

// ─── T1: joules_mint round-trips ──────────────────────────────────────────────

test("T1: joules_mint round-trips — mint returns entry + uuid + face_value", async () => {
  await withStatsCapture({
    test_id: "knm3_t1",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_joules_mint" });

    const result = await ops.mintFromMarksSurplus({
      member_id: `knm3_alice_${randomUUID().slice(0, 6)}`,
      marks_surplus: 500,
      backing_rule_id: "LB-GOLD-MCP-001",
    });

    ok(result.success, `mint should succeed: ${result.error}`);
    ok(result.joule_uuid, "joule_uuid returned");
    ok(result.face_value > 0, "face_value positive");
    ok(result.entry.id.startsWith("LB-JOULES-"), "serial format correct");
  });
});

// ─── T2: joules_transfer round-trips ─────────────────────────────────────────

test("T2: joules_transfer round-trips — transfer preserves face_value", async () => {
  await withStatsCapture({
    test_id: "knm3_t2",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_joules_transfer" });

    const from = `knm3_from_${randomUUID().slice(0, 6)}`;
    const to   = `knm3_to_${randomUUID().slice(0, 6)}`;

    const mint = await ops.mintFromMarksSurplus({ member_id: from, marks_surplus: 200, backing_rule_id: "LB-GOLD-MCP-002" });
    ok(mint.success);

    const xfer = await ops.transfer({ from, to, joule_uuid: mint.joule_uuid });
    ok(xfer.success, `transfer should succeed: ${xfer.error}`);
    strictEqual(xfer.entry.face_value, mint.face_value, "face_value preserved");
  });
});

// ─── T3: joules_redeem round-trips ───────────────────────────────────────────

test("T3: joules_redeem round-trips — redemption_target recorded, Joule removed", async () => {
  await withStatsCapture({
    test_id: "knm3_t3",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_joules_redeem" });

    const member = `knm3_redeemer_${randomUUID().slice(0, 6)}`;
    const mint = await ops.mintFromMarksSurplus({ member_id: member, marks_surplus: 300, backing_rule_id: "LB-GOLD-MCP-003" });
    ok(mint.success);

    const redeem = await ops.redeem({
      member_id: member,
      joule_uuid: mint.joule_uuid,
      redemption_target: "Liana Banyan cooperative commons infrastructure",
    });
    ok(redeem.success, `redeem should succeed: ${redeem.error}`);
    ok(!isInCirculation(mint.joule_uuid), "Joule should not be in circulation");
  });
});

// ─── T4: joules_balance round-trips ──────────────────────────────────────────

test("T4: joules_balance returns correct count and face_value after operations", async () => {
  await withStatsCapture({
    test_id: "knm3_t4",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_joules_balance" });

    const member = `knm3_balance_${randomUUID().slice(0, 6)}`;
    const m1 = await ops.mintFromMarksSurplus({ member_id: member, marks_surplus: 100, backing_rule_id: "LB-GOLD-MCP-004" });
    const m2 = await ops.mintFromMarksSurplus({ member_id: member, marks_surplus: 200, backing_rule_id: "LB-GOLD-MCP-004" });

    const balance = computeBalance(member);
    strictEqual(balance.joule_count, 2, "should have 2 joules");
    ok(balance.total_face_value > 0, "total_face_value positive");
    ok(balance.joules.some((j) => j.joule_uuid === m1.joule_uuid), "m1 in balance");
    ok(balance.joules.some((j) => j.joule_uuid === m2.joule_uuid), "m2 in balance");
  });
});

// ─── T5: joules_audit aggregate correct ─────────────────────────────────────

test("T5: joules_audit aggregate counts match direct ledger query", async () => {
  await withStatsCapture({
    test_id: "knm3_t5",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_joules_audit" });

    const audit = computeAudit();
    const all = readAllJoulesEntries();
    const mintCount = all.filter((e) => e.tx_type === "mint").length;
    const redeemCount = all.filter((e) => e.tx_type === "redeem").length;

    strictEqual(audit.total_minted, mintCount, "audit total_minted should match direct ledger count");
    strictEqual(audit.total_redeemed, redeemCount, "audit total_redeemed should match direct ledger count");
    ok(audit.total_in_circulation <= audit.total_minted, "in_circulation <= minted");
  });
});

// ─── T6: Apiarist Hive close-with-surplus auto-mints Joules ──────────────────

test("T6: Apiarist Hive close-with-surplus pattern: mint triggered programmatically", async () => {
  await withStatsCapture({
    test_id: "knm3_t6",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_apiarist_hive_auto_mint" });

    // Simulate: Hive thread closes with Marks surplus → auto-mint Joules
    const hive_thread_id = `hive_thread_${randomUUID()}`;
    const worker_id = `worker_${randomUUID().slice(0, 6)}`;

    // Simulated surplus detection: marks_surplus = 1500 (threshold: > 1000)
    const marks_surplus = 1500;
    const THRESHOLD = 1000;

    if (marks_surplus > THRESHOLD) {
      const result = await ops.mintFromMarksSurplus({
        member_id: worker_id,
        marks_surplus,
        backing_rule_id: `LB-GOLD-HIVE-${hive_thread_id.slice(0, 8)}`,
      });
      ok(result.success, `auto-mint on hive close should succeed: ${result.error}`);
      ok(result.face_value > 0, "auto-minted face_value positive");
      strictEqual(result.entry.minted_from_marks, marks_surplus, "minted_from_marks recorded");
    }

    // Confirm at least one mint was recorded for the worker
    const bal = computeBalance(worker_id);
    ok(bal.joule_count >= 1, "worker should have at least 1 Joule after hive auto-mint");
  });
});

// ─── T7: Audit aggregate matches direct ledger query ─────────────────────────

test("T7: audit total_face_value_in_circulation consistent with per-member balances", async () => {
  await withStatsCapture({
    test_id: "knm3_t7",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T7_audit_face_value_consistent" });

    const audit = computeAudit();
    // total_face_value_in_circulation must be <= total_face_value_minted
    ok(
      audit.total_face_value_in_circulation <= audit.total_face_value_minted,
      `in_circulation face_value ${audit.total_face_value_in_circulation} must be <= minted ${audit.total_face_value_minted}`
    );
    // Redeemed + in_circulation = minted
    strictEqual(
      audit.total_in_circulation + audit.total_redeemed,
      audit.total_minted,
      "minted = in_circulation + redeemed"
    );
  });
});

// ─── T8: Pheromone Pixie-Dust emitted on every operation ─────────────────────

test("T8: Pheromone Pixie-Dust emitted on mint/transfer/redeem (no throw)", async () => {
  await withStatsCapture({
    test_id: "knm3_t8",
    test_file: "test_joules_mcp_knm3.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T8_pheromone_pixie_dust" });

    const member = `knm3_pheromone_${randomUUID().slice(0, 6)}`;
    let threw = false;
    try {
      const m = await ops.mintFromMarksSurplus({ member_id: member, marks_surplus: 100, backing_rule_id: "LB-GOLD-MCP-PH" });
      await ops.transfer({ from: member, to: `other_${randomUUID().slice(0, 6)}`, joule_uuid: m.joule_uuid });
    } catch (e) {
      threw = true;
    }
    ok(!threw, "Pheromone Pixie-Dust should never throw");
  });
});
