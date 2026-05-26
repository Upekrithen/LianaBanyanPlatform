/**
 * Speckle Hex Codec Test Harness — BP058 W15 V15.1
 *
 * Tests:
 *   1. Round-trip: emit known Pearl bundle → hex → decode → verify zero-loss
 *   2. Wire format: PeanutRoll serialization
 *   3. Determinism: same inputs → same soccerball_id
 *   4. MassCrystal: O(1) lookup after emit
 *   5. Benchmark: latency comparison (local decode vs network estimate)
 */

import {
  soccerball_emit,
  soccerball_decode,
  speckle_lookup,
  speckle_nibble,
  serialize_peanut_roll,
  deserialize_peanut_roll,
  mass_crystal_stats,
  speckle_register,
  type PeanutRoll,
} from "./hex_warehouse.js";

// ─── Test Utilities ───────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ─── Test Data ────────────────────────────────────────────────────────────────

const TEST_PEARLS = [
  "pearl_feb9ca38dcbf1daa",
  "pearl_a1b2c3d4e5f60001",
  "pearl_deadbeef12345678",
];

const TEST_BINDINGS: Record<string, string> = {
  initiative: "MSA",
  session: "BP058",
  tier: "BLACK_MAMBA",
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

console.log("\n=== Speckle Hex Codec Test Harness (BP058 W15 V15.1) ===\n");

// ── Test 1: Round-trip single pearl
console.log("Test 1: Round-trip (single pearl, no bindings)");
{
  const pearls = ["pearl_feb9ca38dcbf1daa"];
  const sid = soccerball_emit(pearls, {});
  assert(typeof sid === "string" && sid.length === 32, "emit returns 32-char hex", `got ${sid.length}`);
  assert(/^[0-9a-f]{32}$/.test(sid), "emit is lowercase hex");

  const decoded = soccerball_decode(sid);
  assert(decoded !== null, "decode returns non-null");
  assert(deepEqual(decoded?.pearls, pearls), "round-trip pearls match");
  assert(deepEqual(decoded?.bindings, {}), "round-trip bindings empty");
}

// ── Test 2: Round-trip N pearls + bindings
console.log("\nTest 2: Round-trip (3 pearls + bindings)");
{
  const sid = soccerball_emit(TEST_PEARLS, TEST_BINDINGS);
  assert(sid.length === 32, "32-char hex handle");

  const decoded = soccerball_decode(sid);
  assert(decoded !== null, "decoded non-null");
  // Pearls are sorted internally
  assert(deepEqual(decoded?.pearls, [...TEST_PEARLS].sort()), "pearls round-trip (sorted)");
  assert(decoded?.bindings["initiative"] === "MSA", "binding initiative=MSA");
  assert(decoded?.bindings["session"] === "BP058", "binding session=BP058");
}

// ── Test 3: Determinism
console.log("\nTest 3: Determinism (same inputs → same soccerball_id)");
{
  const sid1 = soccerball_emit(TEST_PEARLS, TEST_BINDINGS);
  const sid2 = soccerball_emit(TEST_PEARLS, TEST_BINDINGS);
  assert(sid1 === sid2, "deterministic across calls");

  // Order-independent
  const sid3 = soccerball_emit([...TEST_PEARLS].reverse(), TEST_BINDINGS);
  assert(sid1 === sid3, "order-independent (pearls sorted internally)");
}

// ── Test 4: speckle_lookup (MassCrystal O(1))
console.log("\nTest 4: speckle_lookup (MassCrystal)");
{
  const sid = soccerball_emit(["pearl_aaaa"], { x: "y" });
  const roll = speckle_lookup(sid);
  assert(roll !== null, "lookup returns PeanutRoll");
  assert(roll?.v === 1, "PeanutRoll version=1");
  assert(roll?.s === sid, "PeanutRoll.s matches soccerball_id");
  assert(deepEqual(roll?.p, ["pearl_aaaa"]), "PeanutRoll.p contains pearl");
  assert(roll?.b["x"] === "y", "PeanutRoll.b binding x=y");
}

// ── Test 5: Wire format (PeanutRoll serialization)
console.log("\nTest 5: Wire format (PeanutRoll serialization)");
{
  const sid = soccerball_emit(["pearl_wire_test"], { wire: "format" });
  const roll = speckle_lookup(sid)!;
  const serialized = serialize_peanut_roll(roll);
  assert(typeof serialized === "string", "serialized is string");

  const deserialized = deserialize_peanut_roll(serialized);
  assert(deserialized.v === 1, "deserialized v=1");
  assert(deserialized.s === sid, "deserialized soccerball_id matches");
  assert(deepEqual(deserialized.p, roll.p), "deserialized pearls match");
  assert(deepEqual(deserialized.b, roll.b), "deserialized bindings match");
}

// ── Test 6: Speckle nibble extraction
console.log("\nTest 6: Speckle nibble extraction");
{
  const sid = soccerball_emit(["pearl_nibble_test"], {});
  for (let i = 0; i < 32; i++) {
    const nibble = speckle_nibble(sid, i);
    assert(/^[0-9a-f]$/.test(nibble), `nibble at position ${i} is valid hex char`);
  }
}

// ── Test 7: MassCrystal stats
console.log("\nTest 7: MassCrystal stats");
{
  const stats = mass_crystal_stats();
  assert(stats.count > 0, "MassCrystal has entries after tests");
  assert(stats.estimatedBytes > 0, "estimatedBytes > 0");
  console.log(`  ℹ  MassCrystal: ${stats.count} entries, ~${stats.estimatedBytes} bytes`);
}

// ── Test 8: speckle_register (external hydration)
console.log("\nTest 8: speckle_register (external hydration)");
{
  const externalRoll: PeanutRoll = {
    v: 1,
    s: "a".repeat(32) as string,
    p: ["pearl_external"],
    b: { source: "external" },
    ts: Date.now(),
  };
  speckle_register(externalRoll);
  const lookup = speckle_lookup("a".repeat(32));
  assert(lookup !== null, "registered external roll is findable");
  assert(lookup?.b["source"] === "external", "external binding preserved");
}

// ── Test 9: Benchmark
console.log("\nTest 9: Benchmark (emit + lookup latency)");
{
  const N = 1000;
  const t0 = Date.now();
  const pearls = [];
  for (let i = 0; i < N; i++) {
    const p = [`pearl_bench_${i.toString(16).padStart(16, "0")}`];
    const sid = soccerball_emit(p, { i: String(i) });
    pearls.push(sid);
  }
  const emitMs = Date.now() - t0;

  const t1 = Date.now();
  for (const sid of pearls) {
    speckle_lookup(sid);
  }
  const lookupMs = Date.now() - t1;

  console.log(`  ℹ  Emit ${N} soccerballs: ${emitMs}ms (${(emitMs / N).toFixed(2)}ms each)`);
  console.log(`  ℹ  Lookup ${N} soccerballs: ${lookupMs}ms (${(lookupMs / N).toFixed(3)}ms each)`);
  console.log(`  ℹ  Network estimate (round-trip 50ms RTT): ${50}ms vs local ${(lookupMs / N).toFixed(3)}ms`);
  assert(lookupMs < 100, `${N} lookups complete in <100ms (got ${lookupMs}ms)`);
}

// ── Test 10: Empty pearls error
console.log("\nTest 10: Error on empty pearls array");
{
  let threw = false;
  try {
    soccerball_emit([], {});
  } catch {
    threw = true;
  }
  assert(threw, "empty pearls throws error");
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"=".repeat(55)}`);
console.log(`Results: ${passed} passed · ${failed} failed`);
if (failed === 0) {
  console.log("✓ ALL TESTS PASSED — Speckle hex codec LANDED");
} else {
  console.error(`✗ ${failed} TESTS FAILED`);
  process.exit(1);
}
