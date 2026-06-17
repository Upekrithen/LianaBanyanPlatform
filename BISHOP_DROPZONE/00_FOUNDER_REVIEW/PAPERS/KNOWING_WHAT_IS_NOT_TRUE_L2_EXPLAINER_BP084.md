---
title: "Knowing what is NOT true is half the battle"
level: L2-Explainer
channel: Cephas longform /papers/knowing-what-is-not-true/
status: founder-ratify-pending
session: BP084
model: Sonnet 4.6
date: 2026-06-16
---

# Knowing what is NOT true is half the battle

## A Complete Explainer: Truth Integrity Chain · Code Breakers Guild · Gold Refined by Fire

> *What survives the smashing is Immutable.*
> *Code Breakers smash. Marks pay them.*
> *Gold Refined by Fire.*

*For a shorter introduction, see the [L1 Public version](/papers/knowing-what-is-not-true/l1-public). For the formal technical specification, see the [L3 Technical paper](/papers/technical/knowing-what-is-not-true.pdf).*

---

## 1. The Problem, in Concrete Terms

### The Africa Anecdote

When I was 3 years old, I was attacked by a dog in Africa.

My parents were missionaries. Africa was home. I remember being near a litter of puppies when the mother came for me. She was not a violent dog. She was a good mother. And from every angle available to her, I was a threat: a small creature she didn't know moving toward what mattered most to her.

Her reasoning was correct. Her conclusion was wrong.

This is the distinction that matters. Correct reasoning from incomplete data can still reach a catastrophically wrong conclusion. The mother dog had never seen a white person before in her life — she did not categorize me as a child she could choose to spare; she categorized me as an alien being, not human at all. She had no way to represent "pale-skinned creatures near my puppies can be harmless." She had no ELIMINATED category. She could only work with what she knew, and what she didn't know she didn't know was the variable that mattered.

I spent years puzzling over that dog. Not about the attack — that healed. About the epistemology. She was a perfect Bayesian reasoner operating on an incomplete hypothesis space. She had no structural way to distinguish "I don't know this creature is safe" from "I have confirmed this creature is dangerous." Those are not the same thing. Treating them as the same thing is a category error that can get a toddler bitten and a mother dog beaten for doing her job.

### The Formal Companion: Bob Is a Dog

The same trap appears in pure logic. Consider:

> **Premise 1:** All dogs with puppies protect them aggressively.
> **Premise 2:** Bob is a dog with puppies.
> **Conclusion:** Bob will protect her puppies aggressively.

This argument is *valid* — the conclusion follows from the premises. It may also be *sound* if both premises are true. But what if Premise 2 is false? What if Bob is not a dog at all, or doesn't have puppies, or is a particularly gentle dog who redirects rather than attacks? The entire tower of correct inference collapses.

Current AI systems — and most human institutions — have no native language for what has been verified false. They carry "Bob is a dog" as a proposition with a confidence score, but they don't carry a record that says "this claim was tested 40 times by independent researchers and found to be false." The ELIMINATED category is missing.

### Why It Matters Now

Today's large language models are sophisticated reasoners. They are also, structurally, operating without an ELIMINATED category.

When you ask a language model about a scientific claim, it synthesizes from its training data. If many sources say X is true, it expresses high confidence in X. If some sources dispute X, it may express measured uncertainty. But it has no mechanism for: "This claim has been definitively falsified by experiment 47b in 2019, and any response that treats X as an open theory is wrong in a way that should stop the chain."

This is not a bug. It is a structural feature of how current systems represent knowledge. They know what they know. They have weak mechanisms for knowing what they don't know. And they have almost no mechanism for knowing what has been ruled out.

**Knowing what is NOT true is half the battle. Current systems skip that half.**

---

## 2. The Truth Integrity Chain (TIC): A Five-Field Schema

The Truth Integrity Chain is a structured record for any claim — a knowledge artifact that carries not just the claim itself, but its verification status, its open competitors, its definitively eliminated alternatives, and its relationships to other claims.

A TIC record has five fields:

```
truth_integrity_record:
  claim_id: "G-001"
  claim_text: "Gravity attracts mass to mass."
  
  KNOWN:
    - "Gravity attracts mass to mass (Newtonian, confirmed across 400 years of observation)"
    - "Gravitational effects propagate at the speed of light (confirmed: LIGO 2017 GW170817)"
    - "General Relativity predicts binary pulsar decay rate to 0.2% precision (Hulse-Taylor, Nobel 1993)"
    - "GR predicts black hole ringdown waveforms (confirmed: LIGO 2015, GW150914)"
  
  THEORIES_OPEN:
    - "Graviton-mediated: gravity is transmitted by a spin-2 massless boson (testable, not confirmed)"
    - "Modified Newtonian Dynamics (MOND): gravity modifies at low acceleration scales (partially tested)"
    - "Emergent gravity (Verlinde): gravity as entropic force, not fundamental (theoretical)"
    - "Loop Quantum Gravity integration: GR + quantum at Planck scale (not tested)"
    - "Extra dimensions (Kaluza-Klein / string-inspired): gravity leaks into extra dimensions"
    - "f(R) gravity modifications: modified GR field equations"
    - "Scalar-tensor theories (Brans-Dicke): additional scalar field alongside metric"
    - "Conformal gravity: Weyl tensor action, no cosmological constant"
    - "Non-commutative geometry gravity approaches"
    - "Massive gravity: graviton has nonzero mass (severely constrained)"
    - "Causal dynamical triangulations"
    - "Asymptotic safety"
  
  ELIMINATED:
    - "Proximity-only gravity: gravity is purely contact force (eliminated: Newton's bucket, tidal effects)"
    - "Electromagnetism-as-gravity: gravity is electromagnetic in origin (eliminated: opposite charge signs)"
    - "Aether-mediated gravity: gravity is propagated through a rigid aether (eliminated: Michelson-Morley + SR)"
    - "Instantaneous action at a distance: gravity propagates faster than c (eliminated: LIGO 2017)"
  
  DEPENDENCIES_UPSTREAM:
    - "G-000: The laws of physics are invariant under inertial frame transformations (Special Relativity)"
    - "G-000b: Spacetime is a continuous Lorentzian manifold at macroscopic scales"
  
  APPLICATIONS_DOWNSTREAM:
    - "G-010: Orbital mechanics calculations (GPS corrections, satellite trajectories)"
    - "G-011: Gravitational wave detector design (LIGO, LISA)"
    - "G-012: Black hole shadow predictions (Event Horizon Telescope)"
    - "G-013: Cosmological structure formation models"
```

### What This Gives You

This schema does something no single-confidence-score system can do: it lets you see the *shape of the unknown*.

When you look at THEORIES_OPEN for gravity, you see 12 competing frameworks that have not been ruled out. When you look at ELIMINATED, you see 4 candidate explanations that have been definitively closed. When you look at DEPENDENCIES_UPSTREAM, you see what assumptions this claim rests on — because if G-000 falls, everything downstream of it needs re-evaluation.

This is the structural shift: from "confidence in this claim" to "map of verified, open, and eliminated space."

### The Hasty-Generalization Guard

There is a fifth structural protection built into the TIC: a guard against hasty generalization.

Any claim in the KNOWN field that takes the form of a universal quantifier ("all X," "no X," "every X") must pass a two-part check before it can be written in:

1. **Sample size requirement**: the claim must have been observed across a sample large enough to justify the universal. (The threshold varies by domain — the substrate tracks this per-claim-type.)

2. **Counter-evidence search radius**: before asserting "all X," the system must have searched for counter-instances. A universal claim that has never been subjected to a counter-evidence search is a hypothesis, not a known.

This guard catches the mother dog's error. "All unknown creatures near my puppies are threats" is a hasty generalization — it was never tested against the full population of creatures who might approach a litter. It was reasoned from a small sample (past experiences) and extended universally without counter-evidence search.

The guard is not perfect — no guard is. But it is structural. It is built into the schema, not left to the judgment of whoever is writing the claim.

---

## 3. The Three Verification Loops

The Truth Integrity Chain doesn't just hold data statically. It operates dynamically through three verification loops — numbered 10, 11, and 12 in the extended Plow sequence. (Loops 1-9 are the existing substrate accumulation and retrieval loops; 10-12 are the TIC-specific extensions.)

### Loop 10: CONSEQUENCE_TRACE

**Purpose:** When a new claim enters THEORIES_OPEN, spawn its downstream logical consequences and check them against KNOWN and ELIMINATED.

**Mechanism:**

```
PROCEDURE loop_10_consequence_trace(theory T, depth_limit N):
  FOR each logical consequence C of T (derived via deduction):
    IF C contradicts any item in KNOWN:
      mark T as "self-contradicting with KNOWN — escalate to Loop 11"
      BREAK
    IF C contradicts any item in ELIMINATED:
      mark T as "contradicts eliminated claim — escalate to Loop 11"
      BREAK
    IF depth < N:
      recurse: consequence_trace(C, depth - 1)
  RETURN: consequence_map for T
```

**Depth limit N** prevents runaway consequence chains. The cooperative sets N per domain — physical sciences typically run N=4; social claims N=2.

**Example:**

Theory T: "Gravity propagates instantaneously (faster than light)."

Consequence 1: Gravitational wave events should be detectable simultaneously with their optical counterparts with zero time lag.
Check against KNOWN: "Gravitational effects propagate at c (LIGO 2017 GW170817)" — this observation showed a 1.7-second delay between gravitational and electromagnetic signals, consistent with propagation at c over 130 million light years.
Result: Theory T is contradicted by KNOWN → escalate to Loop 11.

### Loop 11: ELIMINATION_VERIFICATION

**Purpose:** When Loop 10 flags a contradiction, or when a Code Breaker submits a challenge, formally verify that the theory should move to ELIMINATED.

**Mechanism:**

```
PROCEDURE loop_11_elimination_verification(theory T, challenge evidence E):
  
  Step 1: Verify E is new (not already in ELIMINATED or KNOWN)
  Step 2: Verify E is independent (not derived from T itself)
  Step 3: Apply logical form check: does E formally contradict T?
    - If yes: T moves to ELIMINATED, E added to ELIMINATED with provenance
    - If no: E is added to KNOWN with notation "consistent with T"
  Step 4: Trigger Loop 12 on all APPLICATIONS_DOWNSTREAM of T
  
  RETURN: elimination_record or consistency_record
```

**The elimination record** carries: the eliminated theory, the eliminating evidence, the Code Breaker who submitted it (for Marks ledger), the timestamp, and the verification chain.

**Example:**

Theory T: "Electromagnetism-as-gravity (gravity is electromagnetic in origin)"

Challenge E: "Electrically opposite charges attract electrostatically, while gravity only attracts (never repels). These are opposite sign behaviors for the same sign inputs — structurally incompatible."

Loop 11 check: Does E formally contradict T? Yes — if gravity were electromagnetic, its attractive/repulsive behavior should mirror electromagnetic sign rules. It doesn't. T is eliminated.

### Loop 12: DEPENDENCY_PROPAGATION

**Purpose:** When a KNOWN claim is updated (strengthened, weakened, or eliminated), propagate the update through APPLICATIONS_DOWNSTREAM.

**Mechanism:**

```
PROCEDURE loop_12_dependency_propagation(updated_claim K, change_type C):
  
  FOR each claim A in K.APPLICATIONS_DOWNSTREAM:
    IF change_type is ELIMINATED:
      re-evaluate A's DEPENDENCIES_UPSTREAM
      IF K was load-bearing for A:
        move A from KNOWN to THEORIES_OPEN (pending re-verification)
        trigger loop_12 on A.APPLICATIONS_DOWNSTREAM
    IF change_type is STRENGTHENED:
      update A's confidence metadata
      trigger loop_12 on A.APPLICATIONS_DOWNSTREAM (informational pass)
  
  RETURN: propagation_tree, affected_claims_list
```

**Example:**

Suppose new experimental data strengthens KNOWN item: "Gravitational wave propagation speed confirmed at c to 0.00001% precision (future LISA/Einstein Telescope result)."

Loop 12 propagates this update downstream to G-010 (orbital mechanics), G-011 (detector design), G-012 (black hole predictions), G-013 (cosmology). Each downstream application records the strengthening.

Now suppose the opposite: suppose G-000 ("laws of physics are invariant under inertial frame transformations") were somehow weakened by new evidence. Loop 12 would propagate a re-evaluation cascade through everything downstream, including the gravity KNOWN items, and everything downstream of those.

This is how a single foundational update can ripple appropriately through an entire knowledge graph — automatically, with full provenance, without requiring humans to manually track every dependency.

---

## 4. Code Breakers Guild: the Cooperative Pays Its Critics

The TIC schema is the data structure. The Code Breakers Guild is the human mechanism that populates the ELIMINATED field.

### The Four Claim Tiers

Every claim in the TIC passes through four certification states:

```
┌─────────────────────────────────────────────────────────────────────┐
│ TIER        │ STATUS              │ ADVANCEMENT CRITERIA             │
├─────────────┼─────────────────────┼──────────────────────────────────┤
│ UNTESTED    │ Claim submitted,    │ Submitter writes claim +         │
│             │ not yet challenged  │ evidence base; schema validated  │
├─────────────┼─────────────────────┼──────────────────────────────────┤
│ TESTED      │ Survived K≥20       │ K independent Code Breaker       │
│             │ independent         │ challenges across ≥3 Code Breaker│
│             │ challenges          │ member tiers (Initiate through   │
│             │                     │ Master)                          │
├─────────────┼─────────────────────┼──────────────────────────────────┤
│ FORGED      │ Survived M≥10       │ M challenges by Master-tier or   │
│             │ high-quality        │ above; 90-day continuous hold    │
│             │ challenges          │ period without new eliminations  │
├─────────────┼─────────────────────┼──────────────────────────────────┤
│ GOLD_REFINED│ Immutable           │ Passed all Forged-tier criteria; │
│ _BY_FIRE    │                     │ Guild majority vote on           │
│             │                     │ immutability; formal record      │
│             │                     │ sealed with timestamp + signers  │
└─────────────┴─────────────────────┴──────────────────────────────────┘
```

**GOLD_REFINED_BY_FIRE** is the designation for a claim that has survived the full gauntlet. What survives the smashing is Immutable. The claim doesn't become "more true" — but its verification record becomes publicly, irrevocably legible.

### Code Breaker Member Tiers

The people doing the smashing also have a progression:

- **Initiate** — first successful challenge recorded
- **Journeyman** — 10 successful challenges
- **Master** — 100 successful challenges + 10 challenges that pushed a claim into Forged tier
- **Refiner of Gold** — the highest honor: 10 *honorable failures* on claims that subsequently achieved GOLD_REFINED_BY_FIRE immutability

That last tier deserves attention. The Refiner of Gold honor is not for people who broke things. It is for people who tried their hardest to break things — and couldn't. Their failed attacks are what gave those claims their Immutable status. They hit the claim from every angle they could find, and the claim held. The honor is for the hardest honest attempt that failed.

This inverts the perverse incentive of traditional peer review, where the highest prestige often goes to those who confirm popular theories. Here, the highest honor goes to the person who tried hardest to falsify a theory that turned out to be true.

### The Reversal-of-Immutable Process

Immutable does not mean eternal. It means: this claim's verification record is sealed, and reversing it requires a high bar.

The reversal process requires two things simultaneously:
1. **New empirical data not available during prior fire-rounds** — evidence that was structurally unavailable to earlier Code Breakers (not just unconvincing to them)
2. **Guild majority vote on admissibility** — the broader Guild votes on whether the new evidence is genuinely novel and genuinely contradicting

Both are required. The bar is intentionally high. An immutable claim that is later reversed carries a special notation: REVERSED_ON: [date] + REVERSAL_EVIDENCE: [record] + PRIOR_IMMUTABLE_FROM: [date]. The history is preserved. The reversal is not erasure — it is an addition to the provenance.

---

## 5. Negative-Knowledge Tokens: the Economics of Elimination

This is where the cooperative principle enters.

Within the Liana Banyan cooperative, members earn **Marks** — the cooperative's contribution currency. Marks are not dollars, and they are not convertible to dollars. They are the ledger of work done for the commons. The three currencies of the cooperative (Credits, Marks, Joules) are non-fungible to fiat; this is a Structural Bylaw.

Under the standard model, members earn **confirmation-Marks** for verified positive contributions: content published, services rendered, claims submitted and verified.

The TIC system adds a second denomination: **elimination-Marks** — Marks tagged to record that the earner's work was specifically the elimination of a false claim.

```
mark_record:
  type: elimination-Mark
  denomination: negative-knowledge
  earner: "code-breaker-member-id"
  claim_eliminated: "TIC-CLAIM-007"
  eliminated_theory: "Electromagnetism-as-gravity"
  evidence_submitted: "sign-incompatibility argument + experimental confirmation ref"
  loop_11_verification: "passed"
  multiplier: 1.0x
  timestamp: "2026-09-14T11:22:00Z"
```

The **1.0x multiplier** is intentional: elimination-Marks redeem at the same rate as confirmation-Marks. The cooperative treats the work of ruling things out as economically equal to the work of confirming things. This is a deliberate structural choice.

Cooperative dashboards surface the **confirmation vs. elimination ratio** per member and in aggregate. A healthy knowledge commons should show meaningful elimination activity — not just accumulation of new claims. An ecosystem where almost no elimination is happening is an ecosystem where the ELIMINATED category is growing stale, and the mother dog's error is being repeated at scale.

---

## 6. What This Is NOT

The Truth Integrity Chain is not the first attempt to structure knowledge around falsification. It's worth being explicit about what has come before and where the novelty lies.

**Karl Popper (1934, _Logik der Forschung_):** Popper proposed that scientific claims are distinguishable from non-scientific ones by their falsifiability — a claim is scientific if it can, in principle, be demonstrated false. The TIC schema is compatible with and inspired by this tradition. It is not the same thing: Popper provided a criterion; the TIC provides a data structure and a populated record.

**Alchourrón-Gärdenfors-Makinson (AGM) Belief Revision (1985):** AGM formalized how a rational agent should update a belief set when given new information that contradicts existing beliefs. The three classic AGM operators (expansion, contraction, revision) are the theoretical ancestors of Loop 12's dependency propagation. The TIC is not a formal AGM system, but Loop 12's design is compatible with AGM rationality postulates.

**OWL/RDF Ontology and Semantic Web (W3C, 2004+):** The semantic web project built machine-readable dependency graphs for claims and concepts. The TIC's DEPENDENCIES_UPSTREAM and APPLICATIONS_DOWNSTREAM fields serve a similar function. The difference: OWL/RDF tracks taxonomic and property relationships; the TIC tracks *epistemic status* relationships — specifically, which claims are known, which are open, and which are eliminated.

**Ioannidis (2005), "Why Most Published Research Findings Are False":** Ioannidis demonstrated mathematically that in fields with low prior probability of a hypothesis being true, combined with publication bias and low statistical power, the majority of statistically significant results in the literature are false positives. This paper is the canonical description of what happens when you have no ELIMINATED category enforced by structure — the false claims accumulate because there is no paid, structured mechanism to eliminate them.

**Bug bounty programs (Mozilla 2004, Google Project Zero 2014, HackerOne 2012+):** Bug bounty programs pay adversarial security researchers to find and demonstrate vulnerabilities in software. This is the closest prior art to the Code Breakers Guild: it pays specifically for *falsification* (demonstrating that a security claim is false) rather than for confirmation. The novelty of the Code Breakers Guild relative to bug bounties: it applies this mechanism to *epistemic claims* (facts, theories, models) rather than software vulnerabilities, and it integrates the economic mechanism into a cooperative rather than a corporate vendor relationship.

**The novelty of the TIC + Code Breakers system:** The combination of:
1. A structured five-field schema that carries ELIMINATED alongside KNOWN and OPEN
2. A verification loop architecture (Loops 10/11/12) that propagates updates through dependency graphs
3. A cooperative economic mechanism that pays specifically for elimination work (elimination-Marks)
4. A guild structure with advancement tiers that honors failed attacks (Refiner of Gold)

...is, to our knowledge, original. The parts have predecessors; the whole is new.

---

## 7. Worked Example: Gravity, Full TIC

See the gravity TIC record in Section 2 above for the full five-field example. To see Loops 10/11/12 in action on that record, see the loop examples in Section 3.

The key observation from the gravity example: the ELIMINATED field already exists for gravity in informal scientific consensus. No working physicist treats "gravity as contact force only" as an open theory. But that elimination is not *recorded* anywhere in a machine-readable, provenance-carrying format. It lives in textbooks, in oral tradition, in the unstated assumptions of papers. The TIC makes it explicit, timestamped, and cited.

When an AI system has access to a gravity TIC record, it cannot treat "gravity propagates instantaneously" as an open theory — the ELIMINATED field catches it at the schema layer, before the reasoning even begins. This is the structural fix the mother dog needed: a mechanism that says "this path has been ruled out" before you start reasoning down it.

---

## 8. What Comes Next

The Truth Integrity Chain is being integrated into the Liana Banyan substrate as part of the **Substrate Awakens** initiative. The first Bounty Posters — specific claims open for Code Breaker challenge — are on the **Employ the World** page at lianabanyan.com.

The formal patent specification for the TIC + Code Breakers system is being drafted as part of PROV_22 (Provisional Patent Application 22). The full technical specification — including the formal YAML schema, ABNF type system, algorithm pseudocode with complexity analysis, and game-theoretic economic analysis — is in the [L3 Technical paper](/papers/technical/knowing-what-is-not-true.pdf).

Membership in the cooperative that will host the Code Breakers Guild is $5 a year.

---

> *What survives the smashing is Immutable.*
> *Code Breakers smash. Marks pay them.*
> *Gold Refined by Fire.*

**Help each other help ourselves.**

— *Jonathan "G.I." Jones*
Founder · Liana Banyan Corporation
*For the keep.*

---

*Read next: [L3 Technical Paper — Full Formal Specification](/papers/technical/knowing-what-is-not-true.pdf) · [PROV_22 Patent Docket](/patents/prov-22/) · [Substrate Awakens Event](/events/substrate-awakens/)*

*Read first: [L1 Public Version — Shorter Introduction](/papers/knowing-what-is-not-true/l1-public)*
