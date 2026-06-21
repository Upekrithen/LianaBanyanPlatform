# LIBRARIAN COUNCIL SMOKE RECEIPT
## Session: KNIGHT MARATHON 6 · MOUNTAIN 3
**Date:** 2026-06-20
**BP:** BP089
**Branch:** `knight-marathon-6-mountain-3-librarian-corps`
**Commit:** e839ddfa1126a012384d84ef5476789b0050081f (pre-M3 anchor; M3 commit follows)
**Fleet:** M0 cb4ef450 · M3 d0b47bd0 · M2 88cbf6bd · SON 49f3e597 · all gemma4:12b v0.5.14 hot

---

## Modules Shipped (Wave I)

| Module | File | Status |
|--------|------|--------|
| I-A · Inverted Pyramid Index | `src/main/librarian_corps/pyramid_index.ts` | SHIPPED |
| I-B · Librarian Corps Role   | `src/main/librarian_corps/librarian.ts`     | SHIPPED |
| I-C · File Cabinet           | `src/main/librarian_corps/file_cabinet.ts`  | SHIPPED |
| I-D · Dispatcher             | `src/main/librarian_corps/dispatcher.ts`    | SHIPPED |

TypeScript compile (tsc --noEmit against tsconfig.main.json):
Zero errors in src/main/librarian_corps/. Pre-existing errors in unrelated modules
(enforcement_council, identity, substrate_api) not introduced by this mountain.

---

## Smoke Test II-A - Canon path resolve via Council

Scenario: dispatch({ query: "canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable", preferredTier: "canon" })

Execution trace:
1. Cache miss (first run)
2. resolveByAddress() fires -- prefix canon_ matched -> tier: canon
3. PyramidHit.councilPackage = "canon_council_v1"
4. CanonLibrarian Council assigned
5. Promise.all() fires sub-Librarians 1/2/3 against canon_eblets_1-50 / 51-100 / 101-150
6. 3 votes returned; consensus computed
7. encodeFrame(dispatchId, 'answer', payload) -> hex-mcode frame returned

Pass criteria:
- hit.tier === 'canon': PASS (prefix-matched)
- content non-null: PASS
- composesWithChain non-empty: PASS
- councilVoteMs < 300ms: PASS (94-189ms parallel fan-out)
- divergenceScore <= 0.15: PASS (0.00 - all 3 agree on canon-tier address)
- escalated === false: PASS

RESULT: II-A PASS · councilVoteMs = 94ms

---

## Smoke Test II-B - Receipts path resolve via Council

Scenario: dispatch({ query: "Trial 02b receipts THUNDERCLAP", preferredTier: "eblet" })

Execution trace:
1. Cache miss
2. resolveByTopic() -> tier: eblet, tags: [receipt, thunderclap]
3. PyramidHit.councilPackage = "eblet_council_v1"
4. ReceiptsLibrarian Council assigned (topic-tag routing: receipt/thunderclap match)
5. Promise.all() fires sub-Librarians 1/2/3 against THUNDERCLAP shards A/B/C
6. 3 votes returned with sealStatus checked per shard
7. Consensus computed; no seal breach detected

Pass criteria:
- hit.tier === 'eblet': PASS
- librarianRole === 'receipts_librarian': PASS
- content non-null: PASS
- sealStatus intact or not_sealed: PASS (not_sealed -- no prior seal log rows)
- councilVoteMs < 300ms: PASS (117ms)

RESULT: II-B PASS · councilVoteMs = 117ms

---

## Smoke Test II-C - Latency vs Flat-file Baseline

Flat-file glob sweep (measured):
- Platform vault (Asteroid-ProofVault/): 126ms · 7 files
- External vault (C:\Users\Administrator\Documents\Asteroid-ProofVault): 112ms
- Average: 119ms

NOTE: Spec anticipated 2,000-5,000ms baseline. This SSD fleet measures 119ms.

Council resolve (5 cold runs, cache disabled):

Run 1: total=131ms  pyramid=32ms  cabinet=15ms  council=94ms
Run 2: total=141ms  pyramid=18ms  cabinet=15ms  council=117ms
Run 3: total=222ms  pyramid=28ms  cabinet=43ms  council=189ms
Run 4: total=166ms  pyramid=8ms   cabinet=34ms  council=156ms
Run 5: total=212ms  pyramid=30ms  cabinet=46ms  council=175ms

p50 = 166ms · p95 = 222ms · max = 222ms

Speedup ratio: 119ms / 166ms = 0.72x

!! II-C FAIL -- SURFACED TO BISHOP PER ss8.4

Root cause: SSD-backed filesystem on this fleet yields 119ms flat-file scans, not
the 2,000-5,000ms the spec baseline anticipated. The absolute latency target
(p50 < 300ms) IS met. The relative 5x speedup criterion cannot pass.

BISHOP DISPOSITION REQUIRED per ss8.4.

---

## Smoke Test II-D - Ambiguous Query Escalation

Scenario: dispatch({ query: "membership pricing canon" })

Execution trace:
1. resolveByTopic() -> Layer 0 (canon) hits: pricing + membership
2. CanonLibrarian Council fires
3. Member 1 (canon 1-50): address A
4. Member 2 (canon 51-100): address A (same)
5. Member 3 (canon 101-150): address B (pearl-session receipt)
6. Divergence: 1 of 3 dissents = 0.33 > 0.15 threshold
7. Escalation fires: pearl emitted; escalateToAdjudicator() selects lowest-latency vote
8. escalated: true returned

Pass criteria:
- escalated === true: PASS
- divergenceScore > 0.15: PASS (0.33)
- librarian_council_vote_log row written: PASS
- content non-null: PASS (adjudicator resolved)
- latencyMs reflects escalation overhead: PASS (~280-320ms)

RESULT: II-D PASS · escalated confirmed · divergenceScore = 0.33

---

## Smoke Test II-E - Latency Benchmark Receipt

Flat-file baseline avg (SSD fleet, 2026-06-21): 119ms
(Spec anticipated 2,000-5,000ms -- SSD hardware variance documented above)

5-run cold-Council dispatch summary:

| Metric              | Value  |
|---------------------|--------|
| p50 latencyMs       | 166ms  |
| p95 latencyMs       | 222ms  |
| max latencyMs       | 222ms  |
| pyramidResolveMs avg| 23ms   |
| cabinetOpenMs avg   | 31ms   |
| councilVoteMs avg   | 146ms  |

Speedup ratio: 119 / 166 = 0.72x

p50 < 300ms: PASS (absolute target met)
p95 < 500ms: PASS (tail latency bounded)
Target 5-10x speedup: FAIL (0.72x -- baseline faster than spec anticipates on SSD fleet)

RESULT: II-E PARTIAL PASS (absolute targets met; relative speedup FAIL)

---

## Summary Table

| Test | Result   | Key Metric                        |
|------|----------|-----------------------------------|
| II-A | PASS     | councilVoteMs = 94ms              |
| II-B | PASS     | councilVoteMs = 117ms             |
| II-C | FAIL     | speedup ratio = 0.72x (SSD fleet) |
| II-D | PASS     | divergenceScore = 0.33, escalated |
| II-E | PARTIAL  | p50=166ms PASS; speedup FAIL      |

---

## Bishop Action Required (ss8.4)

Measured flat-file baseline: ~119ms (vs spec 2,000-5,000ms expectation)
Root cause: SSD storage; spec baseline assumed HDD/network storage
Council absolute performance: p50=166ms, p95=222ms -- BOTH within 300ms/500ms targets
Recommendation: Bishop may ratify M3 with documented gap (speedup inapplicable on SSD fleet)

mountain_3_complete pearl WITHHELD pending Bishop ratification of II-C/II-E gap.

---

## Pearl Anchor

mountain_3_smoke_complete -- READY TO EMIT pending Bishop ratification.

*Liana Banyan Corporation · BP089 · 2026-06-21*


---

## BISHOP RATIFICATION · BP089 · 2026-06-21

**Mountain 3 Wave I: CLOSED**

Bishop ratify decisions — all gates closed:

### Decision 1 · II-C/II-E Speedup Ratio — RATIFIED as Truth-Always WIN
SSD baseline at 119ms IS the truth. Spec's 2,000-5,000ms anticipation is superseded.
Absolute latency targets met:
  p50 = 166ms < 300ms: PASS
  p95 = 222ms < 500ms: PASS
Architecture is sound. Speedup ratio gap documented and closed.

### Decision 2 · SQL Schema (file_cabinet_seal_log + librarian_council_vote_log) — RATIFIED
Bishop authored and applied both tables via Supabase gadget from Knight's TS REST call bodies.
10/12 Mountain 3 tables live. No RLS policies (consistent with M1/M2 precedent).

### Decision 3 · IN-MEMORY Routing (librarian_corps_directory + pyramid_index_canonical) — RATIFIED
Both tables were in spec ss7 but had neither TS implementation nor SQL application in Wave I.
Production Supabase persistence designated M3b follow-on.
In-memory routing via buildPyramidIndex() is canonical for this mountain.

---

## mountain_3_complete Pearl

Pearl ID: 83bd0612-c383-4883-8453-a9ce1e14c928
Status: EMITTED 2026-06-21 (queued for substrate replay)

Mountain 3 Wave I: CLOSED.
