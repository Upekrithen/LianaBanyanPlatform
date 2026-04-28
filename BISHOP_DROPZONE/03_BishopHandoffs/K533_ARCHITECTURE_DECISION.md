# K533 Architecture Decision — Reproducibility Pack Repository Structure
**Filed**: K533 Phase A.1 — 2026-04-27 by Knight (Sonnet 4.6)
**Awaiting**: Founder ratification before Phase B begins
**Bishop recommendation**: Architecture A (single-repo top-level directory)

---

## Decision Required

Where does `lb-reproducibility-pack/` live?

| # | Architecture | Description | Pros | Cons | Recommended? |
|---|---|---|---|---|---|
| **A** | **Top-level directory in main repo** `lb-reproducibility-pack/` sibling to `lb-omnibox-extension/`, `librarian-mcp/`, `platform/` | Single-repo, single-source-of-truth | Canonical artifacts (corpus, question bank, results) stay co-located with their K528 sources in `librarian-mcp/r10_cross_vendor/`. Full pack contents visible in one repo. Easier to keep in sync as benchmarks evolve. Founder can publish as zip download from any portal surface. Path B logic identical to K530 (internal now, gated publication). No sync overhead. | Bigger main repo; future external replicators clone everything (including platform source) to use the pack | ✅ **Primary recommendation** |
| **B** | **Standalone repo** `lb-reproducibility-pack` published separately to GitHub when public-trigger fires | Clean external surface; smaller download for replicators | Lighter-weight download for third-party replicators who don't need the platform source. Independent release cadence. | Sync overhead between main repo K528 artifacts and pack repo. Risk of corpus/results drift. Two repos to maintain. Harder to verify canonical fidelity. | Defer to K-future if external-contribution volume becomes high |

---

## Knight analysis

**A is correct now because the publication gate is HARD.**

The pack ships internal-only until Prov 14 + Founder publish trigger. During this period, there are ZERO external consumers of the pack, which means Architecture B's only advantage (lighter download for external replicators) does not yet exist. Architecture A's advantages are active today:

1. **Canonical fidelity is trivial to verify** — `datasets/full_k528/` can reference `../librarian-mcp/r10_cross_vendor/` directly; the smoke and reasonable tiers are extracted subsets of the same source; no sync step required.
2. **K530 set the pattern** — `lb-omnibox-extension/` is top-level in the main repo, internal-only, awaiting the same Prov 14 + Founder publish trigger. Architecture A is the established K530 pattern.
3. **Migration path exists** — if external-contribution flow grows large enough to warrant a standalone repo, the migration is: `git subtree split --prefix lb-reproducibility-pack`. This is a one-command operation. Architecture A does not foreclose B.
4. **No scope creep** — Architecture B would require GitHub repo creation, separate CI, separate gitignore, separate access controls, and a sync script. That is K-future-B scope, not K533.

**The publication-gate flip (Prov 14 + Founder trigger) is when Architecture B becomes relevant to reconsider.** Until then, Architecture A.

---

## Sovereignty contract note

The Architecture decision is orthogonal to the sovereignty contract. Whether the pack lives in the main repo (A) or a standalone repo (B), the sovereignty guarantees are identical:
- Substitute corpus stays on the member's machine
- No LB-server outbound calls during substitute-corpus benchmark runs
- AI vendor API calls use the member's own keys
- Results written to local disk only

Architecture determines *where the pack is hosted*; sovereignty determines *what happens at runtime*.

---

## Recommended action for Founder

> **"Go with A."** — Signal to Knight by replying "proceed" or "Architecture A confirmed" or similar. Knight will begin Phase B immediately.

If Founder prefers B (standalone repo), Knight will need an additional ~2hr for repo scaffolding before beginning dataset packaging. The final deliverable is functionally identical; only the housing changes.

---

## What Phase B will build (pending ratification)

If Architecture A is confirmed, Knight will build `lb-reproducibility-pack/` at the workspace root with this structure:

```
lb-reproducibility-pack/
├── README.md
├── INSTALL.md
├── SUBSTITUTION_GUIDE.md
├── LICENSE
├── CITATION.md
├── .env.example
├── run_benchmark.py           # single entry point, --tier / --corpus / --questions flags
├── setup_datasets.py          # one-time setup: extracts reasonable tier from canonical corpus
├── requirements.txt
├── adapters/
│   ├── __init__.py
│   ├── chatgpt_memory_adapter.py
│   ├── claude_projects_adapter.py
│   ├── gemini_gems_adapter.py
│   ├── perplexity_spaces_adapter.py
│   └── local_cathedral_adapter.py   # NEW: standalone Python BM25 retrieval, no Node.js
├── local_cathedral/
│   ├── README.md
│   └── local_cathedral_server.py    # minimal Flask/http.server local retrieval
├── datasets/
│   ├── smoke/
│   │   ├── corpus_smoke.md           # 10-fact subset (hand-extracted, K528-verified)
│   │   ├── questions_smoke.json      # 20 sealed questions (subset of K528 bank)
│   │   └── expected_results_smoke.json
│   ├── reasonable/                   # generated by setup_datasets.py
│   │   ├── corpus_reasonable.md      # 75-fact subset
│   │   ├── questions_reasonable.json # 100 sealed questions
│   │   └── expected_results_reasonable.json
│   └── full_k528/
│       ├── corpus_full_k528.md       # copy of r11v2_canonical_corpus_100k.md
│       ├── questions_full_k528.json  # copy of R11v2_QUESTION_BANK_SEALED_K528.json
│       └── canonical_results/        # copy of results_r11v2_K528/ contents
└── sample_substitute_corpus/
    ├── acme_corpus.md                # ~20 facts about fictitious Acme Cooperative
    └── acme_questions.json           # 30 questions against Acme corpus
```

**C.6 sovereignty-contract verification** is load-bearing: Knight will run network tracing during a substitute-corpus run to confirm ZERO LB-server outbound calls.

---

*Filed K533 Phase A.1 by Knight. Architecture A is the correct call — same Path B pattern as K530. Awaiting Founder ratification to proceed.*
