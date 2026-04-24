# R11 Cross-Vendor Memory Benchmark Results

**Session:** K471 (B121, 2026-04-24) — corpus-bank realignment
**Corpus:** R11-CANONICAL-K471 / R11-CANONICAL-K444-v2 (50 facts, ~11,800 words)
**Bank:** R11_QUESTION_BANK_SEALED_K471.json (50/50 answerable, 100%% ceiling)
**Total spend:** $0.3635

| Condition | Model | HOT% | HIT% | MISS% | Ret-correct% | $/query | $/correct | p50-lat |
|---|---|---|---|---|---|---|---|---|
| **lb_cathedral_haiku** | haiku-4-5 | 18.0% | 6.0% | 76.0% | 100.0% | $0.00647 | $0.0360 | 3.23s |
| **cold_haiku** | haiku-4-5 | 0.0% | 16.0% | 84.0% | — | $0.00080 | — | 2.55s |
## Sanity Check

- Cold baseline sanity check PASSED (all cold HOT% <= 15%).

---
*Publication hold: internal only until Prov 14 receipt confirmed. K471 bank (R11-CANONICAL-K471) is canonical from this session forward.*
