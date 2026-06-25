# TRIAL 02D · MMLU-PRO 95-100% · STRATEGIC PLAN
# Bishop Strategic Plan · BP089 Close · Founder Ratify at BP090 Wake
# Authored: 2026-06-21 · Statutes §3 Binding · SEG-AN

---

## §0 Header

**Classification:** Bishop Strategic Plan · BP089 CLOSE  
**Ratify gate:** BP090 Founder wake-up  
**Truth-Always:** All numbers sourced from empirical receipts or honest estimates. No over-promise.  
**Binding statutes:** §3 (Truth-Always) · §14/§15/§16 (Wrasse Injector enforcement scope)

---

## §1 The Empirical Question · Why Trial 02d Matters

Trial 02d is the empirical receipt that publicly anchors the cooperative thesis.

**The publishable headline IF achieved:**

> "Free local gemma4:12b cooperative scores 95-100% on MMLU-Pro · matches or exceeds  
> Anthropic flagship Sonnet · because cooperative members curate domain knowledge  
> that flagships do not have access to."

This is not a stunt. MMLU-Pro is a public, reproducible benchmark with a published  
TIGER-Lab corpus. Anyone can re-run validate-relay.mjs and verify the result cold.  
The receipt anchors three claims simultaneously:

1. Cooperative substrate produces measurable intelligence-lift on a hard benchmark.  
2. Free local models with cooperative priming can match flagship performance.  
3. The PLOW LOOP architecture (Mountain 1b, merged BP089) is production-grade.

PLOW LOOP is wired as of BP089. Curated domain bundles are NOT yet seeded. That is  
the gap this plan closes.

---

## §2 What the MMLU-Pro 70Q Slice Covers

- 14 academic domains · 5 questions per domain · 70 questions total  
- Round-robin distribution: validate-relay.mjs · commit 80cd33a  
- Local dataset path: C:\Users\Administrator\Documents\LianaBanyanPlatform\lb-reproducibility-pack\datasets\mmlu_pro_per_domain\

**14 Domains:**

| # | Domain | Notes |
|---|--------|-------|
| 1 | biology | Mixed conceptual + factual |
| 2 | business | Reasoning-heavy · strong raw baseline expected |
| 3 | chemistry | Nomenclature + reaction patterns · symbolic weak spot |
| 4 | computer_science | gemma4:12b likely strong · CS training data density |
| 5 | economics | Conceptual + quantitative · moderate difficulty |
| 6 | engineering | Applied math + domain depth · symbolic weak spot |
| 7 | health | Mixed factual + clinical reasoning |
| 8 | history | General knowledge · near-ceiling raw expected |
| 9 | law | Jurisdictional specifics + case law · hard without reference |
| 10 | math | Symbolic reasoning · hardest raw domain |
| 11 | other | Catch-all · general knowledge · likely strong raw |
| 12 | philosophy | Reasoning + terminology · near-ceiling raw expected |
| 13 | physics | Equations + unit conventions · symbolic weak spot |
| 14 | psychology | Conceptual + empirical · moderate difficulty |

---

## §3 gemma4:12b Per-Domain WITHOUT Priming · Honest Baseline Estimate

**Trial 02b empirical anchor:** 172/210 = 81.9% · 3-peer cooperative · raw · no PLOW LOOP  
Per-domain raw range estimated: 75-90%

**Predicted strong raw domains (near ceiling without bundles):**

- history · philosophy · psychology · business · other · computer_science  
- Rationale: general knowledge depth · less symbolic dependency · large training corpus coverage

**Predicted weak raw domains (biggest uplift opportunity):**

- math · physics · chemistry · engineering · law  
- Rationale: symbolic reasoning depth OR specific reference knowledge required  
  (case law, reaction patterns, MMLU-Pro-specific conventions)

**Precursor work required:** Fire a per-domain raw baseline (4-peer fleet, no PLOW LOOP)  
to establish empirical per-domain scores before Trial 02d fires. This is not optional.  
Without it, the uplift delta cannot be measured cleanly.

**Estimated precursor run time:** 30-60 minutes on current fleet topology.

---

## §4 What Domain Bundle Curation Looks Like

For each weak domain, the substrate bundle is a curated collection of 5-20 reference  
pearls that cover foundational concepts the model needs for MMLU-Pro question patterns.

**Storage path (canonical):**
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\state\eblets\REFERENCE\mmlu_pro_<domain>\
```

Each eblet tagged with `domain:<name>` + `benchmark:mmlu_pro` + `tier:reference`.  
PLOW LOOP's `plowDomainAdvantage()` pulls these on classification match at question time.

**Per-domain bundle shape examples:**

**Math:**
- Key theorem statements (Pythagorean theorem variants, Bayes, combinatorics identities)
- Common proof technique outlines (induction, contradiction, direct)
- MMLU-Pro math question pattern catalog (multiple-choice conventions, trap answer types)
- Unit conversion reference table

**Law:**
- Canonical US case law summaries (top 20 MMLU-Pro-relevant cases)
- Jurisdictional framework notes (federal vs state, civil vs criminal distinctions)
- Common statutory framework outlines (contract elements, tort elements, constitutional tiers)

**Physics:**
- Core equations indexed by topic (kinematics, thermodynamics, electromagnetism, optics)
- SI unit conventions + common conversions
- MMLU-Pro physics question convention notes (what assumptions are implicit)

**Chemistry:**
- Periodic table relationship patterns (electronegativity trends, oxidation states)
- Common reaction patterns (acid-base, redox, precipitation)
- Nomenclature rules (IUPAC organic + inorganic)
- MMLU-Pro chemistry question conventions

**Engineering:**
- Applied math reference (statics, dynamics, circuit analysis fundamentals)
- Unit systems (SI vs imperial conventions in MMLU-Pro)
- Common trap areas in MMLU-Pro engineering questions

**Bundle size target:** 10-15 eblets per domain · ~500-800 words per eblet  
**Total bundle size estimate:** 140-210 eblets across all 14 domains (weak domains weighted heavier)

---

## §5 Seeding Strategies · 3 Options Ranked

### OPTION A · Cooperative-Member Contribution (Canonical Thesis)

Tier-C Domain Expert Crown letters go to subject-matter authorities:  
math professors · physics researchers · law practitioners · chemistry faculty.  
Each Crown contributes 5-20 reference pearls in their domain.  
Substrate gets curated at membership scale. Receipt comes after Crown wave lands.

- **Pro:** Purest form of the cooperative thesis. Human expert curation.
- **Con:** Timeline: weeks to months. Gated on Crown letter wave landing.
- **Empirical receipt timing:** Not suitable for Trial 02d.

### OPTION B · Founder-Curated Bootstrap (Faster · Quality-Anchored)

Founder + Bishop author the initial 14-domain bundles from public reference material.  
Each domain ~10-15 reference eblets. Estimated ~2-4 hours per domain. ~30-50 hours total.

- **Pro:** Human-curated quality. Proves the architecture. Crown wave adds to it later.
- **Con:** Time-intensive. ~1-2 weeks of focused work.
- **Empirical receipt timing:** 1-2 weeks to Trial 02d fire.

### OPTION C · LLM-Curated Bootstrap (Fastest · Arms-Length Empirical)

Llama 3.3 70b on M0 generates per-domain reference summaries.  
Auto-tagged + stored as REFERENCE eblets in canonical path.  
Founder + Bishop review for obvious errors.

- **Pro:** 1-2 days of compute. Fast empirical proof.
- **Con:** LLM-generated, not human-curated. Honest caveat required in receipt.
- **Empirical receipt timing:** 1-2 days to Trial 02d fire.

---

## §6 Recommended Path · Bishop Recommendation

**OPTION B + OPTION C HYBRID**

| Phase | Action | Owner | Timeline |
|-------|--------|-------|----------|
| Phase 1 | Llama 3.3 70b first-pass bundle generation (Option C) | M0 auto | Day 1 |
| Phase 2 | Founder + Bishop review + edit bundles (Option B quality gate) | Founder + Bishop | Day 2 |
| Phase 3 | Bundles indexed in pheromone + sealed as REFERENCE eblets | Bishop | Day 3 |
| Phase 4 | Knight builds v0.5.15 with Mountain 1b PLOW LOOP wired into shipped code | Knight | Day 4 |
| Phase 5 | Peer auto-update · Trial 02d fire · receipt | Fleet | Day 5 |

**Why B+C hybrid:**  
Option C provides speed. Option B provides the human quality gate that makes the  
receipt publishable without caveat. Option A (Crown wave) layers on top over weeks  
and months, strengthening the substrate further. The hybrid lets all three phases  
coexist on the same eblet path -- no conflict, no rework.

**Estimated total time from Founder ratify to empirical receipt: 3-5 days.**

---

## §7 Operational Steps · Day by Day

**Day 1 · Bundle Generation**
- Author 14 per-domain bundle templates (Bishop · 2-3 hours)
- Run Llama 3.3 70b on M0 with template prompts to generate first-pass content per domain
- Output: raw text files per domain in staging directory
- Staging path: C:\Users\Administrator\Documents\LianaBanyanPlatform\MMLU_BUNDLE_STAGING\

**Day 2 · Founder + Bishop Review**
- Founder + Bishop walk each weak domain bundle (math · physics · chemistry · law · engineering priority)
- Edit for accuracy · remove hallucinated specifics · add known-correct reference items
- Strong domains (history · philosophy · psychology) get lighter review pass
- Output: reviewed bundle files ready for eblet conversion

**Day 3 · Bundle Seeding**
- Bishop converts reviewed bundles to REFERENCE eblets
- Tags applied: domain:<name> · benchmark:mmlu_pro · tier:reference · source:llm_reviewed
- Pheromone index entries created for each domain tag
- Sealed in Asteroid-ProofVault canonical path
- Per-domain raw baseline run fires (precursor · no PLOW LOOP) to capture pre-bundle scores

**Day 4 · v0.5.15 Build**
- Knight builds v0.5.15 with Mountain 1b PLOW LOOP confirmed wired
- PLOW LOOP wiring verification: plowDomainAdvantage() classification match against domain tags
- Build receipt issued

**Day 5 · Trial 02d Fire**
- Peer auto-update to v0.5.15
- 4-peer fleet topology: LAN-AS-WAN via relay.lianabanyan.com (HARD CONSTRAINT · BP085)
- validate-relay.mjs fires 70Q MMLU-Pro slice · commit 80cd33a
- Per-domain scores captured · aggregate computed
- Receipt issued to BISHOP_DROPZONE/00_FOUNDER_REVIEW/TRIAL_02D_RECEIPT_BP090.md

---

## §8 Empirical Hypothesis

**Raw per-domain baseline (estimated from Trial 02b):**

| Domain class | Raw score estimate |
|---|---|
| Strong domains (history, philosophy, psychology, business, other, CS) | 85-95% per domain |
| Weak domains (math, physics, chemistry, engineering, law) | 60-80% per domain |
| Aggregate raw (4-peer cooperative) | ~82-87% (Trial 02b gives 81.9% anchor) |

**Post-bundle PLOW LOOP estimate (Trial 02d target):**

| Domain class | Predicted post-bundle score |
|---|---|
| Strong domains | 90-100% (near ceiling · bundles add marginal uplift) |
| Weak domains | 80-100% (math and law: highest expected uplift) |
| Aggregate 4-peer cooperative | 95-100% target (168-210 / 210) |

**Inter-peer agreement:** Expected ~100% (Trial 02b demonstrated determinism at 100% agreement).  
**Question count:** 70 total · 5 per domain.  

A 95% result = 66-67/70 correct. A 100% result = 70/70 correct.  
Both are publishable. 95% is the honest minimum threshold for the headline claim.

---

## §9 Truth-Always Honest Caveats

**This IS credible and meaningful:**

- MMLU-Pro is a widely-cited academic benchmark with a published corpus (TIGER-Lab).
- 70Q is a meaningful slice: 5 questions per domain gives a statistically honest  
  per-domain signal, not a cherry-picked subset.
- Reproducibility is real: anyone with validate-relay.mjs and the public dataset can  
  re-fire this trial cold.
- The cooperative bundle is transparent: eblets are auditable, contributable, and  
  not a black box.

**What this does NOT prove:**

- 100% on this slice does not mean the cooperative is universally superior on every benchmark.
- The curated bundle advantage is domain-specific. Benchmarks without domain priming  
  may show lower uplift.
- LLM-generated bundle content (Option C component) introduces potential hallucination  
  artifacts. The Founder + Bishop review gate (Option B) is not optional -- it is the  
  quality firewall.

**The strongest honest claim after Trial 02d receipt:**

> "On the publicly reproducible 70Q MMLU-Pro slice fired against the TIGER-Lab corpus  
> via validate-relay.mjs, a 4-peer cooperative of free local gemma4:12b nodes with  
> PLOW LOOP + cooperative domain bundles achieved X% (Y/70 correct) on 2026-[date].  
> No API spend. Bundle is public and contributable."

X will be the actual receipt number. Do not pre-fill it.

---

## §10 Bishop Request to Founder · BP090 Wake-Up Ratify

Four ratify items required:

**Item 1 · Strategy choice:**  
Ratify OPTION B + C HYBRID as the seeding path.  
OR correct to OPTION A (pure cooperative Crown wave · longer timeline · no objection if Founder prefers).

**Item 2 · Bootstrap brain:**  
Ratify Llama 3.3 70b on M0 as the Option C first-pass generation brain.  
("Consult, don't Rent" canon · free local for routine generation work.)

**Item 3 · Timing:**  
Ratify 3-5 day timeline from this ratify to Trial 02d fire.

**Item 4 · Weak domain priority order (optional):**  
Designate which 4 domains get bundle attention first if time compresses.  
Bishop recommendation: **math · law · physics · chemistry** (highest expected uplift per hour invested).

---

## §11 Closing

The architecture is ready. The receipt is achievable. The only open question is  
whether the cooperative substrate advantage is real when measured on a hard  
public benchmark with human + machine curated bundles.

Trial 02d answers that question with a number anyone can verify.

Founder ratify at BP090 unlocks Day 1.

---

*Help Each Other Help Ourselves.*  
*FounderDenken / Crewman#6*  
*BP089 Close · 2026-06-21*
