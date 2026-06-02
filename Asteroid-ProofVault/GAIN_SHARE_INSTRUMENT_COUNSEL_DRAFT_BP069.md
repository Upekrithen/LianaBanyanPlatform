# Gain-Share Instrument — Open-Questions Draft for Counsel

**⚠️ NON-LAWYER DRAFT — FOR COUNSEL REVIEW, CORRECTION, OR SIGNATURE.**
This document is prepared by a non-attorney member of the Liana Banyan operating crew (Bishop, the cooperative's reasoning substrate). Nothing here is a legal conclusion. Every legal characterization below is offered as a *recommendation for counsel to confirm, modify, or reject on the merits.* Honest-Alpha framing applies throughout: counsel is the authority class; this draft is a peer-class recommendation. Where this draft says "Bishop-recommended," read it as "the cooperative's preferred starting position, subject to your independent judgment."

**To:** Counsel of Record (gain-share instrument engagement)
**From:** J. Jones, Founder · General Manager · Crewman #6 · Liana Banyan Corporation (EIN 41-2797446 · Wyoming C-Corporation)
**Date:** 2026-06-01 (BP069)
**Re:** The MnemosyneC "gain-share" instrument — four open structural questions for counsel ratification before any counterparty conversation.

---

## §0 — What the Instrument Is For (one-paragraph factual frame)

Liana Banyan has built **MnemosyneC**, a content-addressed shared-memory substrate for AI agents, using openly published tooling from the major AI vendors (Anthropic, OpenAI, Google) and on top of free local models (Ollama). An independently reproducible benchmark (BP065, COLD-vs-HOT, 4 vendor families, Cohen's κ 0.936, source `BENCHMARK_RESULTS_BP063_20260530_2216.md`) measured an **accuracy lift of +72 to +83 percentage points** when a model is given the shared substrate versus operating cold. The cooperative's commercial proposal to the major AI vendors ("the FOIL," paper `PAPER_HOW_TO_USE_MNEMOSYNE_FOR_GOOD_SCAFFOLD_BP065.md`, Part III) is: **the counterparty incorporates MnemosyneC, keeps 80% of the verified savings it produces, and pays the cooperative 20% of those verified savings.** The Founder has **RATIFIED the 20% figure (2026-06-01)**. The 20% is no longer open. What remains open — and what counsel is asked to resolve — is the **legal form of the instrument that carries that 20%.**

> **Truth-Always scope note for counsel:** The benchmark measures *accuracy lift*, not a literal compute-cost or dollar-savings percentage. The "savings" the 20% is computed from is therefore a quantity that must be **defined in the instrument itself** (see Question 2). Do not assume a measured dollar-savings figure exists today; it does not. The instrument has to create the definition and the measurement mechanism.

---

## Question 1 — Is the instrument a LICENSE, a COVENANT-NOT-TO-SUE, or a REVENUE-SHARE (or a hybrid)?

**Bishop-recommended structure: a HYBRID — a patent + know-how LICENSE that grants affirmative permission to practice, paired with a separate REVENUE-SHARE (gain-share) payment covenant, and backstopped by a defensive COVENANT-NOT-TO-ASSERT that mirrors Cooperative Defensive Patent Pledge #2260.**

Reasoning (for counsel to confirm):

1. **Why a license at all, and not a bare covenant-not-to-sue.** A counterparty incorporating MnemosyneC will want *affirmative permission* to practice the cooperative's patented methods and to use its know-how/specifications — not merely a promise that LB won't sue. A bare covenant-not-to-sue gives the counterparty no positive grant, no defined field of use, no quality/attribution terms, and a weaker basis on which to compute and audit the gain-share. A license is the cleaner vehicle for a *commercial deal between sophisticated parties.*

2. **Why pair it with a covenant-not-to-assert (the #2260 mirror), not rely on the license alone.** The HL5 memo (BP048, §6 Q1) already settled, as Bishop-preferred-and-pending-counsel, that the cooperative's *defensive* patent grant should run as a **covenant-not-to-assert running with the estate, with a defensive-termination (suspension) trigger** — specifically to *avoid the licensee-estoppel and patent-misuse exposure that pure licenses carry.* The recommendation here is consistent: keep the broad defensive peace as a covenant (so the world, including this counterparty, is protected against offensive assertion), and layer the *commercial* license + payment on top for the specific counterparty that wants to monetize savings. This separates the "we will not weaponize the patents" promise (covenant, runs broadly) from the "you may commercially incorporate and you pay 20%" deal (license + revenue-share, runs to this counterparty).

3. **Why the 20% is structured as a revenue-share PAYMENT COVENANT and not as a running royalty on the patent itself.** Framing the 20% as a *running patent royalty* invites two known hazards: (a) **patent-misuse / royalty-after-expiry** problems (*Brulotte v. Thys*; *Kimble v. Marvel* — royalties cannot extend past patent expiration without a misuse/unenforceability risk), and (b) tying the fee to the *patent* rather than to the *value delivered.* The Bishop-recommended frame is the one already in the paper (Part III): the 20% is **a share of independently verified savings that would not exist without MnemosyneC** — structurally a *discount the counterparty elects*, not a toll. Drafting it as a **payment covenant measured on verified savings** (a contractual obligation between sophisticated parties), rather than as a patent royalty, (i) decouples the payment term from patent life, (ii) lets the know-how/trade-secret and ongoing-substrate-service elements carry the consideration even after any patent expires, and (iii) frames the consideration as value-delivered, which is also better for the audit mechanic in Question 2.

4. **Securities / Howey — why this structure does not create an investment contract.** The HL5 memo (§6 Q4) records the cooperative's standing Howey position: no investment contract where there is *no expectation of profit from the efforts of others.* The gain-share instrument should be drafted so the counterparty's payment is **consideration for a license + a service/substrate it itself operates**, not a passive investment in LB's enterprise. The counterparty is paying *for* something it uses; it is not buying a profit-participation in LB. Bishop-recommended: include an express recital that the instrument is a commercial license-and-services arrangement between sophisticated commercial parties, not a security, not an investment contract, and that neither party expects profit from the managerial efforts of the other. **Counsel to confirm Howey is not implicated.**

> **★ THE SPECIFIC POINT COUNSEL MUST CONFIRM (Q1):**
> Confirm the three-part hybrid — (a) commercial **license** (affirmative grant + field of use + the 20% payment covenant), (b) separate **covenant-not-to-assert** mirroring Pledge #2260 to avoid licensee-estoppel/patent-misuse exposure, and (c) the 20% drafted as a **verified-savings payment covenant, NOT a patent running royalty**, to sidestep *Brulotte/Kimble* post-expiry royalty hazards. Confirm or replace this structure, and confirm the no-securities/no-investment-contract recitals are sufficient.

---

## Question 2 — AUDIT RIGHTS: how does the counterparty let LB verify the "savings" the 20% is computed from?

**Bishop-recommended structure: a three-layer mechanism — (1) a DEFINED SAVINGS FORMULA written into the instrument, (2) COUNTERPARTY SELF-REPORT on a fixed cadence against that formula, (3) an INDEPENDENT AUDIT RIGHT (third-party, confidential, cost-shifting on material under-report) as the verification backstop.**

Reasoning (for counsel to confirm):

1. **Layer 1 — Define "savings" in the instrument; do not leave it to argument.** Per the Truth-Always note in §0, there is no pre-existing dollar-savings number. The instrument must *create* the definition. Bishop-recommended baseline definition: *savings = (counterparty's measured per-unit inference/context cost WITHOUT the MnemosyneC substrate) minus (the same cost WITH the substrate), multiplied by qualifying volume over the period, net of the counterparty's reasonable substrate-operating cost.* The cooperative's own benchmark methodology (COLD-vs-HOT, reproducible harness `librarian-mcp/r10_cross_vendor/run_benchmark.py`) is the **template for how a baseline is established**, but the contractual figure must be the *counterparty's own measured production figure*, not LB's lab benchmark. (Honesty flag: the public benchmark proves *accuracy lift*, which is the qualitative case; the *dollar-savings* figure is counterparty-specific and is what the formula computes.)

2. **Layer 2 — Self-report on cadence.** Counterparty reports qualifying volume and the formula inputs quarterly (or per counsel's preferred period), with a certification by an officer. The paper (Part III, "Auditable Receipts, Not Vendor Self-Report") states the *aspiration* that the fee not rest on bare vendor self-report; the mechanism that honors that aspiration is **self-report that is verifiable**, i.e., self-report + audit right, not self-report alone.

3. **Layer 3 — Independent audit right (the backstop that makes self-report safe).** LB (or an independent CPA/technical auditor bound by confidentiality, chosen by LB or by a neutral process) may audit the counterparty's relevant records on reasonable notice, no more than once per period absent cause. **Cost-shifting:** LB bears the audit cost unless the audit finds an under-report exceeding a materiality threshold (e.g., 5%), in which case the counterparty bears the audit cost and trues-up plus interest. This is the standard sophisticated-party royalty-audit mechanic and it is what converts "self-report" into "auditable."

4. **Confidentiality / proprietary-data tension (counsel's call).** The paper asserts (Part III) "a vendor cannot dispute the fee by claiming their numbers are proprietary." Bishop flags this as **aspirational, not yet a drafted mechanism** — a large counterparty *will* treat its inference-cost data as highly proprietary. The realistic reconciliation is: the audit runs through an **independent third party under NDA** who reports only the *computed savings figure and whether the self-report was accurate within the materiality band* back to LB, not the underlying raw cost data. This preserves the counterparty's secrecy while still verifying the fee. Counsel should decide whether to require the raw methodology to be open (LB's stated preference) or to accept the NDA'd-third-party compromise (Bishop's view of what a sophisticated counterparty will actually sign).

> **★ THE SPECIFIC POINT COUNSEL MUST CONFIRM (Q2):**
> Confirm the three-layer audit mechanic (defined formula → certified self-report → independent NDA'd third-party audit with materiality-triggered cost-shifting and true-up). Critically: decide the **proprietary-data posture** — does the instrument demand open methodology (Founder/paper preference, harder to sign) or accept a confidential third-party-auditor reconciliation (Bishop's pragmatic recommendation)? And confirm the **savings-formula definition** is precise enough to be enforceable and not void-for-uncertainty.

---

## Question 3 — The NONPROFIT / SMALL-BUILDER MERCY CLAUSE: how does it work?

**Bishop-recommended structure: a tiered eligibility clause keyed to objective thresholds — FREE below a small-actor threshold; REDUCED RATE in a middle band; full 20% gain-share only above a large-actor threshold — with the free/reduced grant drafted as a unilateral, revocable-only-for-cause grant so it cannot be construed as patent misuse or as creating securities/partnership expectations.**

Reasoning (for counsel to confirm):

1. **Eligibility by objective threshold, not by LB discretion.** To be enforceable and non-arbitrary, eligibility should turn on *objective, verifiable* criteria, e.g.: (a) **501(c)(3) / recognized non-profit status**, (b) **annual revenue or AI-spend below a defined ceiling**, (c) **headcount below a defined size**, or (d) **academic/research use.** Bishop-recommended: any one qualifying criterion places the actor in the free tier; the middle (reduced-rate) band catches actors who have grown past "small" but are not yet "large-scale actors who reap large-scale savings" (the paper's own line, Part III). Thresholds are counsel-and-Founder's call; the *structure* (objective tiers, not case-by-case mercy) is the recommendation.

2. **Why "mercy" must be structural, not discretionary.** The paper frames the mercy clause as *"not generosity… architecture"* (Part III). Legally, that instinct is correct for a second reason: a *discretionary* free-license-for-favored-parties pattern is messier to administer and could invite arguments of inconsistent enforcement. An **objective-threshold, automatically-applied** mercy tier is cleaner.

3. **Consistency with Pledge #2260 and SSPL ethos.** The paper ties the mercy clause to *"the same logic as the SSPL + Cooperative Defensive Patent Pledge #2260 — the patent portfolio protects cooperative operators worldwide, not weaponized against them."* The mercy tier should be drafted so that the **covenant-not-to-assert (Q1) already protects everyone defensively**, and the mercy clause additionally **waives the commercial 20% payment covenant** for small/non-profit actors. I.e., small actors get the same affirmative license a large actor gets, but with the payment obligation set to zero (free tier) or reduced (middle tier). Keeping the *grant* identical and only flexing the *payment* keeps the instrument coherent.

4. **Patent-misuse and "no strings" hygiene.** Drafting the free grant as a clean, unilateral grant (with revocation only for defensive-suspension cause, mirroring #2260) avoids attaching conditions that could be read as misuse, and matches the public "No Ads · No Strings" posture.

> **★ THE SPECIFIC POINT COUNSEL MUST CONFIRM (Q3):**
> Confirm the **objective-threshold tiering** (free / reduced / full) is the right vehicle versus a discretionary waiver, and set/bless the actual thresholds (non-profit status, revenue ceiling, headcount, academic use). Confirm the free-tier grant is drafted so it (i) creates no patent-misuse exposure, (ii) creates no implied partnership/securities expectation, and (iii) is consistent with the Pledge #2260 covenant and the SSPL ethos.

---

## Question 4 — SUBCHAPTER-T interaction: is gain-share revenue patronage-sourced or non-patronage income?

**Bishop-recommended position (FLAGGED FOR TAX COUNSEL — this is the question most squarely outside a non-lawyer's competence): the gain-share royalties are most likely NON-PATRONAGE income, because they arise from transactions with NON-MEMBER counterparties (the AI vendors), not from business done WITH or FOR the cooperative's members.**

Reasoning (for tax counsel to confirm):

1. **The patronage / non-patronage line.** Under IRC Subchapter T, a cooperative may deduct **patronage dividends** — amounts paid to members out of net earnings **from business done with or for its members** (the "patronage-sourced" income). Income that does *not* arise from member business is **non-patronage income**, which generally does **not** qualify for the patronage-dividend deduction and is taxed at the cooperative level like ordinary C-corp income. (LB is a Wyoming **C-Corporation** operating under Subchapter T, per the HL5 memo and `canonical_values.yaml`.)

2. **Why gain-share looks non-patronage.** The AI vendors paying the 20% are **counterparties, not members.** They are not $5/year cooperative members; they are not earning patronage; the revenue is a commercial license/services payment from an outside enterprise. On the classic facts, income from non-member, third-party commercial dealings is **non-patronage-sourced** and is **not** deductible as a patronage dividend. This is the Bishop-recommended *starting* characterization. (Compare the cooperative's *internal* economics — §13.7, the four-tier currency mechanic — which IS patronage-sourced and rides the patronage-dividend / capital-credits machinery; gain-share sits *outside* that machinery.)

3. **Two consequences the cooperative should plan for (tax counsel to confirm):**
   - **(a) Cooperative-level tax.** If gain-share is non-patronage income, it is likely taxed at the LB C-corp level before any downstream use. The "20% of savings funds the sixteen initiatives" narrative (Part IV) should be understood net of that cooperative-level tax — the initiatives are funded from **after-tax** non-patronage earnings, unless counsel identifies a path to treat any portion as patronage-sourced or to offset it.
   - **(b) Possible UBIT / characterization wrinkles.** Because the income is royalty/license-flavored and from outside business, counsel should check whether any portion implicates unrelated-business or special-allocation rules, and how it interacts with the §13 Annual Allocation Statement and §13.7 currency mechanic (which were ratified, BP048, as the *patronage* mechanic — gain-share should be **walled off from** that mechanic unless counsel finds a basis to bridge them).

4. **A path counsel may explore (Bishop raises, does not assert).** If the cooperative wants gain-share to reach members through the patronage mechanic rather than being trapped as taxed non-patronage income, counsel may consider whether any structuring (e.g., routing gain-share through an entity or characterization that ties it to member business, or treating the substrate-operation as member-facing) could change the sourcing. **Bishop does NOT recommend assuming this works** — it is exactly the kind of aggressive sourcing question that needs a cooperative-tax specialist and that, done wrong, jeopardizes the whole Subchapter-T posture (HL5 §3 item 2: "if §11–13 do not cohere as one mechanic, patronage tax treatment is at risk"). Default assumption: **non-patronage, taxed at cooperative level.**

> **★ THE SPECIFIC POINT TAX COUNSEL MUST CONFIRM (Q4):**
> Confirm whether gain-share royalties from non-member AI vendors are **non-patronage income** (Bishop's default assumption) or whether any defensible path treats them as patronage-sourced. Confirm the **cooperative-level tax consequence** and whether the Part IV "funds the initiatives" narrative must be restated as *after-tax*. Confirm gain-share is properly **walled off from** the §13 / §13.7 patronage + capital-credits mechanic (or, if bridged, how). Flag any UBIT/characterization issues. **This is a cooperative-tax-specialist question; treat the above as a non-lawyer's issue-spot, not an answer.**

---

## §5 — Summary of the Five Points Counsel Must Return

| # | Question | Bishop-recommended structure | The point counsel must confirm |
|---|----------|------------------------------|-------------------------------|
| 1 | Instrument form | Hybrid: commercial **license** + **covenant-not-to-assert** (#2260 mirror) + 20% as a **verified-savings payment covenant, not a patent royalty** | Confirm the hybrid; confirm payment-covenant framing avoids *Brulotte/Kimble* post-expiry royalty + licensee-estoppel/misuse; confirm no-securities/Howey recitals suffice |
| 2 | Audit rights | **Defined savings formula → certified self-report → independent NDA'd third-party audit** with materiality-triggered cost-shifting + true-up | Confirm the mechanic; resolve **open vs. confidential-proprietary** data posture; confirm formula is enforceable / not void-for-uncertainty |
| 3 | Mercy clause | **Objective-threshold tiers** (free / reduced / full 20%), grant identical, only the payment flexes, revocable-only-for-cause | Confirm objective-tier vehicle + set thresholds; confirm free grant creates no misuse / partnership / securities exposure |
| 4 | Subchapter-T | Gain-share is most likely **NON-PATRONAGE income** (non-member counterparties), taxed at co-op level, **walled off** from §13/§13.7 patronage mechanic | **TAX-COUNSEL CALL:** confirm patronage vs. non-patronage sourcing, cooperative-level tax, after-tax restatement of Part IV, UBIT/characterization, wall-off from the patronage mechanic |

---

## §6 — Provenance / Sources Cited (Truth-Always)

- **20% RATIFIED:** Founder, 2026-06-01 (BP069). Canon refs: FOIL/gain-share `pearl_9a5bedc5` (FOIL-to-big-AI, gain-share, "How to Use for Good"); `pearl_71edf0c5` (gain-share refinement). *Note: these pearl IDs are cited from the Bishop memory index; the substantive content used in this draft is taken from the paper named below, which is the canonical written source.*
- **Paper (Part III — gain-share structure, mercy clause, audit aspiration):** `BISHOP_DROPZONE/08_Papers/PAPER_HOW_TO_USE_MNEMOSYNE_FOR_GOOD_SCAFFOLD_BP065.md`.
- **Benchmark (accuracy-lift evidence, +72–83pp, κ 0.936):** `BENCHMARK_RESULTS_BP063_20260530_2216.md`; harness `librarian-mcp/r10_cross_vendor/run_benchmark.py`.
- **Patent-pledge covenant precedent (Q1) + Howey posture (Q1):** `Asteroid-ProofVault/counsel_packages/COUNSEL_HL5_COVER_MEMO_EXEC_SUMMARY_BP048.md`, §3 item 1 and §6 Q1, Q4. Cooperative Defensive Patent Pledge #2260.
- **Subchapter-T patronage mechanic (Q4 — what gain-share is walled off FROM):** `BISHOP_DROPZONE/02_PawnReturns/PAWN_RETURN_SECTION_13_7_PLATFORM_CURRENCY_ACTIVITY_BP048.md` (§13.7 four-tier currency / capital-credits / phantom-income); HL5 §3 item 2, §6 Q7.
- **Entity facts:** `canonical_values.yaml` via librarian — Liana Banyan Corporation, EIN 41-2797446, Wyoming C-Corporation, $5/year membership, Cost+20%, 83.3% creator-and-worker keep, 16 initiatives.
- **Case-law flags raised for counsel (NOT legal conclusions):** *Brulotte v. Thys Co.*, 379 U.S. 29 (1964); *Kimble v. Marvel Entertainment*, 576 U.S. 446 (2015) — post-expiry patent-royalty hazard. *SEC v. W.J. Howey Co.*, 328 U.S. 293 (1946) — investment-contract test. IRC Subchapter T (§§1381–1388) — cooperative patronage taxation. Bishop is not a lawyer; these citations are issue-spotting pointers for counsel to verify and apply.

---

*Prepared by Bishop (Opus 4.8 · 1M) as a BP069 SEG for the Liana Banyan operating crew · Non-lawyer draft · Truth-Always: no invented numbers, no asserted legal conclusions, every characterization marked counsel-to-confirm · 2026-06-01.*
