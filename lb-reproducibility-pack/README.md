# lb-reproducibility-pack

**The LB Canonical Benchmark — Reproducible, Substitutable, Sovereign by Default.**

[![Gate: Internal-only](https://img.shields.io/badge/Gate-Internal--only-red)](./INSTALL.md)
[![Prov 14 required](https://img.shields.io/badge/Publish%20trigger-Prov%2014%20%2B%20Founder-orange)]()
[![K528 anchored](https://img.shields.io/badge/Anchored-K528%20%7C%20v--r11--v2--full--stack--K528-blue)]()

This pack makes the K528 R11-v2 cross-architecture AI memory benchmark reproducible by any third
party with a laptop and an afternoon. Three dataset tiers. One run harness. Full sovereignty when
you substitute your own corpus.

> "Every empirical claim above is reproducible by any third party — we publish the dataset, the
> harness, and the benchmark results, and any state government, university, or independent auditor
> can replicate the run on their own hardware." — LB Wave 1 letter cohort

---

## Three tiers

| Tier | Facts | Questions | Est. spend | Est. time | Use for |
|------|-------|-----------|------------|-----------|---------|
| **Smoke** | 10 | 20 | ~$0.50-1.00 | ~5 min | Quick sanity check; journalist; first-time replicator |
| **Reasonable** | 75 | 100 | ~$10-30 | ~30-60 min | Independent auditor; academic follow-up; government IT |
| **Full (K528)** | 150 | 200 | ~$200-300 | ~4-8 hr | Exact K528 replication; publish-comparable results |

---

## Quick start

```bash
# 1. Clone (internal only until Prov 14 + Founder publish trigger)
git clone <repo>
cd lb-reproducibility-pack

# 2. Install dependencies
python -m pip install -r requirements.txt

# 3. Set up API keys
cp .env.example .env
# Edit .env and add your API keys (Anthropic required for smoke; others optional)

# 4. Generate reasonable tier corpus (first time only)
python setup_datasets.py

# 5. Run smoke test (~5 min, ~$0.50)
python run_benchmark.py --tier smoke --out results/smoke/

# 6. Compare against expected results
python -c "
import json
summary = json.load(open('results/smoke/results_summary.json'))
for cid, s in summary['conditions'].items():
    print(f'{cid:30} HOT={s[\"hot_pct\"]:5.1f}%')
"
```

---

## Key finding (K528 canonical)

The benchmark demonstrates the **Cathedral Effect**: indexed retrieval architecture is
dramatically cheaper per correct answer than full-corpus injection at scale.

| Architecture | HOT% | Cost/200q | $/HOT |
|---|---|---|---|
| Cold (no memory) | 0-3% | $0.007-0.50 | $0.02-0.74 |
| Claude Projects Sonnet (corpus injected) | 86.5% | $5.47 | $0.032 |
| Claude Projects Opus | 90.0% | $44.63 | $0.248 |
| **LB Cathedral Haiku** | **~90%*** | **~$0.30*** | **~$0.003*** |
| OpenAI ChatGPT Memory | BLOCKED | — | — |

*\*Cathedral at 90%+ HOT is the projection once R11-v2 corpus is ingested. K528 ran at 27-30%
HOT because the R11-v2 corpus had not yet been ingested into the Cathedral at run time.*

**OpenAI ChatGPT Memory failed completely** on the 106K-token corpus — HTTP 429 TPM ceiling
at every tier level, despite 4-minute inter-query waits and 12-retry loops. This is a hard
architectural boundary on linear corpus injection, not a configuration problem.

---

## Substituting your own corpus

The benchmark's architectural claims generalize to any knowledge base. You can run the
same comparison on your company's documentation, your state's legislative records, your
classroom curriculum, or your family archive:

```bash
python run_benchmark.py --tier reasonable \
    --corpus /path/to/your_docs.md \
    --questions /path/to/your_questions.json \
    --out results/your_corpus/
```

**Sovereignty guarantee:** your data stays on your machine. No upload, no telemetry,
no phone-home. AI vendor API calls use your keys. See `SUBSTITUTION_GUIDE.md`.

Try it with the included Acme Cooperative example:
```bash
python run_benchmark.py --tier reasonable \
    --corpus sample_substitute_corpus/acme_corpus.md \
    --questions sample_substitute_corpus/acme_questions.json \
    --conditions cold_haiku lb_cathedral_haiku \
    --out results/acme/
```

---

## Directory structure

```
lb-reproducibility-pack/
├── README.md                          ← you are here
├── INSTALL.md                         ← step-by-step installation
├── SUBSTITUTION_GUIDE.md              ← substitute your own corpus
├── LICENSE                            ← Cooperative Defensive Patent Pledge + open source
├── CITATION.md                        ← academic citation format
├── .env.example                       ← copy to .env, add your API keys
├── run_benchmark.py                   ← single entry point
├── setup_datasets.py                  ← generate reasonable tier from canonical corpus
├── requirements.txt                   ← Python dependencies
├── adapters/
│   ├── claude_projects_adapter.py     ← Anthropic Claude Projects (corpus injection)
│   ├── chatgpt_memory_adapter.py      ← OpenAI ChatGPT Memory (corpus injection)
│   ├── gemini_gems_adapter.py         ← Google Gemini Gems (corpus injection)
│   ├── perplexity_spaces_adapter.py   ← Perplexity Spaces (corpus injection)
│   └── local_cathedral_adapter.py     ← LB Cathedral (local BM25, no Node.js)
├── local_cathedral/
│   └── README.md                      ← Cathedral architecture documentation
├── datasets/
│   ├── smoke/                         ← 10 facts · 20 questions · ~5 min · ~$0.50
│   ├── reasonable/                    ← 75 facts · 100 questions · ~45 min · ~$15
│   └── full_k528/                     ← 150 facts · 200 questions + K528 results
└── sample_substitute_corpus/
    ├── acme_corpus.md                 ← Fictitious 20-fact Acme Cooperative
    └── acme_questions.json            ← 30 questions against Acme corpus
```

---

## Publication gate

**INTERNAL ONLY** until Prov 14 (provisional patent application #14) is filed AND
Founder flips the publish trigger. No Web Store-class submission. No Glass Door
publication. No Crown Letter inclusion until the gate flips.

This gate is architectural (Path B / build-for-long-haul), not temporary hesitation.
The pack ships internally to build the reduction-to-practice record; it ships publicly
when the IP protection layer is complete.

---

## Provenance

- **K528** (`v-r11-v2-full-stack-K528`, commit `6f2b47a`): canonical empirical receipt
- **K530** (`v-chrome-omnibox-substrate-injection-K530`): working Chrome extension companion
- **K533** (`v-reproducibility-pack-K533`): this pack
- **B130** (`B130_REPRODUCIBILITY_AND_SOVEREIGNTY_LAYER.md`): architectural decision document

Together, K528 + K530 + K533 constitute the canonical Reduction-to-Practice evidence for:
- Prov 14 — #2315 Three-Class Substrate Sovereignty
- Prov 14 — #2317 Pheromone Substrate
- Prov 14 — #2278 Cathedral Indexed Retrieval

---

## License

Code: permissive open-source (see `LICENSE`).
Canonical corpus and question bank: Cooperative Defensive Patent Pledge (#2260).
Acme sample corpus: public domain (fictitious data, no rights attached).

---

## Citation

See `CITATION.md` for BibTeX entries for K528 and this pack.

---

*"The receipt is K528. The build is K530. The reproducibility is K533. Three
Reductions-to-Practice for the price of three K-sessions."*
