---
title: "PROV_22 Style Guide — Derived from v02 Draft"
status: founder-ratify-pending
class: style-reference
prov_target: PROV_22
bp_session: BP084
model: Sonnet 4.6
date: 2026-06-16
---

# PROV_22 Style Guide (SEG-1 Deliverable)

Derived from reading `Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_DRAFT_v02.md` (649 lines, 27 Claim Groups, 34 Innovation Areas).

---

## 1. Top-Level Document Structure

```
# PROVISIONAL PATENT APPLICATION
**Title:** [Long multi-phrase title]
**Applicant / Inventor / Application Type / Related Applications / A&A Class / Filing Date / Version**
---
## TITLE
## BACKGROUND OF THE INVENTION
### Field of the Invention
### Background and Problem Statement
### Empirical Receipt
---
## SUMMARY OF THE INVENTION
[Numbered list of all innovation areas]
---
## DETAILED DESCRIPTION OF THE PREFERRED EMBODIMENTS
### Claim Group 1: [Title]
### Claim Group 2: [Title]
... continuing through Claim Group N
---
## CLAIMS
## BRIEF DESCRIPTION OF DRAWINGS
## ABSTRACT
```

---

## 2. Innovation Section Format (each Claim Group)

Each innovation area follows this structure exactly:

```markdown
### Claim Group N: [Innovation Area Title]

#### Background and Problem Statement

[2-4 paragraphs. States the problem in the art. Cites no prior system provides X, Y, Z.
The empirical motivation may include a Founder anecdote or empirical observation.
Ends with: "No prior system provides [the specific combination claimed]."]

#### Detailed Description

**N.1** A computer-implemented [method/system/mechanism] comprising:
(a) first element;
(b) second element;
...
wherein [key distinguishing characteristic].

**N.2** The [method/system] of N.1 wherein [additional specificity].

**N.3** The [method/system] of N.1 wherein [additional specificity].

[Typically 4-6 sub-claims per Claim Group]

#### Empirical Receipt and Reduction to Practice

[1-3 paragraphs. States what was empirically demonstrated. References BP session where
ratified. States reduction-to-practice evidence. May reference specific machine
configurations, benchmark numbers, or Founder-direct ratification quotes.]

---
```

---

## 3. Claim Language Conventions

- **Opening:** "A computer-implemented [method/system/mechanism] comprising:"
- **Elements:** labeled (a), (b), (c)... with semicolon-separated phrases
- **Universal quantifiers:** "each," "every," "any" — followed by constraint
- **Wherein clauses:** used for dependent claim specificity
- **Cross-references:** "Claim Group N" (not "Claim N.1") in prose; "N.1" in formal claims
- **Measurement precision:** exact numbers when ratified (e.g., "approximately 1,000 milliseconds," "83.3%")
- **Structural prohibitions:** "is prohibited from X by structural [mechanism]"

---

## 4. Voice and Register

- **Patent-formal:** third-person, passive/instrumental voice ("comprising," "wherein")
- **No hedging** in claims ("may," "might") — claims use "is," "comprises," "wherein"
- **Anecdotes/motivations** live in Background section, not claims
- **Numbers:** spell out at start of sentence; use numerals mid-clause
- **Abbreviations:** introduced in full at first use (e.g., "Truth Integrity Chain (TIC)")

---

## 5. Diagram Conventions

- **Preferred:** Mermaid flowchart syntax (renders in Hugo/GitHub)
- **Fallback:** ASCII art box-and-arrow diagrams
- **Label format:** Figure [Letter]: [Descriptive Title]
- **No inline images** — all diagrams are either Mermaid code blocks or ASCII
- **Existing figure sequence:** Figures 1-19 used in v01+v02; new sections begin at Figure 20

---

## 6. Numbering Conventions

- **v01:** Claim Groups 1-15, Innovation Areas 1-23
- **v02:** Claim Groups 16-27, Innovation Areas 24-34
- **v03 (these new sections):** Claim Groups 28+, Innovation Areas 35+
- **Sub-claims:** N.1, N.2, N.3... (patent-standard dependent claim numbering)
- **Innovation Area titles** listed in SUMMARY OF THE INVENTION numbered list

---

## 7. Empirical Receipt Pattern

Every section closes with "Empirical Receipt and Reduction to Practice" that:
1. States the BP session where the innovation was ratified ("ratified during BP084")
2. Names who ratified ("by Founder," "Founder-direct")
3. States the mechanical basis for "reduction to practice"
4. Composes with prior receipts where relevant ("Composes with 97.1% MMLU-Pro receipt")

---

## 8. A&A Format (Analytical Anticipatory)

The "A&A" designation in the document header (`A&A Class: Analytical Anticipatory`) means:
- **Analytical:** Problem-first framing. State clearly what the prior art fails to do.
- **Anticipatory:** Forward-looking claims. Claim the mechanism, not just the instance.
- In Background sections: Anecdote/motivation FIRST, then technical gap statement.
- In Detailed Description: precise technical claims SECOND, ordered general→specific.

---

## 9. Patent-Counsel Notes

- v02 header: `v02 · Claim Groups 1-27 · June 15, 2026`
- New sections labeled "v03 additions" in integration
- "Formal independent and dependent claims will be crystallized in the corresponding non-provisional application" — all claims here are provisional/placeholder
- The applicant reserves right to file non-provisional claiming priority to all disclosed innovations
- Section footer: `*Liana Banyan Corporation · Inventor: J. Jones · Provisional Patent Application*`

---

*SEG-1 output · BP084 · Sonnet 4.6 · 2026-06-16*
