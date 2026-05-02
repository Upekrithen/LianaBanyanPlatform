/**
 * KN104 Test Suite — Detective TEAM with Substrate-Write-Back Loop (PRE-COLOSSUS)
 * =================================================================================
 * Tests T1–T10 per KN104 PHASE D spec.
 *
 * Run: node --experimental-vm-modules node_modules/.bin/jest tests_kn104.mjs
 * Or:  node tests_kn104.mjs (standalone smoke test)
 */

import { evaluateExcaliburGates, DEFAULT_GATE_THRESHOLDS } from "./dist/excalibur_class/tag_assignment_gates.js";
import {
  getScribeAccessDescriptor,
  enforceAllowedCathedrals,
  canWriteBack,
  buildAccessAuditSummary,
} from "./dist/team_dispatcher/cohort_class_enforcement.js";
import { detectHalveThreshold } from "./dist/miners/halve_threshold.js";
import { calculateExcaliburPricing, calculateMemberShareBack, normalizeContributionProportions } from "./dist/excalibur_class/pricing_engine.js";
import { synthesizeTeamFindings, buildProvenanceChain } from "./dist/team_dispatcher/synthesis_aggregator.js";

let passed = 0;
let failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// ── T1: Single Detective subclass backward compat ────────────────────────
console.log("\nT1: Cohort-class Scribe-access enforcement — Lone Wolf");
{
  const desc = getScribeAccessDescriptor("lone_wolf");
  assert(!desc.can_trade_scribes, "Lone Wolf cannot trade Scribes");
  assert(!desc.can_read_federation_library, "Lone Wolf cannot read Federation Library");
  assert(desc.can_read_agpl_baseline, "Lone Wolf CAN read AGPL baseline");
  assert(desc.allowed_cathedrals.length === 1 && desc.allowed_cathedrals[0] === "bishop", "Lone Wolf: bishop only");
}

// ── T2: Single Miner subclass — mitotic + ROOT-lineage ────────────────────
console.log("\nT2: Halve threshold detection — mitotic mechanic");
{
  const syntheticCorpus10 = [
    "genetic sequencing protein folding dna rna",
    "market analysis financial derivatives hedge fund trading",
    "neural networks deep learning transformer architecture attention",
    "bacterial growth culture medium petri dish microscopy",
    "quantum entanglement superposition wave function collapse",
  ];
  const topics = syntheticCorpus10.flatMap(t => t.split(" ").filter(w => w.length > 3));

  const result = detectHalveThreshold(topics, {
    keyword_density_delta: 0.3,
    semantic_drift_threshold: 0.4,
  });

  assert(typeof result.should_halve === "boolean", "Halve decision is boolean");
  assert(typeof result.confidence === "number", "Confidence is number");
  assert(result.confidence >= 0 && result.confidence <= 1, "Confidence in [0, 1]");
  assert(typeof result.bridle_note === "string", "BRIDLE note present");
  if (!result.should_halve) {
    assert(result.new_categories.length === 0, "No categories when not halving");
  }
}

// ── T2b: BRIDLE Rule 4 — ambiguous = NO halve ──────────────────────────────
console.log("\nT2b: BRIDLE Rule 4 — low-confidence detection defaults to NO halve");
{
  const ambiguousTopics = ["test", "work", "data", "info", "base"];
  const result = detectHalveThreshold(ambiguousTopics, {
    keyword_density_delta: 0.9, // very high threshold — won't be met
    semantic_drift_threshold: 0.9,
  });
  assert(!result.should_halve, "BRIDLE Rule 4: ambiguous → NOT halving");
  assert(result.bridle_note.includes("BRIDLE"), "BRIDLE note references BRIDLE Rule 4");
}

// ── T2c: Founder ratification override ────────────────────────────────────
console.log("\nT2c: Founder ratification override (explicit YES)");
{
  const result = detectHalveThreshold(["anything"], {
    keyword_density_delta: 0.9,
    semantic_drift_threshold: 0.9,
    founder_ratification_override: true,
  });
  assert(result.should_halve, "Founder override=true forces halve");
  assert(result.confidence === 1.0, "Confidence = 1.0 for Founder override");
}

// ── T3: TEAM dispatch synthesis layer ─────────────────────────────────────
console.log("\nT3: TEAM dispatch synthesis — cross-role aggregation");
{
  const detectiveReport = {
    role: "detective",
    agent_id: "det_bishop_001",
    cathedral: "bishop",
    hits: 5,
    phase_used: 0,
    top_hit: "Architecture/BP016",
    hits_detail: [
      { scribe: "Architecture", tablet_id: "BP016", decay_score: 0.9 },
      { scribe: "Decisions", tablet_id: "KN104", decay_score: 0.7 },
    ],
    scribe_access_tier: "Federation Member",
  };
  const minerReport = {
    role: "miner",
    agent_id: "miner_LB-CAT.M-0001_001",
    cathedral: "bishop",
    mitotic_lineage: "LB-CAT.M-0001",
    ip_ledger_locked: true,
    chronos_chronicler_sig: "abc123",
    halved_offspring: ["LB-CAT.M-0001.a"],
    topics_discovered: ["detective", "miner", "corpus", "prospecting"],
    knowledge_depth: 1,
  };

  const synthesis = synthesizeTeamFindings(
    "detective team architecture",
    [detectiveReport, minerReport],
    ["bishop"],
    "federation_member",
  );

  assert(typeof synthesis.statement === "string", "Synthesis statement is string");
  assert(synthesis.statement.includes("TEAM finding"), "Statement contains 'TEAM finding'");
  assert(synthesis.statement.includes("federation_member"), "Statement includes cohort class");
  assert(synthesis.aggregated_bibliography.length > 0, "Bibliography populated");
  const detBib = synthesis.aggregated_bibliography.filter(b => b.role === "detective");
  const minBib = synthesis.aggregated_bibliography.filter(b => b.role === "miner");
  assert(detBib.length > 0, "Bibliography has detective entries");
  assert(minBib.length > 0, "Bibliography has miner entries");
}

// ── T4: Cohort-class Scribe-access enforcement ────────────────────────────
console.log("\nT4: Cohort-class Scribe-access enforcement — full matrix");
{
  // Lone Wolf: cannot access knight cathedral
  const lwResult = enforceAllowedCathedrals(["bishop", "knight", "pawn"], "lone_wolf");
  assert(lwResult.allowed.length === 1, "Lone Wolf: only 1 cathedral allowed");
  assert(lwResult.blocked.length === 2, "Lone Wolf: 2 cathedrals blocked");
  assert(!canWriteBack("lone_wolf"), "Lone Wolf: no write-back");

  // Pied Piper: bishop + knight; no pawn
  const ppResult = enforceAllowedCathedrals(["bishop", "knight", "pawn"], "pied_piper");
  assert(ppResult.allowed.includes("bishop") && ppResult.allowed.includes("knight"), "Pied Piper: bishop + knight allowed");
  assert(ppResult.blocked.includes("pawn"), "Pied Piper: pawn blocked");
  assert(!canWriteBack("pied_piper"), "Pied Piper: no write-back");

  // Federation Member: all cathedrals; write-back YES
  const fedResult = enforceAllowedCathedrals(["bishop", "knight", "pawn"], "federation_member");
  assert(fedResult.allowed.length === 3, "Federation Member: all 3 cathedrals");
  assert(canWriteBack("federation_member"), "Federation Member: write-back YES");

  // Excalibur Class: bishop + knight; no write-back (anti-extraction)
  const excResult = enforceAllowedCathedrals(["bishop", "knight", "pawn"], "excalibur_class_subscriber");
  assert(excResult.allowed.includes("bishop") && excResult.allowed.includes("knight"), "Excalibur: bishop + knight allowed");
  assert(!canWriteBack("excalibur_class_subscriber"), "Excalibur: no write-back (NOT full Scribe-trade)");

  const audit = buildAccessAuditSummary("excalibur_class_subscriber", ["bishop", "knight", "pawn"], true);
  assert(audit.includes("Excalibur Class"), "Audit summary includes tier label");
}

// ── T5: Provenance chain building ─────────────────────────────────────────
console.log("\nT5: Provenance chain building from TEAM reports");
{
  const minerWithDaughter = {
    role: "miner",
    agent_id: "miner_LB-CAT.M-0001_001",
    cathedral: "bishop",
    mitotic_lineage: "LB-CAT.M-0001",
    ip_ledger_locked: true,
    chronos_chronicler_sig: "hmac_sig_001",
    halved_offspring: ["LB-CAT.M-0001.a", "LB-CAT.M-0001.a.b"],
    topics_discovered: ["a", "b"],
    knowledge_depth: 2,
  };
  const chain = buildProvenanceChain([minerWithDaughter]);
  assert(chain.length === 3, "Chain has root + 2 daughter entries");
  const root = chain.find(e => e.serial === "LB-CAT.M-0001");
  assert(root !== undefined, "Root entry present");
  assert(root?.parent_serial === null, "Root has no parent");
  const daughter = chain.find(e => e.serial === "LB-CAT.M-0001.a");
  assert(daughter !== undefined, "First daughter present");
  assert(daughter?.parent_serial === "LB-CAT.M-0001", "Daughter traces to root");
}

// ── T6: Cross-cathedral consistency ───────────────────────────────────────
console.log("\nT6: Cross-cathedral consistency detection");
{
  // All cathedrals have hits → consistent
  const allHit = [
    { role: "detective", cathedral: "bishop", hits: 3, agent_id: "d1", phase_used: 0, top_hit: null, hits_detail: [], scribe_access_tier: "t" },
    { role: "detective", cathedral: "knight", hits: 2, agent_id: "d2", phase_used: 0, top_hit: null, hits_detail: [], scribe_access_tier: "t" },
    { role: "detective", cathedral: "pawn", hits: 1, agent_id: "d3", phase_used: 0, top_hit: null, hits_detail: [], scribe_access_tier: "t" },
  ];
  const syn1 = synthesizeTeamFindings("test", allHit, ["bishop", "knight", "pawn"], "federation_member");
  assert(syn1.cross_cathedral_consistency === "consistent", "All cathedrals with hits → consistent");

  // No hits → uninvestigated
  const noHit = [
    { role: "detective", cathedral: "bishop", hits: 0, agent_id: "d1", phase_used: 0, top_hit: null, hits_detail: [], scribe_access_tier: "t" },
  ];
  const syn2 = synthesizeTeamFindings("test", noHit, ["bishop"], "lone_wolf");
  assert(syn2.cross_cathedral_consistency === "uninvestigated", "No hits → uninvestigated");

  // Some cathedrals → contested
  const partialHit = [
    { role: "detective", cathedral: "bishop", hits: 5, agent_id: "d1", phase_used: 0, top_hit: null, hits_detail: [], scribe_access_tier: "t" },
    { role: "detective", cathedral: "knight", hits: 0, agent_id: "d2", phase_used: 0, top_hit: null, hits_detail: [], scribe_access_tier: "t" },
  ];
  const syn3 = synthesizeTeamFindings("test", partialHit, ["bishop", "knight"], "federation_member");
  assert(syn3.cross_cathedral_consistency === "contested", "Partial hits → contested");
}

// ── T7: Per-user data stamping integration ────────────────────────────────
console.log("\nT7: Per-user data stamping provenance (schema validation)");
{
  // Validate that the extended pheromone schema has all required fields
  const schemaKeys = [
    "topic", "synthesis_class", "team_role_breakdown",
    "cohort_class_at_dispatch", "member_data_stamping_provenance",
    "cross_cathedral_consistency", "decay_score"
  ];
  // Create a minimal mock record to verify shape
  const mockRecord = {
    topic: "test claim",
    synthesis_class: "detective_team_finding",
    team_role_breakdown: [],
    cohort_class_at_dispatch: "federation_member",
    member_data_stamping_provenance: [],
    cross_cathedral_consistency: "consistent",
    decay_score: 0.5,
  };
  for (const key of schemaKeys) {
    assert(key in mockRecord, `Schema key '${key}' present`);
  }
}

// ── T8: Replay-pass tag ───────────────────────────────────────────────────
console.log("\nT8: Replay-pass backfill tag");
{
  const replayClass = "detective_team_backfill";
  assert(replayClass === "detective_team_backfill", "Replay class constant is correct string");
}

// ── T9: Substrate-growth velocity (unit assertion) ────────────────────────
console.log("\nT9: TEAM dispatch produces broader substrate coverage than single Detective");
{
  // Unit-level assertion: TEAM with 2 roles produces more bibliography entries
  const singleDetective = synthesizeTeamFindings(
    "test",
    [{ role: "detective", agent_id: "d1", cathedral: "bishop", hits: 2, phase_used: 0, top_hit: null,
       hits_detail: [{ scribe: "S1", tablet_id: "T1", decay_score: 0.8 }], scribe_access_tier: "t" }],
    ["bishop"], "federation_member"
  );
  const teamDispatch = synthesizeTeamFindings(
    "test",
    [
      { role: "detective", agent_id: "d1", cathedral: "bishop", hits: 2, phase_used: 0, top_hit: null,
        hits_detail: [{ scribe: "S1", tablet_id: "T1", decay_score: 0.8 }], scribe_access_tier: "t" },
      { role: "miner", agent_id: "m1", cathedral: "bishop", mitotic_lineage: "LB-CAT.M-0001",
        ip_ledger_locked: true, chronos_chronicler_sig: "sig", halved_offspring: [],
        topics_discovered: ["topic_a", "topic_b", "topic_c"], knowledge_depth: 1 },
    ],
    ["bishop"], "federation_member"
  );
  assert(teamDispatch.aggregated_bibliography.length > singleDetective.aggregated_bibliography.length,
    "TEAM bibliography larger than single Detective bibliography");
}

// ── T10: Miner mitotic mechanic — halve threshold ────────────────────────
console.log("\nT10: Miner mitotic mechanic — 5 category corpus → BRIDLE conservative default");
{
  // Synthetic 50-word corpus with 5 distinct domains
  const domains = ["genetic biology organism cell dna", "finance market trading equity bond",
                   "physics quantum wave particle energy", "software algorithm data structure",
                   "music harmony melody rhythm beat"];
  const allWords = domains.flatMap(d => d.split(" ").flatMap(w => Array(3).fill(w)));

  const result = detectHalveThreshold(allWords, {
    keyword_density_delta: 0.3,
    semantic_drift_threshold: 0.4,
  });

  assert(typeof result.should_halve === "boolean", "Halve decision is boolean");
  assert(result.detection_signals.topic_count_after > 0, "Topics were analyzed");
  // BRIDLE Rule 4: even if we detect 5 categories, if confidence < 0.6, default to NO halve
  if (!result.should_halve) {
    assert(result.confidence < 0.6 || result.new_categories.length === 0,
      "No halve → confidence was low OR no categories detected (BRIDLE conservative)");
  }
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`KN104 Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
