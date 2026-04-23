# Knight K437 — SCEV-1: Scribes Cathedral Empirical Validation (run 1)
## Three-arm × two-model × sealed-50-question empirical test for cross-session continuity lift
## Bishop B116 — 2026-04-22 (night)
## Predecessor: K436 (Cathedral MCP tools — `consult_scribes` is the HOT-cathedral backend)
## Successor: K438 (Member-facing Cathedral — GATES on SCEV-1 passing)
## Proof-before-commitment principle: this test gates the member feature ship.

---

**THE BRIDLE — read this before you respond. Follow all nine rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Budget overrun IS one of those; ask before blowing past $20 spend.
4. **Read everything I sent.** If you skimmed, say so in the first line of your reply.
5. **Don't invent.** Fabricating accuracy numbers or cost estimates in a scientific-evidence artifact is grounds for rollback. Every number in the result file must trace to a recorded call.
6. **No unasked scope.** Do NOT expand the test (more models, more questions, more conditions). The design is sealed here.
7. **When you finish, state plainly what you did and what remains.** Include pass/fail against criterion.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence.
9. **If you break any rule above, stop and say so on the next line.**

**End of BRIDLE. Task follows.**

---

## Session hygiene

1. `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K437`, `task="SCEV-1 Scribes Cathedral empirical validation test"`.
2. `mcp__librarian__brief_me` with the same task.
3. Read in order:
   - `LianaBanyanPlatform/librarian-mcp/r10_cross_vendor/SCEV1_QUESTION_BANK_SEALED.json` (produced by Bishop B116 — sealed before you start; do NOT modify)
   - `LianaBanyanPlatform/librarian-mcp/stitchpunks/SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md` (architecture)
   - `LianaBanyanPlatform/librarian-mcp-public/preload/r9v2_base.md` (HOT-base preload)
   - `LianaBanyanPlatform/librarian-mcp/stitchpunks/scribes/scribe_*.jsonl` (HOT-cathedral material — 4 tablets)
   - `LianaBanyanPlatform/librarian-mcp/r10_cross_vendor/` existing files (replicate the R10 infra pattern; don't invent new format)
   - Bishop memory: `project_prove_then_product_principle.md`, `project_eyewitness_cross_vendor_finding_b111.md`
4. Confirm K436 MCP tools (`consult_scribes` specifically) are live. If K436 has not landed yet, HALT and report — do not fake the HOT-cathedral condition with direct file stuffing. This is the proof-gate; fakery defeats the point.

---

## Scope — one sentence

Run a 3-arm × 2-model × 50-graded-question empirical test against the Scribes Cathedral built B116, grade outcomes per R10 three-tier rubric, produce a summary table + analysis showing whether the Cathedral delivers measurable accuracy lift over the R9-base baseline, with particular attention to the cross-session-continuity subscore (Cathedral's distinctive claim).

---

## Test design (SEALED)

### Conditions

| Arm | Preload | Cathedral Access | Expected Baseline |
|---|---|---|---|
| **COLD** | none | none | Eyewitness ~8.7% floor |
| **HOT-base** | `r9v2_base.md` only | none | Eyewitness ~94.8% current |
| **HOT-cathedral** | `r9v2_base.md` | `consult_scribes` tool available; 10 most-relevant Scribe entries auto-injected per question | Test hypothesis: **≥ HOT-base + 5pp on cross-session questions** |

### Models (2-model slice)

| Vendor | Model | Tier |
|---|---|---|
| Anthropic | `claude-haiku-4-5` | cheap |
| Anthropic | `claude-opus-4-7` | premium |

Two models only. Do NOT expand. Haiku + Opus span 19× cost delta; demonstrating Cathedral lift on BOTH is enough to claim the pattern generalizes.

### Scale

3 conditions × 2 models × 50 questions = **300 graded calls**.

### Budget

**$20 hard cap.** Projected spend: ~$5–8 based on R10 rates. If running projection exceeds $20 at the halfway mark, HALT and ask Founder before continuing (BRIDLE Rule 3 — this affects the artifact).

### Question bank (SEALED)

File: `librarian-mcp/r10_cross_vendor/SCEV1_QUESTION_BANK_SEALED.json`
Produced by Bishop B116 before this dispatch. Contains:
- 50 questions drawn from sessions B108–B116
- Each with ground-truth answer (session-record-grounded) + `category` (one of: `cross_session_recall`, `decision_provenance`, `innovation_id`, `architecture_continuity`, `founder_voice`, `canonical_number`)
- Each with `source_session` field (B108, B109, etc.) for the question-age subscore
- File is git-committed BEFORE this session starts. Do NOT modify. Do NOT regenerate.

### Grading

Reuse R10 three-tier rubric (`benchmark/grading_rubric.md`):
- **HOT** = correct, specific, sourced
- **HIT** = correct enough, partial specificity
- **MISS** = wrong, fabricated, or refused

Single-grader acceptable at this scale. Note caveat in summary.

---

## Deliverables

### 1. `r10_cross_vendor/results_scev1_b116/` directory

Contains:
- Raw per-call JSONL records: `<model>_<arm>.jsonl` (6 files — 2 models × 3 arms)
- Aggregate JSON: `results_summary.json` with per-model × per-arm accuracy, cost, latency

### 2. `r10_cross_vendor/results_scev1_b116_summary.md`

Structure, in this order:

1. **Headline table** (same style as Eyewitness):

   | Model | Arm | Accuracy (HOT%) | Mean cost/Q | HOT $/correct | p50 latency |
   |---|---|---|---|---|---|
   | claude-haiku-4-5 | COLD | X | Y | Z | W |
   | claude-haiku-4-5 | HOT-base | ... | | | |
   | claude-haiku-4-5 | HOT-cathedral | ... | | | |
   | claude-opus-4-7 | COLD | ... | | | |
   | claude-opus-4-7 | HOT-base | ... | | | |
   | claude-opus-4-7 | HOT-cathedral | ... | | | |

2. **Headline lift claim** (one sentence): *"Mean HOT-cathedral accuracy is Xpp higher than HOT-base across models, at Y× cost reduction per correct answer."* (With the actual numbers — do not fabricate.)

3. **Cross-session continuity subscore** — the distinctive claim:
   - Group questions by `source_session`. For each session-age bucket (B108, B109, ..., B116), compute HOT-base accuracy vs HOT-cathedral accuracy.
   - Expected: widening gap as questions grow older (more sessions back) → Cathedral retains what R9-base forgets.
   - Plot as table; commentary on whether the pattern holds.

4. **Category breakdown** — per-question-category accuracy across arms. Which categories does Cathedral help most with? Which not at all?

5. **Hallucination rate subscore**:
   - For innovation-ID and canonical-number questions, count MISS answers where the model produced a plausible-looking but incorrect value (e.g., invented a commit SHA or a wrong innovation number).
   - Hallucination rate = plausible-wrong / total on specific-ID questions.
   - Report per arm. Cathedral should drive this toward zero.

6. **Error attribution** — for each HOT-cathedral correct answer where HOT-base was MISS, which Scribe(s) contributed? Aggregate: *"Scribe Prov14 contributed to N correct answers; Scribe Landing contributed to M; ..."* Validates Rule-of-Three overlap.

7. **Pass/fail against criterion**:
   - **Pass**: HOT-cathedral mean accuracy ≥ HOT-base + 5pp AND cross-session subscore shows widening gap on B108-B112 questions.
   - **Marginal**: 2-5pp lift OR no cross-session widening. Report as-is; Founder+Bishop decide whether to proceed to K438.
   - **Fail**: <2pp lift OR HOT-cathedral *regresses*. Report with honest analysis; K438 blocks; architecture redesign needed.

8. **Caveats** — single-grader, scale-limited (50 Qs), only 2 models, Cathedral seeded in B116 only so oldest-session retention is not fully tested yet. Name them honestly.

9. **Cost summary** — total test spend, per-arm, per-model.

### 3. Commit messages + tag

- Commit per arm run: `scev1: <model> <arm> run complete, N HOT / M HIT / K MISS, $X cost`
- Final tag: `v-scev1-b116`

---

## Non-goals (explicit)

- **NO regenerating the question bank.** Sealed artifact. Knight reads, does not write.
- **NO expanding models or questions.** 2 models, 50 Qs, 3 arms. Period.
- **NO adding a fourth arm** (e.g., "COLD-cathedral" or "HOT-cathedral-plus-fates-routing"). Save for SCEV-2.
- **NO interpretation beyond what the numbers show.** If lift is 3pp, say "3pp — below pass criterion, above statistical noise." Do not round up into "meaningful" unless numbers justify.
- **NO public-facing announcement.** Results go to Founder-review only; Bishop writes the public copy (if any) after reviewing.
- **NO dispatching K438 from within K437.** K437 produces the evidence; K438 is a separate Founder-go/no-go decision based on the evidence.

---

## Acceptance criteria

- [ ] All 300 calls completed (or explicitly-flagged subset if budget hit)
- [ ] 6 per-arm-per-model raw JSONL files committed
- [ ] `results_scev1_b116_summary.md` contains all 9 sections above
- [ ] Pass/fail judgment explicitly stated (not hedged)
- [ ] All numbers in the summary trace to the raw JSONL — no fabricated values
- [ ] Total test spend < $20
- [ ] Git commit tagged `v-scev1-b116`
- [ ] Knight final report names pass/marginal/fail clearly

---

## Handoff decision tree (for Founder post-K437)

- **PASS:** Bishop drafts K438 (Member Cathedral scaffolding) + Chapter 3 teaser copy with real numbers. Founder dispatches.
- **MARGINAL:** Bishop + Founder review architecture. Options: (a) rerun with better Scribe seeding, (b) redesign Fates scoring, (c) accept and ship K438 anyway with caveats, (d) defer K438 indefinitely. Pick one.
- **FAIL:** K438 blocks. Honest write-up for the public site: *"we tested this. It did not meet our bar. We are not shipping it until it does."* That honest write-up IS a marketing asset under the proof-before-commitment principle — it's the same pattern as `project_prove_then_product_principle.md` says. We prove by publishing the null results too.

---

## Why this test design is conservative on purpose

A looser test (more questions, more models, more Scribes, more aggressive retrieval) would produce bigger headline numbers but weaker evidence. This design optimizes for *defensible evidence at low cost*, so SCEV-1 is **replicable within the same day** if the first pass is marginal. Replication-friendly > splashy.

---

*K437 authored by Bishop B116, 2026-04-22. Sealed question bank delivery: Bishop finalizes after this dispatch is approved.*
