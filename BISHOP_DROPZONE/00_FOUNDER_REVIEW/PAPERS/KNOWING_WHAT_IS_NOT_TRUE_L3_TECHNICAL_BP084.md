---
title: "Knowing what is NOT true is half the battle"
level: L3-Technical
channel: PROV_22 integration + standalone PDF /papers/technical/knowing-what-is-not-true.pdf
status: founder-ratify-pending
session: BP084
model: Sonnet 4.6
date: 2026-06-16
---

# Knowing what is NOT true is half the battle

## A Formal Technical Specification of the Truth Integrity Chain, Code Breakers Guild, and Gold Refined by Fire Mechanism

> *What survives the smashing is Immutable.*
> *Code Breakers smash. Marks pay them.*
> *Gold Refined by Fire.*

**Canon references:**
- `[[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]]`
- `[[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]]`
- `[[founders-anecdote-africa-mother-dog-bp084]]`
- `[[canon-employ-the-world-bounty-posters-banner-bp084]]`
- `[[feedback-explicit-ratify-before-publish-bp078]]` (BP078 BLOOD — this document is DRAFT, founder-ratify-pending)

*For a general-audience introduction: [L1 Public version](/papers/knowing-what-is-not-true/l1-public). For a builder-level explainer: [L2 Explainer](/papers/knowing-what-is-not-true/).*

---

## Abstract

We present the **Truth Integrity Chain (TIC)**, a five-field structured knowledge record that explicitly separates verified facts (KNOWN), competing uneliminated hypotheses (THEORIES_OPEN), definitively falsified claims (ELIMINATED), upstream epistemic dependencies (DEPENDENCIES_UPSTREAM), and downstream applications (APPLICATIONS_DOWNSTREAM). We further present the **Code Breakers Guild**, a cooperative economic mechanism that compensates members specifically for the labor of falsification — the production of what we term **Negative-Knowledge Tokens** (elimination-Marks, a tagged denomination of the cooperative's Marks currency). We describe three verification loops (Loops 10, 11, and 12 of the Plow protocol) that maintain TIC record consistency dynamically across a connected knowledge graph. We argue that the combination of these elements — a structured ELIMINATED field, a propagating dependency architecture, and a cooperative economic mechanism that prices falsification work at par with affirmation work — represents a novel primitive not subsumed by prior art including Popperian falsificationism, AGM belief revision, OWL/RDF ontological dependency tracking, or existing bug-bounty programs. The system's formal patent specification is being prepared as part of Provisional Patent Application 22 (PROV_22) filed under the Liana Banyan Corporation patent program.

---

## 1. Introduction

### 1.1 The Founder Anecdotes

#### 1.1.1 The Africa Anecdote

When I was 3 years old, I was attacked by a dog in Africa. My parents were missionaries and Africa was home for a season. The dog was a mother protecting her puppies. She had no information suggesting I was safe. She had every instinct suggesting I was a threat: a small unfamiliar creature moving toward what she had to protect. Her reasoning was valid. Her conclusion was wrong.

The mother dog was a perfect Bayesian reasoner operating on an incomplete hypothesis space. She could assign probabilities to "this creature is a threat" versus "this creature is safe" based on available evidence. But she had no mechanism for the category that mattered: "this specific creature has been confirmed safe by prior verified observation." She had no ELIMINATED field. The proposition "this toddler is not a threat" was not in her hypothesis space — not because she had considered and rejected it, but because she had no structural capacity to represent it.

This is not a behavioral failure. It is an epistemic architecture failure. She was doing everything right within the limits of her representational capacity. What she lacked was a structural way to carry "what is NOT true" as first-class data.

The mother dog represents every reasoning system — biological or computational — that carries KNOWN and THEORIES_OPEN but not ELIMINATED. From her perspective, the hypothesis space was: {threat, uncertain}. She had no {confirmed-safe} bucket. So she defaulted to threat-mitigation behavior, which was locally optimal given her available hypothesis space.

#### 1.1.2 The Bob-Is-a-Dog Formalization

The same structural failure appears in formal deductive reasoning. Consider the following argument:

> **P1:** All dogs with nursing puppies respond aggressively to perceived threats.
> **P2:** Bob is a dog with nursing puppies.
> **C:** Bob will respond aggressively to perceived threats.

This argument is formally *valid* — the conclusion follows necessarily from the premises by modus ponens. If both premises are true, the conclusion must be true. The argument is also *sound* if and only if both premises are empirically true.

The epistemic failure occurs when P2 ("Bob is a dog with nursing puppies") is treated as KNOWN without verification. If P2 is UNTESTED — if no one has checked whether Bob is actually a dog with nursing puppies — then the entire deductive chain is load-bearing on an unverified foundation. The conclusion may be false not because the reasoning was invalid but because a premise was false, and that falsity was invisible because no one had populated the ELIMINATED field with "Bob is not a dog" after investigation.

Current AI systems handle this by assigning P2 a confidence score based on training data. But a confidence score is not equivalent to a verified-false record. "P2 has been investigated and found false in 40 independent tests" is qualitatively different from "P2 has a confidence score of 0.3." The first is ELIMINATED. The second is a low-confidence THEORIES_OPEN item. The systems that conflate these two cases will reach different — and structurally worse — conclusions.

#### 1.1.3 The Crayon-Color Observational Trap

A third illustrative case: a child asserts "all crayons are red" after drawing with a box of red crayons. The claim is false, but her Bayesian update is locally consistent — she has observed N red crayons in succession, she has not observed a non-red crayon, and her confidence in "all crayons are red" rises with each red crayon she draws with.

The failure is not in her Bayesian updating. The failure is the absence of a counter-evidence search protocol. If the system asked "have you searched for counter-examples to this universal claim?" before writing it into KNOWN, the child would have to answer "no." The hasty-generalization guard would catch this claim at the schema boundary and require a counter-evidence search before promotion.

This third anecdote illustrates the Hasty-Generalization Guard specification in Section 5.3: universal quantifiers require both a minimum sample size and a documented counter-evidence search before they may enter the KNOWN field.

### 1.2 The Formal Problem Statement

Let K be a knowledge base, where each element k ∈ K is a claim with an associated truth status. Current AI and database systems typically represent this as:

> k = ⟨claim_text, confidence_score, source_list⟩

We propose that this representation is structurally insufficient for knowledge systems that must be epistemically honest. The correct representation requires:

> k = ⟨claim_text, KNOWN, THEORIES_OPEN, ELIMINATED, DEPENDENCIES_UPSTREAM, APPLICATIONS_DOWNSTREAM⟩

The critical addition is ELIMINATED: the set of claims that have been tested and found false. A knowledge base that can only grow (by adding new claims) and not prune (by recording eliminations) will accumulate false theories in proportion to the number of unchallenged hypotheses in THEORIES_OPEN.

We call this accumulation failure the **Bayesian Dead Weight Problem**: hypotheses that should have been eliminated continue to consume probability mass in the THEORIES_OPEN space because the ELIMINATED category does not exist or is not populated. The result is a reasoning system that spreads its uncertainty evenly across hypotheses that include theories already definitively falsified — equivalent to a detective who considers "the butler did it" an equally live hypothesis even after confirming the butler was in New York on the night of the crime.

---

## 2. Prior Art Review

### 2.1 Popperian Falsificationism (1934)

Karl Popper, in *Logik der Forschung* (1934, translated as *The Logic of Scientific Discovery*, 1959), proposed that scientific claims are distinguished from non-scientific ones by their falsifiability: a claim is scientific if and only if it can, in principle, be demonstrated false by empirical observation. Popper's criterion is a *demarcation criterion*, not a data structure. It tells you what kind of claims belong in science; it does not tell you how to represent the state of those claims in a machine-readable format or how to propagate updates through a dependency graph.

The TIC ELIMINATED field is Popperian in spirit — it encodes the result of falsification attempts — but goes beyond Popper in three ways:
1. It provides a formal five-field schema that can be implemented in a database
2. It connects ELIMINATED records to THEORIES_OPEN (before elimination) and to DEPENDENCIES_UPSTREAM/APPLICATIONS_DOWNSTREAM (for propagation)
3. It provides an economic mechanism for incentivizing falsification attempts (Code Breakers Guild)

Popper did not address the economic incentive problem. The TIC system's claim to novelty is primarily in the economic layer and the dependency propagation architecture.

### 2.2 AGM Belief Revision (1985)

Alchourrón, Gärdenfors, and Makinson ("On the Logic of Theory Change: Partial Meet Contraction and Revision Functions," *Journal of Symbolic Logic*, 1985) formalized how a rational agent should update a belief set K when presented with new information φ that contradicts K. The AGM framework defines three operations:

- **Expansion K+φ**: adding φ to K when φ is consistent with K
- **Contraction K−φ**: removing φ from K (and all beliefs that logically entail φ)
- **Revision K*φ**: adding φ to K when φ is inconsistent with K (requires contraction followed by expansion)

The AGM rationality postulates constrain which belief revision functions are acceptable. The TIC's Loop 12 (Sentinel) is functionally analogous to AGM contraction applied to a dependency-structured knowledge base: when a KNOWN item is updated or eliminated, Loop 12 performs the equivalent of contraction on all APPLICATIONS_DOWNSTREAM that logically entailed the updated item.

The TIC system is not a formal implementation of AGM. AGM operates over arbitrary belief sets with no schema; the TIC operates over a structured five-field schema. The dependency structure (DEPENDENCIES_UPSTREAM, APPLICATIONS_DOWNSTREAM) provides explicit direction for propagation that AGM's abstract framework leaves unspecified.

### 2.3 Ontological Dependency Tracking: OWL/RDF (W3C, 2004+)

The Web Ontology Language (OWL) and Resource Description Framework (RDF) provide machine-readable representations of concepts and their relationships. These systems can encode "A depends on B" in the form of class hierarchies, property chains, and domain/range restrictions.

The TIC's DEPENDENCIES_UPSTREAM and APPLICATIONS_DOWNSTREAM fields serve a related function but differ in two critical ways:
1. **Epistemic status as first-class data**: OWL/RDF encodes structural relationships; the TIC encodes *epistemic status relationships* — which claims have been verified, which are open, which are eliminated, and what depends on which
2. **Update semantics**: OWL reasoners can infer new facts from ontology assertions but do not have native mechanisms for propagating *epistemic status changes* (e.g., when a foundational claim moves from KNOWN to ELIMINATED, OWL has no built-in mechanism to re-evaluate downstream claims)

The TIC's Loop 12 fills the gap that OWL/RDF leaves open in epistemic update propagation.

### 2.4 Ioannidis (2005) and the Replication Crisis

Ioannidis's "Why Most Published Research Findings Are False" (*PLOS Medicine*, 2005) demonstrated that in many fields, given realistic prior probability distributions and publication bias, the majority of statistically significant published findings are false positives. The mathematical core of Ioannidis's argument:

Let R = prior odds of a true hypothesis, α = false positive rate, β = false negative rate, and u = bias factor. Then the Positive Predictive Value (PPV) of a research finding is:

> PPV = (1 - β) · R / [(1 - β) · R + α · (1 + u - u · R · β)]

When R is low (most investigated hypotheses are false) and α is high (thresholds like p < 0.05 are used) and u is high (publication bias toward significant results), PPV falls below 0.5 — meaning most published significant findings are false.

This is the quantitative case for the necessity of the ELIMINATED field: in a world where most published claims are false positives, we desperately need structured, institutionalized mechanisms for eliminating false claims. Ioannidis describes the problem; the TIC + Code Breakers Guild proposes a structural solution.

### 2.5 Bug Bounty Programs (2004+)

Mozilla launched the first major corporate bug bounty program in 2004, offering payment for identified security vulnerabilities. Google Project Zero (2014) and HackerOne (2012) extended this model. Bug bounties pay specifically for *falsification* — demonstrating that a security claim ("this system is secure against X") is false — rather than for confirmation.

The Code Breakers Guild is structurally analogous to a bug bounty program extended to epistemic claims. The key differences:
1. **Domain**: bug bounties apply to software vulnerabilities; Code Breakers apply to factual claims, theories, and models
2. **Cooperative structure**: bug bounties are vendor-specific; Code Breakers operate within a cooperative commons
3. **Negative-Knowledge Tokens**: bug bounties pay in fiat currency; Code Breakers earn elimination-Marks, a tagged denomination of the cooperative Marks currency that is tracked separately from confirmation-Marks and that cannot be converted to fiat
4. **Tier progression and Guild membership**: bug bounties have no advancement structure; the Code Breakers Guild has a four-tier member advancement system with the Refiner of Gold honor

---

## 3. Novelty Statement

The TIC + Code Breakers system makes four load-bearing claims of novelty that are not subsumed by the prior art:

**Claim 1 (Structural):** A five-field epistemic status schema (KNOWN, THEORIES_OPEN, ELIMINATED, DEPENDENCIES_UPSTREAM, APPLICATIONS_DOWNSTREAM) as a first-class data structure for knowledge records, where ELIMINATED is populated through a verifiable, attributable process and not merely inferred from absence.

**Claim 2 (Algorithmic):** Three verification loops (Psionic, Auditor, Sentinel) that maintain consistency across a dependency-structured knowledge graph when any field is updated, with bounded depth to prevent runaway propagation.

**Claim 3 (Economic):** A cooperative economic mechanism that prices falsification work (elimination-Marks) at par with affirmation work (confirmation-Marks), using a tagged-denomination model within an existing multi-currency system, such that elimination work is compensated at a rate that makes sustained professional falsification activity economically viable.

**Claim 4 (Institutional):** A guild structure with a formal tier-progression system that honors the hardest failed attacks (Refiner of Gold) — inverting the perverse incentive of unpaid anonymous peer review — and a reversal-of-immutable process that requires both new evidence and majority institutional vote, creating a reversible but high-bar immutability designation.

---

## 4. System Architecture

### 4.1 Overview

```
┌────────────────────────────────────────────────────────┐
│                  TRUTH INTEGRITY CHAIN                  │
│                                                        │
│  ┌──────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │  KNOWN   │  │ THEORIES_OPEN  │  │  ELIMINATED   │  │
│  │ (verified│  │  (uneliminated │  │ (falsified,   │  │
│  │  facts)  │  │  hypotheses)   │  │  attributed)  │  │
│  └──────────┘  └────────────────┘  └───────────────┘  │
│         │               │                  │           │
│         └───────────────┴──────────────────┘           │
│                         │                              │
│         ┌───────────────┴────────────────┐             │
│         │                                │             │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │ DEPENDENCIES_    │    │  APPLICATIONS_DOWNSTREAM │  │
│  │ UPSTREAM         │    │  (claims that use this   │  │
│  │ (claims this one │    │   one as a foundation)   │  │
│  │  depends on)     │    │                          │  │
│  └──────────────────┘    └──────────────────────────┘  │
└────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
  [LOOP 12: propagate           [LOOP 12: propagate
   upstream updates]             downstream updates]
         
         │
  [LOOP 10: trace consequences of THEORIES_OPEN entries]
  [LOOP 11: verify elimination candidates]
```

---

## 5. Full TIC Schema Formal Specification

### 5.1 YAML Schema Definition

```yaml
# Truth Integrity Chain Record — Formal Schema v1.0
# Canon: [[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]]

TIC_Record:
  type: object
  required:
    - claim_id
    - claim_text
    - claim_status
    - KNOWN
    - THEORIES_OPEN
    - ELIMINATED
    - DEPENDENCIES_UPSTREAM
    - APPLICATIONS_DOWNSTREAM
    - provenance
    - hasty_generalization_guard
  
  properties:
    claim_id:
      type: string
      pattern: "^[A-Z]{1,4}-[0-9]{3,6}$"
      description: "Unique identifier. Domain prefix + numeric ID. E.g., G-001, MED-042."
    
    claim_text:
      type: string
      minLength: 10
      maxLength: 2000
      description: "The claim being tracked. Plain English. Falsifiable."
    
    claim_status:
      type: string
      enum: [UNTESTED, TESTED, FORGED, GOLD_REFINED_BY_FIRE]
      description: "Current certification tier."
    
    KNOWN:
      type: array
      items:
        type: object
        required: [statement, evidence_refs, confidence_type]
        properties:
          statement:
            type: string
          evidence_refs:
            type: array
            items: {type: string}
            description: "Citation keys or TIC claim IDs"
          confidence_type:
            type: string
            enum: [empirical, mathematical, logical, consensus]
          quantifier_type:
            type: string
            enum: [existential, universal, particular, null]
            description: "If universal, hasty_generalization_guard MUST pass"
    
    THEORIES_OPEN:
      type: array
      items:
        type: object
        required: [theory_id, theory_text, status]
        properties:
          theory_id:
            type: string
            pattern: "^T-[0-9]{3,6}$"
          theory_text:
            type: string
          status:
            type: string
            enum: [untested, partially_tested, extensively_tested_surviving]
          challenge_count:
            type: integer
            minimum: 0
          last_challenge_date:
            type: string
            format: date-time
    
    ELIMINATED:
      type: array
      items:
        type: object
        required: [eliminated_claim, elimination_evidence, eliminator_id, timestamp, loop_11_record]
        properties:
          eliminated_claim:
            type: string
          elimination_evidence:
            type: string
          eliminator_id:
            type: string
            description: "Code Breaker member ID who submitted the elimination"
          timestamp:
            type: string
            format: date-time
          loop_11_record:
            type: string
            description: "Reference to Loop 11 verification record"
          elimination_marks_issued:
            type: number
            description: "Marks issued to eliminator_id for this work"
    
    DEPENDENCIES_UPSTREAM:
      type: array
      items:
        type: object
        required: [claim_ref, dependency_type]
        properties:
          claim_ref:
            type: string
            description: "TIC claim_id of the upstream dependency"
          dependency_type:
            type: string
            enum: [foundational, evidential, methodological, contextual]
          load_bearing:
            type: boolean
            description: "If true, elimination of upstream claim triggers re-evaluation of this claim"
    
    APPLICATIONS_DOWNSTREAM:
      type: array
      items:
        type: object
        required: [claim_ref, application_type]
        properties:
          claim_ref:
            type: string
          application_type:
            type: string
            enum: [depends_on, is_confirmed_by, is_applied_in, is_predicted_by]
          propagation_priority:
            type: integer
            minimum: 1
            maximum: 5
            description: "Priority for Loop 12 propagation. 1=highest."
    
    provenance:
      type: object
      required: [submitter_id, submission_timestamp, last_updated]
      properties:
        submitter_id: {type: string}
        submission_timestamp: {type: string, format: date-time}
        last_updated: {type: string, format: date-time}
        version: {type: integer, minimum: 1}
        sha256: {type: string}
    
    hasty_generalization_guard:
      type: object
      description: "Required for any KNOWN item with quantifier_type: universal"
      properties:
        universal_claims_present:
          type: boolean
        sample_size:
          type: integer
          description: "Number of independent observations supporting the universal claim"
        sample_size_threshold:
          type: integer
          description: "Domain-specific minimum. Set by Guild for each domain."
        counter_evidence_search_performed:
          type: boolean
        counter_evidence_search_date:
          type: string
          format: date-time
        counter_evidence_found:
          type: boolean
        guard_passed:
          type: boolean
          description: "True iff sample_size >= threshold AND counter_evidence_search_performed = true"
```

### 5.2 Type System and Consistency Invariants

**Invariant 1 (Disjointness):** No claim text may appear in both KNOWN and THEORIES_OPEN, or in both THEORIES_OPEN and ELIMINATED, or in both KNOWN and ELIMINATED. The three sets are mutually exclusive.

**Invariant 2 (ELIMINATED provenance):** Every item in ELIMINATED must carry a loop_11_record reference that can be resolved to a Loop 11 verification record. Bare assertions in ELIMINATED without provenance are schema violations.

**Invariant 3 (Upstream load-bearing):** If any item in DEPENDENCIES_UPSTREAM has load_bearing: true and that upstream claim is in ELIMINATED, then this TIC record's KNOWN field must be empty or marked for re-evaluation, and its claim_status must be UNTESTED or THEORIES_OPEN (not TESTED, FORGED, or GOLD_REFINED_BY_FIRE).

**Invariant 4 (Hasty generalization):** Any item in KNOWN with quantifier_type: universal must have hasty_generalization_guard.guard_passed: true. A KNOWN item with a universal quantifier and guard_passed: false is a schema violation.

**Invariant 5 (Claim status consistency):** claim_status: TESTED requires at minimum 20 Loop 11 records in ELIMINATED (challenges attempted and either succeeded or failed). claim_status: FORGED requires 10 high-quality challenges documented. claim_status: GOLD_REFINED_BY_FIRE requires a Guild majority vote record.

---

## 6. Algorithm Specification: Loops 10, 11, and 12

### 6.1 Loop 10: Psionic

**Purpose:** When a new theory T is added to THEORIES_OPEN, trace its logical consequences and check for contradictions with KNOWN or ELIMINATED.

**Preconditions:** T is a formally expressible theory (not just a vague conjecture). A consequence derivation function `derive_consequences(T, depth)` is available (domain-specific, may use symbolic reasoning or LLM-assisted derivation with human verification).

**Pseudocode:**

```
FUNCTION loop_10_Psionic(
    tic_record R,
    theory T,
    depth_limit N,
    current_depth D = 0
) → Psionic_result:

  IF D > N:
    RETURN {status: "depth_limit_reached", consequences_traced: []}
  
  consequences ← derive_consequences(T)
  flagged_contradictions ← []
  traced_consequences ← []
  
  FOR EACH consequence C IN consequences:
    
    // Check against KNOWN
    FOR EACH known_item K IN R.KNOWN:
      IF formally_contradicts(C, K):
        flagged_contradictions.append({
          consequence: C,
          contradicted_known: K,
          contradiction_type: "C_contradicts_KNOWN"
        })
    
    // Check against ELIMINATED
    FOR EACH eliminated_item E IN R.ELIMINATED:
      IF formally_equivalent(C, E.eliminated_claim):
        flagged_contradictions.append({
          consequence: C,
          matched_eliminated: E,
          contradiction_type: "C_matches_ELIMINATED"
        })
    
    traced_consequences.append(C)
    
    // Recurse
    sub_result ← loop_10_Psionic(R, C, N, D + 1)
    traced_consequences.extend(sub_result.consequences_traced)
    flagged_contradictions.extend(sub_result.flagged_contradictions)
  
  IF LENGTH(flagged_contradictions) > 0:
    ESCALATE to loop_11_Auditor(
      tic_record = R,
      theory = T,
      trigger = "loop_10_contradiction",
      evidence = flagged_contradictions[0]  // escalate on first contradiction
    )
  
  RETURN {
    status: "complete",
    consequences_traced: traced_consequences,
    flagged_contradictions: flagged_contradictions,
    escalated_to_loop_11: LENGTH(flagged_contradictions) > 0
  }
```

**Complexity:** O(B^N) where B is the average branching factor of consequence derivation and N is the depth limit. In practice, N ≤ 4 for most domains, keeping complexity bounded. The `formally_contradicts` function is the computational bottleneck; its complexity depends on domain (polynomial for propositional logic, potentially undecidable for first-order logic — in practice, bounded by timeout).

**Domain depth limits (recommended):**

| Domain | Recommended N | Rationale |
|--------|---------------|-----------|
| Physical sciences | 4 | Long consequence chains are meaningful and worth tracing |
| Social science claims | 2 | Long causal chains are speculative; shorten to reduce false escalations |
| Mathematical theorems | 6 | Formal consequences are tractable to deeper levels |
| Medical/clinical | 3 | Balance between rigor and practicality for clinical evidence chains |
| Historical/interpretive | 1 | Causal consequences of historical claims are too uncertain for deep tracing |

### 6.2 Loop 11: Auditor

**Purpose:** Formally verify whether a proposed elimination is valid — whether the challenge evidence E formally contradicts theory T.

**Preconditions:** Either Loop 10 escalated to Loop 11, or a Code Breaker has manually submitted a challenge.

**Pseudocode:**

```
FUNCTION loop_11_Auditor(
    tic_record R,
    theory T,
    challenge_evidence E,
    submitter_id S,
    trigger: string  // "loop_10_contradiction" | "code_breaker_challenge"
) → elimination_result:

  // Step 1: Novelty check — is E already in ELIMINATED or KNOWN?
  IF E.claim_text IN [item.eliminated_claim FOR item IN R.ELIMINATED]:
    RETURN {status: "rejected", reason: "evidence_already_recorded"}
  
  IF E.claim_text IN [item.statement FOR item IN R.KNOWN]:
    RETURN {status: "accepted_as_known", reason: "consistent_with_existing_known",
            marks_type: "confirmation", marks_amount: CONFIRMATION_RATE}
  
  // Step 2: Independence check — is E logically derived from T itself?
  IF logically_derived_from(E, T):
    RETURN {status: "rejected", reason: "evidence_derived_from_theory"}
  
  // Step 3: Formal contradiction check
  contradiction_result ← formally_contradicts(E, T)
  
  IF contradiction_result.contradicts:
    // Eliminate T
    elimination_record ← {
      eliminated_claim: T.theory_text,
      elimination_evidence: E.claim_text,
      eliminator_id: S,
      timestamp: NOW(),
      loop_11_record: generate_record_id(),
      elimination_marks_issued: ELIMINATION_RATE,
      formal_contradiction_type: contradiction_result.type
    }
    
    R.ELIMINATED.append(elimination_record)
    R.THEORIES_OPEN.remove(T)
    
    // Issue elimination-Marks to submitter
    issue_elimination_marks(
      recipient: S,
      amount: ELIMINATION_RATE,
      source_record: elimination_record.loop_11_record,
      denomination: "negative-knowledge"
    )
    
    // Trigger Loop 12 on downstream applications
    loop_12_Sentinel(R, T, change_type: "theory_eliminated")
    
    RETURN {
      status: "eliminated",
      elimination_record: elimination_record,
      marks_issued: ELIMINATION_RATE
    }
  
  ELSE:
    // T survived this challenge
    T.challenge_count += 1
    T.last_challenge_date = NOW()
    
    // Record challenge attempt (not an elimination)
    R.KNOWN.append({
      statement: E.claim_text,
      evidence_refs: [S + ":" + NOW()],
      confidence_type: "empirical",
      quantifier_type: "particular",
      notes: "Consistent with T — challenge did not eliminate"
    })
    
    // Check advancement criteria
    check_tier_advancement(R, T)
    
    RETURN {
      status: "survived",
      challenge_count: T.challenge_count,
      notes: "E is consistent with T — T survives this challenge"
    }
```

**The formally_contradicts function:** This is domain-specific and is the hardest computational problem in the system. For the prototype:
- Simple logical negation: `formally_contradicts("X propagates at c", "X propagates faster than c")` = true, detected syntactically
- Experimental contradiction: detected by comparing quantitative claims against experimental bounds
- Requires human verification for complex cases — Loop 11 returns `{status: "requires_human_review"}` when automated contradiction detection fails

### 6.3 Loop 12: Sentinel

**Purpose:** When a claim's status changes, propagate the update to all dependent claims (both upstream and downstream).

**Pseudocode:**

```
FUNCTION loop_12_Sentinel(
    tic_record R,
    claim C,
    change_type: enum {ELIMINATED, STRENGTHENED, WEAKENED, PROMOTED},
    propagation_path: list = []  // for cycle detection
) → propagation_result:

  // Cycle detection
  IF C.claim_id IN propagation_path:
    RETURN {status: "cycle_detected", terminated_at: C.claim_id}
  
  propagation_path.append(C.claim_id)
  affected_claims ← []
  
  IF change_type == ELIMINATED:
    // Propagate to APPLICATIONS_DOWNSTREAM
    FOR EACH downstream D IN R.APPLICATIONS_DOWNSTREAM:
      downstream_record ← fetch_tic_record(D.claim_ref)
      
      // Find this claim in D's DEPENDENCIES_UPSTREAM
      dep ← find_dependency(downstream_record, C.claim_id)
      
      IF dep.load_bearing == true:
        // Re-evaluate downstream claim
        IF downstream_record.claim_status IN [TESTED, FORGED, GOLD_REFINED_BY_FIRE]:
          downgrade_status(downstream_record, to: UNTESTED)
          downstream_record.KNOWN.move_to_re_evaluation_queue()
          affected_claims.append({
            claim_id: D.claim_ref,
            action: "downgraded_to_UNTESTED",
            reason: "load_bearing_upstream_eliminated"
          })
        
        // Recurse
        sub_result ← loop_12_Sentinel(
          downstream_record, C, ELIMINATED, propagation_path)
        affected_claims.extend(sub_result.affected_claims)
      
      ELSE:
        // Non-load-bearing: log the change, don't downgrade
        log_dependency_update(downstream_record, C.claim_id, ELIMINATED)
  
  ELIF change_type == STRENGTHENED:
    // Propagate informational update to downstream
    FOR EACH downstream D IN R.APPLICATIONS_DOWNSTREAM:
      IF D.propagation_priority <= 3:  // only high-priority propagations
        downstream_record ← fetch_tic_record(D.claim_ref)
        update_metadata(downstream_record, C.claim_id, STRENGTHENED)
        affected_claims.append({claim_id: D.claim_ref, action: "metadata_updated"})
  
  ELIF change_type == PROMOTED:
    // A THEORIES_OPEN item achieved GOLD_REFINED_BY_FIRE
    // Propagate confidence update informational pass
    FOR EACH downstream D IN R.APPLICATIONS_DOWNSTREAM:
      downstream_record ← fetch_tic_record(D.claim_ref)
      update_metadata(downstream_record, C.claim_id, PROMOTED)
  
  RETURN {
    status: "complete",
    affected_claims: affected_claims,
    propagation_path: propagation_path
  }
```

**Complexity:** O(D · E) where D is the depth of the dependency graph and E is the number of edges at each level. For typical knowledge graphs with sparse connectivity, this is manageable. Cycle detection (via propagation_path) prevents infinite loops in graphs with circular dependencies, which may legitimately exist (e.g., two theories each citing the other as support).

---

## 7. Code Breakers Guild Mechanism

### 7.1 Four-Tier Claim Certification

| Tier | Label | Advancement Criteria | Reversal Possible? |
|------|-------|---------------------|-------------------|
| 0 | UNTESTED | Claim submitted, schema valid | Yes (trivially) |
| 1 | TESTED | K ≥ 20 independent Loop 11 challenge records; ≥ 3 distinct Code Breaker member tiers participated; no successful elimination | Yes (new elimination) |
| 2 | FORGED | M ≥ 10 Master-tier-or-above challenge records; 90-day continuous hold period without successful elimination | Yes (new elimination) |
| 3 | GOLD_REFINED_BY_FIRE | Passed all Forged criteria; Guild majority vote on immutability; formal seal with timestamp and signing roster | Yes (high-bar reversal process only) |

**Advancement formula for TESTED:**

> `TESTED_eligible(claim C) ↔ |Loop11_records(C)| ≥ 20 ∧ |distinct_tier_levels(C)| ≥ 3 ∧ |successful_eliminations(C)| = 0`

**Advancement formula for FORGED:**

> `FORGED_eligible(claim C) ↔ TESTED(C) ∧ |Master_or_above_challenges(C)| ≥ 10 ∧ days_since_last_successful_elimination(C) ≥ 90`

### 7.2 Code Breaker Member Tier Progression

| Member Tier | Label | Criteria |
|-------------|-------|----------|
| Probationer | (pre-Initiate) | Applied, not yet first success |
| Initiate | — | 1 successful elimination (Loop 11 status: eliminated) |
| Journeyman | — | 10 successful eliminations |
| Master | — | 100 successful eliminations + 10 that pushed a claim to Forged tier |
| **Refiner of Gold** | *Highest honor* | 10 honorable failures on claims that subsequently achieved GOLD_REFINED_BY_FIRE |

**The Refiner of Gold honor** is the institutional inversion at the heart of the system. A Code Breaker who achieves this honor has:
1. Submitted 10 or more challenges against claims that were at the time THEORIES_OPEN or TESTED
2. Had each challenge evaluated by Loop 11 and found not to be a formal contradiction
3. Seen each of those challenged claims subsequently achieve GOLD_REFINED_BY_FIRE status

In other words: they tried their hardest to break things, and their failure to break them is what established those things as unbreakable. Their honorable failures are load-bearing. The smashing that didn't work is what made the gold.

This inverts the incentive structure of traditional peer review:
- In traditional peer review: a reviewer who confirms a popular theory publishes quickly, earns citation credit, and advances their career
- In the Code Breakers Guild: a member who tries hardest to falsify a theory that turns out to be correct earns the highest honor
- In traditional peer review: a reviewer who rejects a correct but unpopular paper is invisible and unaccountable
- In the Code Breakers Guild: every challenge is attributed, timestamped, and entered in the provenance record

### 7.3 Reversal-of-Immutable Process

GOLD_REFINED_BY_FIRE is high-bar reversible, not permanent. The reversal process requires both conditions simultaneously:

**Condition A (Evidential):** New empirical data that was structurally unavailable during prior fire-rounds. "Structurally unavailable" means: the technology, instrument, or experimental method needed to obtain the evidence did not exist, or the sample/population being measured was inaccessible, during the period when the claim's Forged and immutability challenges were conducted.

*Not sufficient:* New researchers who find the prior evidence unpersuasive. The standard is structural unavailability, not interpretive disagreement.

**Condition B (Institutional):** Guild majority vote on admissibility of the proposed reversal. The vote is on two questions:
1. Does the new evidence meet the "structurally unavailable during prior rounds" standard?
2. Does the new evidence formally contradict the immutable claim?

Both must pass. A 51% majority is insufficient for immutable reversals; the quorum threshold is 67% of active Guild members (Master tier and above).

**Reversal record format:**

```yaml
reversal_record:
  reversed_claim_id: "G-001"
  reversal_date: "YYYY-MM-DDTHH:MM:SSZ"
  reversal_evidence: "description of new evidence"
  evidence_structural_unavailability_argument: "why this evidence was unavailable earlier"
  guild_vote_date: "YYYY-MM-DDTHH:MM:SSZ"
  guild_vote_result: {yes: N, no: M, quorum: "67% of active Master+ members"}
  prior_immutable_from: "date claim achieved GOLD_REFINED_BY_FIRE"
  prior_immutable_until: "date of reversal"
  notes: "Historical record preserved. Reversal is not erasure."
```

The claim's history is preserved entirely. The reversal adds a new entry; it does not overwrite the prior record.

---

## 8. Economic Specification: Negative-Knowledge Tokens

### 8.1 Three-Currency Canon Compliance

The Liana Banyan cooperative operates on a three-currency system: **Credits** (service exchange), **Marks** (contribution recognition), and **Joules** (computational/energy allocation). This is a Structural Bylaw. No new currency is created by the TIC system.

Elimination-Marks are a **tagged denomination of Marks** — not a fourth currency. The denomination tag (`denomination: negative-knowledge`) is a metadata field on a Mark record. All Mark operations (issuance, redemption, aggregation, reporting) function identically for elimination-Marks as for standard Marks. The tag enables separate tracking and reporting without creating a new currency object.

```yaml
mark_record:
  type: object
  properties:
    mark_id: {type: string}
    recipient_id: {type: string}
    amount: {type: number}
    denomination:
      type: string
      enum: [standard, negative-knowledge]
      description: "standard = confirmation-Mark; negative-knowledge = elimination-Mark"
    source_activity:
      type: string
      enum: [content_contribution, service_completion, claim_submission,
             claim_elimination, challenge_survived_by_claim]
    redemption_multiplier:
      type: number
      description: "1.0 for all denominations — elimination-Marks redeem at par with confirmation-Marks"
    issued_at: {type: string, format: date-time}
    expires_at: {type: string, format: date-time, nullable: true}
    loop_11_record_ref: {type: string, description: "Required for negative-knowledge denomination"}
```

### 8.2 Economic Rationale

Why price elimination-Marks at the same rate as confirmation-Marks?

Consider the alternative: if elimination-Marks redeemed at a lower rate, rational members would preferentially pursue confirmation activities. The ELIMINATED field would remain underpopulated, and the Bayesian Dead Weight Problem would persist.

If elimination-Marks redeemed at a higher rate, rational members might bring spurious challenges to earn inflated Marks. The Guild tier-progression system mitigates this (only verified Loop 11 eliminations earn marks), but rate inflation still creates perverse incentives.

Par redemption (1.0x multiplier) is the game-theoretically neutral choice: it makes a member indifferent between confirmation and elimination activities on purely economic grounds, allowing genuine intellectual preference and opportunity to determine which activity they pursue.

### 8.3 Game-Theoretic Analysis

**Agent model:** Each member M maximizes expected Mark income over time horizon T.

**Payoff matrix for member M (simplified):**

| Activity | Expected Marks (per hour) | Variance | Reputation Effect |
|----------|--------------------------|----------|-------------------|
| Content contribution | C_avg | σ_C (high) | Positive (content published) |
| Claim submission | S_avg | σ_S (medium) | Positive if KNOWN |
| Code Breaker challenge | E_avg | σ_E (medium) | Positive if successful; neutral if unsuccessful (honorable failure) |
| Spurious challenge | 0 (rejected) | 0 | Negative (repeated spurious challenges demote tier) |

**Key equilibrium properties:**

1. **No dominant strategy to cheat:** Spurious challenges earn 0 Marks and decrease tier standing. The Loop 11 verification process ensures that only formally valid eliminations earn marks. Rational agents do not submit spurious challenges.

2. **No crowding out:** Because elimination-Marks are priced at par with confirmation-Marks, the introduction of the Code Breakers program does not crowd out other member activities. Members who prefer to write content or submit claims are not penalized.

3. **Honest challenge incentive:** The Refiner of Gold honor creates an additional incentive for careful, honest challenges. A member who submits weak challenges just to accumulate challenge_count will not achieve the high-quality challenge record needed for Master tier. Careful, high-quality challenges — even unsuccessful ones — are more valuable for tier advancement than volume of weak challenges.

4. **Peer review pathology avoided:** In traditional peer review, reviewers are anonymous, unpaid, and face no consequences for sloppy or biased reviews. In the Code Breakers Guild, every challenge is attributed (eliminator_id), has a public outcome record, and carries a reputation effect. The combination of attribution, compensation, and public record eliminates the anonymous-reviewer problem structurally.

**Comparison to academic peer review:**

| Feature | Academic Peer Review | Code Breakers Guild |
|---------|---------------------|---------------------|
| Compensation | None | Elimination-Marks at par |
| Attribution | Anonymous | Attributed (eliminator_id) |
| Incentive for rigorous falsification | Absent | Present (tier advancement + Marks) |
| Accountability for sloppy review | None | Tier demotion for spurious challenges |
| Highest honor | Confirming popular theories | Honorable failure on claims that became immutable (Refiner of Gold) |
| Outcome record | Private (editor only) | Public provenance record |

---

## 9. Worked Examples

### 9.1 Gravity — Full TIC Record

See the gravity TIC record in the L2 Explainer (Section 2). Summary:

- KNOWN (4 items): Newtonian attraction, c-speed propagation (LIGO 2017), pulsar decay precision, ringdown waveform confirmation
- THEORIES_OPEN (12 items): graviton, MOND, emergent gravity, LQG, extra dimensions, f(R), scalar-tensor, conformal, non-commutative, massive gravity, CDT, asymptotic safety
- ELIMINATED (4 items): proximity-only, electromagnetism-as-gravity, aether-mediated, instantaneous action at distance
- DEPENDENCIES_UPSTREAM: Special Relativity, continuous Lorentzian manifold at macroscopic scales
- APPLICATIONS_DOWNSTREAM: orbital mechanics, gravitational wave detector design, black hole shadow predictions, cosmological structure formation

**Loop 10 example:** Theory T = "Massive gravity (graviton has nonzero mass)" → Consequence C = "Gravitational waves should show dispersion (different frequencies travel at different speeds)" → Check against KNOWN: Advanced LIGO observations constrain graviton mass to m_g < 1.76 × 10^-23 eV/c² (Abbott et al., 2017) → partial constraint on T, not elimination (massive gravity is not eliminated, merely constrained). T remains in THEORIES_OPEN with status: extensively_tested_surviving.

**Loop 11 example:** Challenge E = "LIGO 2017 GW170817 detected simultaneous gravitational and electromagnetic signals from neutron star merger, with 1.7s delay over 130 million light years — consistent with c propagation to 1 part in 10^15." T = "Gravity propagates instantaneously." `formally_contradicts(E, T)` = true (E quantitatively establishes c-propagation; T asserts instantaneous propagation). T eliminated. LIGO 2017 added to ELIMINATED provenance.

### 9.2 The Mother Dog — TIC Applied

The mother dog's attack on the Founder as a toddler can be reconstructed as a TIC failure:

```yaml
tic_record (mother_dog_threat_assessment):
  claim_id: "DOG-001"
  claim_text: "This approaching creature is a threat to the puppies."
  claim_status: UNTESTED
  
  KNOWN:
    - statement: "Unknown creatures that approach puppies have in past observations been threats."
      quantifier_type: universal  # PROBLEM: hasty generalization
      evidence_refs: ["prior_experience_x", "prior_experience_y"]
  
  THEORIES_OPEN:
    - theory_id: T-001
      theory_text: "This specific creature is harmless (a child of known missionaries)."
      status: untested  # NEVER TESTED
  
  ELIMINATED: []  # EMPTY — the core failure
  
  hasty_generalization_guard:
    universal_claims_present: true
    sample_size: 3  # Very small
    sample_size_threshold: 30  # Required for behavioral claims
    counter_evidence_search_performed: false  # VIOLATION
    guard_passed: false  # Guard would have blocked the universal KNOWN claim
```

The guard_passed: false condition would have prevented "all approaching creatures are threats" from entering KNOWN as a universal. The ELIMINATED field was empty because no prior creature had been confirmed safe. T-001 was never tested. The attack proceeded from an unguarded hasty generalization.

### 9.3 Modal Logic Example

Consider the claim: "If it is necessary that P, then P." (Modal axiom T: □P → P)

- KNOWN: Axiom T is valid in all major modal logics (S4, S5, KD45, etc.) under standard accessibility relation semantics
- THEORIES_OPEN: Logics without axiom T exist (e.g., some non-normal modal logics); these are legitimate but non-standard
- ELIMINATED: "If it is possibly P, then P" (□P → P requires necessity, not possibility; ◇P → P is not a valid modal axiom in any standard logic)
- Hasty generalization guard: Axiom T is mathematical, not empirical — sample size considerations don't apply; guard_passed: true by mathematical proof

---

## 10. Patent Application Status

The Truth Integrity Chain and Code Breakers Guild mechanisms are being prepared for inclusion in **Provisional Patent Application 22 (PROV_22)** under the Liana Banyan Corporation patent program.

**Reference:** `[[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]]` — primary source eblet for TIC schema patent claims 1-5.

**Reference:** `[[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]]` — primary source eblet for Code Breakers Guild + Negative-Knowledge Tokens patent claims 6-8.

**Claim language (from canon eblet specification, formal patent prose pending counsel review):**

**TIC Claims 1-5 (per `[[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]]` — verbatim from canon):**

> **Claim 1:** A computer-implemented method for representing knowledge claims in a verified-knowledge accumulator, the method comprising: maintaining for each knowledge artifact (eblet) a structured truth-integrity record comprising (a) a known-propositions set; (b) an open-theories set wherein each open theory is associated with a consequence chain of derivable claims; (c) an eliminated-propositions set wherein each eliminated proposition is associated with a contradiction trail referencing observed empirical evidence; (d) upstream-dependency edges referencing prior knowledge artifacts; and (e) downstream-application edges referencing knowledge artifacts that depend on the present artifact.

> **Claim 2:** The method of claim 1, wherein upon update to a known-proposition the system automatically traverses the downstream-application edges and flags each downstream artifact for re-evaluation in a queue accessible to a cooperative network of verification agents.

> **Claim 3:** The method of claim 1, further comprising: a hasty-generalization detection step wherein any universal-quantified claim ("all X are Y") is rejected from the known-propositions set unless accompanied by a declared sample size meeting a configurable adequacy threshold, and a declared counter-evidence search radius.

> **Claim 4:** The method of claim 1, wherein the consequence chain of each open theory is automatically probed by a distributed plow loop that spawns child queries about the consequences and updates a survival score for the theory based on accumulated empirical-consistency evidence.

> **Claim 5:** The method of claim 1, wherein elimination of a theory is logged as a first-class artifact in the verified-knowledge accumulator with associated marks-token reward to the contributing member, such that the cooperative's economic system pays members to demonstrate what is NOT true as well as what IS true.

**Code Breakers Claims 6-8 (per `[[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]]` — verbatim from canon):**

> **Claim 6:** The method of claim 1, further comprising: a guild-member registry wherein members are designated as adversarial verifiers and are compensated with elimination-class tokens for successful falsification of unverified knowledge claims, wherein successful falsification mints a new knowledge artifact recording the contradiction trail.

> **Claim 7:** The method of claim 6, wherein the knowledge accumulator tracks for each claim the number of independent adversarial verifiers that have attempted falsification, the elapsed time, and the cumulative fire-rounds survived; and assigns an immutability status to claims that exceed configurable threshold values on all three dimensions.

> **Claim 8:** The method of claim 6, wherein the highest-reputation tier of adversarial verifier is awarded specifically for unsuccessful falsification attempts against claims that subsequently achieved immutability status, such that the system honors verifiers proportionally to the quality of attacks they brought to claims that nevertheless survived.

*Note: Above claim language is draft for technical description purposes. Patent counsel must finalize formal claim language before PROV_22 filing.*

---

## 11. Implementation Plan

The TIC + Code Breakers infrastructure is referenced in the **Substrate Awakens** initiative. Implementation is deferred until post-Substrate-Awakens timing; the present document and the PROV_22 draft sections establish the architectural and patent specification for that implementation.

**Phase 1 (Pre-Substrate-Awakens):**
- PROV_22 TIC + Code Breakers sections filed with counsel
- Schema formalized in YAML (present document)
- Loop pseudocode reviewed for correctness
- First Bounty Posters published on Employ the World page

**Phase 2 (Substrate-Awakens deployment):**
- TIC schema implemented as Supabase table structure
- Loop 10/11/12 implemented as edge functions
- Code Breaker Guild membership integrated with cooperative member accounts
- Elimination-Mark issuance integrated with Marks ledger
- Dashboard: confirmation vs. elimination ratio per member and aggregate

**Phase 3 (Post-launch):**
- Hasty-Generalization guard threshold tuning per domain
- Guild majority vote infrastructure (for GOLD_REFINED_BY_FIRE advancement)
- PROV_22 claims 1-8 in prosecution

---

## 12. Open Questions and Future Work

1. **Hasty-Generalization guard sample-size threshold tuning:** The threshold for "minimum sample size for a universal claim" is domain-specific and requires empirical calibration. What sample size justifies "all X" in physics vs. medicine vs. social science? This is an open research question; the schema leaves it configurable per claim_type.

2. **`formally_contradicts` function implementation:** The computational core of Loop 11 is the contradiction check. For simple propositional cases, syntactic rules suffice. For complex claims (e.g., "modified Newtonian dynamics is inconsistent with galaxy rotation data"), this requires domain-expert formalization. The system should degrade gracefully to "requires human review" rather than make automated errors.

3. **Circular dependency handling:** Two claims may legitimately cite each other as support. Loop 12 includes cycle detection via propagation_path, but the semantic handling of circular dependencies in a TIC graph is underdeveloped. Future work should formalize an acyclic dependency requirement with explicit exceptions for mutually-supporting claim clusters.

4. **LLM integration for consequence derivation (Loop 10):** The most scalable path for Loop 10's `derive_consequences` function is LLM-assisted derivation with human verification. The reliability, cost, and accuracy trade-offs of this approach require empirical study. The system should never accept LLM-derived consequences without at minimum one human verification pass.

5. **Cross-domain TIC records:** Some claims span domains (e.g., a medical claim that depends on a chemistry claim that depends on a physics claim). The dependency propagation architecture handles this in principle, but the practical infrastructure for cross-domain TIC registries — shared claim_id namespaces, cross-registry Loop 12 triggers — is not yet specified.

6. **GOLD_REFINED_BY_FIRE quorum definition:** The 67% quorum for immutability votes and reversal votes is proposed here. The actual threshold should be established by Guild governance through the cooperative's standard bylaw process.

---

## 13. References

1. Popper, K. R. (1959). *The Logic of Scientific Discovery* (translation of *Logik der Forschung*, 1934). Hutchinson.

2. Alchourrón, C. E., Gärdenfors, P., & Makinson, D. (1985). On the logic of theory change: Partial meet contraction and revision functions. *Journal of Symbolic Logic*, 50(2), 510–530.

3. Tarski, A. (1944). The semantic conception of truth. *Philosophy and Phenomenological Research*, 4(3), 341–376.

4. Quine, W. V. O. (1951). Two dogmas of empiricism. *Philosophical Review*, 60(1), 20–43.

5. Quine, W. V. O. (1960). *Word and Object*. MIT Press.

6. Ioannidis, J. P. A. (2005). Why most published research findings are false. *PLOS Medicine*, 2(8), e124.

7. Gärdenfors, P. (1988). *Knowledge in Flux: Modeling the Dynamics of Epistemic States*. MIT Press.

8. Berners-Lee, T., Hendler, J., & Lassila, O. (2001). The Semantic Web. *Scientific American*, 284(5), 34–43.

9. W3C OWL Working Group. (2004). *OWL Web Ontology Language Reference*. W3C Recommendation.

10. Abbott, B. P., et al. (LIGO Scientific Collaboration and Virgo Collaboration). (2016). Observation of gravitational waves from a binary black hole merger. *Physical Review Letters*, 116, 061102.

11. Abbott, B. P., et al. (2017). Gravitational waves and gamma-rays from a binary neutron star merger: GW170817 and GRB170817A. *Astrophysical Journal Letters*, 848, L13.

12. Hulse, R. A., & Taylor, J. H. (1975). Discovery of a pulsar in a binary system. *Astrophysical Journal*, 195, L51–L53.

13. Pflueger, J., & Rao, J. (2012). *HackerOne Bug Bounty Program Architecture*. HackerOne Inc.

14. Stone, M. (2004). Mozilla Security Bug Bounty Program. Mozilla Foundation.

15. Google Project Zero. (2014). Project Zero: Making zero-day hard. Google Security Blog.

16. Ioannidis, J. P. A. (2019). What have we (not) learnt from millions of scientific papers with p-values? *American Statistician*, 73(sup1), 20–25.

17. Open Science Collaboration. (2015). Estimating the reproducibility of psychological science. *Science*, 349(6251), aac4716.

---

## Appendix A: TIC Record for the Mother Dog Anecdote (Reconstruction)

See Section 9.2 above.

## Appendix B: PROV_22 Integration Notes

These sections are drafted for integration into PROV_22 as Innovation Area N (Truth Integrity Chain) and Innovation Area N+1 (Code Breakers Guild + Gold Refined by Fire). Per BP078 BLOOD: DO NOT MODIFY `PROV_22_DRAFT_v02.md` without explicit Founder ratify. These sections are DRAFT until counsel review and Founder ratification.

Integration points with existing PROV_22 innovations:
- Cross-references to Substrate Loop architecture (existing PROV_22 Loops 1-9)
- Cross-references to Marks currency specification (existing PROV_22 cooperative economics section)
- Cross-references to Eblet schema (existing PROV_22 knowledge record architecture)

## Appendix C: ABNF Type Fragments

```abnf
; Truth Integrity Chain — ABNF type fragments
; For formal patent claim support

tic-record     = "{" tic-fields "}"
tic-fields     = claim-id "," claim-text "," claim-status ","
                 known-field "," theories-open-field ","
                 eliminated-field "," deps-upstream "," apps-downstream ","
                 provenance "," hg-guard

claim-id       = DQUOTE 1*4ALPHA "-" 3*6DIGIT DQUOTE
claim-status   = DQUOTE ("UNTESTED" / "TESTED" / "FORGED" /
                 "GOLD_REFINED_BY_FIRE") DQUOTE

known-item     = "{" "statement:" quoted-string ","
                    "evidence_refs:" "[" *ref-list "]" ","
                    "confidence_type:" confidence-type ","
                    "quantifier_type:" quantifier-type "}"

quantifier-type = DQUOTE ("existential" / "universal" / "particular" / "null") DQUOTE

eliminated-item = "{" "eliminated_claim:" quoted-string ","
                     "elimination_evidence:" quoted-string ","
                     "eliminator_id:" quoted-string ","
                     "timestamp:" iso8601 ","
                     "loop_11_record:" quoted-string ","
                     "elimination_marks_issued:" number "}"

mark-record    = "{" "type:" mark-type ","
                    "denomination:" denomination-type ","
                    "earner:" member-id ","
                    "amount:" number ","
                    "redemption_multiplier:" "1.0" ","
                    "source_activity:" activity-type "}"

denomination-type = DQUOTE ("standard" / "negative-knowledge") DQUOTE
```

## Appendix D: The Employ the World Bounty Poster Program

Per `[[canon-employ-the-world-bounty-posters-banner-bp084]]`, the Code Breakers Guild's first public-facing manifestation is the **Employ the World** Bounty Poster page.

### D.1 What a Bounty Poster Is

A Bounty Poster is a public-facing document that:
1. States a specific claim in TIC format (claim_id, claim_text, current_status, key KNOWN and THEORIES_OPEN items)
2. Specifies what a valid challenge looks like (evidence type, quality standard, domain)
3. Specifies the reward in elimination-Marks for a successful Loop 11 elimination
4. States the bounty period (open indefinitely, or for a fixed period)

Bounty Posters implement the cooperative's principle from the banner: *"Employ the World."* The Code Breakers Guild is not a credentialed guild with barriers to entry. Any cooperative member ($5/year) can attempt a challenge. The Bounty Poster is the public notice that says: "This claim is available for challenge. If you can eliminate it, you earn Marks."

### D.2 Bounty Poster Format

```yaml
bounty_poster:
  poster_id: "BP-001"
  claim_ref: "G-001"
  claim_summary: "Gravity attracts mass to mass and propagates at c (confirmed LIGO 2017)"
  current_tier: FORGED
  bounty_type: "challenge_for_elimination"
  
  challenge_specification:
    evidence_type_required: "empirical — new experimental data; or mathematical — formal proof of internal inconsistency"
    quality_standard: "Master-tier-or-above review required before Loop 11 acceptance"
    minimum_documentation: "Written argument ≥ 500 words + evidence citations"
  
  reward:
    elimination_marks: 500
    tier_advancement_credit: true
  
  period: "open indefinitely"
  
  contact: "code-breakers-guild@lianabanyan.com"
  
  notes: "This claim has survived 47 prior challenges. Challengers are encouraged to focus on the THEORIES_OPEN set (12 entries) for novel challenge angles rather than re-raising already-recorded eliminations."
```

### D.3 Economic Design of Bounty Posters

The Bounty Poster reward (e.g., 500 elimination-Marks) is set by the claim submitter or the Guild, not by central fiat. Submitters are incentivized to set realistic bounties: too low and no Code Breakers will challenge; too high and the submitter over-commits resources to a claim that should be easy to eliminate.

The bounty amount creates a signal: high-bounty Bounty Posters indicate either (a) the submitter is confident the claim is robust, or (b) the claim is important enough that a successful elimination would be very valuable. Either way, high bounties attract more skilled Code Breakers.

This is structurally similar to bug bounty program design, where the bounty amount for a critical vulnerability (e.g., remote code execution) is higher than for an information disclosure. The signal value of the bounty is part of the mechanism.

---

## Appendix E: The Substrate Integration Architecture

The TIC system integrates with the Liana Banyan substrate through the following components (to be implemented post-Substrate-Awakens):

### E.1 Database Schema (Supabase)

```sql
-- TIC Claims table
CREATE TABLE tic_claims (
  claim_id VARCHAR(20) PRIMARY KEY,  -- e.g., "G-001"
  claim_text TEXT NOT NULL,
  claim_status VARCHAR(30) NOT NULL 
    CHECK (claim_status IN ('UNTESTED', 'TESTED', 'FORGED', 'GOLD_REFINED_BY_FIRE')),
  known_items JSONB DEFAULT '[]',
  theories_open JSONB DEFAULT '[]',
  eliminated JSONB DEFAULT '[]',
  dependencies_upstream JSONB DEFAULT '[]',
  applications_downstream JSONB DEFAULT '[]',
  hasty_generalization_guard JSONB,
  provenance JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loop 11 verification records
CREATE TABLE loop_11_records (
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id VARCHAR(20) REFERENCES tic_claims(claim_id),
  challenger_member_id UUID REFERENCES members(id),
  theory_challenged TEXT NOT NULL,
  evidence_submitted TEXT NOT NULL,
  loop_11_result VARCHAR(20) NOT NULL 
    CHECK (loop_11_result IN ('eliminated', 'survived', 'requires_human_review', 'rejected')),
  formal_contradiction_type VARCHAR(50),
  elimination_marks_issued NUMERIC(10,2) DEFAULT 0,
  verified_by_member_id UUID REFERENCES members(id),  -- human reviewer if required
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Elimination-Marks ledger (extends Marks ledger)
CREATE TABLE elimination_marks_ledger (
  ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_member_id UUID REFERENCES members(id),
  amount NUMERIC(10,2) NOT NULL,
  denomination VARCHAR(30) DEFAULT 'negative-knowledge',
  loop_11_record_id UUID REFERENCES loop_11_records(record_id),
  redemption_multiplier NUMERIC(4,2) DEFAULT 1.0,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Code Breaker member advancement
CREATE TABLE code_breaker_members (
  member_id UUID PRIMARY KEY REFERENCES members(id),
  tier VARCHAR(30) DEFAULT 'Probationer'
    CHECK (tier IN ('Probationer', 'Initiate', 'Journeyman', 'Master', 'Refiner_of_Gold')),
  successful_eliminations INTEGER DEFAULT 0,
  forged_tier_contributions INTEGER DEFAULT 0,
  honorable_failures INTEGER DEFAULT 0,
  refiner_of_gold_qualifying_failures INTEGER DEFAULT 0,
  joined_guild_at TIMESTAMPTZ DEFAULT NOW(),
  last_advancement_at TIMESTAMPTZ
);
```

### E.2 Edge Functions

- `loop-10-consequence-trace` — POST: accepts theory and TIC record, returns consequence map and any contradictions
- `loop-11-elimination-verify` — POST: accepts challenge + TIC record, returns elimination or survival record
- `loop-12-dependency-propagate` — POST: accepts updated claim + change type, returns propagation tree
- `guild-check-advancement` — POST: accepts member_id, returns current tier and advancement eligibility
- `bounty-poster-submit-challenge` — POST: accepts bounty_poster_id + evidence, initiates Loop 11

---

*Patent application status: PROV_22 in preparation. Canon eblets: [[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]] and [[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]]. These canon eblets are the primary sources for claim language; this technical paper is the explanatory companion.*

*Refer to: [L2 Explainer — Builder Level](/papers/knowing-what-is-not-true/) · [L1 Public — General Audience](/papers/knowing-what-is-not-true/l1-public) · [PROV_22 Docket](/patents/prov-22/)*

**FOR THE KEEP.**

— *Jonathan "G.I." Jones*
Founder · Liana Banyan Corporation
*For the keep.*
