/**
 * KN-T1 Strata Schema — T1-T5 test suite
 * ==========================================
 * Tests: 7 strata enumerated, ordinals 0-6 monotonic, assignment round-trips,
 * promotion chain history, invalid stratum rejected.
 */

import { strictEqual, ok, throws, deepStrictEqual } from "assert";
import { test } from "node:test";

import {
  STRATUM_ORDINALS,
  ALL_STRATA,
  isValidStratum,
  readAllAssignments,
  writeAssignment,
  getAssignment,
} from "../dist/strata/schema.js";

import { withStatsCapture } from "../dist/stats_capture/harness.js";

// ─── T1: 7 strata enumerated correctly ────────────────────────────────────────

test("T1: 7 strata enumerated correctly (sand → bedrock)", async () => {
  await withStatsCapture({
    test_id: "knt1_t1",
    test_file: "test_strata_schema_knt1.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_strata_enumeration" });

    strictEqual(ALL_STRATA.length, 7, "must have exactly 7 strata");
    deepStrictEqual(ALL_STRATA, ["sand", "soil", "sediment", "sandstone", "limestone", "granite", "bedrock"]);

    for (const s of ALL_STRATA) {
      ok(isValidStratum(s), `${s} should be a valid stratum`);
    }

    ok(!isValidStratum("rock"), "unknown stratum should be invalid");
    ok(!isValidStratum(""), "empty string should be invalid");
  });
});

// ─── T2: Ordinals 0-6 monotonic ───────────────────────────────────────────────

test("T2: ordinals 0-6 strictly monotonic from sand to bedrock", async () => {
  await withStatsCapture({
    test_id: "knt1_t2",
    test_file: "test_strata_schema_knt1.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_ordinals_monotonic" });

    strictEqual(STRATUM_ORDINALS["sand"], 0);
    strictEqual(STRATUM_ORDINALS["soil"], 1);
    strictEqual(STRATUM_ORDINALS["sediment"], 2);
    strictEqual(STRATUM_ORDINALS["sandstone"], 3);
    strictEqual(STRATUM_ORDINALS["limestone"], 4);
    strictEqual(STRATUM_ORDINALS["granite"], 5);
    strictEqual(STRATUM_ORDINALS["bedrock"], 6);

    // Strictly increasing
    let prev = -1;
    for (const s of ALL_STRATA) {
      const ord = STRATUM_ORDINALS[s];
      ok(ord > prev, `${s} ordinal ${ord} must be > previous ${prev}`);
      prev = ord;
    }
  });
});

// ─── T3: Stratum assignment round-trips through serialization ─────────────────

test("T3: stratum assignment round-trips through serialization (write → read)", async () => {
  await withStatsCapture({
    test_id: "knt1_t3",
    test_file: "test_strata_schema_knt1.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_assignment_round_trip" });

    const topic = `test_topic_knt1_t3_${Date.now()}`;
    const assignment = {
      topic,
      stratum: "sandstone",
      ordinal: STRATUM_ORDINALS["sandstone"],
      ratification_session: "KNT_test",
      promotion_chain: ["sand", "soil"],
      ts: new Date().toISOString(),
    };

    writeAssignment(assignment);
    const read = getAssignment(topic);

    ok(read, "assignment should be readable after write");
    strictEqual(read.topic, topic);
    strictEqual(read.stratum, "sandstone");
    strictEqual(read.ordinal, 3);
    deepStrictEqual(read.promotion_chain, ["sand", "soil"]);
  });
});

// ─── T4: Promotion chain captures history ─────────────────────────────────────

test("T4: promotion chain captures full history sand → soil → sediment → sandstone", async () => {
  await withStatsCapture({
    test_id: "knt1_t4",
    test_file: "test_strata_schema_knt1.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_promotion_chain" });

    const topic = `chain_topic_knt1_${Date.now()}`;
    const strata_sequence = ["sand", "soil", "sediment", "sandstone"];

    for (let i = 0; i < strata_sequence.length; i++) {
      writeAssignment({
        topic,
        stratum: strata_sequence[i],
        ordinal: STRATUM_ORDINALS[strata_sequence[i]],
        ratification_session: `KNT_step_${i}`,
        promotion_chain: strata_sequence.slice(0, i),
        ts: new Date().toISOString(),
      });
    }

    const final = getAssignment(topic);
    ok(final, "final assignment should exist");
    strictEqual(final.stratum, "sandstone");
    deepStrictEqual(final.promotion_chain, ["sand", "soil", "sediment"]);
  });
});

// ─── T5: Invalid stratum value rejected ───────────────────────────────────────

test("T5: invalid stratum value correctly identified as invalid", async () => {
  await withStatsCapture({
    test_id: "knt1_t5",
    test_file: "test_strata_schema_knt1.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_invalid_stratum" });

    ok(!isValidStratum("rock"), "rock is not a valid stratum");
    ok(!isValidStratum("clay"), "clay is not a valid stratum");
    ok(!isValidStratum("magma"), "magma is not a valid stratum");
    ok(!isValidStratum("SAND"), "case-sensitive: SAND is invalid");
    ok(!isValidStratum(""), "empty string is invalid");

    // All canonical values pass
    for (const s of ALL_STRATA) {
      ok(isValidStratum(s), `canonical stratum '${s}' must be valid`);
    }
  });
});
