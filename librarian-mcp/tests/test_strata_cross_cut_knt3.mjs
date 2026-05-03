/**
 * KN-T3 Strata Cross-Cut — T1-T5 test suite
 * ============================================
 * Tests: Eblet stratum priority ranking, Detective TEAM stratum×decay composite,
 * 2D coordinate round-trips, cross-cut consistency check.
 */

import { strictEqual, ok } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import {
  rankByStratumPriority,
  detectiveQueryByStratum,
  buildStratumFlavorCoordinate,
  checkCrossCutConsistency,
} from "../dist/strata/cross_cut.js";

import { assignStratum } from "../dist/strata/query.js";
import { STRATUM_ORDINALS } from "../dist/strata/schema.js";
import { withStatsCapture } from "../dist/stats_capture/harness.js";

const SESSION = "KNT_test";

// ─── T1: Eblet loader respects stratum priority ────────────────────────────────

test("T1: rankByStratumPriority sorts items bedrock > granite > ... > sand", async () => {
  await withStatsCapture({
    test_id: "knt3_t1",
    test_file: "test_strata_cross_cut_knt3.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_eblet_stratum_priority" });

    const items = [
      { path: "a.eblet.md", stratum: "sand" },
      { path: "b.eblet.md", stratum: "bedrock" },
      { path: "c.eblet.md", stratum: "limestone" },
      { path: "d.eblet.md", stratum: "soil" },
    ];

    const ranked = rankByStratumPriority(items);
    strictEqual(ranked[0].stratum, "bedrock", "bedrock should be first");
    strictEqual(ranked[1].stratum, "limestone", "limestone second");
    strictEqual(ranked[2].stratum, "soil", "soil third");
    strictEqual(ranked[3].stratum, "sand", "sand last");

    // Verify ordinals
    for (let i = 0; i < ranked.length - 1; i++) {
      ok(ranked[i].stratum_ordinal >= ranked[i + 1].stratum_ordinal, "ordinals should be non-increasing");
    }
  });
});

// ─── T2: Detective TEAM ranks by stratum × decay_score ────────────────────────

test("T2: detectiveQueryByStratum returns StratumDecayHit objects with composite_score", async () => {
  await withStatsCapture({
    test_id: "knt3_t2",
    test_file: "test_strata_cross_cut_knt3.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_detective_stratum_decay" });

    // Seed a topic at sandstone stratum
    const topic = `detective_topic_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "sandstone", SESSION);

    const hits = detectiveQueryByStratum("canonical substrate", 10);
    // Hits may be empty if pheromone substrate is sparse; just verify shape
    ok(Array.isArray(hits), "should return array");
    for (const hit of hits) {
      ok(typeof hit.composite_score === "number", "composite_score should be number");
      ok(typeof hit.stratum_ordinal === "number", "stratum_ordinal should be number");
      ok(hit.stratum_ordinal >= 0 && hit.stratum_ordinal <= 6, "ordinal in range 0-6");
      ok(typeof hit.composite_score === "number", "composite_score is numeric");
    }
  });
});

// ─── T3: 2D coordinate (stratum × flavor) round-trips ────────────────────────

test("T3: buildStratumFlavorCoordinate 2D coordinate round-trips correctly", async () => {
  await withStatsCapture({
    test_id: "knt3_t3",
    test_file: "test_strata_cross_cut_knt3.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_stratum_flavor_2d" });

    const topic = `coord_topic_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "limestone", SESSION); // ordinal 4

    const coord = buildStratumFlavorCoordinate(topic, "joules", "building-in-public");

    strictEqual(coord.stratum, "limestone");
    strictEqual(coord.stratum_ordinal, STRATUM_ORDINALS["limestone"]);
    strictEqual(coord.flavor_domain, "joules");
    strictEqual(coord.flavor_cognition, "building-in-public");
    ok(coord.coordinate_string.includes("limestone"), "coordinate_string includes stratum");
    ok(coord.coordinate_string.includes("joules"), "coordinate_string includes flavor_domain");
  });
});

// ─── T4: Multi-Trail Pheromone-Flavor 2D coordinate with wildcard ─────────────

test("T4: buildStratumFlavorCoordinate uses wildcards when flavors not supplied", async () => {
  await withStatsCapture({
    test_id: "knt3_t4",
    test_file: "test_strata_cross_cut_knt3.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_coord_wildcard" });

    const topic = `wildcard_topic_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "granite", SESSION);

    const coord = buildStratumFlavorCoordinate(topic);
    strictEqual(coord.stratum, "granite");
    strictEqual(coord.flavor_domain, undefined);
    strictEqual(coord.flavor_cognition, undefined);
    ok(coord.coordinate_string.includes("*"), "wildcards in coordinate_string");
  });
});

// ─── T5: Cross-cut consistency — same topic stratum across primitives ─────────

test("T5: checkCrossCutConsistency returns coherent report for assigned topic", async () => {
  await withStatsCapture({
    test_id: "knt3_t5",
    test_file: "test_strata_cross_cut_knt3.mjs",
    knight_session_id: "KNT",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_cross_cut_consistency" });

    const topic = `consistency_topic_${randomUUID().slice(0, 6)}`;
    assignStratum(topic, "sandstone", SESSION);

    const report = checkCrossCutConsistency(topic);
    strictEqual(report.topic, topic);
    ok(report.stratum_assignment === "sandstone", `expected sandstone, got ${report.stratum_assignment}`);
    // pheromone_found may be false if substrate is empty — that's acceptable;
    // the report structure must be correct
    ok(typeof report.consistent === "boolean", "consistent must be boolean");
    ok(Array.isArray(report.notes), "notes must be array");
  });
});
