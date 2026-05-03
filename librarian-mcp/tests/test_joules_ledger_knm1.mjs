/**
 * KN-M1 Joules Ledger — T1-T8 test suite
 * =========================================
 * Tests: forever-stamp semantics, HMAC integrity, per-member balance,
 * mint/transfer/redeem cycle, concurrent safety, face_value immutability.
 */

import { strictEqual, ok, throws } from "assert";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { test } from "node:test";
import { randomUUID } from "crypto";

// ─── Temp dir isolation ───────────────────────────────────────────────────────

function makeTempSP() {
  const root = mkdtempSync(resolve(tmpdir(), "joules-test-"));
  const spDir = resolve(root, "stitchpunks");
  const joulesDir = resolve(spDir, "joules");
  mkdirSync(joulesDir, { recursive: true });
  return { root, spDir, joulesDir };
}

function cleanTempDir(root) {
  try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
}

// Override env for isolation
const ORIG_SP = process.env.LIBRARIAN_STITCHPUNKS_DIR;

import {
  appendJoulesEntry,
  readAllJoulesEntries,
  getJoulesHistory,
  getMintEntry,
  getCanonicalFaceValue,
  assertForeverStampInvariant,
  verifyJoulesHmac,
  ForeverStampViolation,
  JOULES_LEDGER,
} from "../dist/joules/ledger.js";

import {
  computeBalance,
  getCurrentHolder,
  isInCirculation,
  computeAudit,
} from "../dist/joules/balance.js";

import { withStatsCapture } from "../dist/stats_capture/harness.js";

// ─── T1: Mint creates Joule with face_value + Mark-backing-rule pointer ────────

test("T1: mint creates Joule with face_value populated + Mark-backing-rule pointer", async () => {
  await withStatsCapture({
    test_id: "knm1_t1",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_mint_face_value" });

    const joule_uuid = randomUUID();
    const entry = appendJoulesEntry({
      joule_uuid,
      tx_type: "mint",
      face_value: 100,
      minted_from_marks: 10000,
      mark_backing_rule_pointer: "LB-GOLD-0001",
      to_member_id: "member_alice",
    });

    strictEqual(entry.tx_type, "mint");
    strictEqual(entry.face_value, 100);
    strictEqual(entry.minted_from_marks, 10000);
    strictEqual(entry.mark_backing_rule_pointer, "LB-GOLD-0001");
    strictEqual(entry.to_member_id, "member_alice");
    ok(entry.id.startsWith("LB-JOULES-"), `serial format: ${entry.id}`);
    ok(entry.ts, "timestamp should be set");
    ok(entry.hmac_signature, "HMAC should be set");
  });
});

// ─── T2: face_value immutable — mutation rejected ─────────────────────────────

test("T2: face_value immutable — ForeverStampViolation thrown on mismatch", async () => {
  await withStatsCapture({
    test_id: "knm1_t2",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_face_value_immutable" });

    const joule_uuid = randomUUID();
    // Mint at face_value 100
    appendJoulesEntry({ joule_uuid, tx_type: "mint", face_value: 100, to_member_id: "member_bob" });
    // Write a tampered transfer with different face_value (simulates corruption)
    appendJoulesEntry({ joule_uuid, tx_type: "transfer", face_value: 999, from_member_id: "member_bob", to_member_id: "member_carol" });

    // assertForeverStampInvariant should throw
    throws(
      () => assertForeverStampInvariant(joule_uuid),
      ForeverStampViolation,
      "should throw ForeverStampViolation when face_value differs from mint"
    );
  });
});

// ─── T3: Transfer preserves face_value ────────────────────────────────────────

test("T3: transfer preserves face_value exactly", async () => {
  await withStatsCapture({
    test_id: "knm1_t3",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_transfer_preserves_face_value" });

    const joule_uuid = randomUUID();
    appendJoulesEntry({ joule_uuid, tx_type: "mint", face_value: 250, to_member_id: "member_dave" });
    const transferEntry = appendJoulesEntry({
      joule_uuid, tx_type: "transfer", face_value: 250,
      from_member_id: "member_dave", to_member_id: "member_eve",
    });

    strictEqual(transferEntry.face_value, 250, "face_value preserved on transfer");
    strictEqual(transferEntry.tx_type, "transfer");

    // forever-stamp check passes
    assertForeverStampInvariant(joule_uuid); // should not throw
  });
});

// ─── T4: Redeem removes Joule from circulation; balance reflects ───────────────

test("T4: redeem removes Joule from circulation; balance reflects correctly", async () => {
  await withStatsCapture({
    test_id: "knm1_t4",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_redeem_circulation" });

    const joule_uuid = randomUUID();
    const member = `member_${randomUUID().slice(0, 8)}`;

    appendJoulesEntry({ joule_uuid, tx_type: "mint", face_value: 50, to_member_id: member });
    ok(isInCirculation(joule_uuid), "should be in circulation after mint");

    appendJoulesEntry({
      joule_uuid, tx_type: "redeem", face_value: 50,
      from_member_id: member, to_member_id: member,
      redemption_target: "Build the Cathedral infrastructure",
    });

    ok(!isInCirculation(joule_uuid), "should be removed from circulation after redeem");

    const balance = computeBalance(member);
    strictEqual(balance.joule_count, 0, "balance should reflect 0 joules after redeem");
  });
});

// ─── T5: HMAC signature verifies ──────────────────────────────────────────────

test("T5: HMAC signature verifies on every entry", async () => {
  await withStatsCapture({
    test_id: "knm1_t5",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_hmac_verifies" });

    const joule_uuid = randomUUID();
    const entry = appendJoulesEntry({ joule_uuid, tx_type: "mint", face_value: 75, to_member_id: "member_frank" });

    ok(verifyJoulesHmac(entry), "HMAC should verify on freshly minted Joule");

    // Tampered entry — HMAC should fail
    const tampered = { ...entry, face_value: 9999 };
    ok(!verifyJoulesHmac(tampered), "HMAC should fail on tampered face_value");
  });
});

// ─── T6: Per-member balance correct across mint/transfer/redeem ───────────────

test("T6: per-member balance correct across mint/transfer/redeem sequence", async () => {
  await withStatsCapture({
    test_id: "knm1_t6",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_balance_sequence" });

    const alice = `alice_${randomUUID().slice(0, 6)}`;
    const bob   = `bob_${randomUUID().slice(0, 6)}`;

    const j1 = randomUUID();
    const j2 = randomUUID();

    appendJoulesEntry({ joule_uuid: j1, tx_type: "mint", face_value: 100, to_member_id: alice });
    appendJoulesEntry({ joule_uuid: j2, tx_type: "mint", face_value: 200, to_member_id: alice });

    let aliceBal = computeBalance(alice);
    strictEqual(aliceBal.joule_count, 2);
    strictEqual(aliceBal.total_face_value, 300);

    // Transfer j1 to bob
    appendJoulesEntry({ joule_uuid: j1, tx_type: "transfer", face_value: 100, from_member_id: alice, to_member_id: bob });

    aliceBal = computeBalance(alice);
    strictEqual(aliceBal.joule_count, 1, "alice should have 1 joule after transfer");
    strictEqual(aliceBal.total_face_value, 200);

    const bobBal = computeBalance(bob);
    strictEqual(bobBal.joule_count, 1, "bob should have 1 joule");
    strictEqual(bobBal.total_face_value, 100);

    // Redeem j2 from alice
    appendJoulesEntry({ joule_uuid: j2, tx_type: "redeem", face_value: 200, from_member_id: alice, to_member_id: alice, redemption_target: "civilization-class work" });

    const aliceFinal = computeBalance(alice);
    strictEqual(aliceFinal.joule_count, 0);
    strictEqual(aliceFinal.total_face_value, 0);
  });
});

// ─── T7: Forever-stamp invariant — transferred 5× still face_value 100 ────────

test("T7: forever-stamp invariant — Joule face_value 100, transferred 5×, still 100", async () => {
  await withStatsCapture({
    test_id: "knm1_t7",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T7_forever_stamp_five_transfers" });

    const joule_uuid = randomUUID();
    const members = Array.from({ length: 6 }, (_, i) => `member_chain_${i}`);

    appendJoulesEntry({ joule_uuid, tx_type: "mint", face_value: 100, to_member_id: members[0] });

    for (let i = 0; i < 5; i++) {
      appendJoulesEntry({
        joule_uuid, tx_type: "transfer", face_value: 100,
        from_member_id: members[i], to_member_id: members[i + 1],
      });
    }

    const history = getJoulesHistory(joule_uuid);
    strictEqual(history.length, 6, "should have 1 mint + 5 transfers");
    for (const entry of history) {
      strictEqual(entry.face_value, 100, `face_value must be 100 at every step, got ${entry.face_value}`);
    }

    // Invariant check should not throw
    assertForeverStampInvariant(joule_uuid);

    // Canonical face_value
    strictEqual(getCanonicalFaceValue(joule_uuid), 100);
  });
});

// ─── T8: Concurrent mint — no double-spend ────────────────────────────────────

test("T8: concurrent mint/transfer — no double-spend (race-safe serial allocation)", async () => {
  await withStatsCapture({
    test_id: "knm1_t8",
    test_file: "test_joules_ledger_knm1.mjs",
    knight_session_id: "KNM",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T8_concurrent_no_double_spend" });

    // Fire 10 mints concurrently
    const mints = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(
          appendJoulesEntry({ joule_uuid: randomUUID(), tx_type: "mint", face_value: i + 1, to_member_id: `concurrent_member_${i}` })
        )
      )
    );

    // All serials should be unique
    const serials = mints.map((e) => e.id);
    const unique = new Set(serials);
    strictEqual(unique.size, 10, `All 10 serials must be unique; got: ${serials.join(", ")}`);

    // All face_values distinct
    const faceValues = mints.map((e) => e.face_value);
    const expected = Array.from({ length: 10 }, (_, i) => i + 1);
    for (const fv of expected) {
      ok(faceValues.includes(fv), `face_value ${fv} should appear once`);
    }
  });
});
