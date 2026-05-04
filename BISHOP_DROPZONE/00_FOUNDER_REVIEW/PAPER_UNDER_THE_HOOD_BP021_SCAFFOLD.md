---
name: "Under the Hood (BP021)"
description: "Technical deep-dive into the Liana Banyan substrate-routed memory architecture covering Wrasse routing, Pheromone stigmergy, Candlepower dispatch, and the Codex bound-canon layer."
type: paper
ratificationDate: "BP021"
wrasseTriggers:
  - "Wrasse trigger routing"
  - "Pheromone substrate"
  - "Candlepower cP"
  - "Codex HMAC layer"
  - "Mechanical Computer"
  - "substrate-routed memory"
  - "AI agnostic platform"
  - "deterministic coordination"
canonical_references: []
---
# PAPER — Under the Hood (BP021 SCAFFOLD)

**Class**: technical-deep-dive paper. **Audience**: technical-partner-class (engineers, AI researchers, patent prosecutors, infrastructure architects).

**Founder direct BP021 turn 35**: *"And update papers etc (pollination) which SHOULD include historical timeline, under the hood, and fly on the wall."*

**Status**: Bishop scaffold. Founder writes prose at fire-time per `feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md` (B133 cross-agent Founder-mandatory).

**Composes with** (sister papers in the BP021 trio): `PAPER_HISTORICAL_TIMELINE_*` (chronological mechanic-date-result pairing), `PAPER_FLY_ON_THE_WALL_BP021_SCAFFOLD.md` (narrative-observer voice).

**Companion canonical reference**: `BISHOP_DROPZONE/14_CanonicalReferences/MECHANICAL_COMPUTER_CANONICAL_KERNEL.md` is the architecture canon at *high* grain; this paper is the architecture canon at *fine* grain.

---

## Voice notes

- Technical voice — precise, patent-ready, citation-dense. Reader is a senior engineer or AI researcher.
- Lead with empirical receipts at every section open. Substrate doesn't lie.
- Patent-defensible language — claims phrased as architecture, not aspiration.
- Mechanical Computer Canonical kernel sits beside this paper, not inside it. Cross-references; doesn't duplicate.
- AI-agnostic framing throughout — *"the platform is the substrate; the AI is the worker"* (BP021 Founder direct turn 38). Never claim a specific AI vendor is required.

---

## 10-section structure

### 1. Introduction — What "Under the Hood" Means

**Pollinated from**: LB Librarian descriptor `lb_librarian_canonical_phrasing_unparalleled_accuracy_speed_diminished_cost_bp018.md` + AI-agnostic principle `lb_frame_ai_agnostic_platform_principle_bp021.eblet.md`.

**Key facts**:
- LB Frame surface ("unparalleled accuracy, speed, with diminished cost") is what members see; this paper is what's under it
- The paper is intentionally vendor-agnostic — Members configure their AI; LB supplies substrate routing, schema, MCP protocol, Codex binding
- Audience: someone who could rebuild a competitor; this paper shows them what they'd have to rebuild AND why the architecture's evolution is canonized as Crown-Jewel-class IP

**Founder voice element**: *"It's HOW you use it"* (BP018 turn 14) — the slogan-form of the paper's central claim.

### 2. Substrate-Routed Memory

**Pollinated from**: Wrasse Eblet routing canon, Pheromone substrate (#2317 A&A FILED), Detective TEAM (#2316 A&A FILED), Multi-trail flavor-class (BP015 Crown-Jewel), Substrate-Routed Memory Expansion (#2336 KN042 BP005).

**Empirical anchors**:
- 49:1 hit-ratio empirical receipt (B134) — Phase 0 constant-time pheromone fast-path vs filesystem grep
- ~10⁶ speedup vs RPC investigation (#2317) — 14ms index build, <1ms query
- Wrasse pre-injection sub-ms (KN042 LANDED `0696f31`)

**Section structure**:
- 2.1 Wrasse: trigger-keyword routing in canonical Eblets
- 2.2 Pheromone: stigmergic inverted-topic index with decay-score recency
- 2.3 Detective TEAM: cross-cathedral fan-out + substrate write-back loop
- 2.4 Multi-trail flavor-class: N-trail concurrent-class routing extension
- 2.5 Composition with seven-layer Memory Wall strata (BP011)

### 3. Multi-Cylinder Firing — Candlepower (cP)

**Pollinated from**: `candlepower_cp_lb_throughput_unit_canon_bp020.eblet.md`, BP020 scaling-curve receipt, `third_gear_default` BP021 sister insight, depth-3 nested-subagent probe PASS.

**Empirical anchors**:
- Bushel 1: 8 cP / 1,514 entries / 29 min / ~$12 (Codex `LB-CODEX-0023` HMAC `63cf06301ee7e6ae`)
- Bushel 2: 1+8+64 cP scaling-curve / 4,900+ entries (Codex `LB-CODEX-0024` HMAC `36ad8afabc880d59`)
- Bushel 7: 64 cP / 78 primitives / 14 min / ~$8-15 (Codex `LB-CODEX-0025` HMAC `9cb23584e95922c7`)
- Depth-3 probe: commit `c1b6aa2`, salt `6b6a59`, ts 2026-05-03T13:14:30Z

**Section structure**:
- 3.1 The cP unit definition (1 cP = 1 cylinder)
- 3.2 1-tier sequential, 8-tier parallel, 64-tier nested architecture
- 3.3 Scaling-curve receipt: corpus-shape dependence (patent-defensible nuance)
- 3.4 3rd Gear default: coordination overhead amortized across parallelizable work
- 3.5 Substrate-as-immutable-backup removes recovery-cost penalty (live-tested 2× BP020)

### 4. Codex Layer 8 — Bound Canon-of-Canons

**Pollinated from**: `codex_*` MCP tool family (Pod-K KN-K3 BP018), Codex lifecycle (drafting → review → bound), HMAC immutability.

**Empirical anchors**:
- 25 Codices bound in production through `LB-CODEX-0025` (Bushel 7 BP021)
- HMAC immutability prevents post-bind tampering
- Time-series across LB-CODEX-NNNN enables trend analysis

**Section structure**:
- 4.1 The Codex lifecycle (drafting → review → bound)
- 4.2 Stratum citations (sand → soil → sediment → sandstone → limestone → granite → bedrock)
- 4.3 Pointer types (Gold tablets, Excalibur, Joules redemptions, Jars)
- 4.4 codex_compare_modes for time-series diff layer
- 4.5 Why immutability matters — provenance + audit trail + Federation portability

### 5. Bushel-Class Operations

**Pollinated from**: Bushel 1 Reckoning canon, Bushel 2 Pixie-Dust canon, Bushel 7 Coverage Audit, Recurring Diagnostic canon (BP021).

**Section structure**:
- 5.1 Bushel-class definition (productive 1K+ bean test class distinct from BP-class capacity tests)
- 5.2 Bushel 1 — The Reckoning (depth-foundation read-all-prior-canon)
- 5.3 Bushel 2 — Pixie-Dust (per-innovation pheromone blessing across 2,270 corpus)
- 5.4 Bushel 7 — 3-Layer Strategic Taxonomy + Coverage Audit (canonical-state-monitor proof-of-concept)
- 5.5 Recurring Diagnostic Bushel — same template, scheduled cadence
- 5.6 Bushels 8-13 roadmap (Substrate UI / Cooperative Datacenter Phase 1 / Patent Reserve Prov 16 fill / Discipline Eblet coverage / Productization template / Cooperative Datacenter Phase 2)

### 6. The 12-Field Audit Schema

**Pollinated from**: Bushel 7 K-prompt template, 3-layer strategic taxonomy.

**Schema**:
- `layer_assignment`: candelabra_core | cooperative_datacenter_dream | patent_reserve
- 7 surface-status fields: pheromone / aa / cephas / code / mcp / hook / runtime
- `prov_16_candidate`: yes | no | future_prov
- 3 strategic-scoring fields: competitive_moat_strength / consumer_facing_value / maintenance_burden_estimate
- All fields evidence-grounded with disk paths + one-sentence rationales

**Section structure**:
- 6.1 Why 12 fields (not 6, not 24) — partition rationale
- 6.2 Layer-assignment heuristics (where the primitive does the most work)
- 6.3 Surface-status taxonomy (pheromone-written / aa-filed / etc.)
- 6.4 Strategic-scoring fields (moat / consumer-value / maintenance) for prioritization
- 6.5 Evidence-grounded rationale discipline (no hallucinated transitions)

### 7. Substrate-As-Immutable-Backup

**Pollinated from**: `substrate_as_immutable_backup_pyramid_indexed_canon_bp020.eblet.md`.

**Empirical anchors**:
- Live-tested 2× BP020 (Knight 7 Bushel 1 + Knight 1 Tier 2 Bushel 2)
- Both tab closures: zero work lost; substrate ledger preserved all completed primitives
- Append-only JSONL semantics handle concurrent multi-subagent writes

**Section structure**:
- 7.1 The property: append-only JSONL writes ARE the backup
- 7.2 Recovery model: read ledger to determine completed work; resume only the remainder
- 7.3 Time-series accumulation via Codex (BP021 extension — per-run Codex binding gives architecture-state trajectory)
- 7.4 Federation implications: cross-cathedral provenance only works because substrate format is canonical

### 8. The Defense Stack — Slow Blade V2

**Pollinated from**: 10 Slow Blade Canon Eblets (BP021 pheromonation closure), `project_slow_blade_architecture_v2.md` (B119 source).

**Section structure**:
- 8.1 Six mechanisms: Furnace / Slow Blade / XP × Reputation / Votes-as-money / Six Sparks / Trust Match
- 8.2 Two doctrines: Seasoning (time-gating) / Good Standing Roll (sub-linear moderation cost)
- 8.3 Two closure mechanisms: Furnace-every-click (R2) / Glass Door SSL-lock (R3)
- 8.4 8-vector closure matrix (all original vectors defeated)
- 8.5 B119 Pawn red-team 10 NEW vectors discovered (B124 honesty — countermeasures documented, OPEN as of B124)
- 8.6 Why this scales — sub-linear moderation cost is the structural moat

### 9. Composition + Federation

**Pollinated from**: BP016 federation canon (Brittle vs Fluid Librarian by cohort-class), Cooperative Datacenter Phase 1-5 build-order (Bushel 7 manifest layer 2), Apiarist Hive (BP016).

**Section structure**:
- 9.1 The 3-Layer Strategic Taxonomy (Candelabra Core / Cooperative Datacenter Dream / Patent Reserve)
- 9.2 Phase 1: Atreyu (personal) → Apiarist Hive (cohort) → Thirteenth Warrior (civilization) — Founder-stated baseline
- 9.3 Phases 2-5 (Scribe + Provenance plumbing → Currency operationalization → Federation organism → Higher-order disciplines)
- 9.4 Cohort-class enforcement: Brittle Cathedral (Lone Wolf) / Fluid (Pied Piper+) / Permanent Fluid (Federation Member)
- 9.5 Federation portability — substrate format + MCP protocol enables cross-Member surface

### 10. Empirical Receipts + Per-Bushel Cost Curve

**Pollinated from**: BP020 + BP021 cost receipts.

**The receipts** (this paper's central evidence claim):

| Bushel | cP | Entries | Min | $ | Codex |
|---|---|---|---|---|---|
| 1 Reckoning | 8 | 1,514 | 29 | ~12 | `LB-CODEX-0023` |
| 2 Pixie-Dust | 1+8+64 | 4,900+ | — | ~25-40 | `LB-CODEX-0024` |
| 7 Coverage Audit | 64 | 78 (primitives) | 14 | ~8-15 | `LB-CODEX-0025` |

**Section structure**:
- 10.1 The cost-per-entry curve (corpus-shape dependent — patent-defensible nuance)
- 10.2 Why "diminished cost" is empirically anchored (~$8-15 / 14 min for 78-primitive deep audit at 12-field per primitive)
- 10.3 Why "speed" is empirically anchored (14 min wall-clock vs traditional months-of-architecture-audit)
- 10.4 Why "accuracy" is empirically anchored (78 primitives × 12 fields = 936 evidence-grounded data points; 79.5% completeness; 85% evidence-grounded rationale)
- 10.5 The push-a-button productization (Recurring Diagnostic Bushel canon — scheduled-tasks MCP)

---

## Composition with prior canon (always-loaded)

- `MECHANICAL_COMPUTER_CANONICAL_KERNEL.md` — sister architecture canon at high grain
- `MECHANICAL_COMPUTER_LIVING_RECEIPTS.md` — per-primitive lift + compound-lift (this paper consumes those receipts)
- `lb_librarian_canonical_phrasing_unparalleled_accuracy_speed_diminished_cost_bp018.md` — descriptor that this paper grounds in receipts
- `its_how_you_use_it_tagline_librarian_lianabanyan_com_subdomain_bp018.md` — slogan-form
- `lb_frame_ai_agnostic_platform_principle_bp021.eblet.md` — structural framing
- `recurring_diagnostic_bushel_canon_bp021.eblet.md` — productization extension
- All 10 Slow Blade BP021 Eblets — Section 8 substantiation

## Prov-16 candidacy

This paper IS load-bearing for Prov 16 supplementary disclosure. Sections 2-7 + 10 are patent-claim-grade material under #2260 Cooperative Defensive Patent Pledge umbrella. Counsel review at fire-time.

---

*Bishop scaffold BP021 turn 41 — Founder writes prose at fire-time. Brick Wall.*
