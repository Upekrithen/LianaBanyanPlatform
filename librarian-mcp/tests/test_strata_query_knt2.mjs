/**
 * KN-T2 Strata Query API — T1-T6 test suite
 * ============================================
 * Tests: ascend, descend, byStratum, promote, bedrock rejects promotion, sand rejects descend.
 */

import { strictEqual, ok, throws } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import { StrataQuery, assignStratum } from "../dist/strata/query.js";
import { STRATUM_ORDINALS } from "../dist/strata/schema.js";
import { withStatsCapture } from "../dist/stats_capture/harness.js";

const q = new StrataQuery();
const SESSION = "KNT_test";

// ─── T1: Ascend returns higher-stratum topics ─────────────────────────────────

test("T1: ascend returns topics at higher stratum level", async () => {
  await withStatsCapture({
    test_id: "knt2_t1",
    test_file: "test_strata_query_knt2.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_ascend" });

    const base   = `ascend_base_${randomUUID().slice(0, 6)}`;
    const upper  = `ascend_upper_${randomUUID().slice(0, 6)}`;

    assignStratum(base, "soil", SESSION);      // ordinal 1
    assignStratum(upper, "sediment", SESSION); // ordinal 2

    const results = q.ascend(base, 1); // should find ordinal-2 topics
    ok(results.length > 0, "ascend should return at least one topic at ordinal+1");
    ok(results.some((r) => r.stratum === "sediment"), "should include sediment-level topics");
  });
});

// ─── T2: Descend returns lower-stratum topics ─────────────────────────────────

test("T2: descend returns topics at lower stratum level", async () => {
  await withStatsCapture({
    test_id: "knt2_t2",
    test_file: "test_strata_query_knt2.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_descend" });

    const lower  = `descend_lower_${randomUUID().slice(0, 6)}`;
    const higher = `descend_higher_${randomUUID().slice(0, 6)}`;

    assignStratum(lower,  "sand",      SESSION); // ordinal 0
    assignStratum(higher, "soil",      SESSION); // ordinal 1

    const results = q.descend(higher, 1); // should find ordinal-0 topics
    ok(results.length > 0, "descend should return at least one topic at ordinal-1");
    ok(results.some((r) => r.stratum === "sand"), "should include sand-level topics");
  });
});

// ─── T3: byStratum returns all topics at a given level ────────────────────────

test("T3: byStratum returns all topics assigned to given level", async () => {
  await withStatsCapture({
    test_id: "knt2_t3",
    test_file: "test_strata_query_knt2.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_by_stratum" });

    const granite1 = `granite_topic_1_${randomUUID().slice(0, 6)}`;
    const granite2 = `granite_topic_2_${randomUUID().slice(0, 6)}`;

    assignStratum(granite1, "granite", SESSION);
    assignStratum(granite2, "granite", SESSION);

    const results = q.byStratum("granite");
    ok(results.includes(granite1), "byStratum granite should include granite1");
    ok(results.includes(granite2), "byStratum granite should include granite2");
  });
});

// ─── T4: Promote signed correctly + appends to promotion chain ────────────────

test("T4: promote updates stratum and appends previous to promotion_chain", async () => {
  await withStatsCapture({
    test_id: "knt2_t4",
    test_file: "test_strata_query_knt2.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_promote_signed" });

    const topic = `promote_topic_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "sand", SESSION);

    const promoted = q.promote(topic, "sediment", "KNT_signer", SESSION);

    strictEqual(promoted.stratum, "sediment");
    strictEqual(promoted.ordinal, STRATUM_ORDINALS["sediment"]);
    ok(promoted.promotion_chain.includes("sand"), "promotion_chain should contain 'sand'");
    strictEqual(promoted.ratification_session, SESSION);
  });
});

// ─── T5: Bedrock rejects further promotion ───────────────────────────────────

test("T5: bedrock rejects further promotion (top of pyramid)", async () => {
  await withStatsCapture({
    test_id: "knt2_t5",
    test_file: "test_strata_query_knt2.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_bedrock_rejects_promotion" });

    const topic = `bedrock_topic_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "bedrock", SESSION);

    throws(
      () => q.promote(topic, "bedrock", "KNT_signer"),
      /Bedrock.*top of pyramid|already at Bedrock/i,
      "promoting from bedrock should throw"
    );
  });
});

// ─── T6: Sand rejects descend (bottom of pyramid) ────────────────────────────

test("T6: sand descend returns empty array (bottom of pyramid)", async () => {
  await withStatsCapture({
    test_id: "knt2_t6",
    test_file: "test_strata_query_knt2.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_sand_descend_empty" });

    const topic = `sand_bottom_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "sand", SESSION);

    const results = q.descend(topic, 1);
    strictEqual(results.length, 0, "descend from sand should return empty array (below ordinal 0)");
  });
});
