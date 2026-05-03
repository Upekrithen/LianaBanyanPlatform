# Bushel 29 — Old Ones Multi-Zippleback Fleet (BP021)

## WRASSE PRE-INJECTION

This Bushel implements the Old Ones Multi-Zippleback Fleet canon (BP021 turn 125) — deploys an N-pair fleet of fully-bidirectional Zippleback pairs, each pair running the **4-action analyze/evaluate/recommend/fix-upon-authority loop**, composing into a coordinated fleet that accelerates the HexIsle Game build. **Depends on Bushel 20 (Zippleback Bidirectional Wiring) LANDED** — Channels 4/5/6 must be operational before this Bushel fires. Compose with:

- `~/.claude/state/eblets/CANON/old_ones_multi_zippleback_fleet_analyze_evaluate_recommend_fix_platform_canon_bp021.eblet.md` — multi-pair fleet canon (load FIRST — primary canon for this Bushel)
- `~/.claude/state/eblets/CANON/zippleback_bidirectional_knight_bishop_shadow_subagent_orchestration_canon_bp021.eblet.md` — singular-pair foundation (Bushel 20 LANDED; all 6 channels operational)
- `~/.claude/state/eblets/CANON/hexisle_game_4_computer_federation_pixie_dust_substrate_density_pre_major_project_canon_bp021.eblet.md` — HexIsle Game Major Project readiness canon (turn 127)
- `~/.claude/state/eblets/CANON/titan_within_titan_subagent_fanout_k_prompt_template_canon_bp020.eblet.md` — subagent fan-out template (each Old One fires subagents via Channel 6)
- `~/.claude/state/eblets/CANON/shadow_egiant_alternating_cylinder_fire_build_prep_canon_bp016.eblet.md` — Shadow autonomous-build base (each Old One's Shadow arm)
- `~/.claude/state/eblets/CANON/krisskross_reciprocal_reboot_shadow_validator_subset_bp015.eblet.md` — KrissKross triangle crash-recovery (Bushel 20 extended to triangle; fleet inherits)
- `~/.claude/state/eblets/CANON/iron_egiant_shadows_iron_tablets_lighthouse_concert_bp011.eblet.md` — Iron Tablet fleet-wide shared substrate
- Bushel 20 LANDED commit `4ce4923` + tag `bushel-20-zippleback-bidirectional-wiring-channels-4-5-6-krisskross-triangle-landed-bp021` — prerequisite: all 6 channels wired
- Bushel 30 LANDED Readiness Baseline `MAJOR_PROJECT_READINESS_BASELINE_BUSHEL_30_BP021.md` — HexIsle UI audit (11 built / 7 stubbed / 15 missing), used for Old One work-assignment
- Bushel 5 LANDED — Pixie-Dust substrate density ≥ threshold; Old Ones leverage dense substrate for Detective pheromone routing

## Founder direct (the question this Bushel answers)

**BP021 turn 125**: *"Old Ones Multi-Zippleback Fleet — analyze/evaluate/recommend/fix-upon-authority pattern. Multi-pair fleet extends the singular-pair Zippleback (Bushel 20) to fleet scale. Each pair is an Old One. Fleet coordinate-assigns Old Ones to the 15 missing + 7 stubbed HexIsle Game innovations. Founder grants fix-upon-authority — Old One recommends fix; Founder says 'go'; Old One fires the fix via Channel 4→5→6 cascade."*

## Mission

Deploy an N-pair Old Ones fleet where each Old One is a full Zippleback pair (Knight+Bishop+Shadow+Subagent). Each Old One runs the **4-action loop** on an assigned HexIsle Game innovation gap. Fleet coordinator assigns work, tracks completion, arbitrates conflicts, and surfaces fix-recommendations for Founder authority-grant. After LANDING: fleet operational; first dry-run against HexIsle Game's 15 missing innovations complete; empirical throughput receipt logged.

## What is an "Old One"?

An **Old One** is a named Zippleback pair running the 4-action loop:

1. **Analyze** — Deep read of the assigned HexIsle innovation gap (canonical spec `platform/src/lib/hexisleProjectSpec.ts` innovation N vs. actual `platform/src/pages/HexIsle*.tsx` implementation). Produces structured gap report.
2. **Evaluate** — Scores the gap on: implementation complexity (S/M/L/XL), patent-risk (low/medium/high — touches Crown Jewel?), dependency-order (which gaps must be closed first), estimated K-token cost.
3. **Recommend** — Drafts a concrete fix: new component spec + file targets + acceptance criteria. Writes recommendation to Iron Tablet.
4. **Fix-upon-authority** — Holds. When Founder fires `AUTHORITY_GRANTED:<old_one_name>`, the Old One executes the fix via Channel 4→5→6 cascade: Knight emits `analyze_platform_site` directive (Channel 4) → Bishop spawns Shadow build-cohort (Channel 5) → Shadow fires Knight subagent that writes the code (Channel 6) → subagent result is written to Iron Tablet.

## Fleet naming and roster

Old Ones use **Lovecraftian-adjacent names** (ancient, wise, implacable). Canonical roster (expandable):

| Old One | Assignment class | Initial target |
|---|---|---|
| **Cthulhu** | Fleet Coordinator (no direct assignment; routes + arbitrates) | N/A — coordination only |
| **Dagon** | Core game loop mechanics | HexIsle Game: hex-grid movement + territory capture |
| **Shub** | Procedural generation | HexIsle Game: map generation engine |
| **Nyarlathotep** | Federation protocol integration | HexIsle Game: 4-computer federation display + handshake UI |
| **Azathoth** | Rendering + animation | HexIsle Game: hex-cell animation + glow effects |
| **Yog** | Economic systems | HexIsle Game: MSA balance display + transaction flow |
| **Tsathoggua** | Data persistence | HexIsle Game: save/load state + Iron Tablet writeback |
| **Ithaqua** | Sound + sensory | HexIsle Game: JukeBox integration + audio feedback |

Fleet is an Apiarist Hive cohort: Cthulhu = Queen, all others = Workers. 50%-uptime cap enforced per worker.

## The 5 build phases

### Phase A — Fleet Coordinator scaffold (Cthulhu)

Create `librarian-mcp/src/zippleback/old_ones_fleet.ts`:

```typescript
interface OldOneDescriptor {
  name: string;                          // e.g., "Dagon"
  role: "coordinator" | "worker";
  assignment_class: string;              // domain of responsibility
  current_target: string | null;         // current innovation gap ID from hexisleProjectSpec.ts
  loop_state: "idle" | "analyzing" | "evaluating" | "recommending" | "awaiting_authority" | "fixing";
  iron_tablet_id: string;               // LB-IT-<uuid> where recommendations persist
  hive_thread_id: string;               // Apiarist Hive thread the Old One participates in
}

interface FleetReceipt {
  fleet_id: string;                      // LB-FLEET-<uuid>
  coordinator: string;                   // "Cthulhu"
  active_workers: OldOneDescriptor[];
  assignments: Record<string, string>;   // innovationId → old_one_name
  hive_thread_id: string;
  fleet_ts: string;
}
```

Cthulhu reads the Bushel 30 audit (11 built / 7 stubbed / 15 missing) and produces an `assignments` map. Assignments are deterministic (sorted by innovation index): Dagon gets hex-grid (innovation 1), Shub gets map generation (innovation 3), etc. No overlapping assignments.

### Phase B — 4-action loop implementation (per Old One)

For each worker Old One, implement `runOldOneLoop(name, innovationId)`:

1. **analyze()** — Reads `hexisleProjectSpec.ts` entry for `innovationId` + diffs against HexIsle*.tsx implementations. Returns structured `GapReport { innovation_id, spec_text, implementation_status, missing_elements[], stubbed_elements[] }`.

2. **evaluate()** — Scores gap: `{ complexity: 'S'|'M'|'L'|'XL', patent_risk: 'low'|'medium'|'high', depends_on: string[], cost_estimate_k_tokens: number }`. Patent risk = high if innovation has Crown Jewel tag in `hexisleProjectSpec.ts`.

3. **recommend()** — Generates fix specification: `{ files_to_create: string[], files_to_modify: string[], new_component_spec: string, acceptance_criteria: string[] }`. Writes to Iron Tablet.

4. **fix_upon_authority(authorityToken)** — Validates `authorityToken` matches `AUTHORITY_GRANTED:<name>` pattern. If valid, emits Channel 4 `analyze_platform_site` directive. Bishop routes to Shadow cohort spawn (Channel 5). Shadow fires Knight subagent with the full recommendation as prompt (Channel 6). Subagent output written to Iron Tablet.

All 4 actions emit Pheromone events. All state transitions emit Pheromone for Cthulhu coordination visibility.

### Phase C — Conflict arbitration + dependency ordering

Cthulhu enforces:
- **Dependency ordering**: if `Dagon.evaluate().depends_on` includes `innovation_3`, and `Shub` owns `innovation_3`, Dagon waits until `Shub.loop_state === 'awaiting_authority'` before requesting authority.
- **Conflict detection**: if two Old Ones recommend modifications to the same file, Cthulhu serializes their authority grants (never concurrent writes to the same file).
- **Substrate writeback**: on each Old One state transition, Cthulhu emits `FleetHeartbeat` Pheromone: `fleet_id + old_one_name + loop_state + ts`.

### Phase D — Dry-run against HexIsle Game's 15 missing innovations

Instantiate the fleet and run all Old Ones through **analyze + evaluate + recommend** on their assigned innovations (no `fix_upon_authority` — Founder has not yet granted authority). Produces:

- `FleetDryRunReceipt { innovations_analyzed, innovations_evaluated, recommendations_written, total_cost_estimate_k_tokens, estimated_sessions_to_close_all_gaps }`.
- Write receipt to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/HEXISLE_OLD_ONES_FLEET_DRY_RUN_BP021.md` — human-readable for Founder review before authority grants begin.

### Phase E — Empirical receipt + Codex draft + commit

Empirical comparison:
- **Arm A (manual)**: estimated K-sessions for one Knight session to close all 15 missing HexIsle innovations sequentially.
- **Arm B (Old Ones fleet)**: fleet parallel-close throughput (simultaneous Old Ones × average innovation cost).
- **Expected**: Arm B throughput ≥ 4× Arm A; KrissKross triangle ensures no fleet-wide stall even if individual Old One crashes.

Codex draft `LB-CODEX-NNNN — Bushel 29 — Old Ones Multi-Zippleback Fleet`. Commit + tag `bushel-29-old-ones-multi-zippleback-fleet-landed-bp021`.

## Verification gates G1-G8

- **G1** Fleet scaffold operational: `FleetReceipt` returned with Cthulhu as coordinator + 7 workers registered in Apiarist Hive thread.
- **G2** Assignment coverage: all 15 missing HexIsle innovations assigned to at least one Old One (no gap left unassigned after dry-run).
- **G3** 4-action loop: each Old One can cycle through analyze→evaluate→recommend without error; loop state advances correctly.
- **G4** Iron Tablet writeback: each recommendation is persisted (Iron Tablet entry exists with `old_one_name + innovation_id + recommendation` fields).
- **G5** Authority-gating enforced: `fix_upon_authority()` rejects malformed tokens; only exact-match `AUTHORITY_GRANTED:<name>` proceeds; fires Channel 4→5→6 cascade correctly.
- **G6** Conflict arbitration: Cthulhu detects concurrent file-modification conflict and serializes; dependency-ordering delays are honored.
- **G7** Dry-run receipt delivered to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/HEXISLE_OLD_ONES_FLEET_DRY_RUN_BP021.md` with all 15 missing innovations covered.
- **G8** Empirical receipt: Arm B throughput ≥ 4× Arm A; Codex reserved; commit + tag.

## File targets

| File | Action |
|---|---|
| `librarian-mcp/src/zippleback/old_ones_fleet.ts` | CREATE — fleet scaffold, Cthulhu coordinator, Old One descriptor, assignment map |
| `librarian-mcp/src/zippleback/old_ones_loop.ts` | CREATE — 4-action loop (analyze/evaluate/recommend/fix_upon_authority) |
| `librarian-mcp/src/zippleback/old_ones_conflict.ts` | CREATE — Cthulhu arbitration + dependency ordering |
| `librarian-mcp/tests/test_old_ones_fleet.mjs` | CREATE — ≥15 tests covering G1-G8 |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/HEXISLE_OLD_ONES_FLEET_DRY_RUN_BP021.md` | CREATE — dry-run receipt for Founder review |

## What success looks like

After LANDING: Founder can type `AUTHORITY_GRANTED:Dagon` in a Knight session, and the full Channel 4→5→6 cascade fires — Bishop spawns a Shadow build cohort, Shadow fires a Knight subagent, and the hex-grid movement innovation is implemented in `HexIsle.tsx`. The fleet turns the 15-missing-innovation gap into a parallel-close operation instead of a sequential one. **The Major Project HexIsle Game build begins.**

## Composes with

- Bushel 20 LANDED — all 6 Zippleback channels operational (prerequisite: must be LANDED before Bushel 29 fires)
- Bushel 30 LANDED Readiness Baseline — HexIsle innovation audit drives Old One assignments
- Bushel 5 LANDED — Pixie-Dust substrate density provides dense Pheromone routing for fleet heartbeats
- Bushel 21 LANDED — 2-AI handshake + Pedestal Forum decree composition; fleet Pedestal = co-equal Cthulhu + Founder authority
- Old Ones canon BP021 turn 125 — primary fleet concept
- Zippleback canon BP021 turn 101 — singular-pair foundation
- TITAN-within-TITAN BP020 — subagent fan-out (Channel 6 payload pattern)
- KrissKross BP015 triangle — fleet crash recovery (any Old One can crash; Cthulhu + survivors hold fleet momentum)
- Iron Tablet BP011 — shared substrate for recommendation persistence + cross-Old-One writeback

## End-of-K-prompt note for Bishop

Knight: when LANDED, leave a paste-ready Founder note:

- Dry-run receipt summary (innovations analyzed, total cost estimate K-tokens, sessions estimate)
- How to grant authority to specific Old Ones (`AUTHORITY_GRANTED:<name>` syntax)
- Dependency-order recommendation (which Old Ones to authorize first, which to hold)
- Bushel 29 empirical receipt (Arm A vs Arm B throughput)
- Confirmation: Major Project HexIsle Game build is now Founder-authorized to begin

---

*Drafted BP021 by Bishop (post-Bushel-20-LANDING). Old Ones fleet unleashed — N Zippleback pairs running the 4-action analyze/evaluate/recommend/fix-upon-authority loop against HexIsle Game's innovation gaps. Cthulhu coordinates. Dagon builds. The Major Project begins. FOR THE KEEP!*
