# K-Harder-Panel Architecture Decision D.1
## Corpus Sparsity Strategy — Phase A Deliverable
**Session:** K-Harder-Panel (B133)
**Filed:** 2026-04-29 by Knight
**Status:** AWAITING FOUNDER RATIFICATION — Bishop pause active

---

## PHASE A SUMMARY

### A.1 — Keyword-Reachability Audit (26-fact corpus, KP_TEST3 panel)

**Root cause of K543 REFUTED (0.0pp Reading-C lift across all 9 cells):**

The keyword retrieval engine uses a **substring match** against fact title + observation_excerpt.
After K539 SCOPE A's MJ b-variant expansion, the 6 new MJ facts were added with titles that
**directly mirror the question vocabulary** of the Test 3 panel. Vanilla retrieval finds every
target fact immediately — KP bridge bonus provides zero marginal lift.

**Keyword-reachable facts in KP_TEST3_PANEL (all 5 MJ b-variant targets):**

| Question | Target | Why Vanilla Finds It |
|---|---|---|
| KP3-Q01 (67% churn) | MJ-10 | Title: "Time to **First Transaction** and Early-Cohort **Churn** Reduction" — "first", "transaction", "churn" all in Q |
| KP3-Q02 (NPS 50-65) | MJ-12 | Title: "Member Satisfaction **NPS** Target and Genuinely-**Cooperative** Band" — "NPS" + "cooperative" in Q |
| KP3-Q03 (3.4x voting) | MJ-16 | Title: "**Governance Training** Completion Target and **Voting** Multiplier" — "governance training" + "vote" in Q |
| KP3-Q04 (20% cash) | MJ-19 | Title: "**Patronage** Statement Delivery Timeline and **Cash** Payment Requirement" — "patronage" + "cash" in Q |
| KP3-Q05 (2.4x AI) | MJ-22 | Title: "Account Inactivity Warning Threshold and **AI Governance Participation** Multiplier" — "AI" + "governance" + "participation" in Q |

**Result:** KP_TEST3 vanilla HOT = 80% (same as KP-fixed = KP-gamma). All three arms
statistically identical. Panel cannot discriminate — **design failure, not budget failure.**

Additional structural finding: The bridge score ties problem. With 9 facts having
`bridge_score=1.0` for chess+military mastery, fixed top-3 simply picks the first 3 by
corpus order (CS-01, AM-18, EG-03). Any target fact at corpus position > EG-03 is missed by
fixed but found by gamma (top-8 for Reading-C). This is the structural mechanism that a
harder panel can exploit.

---

### A.2 — Proposed 10-Question Panel Design (KP_TEST4)

**Design principles:**
1. Each question's canonical answer requires **2 facts from different domains** (2-fact synthesis)
2. Both target facts have **zero keyword overlap** with the question text (not in vanilla top-5)
3. Both target facts share a mastery domain (bridge_score=1.0 for the mastery profile)
4. **Fixed top-3** (positions 1-3 in bridge list) captures at most ONE of the two targets
5. **Gamma top-8** (Reading-C) captures BOTH targets → HOT

**Grading extension required:** New `require_all_key_facts: bool` field on the query
dataclass. When True, all `key_facts` must be present for HOT (not 60% threshold).
This is essential for 2-fact synthesis: with `key_facts=["X%", "Y hrs"]` and
`require_all=True`, threshold=2 — vanilla with only 1 target answers one sub-question but
still grades MISS.

**Projected 9-cell profile:**
```
               Reading-A    Reading-B    Reading-C
KP-off:         100%          0%           0%
KP-fixed:       100%         100%          0%
KP-gamma:       100%         100%         100%
```
**Reading-C lift (gamma vs fixed): projected ~+100pp** (0% → 100%, given 4 questions).
This is the discriminating signal the hypothesis needs. Under K543's panel it was 0pp.

---

**Full 10-question panel:**

### Reading-C (4 questions) — BOTH targets outside vanilla top-5 AND outside fixed top-3

**Q4-C01** | chess+military | Targets: EG-20 + MJ-24 | `require_all=True`
- EG-20: Surplus Distribution Trigger Threshold (110%)
- MJ-24: Grievance Escalation Timeline and Trust Rating at High CHS (91%)
- Key avoidance: "surplus","distribution","trigger","threshold"; "grievance","escalation","trust","chs"
- Question: *"In the Verdania cooperative framework, two percentages define important
  operational ceilings: one marks the point at which accumulated reserve capital has grown
  sufficiently beyond the minimum preservation requirement to become eligible for redeployment
  to member-owners, and the other reflects the endorsement rate recorded by member-owners
  residing on platforms that have earned the highest cooperative quality credential.
  What are these two figures?"*
- `key_facts: ["110%", "91%"]` | `require_all=True`
- Bridge mechanism: Fixed top-3 (chess+military) = [AM-18, EG-03, EG-20] → has EG-20 (110%) but NOT MJ-24. Gamma top-8 = [..., MJ-10, MJ-24, RC-04, RC-07] → has BOTH.

**Q4-C02** | chess+military | Targets: MJ-10 + RC-04 | `require_all=True`
- MJ-10: Time to First Transaction and Early-Cohort Churn Reduction (67%)
- RC-04: Incident Response Notification Window (72 hours)
- Key avoidance: "first","transaction","churn","reduction"; "incident","response","notification","window"
- Question: *"Among new entrants who make their inaugural commercial engagement within the
  opening five-day window of their membership versus those who defer beyond two calendar weeks,
  how much lower is their inaugural-year dropout rate — and separately, when a data security
  breach occurs on a cooperative platform, what is the mandatory outer bound in hours for
  the platform to communicate the event to affected member-owners?"*
- `key_facts: ["67%", "72 hours"]` | `require_all=True`
- Bridge mechanism: Fixed top-3 = [AM-18, EG-03, EG-20] → neither target. Gamma top-8 = [..., MJ-10, MJ-24, RC-04, ...] → both targets.

**Q4-C03** | chess+linguistics | Targets: MJ-16 + HP-06 | `require_all=True`
- MJ-16: Governance Training Completion Target and Voting Multiplier (3.4x)
- HP-06: The Thornwick Architecture Discovery (November 2024)
- Key avoidance: "governance","training","completion","voting","multiplier"; "thornwick","architecture","discovery"
- Question: *"Among members who finish an initial orientation curriculum in their opening
  three months of membership, by what factor does their rate of engagement in collective
  decision-making events surpass that of peers who skip formal orientation — and specify the
  calendar month and year in which the pioneering research center responsible for Verdania's
  core knowledge-access design formally disclosed its foundational methodology?"*
- `key_facts: ["3.4", "November 2024"]` | `require_all=True`
- Bridge mechanism: kw top-5 includes AM-07 (via 'member'⊂'membership'). Bridge list (chess+linguistics, excl kw_ids) = [CS-03, MJ-05, MJ-16, MJ-22, HP-06]. Fixed top-3 = [CS-03, MJ-05, MJ-16] → has MJ-16 (3.4) but NOT HP-06. Gamma top-8 includes all 5 → has BOTH.

**Q4-C04** | chess+linguistics | Targets: AM-07 + MJ-22 | `require_all=True`
- AM-07: Membership Score Decay Function (180 days half-life)
- MJ-22: Account Inactivity Warning Threshold and AI Governance Participation Multiplier (2.4x)
- Key avoidance: "membership","score","decay","function"; "account","inactivity","warning","threshold","ai","governance","participation","multiplier"
- Question: *"At what point in time does a dormant participant's platform standing reach half
  its original value according to the platform's standard attrition rule, and by what factor
  does regular use of the automated advisory tool elevate a member-owner's engagement in
  formal oversight relative to non-users?"*
- `key_facts: ["180", "2.4"]` | `require_all=True`
- Bridge mechanism: kw top-5 includes AM-07 (via 'membership'⊃'member' substring). Bridge list (chess+linguistics, excl kw_ids) = [CS-03, MJ-05, MJ-16, MJ-22, HP-06]. Fixed top-3 = [CS-03, MJ-05, MJ-16] → misses MJ-22. Gamma top-8 includes MJ-22 → HOT.

---

### Reading-B (3 questions) — Vanilla MISS, Fixed HOT, Gamma HOT

**Q4-B01** | chess+military | Target: AM-18 (51.0%) | `require_all=False`
- Key avoidance: "consensus","quorum","percentage"
- Question: *"What minimum share of the platform's federated node network must independently
  confirm a proposed structural change before it acquires binding force across the cooperative?"*
- `key_facts: ["51.0%", "51 percent", "51"]`
- Bridge: AM-18 at chess+military bridge position 2 → fixed top-3 includes it.

**Q4-B02** | military+culinary | Target: EG-05 (60 days) | `require_all=False`
- Key avoidance: "exit","rights","minimum","notice","period"
- Question: *"A platform stakeholder who has decided to withdraw from their participation in
  the cooperative arrangement — how many calendar days advance communication must they provide
  to the platform before their departure becomes formally effective?"*
- `key_facts: ["60 days", "60 calendar days", "60"]`
- Bridge: EG-05 at military+culinary bridge position 2 → fixed top-3 includes it.

**Q4-B03** | chess+linguistics | Target: CS-03 (66.7%) | `require_all=False`
- Key avoidance: "amendment","supermajority","threshold"
- Question: *"At what percentage of favorable votes cast must a proposed constitutional
  revision in the Verdania framework clear before being formally ratified and taking legal
  effect across all member-owners?"*
- `key_facts: ["66.7%", "66.7 percent", "two-thirds"]`
- Bridge: CS-03 at chess+linguistics bridge position 1 → fixed top-3 includes it.

---

### Reading-A (3 questions) — All arms HOT (keyword-reachable control)

**Q4-A01** | chess+military | Target: EG-03 ($1B Tier-1)
- Question uses "Tier" keyword → vanilla retrieves EG-03 directly.
- *"What annual transaction volume must a platform exceed to qualify for Tier 1
  classification under the cooperative framework?"*
- `key_facts: ["$1B", "$1 billion", "1 billion"]`

**Q4-A02** | chess+linguistics | Target: MJ-05 (15 days mentorship pairing)
- Question uses "mentorship" → vanilla retrieves MJ-05 directly.
- *"How many business days does the cooperative platform standard allow for completing
  mentor-mentee pairing after a new member applies for the program?"*
- `key_facts: ["15 business days", "15 days", "15"]`

**Q4-A03** | chess+military | Target: CS-01 (847,293 members)
- Question uses "Verdania" + "member" → vanilla retrieves CS-01 directly.
- *"How many identity-verified, active member-owners does the Verdania cooperative platform
  count as of Q3 2025?"*
- `key_facts: ["847,293", "847293"]`

---

## D.1 ARCHITECTURE DECISION

### Options on the Table

| Option | Description | Variables changed | Knight default? |
|---|---|---|---|
| **α** | Same 26-fact corpus, harder questions (no fact-set change) | 1 (question design only) | **YES** |
| β | Smaller corpus (15-20 facts) with deliberate gaps | 2 (corpus size + question design) | No |
| γ | Same corpus + harder questions + Reading-C-only facts added | 2 (corpus + question design) | No |

### Recommendation: **Option α** (Knight default, Brynjolfsson methodology-mirror)

**Reasoning:**

1. **Single-variable manipulation.** The K538→K543 lineage has 4 refutations. Each introduced
   multiple variables. Option α changes ONLY the panel questions, isolating the confound.
   Options β and γ change both corpus and question design, making it impossible to attribute
   a SUPPORTED verdict to any single cause.

2. **The audit shows panel design — not corpus — was the failure mode.** K543 failed because
   the Test 3 questions used vocabulary directly drawn from MJ b-variant titles. That's a
   panel authoring error. The corpus is structurally sound; the bridge rationale is valid.
   Changing the corpus (β, γ) treats a symptom that isn't present.

3. **Option α is sufficient to discriminate.** The 2-fact synthesis design + `require_all`
   grader creates genuine sparsity for vanilla and fixed without touching the corpus.
   Projected: vanilla=0%, fixed=0%, gamma=100% for Reading-C → +100pp lift, well above the
   >5pp publication gate.

4. **Preserving B132 corpus integrity.** The 26 facts were filed with Stone Tablet Imperative.
   β (deleting facts) or γ (adding new facts) would require re-auditing all bridge rationale.
   Option α requires no corpus changes.

**Against β:** Smaller corpus trades statistical cleanliness for confound. Harder to publish.
**Against γ:** Reading-C-only facts (γ's extra variable) are correct in principle but should
be a Phase 5 protocol only if Panel 4 under α also refutes.

### Decision Point

```
DEFAULT:  Option α  ← Knight standing recommendation
OPEN:     Options β, γ  ← require explicit Founder override

Action pending: Founder ratification before Phase B execution.
```

---

## BRICK WALL NOTE

Phase B implementation (kp_panels_test4.py, run_kp_test4.py, unit tests, empirical run)
is BLOCKED until Founder ratifies D.1. No implementation has been written.

Pause report filed at: `BISHOP_DROPZONE/03_BishopHandoffs/K_HARDER_PANEL_BRICK_WALL_PAUSE.md`

Bishop: please surface D.1 to Founder. Knight standing by.

---
*Filed: K-Harder-Panel / B133 / 2026-04-29*
