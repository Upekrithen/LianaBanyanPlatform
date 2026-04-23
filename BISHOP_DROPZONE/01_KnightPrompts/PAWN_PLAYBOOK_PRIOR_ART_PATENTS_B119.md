# Pawn Playbook — Prior Art via Perplexity Patents

**Status:** PRE-STAGED for post-Path-3 (Companion-loaded Pawn). Do not dispatch until K445a + K445b have landed and `liana companion` is pip-installable.
**Pattern name:** Pawn Promotion (Chessboard-canonical) / Grand Fork (tactical pattern)
**Purpose:** Give Pawn a Librarian-loaded prior-art research capability for Prov 14/15+ innovation vetting. Also serves as the first "in-the-wild" empirical test case for R11/R12 — demonstrating start-to-finish token/time savings from the Librarian-loaded workflow vs. the pre-Librarian baseline.
**Author:** Bishop B119 (Claude Opus 4.7)

---

## Assumptions (must hold before dispatch)

1. `pip install liana-companion` works from a clean machine.
2. `liana login` + magic-link completes; session cached at `~/.liana/session.json`.
3. Pawn (Perplexity) is running through a wrapper that pre-invokes `liana cathedral read <scribe>` and injects the retrieved context into the Perplexity prompt before the research task begins.
4. Perplexity's current model includes **Perplexity Patents** mode (or equivalent — check current Perplexity product page; Perplexity Patents was a named mode as of 2025).

If any assumption is false, halt and report. Do NOT degrade to un-Librarian'd research unless Founder explicitly approves the degradation.

---

## Pre-task setup (automated by wrapper)

Before every prompt in this playbook, the Companion wrapper runs:

```bash
liana cathedral read Prov14 --format=context > /tmp/prov14.ctx
liana cathedral read Architecture --format=context > /tmp/architecture.ctx
liana cathedral read Decisions --format=context > /tmp/decisions.ctx
liana scribes query "$INNOVATION_NAME" --limit 10 > /tmp/scribe_matches.ctx
```

Then composes the final Perplexity prompt as:

```
[CATHEDRAL CONTEXT — AUTHORITATIVE]
<contents of /tmp/prov14.ctx>
<contents of /tmp/architecture.ctx>
<contents of /tmp/decisions.ctx>
<contents of /tmp/scribe_matches.ctx>
[END CATHEDRAL CONTEXT]

[TASK]
<prompt from playbook below>
```

Perplexity sees the LB canonical context BEFORE it does any web research. That means prior-art searches are informed by exactly what LB has ratified, not by what Perplexity guesses about the platform.

---

## Playbook prompts (5 core patterns)

### PROMPT 1 — Novelty defense for a single innovation

**Use when:** A&A #XXXX is drafted; Bishop needs prior-art check before Prov filing.

```
Task: Prior-art novelty defense for innovation #<NUMBER> — "<NAME>".

The innovation is described in the Cathedral context above. Your job:

1. Search Perplexity Patents, Google Scholar, USPTO, WIPO PATENTSCOPE, and
   recent (2020-2026) academic literature for closest prior art.

2. For each candidate prior-art item found, rate:
   - Similarity to the innovation: High / Medium / Low
   - Earliest publication date
   - Which specific claim it would anticipate vs. which it would not
   - Jurisdiction + citation format (patent number, DOI, URL)

3. Identify which of our innovation's structural claims are STRONGEST
   against prior art (survive challenge) vs. WEAKEST (likely to be
   narrowed in prosecution).

4. Identify 2-3 claim-language refinements that would strengthen our
   position before filing.

5. Explicit red flags: any prior art within 1 year of our filing date
   that anticipates 50%+ of our independent claims = STOP and flag
   loudly.

Output format: structured markdown with a Findings Matrix, Claim
Strength Analysis, Recommended Refinements, and Red Flags sections.
Include citations. Budget: $5 per run.
```

### PROMPT 2 — Landscape analysis for a category

**Use when:** Bishop is mapping defensive posture for a whole category (e.g., "cooperative-economic platforms" or "vendor-neutral AI routing").

```
Task: Landscape analysis for category "<CATEGORY>".

Given LB's position in this category (described in Cathedral context above),
map the competitive + patent landscape.

1. Top 10 players in this category. For each:
   - Company / project name
   - Relevant patent portfolio size
   - Key patents (3-5 per player, most relevant to our space)
   - Clear strategic posture vs. LB (compete / adjacent / complementary)

2. Active patent prosecution in this space over the last 36 months:
   - Recent USPTO applications (published + granted)
   - Recent EPO / WIPO filings

3. Gaps LB could defensibly occupy:
   - Unclaimed structural features in the category
   - Cooperative-economic or SEC-compliant angles that solo-vendors can't take

4. Risk map: any player filing aggressively against our space?

Output: Landscape Map (markdown table), Gap Analysis, Risk Map with
specific entity + filing trends. Budget: $8 per run.
```

### PROMPT 3 — Cite-check a specific claim

**Use when:** Bishop or counsel needs one claim defended against a specific prior-art challenge.

```
Task: Cite-check claim "<CLAIM TEXT>" against prior art.

Given the claim context in Cathedral context above, research:

1. Does any single prior-art item fully anticipate this claim? If yes —
   cite it, quote the anticipating language, and explain the mapping
   element-by-element.

2. Does any combination of 2-3 prior-art items create an obviousness
   challenge (KSR analysis)? If yes — show the combination with
   motivation-to-combine argument.

3. What's the claim's strongest distinguishing feature vs. the best
   prior art you found?

4. Would you advise filing as-is, or narrowing first?

Output: Anticipation Analysis, Obviousness Analysis, Distinguishing
Feature, Filing Recommendation. Budget: $4 per run.
```

### PROMPT 4 — Open-source / non-patent prior art sweep

**Use when:** Innovation touches software architecture; need to check GitHub, arXiv, open RFCs.

```
Task: Non-patent prior-art sweep for innovation #<NUMBER> — "<NAME>".

Patents aren't the only prior art. Search:

1. GitHub — any public repo implementing a similar architecture?
   Check: starred projects, active forks, recent (2023-2026) commits.
   Return top 5 with LOC size, stars, last-commit date, license.

2. arXiv + ACM + IEEE — any paper describing this architecture, even
   partially? Especially conference proceedings from CHI, USENIX,
   NeurIPS, ICML, ICLR, EMNLP in the last 36 months.

3. Technical blog posts (high-signal only: ACM Queue, USENIX login,
   vendor engineering blogs). Skip Medium / Dev.to / LinkedIn content.

4. Open RFCs / standards drafts (IETF, W3C, Khronos) — is there a draft
   standard that covers this?

5. Product launches — any shipped product (2024-2026) that does
   what our innovation does? Even adjacent-niche.

Output: GitHub Findings, Academic Findings, Blog/Standard Findings,
Shipped Product Findings. Flag any item that would weaken our novelty
claim. Budget: $5 per run.
```

### PROMPT 5 — Freedom-to-operate (FTO) analysis

**Use when:** LB is about to ship a feature publicly and wants to confirm no one holds a blocking patent.

```
Task: Freedom-to-operate for LB feature "<FEATURE NAME>".

The feature is described in Cathedral context above. Research:

1. Any ACTIVE (not expired) patent with independent claim(s) that would
   read on our implementation? Search by jurisdiction:
   - US (USPTO — granted + pending published apps)
   - EP (EPO)
   - JP (JPO)
   - CN (CNIPA)

2. For each flagged patent, provide:
   - Patent number + filing date + expiration date
   - Independent claim(s) of concern (full text)
   - Element-by-element mapping to our feature
   - Design-around options that avoid the claim

3. Licensing landscape: are any of these patentees running active
   licensing programs? RAND/FRAND obligations?

4. Net recommendation: Ship / Ship with design-around / Hold for
   legal review / Seek license.

Output: Blocking Patent Analysis, Design-Around Options, Licensing
Landscape, Recommendation. Budget: $10 per run (this is the most
expensive pattern; rate-limit to once per feature).
```

---

## Logging discipline (mandatory per B119 Three Fates enforcement)

Every run of these prompts appends to `librarian-mcp/stitchpunks/data/pawn_prior_art_audit.jsonl`:

```json
{
  "ts": "2026-XX-XX...",
  "prompt_id": "1-novelty | 2-landscape | 3-cite | 4-nonpatent | 5-fto",
  "innovation_or_feature": "...",
  "perplexity_cost_usd": 0.0,
  "runtime_seconds": 0,
  "clarifying_questions_asked_by_pawn": 0,
  "findings_count": 0,
  "red_flags_raised": 0,
  "session_id": "B..."
}
```

This ledger feeds R12 analysis — it's the data that proves start-to-finish Librarian-loaded-Pawn saves time + tokens + clarifying-question-burden vs. unassisted Perplexity research.

---

## R11 / R12 integration (why this playbook is also an experiment)

Each playbook run is an **empirical data point** for the Librarian-loaded-Pawn hypothesis. We record:

- **Clarifying questions asked by Pawn BEFORE producing output.** Hypothesis: with Cathedral context injected, Pawn asks 0-1 clarifying questions. Without, Pawn asks 3-9.
- **Total tokens used (input + output).** Hypothesis: Cathedral-loaded runs are 20-50% fewer tokens because fewer round-trips.
- **Wall-clock time to first useful output.** Hypothesis: Cathedral-loaded runs complete in 1/3 to 1/2 the time.
- **Quality of final output (graded by Bishop).** Hypothesis: Cathedral-loaded runs score 2-3× on the grading rubric because Perplexity starts from LB canon instead of guessing.

After 20-30 playbook runs, we have enough data to report in an **R12 extension paper: "How Much Does a Librarian Save the AI Research It Assists?"** Target: INDL-9 Geneva 2026 or next venue.

This playbook is therefore **dual-purpose**: (1) actually-defends Prov 14+ filings with prior-art research, and (2) produces empirical data for a published methodology claim.

---

## Grand Fork summary (what this single playbook does)

| Target hit | Mechanism |
|---|---|
| 1. Pawn actually has Librarian | Companion wrapper pre-injects Cathedral context every run |
| 2. Prov 14+ filings get real prior-art defense | Five specific prompt patterns, each serving a distinct filing need |
| 3. R12 empirical data on Librarian-value | Every run logs clarifying-questions / tokens / time / quality |
| 4. First non-LB-agent user of Companion CLI | Pawn becomes a reference integration for eventual member adoption |

One playbook. Four distinct strategic wins. Chess move: **Pawn Promotion.**

---

*Playbook authored by Bishop B119, 2026-04-23. Ships on K445b landing (Companion to PyPI). Supersedes no prior artifact — this is a new Pawn capability surface.*
