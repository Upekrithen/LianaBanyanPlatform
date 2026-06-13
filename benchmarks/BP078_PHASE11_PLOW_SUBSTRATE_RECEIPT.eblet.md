# BP078_PHASE11_PLOW_SUBSTRATE_RECEIPT.eblet.md

**Phase:** A - Plow-First Substrate Mining
**Run timestamp:** 2026-06-08T21:20:30Z
**Machine:** M1 (192.168.86.30 / localhost)
**Model:** N/A (plow phase; no LLM synthesis)
**Total wall clock:** 8858.7s
**Anti-popularity threshold:** weight >= 0.6 AND content >= 100 chars
**Substrate cache:** substrate_bp078_cache.jsonl

## Architecture Note

Founder-canon (BP078): Spider, Sprite, Miner PLOW the field first.
This receipt documents Phase A: web mining of all 14 MMLU-Pro category
topics before any LLM synthesis runs. Per-node anti-popularity filter fires
on every eblet per Founder explicit instruction.

Phase 11 antipattern: tests ran against un-plowed substrate. Every pass used
curated-MCQ-lookup artifacts created during the run (circular). Every fail was
honest base quality with thin Wikipedia coverage.

Correct flow: Plow -> Test -> Re-Plow -> Unfair-Advantage-Mesh-Proof.

## Per-Category Plow Results

| Category | Qs | Mined | Accepted | Rejected | Rejection Reasons | Sources |
|----------|----|-------|----------|----------|-------------------|---------|
| math | 10 | 147 | 142 | 5 | thin_content:35<100=2; thin_content:22<100=1; thin_content:9 | wikipedia, wikidata, arxiv, openalex |
| physics | 10 | 116 | 113 | 3 | thin_content:99<100=1; thin_content:31<100=1; thin_content:8 | wikipedia, wikidata, openalex, pubmed_central |
| chemistry | 10 | 121 | 119 | 2 | thin_content:90<100=1; thin_content:76<100=1 | wikipedia, pubmed_central, wikidata, nist, openalex |
| biology | 10 | 85 | 84 | 1 | thin_content:60<100=1 | wikipedia, wikidata, arxiv, openalex, pubmed_central |
| health | 10 | 112 | 111 | 1 | thin_content:24<100=1 | wikipedia, openalex, wikidata, pubmed_central, arxiv |
| psychology | 10 | 118 | 115 | 3 | thin_content:28<100=1; thin_content:26<100=2 | wikipedia, wikidata, arxiv, openalex, pubmed_central |
| history | 10 | 145 | 139 | 6 | thin_content:65<100=1; thin_content:79<100=1; thin_content:7 | wikipedia, wikidata, openalex, pubmed_central, stack_exchange |
| law | 10 | 111 | 107 | 4 | thin_content:77<100=1; thin_content:79<100=1; thin_content:8 | wikipedia, wikidata, arxiv, openalex, pubmed_central |
| philosophy | 10 | 141 | 136 | 5 | thin_content:30<100=3; thin_content:86<100=1; thin_content:8 | wikipedia, wikidata, arxiv, openalex, pubmed_central |
| economics | 10 | 102 | 101 | 1 | thin_content:31<100=1 | wikipedia, arxiv, pubmed_central, wikidata |
| business | 10 | 99 | 95 | 4 | thin_content:69<100=1; thin_content:75<100=1; thin_content:2 | wikipedia, arxiv, pubmed_central, wikidata, nist |
| engineering | 10 | 82 | 80 | 2 | thin_content:35<100=1; thin_content:37<100=1 | wikipedia, wikidata, pubmed_central, nist, arxiv |
| cs | 0 | 0 | 0 | 0 | none | none [ERR:bank_not_found] |
| other | 0 | 0 | 0 | 0 | none | none [ERR:bank_not_found] |
| **TOTAL** | -- | -- | **1342** | **37** | -- | -- |

## Per-Category Source Provenance Detail

### MATH
- `wikipedia`: 79 eblets (weight=0.85)
- `arxiv`: 27 eblets (weight=0.85)
- `wikidata`: 24 eblets (weight=0.90)
- `openalex`: 12 eblets (weight=0.85)

### PHYSICS
- `wikipedia`: 74 eblets (weight=0.85)
- `wikidata`: 27 eblets (weight=0.90)
- `openalex`: 9 eblets (weight=0.85)
- `pubmed_central`: 3 eblets (weight=0.60)

### CHEMISTRY
- `wikipedia`: 75 eblets (weight=0.85)
- `pubmed_central`: 15 eblets (weight=0.60)
- `wikidata`: 12 eblets (weight=0.90)
- `nist`: 11 eblets (weight=0.97)
- `openalex`: 3 eblets (weight=0.85)
- `stack_exchange`: 3 eblets (weight=0.70)

### BIOLOGY
- `wikipedia`: 41 eblets (weight=0.85)
- `wikidata`: 18 eblets (weight=0.90)
- `pubmed_central`: 13 eblets (weight=0.60)
- `arxiv`: 6 eblets (weight=0.85)
- `openalex`: 6 eblets (weight=0.85)

### HEALTH
- `wikipedia`: 61 eblets (weight=0.85)
- `pubmed_central`: 15 eblets (weight=0.60)
- `openalex`: 12 eblets (weight=0.85)
- `wikidata`: 12 eblets (weight=0.90)
- `arxiv`: 6 eblets (weight=0.85)
- `stack_exchange`: 3 eblets (weight=0.70)
- `nist`: 2 eblets (weight=0.97)

### PSYCHOLOGY
- `wikipedia`: 43 eblets (weight=0.85)
- `arxiv`: 24 eblets (weight=0.85)
- `wikidata`: 21 eblets (weight=0.90)
- `openalex`: 18 eblets (weight=0.85)
- `pubmed_central`: 8 eblets (weight=0.60)
- `nist`: 1 eblets (weight=0.97)

### HISTORY
- `wikipedia`: 75 eblets (weight=0.85)
- `wikidata`: 28 eblets (weight=0.90)
- `openalex`: 18 eblets (weight=0.85)
- `pubmed_central`: 12 eblets (weight=0.60)
- `stack_exchange`: 3 eblets (weight=0.70)
- `nist`: 3 eblets (weight=0.97)

### LAW
- `wikipedia`: 47 eblets (weight=0.85)
- `wikidata`: 27 eblets (weight=0.90)
- `openalex`: 21 eblets (weight=0.85)
- `pubmed_central`: 9 eblets (weight=0.60)
- `arxiv`: 3 eblets (weight=0.85)

### PHILOSOPHY
- `wikipedia`: 61 eblets (weight=0.85)
- `arxiv`: 27 eblets (weight=0.85)
- `wikidata`: 24 eblets (weight=0.90)
- `openalex`: 18 eblets (weight=0.85)
- `pubmed_central`: 6 eblets (weight=0.60)

### ECONOMICS
- `wikipedia`: 55 eblets (weight=0.85)
- `wikidata`: 25 eblets (weight=0.90)
- `arxiv`: 12 eblets (weight=0.85)
- `pubmed_central`: 9 eblets (weight=0.60)

### BUSINESS
- `wikipedia`: 58 eblets (weight=0.85)
- `arxiv`: 15 eblets (weight=0.85)
- `wikidata`: 12 eblets (weight=0.90)
- `pubmed_central`: 9 eblets (weight=0.60)
- `nist`: 1 eblets (weight=0.97)

### ENGINEERING
- `wikipedia`: 54 eblets (weight=0.85)
- `wikidata`: 13 eblets (weight=0.90)
- `arxiv`: 6 eblets (weight=0.85)
- `pubmed_central`: 3 eblets (weight=0.60)
- `stack_exchange`: 3 eblets (weight=0.70)
- `nist`: 1 eblets (weight=0.97)

## Substrate Cache

Accepted eblets written to: `substrate_bp078_cache.jsonl`
Total accepted: 1342
Total rejected by anti-popularity: 37

## Verdict

SUBSTRATE PLOWED: 1342 real web eblets mined and cached for Phase B testing. Anti-popularity rejected 37 thin/low-quality eblets. Substrate is now plowed for Phase B test queries.

---
*BP078 Phase A receipt. Truth-Always. Anti-popularity active. Plow before test.*
