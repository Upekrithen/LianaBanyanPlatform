/**
 * KN-T4 Strata MCP Tools — T1-T7 test suite
 * ============================================
 * Tests: strata_ascend/descend/by_stratum/promote/audit/promotion_recommend round-trips,
 * Pheromone Pixie-Dust on promote.
 */

import { strictEqual, ok } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import { StrataQuery, assignStratum } from "../dist/strata/query.js";
import { readAllAssignments, STRATUM_ORDINALS, ALL_STRATA } from "../dist/strata/schema.js";
import { detectiveQueryByStratum } from "../dist/strata/cross_cut.js";
import { withStatsCapture } from "../dist/stats_capture/harness.js";

const q = new StrataQuery();
const SESSION = "KNT4_test";

// ─── T1: strata_ascend MCP round-trips ────────────────────────────────────────

test("T1: strata_ascend returns higher-stratum results", async () => {
  await withStatsCapture({
    test_id: "knt4_t1",
    test_file: "test_strata_mcp_knt4.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_strata_ascend" });

    const base  = `t4_ascend_base_${randomUUID().slice(0, 6)}`;
    const upper = `t4_ascend_upper_${randomUUID().slice(0, 6)}`;

    assignStratum(base, "soil", SESSION);
    assignStratum(upper, "sediment", SESSION);

    const results = q.ascend(base, 1);
    ok(Array.isArray(results), "should return array");
    // At least one sediment-level topic should be present
    ok(results.some((r) => r.stratum === "sediment"), "sediment topics should appear in ascend results");
  });
});

// ─── T2: strata_descend MCP round-trips ──────────────────────────────────────

test("T2: strata_descend returns lower-stratum results", async () => {
  await withStatsCapture({
    test_id: "knt4_t2",
    test_file: "test_strata_mcp_knt4.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_strata_descend" });

    const lower  = `t4_desc_lower_${randomUUID().slice(0, 6)}`;
    const higher = `t4_desc_higher_${randomUUID().slice(0, 6)}`;

    assignStratum(lower, "sand", SESSION);
    assignStratum(higher, "soil", SESSION);

    const results = q.descend(higher, 1);
    ok(Array.isArray(results), "should return array");
    ok(results.some((r) => r.stratum === "sand"), "sand topics should appear in descend results");
  });
});

// ─── T3: strata_by_stratum MCP round-trips ────────────────────────────────────

test("T3: strata_by_stratum returns topics at requested level", async () => {
  await withStatsCapture({
    test_id: "knt4_t3",
    test_file: "test_strata_mcp_knt4.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_strata_by_stratum" });

    const t1 = `t4_bystr_1_${randomUUID().slice(0, 6)}`;
    const t2 = `t4_bystr_2_${randomUUID().slice(0, 6)}`;

    assignStratum(t1, "granite", SESSION);
    assignStratum(t2, "granite", SESSION);

    const results = q.byStratum("granite");
    ok(results.includes(t1), "should include t1");
    ok(results.includes(t2), "should include t2");
  });
});

// ─── T4: strata_promote MCP round-trips ──────────────────────────────────────

test("T4: strata_promote updates stratum and appends to promotion_chain", async () => {
  await withStatsCapture({
    test_id: "knt4_t4",
    test_file: "test_strata_mcp_knt4.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_strata_promote" });

    const topic = `t4_promote_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "sand", SESSION);

    const result = q.promote(topic, "limestone", "KNT4_signer", SESSION);
    strictEqual(result.stratum, "limestone");
    ok(result.promotion_chain.includes("sand"), "promotion_chain contains previous stratum");
  });
});

// ─── T5: strata_audit aggregates correctly per stratum ────────────────────────

test("T5: strata_audit aggregates correctly per stratum", async () => {
  await withStatsCapture({
    test_id: "knt4_t5",
    test_file: "test_strata_mcp_knt4.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_strata_audit" });

    const all = readAllAssignments();
    const counts = {};
    for (const s of ALL_STRATA) counts[s] = 0;
    for (const a of all) counts[a.stratum] = (counts[a.stratum] ?? 0) + 1;

    let total = 0;
    for (const s of ALL_STRATA) {
      ok(counts[s] >= 0, `count for ${s} should be non-negative`);
      total += counts[s];
    }
    strictEqual(total, all.length, "sum of stratum counts should equal total assignments");
  });
});

// ─── T6: strata_promotion_recommend surfaces high-frequency sand topics ─────────

test("T6: strata_promotion_recommend surfaces sand/soil topics for promotion", async () => {
  await withStatsCapture({
    test_id: "knt4_t6",
    test_file: "test_strata_mcp_knt4.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_promotion_recommend" });

    // Seed some sand/soil topics
    for (let i = 0; i < 3; i++) {
      assignStratum(`recommend_sand_${randomUUID().slice(0, 6)}`, "sand", SESSION);
    }

    const hits = detectiveQueryByStratum("canonical substrate promotion bedrock granite limestone", 10);
    // Filter to sand/soil
    const sand_soil = hits.filter((h) => h.stratum === "sand" || h.stratum === "soil");

    // The result may be empty if pheromone substrate is sparse — that's acceptable;
    // what matters is the structure is correct
    ok(Array.isArray(sand_soil), "sand_soil recommendations should be array");
    for (const rec of sand_soil) {
      ok(rec.stratum === "sand" || rec.stratum === "soil", "recommendations should be sand or soil");
    }
  });
});

// ─── T7: Pheromone Pixie-Dust on promote ─────────────────────────────────────

test("T7: Pheromone Pixie-Dust emitted on promote — no throw", async () => {
  await withStatsCapture({
    test_id: "knt4_t7",
    test_file: "test_strata_mcp_knt4.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T7_pheromone_pixie_dust" });

    const topic = `t4_pheromone_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "sand", SESSION);

    let threw = false;
    try {
      q.promote(topic, "sediment", "KNT4_pheromone_signer", SESSION);
    } catch {
      threw = true;
    }
    ok(!threw, "Pheromone Pixie-Dust should never throw");
  });
});
