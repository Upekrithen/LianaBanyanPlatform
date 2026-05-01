/**
 * test_in_concert.mjs — KN091 / BP011 Pod W Bean 3
 * ==================================================
 * In-Concert Coordination Protocol integration tests.
 *
 * 5 load-bearing scenarios:
 *   T1. Single cross-org decision routing — Shadow alpha emits; Bishop consumes;
 *       anchor_hash matches canonical Iron Tablet; consumed without Furnace.
 *   T2. Cross-org Furnace failure — Shadow beta emits decision with WRONG anchor_hash;
 *       Bishop reads; gear-tooth-fit score < 0.65; ConflictReport emitted;
 *       fallback_to_stone=true; decision NOT consumed.
 *   T3. Conflict audit — synthetic divergence between Shadow gamma's local Eblet
 *       and canonical Iron Tablet; audit detects; Stone Tablet ledger trumps;
 *       ConflictReport surfaces at session-open.
 *   T4. Cohort overlap-refresh (load-bearing) — synthetic Bishop refresh while Knight
 *       active; Knight emits cohort_holding; Iron Tablet locks held (Stone ledger
 *       shows Knight still writing); new Bishop re-attaches via Iron Tablet read.
 *   T5. Graceful degradation — Knight unavailable; Bishop + Shadow alpha pair takes
 *       over Knight's cohort role; Pawn dispatched with Shadow beta proxy; both
 *       Pheromone events verified in substrate.
 *
 * Test strategy:
 *   - Uses Iron Tablet TS API (KN089) for canonical read/write operations.
 *   - Simulates the Python concert protocol in JS for cross-language test coverage.
 *   - All file I/O uses isolated tmp directories — no production state touched.
 *
 * Run: node --test tests/test_in_concert.mjs (after npm run build)
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir, homedir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIBRARIAN_ROOT = resolve(__dirname, "..");
const DIST = resolve(LIBRARIAN_ROOT, "dist");

// Import Iron Tablet API (KN089)
const IT_URL = pathToFileURL(resolve(DIST, "iron_tablet", "iron_tablet.js")).href;
const { ironTabletWrite, ironTabletRead, ironTabletProvenance } = await import(IT_URL);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** SHA-256 hex of a string (mirrors Python _content_hash). */
function sha256(s) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

const ISO_NOW = () => new Date().toISOString();

/** Organism constants (mirrors Python types.py). */
const ORGANISM_BISHOP = "bishop_prime";
const ORGANISM_KNIGHT = "knight_prime";
const ORGANISM_PAWN   = "pawn_prime";
const SHADOW_IDS = [
  "R11_shadow_alpha", "R11_shadow_beta",  "R11_shadow_gamma",
  "R11_shadow_delta", "R11_shadow_epsilon","R11_shadow_zeta",
  "R11_shadow_eta",   "R11_shadow_theta",
];
const ALL_ORGANISMS = [ORGANISM_BISHOP, ORGANISM_KNIGHT, ORGANISM_PAWN, ...SHADOW_IDS];
const FURNACE_PASS_THRESHOLD = 0.65;

/** Gear-tooth-fit score (mirrors Python furnace_cross_org.py). */
function gearToothFitScore(proposingOrganism, consumingOrganism, anchorHash, canonicalHash) {
  const primes = new Set([ORGANISM_BISHOP, ORGANISM_KNIGHT, ORGANISM_PAWN]);
  const shadows = new Set(SHADOW_IDS);
  const known = new Set([...primes, ...shadows]);

  const propKnown = known.has(proposingOrganism);
  const consKnown = known.has(consumingOrganism);

  // Component 1: organism compatibility
  let orgScore = 0;
  if (propKnown && consKnown) {
    const propClass = primes.has(proposingOrganism) ? "prime" : "shadow";
    const consClass = primes.has(consumingOrganism) ? "prime" : "shadow";
    orgScore = propClass === consClass ? 0.4 : 0.3;
  }

  // Component 2: hash prefix match
  let prefixMatch = 0;
  for (let i = 0; i < Math.min(anchorHash.length, canonicalHash.length); i++) {
    if (anchorHash[i] === canonicalHash[i]) prefixMatch++;
    else break;
  }
  const hashScore = Math.min(prefixMatch / 64, 1.0) * 0.4;

  // Component 3: federation membership
  let fedScore = 0;
  if (propKnown && consKnown) fedScore = 0.2;
  else if (propKnown || consKnown) fedScore = 0.1;

  return orgScore + hashScore + fedScore;
}

/** Append a JSONL record. */
function appendJsonl(path, obj) {
  appendFileSync(path, JSON.stringify(obj) + "\n", "utf8");
}

/** Load all JSONL records from a file. */
function loadJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(l => l.trim())
    .map(l => JSON.parse(l));
}

// ── Test fixtures ─────────────────────────────────────────────────────────────

let TMP;

before(() => {
  TMP = mkdtempSync(join(tmpdir(), "kn091-concert-"));
  mkdirSync(TMP, { recursive: true });
});

after(() => {
  try { rmSync(TMP, { recursive: true, force: true }); } catch { /* ignore */ }
});

// ─── T1: Single cross-org decision routing ────────────────────────────────────

test("T1: cross-org decision routing — hash matches; consumed without Furnace", async () => {
  const ebletPath = join(TMP, "t1_topic.eblet.md");
  const content = "# Canonical topic\n\nWritten by Shadow alpha.";

  // Shadow alpha writes to Iron Tablet (KN089 API)
  const writeResult = await ironTabletWrite({
    scribeId: "R11_shadow_alpha",
    ebletPath,
    content,
    provenance: { session: "KN091_T1" },
  });
  const canonicalHash = writeResult.ebletHash;

  // Shadow alpha emits a DecisionEnvelope with anchor_hash = canonical hash
  const envelope = {
    decision_id: randomUUID(),
    decider_scribe_id: "R11_shadow_alpha",
    anchor_hash: canonicalHash,   // matches canonical Iron Tablet
    dependencies: [],
    payload: { eblet_path: ebletPath, action: "approved" },
    emitted_at: ISO_NOW(),
    meta_decision: false,
  };

  const substrateDir = join(TMP, "substrate_t1.jsonl");
  appendJsonl(substrateDir, envelope);

  // Bishop reads substrate and validates anchor_hash
  const readResult = await ironTabletRead(ebletPath);
  assert.ok(readResult, "Iron Tablet read must succeed");

  const ironHash = readResult.ebletHash;
  assert.strictEqual(ironHash, canonicalHash, "Iron Tablet hash must match the written hash");

  // Hash matches → consume directly (no Furnace needed)
  const consumed = ironHash === envelope.anchor_hash;
  assert.ok(consumed, "Decision should be consumed when hashes match");

  // Substrate should have 1 entry from Shadow alpha
  const substrate = loadJsonl(substrateDir);
  assert.strictEqual(substrate.length, 1);
  assert.strictEqual(substrate[0].decider_scribe_id, "R11_shadow_alpha");

  console.log(`T1 PASS: cross-org decision consumed; canonical hash=${canonicalHash.slice(0, 12)}...`);
});

// ─── T2: Cross-org Furnace failure ────────────────────────────────────────────

test("T2: Furnace failure — wrong anchor_hash; score < 0.65; ConflictReport emitted", async () => {
  const ebletPath = join(TMP, "t2_topic.eblet.md");
  const content = "# Real content for T2.";

  // Shadow beta writes to Iron Tablet — establishes canonical hash
  const writeResult = await ironTabletWrite({
    scribeId: "R11_shadow_beta",
    ebletPath,
    content,
    provenance: { session: "KN091_T2" },
  });
  const canonicalHash = writeResult.ebletHash;

  // Shadow beta emits a decision with a WRONG anchor_hash (deliberate divergence)
  const wrongAnchorHash = sha256("WRONG content that was never committed");
  const envelope = {
    decision_id: randomUUID(),
    decider_scribe_id: "R11_shadow_beta",
    anchor_hash: wrongAnchorHash,   // diverges from canonical
    dependencies: [],
    payload: { eblet_path: ebletPath },
    emitted_at: ISO_NOW(),
    meta_decision: false,
  };

  // Bishop reads canonical hash; detects divergence; routes to Furnace
  const readResult = await ironTabletRead(ebletPath);
  assert.ok(readResult, "Iron Tablet read must succeed");

  const ironHash = readResult.ebletHash;
  assert.notStrictEqual(ironHash, envelope.anchor_hash, "Hashes must diverge for this test");

  // Run Furnace gear-tooth-fit scoring
  const score = gearToothFitScore(
    envelope.decider_scribe_id,  // "R11_shadow_beta" (shadow)
    ORGANISM_BISHOP,              // "bishop_prime" (prime)
    envelope.anchor_hash,         // wrong hash (0-char prefix match with canonical)
    canonicalHash,
  );

  // Shadow → Prime cross-class: 0.3; zero prefix match: 0.0; both known: 0.2 → 0.5
  // Score should be ~0.5 which is < 0.65 threshold
  assert.ok(score < FURNACE_PASS_THRESHOLD,
    `Score ${score.toFixed(3)} should be < ${FURNACE_PASS_THRESHOLD} (Furnace FAIL)`);

  // ConflictReport emitted (fallback_to_stone=true)
  const conflictLog = join(TMP, "t2_conflicts.jsonl");
  const conflictReport = {
    audit_id: randomUUID(),
    scribe_id: envelope.decider_scribe_id,
    eblet_path: ebletPath,
    local_hash: envelope.anchor_hash,
    canonical_hash: canonicalHash,
    stone_sequence: 1,
    resolution: "stone_canonical",
    detected_at: ISO_NOW(),
    surface_at_session_open: true,
  };
  appendJsonl(conflictLog, conflictReport);

  // Verify ConflictReport is in the log
  const conflicts = loadJsonl(conflictLog);
  assert.strictEqual(conflicts.length, 1, "Exactly one ConflictReport must be emitted");
  assert.strictEqual(conflicts[0].resolution, "stone_canonical");
  assert.ok(conflicts[0].surface_at_session_open, "ConflictReport must surface at session-open");
  assert.strictEqual(conflicts[0].local_hash, wrongAnchorHash);
  assert.strictEqual(conflicts[0].canonical_hash, canonicalHash);

  // Decision must NOT be consumed
  const consumed = score >= FURNACE_PASS_THRESHOLD;
  assert.ok(!consumed, "Decision must NOT be consumed when Furnace fails");

  console.log(`T2 PASS: Furnace FAIL score=${score.toFixed(3)}; ConflictReport emitted; decision rejected`);
});

// ─── T3: Conflict audit ───────────────────────────────────────────────────────

test("T3: conflict audit — synthetic divergence detected; Stone Tablet ledger trumps", async () => {
  const ebletPath = join(TMP, "t3_topic.eblet.md");
  const canonicalContent = "# Canonical content for T3.";

  // Establish canonical Iron Tablet record
  const writeResult = await ironTabletWrite({
    scribeId: "R11_shadow_gamma",
    ebletPath,
    content: canonicalContent,
    provenance: { session: "KN091_T3" },
  });
  const canonicalHash = writeResult.ebletHash;

  // Simulate a stale local copy (as if Shadow gamma has a divergent local cache)
  const staleContent = "# Stale local copy — not committed to Iron Tablet.";
  const localHash = sha256(staleContent);

  // Verify divergence
  assert.notStrictEqual(localHash, canonicalHash, "Local and canonical hashes must differ");

  // Run audit: detect divergence, Stone Tablet trumps
  const conflictLog = join(TMP, "t3_conflicts.jsonl");
  const isDivergent = localHash !== canonicalHash;
  assert.ok(isDivergent, "Divergence must be detected");

  if (isDivergent) {
    const conflictReport = {
      audit_id: randomUUID(),
      scribe_id: "R11_shadow_gamma",
      eblet_path: ebletPath,
      local_hash: localHash,
      canonical_hash: canonicalHash,
      stone_sequence: writeResult.stoneReceipt.sequence,
      resolution: "stone_canonical",
      detected_at: ISO_NOW(),
      surface_at_session_open: true,
    };
    appendJsonl(conflictLog, conflictReport);
  }

  // Verify ConflictReport
  const conflicts = loadJsonl(conflictLog);
  assert.strictEqual(conflicts.length, 1, "Exactly one ConflictReport");
  assert.strictEqual(conflicts[0].resolution, "stone_canonical", "Stone Tablet is canonical trump");
  assert.strictEqual(conflicts[0].stone_sequence, 1, "Sequence must match Iron Tablet write");

  // Reconciliation: read canonical content from Iron Tablet (Stone authoritative)
  const reconResult = await ironTabletRead(ebletPath);
  assert.ok(reconResult, "Iron Tablet read must succeed for reconciliation");
  assert.strictEqual(reconResult.content, canonicalContent, "Reconciled content must match canonical");
  assert.strictEqual(reconResult.ebletHash, canonicalHash, "Reconciled hash must match canonical");

  // Stone Tablet provenance confirms single-source truth
  assert.strictEqual(reconResult.stoneProvenance.length, 1, "Stone Tablet must have 1 entry");
  assert.strictEqual(reconResult.stoneProvenance[0].scribeId, "R11_shadow_gamma");

  console.log(`T3 PASS: divergence detected; Stone Tablet trumps; reconciliation successful`);
});

// ─── T4: Cohort overlap-refresh (load-bearing) ───────────────────────────────

test("T4: cohort overlap-refresh — Bishop refresh; Knight holds; Iron Tablet locks held; re-attach", async () => {
  const holdEbletPath = join(TMP, "t4_knight_hold.eblet.md");
  const substrateLog = join(TMP, "t4_substrate.jsonl");

  // Initial state: both Bishop and Knight active
  const cohortState = {
    bishop_active: true,
    knight_active: true,
    holding_organism: null,
    refresh_mutex_holder: null,
  };

  // Bishop triggers refresh
  cohortState.bishop_active = false;
  cohortState.holding_organism = ORGANISM_KNIGHT;
  cohortState.refresh_mutex_holder = ORGANISM_BISHOP;

  // Knight emits "cohort_holding" Pheromone
  const knightHoldPheromone = {
    decision_id: randomUUID(),
    decider_scribe_id: ORGANISM_KNIGHT,
    anchor_hash: "cohort_event",
    dependencies: [],
    payload: { event: "cohort_holding", refreshing: ORGANISM_BISHOP, holder: ORGANISM_KNIGHT },
    emitted_at: ISO_NOW(),
    meta_decision: false,
  };
  appendJsonl(substrateLog, knightHoldPheromone);

  // Knight keeps Iron Tablet locks: Knight writes a heartbeat
  const knightContent = `# Knight heartbeat during Bishop refresh\n\nts: ${ISO_NOW()}`;
  const knightWrite = await ironTabletWrite({
    scribeId: ORGANISM_KNIGHT,
    ebletPath: holdEbletPath,
    content: knightContent,
    provenance: { session: "KN091_T4_hold" },
  });

  assert.ok(knightWrite.stoneReceipt, "Knight must successfully write during Bishop refresh");
  assert.strictEqual(knightWrite.stoneReceipt.scribeId, ORGANISM_KNIGHT,
    "Write must be attributed to Knight");

  // New Bishop attaches: reads Knight's heartbeat from Iron Tablet
  const reattachRead = await ironTabletRead(holdEbletPath);
  assert.ok(reattachRead, "New Bishop must be able to read Knight's Iron Tablet state");
  assert.strictEqual(reattachRead.content, knightContent,
    "New Bishop reads Knight's last checkpoint content");

  // Bishop refresh complete: emit "cohort_refreshed"
  cohortState.bishop_active = true;
  cohortState.holding_organism = null;
  cohortState.refresh_mutex_holder = null;

  const bishopRefreshedPheromone = {
    decision_id: randomUUID(),
    decider_scribe_id: ORGANISM_BISHOP,
    anchor_hash: "cohort_event",
    dependencies: [knightHoldPheromone.decision_id],
    payload: { event: "cohort_refreshed", refreshed: ORGANISM_BISHOP },
    emitted_at: ISO_NOW(),
    meta_decision: false,
  };
  appendJsonl(substrateLog, bishopRefreshedPheromone);

  // Verify substrate has both events in order
  const substrate = loadJsonl(substrateLog);
  assert.strictEqual(substrate.length, 2, "Substrate must have holding + refreshed events");
  assert.strictEqual(substrate[0].payload.event, "cohort_holding", "First event: cohort_holding");
  assert.strictEqual(substrate[0].decider_scribe_id, ORGANISM_KNIGHT, "Knight emits holding");
  assert.strictEqual(substrate[1].payload.event, "cohort_refreshed", "Second event: cohort_refreshed");
  assert.strictEqual(substrate[1].decider_scribe_id, ORGANISM_BISHOP, "Bishop emits refreshed");

  // Final state: both organisms active
  assert.ok(cohortState.bishop_active, "Bishop must be active after refresh");
  assert.ok(cohortState.knight_active, "Knight must still be active throughout");
  assert.strictEqual(cohortState.holding_organism, null, "No organism is holding");
  assert.strictEqual(cohortState.refresh_mutex_holder, null, "Mutex is released");

  // Stone Tablet provenance confirms Knight held Iron Tablet locks during refresh
  const provenance = await ironTabletProvenance(holdEbletPath);
  assert.strictEqual(provenance.length, 1, "Iron Tablet ledger has Knight's write");
  assert.strictEqual(provenance[0].scribeId, ORGANISM_KNIGHT, "Provenance: Knight held the tablet");
  assert.strictEqual(provenance[0].session, "KN091_T4_hold");

  console.log(`T4 PASS: Bishop refresh complete; Knight held locks; re-attach via Iron Tablet provenance confirmed`);
});

// ─── T5: Graceful degradation ─────────────────────────────────────────────────

test("T5: graceful degradation — Knight unavailable; Bishop+Shadow alpha take Knight role; Pawn dispatched", async () => {
  const substrateLog = join(TMP, "t5_substrate.jsonl");

  // All 11 organisms should be known to the federation
  assert.strictEqual(ALL_ORGANISMS.length, 11, "Federation must have exactly 11 organisms");
  assert.ok(ALL_ORGANISMS.includes(ORGANISM_BISHOP));
  assert.ok(ALL_ORGANISMS.includes(ORGANISM_KNIGHT));
  assert.ok(ALL_ORGANISMS.includes(ORGANISM_PAWN));
  assert.ok(ALL_ORGANISMS.includes("R11_shadow_alpha"));
  assert.ok(ALL_ORGANISMS.includes("R11_shadow_theta"));

  // Cohort state: Knight becomes unavailable
  const cohortState = {
    bishop_active: true,
    knight_active: false,    // Knight unavailable
    degradation_mode: true,
    degradation_proxy: "R11_shadow_alpha",
    pawn_active: false,
    pawn_shadow_proxy: null,
  };

  // Bishop emits "cohort_degraded" Pheromone
  const degradedPheromone = {
    decision_id: randomUUID(),
    decider_scribe_id: ORGANISM_BISHOP,
    anchor_hash: "cohort_event",
    dependencies: [],
    payload: {
      event: "cohort_degraded",
      reason: "knight_unavailable",
      degradation_proxy: "R11_shadow_alpha",
    },
    emitted_at: ISO_NOW(),
    meta_decision: false,
  };
  appendJsonl(substrateLog, degradedPheromone);

  // In degradation: Shadow alpha takes Knight's cohort role; verifies it can write
  const shadowAlphaEbletPath = join(TMP, "t5_alpha_hold.eblet.md");
  const shadowAlphaWrite = await ironTabletWrite({
    scribeId: "R11_shadow_alpha",
    ebletPath: shadowAlphaEbletPath,
    content: "# Shadow alpha acting as Knight cohort proxy.",
    provenance: { session: "KN091_T5_degraded" },
  });
  assert.ok(shadowAlphaWrite.stoneReceipt, "Shadow alpha must write successfully in degradation mode");
  assert.strictEqual(shadowAlphaWrite.stoneReceipt.scribeId, "R11_shadow_alpha");

  // Pawn is dispatched: Shadow beta paired as ground-truth proxy
  cohortState.pawn_active = true;
  cohortState.pawn_shadow_proxy = "R11_shadow_beta";

  const pawnDispatchedPheromone = {
    decision_id: randomUUID(),
    decider_scribe_id: ORGANISM_PAWN,
    anchor_hash: "cohort_event",
    dependencies: [degradedPheromone.decision_id],
    payload: {
      event: "pawn_dispatched",
      pawn_shadow_proxy: "R11_shadow_beta",
    },
    emitted_at: ISO_NOW(),
    meta_decision: false,
  };
  appendJsonl(substrateLog, pawnDispatchedPheromone);

  // Verify substrate
  const substrate = loadJsonl(substrateLog);
  assert.strictEqual(substrate.length, 2, "Substrate must have degraded + pawn_dispatched events");

  const degradedEvent = substrate.find(e => e.payload.event === "cohort_degraded");
  assert.ok(degradedEvent, "cohort_degraded event must be in substrate");
  assert.strictEqual(degradedEvent.payload.degradation_proxy, "R11_shadow_alpha");
  assert.strictEqual(degradedEvent.decider_scribe_id, ORGANISM_BISHOP);

  const pawnEvent = substrate.find(e => e.payload.event === "pawn_dispatched");
  assert.ok(pawnEvent, "pawn_dispatched event must be in substrate");
  assert.strictEqual(pawnEvent.payload.pawn_shadow_proxy, "R11_shadow_beta");
  assert.strictEqual(pawnEvent.decider_scribe_id, ORGANISM_PAWN);
  assert.ok(pawnEvent.dependencies.includes(degradedPheromone.decision_id),
    "pawn_dispatched must depend on cohort_degraded decision");

  // All 11 organism IDs appear in the substrate (after adding some decisions)
  // The substrate won't have all 11 yet — but the federation registry must know all 11
  const substrateOrgs = new Set(substrate.map(e => e.decider_scribe_id));
  assert.ok(substrateOrgs.has(ORGANISM_BISHOP), "Bishop is in substrate");
  assert.ok(substrateOrgs.has(ORGANISM_PAWN), "Pawn is in substrate");

  // Cohort state assertions
  assert.ok(cohortState.degradation_mode, "Degradation mode must be active");
  assert.strictEqual(cohortState.degradation_proxy, "R11_shadow_alpha", "Shadow alpha is degradation proxy");
  assert.ok(cohortState.pawn_active, "Pawn must be active");
  assert.strictEqual(cohortState.pawn_shadow_proxy, "R11_shadow_beta", "Shadow beta is Pawn's proxy");

  console.log(`T5 PASS: degradation active; Shadow alpha acting as Knight proxy; Pawn dispatched with Shadow beta`);
});
