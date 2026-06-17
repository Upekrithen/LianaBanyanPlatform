# KNIGHT YOKE · 12-Blade Column Plow · 3-Question M0 Validation → Mesh-Wide Rollout · BP084

**Session:** BP084
**Date:** 2026-06-16
**Founder ratify:** DIRECT — *"I want to use the 12 blades in a column Plow with our mesh test, btw. So if we need to do a 3 question test on M0 (this machine) then let's do it. I want it all to work and work well, then mesh test and prove it while we make the Battery Dispatch perfect, then update the numbers and send it to the world."*

---

## 🩸 PREAMBLE — Sonnet 4.6 SEGs exclusively

**Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.**

---

## The architectural shift

Yesterday's distributed-eval was **single-pass CLI**, no escalation, methodology proof only. 68/70 stays the canonical headline per BP083 Truth-Always BLOOD.

**This yoke ships the canonical 12-Blade Column Plow** — the architecture defined in [[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]]. The 9 existing Plow loops PLUS:

- **Loop 10 — Psionic** (spawn child queries about consequences of every THEORY_OPEN)
- **Loop 11 — Auditor** (walk substrate for contradicting facts → eliminate where found)
- **Loop 12 — Sentinel** (when a KNOWN updates, flag downstream eblets for re-evaluation)

Operationalized by:
- The Code Breakers Guild per [[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]]
- Negative-Knowledge Tokens economic primitive
- The TIC 5-field eblet truth-integrity record

**Goal:** prove all 12 blades fire correctly on a tiny test (3 questions on M0), then run mesh-wide for the publishable Substrate Awakens receipt.

---

## Sequencing — Founder's intent restated

1. **3-question M0 test** — small enough to debug live, large enough to exercise all 12 blades
2. **It must work and work well** before mesh test
3. **Mesh test** proves it across the constellation (M0 + LAN + Sons)
4. **Battery Dispatch perfected in parallel** with the mesh run
5. **Updated numbers ship to world** — new 12-blade constellation receipt becomes the publishable headline

The 68/70 receipt remains canonical until this new receipt comes back clean per BP083 Truth-Always BLOOD.

---

## SEG-1 — Build the 12-Blade Plow runtime (Sonnet 4.6 SEG)

**Where:** `tools/plow-cli/` extension OR `src/main/plow/` runtime — Knight's call on cleanest location. The runtime needs to embed cleanly in both the CLI plow (for standalone runs) and the MnemosyneC desktop app (for in-UI Plow buttons).

**Blade implementation — each as its own callable function:**

**Blade 1-9 (existing — verify intact):**
- 1: Domain split
- 2: Question fan-out
- 3: Model dispatch
- 4: Quarantine check (Andon-Cord self-policing)
- 5: Adjudicate
- 6: Eblet mint
- 7: Reputation update
- 8: Vault write
- 9: Cross-domain link

If any of 1-9 don't exist as discrete functions yet, refactor — the 12 must be CALLABLE INDIVIDUALLY for testing and instrumented for telemetry.

**Blade 10 — Psionic:**
- For every eblet just minted that carries `theories_open` entries
- For each open theory, identify 1-3 immediate consequences (the "if F10 is true, what should also be true?" probe)
- Spawn child questions about each consequence
- Run blade 3-6 recursively on each child question (bounded recursion: configurable max depth N — default N=3)
- Update the theory's `survival_score` based on consequence-consistency results
- Mint the consequence-probe results as their own eblets, linked to the parent theory

**Blade 11 — Auditor:**
- For every eblet in `theories_open` status, search substrate for known facts that contradict
- Use BM25 + category-weighted search (canon > active > pixie-dust per [[reference-substrate-verified-knowledge-accumulator-canon-bp080]])
- If contradicting fact found with high confidence, auto-move theory to `eliminated`, mint contradiction-trail eblet
- Composes with Code Breakers Guild — surfaces candidates to the Guild queue
- For tier promotion (Code Breakers tier progression per [[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]]), increment K-survived count if no contradiction found

**Blade 12 — Sentinel:**
- For every KNOWN eblet just updated/revised
- Walk `applications_downstream` edges
- Flag each downstream eblet with `needs_reeval: true` and a chronos-stamp
- Surface flagged eblets in a Bishop/Knight review queue
- Composes with Pheromone Substrate (BP080 reference) — pheromones strengthen on revisited eblets

**Telemetry:**
Every blade emits start/end timestamps, success/failure status, downstream-effect counts. Aggregate per-blade telemetry exposed via new IPC handler `plow:get-blade-telemetry` so we can verify each blade actually fires.

---

## SEG-2 — Build the 3-question validation test (Sonnet 4.6 SEG)

**File:** `tools/plow-cli/validation_test_3q.json`

Three questions, hand-chosen to exercise the 12 blades in a single small run:

**Question 1 — KNOWN-class (exercises blades 1-9, plus 12 dependency propagation):**
- An MMLU-Pro question with a clean canonical answer + a known consequence
- Example: a chemistry question whose answer affects a downstream physics eblet
- Expected: all 9 blades fire, eblet minted, blade 12 flags downstream physics eblet

**Question 2 — THEORY_OPEN-class (exercises blades 1-9 + 10 consequence-trace):**
- A question where the model should self-quarantine (Andon-Cord), then blade 10 spawns consequence-probes
- Example: a philosophy or law question with multiple plausible answers
- Expected: blade 4 quarantines, blade 10 spawns 1-3 consequence questions, runs them, updates survival score

**Question 3 — ELIMINATED-class (exercises blades 1-9 + 11 elimination):**
- A question whose substrate already has a contradicting known fact
- Pre-load substrate with one canonical KNOWN that contradicts the question's premise
- Expected: blade 11 finds the contradiction, mints elimination eblet, Code Breaker queue updated

This trio is the minimum viable proof that all 12 blades fire correctly. Run on M0 with gemma4:12b.

**Acceptance per blade:**
- Each blade emits its expected telemetry events
- The output eblets carry their expected truth-integrity fields (per TIC schema)
- The trio completes within 5 minutes
- NO blade errors out silently
- Andon-quarantine count + Code Breaker queue count + dependency-flag count match expected

---

## SEG-3 — Run the 3-question test on M0 (Sonnet 4.6 SEG)

**Truth-Always:** Knight runs the test, reports what ACTUALLY happens, not what was expected.

Invocation pattern:
```
cd tools/plow-cli
node plow-cli-12blade.js validation_test_3q.json --model gemma4:12b --out validation_test_results.jsonl --telemetry validation_test_telemetry.json
```

**Per-blade output expected** (Knight verifies each):
| Blade | What fires | Eblets produced |
|---|---|---|
| 1 Domain split | 3 questions categorized | — |
| 2 Question fan-out | 3 prompts assembled | — |
| 3 Model dispatch | 3 + N consequence-probe calls | — |
| 4 Quarantine check | 0-2 quarantined (Q2 expected) | quarantine records |
| 5 Adjudicate | 3 verdicts | — |
| 6 Eblet mint | 3 primary eblets + N consequence-probe eblets + 0-1 elimination eblets | structured TIC records |
| 7 Reputation update | model-tier reputation updated | — |
| 8 Vault write | eblets written to substrate | — |
| 9 Cross-domain link | links emitted for Q1's downstream connection | — |
| **10 Psionic** | Q2's open theories spawn 1-3 consequence probes each | consequence-probe eblets |
| **11 Auditor** | Q3's pre-loaded contradiction found, theory eliminated | 1 elimination eblet |
| **12 Sentinel** | Q1's updated KNOWN flags 1-N downstream eblets for re-eval | review queue entries |

If any blade fails to fire, HONEST RED. Knight diagnoses + fixes + reruns until all 12 fire correctly. May iterate within this SEG (or spawn a sub-SEG if fix is substantial).

---

## SEG-4 — Verify on disk + dashboard (Sonnet 4.6 SEG)

After the 3q test passes:
- All output eblets exist at `Asteroid-ProofVault\state\eblets\` with TIC schema fields
- `validation_test_telemetry.json` shows per-blade timing + success counts
- `Settings → Substrate` panel in MnemosyneC (if running) shows updated counter
- The Substrate Awakens dashboard at `mnemosynec.ai/live/SubstrateAwakens/` shows nothing yet (this was M0 standalone)

If dashboard wiring needs the 12-blade telemetry surfaced, add the additional IPC handler/UI surface in this SEG.

---

## SEG-5 — Mesh-wide rollout plan (Sonnet 4.6 SEG)

Once 3-question test passes on M0, prep for mesh-wide run:

**Question bank:** the 2,000-question Substrate Awakens fresh bank (SHA `e79142cf…` per the prior Substrate Awakens yoke return) — NOT the 1,400-q distributed-eval bank from yesterday. Fresh questions, not replayed.

**Per-peer shard:**
- M0 (Founder, 64 GB, gemma4:12b, premium): hardest domains (math, chem, law, phys) — ~500 q
- M1 (.64, 16 GB, gemma4:12b, premium tight): engineering+CS — ~250 q
- M2 (.45, 32 GB, gemma4:12b, premium): biology+business+economics — ~350 q
- M3 (.156, 32 GB, gemma4:12b, premium): philosophy+history — ~250 q
- M5 (Son's machine, WAN, gemma2:2b, lightweight): psychology+other — ~250 q
- (Future) Son #2: another lightweight domain set — ~250 q
- Reserve: ~150 q for Code Breakers Guild redundant verification

Total: ~2,000 q across 5-7 peers.

**Live dashboard view:**
- Per-peer ticker shows blades-fired-per-question (so a viewer sees the 12-blade work happening live)
- Aggregate score shows the TIC-distinguished result: `X KNOWN / Y ELIMINATED / Z THEORIES_OPEN / W quarantined`
- Code Breaker queue depth visible — viewers can see eliminations happening live
- Refiner of Gold tracker — claims advancing toward IMMUTABLE per the four-tier progression

**Acceptance:** mesh run completes with all 12 blades firing on every peer, results aggregate cleanly, dashboard shows the constellation live, the receipt distinguishes KNOWN/ELIMINATED/THEORIES_OPEN counts.

---

## SEG-6 — Compose the publishable receipt template (Sonnet 4.6 SEG)

**Output:** `BISHOP_DROPZONE\00_FOUNDER_REVIEW\PUBLISHABLE_RECEIPT_TEMPLATE_12_BLADE_PLOW_CONSTELLATION_BP084.md`

The next-gen receipt that REPLACES 68/70 as the headline (only after the constellation run completes cleanly).

Structure:
- **Headline number:** X / Y on Z questions — but qualified by TIC categories
- **Per-domain breakdown** (14 MMLU-Pro domains)
- **Per-peer breakdown** (M0/M1/M2/M3/M5/...)
- **TIC distinguished counts:**
  - N KNOWN entries minted
  - M THEORIES_OPEN entries with consequence-trail survival scores
  - K ELIMINATED entries with contradiction trails
  - P quarantined at the model level (Andon-Cord self-policing)
- **Code Breakers Guild engagement:**
  - X claims advanced through tier progression
  - Y eliminations earned Negative-Knowledge Tokens
  - Z claims achieved GOLD_REFINED_BY_FIRE status (if any in this run)
- **Comparison to 68/70 canonical:** honest delta + honest scope diff (different question set, different blade depth — not apples-to-apples)
- **Reproducibility receipt:** SHA hashes + model versions + chronos timestamps + Plow version

This template AWAITS the live receipt to populate. Founder ratifies the template structure NOW; numbers fill in after the mesh run.

---

## SEG-7 — Battery Dispatch parallel polish (Sonnet 4.6 SEG)

Founder explicit: *"make the Battery Dispatch perfect"* in parallel with the mesh test.

Pull the Battery Dispatch Pre-Fire Checklist from BP084 yoke-return:
- 4 GREEN pieces (Trebor Scholz V16, Show HN T5, Reddit r/LocalLLaMA, Reddit r/MachineLearning)
- 14 YELLOW pieces (Canada 40K V02 + Companion + MacKenzie Scott + 9 Crown Letters + 7 Substrate Awakens drafts)
- 3 RED BLOCKED (Craig Newmark age, Tom Simon age, Tatiana Schlossburg tribute decision)

**For this yoke, Knight does NOT publish anything (BP078 BLOOD).** Knight:
- Audits the IPC subdirectory limitation (13 Wave 1 letters + 7 SA drafts in subdirectories that dispatch:list-content-files doesn't recurse into) and fixes the recursion
- Confirms all dry-run files render cleanly
- Verifies adapter ratify gates are still solid (assertAllRatified())
- Refreshes the Pre-Fire Checklist with current state

Founder fires per-piece manually when ready, per [[feedback-explicit-ratify-before-publish-bp078]] BLOOD.

---

## SEG-8 — Truth-Always Sharps (Sonnet 4.6 SEG)

- Sharp 1: 12-blade Plow runtime ships with all 12 blades CALLABLE INDIVIDUALLY
- Sharp 2: 3-question validation test passes on M0 with all 12 blades fired
- Sharp 3: Each blade emits expected telemetry; HONEST RED on any silent skip
- Sharp 4: Output eblets carry TIC schema fields (KNOWN / THEORIES_OPEN / ELIMINATED / DEPENDENCIES_UPSTREAM / APPLICATIONS_DOWNSTREAM)
- Sharp 5: Andon-Cord quarantine still works as before (gemma4:12b behavior preserved)
- Sharp 6: Mesh-wide rollout plan exists at canonical path with per-peer shard spec
- Sharp 7: Publishable receipt template exists with TIC-distinguished counts structure
- Sharp 8: Battery Dispatch subdirectory recursion fixed; IPC handler refreshed
- Sharp 9: NOTHING in this yoke modifies the 68/70 canonical receipt or published artifacts
- Sharp 10: NOTHING publishes to Substack / Medium / Cephas / Gmail
- Sharp 11: New canon eblet minted for the 12-blade-validated state at `Asteroid-ProofVault\state\eblets\CANON\canon_12_blade_plow_validated_m0_bp084.eblet.md` after SEG-3 passes

NO COSMETIC-GREEN. NO TIMEOUT-SWALLOWED-YELLOW. HONEST RED on any blade failure, dropped telemetry, or accidental publish.

---

## SEG-9 — Yoke-return + bedside read (Sonnet 4.6 SEG)

Standard return at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_RETURN_12_BLADE_PLOW_3Q_M0_TEST_MESH_ROLLOUT_BP084.md` with:
- All SEG statuses + commits + verbatim "Sonnet 4.6"
- 3-question test results (per-blade telemetry, output eblet count, runtime)
- Mesh-wide rollout plan readiness checklist
- Publishable receipt template path
- Battery Dispatch Pre-Fire Checklist refresh confirmed
- Bedside read: 1-paragraph for Founder explaining what just happened and what's next

Send pearl to Bishop via bridge.

---

## What this yoke DOES NOT do

- Does NOT run the mesh-wide test (that's the next step AFTER M0 3q passes)
- Does NOT publish anything (BP078 BLOOD)
- Does NOT replace the 68/70 canonical receipt — that stays until the constellation run comes back clean
- Does NOT make the 12-blade architecture skip Truth-Always — every blade reports honest results
- Does NOT lower the bar for Code Breakers tier progression (K=20, M=10, 90 days for IMMUTABLE)

---

## Composition with existing canon

- **[[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]]** — the architectural primitive ships here
- **[[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]]** — Blade 11 + tier progression
- **[[founders-anecdote-africa-mother-dog-bp084]]** — anchor for what the 12-blade architecture is correcting
- **[[reference-substrate-verified-knowledge-accumulator-canon-bp080]]** — Blade 11 BM25 search
- **[[canon-substrate-awakens-v0-5-0-first-live-mesh-event-driven-bp084]]** — mesh-wide rollout is the dress rehearsal for Saturday's live event
- **[[feedback-truth-always-wait-for-clean-receipt-bp083]]** — receipt only ships if clean
- **[[feedback-explicit-ratify-before-publish-bp078]]** — Battery Dispatch never auto-fires
- **[[canon-knight-yoke-preamble-sonnet-46-segs-orchestrator-no-composer-bp084]]** — preamble compliance

---

**FOR THE KEEP.**

12 blades. 3 questions. Then the constellation. Then the world.
But only after every blade fires honest.
