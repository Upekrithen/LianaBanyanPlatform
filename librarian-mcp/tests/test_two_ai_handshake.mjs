/**
 * test_two_ai_handshake.mjs — Bushel 21 / BP021
 * ===============================================
 * Tests for the 2-AI Thirteenth Warrior Pair Handshake primitive.
 *
 * Verification gates G1-G6:
 *   G1 — Handshake K-prompt class operational + IPv6 address-pair established
 *   G2 — Consent-gating exchange operational (Per-User Data Stamping checkmarks)
 *   G3 — Iceberg-tip exchange + Wrasse cross-instance routing operational
 *   G4 — Mordecai-Esther Pedestal Forum first-addition cross-pair operational
 *   G5 — Empirical comparison Arm A vs Arm B fire complete; Arm B ≥ Arm A substrate-coherence + cohort-redundancy
 *   G6 — Codex reserved + entry drafted
 *
 * Run: node --test tests/test_two_ai_handshake.mjs (after npm run build)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Environment isolation ─────────────────────────────────────────────────────

let TMP_DIR;
const ORIG_STITCHPUNKS = process.env.LIBRARIAN_STITCHPUNKS_DIR;

before(() => {
  TMP_DIR = mkdtempSync(join(tmpdir(), "bushel21-handshake-"));
  mkdirSync(TMP_DIR, { recursive: true });
  process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_DIR;
});

after(() => {
  // Restore env
  if (ORIG_STITCHPUNKS !== undefined) {
    process.env.LIBRARIAN_STITCHPUNKS_DIR = ORIG_STITCHPUNKS;
  } else {
    delete process.env.LIBRARIAN_STITCHPUNKS_DIR;
  }
  try {
    rmSync(TMP_DIR, { recursive: true, force: true });
  } catch { /* ignore Windows file locking */ }
});

const {
  initiateHandshake,
  exchangeIcebergTips,
  addPedestalForumDecree,
  loadPedestalDecrees,
  runSoloVsPairedComparison,
  draftBushel21Codex,
  loadHandshake,
  listHandshakes,
} = await import("../dist/federation/two_ai_handshake.js");

// ── G1: Handshake initiation + IPv6 address-pair ─────────────────────────────

test("G1a: initiateHandshake returns HandshakeReceipt with handshake_id and hive_thread_id", () => {
  const localFrameId = "LB-CAT.M-0001";
  const peerAddress = "2001:db8:6c:78::peer:0001:0002:0";
  const result = initiateHandshake(localFrameId, peerAddress, "substrate_only");

  assert.ok(!result.error, `Expected no error, got: ${result.error}`);
  assert.match(result.handshake_id, /^LB-HAND-/, "handshake_id must start with LB-HAND-");
  assert.ok(result.hive_thread_id, "hive_thread_id must be present");
  assert.strictEqual(result.phase, "initiated");
  assert.strictEqual(result.local_frame_id, localFrameId);
});

test("G1b: address_pair has local_address and peer_address, cohort_class=thirteenth_warrior", () => {
  const localFrameId = "LB-CAT.M-0002";
  const peerAddress = "2001:db8:6c:78::peer:0002:0003:0";
  const result = initiateHandshake(localFrameId, peerAddress, "curated_eblets");

  assert.ok(!result.error, `Unexpected error: ${result.error}`);
  const pair = result.address_pair;
  assert.ok(pair.local_address, "local_address must be present");
  assert.strictEqual(pair.peer_address, peerAddress);
  assert.strictEqual(pair.cohort_class, "thirteenth_warrior");
  assert.ok(pair.established_at, "established_at must be present");
});

test("G1c: invalid peerAddress returns error", () => {
  const result = initiateHandshake("LB-CAT.M-0003", "", "substrate_only");
  assert.ok(result.error, "Should return an error for empty peer address");
});

// ── G2: Consent-gating exchange ───────────────────────────────────────────────

test("G2a: consent_checkmarks populated with correct scope", () => {
  const result = initiateHandshake("LB-CAT.M-0004", "2001:db8:6c:78::peer:0004:0005:0", "aggregate_signals");
  assert.ok(!result.error);
  assert.ok(Array.isArray(result.consent_checkmarks), "consent_checkmarks must be array");
  assert.strictEqual(result.consent_checkmarks.length, 1, "Exactly 1 checkmark on initiation");
  assert.strictEqual(result.consent_checkmarks[0].scope, "aggregate_signals");
  assert.strictEqual(result.consent_checkmarks[0].granted_by, "LB-CAT.M-0004");
  assert.ok(result.consent_checkmarks[0].granted_at, "granted_at must be present");
});

test("G2b: Hive thread participants include local + peer, roles assigned", () => {
  const result = initiateHandshake("LB-CAT.M-0005", "2001:db8:6c:78::peer:0005:0006:0", "curated_eblets");
  assert.ok(!result.error);
  const thread = result.hive_thread;
  assert.strictEqual(thread.participants.length, 2, "Minimum-viable-cohort = 2 participants");
  assert.strictEqual(thread.cohort_class, "thirteenth_warrior");
  assert.ok(thread.bee_role_assignments, "bee_role_assignments must be present");
  const roles = Object.values(thread.bee_role_assignments);
  assert.ok(roles.includes("queen"), "Must have a queen");
  assert.ok(roles.includes("worker"), "Must have a worker");
});

test("G2c: Hive thread transitions to synthesizing state", () => {
  const result = initiateHandshake("LB-CAT.M-0006", "2001:db8:6c:78::peer:0006:0007:0", "substrate_only");
  assert.ok(!result.error);
  assert.strictEqual(result.hive_thread.state, "synthesizing", "Thread must be in synthesizing state");
});

// ── G3: Iceberg-tip exchange ──────────────────────────────────────────────────

test("G3a: exchangeIcebergTips returns IcebergExchange with wrasse_routing_key", () => {
  const initResult = initiateHandshake("LB-CAT.M-0010", "2001:db8:6c:78::peer:0010:0011:0", "curated_eblets");
  assert.ok(!initResult.error);

  const ebletIds = ["eblet-001", "eblet-002", "eblet-003"];
  const exchange = exchangeIcebergTips(initResult.handshake_id, "LB-CAT.M-0010", ebletIds, "curated_eblets");
  assert.ok(!exchange.error, `exchangeIcebergTips error: ${exchange.error}`);
  assert.strictEqual(exchange.handshake_id, initResult.handshake_id);
  assert.ok(exchange.local_exposure.wrasse_routing_key.startsWith("wrasse:cross-instance:"), "Wrasse routing key format");
  assert.strictEqual(exchange.cross_instance_routing_active, true);
  assert.deepEqual(exchange.local_exposure.eblet_ids, ebletIds);
});

test("G3b: exchangeIcebergTips with empty eblet_ids returns error", () => {
  const result = exchangeIcebergTips("LB-HAND-some-id", "LB-CAT.M-0011", [], "substrate_only");
  assert.ok(result.error, "Empty eblet_ids should return an error");
});

test("G3c: cross_instance_routing_active is true after exchange", () => {
  const init = initiateHandshake("LB-CAT.M-0012", "2001:db8:6c:78::peer:0012:0013:0", "full_iceberg_tip");
  assert.ok(!init.error);
  const exchange = exchangeIcebergTips(init.handshake_id, "LB-CAT.M-0012", ["eblet-A"], "full_iceberg_tip");
  assert.ok(!exchange.error);
  assert.strictEqual(exchange.cross_instance_routing_active, true);
});

// ── G4: Pedestal Forum decree-composition ────────────────────────────────────

test("G4a: addPedestalForumDecree returns PedestalForumReceipt with decree_id", () => {
  const init = initiateHandshake("LB-CAT.M-0020", "2001:db8:6c:78::peer:0020:0021:0", "curated_eblets");
  assert.ok(!init.error);

  const receipt = addPedestalForumDecree(
    init.handshake_id,
    "LB-CAT.M-0020",
    "By co-equal authority: HexIsle Federation Directive Alpha — cooperative build protocols apply."
  );
  assert.ok(!receipt.error, `addPedestalForumDecree error: ${receipt.error}`);
  assert.match(receipt.decree.decree_id, /^LB-DECREE-/, "decree_id format");
  assert.strictEqual(receipt.cross_iceberg_routed, true, "cross-iceberg routing active");
  assert.ok(receipt.coexists_with.includes(receipt.decree.decree_id), "decree coexists with itself");
});

test("G4b: contradictory decree coexists with original (co-equal authority)", () => {
  const init = initiateHandshake("LB-CAT.M-0021", "2001:db8:6c:78::peer:0021:0022:0", "curated_eblets");
  assert.ok(!init.error);

  const r1 = addPedestalForumDecree(init.handshake_id, "LB-CAT.M-0021", "Decree Alpha: prefer async build.");
  assert.ok(!r1.error);

  const r2 = addPedestalForumDecree(init.handshake_id, "peer-0021-frame", "Decree Beta: prefer sync build.",
    r1.decree.decree_id);
  assert.ok(!r2.error);

  // Both decrees must coexist
  assert.ok(r2.coexists_with.includes(r1.decree.decree_id), "decree B coexists with decree A");
  assert.ok(r2.coexists_with.includes(r2.decree.decree_id), "decree B coexists with itself");
  assert.strictEqual(r2.decree.contradicts_decree_id, r1.decree.decree_id, "contradicts pointer set");

  // Load decrees from store — both must persist
  const decrees = loadPedestalDecrees(init.handshake_id);
  assert.strictEqual(decrees.length, 2, "Both decrees must persist in the forum");
});

test("G4c: missing decreeText returns error", () => {
  const result = addPedestalForumDecree("LB-HAND-test", "LB-CAT.M-0022", "");
  assert.ok(result.error, "Empty decreeText should return error");
});

// ── G5: Empirical comparison (Arm A vs Arm B) ────────────────────────────────

test("G5a: runSoloVsPairedComparison returns comparison with Arm B ≥ Arm A substrate-coherence", () => {
  const init = initiateHandshake("LB-CAT.M-0030", "2001:db8:6c:78::peer:0030:0031:0", "curated_eblets");
  assert.ok(!init.error);

  const cmp = runSoloVsPairedComparison(init.handshake_id, "sentinel-task-class", 5);
  assert.ok(cmp.arm_b_wins_substrate_coherence, "Arm B must have higher substrate-coherence than Arm A");
  assert.ok(cmp.arm_b_wins_cohort_redundancy, "Arm B must have higher cohort-redundancy than Arm A");
  assert.ok(cmp.arm_b_throughput_parity, "Arm B throughput must be ≥ Arm A throughput");
  assert.strictEqual(cmp.task_class, "sentinel-task-class");
  assert.strictEqual(cmp.iterations, 5);
});

test("G5b: Arm A cohort_redundancy = 0 (solo has zero redundancy)", () => {
  const init = initiateHandshake("LB-CAT.M-0031", "2001:db8:6c:78::peer:0031:0032:0", "substrate_only");
  assert.ok(!init.error);
  const cmp = runSoloVsPairedComparison(init.handshake_id, "k-prompt-dispatch", 3);
  assert.strictEqual(cmp.arm_a_solo.cohort_redundancy_score, 0.00, "Solo has zero redundancy");
  assert.ok(cmp.arm_b_paired.cohort_redundancy_score > 0.5, "Paired has significant redundancy");
});

test("G5c: comparison receipt_ts is recent (ISO-8601)", () => {
  const init = initiateHandshake("LB-CAT.M-0032", "2001:db8:6c:78::peer:0032:0033:0", "aggregate_signals");
  assert.ok(!init.error);
  const cmp = runSoloVsPairedComparison(init.handshake_id, "pheromone-sweep", 2);
  const age = Date.now() - new Date(cmp.receipt_ts).getTime();
  assert.ok(age < 5000, "receipt_ts must be within 5s of now");
});

// ── G6: Codex draft ───────────────────────────────────────────────────────────

test("G6a: draftBushel21Codex allocates a Codex serial (LB-CODEX-NNNN)", () => {
  const init = initiateHandshake("LB-CAT.M-0040", "2001:db8:6c:78::peer:0040:0041:0", "curated_eblets");
  assert.ok(!init.error);
  const cmp = runSoloVsPairedComparison(init.handshake_id, "codex-test", 3);
  const codexId = draftBushel21Codex(init.handshake_id, cmp);
  assert.match(codexId, /^LB-CODEX-\d{4}$/, "Codex serial format LB-CODEX-NNNN");
});

test("G6b: listHandshakes returns the handshakes created during tests", () => {
  const all = listHandshakes();
  assert.ok(all.length >= 1, "Must have at least 1 handshake logged");
  assert.ok(all[0].handshake_id, "Each entry must have handshake_id");
  assert.ok(all[0].hive_thread_id, "Each entry must have hive_thread_id");
});

test("G6c: loadHandshake by id returns correct receipt", () => {
  const init = initiateHandshake("LB-CAT.M-0041", "2001:db8:6c:78::peer:0041:0042:0", "substrate_only");
  assert.ok(!init.error);
  const loaded = loadHandshake(init.handshake_id);
  assert.ok(loaded, "loadHandshake must return a receipt");
  assert.strictEqual(loaded.handshake_id, init.handshake_id);
  assert.strictEqual(loaded.local_frame_id, "LB-CAT.M-0041");
});
