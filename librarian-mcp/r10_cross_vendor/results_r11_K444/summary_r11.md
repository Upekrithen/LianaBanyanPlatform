# R11 Cross-Vendor Memory Benchmark Results

**Session:** K444 (B119, 2026-04-23)
**Corpus:** R11-CANONICAL-K444 (50 facts, 4,150 words)
**Total spend:** $13.4454

| Condition | Model | HOT% | HIT% | MISS% | Ret-correct% | $/query | $/correct | p50-lat |
|---|---|---|---|---|---|---|---|---|
| **lb_cathedral_opus** | opus-4-7 | 0.0% | 26.0% | 74.0% | — | $0.10450 | — | 2.38s |
| **lb_cathedral_haiku** | haiku-4-5 | 0.0% | 62.0% | 38.0% | — | $0.00554 | — | 3.01s |
| **claude_projects_opus** | opus-4-7 | 100.0% | 0.0% | 0.0% | 96.0% | $0.02203 | $0.0220 | 2.36s |
| **chatgpt_memory_gpt5** | gpt-4.1 | 44.7% | 34.0% | 21.3% | 90.5% | $0.00641 | $0.0143 | 6.51s |
| **chatgpt_memory** | gpt-4o | 50.0% | 6.0% | 44.0% | 92.0% | $0.00791 | $0.0158 | 9.35s |
| **perplexity_spaces** | sonar-pro | 100.0% | 0.0% | 0.0% | 96.0% | $0.01850 | $0.0185 | 2.46s |
| **lb_r9_only_opus** | opus-4-7 | 0.0% | 28.0% | 72.0% | — | $0.09855 | — | 2.39s |
| **lb_r9_only_haiku** | haiku-4-5 | 0.0% | 66.0% | 34.0% | — | $0.00500 | — | 2.19s |
| **cold_gpt4o_mini** | gpt-4o-mini | 4.0% | 66.0% | 30.0% | 0.0% | $0.00005 | $0.0013 | 1.43s |
| **cold_haiku** | haiku-4-5 | 0.0% | 64.0% | 36.0% | — | $0.00081 | — | 2.03s |
## Sanity Check

- Cold baseline sanity check PASSED (all cold HOT% <= 15%).

---
*Publication hold: internal only until Bishop Prov 14 green-light.*
