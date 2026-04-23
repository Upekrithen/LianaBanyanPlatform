# R11 Pre-Registered Prediction

**Committed:** 2026-04-23 (K444, B119 session)
**Committed BEFORE any API call.** This file was written and committed prior to running a single benchmark query. Falsifiability via prior commitment.
**Corpus:** R11-CANONICAL-K444 (`r11_canonical_corpus.md`)
**Bank:** `R11_QUESTION_BANK_SEALED.json` (50 questions, 6 categories)
**Benchmark:** 13 conditions × 50 questions = 650 primary calls

---

## Predicted Ranking (HOT% descending)

> **K444 Knight's pre-run prediction. To be compared against actual results in `results_r11_K444/summary_r11.md` after the run.**

| Rank | Condition | Predicted HOT% | Reasoning |
|------|-----------|---------------|-----------|
| 1 | `lb_cathedral_opus` | 90–96% | Full LB stack: r9v2_base preload + top-10 consult_scribes retrieval + Opus reasoning. The Cathedral's retrieval mechanism was designed precisely for this task pattern. Opus has best comprehension of retrieved context. |
| 2 | `lb_cathedral_haiku` | 78–88% | Same retrieval quality as Opus but Haiku's weaker instruction-following may miss edge-case formatting in required elements. Cathedral does the heavy lifting; model tier matters less once context is accurate. |
| 3 | `claude_projects_opus` | 70–82% | Anthropic's Projects load the full corpus as a reference document and Opus is strong at precise retrieval from dense text. Caveat: Projects context loading via API is simulated as system-prompt-with-corpus; real Projects UI may perform better with native chunking. |
| 4 | `lb_r9_only_opus` | 62–76% | Opus with r9v2_base preload only — no Cathedral retrieval. The preload is LB session history, not the R11 corpus, so facts from the corpus are NOT retrievable via preload alone. Opus may score on prior knowledge for generic facts but most R11 corpus facts are synthetic and not in training data. |
| 5 | `claude_projects_sonnet` | 58–72% | Same as Opus-Projects but Sonnet's precision on multi-element facts (especially required-element substring matching) is lower. Sonnet may paraphrase rather than reproduce exact values. |
| 6 | `chatgpt_memory_gpt5` | 54–68% | GPT-5's reasoning is strong but the Memory simulation via system prompt may not match ChatGPT's native Memory product. GPT-5 is also the most likely to produce confident hallucinations when facts are near but not exact. |
| 7 | `chatgpt_memory` | 46–62% | GPT-4o is a strong baseline but the corpus contains 50 highly specific synthetic facts that GPT-4o's prior knowledge cannot supply. Retrieval from system-prompt corpus is reliable for GPT-4o when the fact is clearly stated — which it is. |
| 8 | `perplexity_spaces` | 42–58% | Sonar-Pro is a retrieval-augmented model but Spaces simulation via system prompt degrades the native retrieval advantage. Perplexity tends to cite its own web search when uncertain, which may inject hallucinated sources. |
| 9 | `gemini_gems` | 38–54% | Gemini 2.5 Pro is capable but the Gems corpus loading via API (corpus-as-system-instruction) is the least native of all vendor simulations. Gemini may truncate or summarize the corpus during inference, causing fact loss. |
| 10 | `lb_r9_only_haiku` | 22–40% | Haiku with r9v2_base preload only: no corpus, no Cathedral. Haiku's weak instruction-following on multi-element questions + no corpus access = low HOT rate. Some HIT expected from partial matches on general cooperative terminology. |
| 11 | `cold_gemini_flash` | 6–14% | Cold baseline. Gemini Flash has no corpus. All 50 R11 facts are synthetic (Verdania, Cairnfield, Thornwick, Mossworth, etc.) and absent from training data. Expect near-zero HOT. |
| 12 | `cold_gpt4o_mini` | 4–12% | Cold baseline. GPT-4o-mini has no corpus. Same reasoning as above. Mini-tier models may hallucinate more confidently, producing wrong-but-confident answers. |
| 13 | `cold_haiku` | 4–10% | Cold baseline. Claude Haiku 4.5 has no corpus. Haiku tends to refuse rather than hallucinate on unfamiliar proper nouns — expect more "I don't know" than confident wrong answers compared to GPT-mini. |

---

## Key falsification signals

If actual results diverge from this ranking, these are the most meaningful divergence patterns:

1. **LB Cathedral does NOT lead:** If `lb_cathedral_opus` or `lb_cathedral_haiku` is not in the top 3, the Cathedral's retrieval architecture has a gap on dense factual recall from a fixed corpus. This is an immediate R&D signal.

2. **Cold baselines exceed 15% HOT:** If any cold baseline exceeds 15% HOT, the corpus facts have leaked into model training data (possible if the proper nouns were inadvertently chosen to match real-world data), invalidating the benchmark's retrieval-vs-memorization claim. Trigger: corpus redesign for R11-v2.

3. **Vendor products exceed LB at retrieval:** If `claude_projects_opus` or `chatgpt_memory_gpt5` exceeds `lb_cathedral_opus`, this is the result we publish honestly. It means the Cathedral's per-query retrieval architecture needs improvement in precision or the vendor's context-loading mechanism has an advantage LB doesn't yet match.

4. **Perplexity or Gemini leads:** Would indicate that web-search-augmented retrieval beats static-corpus retrieval for this task. Unlikely given the corpus is unpublished, but if it happens, inspect whether Perplexity is hallucinating or genuinely retrieving.

---

## Budget prediction

Expected spend at 4,150-word corpus (~5,500 token context):

| Condition pool | Calls | Predicted cost |
|---|---|---|
| 3 cold baselines (Haiku, GPT-4o-mini, Gemini Flash) | 150 | ~$0.05 |
| ChatGPT Memory (GPT-4o, GPT-5) | 100 | ~$1.50 |
| Claude Projects (Sonnet, Opus) | 100 | ~$5.00 |
| Gemini Gems (Gemini 2.5 Pro) | 50 | ~$0.80 |
| Perplexity Spaces (Sonar-Pro) | 50 | ~$2.00 |
| LB R9-only (Haiku, Opus) | 100 | ~$4.50 |
| LB Cathedral (Haiku, Opus) | 100 | ~$6.00 |
| Grader (Haiku primary, Opus spot-check 10%) | ~660 | ~$2.00 |
| **Total** | **~1,310** | **~$21.85** |

Hard cap: $25.00. Estimated buffer: ~$3.15 for retries and grader second-pass.

---

## Sanity check gate

Before trusting results:
- Cold baselines (all 3) should cluster near each other between 4–14% HOT.
- If any cold condition HOT > 15%: flag as possible corpus contamination.
- If kappa < 0.70 on the 10% spot-check (5 questions): escalate to Bishop before publishing.

---

*Pre-registered K444 (B119, 2026-04-23). Knight session. Committed before first API call. FOR THE KEEP.*
