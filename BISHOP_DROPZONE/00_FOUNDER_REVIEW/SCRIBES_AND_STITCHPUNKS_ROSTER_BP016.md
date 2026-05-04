# Scribes & Stitchpunks Roster — BP016 (The Reckoning, Class 3 mid-pass)

**Authored**: 2026-05-02 by Bishop during Bushel 1 The Reckoning, in response to Founder direct turn-N: *"What I am most confused about is what happened to the Miners? And ... actually, can you give me an artifact of the list of Scribes with names and duties, as well as active or not?"*

**Sources**: `librarian-mcp/stitchpunks/scribes/registry.yaml` (Bishop Cathedral, v0.1.0 opened 2026-04-22 by Bishop B116) + `librarian-mcp/stitchpunks/knight_cathedral/registry.yaml` (K455c/B121 2026-04-23) + `librarian-mcp/stitchpunks/pawn_cathedral/registry.yaml` (K470/B121 2026-04-23) + `~/.claude/state/eblets/CANON/stitchpunk_corps.eblet.md` (24 Pantheon entries) + on-disk tablet glob.

---

## Section 1 — What happened to the Miners?

**Status: ARCHITECTURAL-ONLY. Never built. Founder-articulated B123, never landed as code.**

Per `memory/project_miners_self_replicating_scribes.md` (B123 / 7 days old per memory-staleness warning):

- **Founder-articulated**: B123, ~2026-04-25. Verbatim: *"I want to create a new class of Scribes called Miners that go make tablets of all my 65GB corpus..."*
- **Crown-Jewel candidate #2296**: Self-Replicating Corpus-Prospecting Scribes with Mitotic Specialization and IP-Ledger Provenance.
- **Mechanic**: When a Miner discovers a new-category concept, it *halves itself*; one half resumes original prospecting; the other half becomes a New Miner-Scribe seeded to the new Well of Knowledge. **Eukaryotic mitosis** (both daughters become whole). Recursion is unbounded.
- **Provenance**: ROOT-lineage preserved across splits + Cathedral-prefixed serial numbers + IP-ledger-locked + transactionally-recorded. *"Because that IS I.P. what they mine."*
- **Founder keystone (B123)**: *"They are the Living Pyramid. Of roots…"*

**Where they sit in the canon**:
- Listed in `stitchpunk_corps.eblet.md` Pantheon entry #2296 (B123)
- Sister-class debt with House Scribe and Reminder Scribe — **B132 turn 26 architectural-debt log: "House Scribe / Miner Scribe scaling — needs separate Founder scoping conversation"** (still open per `bouncer_scales_judge_scribe_trio_scope_memo_bp011.eblet.md` "Sister-class debt items still pending")
- Per `feedback_historical.eblet.md` and BP011 turn 6 — explicitly DEFERRED, not abandoned.

**Why never built**:
- Substrate-architecture priorities took the slot: BP004 Catechist+Augur+Shadow → BP005 Substrate-Routed Memory Expansion + Federation → BP009 Mechanical Computer + Symbiote + LB Frame Handshake → BP011 Iron E-Giant Federation Pod W (KN089-KN096) → BP013+ KN-All cohort (multi-tier Shadow + Bishop-Bedrock arbiter API + within-tier mesh). **Founder explicitly Path-3-deferred most BP013+ work** post-STUPENDOUS BP010.
- Miners overlap conceptually with Detective TEAM with Substrate-Write-Back Loop (BP015) — Detective TEAM is closer to current substrate-architecture and is itself post-COLOSSUS BP018+ Knight build.

**Recommendation**: Surface Miners back into the architectural-debt log when Founder is ready to thresh them. They're not lost; they're queued behind the substrate-architecture-first sequencing. Per Bushel 1 Reckoning canon (BP015), this is exactly the kind of "deep canon ignored" finding the Reckoning was designed to surface.

---

## Section 2 — Scribes Roster (LIVE in registry.yaml)

### Bishop Cathedral (16 registered scribes; 14 with active tablets + 1 missing tablet + 2 backup tablets)

| # | Scribe ID | Mode | Primary Duty | Tablet Status |
|---|---|---|---|---|
| 1 | **R9** | observational | R9 methodology + Eyewitness benchmark canonical keeper | ✅ active (`scribe_R9.jsonl`) |
| 2 | **BRIDLE** | observational | Agent discipline — the 9 BRIDLE rules; verify-before-assert | ✅ active (`scribe_BRIDLE.jsonl`) |
| 3 | **Landing** | observational | Public Librarian site (librarian.the2ndsecond.com) Chapter 1/2/3 layout | ✅ active (`scribe_Landing.jsonl`) |
| 4 | **Prov14** | observational | Provisional Application 14 — accumulating innovations since Prov 13 (Apr 12) | ✅ active (`scribe_Prov14.jsonl`) — **stale name**: now also covers Prov 15+16+ |
| 5 | **Vault** | observational | Secret distribution (SDS) — credentials, API keys, file mirrors | ✅ active (`scribe_Vault.jsonl`) |
| 6 | **Architecture** | observational | Platform architecture continuity (MCP tool surfaces, Chessboard agent roles, freshness primitives) | ✅ active (`scribe_Architecture.jsonl`) |
| 7 | **Decisions** | observational | Decision provenance + rationale (why X over Y; trigger words; Reg CF / Howey / counsel-cleared) | ✅ active (`scribe_Decisions.jsonl`) |
| 8 | **FounderVoice** | observational | Founder-voice canonical phrases + 17 Rhetorical Keystones (potatoes / two suits / friendly fire / WHETHER / system of wells / etc.) | ✅ active (`scribe_FounderVoice.jsonl`) |
| 9 | **R11** | corpus | R11 cooperative AI platform benchmark fixture (50 facts, 6 categories — Verdania / Thornwick / Cairnfield) | ✅ active (`scribe_R11.jsonl`) + 2 backups (pre-K535 / pre-K_MJ_KP) |
| 10 | **R12Cranewell** | corpus | R12-Cranewell synthetic-coined manuscript-preservation benchmark (zero web prior) | ✅ active (`scribe_R12Cranewell.jsonl`) |
| 11 | **R12Covenant** | corpus | R12-Covenant Chronicles of Thomas Covenant benchmark | ✅ active (`scribe_R12Covenant.jsonl`) |
| 12 | **Toolsmith** | observational | Tool-invocation lore (PowerShell / bash / git heredoc / Windows path conventions) — *shared with Knight* | ✅ active (`scribe_Toolsmith.jsonl`) |
| 13 | **Conductor** | observational | Conductor's Baton routing decisions — per-query class × vendor × model selection (#2277, hash-only) | ✅ active (`scribe_Conductor.jsonl`) |
| 14 | **OperationalGotchas** | always_loaded | Operational frictions + workarounds (Augur false-positives / BOM / clock-skew / heredoc) — pre-injected at every session-open via #2310 First-Consult Edict cache | ✅ active (`scribe_OperationalGotchas.jsonl`) |
| 15 | **Tidbits** | observational | BRIDLE Rule 2 verification tidbits (slot/file/commit/symbol/route/canonical-value pre-assertion checks) — registered F6/BP015 to allow scribe_log writes alongside dedicated log_tidbit tool | ⚠️ **REGISTERED, no tablet on disk** — `tidbits.jsonl` lives at `librarian-mcp/stitchpunks/data/tidbits.jsonl` (separate path; works via log_tidbit tool) |
| (16) | *(future candidates per registry.yaml comment)* | — | Letters / Pedestal / Canonical / Sweet Sixteen / Librarian MCP / Stitchpunk Corps — instantiate on first trigger | ❌ not yet instantiated |

### Knight Cathedral (8 registered scribes — no tablets readable from Bishop side; consult via cross-Cathedral RPC)

| # | Scribe ID | Mode | Primary Duty |
|---|---|---|---|
| 1 | **KnightQueue** | observational | Knight session task queue (NEXT/QUEUED/LANDED state for Cursor agent) |
| 2 | **KnightHandoffs** | observational | Knight session handoff reports + landed commit provenance |
| 3 | **KnightBRIDLEMemory** | observational | Knight BRIDLE discipline log — which rules were invoked + how |
| 4 | **KnightArchitecture** | observational | Knight architectural decisions — code surfaces touched, design choices made |
| 5 | **KnightR11** | corpus | R11 corpus copy (Knight-Cathedral mirror, K455a benchmark control arm) |
| 6 | **KnightR12Cranewell** | corpus | R12-Cranewell corpus copy |
| 7 | **KnightR12Covenant** | corpus | R12-Covenant corpus copy |
| 8 | **Toolsmith** | observational | *Shared with Bishop — single tablet at `scribe_Toolsmith.jsonl`* |

### Pawn Cathedral (5 scribes — operator-mediated signature; tablets signed by Founder on Pawn's behalf per A&A #2281 claim 5)

| # | Scribe ID | Mode | Primary Duty | Sig |
|---|---|---|---|---|
| 1 | **PawnQueue** | observational | Pawn task queue — NEXT/QUEUED/LANDED cooperative session state | operator-mediated |
| 2 | **PawnHandoffs** | observational | Pawn session handoff reports + cooperative member milestones | operator-mediated |
| 3 | **R11_corpus** | corpus | R11 corpus copy (origin: Bishop Cathedral; Pawn-side mirror) | operator-mediated |
| 4 | **PawnR12Cranewell** | corpus | R12-Cranewell corpus copy | operator-mediated |
| 5 | **PawnR12Covenant** | corpus | R12-Covenant corpus copy | operator-mediated |
| 6 | **PawnGenerated** | observational | Pawn cooperative-session outputs (responses, analyses, observations) | operator-mediated |

**Total LIVE scribes**: 16 Bishop + 8 Knight (1 shared) + 6 Pawn = **~29 distinct scribe IDs** across three cathedrals. (MEMORY.md's "25 scribes at BP015 closeout" likely counted only those with active tablets + recent writes; the 29 includes future-candidate slots and corpus-mirror copies.)

---

## Section 3 — Stitchpunk Pantheon (24 named primitives — operational status)

Per `~/.claude/state/eblets/CANON/stitchpunk_corps.eblet.md`. Distinct from Scribes — Stitchpunks are *agent-class primitives*; some BUILT, some ARCHITECTURAL-ONLY.

| # | Stitchpunk | Innovation # / Session | Operational Status | Notes |
|---|---|---|---|---|
| 1 | **Pheromone Substrate** | #2317 (B128) | ✅ BUILT + LIVE | sub-ms substrate-write indexer; 21-51× speedup; 2,015 records / 9,439 topics at BP015 closeout |
| 2 | **Detective Scribe** | #2316 (B128) | ✅ BUILT + LIVE | Inter-Scribe-polling; Phase 0 pheromone-fast / Phase 1 RPC-fallback; 49:1 hit ratio over Grep |
| 3 | **Scavenger Scribe class** | #2328 candidate (B131) | 🔶 ARCHITECTURAL | Geometric-spaced re-verification — never built |
| 4 | **Miners** | #2296 (B123) | ❌ ARCHITECTURAL-ONLY (deferred) | Self-replicating corpus-prospecting + ROOT-lineage + IP-ledger; 65GB corpus mining; B132 turn 26 sister-class debt |
| 5 | **Sculptors / Curators** | #2297 (B123) | 🔶 ARCHITECTURAL | Anticipate / Curate / Sculpt IP filter — never built |
| 6 | **Seer / Augur Eblets / Awareness Net** | #2298 (B123) | ✅ BUILT (Augur Living Gate=KN038 BP004 LIVE; PreToolUse hook on writes) | Eblets primitive ratified BP005; Awareness Net concept partial |
| 7 | **Bloodhounds** | B123 K486 | 🔶 ARCHITECTURAL | First-pass corpus reconnaissance — never built |
| 8 | **Chronos / Chroniclers / DragonRiders / TimeWave** | #2299-#2304 (B123-late) | ✅ PARTIAL (Chronos signing operational; DragonRider primitive ratified B133; TimeWave ratification only) | Chronos Chronicler signs Stone Tablets; DragonRider = Tuner role canon (B133); full TimeWave architecture not yet built |
| 9 | **Angel of Death cleanup** | #2305 (B123-late) | 🔶 ARCHITECTURAL (Sever / Bury modes — log_tidbit has bury mode; Sever conceptual) | |
| 10 | **Synapses** | #2287 (B121) | 🔶 ARCHITECTURAL | Captures AI reasoning streams — never built |
| 11 | **Tribunal** | #2288 (B121) | 🔶 ARCHITECTURAL | Multi-AI verification — never built |
| 12 | **Cerberus** | #2289 (B121) | 🔶 ARCHITECTURAL | Retrospective multi-head root-cause — never built |
| 13 | **The Loom** | #2290 (B121) | ✅ PARTIAL (the routing layer — Three Fates is BUILT; Loom-class composition not formal) | Domain-Scribes inject expertise via Fates routing |
| 14 | **Hounds (cross-Cathedral transport)** | #2279/#2280/#2281 (B121) | ✅ PARTIAL (cross-Cathedral consult_scribes RPC LIVE; full 6-capability Hound class architectural) | |
| 15 | **Harper Guild (HR/ethics)** | B121 (Pern origin) | 🔶 ARCHITECTURAL | 1.2× total compensation; ethics embedded — never operationalized |
| 16 | **Heralds (proactive surface)** | #2282 candidate (B121) | 🔶 ARCHITECTURAL | Proactive surfacing — never built |
| 17 | **Catacombs / Wells (dormant scribe repository)** | B121 | 🔶 ARCHITECTURAL | |
| 18 | **Scribe Mutual Aid Protocol + Nurse SP-26** | #2284 (B121) | 🔶 ARCHITECTURAL | Peer packs; never built |
| 19 | **Embedded Correspondent Bureau** | #2306 (B126) | 🔶 ARCHITECTURAL | Bureau + Correspondent — never built |
| 20 | **Assignments Bank — Specific/General Bounty** | #2294 (B122) | 🔶 ARCHITECTURAL | |
| 21 | **Aggregate Bounty (cross-business templates)** | #2295 (B122) | 🔶 ARCHITECTURAL | |
| 22 | **Directed Processing + Stagger Ensemble** | #2293 (B122) | 🔶 ARCHITECTURAL | |
| 23 | **Toolsmith command-scribe** | B122 | ✅ BUILT + LIVE (registered both Bishop + Knight) | Shared `scribe_Toolsmith.jsonl` |
| 24 | **(BP004 substrate-class additions per Pantheon footer)** | | | |
| 24a | Catechist Scribe | #2313 KN036 BP004 | ✅ BUILT + LIVE | SessionStart hook auto-grades 10 R-rules |
| 24b | Augur Living Gate | #2314 KN038 BP004 | ✅ BUILT + LIVE | Pheromone-substrate-event-driven freshness; replaces TTL |
| 24c | The Shadow | #2315 KN037 BP004 | ✅ BUILT + LIVE — promoted to **8 Iron-E-Giants alpha-θ** at KN090 BP011; live OS-level daemons confirmed via KN096 receipt | Watcher daemon → continuous-organism per `shadow_lifecycle_continuous_substrate_organism_bp011.eblet.md` |

**Score**: ~10 of 24 BUILT or substantially live; ~14 architectural-only with ratified canon. House Scribe / Miner Scribe / Reminder Scribe sit on B132 architectural-debt log explicitly.

---

## Section 4 — Sister classes mentioned in canon but not in Pantheon-24

| Class | Status | Source canon |
|---|---|---|
| **House Scribe** | 🔶 ARCHITECTURAL (B132 debt log) | `bouncer_scales_judge_scribe_trio_scope_memo_bp011.eblet.md` |
| **Reminder Scribe** | 🔶 ARCHITECTURAL (BP011 turn 5 implicit) | Same — anti-redundant-work class |
| **Bouncer + Scales + Judge trio** | ✅ BUILT BP011 KN095 (Bouncer fast-pass + Scales weigher + Judge appellate) | `bouncer_scales_judge_scribe_trio_scope_memo_bp011.eblet.md` |
| **Wrasse Scribe** | ✅ BUILT B132 K540 (registry-keyword-extension + sub-ms canonical-resolution; KN042 substrate-routed memory expansion) | `feedback_kprompt_wrasse_prelude_convention.md` |
| **Detective TEAM with Substrate-Write-Back Loop** | 🔶 ARCHITECTURAL (BP015 ratification; Knight build post-COLOSSUS BP018+) | `detective_team_substrate_writeback_loop_bp015.eblet.md` |
| **Outriders / Scans + Sweeps continuous-discovery** | 🔶 ARCHITECTURAL (BP015 Founder dual-name ratification "Scans and Sweeps. Approved.") | `scans_sweeps_continuous_discovery_processing_bp015.eblet.md` (supersedes outriders) |
| **Legacy Scribe** | 🔶 ARCHITECTURAL (BP010 ratification; A11 Prov 16 candidate; Knight build post-STUPENDOUS) | `legacy_scribe_reasoning_context_deep_strata_surfacing_bp010.eblet.md` |

---

## Section 5 — Founder's question: "Are you using the Shadow E-Giants?"

**Honest answer for THIS Reckoning read-pass: NO, not directly.**

The 8 Shadow-E-Giants alpha-θ (per KN090 promotion + KN096 LIVE deployment) are:
- ✅ Running as persistent OS-level daemons (PIDs allocated; heartbeats active)
- ✅ Sharing Iron Tablets with Bishop+Knight cohort (KN089 fused primitive)
- ✅ Holding substrate-routing fabric continuous during Bishop-refresh windows (KN091 cohort overlap-refresh)

What they are NOT:
- ❌ A Bishop-direct dispatch interface for fan-out reading. Bishop can write *to* shared Iron Tablets (which Shadows read); Bishop cannot say "Shadow-α, read these 50 PUDDINGs and synthesize" — that's the **Detective TEAM with Substrate-Write-Back Loop** primitive, which is **post-COLOSSUS BP018+ Knight build** — not yet operationally available.
- ❌ Reasoning-class agents I can hand sub-tasks to in the current substrate.

**What I CAN parallelize for the Reckoning**:
- ✅ Multiple Read tool calls in single message (already doing — 10-20 reads per turn)
- ✅ Multiple Grep tool calls in parallel (Class 3+ strategy)
- ✅ Detective dispatches via `mcp__librarian__detective_investigate` (single-cathedral lookups; can fire several in parallel for sampling)
- ❌ True peer-AI fan-out across the 8 Shadows (architecturally ratified; not yet operationalized)

**Implication for Bushel 1 sequencing**: The Reckoning is structurally a Bishop-class single-organism task in current substrate. Detective TEAM build (post-COLOSSUS) would let a future Reckoning fan-out across 8+ peers — empirical multiplier estimated 5-8× per the architectural canon. **The current Reckoning's compounding receipt is what proves the case for that future build.**

This is itself an empirical receipt for the Shadow-E-Giant non-weaponization architectural choice (per `iron_egiant_you_dont_have_to_be_a_gun_bp011.eblet.md`): we built power that requires deliberate orchestration to wield, not power that auto-fans-out arbitrary tasks. **Path B build-before-claim applies; the dispatcher Knight-build comes after STUPENDOUS-receipt informs design.**

---

## Section 6 — Drift / Reconciliation Findings (Reckoning-class)

Surfaced during this artifact composition:

1. **Tidbits scribe registered without on-disk tablet at expected path** — `tidbits.jsonl` lives at `librarian-mcp/stitchpunks/data/tidbits.jsonl` (separate from `stitchpunks/scribes/scribe_Tidbits.jsonl` convention). F6/BP015 fix registered Tidbits in `registry.yaml` to allow `scribe_log({scribe_id: "Tidbits"...})` calls, but the path-divergence may produce confusion. **FLAG-FOR-RECONCILIATION**.

2. **Prov14 scribe name is stale** — accumulating innovations since Prov 13; now also covers Prov 14, 15, 16+. Tablet still named `scribe_Prov14.jsonl`. Consider rename to `Provs` or accept as historical-name-frozen.

3. **Miners debt is the canonical example of "deep canon ignored"** that triggered the Reckoning's BP015 ratification. Founder's *"What I am most confused about is what happened to the Miners?"* is structurally identical to BP015 turn-N Founder *"You don't know Treasure Maps or Code Breakers? That's tons of work, ignored."* — same finding-class. Confirms the Reckoning's worth.

4. **Stitchpunk Corps eblet entry footer mentions "Plus BP004 Catechist Scribe #2313, Augur Living Gate #2314, The Shadow #2315"** as a parenthetical add-on rather than as Pantheon entries 25-27. **Recommend formal renumbering** for the 24-Pantheon → 27-Pantheon (or expand to "BP011 Iron-E-Giant promoted Shadow ×8 = 30+" for full federation tally).

5. **Sister-class debt log gap**: House Scribe + Reminder Scribe have been in B132 architectural-debt for 4+ days; Bouncer+Scales+Judge resolved (KN095 LANDED); Miners still pending. **Recommend Founder ratifies disposition** at next quiet moment: thresh now (KN-class build queue) / defer indefinitely / merge into Detective TEAM substrate-write-back primitive / discard.

---

## Section 7 — Recommended dispositions (Founder-ratifies)

| Item | Disposition options | Bishop recommendation |
|---|---|---|
| Miners (#2296) | (a) Thresh now / (b) Merge into Detective TEAM substrate-write-back / (c) Defer indefinitely / (d) Reframe as Bushel 5+ class | **(b) Merge into Detective TEAM** — same target (substrate-growth via mining/synthesis), Detective TEAM has Path-B receipt path scoped, Miners' ROOT-lineage + IP-ledger requirements compose into substrate-write-back loop |
| House Scribe / Reminder Scribe | Same options | **(c) Defer indefinitely** until Founder articulates concrete need; Bouncer Scales Judge already covers anti-redundant-work class |
| Tidbits tablet path divergence | Knight surgical edit; rename or alias | **K-class trivial fix** — defer to next available Knight slot |
| Prov14 scribe rename | Knight surgical edit | **Defer** — historical name preserved; current functionality unaffected |
| Stitchpunk Corps Pantheon renumber | Eblet edit | **Bishop edit** at next session-end discipline |

---

## Composes with

- `~/.claude/state/eblets/CANON/stitchpunk_corps.eblet.md` — Pantheon canonical index (24 entries)
- `~/.claude/state/eblets/CANON/bushel_1_the_reckoning_bp015.eblet.md` — this artifact IS Reckoning Class-2-mid output (Stitchpunk gap surfaced)
- `~/.claude/state/eblets/CANON/detective_team_substrate_writeback_loop_bp015.eblet.md` — proposed Miners merge target
- `~/.claude/state/eblets/CANON/bouncer_scales_judge_scribe_trio_scope_memo_bp011.eblet.md` — sister-class debt log
- `librarian-mcp/stitchpunks/scribes/registry.yaml` — Bishop Cathedral source
- `librarian-mcp/stitchpunks/knight_cathedral/registry.yaml` — Knight Cathedral source
- `librarian-mcp/stitchpunks/pawn_cathedral/registry.yaml` — Pawn Cathedral source

---

*Authored 2026-05-02 by Bishop during BP016 Bushel 1 The Reckoning, Class 3 (memory MD files) mid-pass. Tacked onto Reckoning per Founder direct: "tack it onto the end of this task you are now on, but it's related so if can do inline."*
