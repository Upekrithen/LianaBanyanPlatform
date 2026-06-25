# Marathon 22 Amendment — MIC Role Rotation + Escalation Cascade + TCP/IP Graceful Degradation
## BP091 · 2026-06-22 ~17:15 Central · Founder-direct architecture additions

**This amendment PAIRS with the M22 dispatch at:**
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_SESSION_22_TIER_AWARE_MESH_ROUTING_PRODUCTIZATION_BP091.md
```

The original M22 dispatch is structurally correct. This amendment ADDS three BP091 ~17:00 Central Founder-direct architectural locks that bind Knight's implementation. Read this amendment AFTER the original M22.

---

## Addition §A.7 — FireGuard · Two-Peer Always-On MIC Duty (Founder-direct BP091 ~18:00 Central)

**Founder verbatim:** *"apply the fire-guard solution so always covered, and can offset load... the point being that there will always be at least two switching, so that if one heartbeat fails, orchestration survives better... make sure that the MICs stagger per number and capability... if 2 they alternate, if 3 they STILL alternate, but now doubled as shadow so sharing that info simultaneously via socceri eblit pheromone emitting blips."*

### §A.7.1 Canon binding
This amendment binds the new canon `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_fireguard_two_peer_always_on_mic_duty_proactive_resilience_bp091.eblet.md` as a hard architectural requirement for M22 implementation.

### §A.7.2 Implementation requirements (Knight wires)
1. **MIC-eligible pool detection** — NANO + LITE + CORE preferred; FULL only as fallback; ULTRA never under normal ops (per canon §3)
2. **PRIMARY/SHADOW per-wave rotation** — 2 peers alternate; 3+ peers round-robin PRIMARY with all others = SHADOWS
3. **Soccerball-eblit pheromone state-stream** — PRIMARY emits per-wave blips (wave_id, task_queue_state, tier_assignments, aggregation_progress, next_action_intent); SHADOWS subscribe + maintain synchronized view
4. **Proactive heartbeat watch** — SHADOWS monitor PRIMARY blip cadence; trigger §A.6 election after ≤5s blip gap
5. **Marks accrual for MIC service** — PRIMARY 100%, SHADOW 25%, failover-hero +50% bonus (per canon §7)
6. **Settings UI "Cooperative Mesh Activity"** (per M22 §6) extended to show: current PRIMARY · current SHADOWS · MIC role rotation history · per-peer MIC Marks accrual

### §A.7.3 Empirical smoke gate (Knight cannot close M22 without)
Synthetic PRIMARY-stale event triggers SHADOW promotion in <5s with ZERO in-flight task loss. Bishop verifies via REST poll during M22 KniPr.

### §A.7.4 Current fleet behavior (BP091 mesh state)
MIC-eligible pool = M1 (CORE) + MS (CORE) = 2 peers alternating PRIMARY/SHADOW. M2/M3 (FULL) stay on inference; M0 (ULTRA) bulldozes hardest questions only.

---

## Addition §A.8 — M22 ship BUNDLES M21 auto-update + M18c UI bug fixes (Founder-direct BP091 ~18:30 Central)

Founder ratified: M22 ship = v0.6.0 = bundled M22 tier-aware mesh + FireGuard + M21 auto-update toggle + M18c UI bug fixes. Single .exe to install once across fleet → auto-update armed forever after.

### §A.8.1 M21 build-include
M21 code (commit 20c9181) is in git but NOT in v0.5.18 .exe. M22 ship MUST rebuild .exe to include M21's auto-update toggle code. Bishop empirically confirms v0.6.0 build commit-hash post-build is ≥ commit 20c9181 (M21) AND includes M22 + FireGuard + M18c code.

### §A.8.2 M18c bug fixes to bundle
1. **AMD VRAM detection** — RX 9070 XT reports VRAM=0 via wmic on Windows; need fallback to alternate detection method (PowerShell Get-WmiObject Win32_VideoController.AdapterRAM with parse, OR DXGI query). Affects Founder's M0 and any future AMD-GPU peer
2. **Settings UI tier-display logic** — when override_active=true, UI banner should show effective-tier (ULTRA + Override: llama3.3:70b), NOT auto-detected-tier (currently shows NANO incorrectly on M0)
3. **Auto-update version-check URL** — v0.5.17 in-app "Check for Updates" can't find v0.5.18; ensure v0.6.0's in-app check correctly queries version_trust.json data source (per `canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090`)

### §A.8.3 Version bump
v0.5.x → **v0.6.0** (major UI changes + new architectural primitives = minor version bump in semver-ish convention). Knight may propose v0.5.19 if preferred — Founder ratifies at build time.

### §A.8.4 Phase 2 abort gate
Per Founder Path B ratify BP091 ~18:00 Central: **M13b currently running in Knight Phase 2 session must be ABORTED.** M13b re-fires AFTER v0.6.0 lands as canonical first-time full-stack THUNDERCLAP. Paste-ready abort message in companion Bishop turn-output below.

---

## §M22-FULL-RATIFY · BP091 ~18:15 Central · ALL gates RATIFIED — M22 cleared to fire

**Founder-direct: "R6-R8 YES do it" — BP091 2026-06-22 ~18:15 Central.**

Original M22 dispatch R1-R5: ratified prior sessions ✅
Original M22 dispatch R6: Settings UI "Cooperative Mesh Activity" surface design ✅ **RATIFIED 2026-06-22**
Original M22 dispatch R7: Heartbeat interval (5 min default per dispatch §3) ✅ **RATIFIED 2026-06-22**
Original M22 dispatch R8: Sequencing — M22 fires AFTER Phase 1 + Phase 2 cascades land ✅ **RATIFIED 2026-06-22**
Amendment R9: MIC role rotation per §A ✅ ratified prior
Amendment R10: 5-step escalation cascade per §B ✅ ratified prior
Amendment R11: Math/physics ULTRA-direct routing per §B.3 ✅ ratified prior
Amendment R12: TCP/IP graceful degradation canon binding per §C ✅ ratified prior
Amendment R13: Emergency two-model M0 self-orchestration per §A.5 ✅ ratified prior (M0 specs confirmed: Ryzen 9 9900X · 64 GB RAM · RX 9070 XT 16 GB VRAM · Llama 3.3 70B hybrid ~3-5 tok/s expected)
Amendment R14: MIC failover election protocol per §A.6 ✅ ratified prior

**M22 + amendment ARCHITECTURALLY + RATIFICATIONALLY COMPLETE. Cleared to fire post-Phase-2.**

---

## Addition §A — MIC Role Rotation (Founder-direct BP091 ~17:00 Central)

**Founder verbatim:**
> *"The real issue last time was that my M0 machine was orchestrating and that made it's ability to DO any questions degrade (by far, the MOST) then we need to implement what I told you before - MIC doesn't work. MIC orchestrates."*

### §A.1 The doctrinal rule

**Whoever holds MIC role for a dispatch wave does NOT take worker tasks during that wave.** Their entire capacity goes to orchestration. MIC rotates per workload class so no single machine permanently shoulders orchestration overhead.

This is the structural fix for M14 Finding #3 (M0 escalation overflow). Under MIC-role-rotation, the M0-self-orchestration bug becomes architecturally impossible.

### §A.2 Per-workload MIC assignment table

Knight wires `selectMIC(workloadClass: WorkloadClass): peer_id` per:

| Workload class | Default MIC choice | Workers |
|---|---|---|
| **HEAVY-REASONING** (HARD MMLU-Pro, math, physics) | FULL-tier peer (M3 or M2 — best gemma4:12b in fleet, NOT the ULTRA) | M0 ULTRA llama3.3:70b + remaining FULL + CORE for verification |
| **MIXED** (mostly MEDIUM) | FULL-tier peer (M3 or M2) | M0 + remaining FULL + CORE |
| **LIGHT** (mostly SHORT/VERIFICATION) | CORE-tier peer (M1 or MS) | All peers as workers |
| **VOTING/CONSENSUS** | Any FULL-tier OR CORE-tier peer | All peers vote |
| **ALL-STALE EMERGENCY** (only ULTRA online) | M0 (emergency self-orchestration with two-model degraded mode per §A.5) | M0 worker |

### §A.3 MIC capacity dedication during a wave

When peer X holds MIC role:
- `peer_presence.role = "MIC"` set for the wave duration
- Dispatcher REFUSES to assign worker tasks to peer X for that wave
- X's compute fully available for orchestration ops: question fan-out, response aggregation, escalation routing, Council consensus tabulation
- On wave completion, X's role flips back to "worker-available"

### §A.4 MIC rotation algorithm

Between dispatch waves:
- Round-robin MIC role among eligible peers (FULL-tier peers for heavy workloads, CORE for light)
- Track `peer_presence.mic_load_hours` so no single peer accumulates more than 1.3× the fleet average — load-balanced fairness
- Per Heart-of-Peace: MIC is service, not punishment; rotation honors every peer's contribution

### §A.5 Emergency fallback (two-model on M0)

If ALL peers except M0 are stale simultaneously:
- M0 self-orchestrates with TWO models loaded (`gemma4:12b` as orchestrator slot + `llama3.3:70b` as worker slot)
- Ollama config: `OLLAMA_NUM_PARALLEL=2`, `OLLAMA_KEEP_ALIVE=24h` to keep both warm
- Bishop-warning surfaced to Founder: "Emergency-mode self-orchestration active — performance degraded, awaiting peer return"
- Auto-exit emergency mode when ≥1 FULL-tier peer returns
- This is the ONLY case where M0 holds MIC role — never under normal operation

**Empirical caveat:** Two-model M0 self-orchestration requires M0 to have either (a) GPU with ≥48 GB VRAM (both models in VRAM simultaneously) OR (b) accept CPU-inference fallback for whichever model isn't in VRAM (~1-3 tok/s for llama3.3:70b on CPU). Founder to provide M0 GPU specs at next gadget-cycle so Knight can tune.

---

## Addition §B — Escalation Cascade (Founder-direct BP091 ~17:00 Central)

**Founder verbatim:**
> *"to save time, the Beastiest get the meatiest questions, but if a middling question, (say, on FULL machine) still doesn't get the answer (Math? Physics anyone?) then it get EITHER Plow Loop Escalated with capable hardware OR routed to Beastiest to manage."*

### §B.1 The 5-step escalation cascade

Each cooperative-class question follows this cascade when initial tier assignment produces low confidence:

```
STEP 0  — Initial dispatch per Ah Hayelped tier-match
              ↓
STEP 1  — IF confidence < 0.7 OR answer == null:
                  Plow Loop Escalate (substrate priming for question class — same peer)
                  ↓
STEP 2  — IF still low confidence:
                  Reroute to next-higher tier (ULTRA bulldozer for FULL escalations)
                  ↓
STEP 3  — IF ULTRA also low confidence:
                  Council vote across all FULL+ tier peers (consensus required ≥0.6 majority)
                  ↓
STEP 4  — IF Council CONTESTED (no majority):
                  Optional hosted-flagship fallback (Founder-budget-gated, OFF by default per Star Chamber canon)
                  ↓
STEP 5  — IF still no resolution:
                  Mark TIER_EXHAUSTED, queue for retry per `canon_tcp_ip_class_graceful_degradation_peer_outage_auto_reroute_bp091`
                  NEVER silently drop. Receipt records every step attempted.
```

### §B.2 Receipt fields for escalation tracking

Every receipt's `fleet_composition[].questions_handled` entry expands to:
```json
{
  "peer_id": "...",
  "ramTier": "full",
  "model": "gemma4:12b",
  "questions_handled": 18,
  "questions_correct": 16,
  "escalations_received": 2,    // questions escalated FROM this peer to higher tier
  "escalations_solved": 5,       // questions this peer solved AFTER being escalated INTO
  "marks_earned": 23             // includes Marks for both primary + escalation work
}
```

### §B.3 Math + Physics domain hint

Founder named MATH and PHYSICS as domains where middling-tier failures are likely. Knight should:
- Add a `domain_difficulty_hint` to the dispatcher so HARD math/physics questions skip initial CORE/FULL assignment and go straight to ULTRA
- This is an OPTIMIZATION, not a requirement — saves 1-2 escalation hops on questions empirically known to need ULTRA-class capability
- Per `canon_individual_domain_pattern_per_domain_timeout_tuning_bp090` — domain-aware routing composes with timeout tuning

---

## Addition §C — TCP/IP Graceful Degradation Canon Binding

This Marathon's dispatcher MUST honor:
```
C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_tcp_ip_class_graceful_degradation_peer_outage_auto_reroute_bp091.eblet.md
```

Specifically §3 of that canon (stale-peer detection, in-flight task reassignment, tier-class fallback, recovery + back-pressure, total mesh failure handling).

The original M22 dispatch's §1 already covers stale detection + reroute basics. This amendment formally BINDS M22 to that canon as a hard architectural prerequisite, not optional behavior.

---

## Addition §D — M14 Finding #3 Structural Fix

The M14 (legacy) Block 1 architectural fix targeted M0 escalation overflow. Under M22's MIC-role-rotation (§A above), the M14 Finding #3 bug becomes structurally impossible because:

- M0 never holds MIC role during normal heavy-reasoning workloads
- The dispatcher (now running on a FULL-tier MIC peer like M3) handles escalation routing
- M0's full capacity goes to bulldozer-mode question answering
- No more self-orchestration cannibalization

**Knight note:** M22's MIC-rotation work MAY OBVIATE M14 Block 1 entirely. Surface this in M14 KniPr when it lands — if M14 Block 1's architectural fix is no longer needed because M22 made it impossible, mark Block 1 as "obviated by M22 MIC rotation, no separate fix required" and proceed to Blocks 2+3 (null-response handling, contested-vote resolution).

---

## Addition §E — Updated ratification gates

Original M22 had R1-R8 with R6/R7/R8 open. This amendment ADDS:

| # | Gate | Status |
|---|---|---|
| R9 | MIC role rotation per §A (no peer self-orchestrates during heavy work) | **RATIFIED** Founder-direct BP091 ~17:00 Central |
| R10 | 5-step escalation cascade per §B | **RATIFIED** Founder-direct BP091 ~17:00 Central |
| R11 | Math/physics domain hint for ULTRA-direct routing per §B.3 | **RATIFIED** Founder-direct BP091 ~17:00 Central |
| R12 | TCP/IP graceful degradation canon binding per §C | **RATIFIED** Founder-direct BP091 ~17:00 Central |
| R13 | Emergency two-model M0 self-orchestration (only when all other peers stale) per §A.5 | **RATIFIED** Founder-direct BP091 ~17:00 Central, pending M0 GPU specs from Founder for performance tuning |

Original M22 R1-R5 inherit-ratified under prior session ratifications. R6/R7/R8 from the original dispatch remain OPEN for Founder pre-fire.

---

## Addition §A.6 — MIC Failover Election Protocol (Founder-direct BP091 ~17:30 Central)

**Founder verbatim:** *"What is the fallback if M3 fails suddenly?"*

### §A.6.1 Detection (every peer watches every other peer)
Each peer heartbeats `peer_presence.last_seen_at` directly to Supabase every ~20-60s. ALL peers subscribe to peer_presence changes via Supabase Realtime (or polling). If MIC's last_seen lapses > 60s, ANY surviving peer can trigger election.

### §A.6.2 Deterministic election (avoids split-brain)
1. **Sort eligible peers** by `(tier_rank DESC, mic_load_hours ASC, peer_id ASC)` — eligible = FULL+ for HEAVY workloads, CORE+ for LIGHT
2. **First in sort** is the deterministic winner candidate
3. **Atomic claim** via Supabase UPDATE: `UPDATE peer_presence SET role='MIC', wave_id=? WHERE peer_id=? AND role != 'MIC'` — only first writer succeeds (database CAS)
4. **Losers retry election** if their UPDATE returns 0 rows affected (another peer claimed first)
5. **MIC announces** to all workers via mesh broadcast: "MIC handoff complete, M3 → M2 for wave X"

### §A.6.3 In-flight task continuity
State lives in `mesh_task_queue` shared store, NOT in MIC local memory. When M3 dies:
- M2 reads `mesh_task_queue` filtered by `wave_id`
- M2 sees which tasks have responded vs which haven't
- M2 RELEASES its own current worker task (re-routed to CORE with extended timeout per §3.3) and takes MIC role
- M2 continues dispatch/collection/aggregation from where M3 left off
- Workers (M0 ULTRA, M1/MS CORE) keep computing — they write responses to shared queue, not to MIC's RPC endpoint, so MIC handoff is transparent to them
- Wave completes; receipt records "Wave dispatched by M3, completed by M2 at T+45s after M3 outage detected" — Truth-Always at receipt layer

### §A.6.4 Cascade table (full fallback)
| Layer | Condition | Action |
|---|---|---|
| L1 | M3 down + ≥1 FULL alive (M2) | M2 promotes to MIC per §A.6.2 election |
| L2 | M3 + M2 down + only CORE alive | M1 or MS promotes (degraded MIC tier, Bishop notification raised) |
| L3 | All FULL + CORE down + only M0 ULTRA alive | M0 emergency self-orchestrates per §A.5 (two-model on M0) |
| L4 | ALL peers down | `mesh_task_queue` retains tasks `status='queued'`. Auto-resume on first peer return. Founder notified. |

### §A.6.5 Required schema column
`peer_presence` needs `role TEXT DEFAULT 'worker' CHECK (role IN ('worker','MIC','stale'))` and `wave_id UUID NULL` and `mic_load_hours NUMERIC DEFAULT 0`. Bishop pre-creates via §15 BLOOD before Knight fires M22.

### §A.6.6 Composition
- `canon_tcp_ip_class_graceful_degradation_peer_outage_auto_reroute_bp091` — election is the orchestrator-layer analog of TCP/IP router-failure handling
- `canon_truth_always_bishop_one_compaction_correction_bp052` — receipts log every MIC handoff empirically, never hidden
- `canon_heart_of_peace_arbinger_anatomy_of_peace_outward_mindset_bp051` — fallen peer is welcomed back when it returns, not excommunicated

---

## Status

M22 dispatch ARCHITECTURALLY COMPLETE with this amendment. Ready to fire after:
- Phase 1 cascade (M18b · M19 · M20 · M21) lands
- Phase 2 cascade (M13b · M14) lands
- Founder confirms R6/R7/R8 from original M22 dispatch
- Bishop pre-creates `peer_marks_log` table via §15 BLOOD pre-Knight-fire

— Bishop Opus 4.7 · BP091 · 2026-06-22 ~17:15 Central · Sonnet 4.6 SEG composed amendment · Founder-direct architecture additions locked
