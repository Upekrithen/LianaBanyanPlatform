# A&A Formal Innovation Record — #2287 Synapses: AI Reasoning-Stream Capture and Cooperative Reasoning Commons

**Innovation ID:** #2287  
**Named:** B121, 2026-04-23 (Founder named after observing Knight/Sonnet 4.6 reasoning during K472)  
**Status:** 9 claims drafted; 4-phase implementation roadmap defined; Phase 1 active (K479)  
**Provisional application:** Prov 14 candidate  

---

## Summary

Synapses is the substrate for capturing, annotating, and sharing AI reasoning streams. Where Scribes (Cathedrals) persist domain knowledge (the WHAT), Synapses persist reasoning-process knowledge (the HOW and WHY). Every time an agent makes a load-bearing decision, self-corrects, or generates a novel hypothesis, that reasoning event becomes a Synapse — a structured record that can be cited, cross-referenced, and annotated by other agents in subsequent sessions.

**Sister substrates:** Toolsmith (K480) captures tool-invocation lore; Synapses captures reasoning about problems. Both are Queing applied to different domains.

---

## Claims overview (per B121 threshing)

1. Method for capturing AI reasoning stream events as structured, schema-consistent records (Synapses) during or after an AI agent session
2. Schema for Synapse records: agent, session, cluster, belief_state, decision_point, cited_facts, speculations, supersedes
3. Retroactive extraction from existing session transcripts into Synapse format
4. Forward-emission during agent sessions (append-as-you-go discipline)
5. Cross-agent annotation: Bishop annotating Knight synapses and vice versa (Phase 2)
6. Synapse clustering: vine_id + cluster_id hierarchy for reasoning arc organization
7. Supersession linking: synapse_id references for tracking belief updates
8. Cooperative reasoning commons: public-scope Synapses surfaced across member Cathedrals (Phase 4)
9. Provenance trail: operator_signature + timestamp establishes who-captured-when

---

## Exhibit A — First Empirical Instance: K475 Retroactive Capture (K479/B122)

**Source session:** K475 — R12 Dual-Universe Pawn-Cathedral Comet Benchmark (2026-04-24)  
**Captured in:** K479 — Synapses Phase 1 Retroactive Capture (2026-04-24)  
**Source file:** `librarian-mcp/stitchpunks/synapses/synapse_K475.jsonl`

### Summary statistics

| Metric | Value |
|---|---|
| Total synapses | 25 |
| Clusters covered | 7 |
| Decision-point synapses | 12 |
| Correction/supersession links | 2 |
| Belief states represented | hypothesis, observation, conclusion, decision |

### Clusters

| cluster_id | Description | Synapse count |
|---|---|---|
| harness_fixes | Chrome profile lock diagnosis, networkidle fix, selector loop bug, storage_state decision | 6 |
| parallelization_design | Serial→parallel decision, asyncio architecture, stagger-semaphore design | 3 |
| concurrency_safety | Windows event loop policy, JSONL write locking | 2 |
| perplexity_interaction | Q2 validation, echo-artifact grading insight, response-time observation, throttle | 3 |
| arm1_wiring_validation | Cranewell cold baseline conclusion | 1 |
| arm2_cathedral_diagnosis | Cathedral HOT lift, truncation hypothesis, D3 bloat-cap, Pawn consult gap | 4 |
| arm3_union_comparison | Union > auto-only conclusion | 1 |
| arm4_covenant_baseline | Covenant cold partial-prior confirmation | 1 |
| arm5_covenant_cathedral | Rate-limit throttle validation | 1 |
| arm6_covenant_union | Final benchmark summary | 1 |
| arm2_cathedral_diagnosis (A&A) | 12% ceiling diagnostic, three hypotheses, public claim framing | 2 |

### Key Synapses for Prov 14 Exhibit

- **K475-001**: `networkidle` → `domcontentloaded` fix — structural diagnosis of Perplexity's WebSocket architecture
- **K475-005**: Serial→parallel architecture decision — empirically derived (10.7 hours → 75 minutes)
- **K475-011**: Echo-artifact grading insight — methodological discovery with implications for R10/R11/R12 rubric design
- **K475-019**: Three-scenario rubric evaluation — confirms Cathedral Effect claim for A&A #2278
- **K475-020**: Three diagnostic hypotheses for 12% ceiling — generates K477 research agenda
- **K475-025**: A&A implication — defensible public claim framing ("18pp absolute lift from 0% baseline")

---

## Reduction to Practice: Phase 1 Live

Phase 1 is defined as: retroactive capture of past sessions + forward-emission template in Knight prompt.

**Phase 1 status (K479/B122):**
- [x] Retroactive capture: K475 Synapses committed (25 records, 7+ clusters)
- [x] Knight prompt template updated: Synapse emission section added to THE_BRIDLE_V10.md (v10.2)
- [ ] Phase 2: Cross-agent annotation (Bishop annotates Knight synapses) — not yet implemented
- [ ] Phase 3: Synapse search/retrieval via MCP tool — not yet implemented
- [ ] Phase 4: Public commons surfacing — not yet implemented

---

*Created K479/B122, 2026-04-24. First empirical #2287 reduction-to-practice.*
