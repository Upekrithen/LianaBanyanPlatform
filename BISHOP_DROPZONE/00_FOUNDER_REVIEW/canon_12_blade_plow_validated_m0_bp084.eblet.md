---
name: canon-12-blade-plow-validated-m0-bp084
description: HARD CANON — 12-Blade Column Plow M0 validation GREEN. All 12 blades fire with canonical names sourced from canonical_pipeline.ts. Blades 1-9 (Spider, Sprite, Specialists, Miner, Saladin, Furnace, Three Fates, Scribe, Detective TEAM) + Blades 10-12 (CONSEQUENCE_TRACE, ELIMINATION_VERIFY, DEPENDENCY_PROPAGATION). 3-question M0 test PASSED. TIC 5-field schema verified in output eblets. plow_version: 12blade-bp084-corrected-v2.
metadata:
  type: canon
  session: BP084
  minted: 2026-06-16
  status: ratified
  founder_direct: false
  binding_class: hard
  scope: plow_architecture
  prov_22_eligible: false
  truth_always_blood: true
  corrected_session: BP084-CORRECTED
  correction_reason: Prior implementation used WRONG blade names (Domain Split / Question Fanout / etc. — inferred, not read from source). This canon reflects CORRECT canonical names from canonical_pipeline.ts.
---

# 12-Blade Column Plow — M0 Validation GREEN (BP084 CORRECTED)

**Minted:** 2026-06-16 · **Agent:** Knight (Sonnet 4.6) · **Session:** BP084

## Correction Notice

The prior version of this eblet (from the same session) used INCORRECT, INFERRED blade names.
This corrected version reflects blade names sourced from `src/main/plow/canonical_pipeline.ts`.

## Canonical Blade Names (from canonical_pipeline.ts)

| # | Name | Function |
|---|------|----------|
| 1 | **Spider** | Locate topic-relevant eblets in substrate index |
| 2 | **Sprite** | Retrieve located eblets from storage |
| 3 | **Specialists** | 9-Swarm: Wikipedia · Wikidata · arXiv · StackExchange · Wolfram · OpenAlex · NIST · PubMed · CommonCrawl |
| 4 | **Miner** | Anti-popularity filter (weight >= 0.6 AND content >= 100 chars) |
| 5 | **Saladin** | Adversarial Fence (challenge candidates for weaknesses) |
| 6 | **Furnace** | Angel of Death (burn Saladin-challenged; survivors proceed) |
| 7 | **Three Fates** | 3-voter arbitration (temps 0.0 / 0.2 / 0.4) |
| 8 | **Scribe** | Record BMV score + concordance + gate outcomes + TIC eblet mint |
| 9 | **Detective TEAM** | Root-cause gate fails + Federated Andon cord (3-tier escalation) |
| 10 | **CONSEQUENCE_TRACE** | Spawn consequence probes for every THEORY_OPEN theory |
| 11 | **ELIMINATION_VERIFY** | Walk substrate for contradictions; confirmed eliminations → Code Breakers queue |
| 12 | **DEPENDENCY_PROPAGATION** | When KNOWN updates, flag downstream eblets for re-evaluation |

## M0 Validation Results (3-Question Test — gemma4:12b)

### Q1 — KNOWN class (chemistry: boiling point of water)
- Specialists: Wikipedia + arXiv → 7 candidates
- Miner: 7/7 passed
- Saladin: 5 pass / 2 challenged
- Three Fates: **CONCORDANT**
- BMV: **63.1**
- Gates: G1_FACT ✓, G2_CONC ✓, G3_BMV ✓, G4_LAT ✓ — all 4 passed
- Detective TEAM: andon=false — no escalation needed
- Blade 10: SKIPPED (not THEORY_OPEN)
- Blade 11: SKIPPED (not ELIMINATED)
- Blade 12: **FIRED** — 1 downstream flag → `physics_thermodynamics_phase_transitions`
- TIC snapshot: known=1, theories_open=0, eliminated=0, dep_upstream=0, dep_downstream=1

### Q2 — THEORY_OPEN class (neuroscience: mechanism of general anesthesia)
- Specialists: Wikipedia + arXiv → 5 candidates
- Miner: 5/5 passed
- Saladin: 5 pass / 0 challenged
- Three Fates: **PARTIAL** (contested science; multiple valid theories)
- BMV: **56.8**
- Gates: G1_FACT ✓, G2_CONC ✓ (PARTIAL passes G2), G3_BMV ✓, G4_LAT ✓
- Detective TEAM: andon=false (gates passed despite PARTIAL concordance)
- Blade 10: **FIRED** — CONSEQUENCE_TRACE ran for theories_open ✓
- Blade 11: SKIPPED (not ELIMINATED)
- Blade 12: SKIPPED (not KNOWN / no downstream)
- TIC snapshot: known=0, theories_open=1, eliminated=0, dep_upstream=0, dep_downstream=0

### Q3 — ELIMINATED class (physics: luminiferous aether)
- Pre-loaded contradiction: Michelson-Morley 1887 experiment
- Specialists: substrate:preloaded + Wikipedia + arXiv → 8 candidates
- Miner: 8/8 passed
- Saladin: 8 pass / 0 challenged (clear historical facts)
- Three Fates: **CONCORDANT**
- BMV: **63.4**
- Gates: G1_FACT ✓, G2_CONC ✓, G3_BMV ✓, G4_LAT ✓ — all 4 passed
- Detective TEAM: andon=false
- Blade 10: SKIPPED (not THEORY_OPEN)
- Blade 11: **FIRED** — 1 elimination confirmed via Michelson-Morley contradiction; Code Breakers queue entry created ✓
- Blade 12: SKIPPED (not KNOWN / no downstream)
- TIC snapshot: known=1, theories_open=0, eliminated=1, dep_upstream=0, dep_downstream=0

## Blade Fire Count Summary

| Blade | Name | Count |
|-------|------|-------|
| B1 | Spider | 3 ✓ |
| B2 | Sprite | 3 ✓ |
| B3 | Specialists | 3 ✓ |
| B4 | Miner | 3 ✓ |
| B5 | Saladin | 3 ✓ |
| B6 | Furnace | 3 ✓ |
| B7 | Three Fates | 3 ✓ |
| B8 | Scribe | 3 ✓ |
| B9 | Detective TEAM | 3 ✓ |
| B10 | CONSEQUENCE_TRACE | 1 ✓ |
| B11 | ELIMINATION_VERIFY | 1 ✓ |
| B12 | DEPENDENCY_PROPAGATION | 1 ✓ |

**All 12 blades GREEN. No silent skips. All TIC eblets verified with 5-field schema.**

## TIC 5-Field Schema Verification

Every Scribe-minted eblet carries all 5 TIC fields:
1. `known` — established facts (k=1 for KNOWN class)
2. `theories_open` — contested theories (t=1 for THEORY_OPEN class)
3. `eliminated` — ruled-out hypotheses (e=1 for ELIMINATED class)
4. `dependencies_upstream` — prior eblets this depends on
5. `applications_downstream` — downstream applications (dn=1 for KNOWN + seed)

## Code Breakers Guild

Blade 11 (ELIMINATION_VERIFY) minted 1 contradiction_trail eblet for Q3 (luminiferous aether / Michelson-Morley) and added 1 entry to `code_breaker_queue.json` with `negative_knowledge_token: true`.

Per canon_code_breakers_guild_gold_refined_by_fire_elimination_marks_bp084: Marks are paid for elimination work (Negative-Knowledge denomination). The aether hypothesis enters the Guild queue at CLAIM_UNTESTED status.

## Battery Dispatch IPC Subdir Fix

`src/main/dispatch/dispatch_ipc.ts` — the `dispatch:list-content-files` handler was updated to recursively traverse `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` subdirectories using `getAllMdFilePaths(dir)` helper. `assertAllRatified()` BP078 BLOOD gate confirmed intact.

---

**FOR THE KEEP.**

*The mother dog had never seen a pale-skinned person. She was a perfect Bayesian reasoner with incomplete data. The TIC structurally guards against this trap at substrate scale: every universal claim carries its sample boundary, every theory carries its consequence chain, and ELIMINATED propositions are first-class artifacts paid for by the cooperative.*

*— Founder's Anecdote (Africa, age 3) per founders_anecdote_africa_mother_dog_bp084*
