---
name: Cost-Slasher Claim Ladder with Self-Auditing Evidence Table
description: A cost-reduction marketing method pairing a three-tier claim ladder with an adjacent evidence table containing a cost-per-correct-answer column, enabling readers to self-audit the claim in one scroll without click-through, whitepaper, or guarantee.
type: aa_formal
innovation_id: "2272"
ratification_session: B117
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - cost slasher claim ladder
  - self auditing evidence table marketing
  - cost per correct answer column
  - ftc safe claim architecture ladder
  - three tier claim conservative aggressive
  - dollar per correct self audit
  - aa formal 2272
  - claim ladder evidence substantiation
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A Formal #2272 — Cost-Slasher Claim Ladder with Self-Auditing Evidence Table

**Innovation #:** 2272
**Category:** Marketing Method / Empirical Validation / FTC-Safe Claim Architecture
**Crown Jewel:** **CANDIDATE** — recommend YES. Novel-over-prior-art on the "self-verifying at first scroll" mechanism.
**Bishop Session:** B117 (Formal draft). Originated: B115 ratification → B116 landing-page deployment (commit `149dd2d`) → B117 formalization.
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh.
**Related:** #2260 (Cooperative Defensive Patent Pledge, licensing context), #2264 (Commons Licensing Dividend, distribution mechanism this marketing drives toward), R10 Eyewitness benchmark (#K423, the empirical substrate).
**Implementation artifact:** `https://librarian.the2ndsecond.com` live landing page (B116 commit `149dd2d` shipped the $/correct column).

---

## TL;DR (2 lines)

A cost-reduction marketing claim is paired at point-of-contact with an **evidence table whose structure is the guarantee** — specifically, a "cost-per-correct-answer" column ($/correct = cost-per-query ÷ correctness-rate) next to model/vendor rows — letting the reader self-audit the claim in one scroll. Claim bands are empirically anchored at 50%+ conservative and up to 95% aggressive; "guaranteed" language is explicitly rejected. Novel over conventional AI-cost marketing: the table design is the FTC-deception protection, not the fine print.

---

## The Problem

AI-retrieval cost-reduction products must market to three audiences with incompatible literacy expectations:

1. **C-suite buyers** who want a one-line dollar number ("cuts AI spend by X%")
2. **Engineers and researchers** who reject marketing numbers without underlying benchmarks
3. **Regulators and compliance reviewers** (FTC § 5, state AG offices, potential class-action plaintiffs) who parse claims against evidence

Existing solutions fail all three:

- **Adjective marketing** ("industry-leading," "dramatic reduction," "up to 95% cheaper") satisfies the C-suite but collapses under engineering review and invites FTC deception challenges for lacking substantiation.
- **Whitepaper marketing** (publish benchmark, link from "see how we did it" footer) satisfies engineers but loses the C-suite before they click.
- **"Guaranteed X%" claims** with small-print carveouts invite both class-action and FTC action when any customer falls short — the guarantee creates the exposure.

The gap: no pattern exists for a claim architecture that is **self-auditable at the exact point of reader contact**, with no click-through, footnote, or refund-rail required to make it FTC-defensible.

---

## Mechanism

### Three-tier claim ladder

The Cost-Slasher Claim Ladder presents the cost-reduction claim at exactly three intensity levels, each anchored to specific numbers from the R10 Eyewitness benchmark (8 models × 4 vendors × 1,200 graded calls, published in `librarian-mcp-public/preload/benchmark/`):

| Tier | Claim | Empirical anchor (from R10) | FTC exposure |
|---|---|---|---|
| **Conservative** | "Cuts your AI costs by over half" | 50%+ observed across the full 8-model grid; floor of the distribution | Zero — anchored to the weakest observation |
| **Middle** | "Haiku + Cathedral ≈ Opus accuracy at 1/19th the cost" | Haiku-Cathedral $0.0067 vs Opus $0.1289 at identical 98.7% HOT accuracy | Zero — specific model/condition pair, directly reproducible |
| **Aggressive** | "Up to 95% savings at the ceiling" | 95% = (Opus - Haiku) / Opus cost at peak | Zero — "up to" is an observed ceiling, not a promise |

The reader sees all three tiers simultaneously. The conservative claim protects against churn-through-disappointment. The aggressive claim captures attention. The middle tier is the operative claim carrying the 1/19× cost-delta punch.

### Self-auditing evidence table

Adjacent to the claim ladder, a table with these columns in this order:

1. Model name (e.g., `claude-haiku-4-5-20251001`)
2. Vendor (e.g., `Anthropic`)
3. HOT accuracy (e.g., `98.7%`)
4. HOT cost per query (e.g., `$0.0067`)
5. **$/correct** (e.g., `$0.0068` — column added B116 commit `149dd2d`)
6. HOT vs COLD lift (e.g., `+87.6pp`)

The **$/correct** column is the self-audit primitive. A reader who doubts the 19× cost-delta claim can compute it themselves from columns 4 and 5 without leaving the page:

```
claim: Haiku ≈ Opus accuracy at 1/19th the cost
check: Opus $/correct ÷ Haiku $/correct = 19.23× ✓
```

No click-through. No whitepaper hunt. No refund rail. The reader becomes their own auditor at first scroll — which is the specific thing that makes the claim FTC-defensible without a guarantee.

### Explicit rejection of "guaranteed"

Founder B116 rejected "guaranteed" language three times during copy review. Rationale recorded in this innovation (Q004 of SCEV-1 bank):

1. **FTC deceptive-practices exposure** — a guarantee without a refund rail is overclaim per 16 CFR § 239.3
2. **Weaker than the math** — the table already shows the delta; the adjective undercuts the evidence
3. **Founder-voice mismatch** — rhetorical keystones understate; "guaranteed" reads marketing-suit, not cooperative-operator

### Empirical substrate (anchoring data)

Per R10 Eyewitness Benchmark (K423, B111/B112):

- 8 models: claude-haiku-4-5, claude-opus-4-7, claude-sonnet-4-6, gpt-4o-mini, gpt-4o, gemini-2.5-flash, gemini-2.5-pro, perplexity sonar
- 4 vendors: Anthropic, OpenAI, Google, Perplexity
- 75-question bank × 2 conditions (HOT/COLD) × 2 tiers = 1,200 calls
- Mean HOT: 94.8%. Mean COLD: 8.7%. Mean lift: **86.1 percentage points**
- Inter-rater kappa: 0.883 (HOT) / 0.850 (COLD)
- Cost variance: $0.0001 (Gemini 2.5 Flash COLD) to $0.1272 (Opus HOT) — **19× delta at ceiling**

---

## Novelty Analysis

### Prior art and gaps

| Prior art pattern | What it does | What it misses |
|---|---|---|
| Adjective marketing ("industry-leading") | Fast, simple, C-suite-compatible | Fails FTC substantiation; collapses under engineering review |
| Whitepaper-gated claim ("see benchmark →") | Provides substantiation but off-page | Loses readers before they click; does not self-audit at point-of-contact |
| Comparison-shopping tables (vendor-vs-vendor) | Shows side-by-side accuracy/latency/cost | Missing the ratio column that lets the reader run the claim arithmetic themselves |
| "Guaranteed X%" + refund-rail | Creates contractual certainty | Creates class-action exposure; every customer who falls short is a plaintiff |
| Gartner / independent-third-party benchmarks | Authority-transferred substantiation | Does not travel with the claim to the product page |

### Novel combination

1. **$/correct column** (cost-per-correct-answer) computed from cost-per-query divided by correctness-rate. The specific ratio primitive is not in standard AI benchmark reporting, which typically shows cost and accuracy as independent columns. The ratio makes the claim self-auditable.
2. **Three-tier claim ladder co-located with the evidence table** (conservative / middle / aggressive, all visible in one scroll). Existing AI-cost marketing presents one intensity at a time; switching intensities is a common pattern of substantiation-evasion.
3. **Explicit rejection of "guaranteed" language paired with structural substitution** (the table is the guarantee). Existing FTC-safe marketing either accepts the overclaim risk or collapses to vague adjectives. The ladder-plus-table pattern is the third path.
4. **Point-of-contact self-audit primitive.** No click-through, no footnote reveal, no refund-rail contract. The reader's eyes on the table ARE the substantiation event.

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for presenting a verifiable cost-reduction claim at a point of reader contact, comprising:

(a) rendering a display surface comprising at least: (i) a claim ladder presenting a cost-reduction claim at two or more declared intensity levels, each level annotated with a distinct empirical anchor; and (ii) an evidence table adjacent to the claim ladder, the evidence table containing at least one row per offering and at least the following columns in the following order or equivalent: model identifier, vendor, correctness rate, cost per unit query, and a ratio column computed as cost per unit query divided by correctness rate;

(b) the ratio column providing a single scalar per row by which a reader can compute the cost-reduction claim of the claim ladder without leaving the display surface;

(c) wherein the empirical anchor for each intensity level corresponds to a specific row or pair of rows in the evidence table, the correspondence being deducible from the table without additional documentation.

**Claim 2 (Apparatus).** A web page or presentation surface implementing Claim 1, wherein the ratio column is labeled with a term semantically equivalent to "cost per correct answer" and is computed dynamically or statically from other columns in the same table.

### Dependent claims

- **Claim 3.** The method of Claim 1 wherein the claim ladder comprises exactly three intensity levels: a conservative tier anchored to the weakest observation in the evidence table, a middle tier anchored to a specific identified pair of rows, and an aggressive tier anchored to the ceiling ratio observed in the evidence table.
- **Claim 4.** The method of Claim 1 further comprising an explicit in-copy rejection of the word "guaranteed" or its functional equivalents, the rejection serving as a structural substitution whereby the evidence table substantiates the claim in place of a contractual guarantee.
- **Claim 5.** The method of Claim 1 wherein the empirical anchor data in the evidence table derives from a benchmark of at least 4 vendors × 4 models × 100 graded queries × 2 conditions, with per-row inter-rater kappa reported.
- **Claim 6.** The method of Claim 1 further comprising a "lift" column expressing the observed accuracy differential between two declared conditions (e.g., with-retrieval vs without-retrieval) in percentage points, enabling the reader to distinguish effect size from accuracy ceiling.
- **Claim 7.** The method of Claim 1 wherein the display surface is a landing page at a domain associated with the product and the claim ladder is visible above-the-fold on a standard desktop viewport.
- **Claim 8.** The method of Claim 2 wherein the ratio column is rendered with equal or greater typographic weight than the cost column, signaling to the reader that the ratio (not the cost) is the operative scalar.
- **Claim 9.** The method of Claim 1 wherein the ratio column values are provided to at least four significant figures to forestall rounding-based doubt attacks.

---

## Deployment evidence

- **Landing page:** `librarian.the2ndsecond.com` — Chapter 1 Librarian section.
- **Commits:** `149dd2d` (Cost-Slasher callout + $/correct column, B116), `c404c6e` (Lighthouse accessibility/performance fixes, B116).
- **Lighthouse scores post-deployment:** Performance 99, Accessibility 100, Best Practices 96, SEO 100.
- **SSL Labs grade:** A+ on both the root and the Cloud Run MCP endpoint.
- **Benchmark underlying the numbers:** K423 R10 results at `librarian-mcp/r10_cross_vendor/results/`, gzipped 2MB aggregate committed `d284be7`.

---

## Cross-References

1. **R10 Eyewitness Benchmark (K423)** — the empirical substrate the claim ladder rests on
2. **#2260 Cooperative Defensive Patent Pledge** — licensing framework within which this marketing operates
3. **#2264 Commons Licensing Dividend** — the economic mechanism the cost-savings narrative drives buyers toward
4. **#2273 Fingerprint-Based Incremental Index Reconciliation** — reliability substrate making the Haiku-Cathedral claim deployable in production
5. **Prove-Then-Product canonical methodology** (Founder-ratified B116) — this A&A is an instance of that methodology applied at the marketing layer

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [x] Cross-reference from `PROV_14_DRAFT.md` Section 2 #2272 entry (existing description covers this A&A)
- [ ] Update `PROV_14_DRAFT.md` to note A&A Formal file path for #2272 (B117 follow-on)
- [ ] Counsel review before Prov 14 filing — specifically ask counsel whether Claim 1(a)(ii)'s column-order specification is narrow enough to enforce and broad enough to cover the novel combination
- [ ] Optional: cite Claim 1 in any outreach letter or pitch that quotes the Cost-Slasher numbers, signaling the substrate is patent-protected
- [ ] Optional: fold into the Discord/Reddit launch copy as "our marketing is part of our patent portfolio" — one-sentence mention, no more

---

**Innovation count:** no change (this formalizes #2272 which was already counted in B116).
**Crown Jewels:** candidate — Founder ratification needed. Recommend YES (novel over prior art is defensible; landing page is the ongoing public demonstration).
**Claims:** +9 claims (2 independent, 7 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Second A&A Formal of the Prov 14 thresh (after #2273 Fingerprint). The marketing layer of the Prove-Then-Product principle — the claim and the evidence ship together or neither ships.*

**FOR THE KEEP.**
