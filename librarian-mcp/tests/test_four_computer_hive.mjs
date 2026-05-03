/**
 * test_four_computer_hive.mjs — Bushel 30 / BP021
 * =================================================
 * Tests for 4-Computer Federation Apiarist Hive + HexIsle Game Audit + Fates routing.
 *
 * Verification gates G1-G7:
 *   G1 — HexIsle Game UI implementation status audit complete (33 innovations)
 *   G2 — 4-organism Apiarist Hive thread spawn validated empirically
 *   G3 — IPv6-Federation translation across 4 instances operational
 *   G4 — 50%-uptime cap honored per BP016 (4-organism cohort)
 *   G5 — Fates routing state check complete + report
 *   G6 — Major Project readiness baseline report produced
 *   G7 — Codex reserved + entry drafted
 *
 * Run: node --test tests/test_four_computer_hive.mjs (after npm run build)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let TMP_DIR;
const ORIG_STITCHPUNKS = process.env.LIBRARIAN_STITCHPUNKS_DIR;

before(() => {
  TMP_DIR = mkdtempSync(join(tmpdir(), "bushel30-four-hive-"));
  mkdirSync(TMP_DIR, { recursive: true });
  process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_DIR;
});

after(() => {
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
  spawnFourOrganismCohort,
  checkFatesRoutingState,
  getAuditSummary,
  HEXISLE_INNOVATION_AUDIT,
  ORGANISM_COUNT,
  UPTIME_CAP_PCT,
  HEARTBEAT_INTERVAL_SECONDS,
  listCohorts,
  loadHeartbeats,
  draftBushel30Codex,
} = await import("../dist/federation/four_computer_hive.js");

const FOUR_FRAMES = [
  "LB-CAT.M-COMP-1",
  "LB-CAT.M-COMP-2",
  "LB-CAT.M-COMP-3",
  "LB-CAT.M-COMP-4",
];

// ── G1: HexIsle Game UI audit ─────────────────────────────────────────────────

test("G1a: HEXISLE_INNOVATION_AUDIT covers all 33 innovations", () => {
  assert.strictEqual(HEXISLE_INNOVATION_AUDIT.length, 33, "Must audit all 33 innovations");
});

test("G1b: audit has 3 status levels (built/stubbed/missing)", () => {
  const statuses = new Set(HEXISLE_INNOVATION_AUDIT.map((e) => e.ui_status));
  assert.ok(statuses.has("built"), "Must have 'built' entries");
  assert.ok(statuses.has("stubbed"), "Must have 'stubbed' entries");
  assert.ok(statuses.has("missing"), "Must have 'missing' entries");
});

test("G1c: getAuditSummary totals sum to 33", () => {
  const summary = getAuditSummary();
  assert.strictEqual(summary.total, 33);
  assert.strictEqual(summary.built + summary.stubbed + summary.missing, 33,
    "built + stubbed + missing must equal 33");
});

test("G1d: critical_missing list identifies core gameplay loop innovations", () => {
  const summary = getAuditSummary();
  assert.ok(Array.isArray(summary.critical_missing));
  // Ouralis (#3) and Sawtooth60 (#4) are critical_missing
  const names = summary.critical_missing.map((s) => s.toLowerCase());
  assert.ok(
    names.some((n) => n.includes("ouralis") || n.includes("3")),
    "Ouralis (#3) should be in critical_missing"
  );
  assert.ok(
    names.some((n) => n.includes("sawtooth") || n.includes("4")),
    "Sawtooth60 (#4) should be in critical_missing or stubbed with note"
  );
});

test("G1e: all 33 entries have innovation_number 1-33", () => {
  const numbers = HEXISLE_INNOVATION_AUDIT.map((e) => e.innovation_number).sort((a, b) => a - b);
  for (let i = 1; i <= 33; i++) {
    assert.ok(numbers.includes(i), `Innovation #${i} must be in audit`);
  }
});

// ── G2: 4-organism Hive thread spawn ─────────────────────────────────────────

test("G2a: spawnFourOrganismCohort returns receipt with cohort_id", () => {
  const receipt = spawnFourOrganismCohort(FOUR_FRAMES, "BP021");
  assert.ok(!receipt.error, `spawnFourOrganismCohort error: ${receipt.error}`);
  assert.match(receipt.cohort_id, /^LB-COHORT-/, "cohort_id must start with LB-COHORT-");
  assert.strictEqual(receipt.organisms.length, ORGANISM_COUNT, "Must have 4 organisms");
});

test("G2b: hive_thread_id is set and state is synthesizing", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-B-1", "LB-CAT.M-B-2", "LB-CAT.M-B-3", "LB-CAT.M-B-4"
  ], "BP021");
  assert.ok(!receipt.error);
  assert.ok(receipt.hive_thread_id, "hive_thread_id must be present");
  assert.strictEqual(receipt.hive_thread_state, "synthesizing", "Thread must be in synthesizing state");
});

test("G2c: wrong number of frame IDs returns error", () => {
  const result = spawnFourOrganismCohort(["only-one", "two", "three"], "BP021");
  assert.ok(result.error, "Should error with wrong organism count");
});

test("G2d: cross_cohort_writeback_active is true", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-C-1", "LB-CAT.M-C-2", "LB-CAT.M-C-3", "LB-CAT.M-C-4"
  ], "BP021");
  assert.ok(!receipt.error);
  assert.strictEqual(receipt.cross_cohort_writeback_active, true);
});

// ── G3: IPv6-Federation translation across 4 instances ───────────────────────

test("G3a: all 4 organisms have distinct IPv6 addresses", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-D-1", "LB-CAT.M-D-2", "LB-CAT.M-D-3", "LB-CAT.M-D-4"
  ], "BP021");
  assert.ok(!receipt.error);
  const addresses = receipt.organisms.map((o) => o.ipv6_address);
  const unique = new Set(addresses);
  assert.strictEqual(unique.size, 4, "All 4 organisms must have distinct IPv6 addresses");
});

test("G3b: all addresses are non-empty strings", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-E-1", "LB-CAT.M-E-2", "LB-CAT.M-E-3", "LB-CAT.M-E-4"
  ], "BP021");
  assert.ok(!receipt.error);
  for (const org of receipt.organisms) {
    assert.ok(org.ipv6_address && org.ipv6_address.length > 0, `Organism ${org.organism_id} must have IPv6 address`);
  }
});

test("G3c: organisms labeled computer-1 through computer-4", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-F-1", "LB-CAT.M-F-2", "LB-CAT.M-F-3", "LB-CAT.M-F-4"
  ], "BP021");
  assert.ok(!receipt.error);
  const labels = receipt.organisms.map((o) => o.computer_label);
  assert.ok(labels.includes("computer-1"), "computer-1 must be present");
  assert.ok(labels.includes("computer-4"), "computer-4 must be present");
});

// ── G4: 50%-uptime cap honored ────────────────────────────────────────────────

test("G4a: all organisms report uptime_cap_honored = true", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-G-1", "LB-CAT.M-G-2", "LB-CAT.M-G-3", "LB-CAT.M-G-4"
  ], "BP021");
  assert.ok(!receipt.error);
  for (const org of receipt.organisms) {
    assert.strictEqual(org.uptime_cap_honored, true, `${org.computer_label} must have cap honored`);
  }
});

test("G4b: uptime_cap_pct is 50", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-H-1", "LB-CAT.M-H-2", "LB-CAT.M-H-3", "LB-CAT.M-H-4"
  ], "BP021");
  assert.ok(!receipt.error);
  assert.strictEqual(receipt.uptime_cap_pct, UPTIME_CAP_PCT, "uptime_cap_pct must be 50");
});

test("G4c: heartbeat interval is 60 seconds", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-I-1", "LB-CAT.M-I-2", "LB-CAT.M-I-3", "LB-CAT.M-I-4"
  ], "BP021");
  assert.ok(!receipt.error);
  assert.strictEqual(receipt.heartbeat_interval_seconds, HEARTBEAT_INTERVAL_SECONDS);
});

test("G4d: heartbeat entries emitted for all 4 organisms", () => {
  const receipt = spawnFourOrganismCohort([
    "LB-CAT.M-J-1", "LB-CAT.M-J-2", "LB-CAT.M-J-3", "LB-CAT.M-J-4"
  ], "BP021");
  assert.ok(!receipt.error);
  const heartbeats = loadHeartbeats(receipt.cohort_id);
  assert.strictEqual(heartbeats.length, 4, "4 heartbeat entries on spawn");
  for (const hb of heartbeats) {
    assert.strictEqual(hb.tokens_consumed, 5000, "tokens_consumed matches first-live-Sipping receipt");
    assert.strictEqual(hb.session_ref, "BP021");
  }
});

// ── G5: Fates routing state check ─────────────────────────────────────────────

test("G5a: checkFatesRoutingState returns a report with 3 routing classes", () => {
  const report = checkFatesRoutingState();
  assert.ok(report.hexisle_game_routing, "hexisle_game_routing must be present");
  assert.ok(report.four_computer_federation_routing, "four_computer_federation_routing must be present");
  assert.ok(report.major_project_routing, "major_project_routing must be present");
  assert.ok(report.check_ts, "check_ts must be present");
});

test("G5b: HexIsle routing has scribes_aware (Architecture, KnightQueue)", () => {
  const report = checkFatesRoutingState();
  assert.ok(Array.isArray(report.hexisle_game_routing.scribes_aware));
  assert.ok(report.hexisle_game_routing.scribes_aware.length > 0, "Must have scribes aware of HexIsle");
});

test("G5c: Major Project routing is flagged as UNKNOWN (gap to close)", () => {
  const report = checkFatesRoutingState();
  assert.strictEqual(report.major_project_routing.routing_known, false,
    "Major Project routing is not yet configured — this is expected and must be flagged");
  assert.ok(report.gaps.length > 0, "There must be routing gaps to close before Major Project");
});

// ── G6 + G7: Readiness baseline + Codex ──────────────────────────────────────

test("G6+G7: draftBushel30Codex allocates LB-CODEX-NNNN", () => {
  const cohortReceipt = spawnFourOrganismCohort([
    "LB-CAT.M-K-1", "LB-CAT.M-K-2", "LB-CAT.M-K-3", "LB-CAT.M-K-4"
  ], "BP021");
  assert.ok(!cohortReceipt.error);

  const fatesReport = checkFatesRoutingState();
  const codexId = draftBushel30Codex(cohortReceipt, fatesReport);

  assert.match(codexId, /^LB-CODEX-\d{4}$/, "Codex serial format LB-CODEX-NNNN");
});

test("G7b: listCohorts returns spawned cohorts", () => {
  const cohorts = listCohorts();
  assert.ok(cohorts.length >= 1, "Must have at least 1 cohort logged");
  assert.ok(cohorts[0].cohort_id, "Each entry must have cohort_id");
});
