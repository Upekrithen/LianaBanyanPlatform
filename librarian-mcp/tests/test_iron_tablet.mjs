/**
 * test_iron_tablet.mjs — KN089 / BP011 Pod W Bean 1
 * ==================================================
 * Iron Tablet Primitive: fused Stone Tablet (append-only ledger) + Eblet
 * (content-addressed active memory) behind a single API surface.
 *
 * PATH B: failing test written FIRST, implementation follows.
 *
 * 5 tests:
 *   1. Single-organism write → ProvenanceReceipt has hash + sequence
 *   2. Single-organism read → content + full provenance chain
 *   3. Multi-organism concurrent write (5-org) — Stone serializes; all preserved;
 *      Eblet last-writer-wins; ConcurrencyConflicts surfaced for writes 2–5
 *   4. Read-after-conflict → Eblet content = last writer; Stone shows all 5 attempts
 *   5. Atomicity — delete eblet file mid-state; Stone ledger survives; provenance intact
 *
 * Run: node --test tests/test_iron_tablet.mjs (after npm run build)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Temp directory for all eblet files — isolated from production
let TMP_DIR;

before(() => {
  TMP_DIR = mkdtempSync(join(tmpdir(), "kn089-iron-tablet-"));
  mkdirSync(TMP_DIR, { recursive: true });
});

after(() => {
  try {
    rmSync(TMP_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup failures on Windows file locking.
  }
});

// Import the compiled Iron Tablet API
const { ironTabletWrite, ironTabletRead, ironTabletList, ironTabletProvenance } =
  await import("../dist/iron_tablet/iron_tablet.js");

// ─── Test 1: Single-organism write ───────────────────────────────────────────

test("T1: single-organism write returns ProvenanceReceipt with hash + sequence=1", async () => {
  const ebletPath = join(TMP_DIR, "t1_topic.eblet.md");
  const result = await ironTabletWrite({
    scribeId: "R11_shadow_alpha",
    ebletPath,
    content: "# Topic T1\n\nFirst write.",
    provenance: { session: "BP011", decisionId: "T1-DEC-001" },
  });

  assert.ok(result.stoneReceipt, "stoneReceipt should be present");
  assert.strictEqual(result.stoneReceipt.scribeId, "R11_shadow_alpha");
  assert.strictEqual(result.stoneReceipt.sequence, 1, "first write → sequence 1");
  assert.ok(typeof result.stoneReceipt.hash === "string" && result.stoneReceipt.hash.length === 64,
    "hash should be 64-char SHA-256 hex");
  assert.ok(typeof result.ebletHash === "string" && result.ebletHash.length === 64,
    "ebletHash should be 64-char SHA-256 hex");
  assert.strictEqual(result.stoneReceipt.hash, result.ebletHash,
    "stone hash should match eblet hash (no conflict)");
  assert.strictEqual(result.conflict, undefined, "no conflict on first write");
  assert.strictEqual(result.stoneReceipt.session, "BP011");
  assert.strictEqual(result.stoneReceipt.decisionId, "T1-DEC-001");
});

// ─── Test 2: Single-organism read ────────────────────────────────────────────

test("T2: single-organism read returns content + full provenance chain", async () => {
  const ebletPath = join(TMP_DIR, "t2_topic.eblet.md");
  const content = "# Topic T2\n\nHello from T2.";

  await ironTabletWrite({
    scribeId: "R11_shadow_beta",
    ebletPath,
    content,
    provenance: { session: "BP011" },
  });

  const readResult = await ironTabletRead(ebletPath);

  assert.ok(readResult, "readResult should not be null");
  assert.strictEqual(readResult.content, content, "read content should match written content");
  assert.ok(typeof readResult.ebletHash === "string" && readResult.ebletHash.length === 64,
    "ebletHash should be present");
  assert.ok(Array.isArray(readResult.stoneProvenance), "stoneProvenance should be array");
  assert.strictEqual(readResult.stoneProvenance.length, 1, "one write → one provenance entry");
  assert.strictEqual(readResult.stoneProvenance[0].scribeId, "R11_shadow_beta");
  assert.strictEqual(readResult.stoneProvenance[0].sequence, 1);
});

// ─── Test 3: Multi-organism concurrent write (5-org) ─────────────────────────

test("T3: 5-org concurrent write — Stone serializes; Eblet last-writer-wins; conflicts surfaced", async () => {
  const ebletPath = join(TMP_DIR, "t3_topic.eblet.md");

  const organisms = ["alpha", "beta", "gamma", "delta", "epsilon"];
  const writes = organisms.map((org, idx) =>
    ironTabletWrite({
      scribeId: `R11_shadow_${org}`,
      ebletPath,
      content: `# Written by ${org}\n\nSequence intent: ${idx + 1}`,
      provenance: { session: "BP011", decisionId: `T3-ORG-${org}` },
    })
  );

  const results = await Promise.all(writes);

  // All 5 writes must succeed (no throws)
  assert.strictEqual(results.length, 5, "all 5 writes must complete");

  // All receipts must have sequential sequence numbers 1–5
  const sequences = results.map(r => r.stoneReceipt.sequence).sort((a, b) => a - b);
  assert.deepStrictEqual(sequences, [1, 2, 3, 4, 5],
    "Stone ledger must have exactly sequences 1–5 (serialized)");

  // Write 1 (sequence=1) has no conflict; writes 2–5 have conflicts
  const noConflict = results.filter(r => r.conflict === undefined);
  const withConflict = results.filter(r => r.conflict !== undefined);
  assert.strictEqual(noConflict.length, 1, "exactly 1 write with no conflict (the first to acquire mutex)");
  assert.strictEqual(withConflict.length, 4, "exactly 4 writes with conflict (concurrent hash divergence)");

  // Each conflict should be hash_divergence type
  for (const r of withConflict) {
    assert.strictEqual(r.conflict.type, "hash_divergence");
    assert.ok(typeof r.conflict.callerHash === "string",
      "callerHash must be present");
    assert.ok(typeof r.conflict.existingHash === "string",
      "existingHash must be present");
  }

  // Eblet file must exist and contain the last writer's content
  assert.ok(existsSync(ebletPath), "eblet file must exist after all writes");
  const diskContent = readFileSync(ebletPath, "utf-8");
  // Last writer wins — disk content must be one of the 5 org contents
  assert.ok(
    organisms.some(org => diskContent.includes(org)),
    "disk eblet content must belong to one of the 5 orgs"
  );
});

// ─── Test 4: Read-after-conflict ─────────────────────────────────────────────

test("T4: read-after-conflict returns last Eblet content + Stone showing all 5 attempts", async () => {
  const ebletPath = join(TMP_DIR, "t4_topic.eblet.md");
  const organisms = ["a1", "a2", "a3", "a4", "a5"];

  await Promise.all(organisms.map((org) =>
    ironTabletWrite({
      scribeId: `shadow_${org}`,
      ebletPath,
      content: `org-${org}-content`,
      provenance: { session: "BP011" },
    })
  ));

  const readResult = await ironTabletRead(ebletPath);

  assert.ok(readResult, "readResult must be non-null");
  assert.ok(typeof readResult.content === "string" && readResult.content.length > 0,
    "content must be a non-empty string");
  assert.ok(
    organisms.some(org => readResult.content.includes(org)),
    "content must belong to one of the 5 orgs (last-writer-wins)"
  );
  assert.strictEqual(readResult.stoneProvenance.length, 5,
    "Stone Tablet must preserve all 5 write attempts");

  // Provenance entries must have sequences 1–5 in order
  const seqs = readResult.stoneProvenance.map(p => p.sequence);
  assert.deepStrictEqual(seqs, [1, 2, 3, 4, 5], "provenance must be in sequence order");
});

// ─── Test 5: Atomicity / partial-state recovery via Stone Tablet ─────────────

test("T5: after eblet file deletion, Stone Tablet ledger survives for replay provenance", async () => {
  const ebletPath = join(TMP_DIR, "t5_topic.eblet.md");

  // Write some entries
  await ironTabletWrite({
    scribeId: "recovery_alpha",
    ebletPath,
    content: "first committed content",
    provenance: { session: "BP011", decisionId: "T5-FIRST" },
  });
  await ironTabletWrite({
    scribeId: "recovery_beta",
    ebletPath,
    content: "second committed content",
    provenance: { session: "BP011", decisionId: "T5-SECOND" },
  });

  // Simulate corruption: delete the eblet file (mid-state loss)
  if (existsSync(ebletPath)) unlinkSync(ebletPath);

  // Eblet file is gone — read should return null content or empty
  const readResult = await ironTabletRead(ebletPath);
  assert.ok(readResult === null || readResult.content === "",
    "after eblet deletion, read should return null or empty content");

  // But provenance is intact via Stone Tablet ledger
  const provenance = await ironTabletProvenance(ebletPath);
  assert.ok(Array.isArray(provenance) && provenance.length === 2,
    "Stone Tablet ledger must have 2 entries despite eblet deletion");
  assert.strictEqual(provenance[0].decisionId, "T5-FIRST");
  assert.strictEqual(provenance[1].decisionId, "T5-SECOND");
  assert.ok(typeof provenance[0].hash === "string" && provenance[0].hash.length === 64,
    "each provenance entry has a content hash for replay");
  assert.ok(typeof provenance[1].hash === "string" && provenance[1].hash.length === 64);
});
