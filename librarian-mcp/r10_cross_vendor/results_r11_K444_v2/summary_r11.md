# R11 Cross-Vendor Memory Benchmark Results

**Session:** K444 (B119, 2026-04-23)
**Corpus:** R11-CANONICAL-K444-v2 (50 facts, ~11,800 words)
**Total spend:** $21.1053

| Condition | Model | HOT% | HIT% | MISS% | Ret-correct% | $/query | $/correct | p50-lat |
|---|---|---|---|---|---|---|---|---|
| **lb_cathedral_opus** | opus-4-7 | 0.0% | 32.0% | 68.0% | — | $0.10341 | — | 2.19s |
| **lb_cathedral_haiku** | haiku-4-5 | 0.0% | 66.0% | 34.0% | — | $0.00549 | — | 2.94s |
| **claude_projects_opus** | opus-4-7 | 18.0% | 56.0% | 26.0% | 100.0% | $0.06667 | $0.3704 | 3.61s |
| **claude_projects_sonnet** | sonnet-4-6 | 16.0% | 60.0% | 24.0% | 100.0% | $0.00792 | $0.0495 | 3.22s |
| **chatgpt_memory_gpt5** | gpt-4.1 | 16.3% | 36.7% | 46.9% | 100.0% | $0.03064 | $0.1877 | 29.96s |
| **chatgpt_memory** | gpt-4o | 16.3% | 12.2% | 71.4% | 100.0% | $0.03814 | $0.2336 | 30.18s |
| **perplexity_spaces** | sonar-pro | 16.0% | 10.0% | 74.0% | 100.0% | $0.04665 | $0.2915 | 2.5s |
| **gemini_gems** | gemini-2.5-pro | 12.0% | 18.0% | 70.0% | 100.0% | $0.02018 | $0.1682 | 5.56s |
| **lb_r9_only_opus** | opus-4-7 | 0.0% | 28.0% | 72.0% | — | $0.09848 | — | 2.18s |
| **lb_r9_only_haiku** | haiku-4-5 | 0.0% | 66.0% | 34.0% | — | $0.00500 | — | 2.09s |
| **cold_gemini_flash** | gemini-2.5-flash | 0.0% | 54.0% | 46.0% | — | $0.00004 | — | 3.38s |
| **cold_gpt4o_mini** | gpt-4o-mini | 4.0% | 64.0% | 32.0% | 0.0% | $0.00005 | $0.0013 | 1.48s |
| **cold_haiku** | haiku-4-5 | 0.0% | 62.0% | 38.0% | — | $0.00081 | — | 2.06s |
## Sanity Check

- Cold baseline sanity check PASSED (all cold HOT% <= 15%).

---
*Publication hold: internal only until Bishop Prov 14 green-light.*
