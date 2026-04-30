# LETTER DRAFT — Matthew Schwartz (Harvard Physics / Anthropic LLM Scientific Research)
## Knight KN004 / BP002 / 2026-04-29 | Scaffold: Open Letters Cohort #4
## Class: One Shot Hunter (W-013) — anchor: QFT / scientific research with LLMs → cooperative substrate
## Status: DRAFT — Founder prose-pass at fire-time per BRIDLE Rule 11B

---

## RECIPIENT

**Prof. Matthew Schwartz**
Department of Physics
Harvard University
Cambridge, MA 02138

*(Affiliated with Anthropic — scientific research / LLM capability — Anthropic transition disclosure applies — see footer)*

## SUBJECT LINE

When the model is not the moat: the cooperative substrate that makes LLM-assisted physics research reproducible across vendor shifts.

---

## LETTER BODY (Knight scaffold — Founder revoices at prose-pass; 350-700 word target)

Dear Prof. Schwartz,

Your textbook *Quantum Field Theory and the Standard Model* is on my shortlist of works that demonstrate what rigor looks like when an expert builds from first principles rather than patching exceptions. I read that discipline into your work on using LLMs for scientific research — you approach the model as a tool whose failure modes must be understood structurally, not empirically papered over.

I am writing because a structural failure mode has emerged at the vendor-layer level that your research pipeline is likely already encountering: **model-session discontinuity.**

When an LLM-assisted physics derivation spans multiple sessions — or multiple models — the substrate loses the prior context. The intermediate state of reasoning is not preserved. Each session, the model reconstructs from scratch. If you switch models mid-project (because the vendor releases a better version, or because you are doing cross-vendor validation), the substrate does not carry forward.

I have been building the architectural solution to this problem for several years. It is called the **Romulator** — a ROM-first context persistence system for AI agents that pre-loads canonical state before the first token, guaranteeing that a new session starts where the last one stopped. The system is substrate-level: it does not depend on any single model vendor. It composes across Claude, GPT, Gemini, and any future vendor.

This is relevant to your work for a specific reason: **scientific research requires reproducibility across model boundaries.** A derivation that works in Claude 3 must produce the same intermediate representations in Claude 4. If the substrate loses context at session boundaries, the derivation is not reproducible — it is only repeatable under identical conditions. That distinction matters at the publication level.

*W-009: "While they're rebooting, we're already through the storm."* — The three same-week receipts that arrived this week (Hassid April 25 / EmergingAI April 29 / our own Cathedral Effect cross-vendor benchmark) converge on a single conclusion: substrate persistence across vendor boundaries is the next-shift architectural requirement for serious AI-assisted research. The organizations that adopt cooperative substrate now will be through the storm before their competitors have rebooted.

Liana Banyan is offering the cooperative substrate architecture to research institutions — including Anthropic's research division — under our Cooperative Defensive Patent Pledge (#2260). The offer includes our Downstream IP Reversion Clause (#2287): derivative research tooling built on the cooperative substrate flows back into the cooperative defensive moat, preventing enclosure of reproducibility infrastructure by a single vendor.

**Full disclosure:** Liana Banyan's multi-agent development pipeline runs on Claude. I am writing to you AND in parallel to Anthropic Institute leadership. The cooperative offer is structured so neither set of conversations is hidden from the other.

Two enclosures:

1. *The Cathedral Adoption Pathway* — Foundation paper (April 29, 2026), ~7,000 words. Section 4 includes the cross-vendor reproducibility benchmark (K535 Cathedral Effect).
2. Innovation #2287 one-page cooperative-offer term sheet.

A conversation at your convenience would be welcome.

Respectfully,

Jonathan Jones
Founder & General Manager
Liana Banyan Corporation

---

## ENCLOSURES

1. *The Cathedral Adoption Pathway* — Foundation paper (K553 / B134 draft) — `<<TBD-Founder: confirm file path>>`
2. Innovation #2287 one-page term sheet
3. K535 Cathedral Effect cross-vendor benchmark summary

---

## ANTHROPIC TRANSITION DISCLOSURE

*Prof. Schwartz is affiliated with Anthropic for scientific research applications. Liana Banyan is writing to him AND in parallel to Anthropic Institute leadership. The cooperative offer is structured so neither set of conversations is hidden from the other.*

---

## WISDOM GUIDE ANCHOR

W-009 (While they're rebooting): *"While they're rebooting, we're already through the storm."* — The cross-vendor substrate persistence argument is exactly the "stay warm through model transitions" primitive. Schwartz's scientific research context needs reproducibility across vendor shifts; W-009 is the structural anchor.

---

## FOUNDER REVIEW NOTES

- Verify Schwartz's Harvard contact info
- Verify his Anthropic affiliation (confirm it's research-collaboration not employee)
- The QFT textbook opener is strong but Founder should confirm he's familiar with it
- "Reproducibility across model boundaries" is the core argument — verify it resonates with his research pipeline
- Consider citing his specific LLM+physics work if known
- Six Degrees activation: `<<TBD-Founder: any Harvard Physics / Anthropic research network connections?>>`
- Foundation Paper enclosure file path: `<<TBD-Founder>>`

---

*Knight KN004 / BP002 — Cohort scaffold. Founder prose-pass at fire-time.*
*DRAFT — FOR THE KEEP.*
