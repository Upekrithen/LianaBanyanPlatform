# Citation Guide — lb-reproducibility-pack

Use these citations in academic papers, policy reports, journalistic investigations,
or legal filings that reference the K528 benchmark, the LB Cathedral architecture,
or the reproducibility pack itself.

---

## Citing the K528 Benchmark (the empirical receipt)

### BibTeX
```bibtex
@techreport{jones2026k528,
  title        = {R11-v2 Cross-Architecture AI Memory Benchmark: Cathedral Indexed
                  Retrieval vs. Vendor-Native Full-Corpus Injection},
  author       = {Jones, Jonathan},
  institution  = {Liana Banyan Corporation},
  year         = {2026},
  month        = {April},
  note         = {K528 / B129. 16 conditions, 200 questions, 150-fact canonical corpus
                  ($\sim$106K tokens). Full results and methodology at:
                  \texttt{librarian-mcp/r10\_cross\_vendor/REPORT\_KNIGHT\_K528\_B129\_R11\_V2\_FULL\_STACK.md}.
                  Commit 6f2b47a, tag v-r11-v2-full-stack-K528.},
  url          = {https://lianabanyan.com},
}
```

### APA
Jones, J. (2026, April). *R11-v2 Cross-Architecture AI Memory Benchmark: Cathedral
Indexed Retrieval vs. Vendor-Native Full-Corpus Injection* (K528/B129 Technical Report).
Liana Banyan Corporation.

### Chicago
Jones, Jonathan. "R11-v2 Cross-Architecture AI Memory Benchmark: Cathedral Indexed
Retrieval vs. Vendor-Native Full-Corpus Injection." Technical Report K528/B129, Liana
Banyan Corporation, April 2026.

---

## Citing the Reproducibility Pack (this pack)

### BibTeX
```bibtex
@software{jones2026reprpack,
  title        = {lb-reproducibility-pack: Tiered Reproducibility Pack for the
                  K528 Cooperative AI Memory Benchmark},
  author       = {Jones, Jonathan},
  year         = {2026},
  month        = {April},
  version      = {v-reproducibility-pack-K533},
  note         = {Three-tier dataset bundle (smoke/reasonable/full-K528),
                  run harness, local Cathedral adapter, substitution layer with
                  Three-Class Substrate Sovereignty guarantee (\#2315).
                  K533 / B131. Tag: v-reproducibility-pack-K533.},
  url          = {https://lianabanyan.com},
}
```

### APA
Jones, J. (2026, April). *lb-reproducibility-pack: Tiered Reproducibility Pack for the
K528 Cooperative AI Memory Benchmark* (Version v-reproducibility-pack-K533) [Software].
Liana Banyan Corporation.

---

## Citing the Platform (LB Cathedral architecture)

### BibTeX
```bibtex
@misc{jones2026lbcathedral,
  title        = {Liana Banyan Cathedral: Cooperative AI Memory Architecture
                  with Three-Class Substrate Sovereignty},
  author       = {Jones, Jonathan},
  year         = {2026},
  howpublished = {Liana Banyan Corporation. Provisional patent applications on file
                  including 64/036,646 (filed April 12, 2026). EIN: 41-2797446.},
  note         = {Covers: Cathedral indexed retrieval (\#2278), Pheromone Substrate
                  (\#2317), Three-Class Substrate Sovereignty (\#2315),
                  Conductor's Baton routing (\#2302).},
}
```

---

## Key findings to cite

When citing the K528 benchmark findings, the following numbers are the canonical reference:

| Claim | Canonical value | Source |
|-------|----------------|--------|
| Claude Projects Sonnet HOT% | 86.5% | K528 Phase B, 200 questions |
| Claude Projects Sonnet $/HOT | $0.032 | K528 Phase B |
| Cathedral Gemini Flash $/HOT | $0.0104 | K528 Phase C |
| Cathedral GPT-4o-mini $/HOT | $0.009 | K528 Phase C |
| Cathedral cost advantage vs. Sonnet | ~3× at K528 coverage; projects 10× at full ingestion | K528 Phase C |
| OpenAI TPM ceiling | Blocked at every tier on 106K-token corpus | K528 Phase B |
| Pheromone speedup (empirical) | 21-51× vs. Detective sweep baseline | K528 Phase E |

All figures represent industry-term API/compute spend using each vendor's published API
pricing at the time of the K528 run (April 27, 2026). Membership to Liana Banyan
($5/year, identical for all) is orthogonal to these compute costs.

---

## For replicators: how to cite your replication

If you run this pack and publish your results, the canonical citation format is:

> "[Your institution] replicated the K528 benchmark using the lb-reproducibility-pack
> (v-reproducibility-pack-K533, Jones 2026) on [your corpus description]. We ran
> [N] conditions against [Q] questions from the [smoke/reasonable/full] tier.
> Our replication results [confirm / extend / partially differ from] the canonical
> K528 findings (Jones 2026)."

We encourage all replicators to share their results — even null or contradicting results —
as the cooperative knowledge commons benefits from transparent empirical discourse.

---

*Filed K533 / B131, April 27, 2026.*
