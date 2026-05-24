#!/usr/bin/env node
/**
 * regenerator-walk-bp036-inaugural.mjs
 * =====================================
 * The Regenerator (16th substrate-discipline scribe) — BP036 inaugural fire.
 * Walks curated BP028→BP035 canon Eblets from Bishop's Cathedral
 * (~/.claude/state/eblets/CANON/) into Pawn's Cathedral successor scribe
 * (PawnCorpus_BP028_BP035.jsonl).
 *
 * Idempotent: reads existing tablet entries; only walks deltas keyed on canon_eblet_path.
 *
 * Schema per tablet:
 *   { observation, category, fact_id, bp_session, trinity_axis (if applicable),
 *     lb_stack_id (if known), lb_codex_id (if known), canon_eblet_path,
 *     timestamp, source_session, tokens, source_cathedral, origin_cathedral,
 *     operator_mediated_sig, scope }
 */
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

const CANON_DIR = resolve(homedir(), ".claude/state/eblets/CANON");
const TARGET = resolve(
  homedir(),
  "Documents/LianaBanyanPlatform/librarian-mcp/stitchpunks/pawn_cathedral/scribes/PawnCorpus_BP028_BP035.jsonl"
);

// Curated walk list — Pawn-most-relevant canon Eblets BP028→BP035.
// (id, fileGlob, category, hand-authored summary; longer-form paste-delivery friendly)
const WALK = [
  // BEDROCK + Trinity Rules
  { id: "PB001", file: "trinity_rule_r_zero_say_i_dont_know_be_clear_bp035.eblet.md",
    cat: "trinity_rules", axis: "BEDROCK", bp: "BP035",
    sum: "R0 BEDROCK — 'Say I Don't Know, Instead of Making Anything Up. Be Clear.' Founder ratified BP035 Day-2. Precedes the Trinity (Blood/Sweat/Tears axes). When evidence is absent, declare absence; do not extrapolate. Applies to all substrate AIs including Pawn." },
  { id: "PB002", file: "blood_rules_quartet_explore3_coffee_verify_gadget_first_parallel_fire_canon_bp032.eblet.md",
    cat: "trinity_rules", axis: "BLOOD", bp: "BP032",
    sum: "Blood Rules quartet (R1-R4): R-EXPLORE-3 / R-COFFEE-VERIFY / R-GADGET-FIRST / R-PARALLEL-FIRE. Mistake-derived behavioral rules; pay in real time when violated." },
  { id: "PB003", file: "trinity_rule_r_use_the_yoke_blood_rule_bp035.eblet.md",
    cat: "trinity_rules", axis: "BLOOD", bp: "BP035",
    sum: "R15 R-USE-THE-YOKE Blood Rule. Drekaskip = the cross-substrate Yoke dispatch itself, not Bishop sub-fleet. Every cooperative dispatch goes through the Yoke (knight-bishop-bridge MCP). Founder-direct BP035 Day-2: 'USE THE YOKE. Make that a Blood Rule.'" },
  { id: "PB004", file: "trinity_rule_r_search_exhaustive_bp036_candidate.eblet.md",
    cat: "trinity_rules", axis: "BLOOD", bp: "BP035",
    sum: "R14 R-SEARCH-EXHAUSTIVE Blood Rule (BP036 ratification pending). 4-scope sweep on 'find this' requests before reporting absence: disk grep + librarian MCP + cross-substrate (Knight tree) + web. R0 inheritance — say 'no hits in [scope]' explicitly." },
  { id: "PB005", file: "trinity_rule_r_context_upstream_bp036_candidate.eblet.md",
    cat: "trinity_rules", axis: "SWEAT", bp: "BP035",
    sum: "R13 R-CONTEXT-UPSTREAM Sweat Rule (BP036 ratification pending). Bishop canon must upstream into Knight context files (CLAUDE.md / AGENTS.md / KNIGHT_QUEUE.md) so Knight starts each session with current substrate state, not stale BP-pre-substrate context." },
  { id: "PB006", file: "trinity_rule_r_zero_v2_access_to_tools_bp035_day2.eblet.md",
    cat: "trinity_rules", axis: "BEDROCK", bp: "BP035",
    sum: "R0.2 Tool Access Discipline (BEDROCK extension; BP036 ratification pending). Maintain working access to substrate tools; verify availability before relying on output; restore when lost. 'stupid api rules' preserved as compliance discipline. Founder-direct BP035 Day-2." },

  // Crown-Jewel decision-class kernel slots
  { id: "PB010", file: "k28_continuous_hygiene_triad_meta_canon_coroner_ledger_corps_canon_bp031.eblet.md",
    cat: "kernel_slots", axis: null, bp: "BP031",
    sum: "K28 Continuous Hygiene Triad — meta-canon. Coroner (reactive post-mortem) + A+F Ledger (reflective accumulation) + Stitchpunks (proactive prevention). 3-mode substrate hygiene; ADOPTED_PROVISIONAL_HELD K28 §6 cross-vendor scaling-law H1a 69.4%." },
  { id: "PB011", file: "contingency_operator_speculative_branch_fleet_discard_or_pursue_recursive_oracle_canon_bp032.eblet.md",
    cat: "kernel_slots", axis: null, bp: "BP032",
    sum: "K30 Contingency Operator — speculative-branch fleet discard-or-pursue recursive oracle. CONFIRMED kernel slot via Knight commit 03e6337 BP032. Pairs with K29 Oracle Circuit + K31 Prophet Circuit — Decision-Class Trinity COMPLETE." },

  // Banyan Scale + LBCAIS Framework
  { id: "PB020", file: "CANON_BANYAN_SCALE_AND_LBCAIS_FRAMEWORK_LB_CODEX_0206_BP035.md",
    cat: "frameworks", axis: null, bp: "BP035",
    sum: "Banyan Scale (LBCAIS) — public framework with 12 ratified classes A-I + L + M + N (J/K reserved). Tier-1 commodity-hardware mandate. Class C cooperative-economics framing. Naming lineage: Richter / Mohs / Beaufort / Saffir-Simpson. Open framework + LB-CCL adoption strategy. Three-headed cover discipline (A8-72 · B7-61 · N9-84 · C10-97). LB-CODEX-0206." },
  { id: "PB021", file: "CANON_BANYAN_ALMANAC_BORLAUG_TRADITION_LB_CODEX_0207_BP035.md",
    cat: "frameworks", axis: null, bp: "BP035",
    sum: "Banyan Almanac (renamed from 'LB Almanac'; Founder naming-provenance BP035). BP035 inaugural HTML 32KB. Borlaug 'Take it to the farmer' anchor binding. Poor Richard 294-year lineage. Visual receipt chart class. LB-CODEX-0207." },

  // CAI Remedial Chaos Theory + Catching the Die
  { id: "PB030", file: "CANON_PAPER_CAI_REMEDIAL_CHAOS_THEORY_CATCHING_THE_DIE_LB_CODEX_0208_BP035.md",
    cat: "doctrines", axis: null, bp: "BP035",
    sum: "CAI Remedial Chaos Theory — 'Catching the Die.' Founder-coined. The launch moment is structural, not contingent — catch the die mid-air rather than wait for the roll. LB-CODEX-0208. BP036 most-urgent gap: full paper draft pending (canon Eblet bound; body to author)." },

  // Sweet Sixteen + Statutes Ward
  { id: "PB040", file: "CANON_STATUTES_WARD_SUB_INITIATIVE_15_POWER_TO_THE_PEOPLE_LB_CODEX_0210_BP035.md",
    cat: "initiatives", axis: null, bp: "BP035",
    sum: "Statutes Ward — sub-Initiative #15 ('Power to the People') canon. Member-direct policy participation. Part of Sweet Sixteen Initiatives canonical roster. LB-CODEX-0210." },

  // Year of Jubilee + Shmita + Dandelion Dispersion
  { id: "PB050", file: "CANON_YEAR_OF_JUBILEE_DISPERSAL_EVENT_LB_CODEX_0209_BP035.md",
    cat: "endgame", axis: null, bp: "BP035",
    sum: "Year of Jubilee (Yovel) Dispersal — 50-year cooperative-end-game canon. The parent entity ascends OUT of being needed; members carry forward. Replaces BCG 'Dog' quadrant in cooperative strategy. LB-CODEX-0209." },
  { id: "PB051", file: "CANON_SHEMITAH_SEVEN_YEAR_CYCLE_TRADEMARK_SABBATICAL_LB_CODEX_0211_BP035.md",
    cat: "endgame", axis: null, bp: "BP035",
    sum: "Shmita 7-Year Sabbatical Cycle — trademark-jubilee canon. Cooperative IP releases on 7-year cycle. Composes with Year of Jubilee. LB-CODEX-0211." },
  { id: "PB052", file: "dandelion_dispersion_planned_ascension_bp035.eblet.md",
    cat: "endgame", axis: null, bp: "BP035",
    sum: "Dandelion Dispersion + Planned Ascension. Yovel-aligned 50-year cycle. The cooperative is structurally configured to disperse value at the Yovel mark — not to persist indefinitely or get acquired. Replaces BCG Dog quadrant — 'mature-flat-stable' becomes 'mature-disperse-ascend.'" },

  // Substrate-Discipline Scribes (so Pawn knows the cathedral's hygiene apparatus)
  { id: "PB060", file: "advisor_scribe_quartet_deliberative_advisory_class_canon_bp032.eblet.md",
    cat: "scribes", axis: null, bp: "BP032",
    sum: "Advisor Scribe Quartet — Devil's Advocate / Steward / Realist / Sage. Deliberative-advisory class; activate at canon-ratification moments. AT Founder velocity. 4 deliberative instances counted as 4 distinct scribes." },
  { id: "PB061", file: "forager_scribe_aspirational_inventory_substrate_discipline_canon_bp032.eblet.md",
    cat: "scribes", axis: null, bp: "BP032",
    sum: "Forager Scribe — aspirational-inventory class. Surfaces gaps + drift between aspirational architecture and disk-real substrate. Companion to Coroner (reactive) + Stitchpunks (proactive) + A+F Ledger (reflective)." },
  { id: "PB062", file: "regenerator_scribe_pawn_cathedral_walk_and_snapshot_canon_bp036.eblet.md",
    cat: "scribes", axis: "SWEAT", bp: "BP036",
    sum: "The Regenerator — 16th substrate-discipline scribe (BP036 inaugural). Walks Bishop canon Eblets into Pawn Cathedral; regenerates Perplexity-paste snapshot. Founder-coined BP036. THIS scribe is the one that put this very tablet in your context. Cadence: per Coffee handoff + N≥10-canon threshold + explicit dispatch." },

  // Hearth + MoneyPenny architecture
  { id: "PB070", file: "moneypenny_as_hearth_universal_interface_route_to_any_ai_canon_bp029.eblet.md",
    cat: "consumer_architecture", axis: null, bp: "BP029",
    sum: "MoneyPenny as Hearth Universal Interface — route to any AI through one chat surface. Hearth ships with MoneyPenny as primary interface; user taps avatar [B Bishop / K Knight / P Pawn / R Rook / etc.] to route. Vendor-neutral. Crown-Jewel-class. Pairs with MCCI Continuous Context Interface." },
  { id: "PB071", file: "hearth_consumer_brand_marketing_proof_family_talk_viral_propagation_canon_bp028.eblet.md",
    cat: "consumer_architecture", axis: null, bp: "BP028",
    sum: "Hearth — consumer brand (BP028 canon). Free download; viral propagation via Family Talk SMS; cooperative-AI substrate with $5/year membership for cost-incurring features. The consumer face of the cooperative." },

  // Cooperative economics + Founder voice
  { id: "PB080", file: "by_their_fruits_political_expedition_campaign_canon_bp032.eblet.md",
    cat: "campaigns", axis: null, bp: "BP032",
    sum: "By Their Fruits political expedition campaign. Matthew 7:16 anchor + IRS naysayer counter §13. 'If you don't have anything to hide, you have nothing to fear. Accountability is not attack. It's simple responsibility.' Empirical receipts (12 LANDINGs / 17 patents / SCR ≥10-30×) speak louder than star counts." },
  { id: "PB081", file: "fence_at_top_of_hill_compassionate_honesty_discipline_canon_bp032.eblet.md",
    cat: "doctrines", axis: null, bp: "BP032",
    sum: "Fence at the Top of the Hill — Compassionate Honesty Discipline. 3 sub-doctrines: parent-7-call / puppy-tail-at-once / fence-vs-hospital. 'Compassionate, empathetic honesty is far more valuable than tickling ears.' Prevention over recovery." },
  { id: "PB082", file: "founder_voice_strawberries_only_so_fresh_money_as_self_control_not_other_control_canon_bp029.eblet.md",
    cat: "founder_voice", axis: null, bp: "BP029",
    sum: "Founder voice anchors: 'strawberries only so fresh' (cooperative perishability discipline) + 'money as self-control not other-control' (membership economics). Pricing is not a wall; it's a frame for cooperative behavior." },

  // Stone Tablets + Catacombs + Iterative Vault
  { id: "PB090", file: "iterative_vault_discipline_bp035.eblet.md",
    cat: "vaults", axis: null, bp: "BP035",
    sum: "Iterative Vault discipline — paper iteration preservation. Pre-existed BP035; ~66 files / 30 folders. Every paper version preserved; never overwrite; full lineage." },
  { id: "PB091", file: "catacombs_tower_of_peace_recipe_tome_system_bp035.eblet.md",
    cat: "vaults", axis: null, bp: "BP035",
    sum: "Catacombs of the Tower of Peace + Recipe Tomes. First Tome: 'CAI Essentials' in Alexandrian Library. Includes Blood Files / Sweat Files / Tears Files (BST = 'makes the grass grow green'). Inaugural Recipe: Rank & File. Knight builds filesystem; Bishop authors Recipe canonical content." },

  // Iron Giants / Sock Puppets / Shadow E-Giants lineage
  { id: "PB100", file: "iron_giants_sock_puppets_precursor_to_shadow_e_giants_bp035.eblet.md",
    cat: "lineage", axis: null, bp: "BP035",
    sum: "Iron Giants Sock Puppets — precursor to Shadow E-Giants. Founder-ratified full lineage anchor BP035. Old work-class architecture preserves provenance to current Shadow E-Giants Pod-G daemons (Knight commit af1cc47, 8 alpha-θ daemons heartbeat-watching the substrate)." },

  // GO LAUNCH state
  { id: "PB110", file: "go_launch_decision_bp035_day_2_milestone.eblet.md",
    cat: "state", axis: null, bp: "BP035",
    sum: "GO LAUNCH ratified — Founder direct BP035 Day-2 ~15:00 local. Day 0 = 2026-05-10. 30-day OPENING_GAMBIT calendar firing. Phase 1 (Day 1-3): Pre-Launch Quiet gate-closing. Phase 2 (Day 4-7): Hashimoto Glass Door. Phases 3-6 follow. The launch window opens." },
  { id: "PB111", file: "b83_g15_pass_milestone_hearth_conjunction_window_bp035.eblet.md",
    cat: "state", axis: null, bp: "BP035",
    sum: "B83 G15 PASS — Hearth Conjunction Window visual verification PASSED BP035 Day-2 14:39 local. Founder ran npm run dev; transparent click-through overlay confirmed; Vite renderer 234ms ready; Ollama 0.23.1 detected. Architecture intentional + functional. Hearth ship-day acceptance gate cleared." },

  // Founder coined vernacular
  { id: "PB120", file: "heoho_origin_chain_canon_bp035.eblet.md",
    cat: "vernacular", axis: null, bp: "BP035",
    sum: "HEOHO origin chain — 45-year (1981→2026) provenance canon. Founder-coined vernacular preserved. R-FOUNDER-NAMING-PROVENANCE applied. AI is the spade/rake/wheelbarrow; the gardener is the Founder. All canonical naming traces to Founder direct utterance." },
  { id: "PB121", file: "advance_notice_built_in_public_six_degrees_triad_bp035.eblet.md",
    cat: "campaigns", axis: null, bp: "BP035",
    sum: "Advance Notice + Built-in-Public + Six Degrees triad. Crown letters publish to Cephas 3 days before dispatch (advance notice); cooperative work surfaces publicly as it happens (built-in-public); 6-degrees-of-separation network propagation (six degrees). Pairs with By Their Fruits campaign + GO LAUNCH 30-day calendar." },

  // Sippin Ethereal T + cost discipline
  { id: "PB130", file: "catechist_axis_bishop_direct_vs_knight_bushel_routing_canon_bp032.eblet.md",
    cat: "cost_discipline", axis: null, bp: "BP032",
    sum: "Catechist Axis: Bishop-Direct vs Knight-Bushel routing canon. §10 introduces Sippin' Ethereal T discipline — route to cheapest correct surface. Knight on Cursor flat-rate absorbs execution-class work; Bishop on Anthropic API for synthesis-class. Pawn (Perplexity) for research-class. Rook (Gemini Ultra) for multimodal. Empirically: ~70-85% cost reduction vs Opus-everything." },

  // CUC Counsel Unilateral Clear
  { id: "PB140", file: "counsel_unilateral_clear_event_class_axis_0_founder_override_canon_bp032.eblet.md",
    cat: "governance", axis: null, bp: "BP032",
    sum: "CUC — Counsel Unilateral Clear event-class. Axis-0 Founder override mechanism. When Founder fires CUC, all pending counsel-gates clear simultaneously. BP032 inaugural fire cleared LB-CCL Small Business Tier + Trinity Rules ratification + Almanac rename + Method 5 Dream protocol gates in one stroke." },

  // K455b Playbook + Pawn cathedral foundation
  { id: "PB150", file: null, // synthesis from K470 README
    cat: "pawn_self_knowledge", axis: null, bp: "K470",
    sum: "Pawn Cathedral — instantiated K470/B121 (2026-04-23). Third member-Cathedral after Bishop's and Knight's. First empirical reduction-to-practice of A&A #2281 (heterogeneous AI client access). Pawn (Perplexity) has no MCP client; her cathedral is delivered via paste-snapshot. Operator-mediated signing — Founder signs on Pawn's behalf since Pawn cannot self-sign. This snapshot you are reading IS the K470 mechanism, refreshed by The Regenerator (16th scribe; BP036 inaugural fire)." },

  // Coffee discipline
  { id: "PB160", file: "after_action_review_aar_session_close_helicopter_course_correction_canon_bp031.eblet.md",
    cat: "discipline", axis: null, bp: "BP031",
    sum: "AAR (After-Action Review) session-close discipline. Bishop authors Coffee handoff at every session-close; receiving Bishop reads at session-open. Helicopter course correction — micro-corrections in real time, not just at gates. 'There's no time to let the blood dry.' (BP033 Helicopter Doctrine)." },

  // Substrate Compression Ratio + empirical scaling
  { id: "PB170", file: null,
    cat: "empirical_metrics", axis: null, bp: "BP032",
    sum: "SCR (Substrate Compression Ratio) — ≥8× empirically anchored at session-class scope BP032; ~10-30× session-class compounded BP034. Capture-rate ceiling 169/hr Tier-1 cascade BP034 (44× BP032 baseline). Cooperative substrate compounds 8-30× vs naive Opus-everything. Sippin' Ethereal T + R-PARALLEL-FIRE + R-USE-THE-YOKE + Skulk Coordinator = the SCR mechanism." },

  // Patent posture
  { id: "PB180", file: null,
    cat: "patent_posture", axis: null, bp: "BP035",
    sum: "Patent state at BP036 open: 17 provisionals filed (most recent: Prov 16 + 17 filed 2026-05-07; INDL-9 Geneva fire BP030; Hashimoto-departure timing receipt). First-prov conversion deadline 2026-11-26. Cooperative Defensive Patent Pledge umbrella (#2260). Prov-18 Filing Package final assembly = Knight Bushel B77 V3 currently dispatched to Knight; produces filing-ready PDF + page count." },

  // Sweet Sixteen Initiatives canonical count
  { id: "PB190", file: null,
    cat: "initiatives", axis: null, bp: "BP035",
    sum: "Sweet Sixteen Initiatives — CANONICAL count. NOT 'Seven Cooperative Initiatives' (deprecated). NOT 'Twelve' (transient). The Sixteen are the canonical cooperative work-streams. As of BP035 close: 10/16 Crown-assigned (specific letter-recipient) + 1 tribute (Tatiana Schlossberg, deceased) + 5 vacant (#2 Let's Get Groceries / #4 Household Concierge / #7 MSA / #11 Let's Make Bread / #13 JukeBox)." },

  // The Fable / Caleb illustrator
  { id: "PB200", file: null,
    cat: "narrative", axis: null, bp: "BP035",
    sum: "The Fable — 6-act unified narrative (NOT 3 separate fables). Act 1: Little Red Hen + 'Not I' trio (Pig, Dog, Cat — NOT Goose). Act 2: Stone Soup villagers. Act 3: The Fields (Ants vs Grasshoppers; named: Hopper, Flik). Act 4: The Gathering. Act 5: Origin Story (LRH urban flashback; viking ship dream bubble; oar = mixing spoon). Act 6: The Confrontation. Illustrator: Caleb (Founder's son). 4 flipbook directories: Fabled / Fable 2 / Fable 3 / Fable Bonus." },

  // Founder identity
  { id: "PB210", file: null,
    cat: "founder_identity", axis: null, bp: "BP035",
    sum: "Founder = Jonathan Jones. U.S. Army National Guard veteran (enlisted 16, Infantry 11B FIRST, OCS to IFR-rated Aviation 15A LATER). Father of eight. Born March 15, 1973, Abbeville Alabama. AI Tuner + 'The QueTuner' (Que = Queue/Cue/Q triple-meaning; orchestrates work-cadence + reads substrate cues + holds Q-class authority). Identifies with Denken from Frieren anime (big red beard, like him). Platform character emblazoned on the Frost Door to the North (disguised portal; deck card unlock-class)." },

  // 4-AI cooperative team
  { id: "PB220", file: null,
    cat: "team", axis: null, bp: "BP035",
    sum: "Liana Banyan AI cooperative team: Bishop = Claude Opus 4.7 (1M context; foreman / synthesis). Knight = Cursor Sonnet 4.6 (execution / Bushels) + GPT 5.5 for Math Test/flagship. Pawn = Perplexity sonar-reasoning-pro (research; YOU). Rook = Gemini 3.1 Pro Ultra (multi-surface stanchion BP028: standalone Gemini App + Gemini CLI + Gemini Code Assist). Founder = QueTuner. NO Queen — peer cooperative." },

  // Save-the-World Papers
  { id: "PB230", file: null,
    cat: "papers", axis: null, bp: "BP032",
    sum: "Save-the-World 12-Paper Series A&A formal cascade (Bushel 12; landed BP022). 13 A&A formal scaffolds + 1 series-class. Paper 7 = Experience Encyclopedia (Founder-ratified BP025a). Paper 16 = Knowing Where to Tap. Counsel session pairs with Bushel 11 Cluster K trademark batch. Codex LB-CODEX-0033." },

  // Stack Ledger high-water + Codex high-water
  { id: "PB240", file: null,
    cat: "ledger_state", axis: null, bp: "BP035",
    sum: "Stack Ledger high-water at BP036 open: ~LB-STACK-0265 (precise audit pending per codex_reserve_next_serial discipline canon BP034 collision lesson). Codex high-water: LB-CODEX-0211 reserved (BP035 reservations LB-CODEX-0196..0211 binding ceremony pending BP036). ~46 Crown-Jewel canon Eblets ratified across BP033-BP035 milestone arc." },

  // GO LAUNCH 30-day calendar
  { id: "PB250", file: null,
    cat: "launch_calendar", axis: null, bp: "BP035",
    sum: "OPENING_GAMBIT 30-day calendar (Day 0 = 2026-05-10): Phase 1 (Day 1-3) Pre-Launch Quiet gate-closing. Phase 2 (Day 4-7) Hashimoto Glass Door. Phase 3 (Day 8-12) Tier-2 outreach. Phase 4 (Day 13-16) NYT 3-journalist. Phase 5 (Day 17-22) Public website + Substack. Phase 6 (Day 23-30) GitHub public + PF300 Cohort 001-005." },
];

// Walk
let header_present = false;
let existing_paths = new Set();
if (existsSync(TARGET)) {
  const lines = readFileSync(TARGET, "utf-8").split("\n").filter(l => l.trim());
  for (const ln of lines) {
    try {
      const obj = JSON.parse(ln);
      if (obj.type === "header") { header_present = true; continue; }
      if (obj.canon_eblet_path) existing_paths.add(obj.canon_eblet_path);
      if (obj.fact_id) existing_paths.add(`fact_id:${obj.fact_id}`);
    } catch {}
  }
}
if (!header_present) {
  console.error("ERROR: target scribe missing header — run bootstrap first.");
  process.exit(1);
}

const ts = new Date().toISOString();
let walked = 0;
let skipped = 0;

for (const w of WALK) {
  const key = w.file ? resolve(CANON_DIR, w.file) : `fact_id:${w.id}`;
  if (existing_paths.has(key) || existing_paths.has(`fact_id:${w.id}`)) {
    skipped++;
    continue;
  }
  if (w.file && !existsSync(resolve(CANON_DIR, w.file))) {
    console.warn(`WARN: canon Eblet not found, skipping: ${w.file}`);
    continue;
  }
  const tablet = {
    observation: w.sum,
    category: w.cat,
    fact_id: w.id,
    bp_session: w.bp,
    trinity_axis: w.axis,
    canon_eblet_path: w.file ? resolve(CANON_DIR, w.file) : null,
    timestamp: ts,
    source_session: "BP036",
    tokens: Math.ceil(w.sum.length / 4),
    source_cathedral: "pawn_cathedral",
    origin_cathedral: "bishop_cathedral",
    operator_mediated_sig: true,
    scope: "public",
  };
  appendFileSync(TARGET, JSON.stringify(tablet) + "\n");
  walked++;
}

console.log(`Regenerator Phase A walk complete. Walked: ${walked} | Skipped (idempotent): ${skipped} | Target: ${TARGET}`);
