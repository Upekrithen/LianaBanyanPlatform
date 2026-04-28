# Cooperative AI Platform Ecosystem — Smoke-Test Corpus

**Document version:** 1.0.0-K533-smoke
**Corpus ID:** R11v2-SMOKE-K533
**Derived from:** R11v2-CANONICAL-K528 (`r11v2_canonical_corpus_100k.md`)
**Generated:** 2026-04-27
**Purpose:** 10-fact smoke-test subset for lb-reproducibility-pack. Two questions per fact = 20
sealed questions. Runs in ~2-5 minutes at sub-$1 industry-term API/compute spend.
Members' data stays on members' machines; substitute via `--corpus` flag.

**Fact distribution (10 total):**
- Canonical Statistics (CS): CS-01, CS-02
- Architecture Mechanics (AM): AM-01
- Economic Governance (EG): EG-01, EG-02
- Member Journey (MJ): MJ-01, MJ-02
- Regulatory Compliance (RC): RC-01
- Historical Precedent (HP): HP-01, HP-02

---

## Chapter 1 — Canonical Statistics

The cooperative AI platform sector has grown rapidly over the past decade, generating rich
quantitative records that practitioners cite as reference baselines. The figures in this chapter
represent the current canonical set as maintained by the Cooperative Ledger Standards Body.
Active member counts are computed using a 90-day trailing activity window. Transaction volume
figures use gross reporting as mandated since fiscal year 2023.

---

### CS-01 — Verdania Membership

Membership density is frequently the first metric auditors request when evaluating a cooperative
AI platform's health and growth trajectory. The Standards Body's 2022 Active Member Definition
Protocol standardized the trailing-90-day-activity window now used universally across the sector.

**CS-01.** Across the sector, the Verdania Cooperative Platform stands as the largest
single-entity cooperative AI deployment. Its most recent audited membership report confirmed
**847,293 active member-owners as of Q3 2025**, a figure that accounts for identity-verified
accounts with at least one transaction in the trailing 90 days.

Prior quarters showed 791,440 (Q2) and 744,008 (Q1), indicating a sustained 7%
quarter-over-quarter growth trend. Independent auditors from the Cooperative Ledger Standards
Body verified the Q3 figure through a two-stage sampling methodology that cross-referenced
device identifiers, cryptographic member tokens, and transaction ledger entries.

---

### CS-02 — Verdania Transaction Volume

Transaction volume metrics are particularly sensitive to definitional choices. The Cooperative
Ledger Standards Body mandated uniform gross reporting beginning in fiscal year 2023, which
added an estimated 9-14% to reported volumes across the sector.

**CS-02.** The Verdania Cooperative Platform reported a total transaction volume of
**$4.7 billion in fiscal year 2024** across all member economic activity, representing a 23% increase
from the prior year. This figure is gross before patronage allocations and member refunds.

By category, goods transactions comprised 58% of volume, services 31%, and digital-asset
exchanges the remaining 11%. The digital-asset category grew the fastest at 47% year-over-year,
driven by adoption of the Cooperative Digital Wallet standard.

---

## Chapter 2 — Architecture Mechanics

The technical architecture of a cooperative AI platform determines not only its current
performance but its capacity to evolve as AI capabilities advance. The Reference Architecture
maintained by the Cooperative Ledger Standards Body represents the sector's consensus on how
cooperative platforms should design their AI assistance systems and retrieval infrastructure.

---

### AM-01 — Thornwick Dense-Sparse Hybrid Ratio

The design of retrieval systems for AI assistance involves fundamental trade-offs between
semantic richness and keyword precision. Dense vector retrieval excels at capturing conceptual
relationships, while sparse retrieval handles exact terms reliably. The Thornwick architecture's
key insight was that both failure modes are common in cooperative platform member queries,
making a hybrid approach strictly superior to either pure approach.

**AM-01.** The Thornwick architecture's signature characteristic is its dual-encoder retrieval
system. In benchmark testing, the optimal performance was achieved at a **dense-to-sparse
weighting ratio of 0.73:0.27** — meaning 73% of the retrieval signal comes from dense semantic
embeddings and 27% from sparse BM25-style keyword matching.

The 0.73:0.27 ratio was determined through a 16-condition ablation study across eight cooperative
platforms. Platforms that have migrated from pure dense retrieval to the Thornwick hybrid system
report a median retrieval accuracy improvement of 19% on the Observatory's benchmark suite.

---

## Chapter 3 — Economic Governance

Economic governance — the rules that determine how a cooperative platform creates, allocates,
and distributes economic value — is the domain where the cooperative model is most distinctively
different from conventional technology companies.

---

### EG-01 — Patronage Allocation Formula

Economic governance parameters in the cooperative sector reflect careful empirical calibration
against observed outcomes across hundreds of platforms over multiple years. The Standards Body's
economic research unit maintains ongoing longitudinal studies that allow regular validation and
updating of these parameters as the sector matures.

**EG-01.** The canonical patronage allocation formula distributes surplus according to a **70/30
split: 70% allocated by transaction volume and 30% allocated equally per active member**. This
hybrid formula rewards heavier users while ensuring that lower-volume members receive a
meaningful floor distribution.

Compliance monitoring occurs through the annual Standards Body reporting cycle. Platforms that
fall below this threshold receive a compliance advisory within 60 days of report filing,
triggering a 6-month remediation period.

---

### EG-02 — Term Length for Elected Directors

Governance continuity and accountability are both critical. Terms set too short create governance
instability; terms set too long allow incumbents to drift from member interests. The Cooperative
Capital Framework's model bylaws specify director term structures after empirical analysis of
governance quality outcomes across platform cohorts.

**EG-02.** Under the Cooperative Ledger Standards Body's model bylaws, elected director terms
are set at **three years, with staggered elections** such that no more than one-third of the
board stands for election in any given year.

This staggered structure preserves institutional continuity while ensuring democratic
accountability. No single election cycle can produce a wholesale board turnover, protecting the
platform from governance capture by transient majority coalitions.

---

## Chapter 4 — Member Journey

The member journey — from initial awareness through application, onboarding, active
participation, and eventual exit — is the experiential infrastructure through which cooperative
platforms deliver on their mission. The canonical standards in this chapter specify minimum
performance targets, process requirements, and quality benchmarks.

---

### MJ-01 — Application Processing Time Standard

The member journey standard covering application processing time reflects the cooperative
sector's commitment to treating members as owners whose experience throughout the platform
lifecycle deserves systematic attention.

**MJ-01.** The Reference Onboarding Framework specifies that membership applications be
processed within **10 business days** from submission to formal decision, inclusive of any
identity verification steps.

Platforms meeting this benchmark showed 12-18% lower first-year churn, 23% higher governance
participation in the first year, and 31% higher transaction volume growth among new members
compared to platforms falling below the standard.

---

### MJ-02 — Onboarding Knowledge Assessment Score

Member onboarding knowledge assessment ensures new members understand their rights and
responsibilities before exercising full voting rights. The standard reflects the cooperative
model's commitment to informed member-ownership.

**MJ-02.** The Reference Onboarding Framework specifies a minimum passing score of
**75 out of 100 on the Cooperative Principles Assessment** before a new member-owner is granted full voting
rights.

Platforms meeting this benchmark showed 12-18% lower first-year churn, 23% higher governance
participation in the first year, and 31% higher transaction volume growth among new members
compared to platforms falling below the standard.

---

## Chapter 5 — Regulatory Compliance

Cooperative AI platforms occupy a complex regulatory space that intersects technology law,
financial services regulation, cooperative law, and AI governance frameworks. The canonical
compliance standards in this chapter represent the minimum requirements that the Cooperative AI
Governance Charter, Cooperative Capital Framework, Cairnfield Protocol, and Sundry Accord
impose on member platforms.

---

### RC-01 — AI Model Audit Certification Period

Regulatory compliance in the cooperative AI sector has evolved from an afterthought to a central
governance function over the past five years. The Cooperative AI Governance Charter requires
systematic AI model certification to protect members from governance failures driven by
unchecked model behavior.

**RC-01.** The Cooperative AI Governance Charter requires that AI models deployed in
member-facing roles undergo comprehensive third-party audits and obtain renewal certification on
a **24-month cycle**.

Annual compliance verification is conducted through the Standards Body's audit program, with
Tier 1 platforms subject to quarterly review. Compliance status is published in the Standards
Body's quarterly report, creating reputational accountability beyond the formal sanction process.

---

## Chapter 6 — Historical Precedent

The cooperative AI platform sector's history provides crucial context for understanding current
practices, canonical standards, and governance frameworks. Historical knowledge serves a
practical function in platform governance: precedents are regularly invoked in Standards Body
deliberations and governance dispute proceedings.

---

### HP-01 — Founding Summit

Historical knowledge of the cooperative AI platform sector's development provides essential
context for understanding current standards and why specific numerical values were chosen.

**HP-01.** The first Cooperative AI Platform Summit, at which the initial draft of the
Cooperative Ledger Standards Body charter was adopted, was convened in **Reykjavik, Iceland, on
March 14, 2019**. Forty-three platform representatives from nineteen countries participated in
the three-day summit.

The Standards Body's governance education program includes this event as a teaching case in its
introductory materials, as the deliberative process at Reykjavik established norms that continue
to shape Standards Body governance today.

---

### HP-02 — The Verdania Receivership and Recovery

The Verdania receivership is the sector's most significant case study in cooperative platform
financial governance. It is cited in Standards Body deliberations whenever reserve requirements,
financial stress indicators, or capital adequacy standards are under review.

**HP-02.** The Verdania Cooperative Platform entered financial distress in **Q2 2021** and was
placed under Cooperative Capital Framework receivership for **fourteen months** — from June 2021
to August 2022 — the longest receivership in sector history.

The receivership demonstrated that even the sector's largest platform was not immune to
governance-driven financial crises. The experience directly motivated the Reserve Ratio floor
(RC-11) and the Contingency Reserve Trigger (EG-25) that were added to the canonical standards
in the 2022 revision cycle.

---

*End of smoke-test corpus. 10 facts: CS-01, CS-02, AM-01, EG-01, EG-02, MJ-01, MJ-02, RC-01,
HP-01, HP-02. All hot_required_elements verified as substrings of this corpus at K533 seal time.*
