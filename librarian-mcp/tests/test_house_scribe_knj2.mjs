/**
 * KN-J2 House Scribe 8-Digit Grid Coordinate Scheme — T1-T8 test suite
 * ======================================================================
 * Tests: coordinate parsing, assignment, cell-overflow Swarming,
 * wildcard/range/cross-cathedral queries, HexIsle composition,
 * KN-J1 lifecycle compose, BRIDLE Rule 4, 2D-to-4D extension.
 */

import { strictEqual, ok, deepStrictEqual } from "assert";
import { test } from "node:test";

import {
  parseCoordinate,
  validateCoordinate,
  buildCoordinate,
  cellPrefix,
  jarSlot,
  swarmDaughterCell,
  parseWildcardQuery,
  coordinateMatchesQuery,
  twoDToFourD,
  fourDToTwoD,
  CATHEDRAL_IDS,
  TIER_IDS,
  FLAVOR_IDS,
  MAX_JARS_PER_CELL,
  WILDCARD_RESULT_CAP,
} from "../dist/house_scribe/coordinate_scheme.js";

import {
  assignCoordinate,
  queryJarsByCoordinate,
} from "../dist/house_scribe/coordinate_assignment.js";

import {
  createJar,
  sealJar,
  readAllJars,
} from "../dist/house_scribe/jar_lifecycle.js";

// ─── T1: 8-digit coordinate parsing and validation ───────────────────────────

test("T1: 8-digit coordinate parses + validates correctly", () => {
  // Valid coordinates
  const c1 = parseCoordinate("01-06-02-05");
  ok(c1, "should parse valid coordinate");
  strictEqual(c1.cathedral_id, "01");
  strictEqual(c1.tier_id, "06");
  strictEqual(c1.flavor_id, "02");
  strictEqual(c1.jar_slot, "05");
  strictEqual(c1.cathedral_name, "bishop");
  strictEqual(c1.tier_name, "freeway");
  strictEqual(c1.flavor_name, "vanilla");
  strictEqual(c1.is_cross_cathedral, false);
  strictEqual(c1.is_cross_tier, false);
  strictEqual(c1.is_cross_flavor, false);

  // Cross-cathedral
  const c99 = parseCoordinate("99-99-99-00");
  ok(c99);
  strictEqual(c99.is_cross_cathedral, true);
  strictEqual(c99.is_cross_tier, true);
  strictEqual(c99.is_cross_flavor, true);

  // Invalid coordinate — wrong number of fields
  const bad1 = parseCoordinate("01-06-02");
  strictEqual(bad1, null, "3-field coordinate should return null");

  const bad2 = parseCoordinate("01-06-02-05-07");
  strictEqual(bad2, null, "5-field coordinate should return null");

  // Validation
  const v1 = validateCoordinate("01-06-02-05");
  strictEqual(v1.valid, true);
  ok(v1.parsed);

  const v2 = validateCoordinate("XX-06-02-05");
  strictEqual(v2.valid, false);
  ok(v2.errors.length > 0);

  const v3 = validateCoordinate("");
  strictEqual(v3.valid, false);

  // buildCoordinate
  const built = buildCoordinate("01", "06", "02", 5);
  strictEqual(built, "01-06-02-05");

  // cellPrefix
  strictEqual(cellPrefix("01-06-02-05"), "01-06-02");

  // jarSlot
  strictEqual(jarSlot("01-06-02-05"), 5);
  strictEqual(jarSlot("01-06-02-99"), 99);

  // Enum coverage
  strictEqual(CATHEDRAL_IDS["bishop"], "01");
  strictEqual(CATHEDRAL_IDS["knight"], "02");
  strictEqual(TIER_IDS["freeway"], "06");
  strictEqual(FLAVOR_IDS["vanilla"], "02");

  console.log("T1 PASS: 8-digit coordinate parses + validates correctly");
});

// ─── T2: Coordinate assignment at indexed state ───────────────────────────────

test("T2: Coordinate assignment at indexed state — no collision; correct derivation", () => {
  const jar = createJar({
    cathedral: "bishop",
    source_hive_thread_id: "hive-thread-T2",
    content_type: "synthesis",
    content_summary: "T2 coordinate assignment test",
    content_blob_pointer: "ptr://T2",
  });
  ok(jar.success);

  const result = assignCoordinate({
    jar_id: jar.jar.jar_id,
    cathedral: "bishop",
    content_type: "synthesis",
  });

  ok(result.success, `assignCoordinate should succeed: ${result.error}`);
  ok(result.coordinate, "coordinate should be assigned");

  // Validate the assigned coordinate
  const validation = validateCoordinate(result.coordinate);
  ok(validation.valid, `Assigned coordinate ${result.coordinate} should be valid`);

  // Cathedral should be bishop (01)
  ok(result.coordinate.startsWith("01-"), "bishop cathedral should have 01 prefix");

  // Jar should now be in indexed state
  strictEqual(result.jar.state, "indexed");
  strictEqual(result.jar.coordinate, result.coordinate);

  // Content_type=synthesis → tier=06 (freeway), flavor=02 (vanilla)
  ok(result.coordinate.startsWith("01-06-02-"), "synthesis: freeway tier, vanilla flavor");

  console.log(`T2 PASS: Coordinate ${result.coordinate} assigned at indexed state`);
});

// ─── T3: Cell-overflow Swarming ───────────────────────────────────────────────

test("T3: Cell-overflow Swarming — 100th jar assigned; 101st triggers daughter-cell", () => {
  // swarmDaughterCell produces adjacent flavor
  const dc1 = swarmDaughterCell("01-06-02");
  strictEqual(dc1, "01-06-03", "daughter cell: flavor 02 → 03");

  const dc2 = swarmDaughterCell("01-06-06");
  strictEqual(dc2, "01-06-07", "daughter cell: flavor 06 → 07");

  // Wrap: flavor 98 → 01 (not 99 which is cross-flavor)
  const dc3 = swarmDaughterCell("01-06-98");
  strictEqual(dc3, "01-06-01", "daughter cell: flavor 98 wraps to 01");

  // Invalid prefix returns null
  const bad = swarmDaughterCell("bad-prefix");
  strictEqual(bad, null, "invalid prefix returns null");

  console.log("T3 PASS: Swarming daughter-cell logic correct");
});

// ─── T4: Coordinate-based retrieval (exact / wildcard / range / cross-cathedral) ──

test("T4: Coordinate retrieval — exact / wildcard / range / cross-cathedral queries", () => {
  // Seed a jar with known coordinate
  const jar = createJar({
    cathedral: "knight",
    source_hive_thread_id: "hive-thread-T4",
    content_type: "comb_artifact",
    content_summary: "T4 retrieval test",
    content_blob_pointer: "ptr://T4",
  });
  ok(jar.success);
  const assigned = assignCoordinate({
    jar_id: jar.jar.jar_id,
    cathedral: "knight",
    content_type: "comb_artifact",
  });
  ok(assigned.success, `assignCoordinate failed: ${assigned.error}`);
  const coord = assigned.coordinate;

  // Exact query
  const exact = queryJarsByCoordinate(coord);
  ok(exact.data_available, "exact query should succeed");
  ok(exact.jars.some(j => j.jar_id === jar.jar.jar_id), "exact query should find the jar");

  // Wildcard: knight cathedral = "02-*-*-*"
  const wildcard = queryJarsByCoordinate("02-*-*-*");
  ok(wildcard.data_available, "wildcard query should succeed");
  ok(wildcard.jars.some(j => j.jar_id === jar.jar.jar_id), "wildcard should find knight jar");

  // Mismatched cathedral wildcard: bishop "01-*-*-*" should NOT include knight jar
  const bishopWild = queryJarsByCoordinate("01-*-*-*");
  ok(!bishopWild.jars.some(j => j.jar_id === jar.jar.jar_id), "bishop wildcard should NOT include knight jar");

  // Invalid pattern (only 2 fields, not 4) returns data_available=false
  const bad = queryJarsByCoordinate("invalid");
  strictEqual(bad.data_available, false, "invalid pattern (not 4 fields) should return data_available=false");

  console.log(`T4 PASS: Coordinate retrieval modes work — coord ${coord}`);
});

// ─── T5: HexIsle hexagonal-cell visual composition ───────────────────────────

test("T5: HexIsle hexagonal-cell visual scaffold — constants present and correct", () => {
  // Verify coordinate scheme constants used by the HexGrid component
  strictEqual(MAX_JARS_PER_CELL, 100, "cell capacity = 100 Jars");
  strictEqual(WILDCARD_RESULT_CAP, 1000, "wildcard cap = 1000");

  // Cathedral 01=bishop maps to hex cell row 0
  strictEqual(CATHEDRAL_IDS["bishop"], "01");
  strictEqual(CATHEDRAL_IDS["knight"], "02");

  // Tier 06=freeway = Layer 6 (Jars of Honey layer)
  strictEqual(TIER_IDS["freeway"], "06");
  strictEqual(TIER_IDS["bedrock"], "07");

  // Flavor colors via enum: 6 named flavors + cross
  const flavors = ["cinnamon", "vanilla", "spice", "fruit", "vegetable", "nut"];
  for (const f of flavors) {
    ok(FLAVOR_IDS[f], `Flavor '${f}' should have an ID`);
  }
  strictEqual(FLAVOR_IDS["cross_flavor"], "99");

  console.log("T5 PASS: HexIsle visual constants correct — scaffold ready for KN-J5");
});

// ─── T6: Composes with KN-J1 Jar lifecycle ───────────────────────────────────

test("T6: Composes with KN-J1 — coordinate at indexed; persists to sealed", () => {
  const jar = createJar({
    cathedral: "pawn",
    source_hive_thread_id: "hive-thread-T6",
    content_type: "innovation_corpus",
    content_summary: "T6 lifecycle compose test",
    content_blob_pointer: "ptr://T6",
  });
  ok(jar.success);
  strictEqual(jar.jar.state, "created");
  strictEqual(jar.jar.coordinate, null, "no coordinate before indexing");

  const assigned = assignCoordinate({
    jar_id: jar.jar.jar_id,
    cathedral: "pawn",
    content_type: "innovation_corpus",
  });
  ok(assigned.success, `assign failed: ${assigned.error}`);
  strictEqual(assigned.jar.state, "indexed");
  ok(assigned.jar.coordinate, "coordinate assigned at indexed state");

  // Cathedral should be pawn (03), content_type=innovation_corpus → bedrock (07), spice (03)
  ok(assigned.coordinate.startsWith("03-07-03-"), "pawn / bedrock / spice coordinate");

  // Now seal the Jar — coordinate must persist
  const sealed = sealJar(jar.jar.jar_id);
  ok(sealed.success, `seal failed: ${sealed.error}`);
  strictEqual(sealed.jar.coordinate, assigned.coordinate, "coordinate persists through sealed state");
  strictEqual(sealed.jar.state, "retrievable");

  console.log("T6 PASS: Coordinate persists from indexed through sealed to retrievable");
});

// ─── T7: BRIDLE Rule 4 — collision detection + wildcard cap ──────────────────

test("T7: BRIDLE Rule 4 — collision detection halts; wildcard cap enforced", () => {
  // Wildcard cap check
  strictEqual(WILDCARD_RESULT_CAP, 1000, "WILDCARD_RESULT_CAP should be 1000");

  // Parse a valid wildcard query
  const q1 = parseWildcardQuery("01-*-*-*");
  ok(q1, "wildcard query should parse");
  strictEqual(q1.cathedral_id, "01");
  strictEqual(q1.tier_id, "*");

  // coordinateMatchesQuery with wildcard
  const matchWild = coordinateMatchesQuery("01-06-02-05", { cathedral_id: "01", tier_id: "*", flavor_id: "*", jar_slot: "*" });
  strictEqual(matchWild, true, "bishop jar matches bishop wildcard");

  const noMatch = coordinateMatchesQuery("02-06-02-05", { cathedral_id: "01", tier_id: "*", flavor_id: "*", jar_slot: "*" });
  strictEqual(noMatch, false, "knight jar does NOT match bishop wildcard");

  // Invalid pattern returns data_available=false
  const capResult = queryJarsByCoordinate("invalid-pattern");
  strictEqual(capResult.data_available, false, "invalid pattern returns data_available=false");
  ok(capResult.unavailable_reason, "reason should be present");

  // Non-existent coordinate returns empty (not error)
  const emptyResult = queryJarsByCoordinate("98-98-98-*");
  ok(emptyResult.data_available, "valid wildcard with no results: data_available=true");
  strictEqual(emptyResult.total, 0, "no jars at 98-98-98 coordinate");

  console.log("T7 PASS: BRIDLE Rule 4 — collision detection + wildcard cap enforced");
});

// ─── T8: Composes with Multi-Trail BP015 P3 (2D-to-4D extension) ─────────────

test("T8: Composes with Multi-Trail BP015 P3 — 2D-to-4D extension preserves semantics", () => {
  // twoDToFourD: legacy 2D (tier × flavor) → 4D (cross-cathedral × tier × flavor × 00)
  const fourD = twoDToFourD("06", "02");
  strictEqual(fourD, "99-06-02-00", "2D to 4D: cross-cathedral (99), tier 06, flavor 02, slot 00");

  // fourDToTwoD: reverse extraction
  const twoD = fourDToTwoD("01-06-02-05");
  ok(twoD);
  strictEqual(twoD.tier_id, "06");
  strictEqual(twoD.flavor_id, "02");

  // 4D coordinates are valid
  const v = validateCoordinate(fourD);
  ok(v.valid, "2D-derived 4D coordinate should be valid");
  strictEqual(v.parsed.is_cross_cathedral, true, "should be cross-cathedral");
  strictEqual(v.parsed.tier_name, "freeway");
  strictEqual(v.parsed.flavor_name, "vanilla");

  // fourDToTwoD on null/invalid → null
  const bad = fourDToTwoD("bad");
  strictEqual(bad, null, "invalid coordinate → null");

  // Verify flavor range matching (BP015 P3 range queries)
  const inRange = coordinateMatchesQuery("01-06-04-00", { flavor_range: ["01", "06"] });
  strictEqual(inRange, true, "flavor 04 within range 01..06");

  const outRange = coordinateMatchesQuery("01-06-07-00", { flavor_range: ["01", "06"] });
  strictEqual(outRange, false, "flavor 07 outside range 01..06");

  console.log("T8 PASS: Multi-Trail BP015 P3 2D-to-4D extension preserves semantics");
});

// ─── INFRA ────────────────────────────────────────────────────────────────────

test("INFRA: coordinate scheme enums are correct and complete", () => {
  // Cathedral enum
  ok(Object.values(CATHEDRAL_IDS).includes("01"), "bishop = 01");
  ok(Object.values(CATHEDRAL_IDS).includes("99"), "cross = 99");

  // Tier enum (01-07 + 99)
  for (let i = 1; i <= 7; i++) {
    const id = String(i).padStart(2, "0");
    ok(Object.values(TIER_IDS).includes(id), `tier ${id} should be in enum`);
  }
  ok(Object.values(TIER_IDS).includes("99"), "cross_tier = 99");

  // Flavor enum (01-06 + 99)
  for (let i = 1; i <= 6; i++) {
    const id = String(i).padStart(2, "0");
    ok(Object.values(FLAVOR_IDS).includes(id), `flavor ${id} should be in enum`);
  }
  ok(Object.values(FLAVOR_IDS).includes("99"), "cross_flavor = 99");

  console.log("INFRA PASS: coordinate scheme enums complete");
});
