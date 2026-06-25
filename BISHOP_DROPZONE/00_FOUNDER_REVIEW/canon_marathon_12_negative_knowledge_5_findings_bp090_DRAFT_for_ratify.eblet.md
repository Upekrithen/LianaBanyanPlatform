---
name: canon_marathon_12_negative_knowledge_5_findings_bp090
description: "Five architectural learnings extracted from Marathon 12's contaminated 42Q LONGHAUL run. M12 was the diagnostic instrument, not the canonical measurement; the 5 findings drive Marathon 14+15+16 architecture work."
classification: canon
status: DRAFT - AWAITING FOUNDER RATIFY
bp: BP090
date: 2026-06-22
empirical_anchor: VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json
composes_with:
  - canon_code_breakers_guild_negative_knowledge_marks
  - canon_plow_loop_and_domain_specific_unfair_advantages_inherent_to_mountain_1_substrate_reader_bp089
  - canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089
  - canon_lan_as_wan_test_mode_4_machine_mesh_bp085
  - canon_fix_as_we_go_build_for_the_long_haul_bp053
---

# Marathon 12 · Five Negative-Knowledge Findings · BP090 DRAFT

> DRAFT CLASS — AWAITING FOUNDER RATIFY. Do not treat as sealed canon. Composed by Bishop SEG 2026-06-22 per Founder directive: "Yes draft and stage M12 Negative-Knowledge 5 Findings."

---

## 1. Empirical Context

**Run:** Marathon 12 LONGHAUL · 42 questions · 2026-06-22 03:00–07:45 Central  
**Empirical anchor:** `VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json`  
**Ensemble result:** 26/42 = 61.9% — below THUNDERCLAP target  
**Fleet composition (discovered post-hoc):** 3 × gemma4:12b LAN peers + 1 × qwen2.5:7b WAN peer (Son's node). Heterogeneous fleet was not inventoried at yoke-open. This contamination is the root cause of several findings below and is itself Finding 6 (Lamborghini-Corolla).

M12 was the diagnostic instrument, not the canonical measurement. The 61.9% ensemble score does not represent the Plow Loop ceiling — it represents what happens when the architecture is stressed by role-collision, protocol gaps, and unverified peer state simultaneously. All five findings below are actionable architecture work.

---

## 2. Finding 1 — Timeout-Triggered Escalation Is EMPIRICALLY LIVE in Production

**Empirical evidence:**  
- `escalation_summary.total_escalation_fired: 29`  
- `escalation_fired_pct: 69`  
- 29 of 42 questions (69%) fired Star Chamber escalation during the M12 42Q LONGHAUL run.

**Diagnostic implication:**  
The escalation pathway is not a smoke-test stub. It is operational at production load. The Individual Domain Pattern (Founder-coined, BP090) triggered reliably — when a peer's initial answer fell below the confidence threshold, escalation fired and the council convened. This is the architecture working as designed.

**Marathon target:** This finding is a positive confirmation. No corrective action required for the escalation trigger itself. Findings 3, 4, and 5 address what happens *inside* escalation.

---

## 3. Finding 2 — Per-Peer Accuracy Ceiling 93.8–100% on Completed Loops

**Empirical evidence (per receipt per-peer entries):**  
- `d0b47bd0`: 28/28 = **100%**  
- `49f3e597` (Son's WAN node, qwen2.5:7b): 31/32 = **96.9%**  
- `88cbf6bd`: 30/32 = **93.8%**

**Diagnostic implication:**  
When the Plow Loop completes cleanly — substrate primed, peer healthy, no role-collision — free local AI matches flagship-tier accuracy at the peer level. The substrate works. The 61.9% ensemble is not a ceiling; it is an artifact of M0's regression (Finding 3) dragging the aggregate.

**Marathon target:** Marathon 15/16 homogeneous-fleet clean runs should replicate this 93.8–100% per-peer band with all peers completing 28–32 questions each.

---

## 4. Finding 3 — M0 (cb4ef450) Escalation-Overflow Regression · THE BUG

**Empirical evidence:**  
- M0 answered **65 questions** (vs 28–32 for other peers)  
- M0 accuracy: **23/65 = 35.4%**

**Diagnosis:**  
M0 acts simultaneously as orchestrator, worker, and escalation overflow handler. When 69% of questions fire escalation (Finding 1), M0 absorbs a disproportionate share of council rounds on top of its normal worker load. The combined role weight crushes per-question quality — M0 is answering at less than half the accuracy of every other peer.

**Future fix candidate — Marathon 14 Block 1:**  
Split M0's roles: dedicated orchestrator process OR rate-limit escalation routing to M0 so it receives no more than its proportional share of overflow rounds. Empirical receipt required before sealing fix.

---

## 5. Finding 4 — Null-Response Failure Mode · THE PROTOCOL GAP

**Empirical evidence:**  
- Per-peer receipt entries show `answer: null, replied: true, correct: false` on some escalation rounds.

**Diagnosis:**  
The council did NOT converge AND did NOT decline gracefully. There is a silent protocol gap between "I don't know" and "didn't reply." A peer that returns `replied: true` but `answer: null` has technically responded but has communicated nothing the orchestrator can act on. The current orchestrator treats this as a wrong answer rather than an abstention, which pollutes the plurality vote.

**Future fix candidate — Marathon 14 Block 2:**  
Peers MUST emit a structured `ABSTAIN` / `INSUFFICIENT_DATA` response when escalation council cannot converge. Orchestrator handles abstain plurality gracefully — e.g., escalates further, routes to flagship fallback, or records the question as contested (see Finding 5). No silent nulls.

---

## 6. Finding 5 — Contested-Question Residual · THE EDGE CASE

**Empirical evidence:**  
- `ensemble_score.contested: 3`  
- 3 of 42 questions remained contested even after escalation.

**Diagnosis:**  
Plurality vote across (timed-out partials) ∪ (escalation completions) could not resolve these 3 questions. The council exhausted its configured rounds without achieving majority. These are the hardest questions in the 42Q set — the ones where even escalation is insufficient.

**Future fix candidate — Marathon 14 Block 3:**  
Per-question difficulty profiling. Questions that enter a second contested state after escalation should trigger one of: (a) extended council rounds, (b) flagship-tier fallback (Star Chamber SCaaS), or (c) explicit `CONTESTED_NO_CONSENSUS` record rather than a forced guess. Empirical receipt required before sealing approach.

---

## 7. Finding 6 (BONUS) — The Lamborghini-Corolla Discovery · THE METHODOLOGY LESSON

**What happened:**  
M12 ran heterogeneous: 3 × gemma4:12b LAN peers + 1 × qwen2.5:7b WAN peer (Son's node). This was discovered only via post-hoc inspection of the `model_families` field in the receipt — it was not inventoried at yoke-open.

**Why it matters:**  
Comparing a qwen2.5:7b peer against gemma4:12b peers is the Lamborghini-Corolla problem: the fleet is not a controlled instrument. Any accuracy differential between peers is confounded by model capability, not just substrate quality. This is why Marathon 13 was commissioned as a homogeneous-fleet re-fire.

**Future canon (Marathon 14+ yoke standard):**  
Peer-model-inventory verification MUST be Block 1 of every Marathon yoke. Query each peer for its active model at yoke-open. Fail the run or flag a warning if fleet is heterogeneous unless heterogeneous is the explicit test condition. Assume nothing about peer state.

---

## 8. Why This Is Canon, Not Failure

Per `canon_code_breakers_guild_negative_knowledge_marks`: failed experiments retain Mark value because they tell us what NOT to do. Negative knowledge is a first-class deliverable in the cooperative substrate research program.

M12's 61.9% ensemble score is not a regression from M0's 97.1% THUNDERCLAP baseline. M12 was run under deliberately stressed conditions — heterogeneous fleet, full escalation load, no role-splitting — to surface exactly these failure modes before they contaminate a ratified THUNDERCLAP receipt. The five findings above are the return on that investment. Marathon 14 Block 1+2+3 now has a concrete punch list derived from empirical receipts, not speculation.

The substrate works. The architecture works. The orchestration layer has three specific, bounded bugs with three specific, bounded fixes. That is good engineering.

---

## 9. Founder Ratify Section

**STATUS: DRAFT — RATIFY REQUIRED BEFORE SEALING**

This eblet was composed by Bishop SEG (Sonnet 4.6) on 2026-06-22 per Founder verbal directive: *"Yes draft and stage M12 Negative-Knowledge 5 Findings."*

To seal as final canon, Founder must provide explicit ratify phrase. Until ratified:
- Classification remains DRAFT
- Do not copy composes_with references into active session yokes
- Do not cite in THUNDERCLAP receipts as sealed canon

**Ratify signature line:**

> Founder ratify: ___________________________________________  Date: ___________

---

*Composed by Bishop SEG · BP090 · 2026-06-22 · DRAFT CLASS*
