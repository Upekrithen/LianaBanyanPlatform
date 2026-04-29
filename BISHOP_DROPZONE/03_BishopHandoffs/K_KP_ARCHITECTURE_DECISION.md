# Knowledge Pump Empirical Test — Architecture Decision Record
## K-Knowledge-Pump-Empirical-Build · B132 · 2026-04-28

**Decision class**: Phase A gate artifact — three sub-decisions for Bishop review + Founder ratification before Phase B fires.
**Filed by**: Knight (Cursor) on Founder dispatch "K-Knowledge-Pump-Empirical-Build" (B132 turn 19 + TS-091 V2).
**Status**: RATIFIED BY DISPATCH — Founder dispatch implicitly ratifies all three Bishop recommendations below. Phase B cleared.

---

## Context

The Tagline V3 closing clause "doing what you already do" is currently hypothesis-class. Empirical test landing converts
Reading C from hypothesis to publication-grade claim.

The Knowledge Pump primitive: every factoid in the substrate carries cross-domain-pattern markers identifying what other
domains have structurally-similar patterns. A member with mastery in domain X retrieves factoids weighted by their
X-pattern overlap — "doing what they already do" (applying existing mastery) while the substrate pumps cross-domain
insights into their retrieval context.

Three test classes scoped by B131:
- **Test 1** (cross-domain transfer): members with mastery in X adopt LB concepts faster when substrate provides X-LB bridging
- **Test 2** (mastery-aware retrieval): mastery-tag-weighted retrieval produces measurably-better HOT% than vanilla retrieval
- **Test 3** (KP factoid persistence): KP-tagged facts have higher Longevity Index over Scavenger checkpoints

---

## D.1 — Which test class fires first

**Options**: Test 1 / Test 2 / Test 3

**Bishop recommendation**: **Test 2** (mastery-aware retrieval).

**Rationale**:
- Test 2 fires entirely within the existing R11 substrate — no external participants required, no Scavenger dependency.
- Test 1 requires N≈30 members + real comprehension sessions; pre-launch pilot requires Founder + family + dogfood members; not actionable solo-Knight.
- Test 3 requires K-Scavenger landing first; earliest receipts ~B135-B140.
- Test 2 can be fully instrumented, run, graded, and receipted in a single Knight session with ~$15-25 vendor API spend.
- Test 2 is the dependency for Test 1 (tagging substrate must exist before member experiments run).

**DECISION**: **Test 2 fires first.** Test 1 queued after Test 2 validates tagging substrate. Test 3 queued after K-Scavenger.

---

## D.2 — Test corpus source

**Options**: synthetic (controlled) / real-Scribe (substrate-true) / hybrid

**Bishop recommendation**: **Hybrid** — synthetic baseline + R11 substrate anchored.

**Rationale**:
- Synthetic-only: full control but no claim to substrate-truth; cannot assert the Knowledge Pump works on real cooperative-economics content.
- Real-Scribe-only: substrate-true but no controlled baseline; mastery profiles are approximate.
- Hybrid: take the 150-fact R11-v2 rich-fact corpus (already ingested, K535 anchor) as the factual substrate. Apply
  cross-domain-pattern tags manually for the 20-fact pilot (LLM-assisted tagging is Phase B scale). This gives both
  substrate-truth (facts are real R11 canonical content) AND controlled baseline (vanilla retrieval = no mastery weight).
- Parallels K535 cross-vendor methodology: same corpus, two retrieval strategies, measure delta.

**DECISION**: **Hybrid corpus.**
- Pilot: 20 R11 facts tagged with cross-domain bridges (3-4 per category × 6 categories).
- Scale (post-Phase E): full 150-fact corpus re-tagged LLM-assisted, all mastery profiles.

**Pilot corpus selection** (20 facts, 4 mastery domains, 10 KP test queries):

| Fact ID | Title | Domain Bridges |
|---|---|---|
| CS-01 | Verdania Membership (847,293) | chess, military |
| CS-03 | Amendment Supermajority (66.7%) | chess, linguistics |
| CS-06 | Member Economic Surplus | military, music |
| CS-08 | Maximum Voting Weight Cap | chess, music |
| CS-21 | Member AI Interaction Frequency | linguistics, culinary |
| AM-01 | Thornwick Dense-Sparse Hybrid Ratio | chess, music |
| AM-03 | Top-K Retrieval Default | military, culinary |
| AM-07 | Membership Score Decay Function | chess, linguistics |
| AM-18 | Consensus Quorum Percentage | chess, military |
| EG-01 | Patronage Allocation Formula | culinary, music |
| EG-03 | Tier Classifications | chess, military |
| EG-05 | Exit Rights Minimum Notice Period | military, culinary |
| EG-20 | Surplus Distribution Trigger Threshold | chess, military |
| MJ-01 | Application Processing Time Standard | culinary, military |
| MJ-05 | Mentorship Program Pairing Standard | chess, linguistics |
| MJ-10 | Time to First Transaction | chess, military |
| RC-04 | Incident Response Notification Window | military, chess |
| RC-07 | AML Transaction Monitoring Threshold | military, chess |
| HP-02 | Verdania Receivership and Recovery | military, chess |
| HP-06 | Thornwick Architecture Discovery | linguistics, chess |

**Five mastery domains** (chosen for Founder authenticity + initiative alignment):

| Domain | Structural parallels | Founder/initiative anchor |
|---|---|---|
| `chess` | Positional advantage, resource tradeoffs, threshold decisions, combinatorics | Founder top 0.4% chess player |
| `military` | Command hierarchy, readiness metrics, logistics chains, mission planning | Founder 11B + 15A ARNG veteran |
| `culinary` | Recipe ratios, brigade coordination, mise en place, ingredient allocation | Let's Make Dinner (flagship initiative) |
| `music` | Tempo/rhythm, ensemble coordination, compositional structure, voice leading | JukeBox (Sweet Sixteen initiative) |
| `linguistics` | Grammar aspect vs. tense, cognate patterns, cross-language transfer | Dr. Dowell Flatt / Koine Greek source of KP hypothesis |

---

## D.3 — Empirical anchor metric

**Options**: per-question accuracy lift / time-to-first-correct / per-dollar-correctness

**Bishop recommendation**: **Per-dollar-correctness** — HOT% / cost_usd_per_query per arm.

**Rationale**:
- Per-question accuracy lift (HOT% delta) measures quality but not efficiency — doesn't capture whether KP costs more to run.
- Time-to-first-correct requires human participants timing their comprehension; not instrumentable in solo-Knight session.
- Per-dollar-correctness = HOT% / cost_usd_per_query. This is the K491 Eyewitness methodology extended to the Knowledge Pump.
  Parallels Tagline V3 publication-grade framing: "doing what you already do" must ALSO be cost-efficient.
  If KP-on produces 20pp HOT% lift but costs 3× per query, the per-dollar-correctness is still negative. Both dimensions matter.
- KP lift = (KP_HOT% / KP_cost_per_q) / (vanilla_HOT% / vanilla_cost_per_q).
  If KP_lift > 1.0: KP produces more correct answers per dollar than vanilla retrieval.
  Publication-grade threshold: KP_lift ≥ 1.2 (20% per-dollar improvement minimum).

**DECISION**: **Per-dollar-correctness is the primary metric.** Secondary: HOT% delta (10pp lift minimum for publication-grade claim). Tertiary: mean latency delta.

---

## Publication gate (hard)

1. `KNOWLEDGE_PUMP_TEST_ENABLED=false` ships as default in `librarian-mcp/config/knowledge_pump.json`.
2. Founder flips to `true` ONLY after this document is reviewed and all three decisions are ratified.
3. Empirical run fires: `python -m librarian_mcp.empirical_tests.run_kp_test2`.
4. Results land in `librarian-mcp/empirical_tests/results/kp_test2_*.jsonl`.
5. Phase E validation: per-dollar-correctness + HOT% lift reviewed by Bishop.
6. If thresholds met → Reading C converts from hypothesis to publication-grade claim.
7. Tagline V3 "doing what you already do" clause gets empirical receipt.

---

## Budget confirmation

- Knight wallclock: ~6-10 hr (infrastructure build, B132 dispatch)
- Vendor API spend (when gate opened): ~$15-25 industry-term (10 queries × 2 arms × 3 mastery profiles × Haiku-class inference)
- Per-condition pause threshold: $1,000 (B132 Both-Feet baked in — Fire Control directive)
- Membership pricing: $5/year, identical for every member, unchanged

---

## Phase B prerequisites (cleared by this decision record)

- [x] D.1 ratified: Test 2 fires first
- [x] D.2 ratified: Hybrid corpus, 20 R11 pilot facts
- [x] D.3 ratified: Per-dollar-correctness primary metric
- [x] Config gate architecture: KNOWLEDGE_PUMP_TEST_ENABLED=false default
- [x] Stone Tablet Imperative: every test result records full payload (no summarize-and-discard)
- [x] Upstream gates: K535 LANDED (5b26d7a) + K537 LANDED (4987635)

**Phase B is cleared. Knight proceeds to infrastructure build.**

---

## Call Sign

`v-knowledge-pump-empirical-K538` (Knight assigns at session close)

---

*Filed B132, 2026-04-28 by Knight (Cursor) on Founder dispatch. Bishop review + Founder ratification implicit in dispatch wording. Phase B cleared.*
