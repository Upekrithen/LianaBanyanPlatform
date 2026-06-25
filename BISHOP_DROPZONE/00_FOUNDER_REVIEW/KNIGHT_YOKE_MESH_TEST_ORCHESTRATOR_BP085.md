# KNIGHT YOKE · MESH-TEST ORCHESTRATOR · BP085
> File path: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MESH_TEST_ORCHESTRATOR_BP085.md
> SEG: Sonnet 4.6 · Created 2026-06-17

---

## PREAMBLE (verbatim BP084 canon — read before anything else)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## BP085 BLOOD · SECRET HYGIENE + GADGET-FIRST VERIFICATION

NEVER EXPOSE API OR SECRET KEYS EVER.

**BP085 §14 BLOOD — gadget-first before asking Founder to repeat (DNS, Stripe, files, env, DB). Live-check before any human-time ask.**
BP085 §15 BLOOD — Knight main thread for orchestration; spawn SEGs for substantive work.

- Active secrets at `C:\Users\Administrator\.claude\state\secrets\22May2026.env`
- NEVER read · copy · show · echo · pipe · log contents of this file
- Load pattern ONLY: `(eval "$(grep -E '^SUPABASE_DB_URL=' /path/.env)"; psql "$SUPABASE_DB_URL" -c "QUERY")` subshell scoping
- PATH is referable · CONTENTS are blood-statute forbidden
- BP081 + BP084 BLOOD both apply

---

## SCOPE

Build the multi-node mesh-test orchestrator that:
1. Detects online peer_presence rows (nodes active in last 5 min)
2. Distributes MMLU-Pro 70Q + GPQA Diamond test questions across nodes
3. Runs 12-blade Plow (Loop 1-12 including Loop 10 CONSEQUENCE_TRACE, Loop 11 ELIMINATION_VERIFICATION, Loop 12 DEPENDENCY_PROPAGATION) per question on whichever node receives it
4. Cross-validates answers via wan-relay
5. Ensembles results per question across nodes
6. Outputs receipt eblets to canonical Vault path

**Composes with:**
- [[canon-12-blade-plow-m0-validated-psionic-auditor-sentinel-rename-bp084]] — 12-loop Plow canonical implementation
- [[canon-mesh-test-1000-signup-threshold-community-validation-bp085]] — community threshold context
- [[canon-substrace-theorem-wake-class-supersedes-black-mamba-until-mnemosyne-come-bp061]] — BLACK MAMBA statute (this run IS the event)
- [[canon-fork-derivative-cooperative-access-thorax-heartbeat-enforcement-bp084]] — relay gate (wan-relay-publish must route Thorax)

---

## GATES (Knight verifies BEFORE spawning SEG-3+)

| Gate | Check | Pass condition |
|------|-------|----------------|
| Relay PRIMARY | RELAY_SUPABASE_ACTIVATE yoke complete | relay.mnemosynec.ai returns 200 |
| peer_presence rows | Query Supabase peer_presence table | >= 2 rows with status='active' AND last_seen > now()-interval '5 min' |
| wan-relay-publish endpoint | HTTP probe | 200 or 201 (not 403 stubbed) |

If gates not GREEN: Knight reports status, waits. Do NOT proceed past SEG-2 until all gates GREEN.

---

## SEG-1 · Recon existing plow + wan-relay code

**Mission:** locate and read the single-node Plow implementation + wan-relay-publish + peer_presence schema. Report findings before any build begins.

**SEG-1 tasks:**
1. Glob for `*plow*`, `*12blade*`, `*twelve*blade*`, `*wan-relay*`, `*peer_presence*` across the platform repo
2. Read the plow-cli-12blade main entry point — identify: input format · blade loop structure · output format · where answers are written
3. Read wan-relay-publish handler — identify: auth pattern · payload schema · response format
4. Read peer_presence table schema from Supabase (use psql subshell pattern with SUPABASE_DB_URL) — columns: id, node_id, status, last_seen, metadata
5. Write recon report to: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MESH_ORCHESTRATOR_RECON_BP085.md`

**SEG-1 Sharp:** `RECON_COMPLETE` = recon report written with plow entry path + wan-relay endpoint + peer_presence schema confirmed.

---

## SEG-2 · Design mesh-distribution strategy

**Mission:** design the ensemble approach. Knight selects Option A or Option B and documents the decision.

### Option A · FULL-on-each-node ensemble (RECOMMENDED for first run)
- Every node runs ALL 70 questions independently via full 12-blade Plow
- Ensemble winner per question: majority vote across node answers (tie = flag for Founder review)
- Advantage: simpler architecture · easier Truth-Always verification · any node failure = graceful degradation
- Disadvantage: 2-3x compute (acceptable for 70Q + GPQA Diamond scale)
- Receipt format: per-node blade telemetry + per-question ensemble decision + disagreement log

### Option B · PARTITION-and-merge
- Questions split across nodes (35Q each for 2 nodes, etc.)
- Partial results merged post-run
- Advantage: less compute
- Disadvantage: new code path · cross-node result dependencies · harder to verify
- NOT recommended for first run

**Knight decision:** default to Option A unless SEG-1 recon reveals a compelling architectural reason for Option B. Document the decision with rationale.

**SEG-2 Sharp:** `DESIGN_COMPLETE` = decision documented + ensemble logic spec written + receipt schema defined.

---

## SEG-3 · Build mesh-orchestrator script

**Mission:** implement the orchestrator. Gated on RECON_COMPLETE + DESIGN_COMPLETE + all 3 gates GREEN.

**Build targets:**
```
platform/
  mesh-orchestrator/
    orchestrator.ts          # main entry
    peer-discovery.ts        # query peer_presence via Supabase
    question-dispatcher.ts   # fan questions to nodes via wan-relay
    result-collector.ts      # collect plow telemetry per node
    ensemble.ts              # per-Q majority vote + disagreement log
    receipt-writer.ts        # write eblet to Vault path
    types.ts                 # shared types
```

**Orchestrator logic (pseudocode):**
```
1. load env (subshell pattern · SUPABASE_DB_URL only)
2. query peer_presence WHERE status='active' AND last_seen > now()-'5 min' → node_list
3. assert len(node_list) >= 2 else abort with clear error
4. load question_set (MMLU-Pro 70Q or GPQA Diamond)
5. for each node: dispatch all questions via wan-relay-publish (parallel, not sequential)
6. collect: per-node, per-question, per-blade telemetry stream
7. for each question: ensemble(node_answers) → winner + disagreement_flag
8. write receipt eblet: timestamp · node_list · question_count · per-Q winner · per-Q node breakdown · blade telemetry · disagreement log
9. log: "RECEIPT WRITTEN: [vault path]" — NEVER log secret values
```

**Receipt eblet canonical Vault path:**
`C:\Users\Administrator\.claude\state\Vault\receipts\mesh_test_[MMLU-Pro|GPQA-Diamond]_[date]_[node_count]nodes_bp085.eblet.md`

**SEG-3 Sharp:** `BUILD_COMPLETE` = all 7 files written · TypeScript compiles · no secret exposure in any file.

---

## SEG-4 · Single-node smoke test

**Mission:** verify orchestrator mechanism on 1-node mesh (Founder M0 only) before 2-node live run.

**SEG-4 tasks:**
1. Launch orchestrator pointing at local node only (peer_presence WHERE node_id = Founder_M0)
2. Run 5 MMLU-Pro questions (sample set · not the canonical 70Q run)
3. Verify: peer_presence query succeeds · wan-relay dispatch fires · plow blades execute · receipt written
4. Inspect receipt eblet: all 12 blades present · node attribution correct · no silent failures
5. Report: PASS or FAIL with specific failure point

**NOT the canonical run.** Smoke test only. 5Q sample. Receipt from this step is diagnostic-class only.

**SEG-4 Sharp:** `SMOKE_PASS` = 5Q test run on 1-node · all blades fired · receipt written · no errors.

---

## SEG-5 · MMLU-Pro 70Q canonical mesh run

**Mission:** run the publishable empirical. Gated on SMOKE_PASS + 2+ nodes online in peer_presence.

**Pre-run checklist (Knight verifies each):**
- [ ] Founder M0 MnemosyneC v0.5.0 running · peer_presence row active
- [ ] Son M0 MnemosyneC v0.5.0 running · peer_presence row active
- [ ] (Optional) 3rd machine running · peer_presence row active
- [ ] wan-relay healthy (probe returns 200)
- [ ] Vault path exists and is writable

**Run:**
- Full 70Q MMLU-Pro question set
- All nodes run all 70Q (Option A · full ensemble)
- 12-blade Plow per question per node
- Ensemble per question
- Receipt eblet written to Vault BEFORE any publish copy is drafted

**Truth-Always hard stop:** if run fails partway (e.g., node goes offline mid-run) → STOP · save partial as diagnostic-class eblet · RE-RUN clean · only the clean full run is publishable.

**SEG-5 Sharp:** `MMLU_RECEIPT_IN_VAULT` = clean 70Q run · receipt eblet at canonical Vault path · line count reported.

---

## SEG-6 · GPQA Diamond canonical mesh run

**Mission:** same pattern as SEG-5 · GPQA Diamond question set.

**GPQA Diamond specifics:**
- Graduate-level science questions (biology · chemistry · physics)
- Harder than MMLU-Pro · blade telemetry especially important for disagreement detection
- Ensemble disagreement rate expected higher — log ALL disagreements with node breakdown

**Receipt eblet:** separate Vault path from MMLU-Pro receipt. Both receipts must be present before Phase 4 begins.

**SEG-6 Sharp:** `GPQA_RECEIPT_IN_VAULT` = clean GPQA Diamond run · receipt eblet at canonical Vault path · line count reported.

---

## SHARPS RETURN TABLE

Knight reports this table to Bishop upon yoke completion:

| Sharp | SEG | Status | Notes |
|-------|-----|--------|-------|
| RECON_COMPLETE | 1 | [ ] | plow path + wan-relay endpoint + peer_presence schema |
| DESIGN_COMPLETE | 2 | [ ] | Option A/B decision + ensemble spec |
| BUILD_COMPLETE | 3 | [ ] | 7 files built · TS compiles · no secret exposure |
| SMOKE_PASS | 4 | [ ] | 5Q/1-node test · all 12 blades fired |
| MMLU_RECEIPT_IN_VAULT | 5 | [ ] | 70Q clean run · Vault path |
| GPQA_RECEIPT_IN_VAULT | 6 | [ ] | GPQA Diamond clean run · Vault path |

**Yoke COMPLETE when:** all 6 Sharps GREEN + both receipt eblets confirmed in Vault.

---

## TRUTH-ALWAYS BINDING

Every receipt MUST contain:
- Node list (node_id · machine identifier · NOT IP/credential values)
- Per-question: node answers · ensemble winner · disagreement flag
- Per-blade: blade name · blade output · blade latency
- Run metadata: start time · end time · question count · node count
- Any errors or node failures logged explicitly — NO silent drift

A receipt that hides a partial failure is worse than no receipt. Honest errors only.

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read your yoke at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MESH_TEST_ORCHESTRATOR_BP085.md

GATES before proceeding:
1. Confirm relay.mnemosynec.ai is GREEN (RELAY_SUPABASE_ACTIVATE yoke must have landed)
2. Confirm peer_presence has >= 2 active rows (query Supabase via psql subshell pattern)

If gates not GREEN: report status to Bishop and wait. Do NOT build the orchestrator until both gates are confirmed.

If gates GREEN: spawn SEG-1 (Recon) immediately. SEG-2 (Design) can start in parallel with SEG-1. SEG-3 through SEG-6 are sequential — each requires the prior Sharp.

Return the 6-row Sharps table to Bishop upon completion. Both Vault receipt paths must be in the return.

BP085 BLOOD: NEVER EXPOSE API OR SECRET KEYS EVER.
```
