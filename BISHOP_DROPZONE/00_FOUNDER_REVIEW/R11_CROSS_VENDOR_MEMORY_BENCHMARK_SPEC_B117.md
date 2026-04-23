# R11 — Cross-Vendor Memory Product Benchmark Specification

**Spec version:** 0.1.0-draft
**Opened:** B117, 2026-04-23
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Founder direction:** *"I mostly want is for us to compare to 'ChatGPT Memory, Claude Projects, Gemini Gems, Perplexity Spaces' so that we can prove we rule."*
**Status:** DRAFT — awaiting Founder ratification on methodology + budget before dispatch. **Do NOT run until ratified.**

---

## Strategic framing

R9 benchmarked retrieval lift on LB's canonical corpus against a cold baseline. R10 generalized across 8 models × 4 vendors. **R11 asks a different question: "When the task is member memory, does the LB substrate beat the vendor-native memory products?"**

Target headline: *"We compared LB Cathedral to ChatGPT Memory, Claude Projects, Gemini Gems, and Perplexity Spaces on an identical 50-Q canonical bank. LB 94%. [Next-best] X%. [Worst] Y%."*

Caveat if the numbers DON'T favor LB: the test architecture still publishes. "Honest benchmark that revealed competitive gaps" is a better long-term asset than "marketing benchmark that hid them." Prove-Then-Product applies here too.

---

## The fair-comparison challenge

Each competing product loads content differently. A rigged benchmark would feed each competitor content in its WORST format. A FAIR benchmark feeds each competitor equivalent content in each product's NATIVE-FAVORED format.

| Product | Native content loading |
|---|---|
| **ChatGPT Memory** | User-scoped persistent memory populated via conversation OR direct "remember this" instructions. 1,000–2,000-char limit on individual memories; unlimited total memories per user tier. |
| **Claude Projects** | Reference documents attached at Project level. Up to ~200K tokens of reference content. Works with Claude Sonnet 4.6 + Opus 4.6/4.7. |
| **Gemini Gems** | Custom Gem with instructions + uploaded knowledge files. Files accept PDFs / text documents. Free tier has file-size limits; paid tier ~unlimited. |
| **Perplexity Spaces** | Space with attached knowledge sources (URLs, files). Pro tier required for full file uploads. Uses Sonar models for retrieval-augmented responses. |
| **LB Cathedral (via Companion / hosted)** | `consult_scribes` MCP tool over append-only JSONL tablets. Top-K per-query retrieval. |

### Content equivalence strategy

Option A (simplest): single canonical document, converted to each product's favored format.

1. Generate `r11_canonical_corpus.md` (the benchmark's content fixture) — a curated ~10K-word document containing: 50 canonical facts corresponding to the 50-Q SEALED bank's ground truth + 200 surrounding context paragraphs to make the facts retrievable rather than memorizable.
2. Convert to each product:
   - **ChatGPT Memory:** split into ~30 Memory entries via API + OpenAI CLI. Each entry is a paragraph.
   - **Claude Projects:** upload as single markdown reference document in a new Project.
   - **Gemini Gems:** create a Gem with the document as the attached knowledge source.
   - **Perplexity Spaces:** create a Space with the document as a file attachment.
   - **LB Cathedral:** populate 5 Scribes (R9 / BRIDLE / Landing / Prov14 / Vault) with the same 50 facts, organized per Scribe primary-field match.
3. Each product gets equivalent content. None gets rigged.

Option B (more nuanced): content-shaping per product. Each product's best native format is respected (e.g., ChatGPT Memory uses short personal-style entries; Claude Projects uses structured docs). Less fair-looking at first glance but actually more honest to each product's intended use.

**Recommendation: Option A for the first R11 pass.** Add Option B as a follow-on if competitors complain about unfair loading. First result is defensible; optimizing later is additive.

---

## Benchmark design

### Conditions (8 total)

1. **Cold (no retrieval).** Baseline. Any model, no memory, no projects, no gems, no spaces, no cathedral.
2. **ChatGPT Memory.** GPT-4o or GPT-5 with the loaded Memory state. Use OpenAI API + Memory-enabled endpoint.
3. **Claude Projects.** Claude Sonnet 4.6 OR Opus 4.7 with the loaded reference document. Use Anthropic API with Project-scoped context.
4. **Gemini Gems.** Gemini 2.5 Pro with the configured Gem (accessed via API if available; otherwise Gemini Advanced subscription with manual runs).
5. **Perplexity Spaces.** Sonar-Pro with Space attachment. Perplexity API supports Spaces as of 2026.
6. **LB R9 (preload only, no Cathedral).** Claude Haiku 4.5 with r9v2_base preload via Companion / librarian_context. Baseline for LB substrate.
7. **LB R9 + Cathedral.** Claude Haiku 4.5 with preload + consult_scribes top-10 over the 5 Scribes. Full LB stack.
8. **LB R9 + Cathedral + Opus 4.7.** Premium-model LB stack. Same as condition 7 but Opus. Establishes the ceiling LB offers.

### Question bank

Use `SCEV1_QUESTION_BANK_SEALED.json` as the baseline — same 50 questions, same categories, same ground truth. Cross-reference is valid: SCEV-1 validated the Cathedral; R11 validates the Cathedral vs competitors on the SAME questions.

**BUT the questions are currently heavily LB-specific** (session recall, innovation IDs, Founder-voice keystones). Competitors would perform poorly not because they lack retrieval ability but because their corpus doesn't know LB. **This rigs the test.**

**Fix:** build a **parallel R11 question bank** — same 6 categories, same target distribution (9/8/9/8/8/8), but questions anchored to the `r11_canonical_corpus.md` content rather than LB history. Each product gets exactly the same corpus; each question's answer is recoverable from that corpus. This tests retrieval-architecture-quality, not corpus-familiarity.

### Models

| Product | Model | Rationale |
|---|---|---|
| Cold baseline | Claude Haiku 4.5 + GPT-4o-mini + Gemini 2.5 Flash | Cheap; establishes cold floor per vendor |
| ChatGPT Memory | GPT-4o, GPT-5 | Vendor-native |
| Claude Projects | Sonnet 4.6, Opus 4.7 | Vendor-native |
| Gemini Gems | Gemini 2.5 Pro | Vendor-native |
| Perplexity Spaces | Sonar-Pro | Vendor-native |
| LB R9 | Haiku 4.5, Opus 4.7 | Cathedral-agnostic |
| LB R9+Cathedral | Haiku 4.5 | Production-realistic |
| LB Premium | Opus 4.7 | Ceiling |

Keep models vendor-matched: each competitor benchmarks their own best retrieval-augmented model; LB benchmarks Haiku+Cathedral (production) and Opus+Cathedral (ceiling). Claim the lift numbers per vendor-model pair, not pooled.

### Call budget

8 conditions × 50 questions × 2 model-picks-per-condition (except cold, which uses 3 for cross-vendor cold) × 1 rater = **~800 total API calls**.

Estimated cost at current rates:
- ChatGPT Memory (GPT-4o, GPT-5): ~100 calls × $0.01 = $1
- Claude Projects (Sonnet, Opus): ~100 calls × $0.05 = $5
- Gemini Gems: ~50 calls × $0.01 = $0.50
- Perplexity Spaces: ~50 calls × $0.05 = $2.50
- LB conditions: ~300 calls × $0.01 = $3
- Cold baselines: ~150 calls × $0.01 = $1.50

**Total: ~$15–25** under reasonable caps. Small enough to be dispatchable.

### Grading

R10 three-tier rubric applies directly (HOT / HIT / MISS). Same rubric is fair across all conditions because all conditions answer the same questions. Add a fourth sub-metric: **"Correct because retrieval found it" vs "Correct because model guessed"** — distinguish retrieved-correct from prior-knowledge-correct by comparing to the cold condition's hit pattern per question.

---

## Acceptance criteria

- [ ] R11 canonical corpus (`r11_canonical_corpus.md`) generated (~10K words, 50 canonical facts + 200 context paragraphs)
- [ ] R11 question bank generated (50 Qs, 6 categories, ground-truth-anchored to canonical corpus)
- [ ] All 5 vendor memory products loaded with equivalent content in each product's native format
- [ ] Runner script (`run_r11.py`) calls each condition + records per-call cost + latency + response
- [ ] Grader reuses R10 rubric; inter-rater kappa measured on a 10% subset
- [ ] Summary table shows accuracy + $/correct per condition with confidence intervals
- [ ] Cold baseline matches R10 expected cold (~8.7% mean) — sanity check
- [ ] Pre-registered prediction: LB Cathedral > Claude Projects > ChatGPT Memory > Perplexity Spaces > Gemini Gems > cold. Record prediction BEFORE running so falsification is publishable.

---

## Risks + mitigations

1. **Competitors perform better than expected.** Mitigation: publish honestly; the methodology is defensible; learnings refine the Cathedral. Prove-Then-Product says the evidence is the point.
2. **Competitors perform worse because their product is designed for different use case.** Mitigation: disclaim scope in the paper — "this benchmark measures factual retrieval over a canonical document; it does not measure creative assistance, multi-turn dialogue, or vendor-specific integrations." Competitors' broader value doesn't get erased by a narrow benchmark.
3. **Vendor products change under our feet (rolling releases).** Mitigation: timestamp every run; re-run at Prov 14 filing time; plan for annual R11 re-runs.
4. **ChatGPT Memory / Gemini Gems API limitations make automation hard.** Mitigation: fall back to manual runs for the first R11; build automation as K-sessions if R11-v2 ships.
5. **IP risk from benchmarking competitor products.** Mitigation: benchmarks are protected speech under fair use; we cite the products, use them as intended per their Terms of Service, report results honestly. Counsel review pre-publication.

---

## Deliverable structure

When R11 runs and publishes:

- `r10_cross_vendor/r11_canonical_corpus.md`
- `r10_cross_vendor/R11_QUESTION_BANK_SEALED.json`
- `r10_cross_vendor/results_r11_b117/` (raw JSONL per condition)
- `r10_cross_vendor/run_r11.py`
- `r10_cross_vendor/grade_r11.py`
- `r10_cross_vendor/summarize_r11.py`
- **`08_Papers/Outlines/PAPER_R11_CROSS_VENDOR_MEMORY.md`** — the paper outline
- **`09_Articles/ARTICLE_R11_WE_RULE.md`** — the public-facing explainer if results warrant

---

## Dispatch sequencing

**Do not dispatch R11 before:**

1. Prov 14 is filed (protects the Cathedral architecture before public benchmark publicizes it)
2. SCEV-1 SEALED-50 Knight run completes (validates LB's own substrate first)
3. #2275 Companion filing is in the priority chain (so the Companion distribution strategy is patent-protected if R11 reveals we can't sustain the gap)

**Target dispatch window:** B118 or B119 (week of April 28 – May 5, 2026). Knight session estimate: 6–8 hours (corpus generation + 5 product loads + 800-call run + grading + summary).

**Knight prompt:** not yet written. Draft follows pattern of K423 (R10) + K437 (SCEV-1). Will write when Founder ratifies this spec.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). The test that proves whether "we rule" is empirically defensible. If we do, R11 is the paper that closes the argument. If we don't, R11 is the learning signal that tells us where to improve before member Cathedral ships.*

**AWAITING FOUNDER RATIFICATION ON METHODOLOGY + BUDGET.**
