---
target_publication: reddit.com/r/MachineLearning
format: reddit-self-text
anchor: K545-methodology-mirror + K547-reproducibility
depth: alpha
status: DRAFT — FOUNDER PROSE-PASS REQUIRED BEFORE DISPATCH
filed: 2026-04-29
---

# REDDIT DRAFT — r/MachineLearning
## [TITLE CANDIDATES]
### Option A: "[Project] Brynjolfsson-methodology-mirrored retrieval benchmark: Stone Tablet preservation, honest-receipt classification, reproducibility pack"
### Option B: "[D] When you Stone-Tablet your null results: a cross-vendor retrieval study that preserved 4 invalidated records"

---

*[α skeleton — r/ML audience cares about methodology + reproducibility. Lead with that.]*

---

## Opening Hook

We ran a cross-vendor retrieval benchmark using Brynjolfsson & McElheran (2016) methodology-mirror discipline. Two of the four canonical Stone Tablet records from Phase E were *invalidated by harness bugs* — and we kept them.

This post is about what happened and why the methodology held anyway.

---

## The Methodology

**Per `feedback_empirically_valid_praise_only.md`:**

Every empirical run in this system produces a **Stone Tablet** — append-only JSONL record, full payload preserved, timestamp-anchored. No summarize-and-discard. No selective-deletion of inconvenient runs.

K545 Phase E produced four Stone Tablets:
- Records 1-2: INVALIDATED (harness bugs — substantive-pattern regex matched injection block; injection-block chars summed into baseline)
- Records 3-4: CANONICAL (post-fix)

The two invalidated records are preserved in `librarian-mcp/stitchpunks/wrasse/session_ledger.jsonl`. The final published receipt cites Stone Tablet 3+4 only, with explicit notation that records 1-2 were invalidated and why.

**Honest-receipt classification system:**

Every empirical claim carries one of:
- `ANCHORED` — directly measured, Stone Tablet exists, third-party replicable
- `ANCHORED-BUT-CAVEATED` — measured but with documented confound
- `HYPOTHESIS` — model-based, not yet empirically confirmed
- `INDETERMINATE` — gate not cleared; hypothesis not refuted

The K545 receipt: "41.1% Phase E gate cleared — ANCHORED (proxy lower bound)." C-2 (injection-block chars counted) and C-3 (proxy lacks file-read response content) confounds documented inline.

*[ANCHOR: K545 Phase E Stone Tablets — 4 records, 2 invalidated, 2 canonical. K547 100.0% HOT (33/33) — ANCHORED receipt.]*

---

## The Reproducibility Pack

**A&A #2326 (Reproducibility Pack):** the formal patent claim on third-party-verifiable empirical methodology in a cooperative-substrate system.

What makes this reproducible:
1. Corpus sealed at K471 (R11_QUESTION_BANK_SEALED_K471.json)
2. Stone Tablets include full prompt text, model IDs, temperature, timestamps
3. Confounds documented inline in each run, not in post-hoc commentary
4. K473 → K547 pattern reproduction: same registry-keyword-extension mechanism used in two independent benchmark sessions (16 keywords / 8 entries in K473; 14 keywords / 8 entries in K547) produced same mechanism class. Reproducible maintenance discipline, not one-off fix.

---

## The Knowledge Pump — Current Hypothesis Class

[FOUNDER: r/ML audience will want the honest epistemic status of the Knowledge Pump hypothesis. Current status: INDETERMINATE after K-Harder-Panel (+25pp Reading-C lift, but two confounds — excerpt leakage + context dilution — prevent SUPPORTED verdict). Panel 5 (K_PANEL_5_KP_CONFOUND_PATCHES) underway. Frame this honestly: positive signal, not publication-grade yet, confound patches in progress.]

---

## Invitation for Independent Replication

[FOUNDER: The r/ML community would be the right audience to offer independent replication opportunity. If the corpus + methodology can be shared (partial open-source of the R11 question bank + benchmark harness), this is where to offer it. Otherwise, link to Cephas where methodology docs are published.]

*Liana Banyan Corporation, Wyoming C-Corp, EIN 41-2797446*

---
**[DRAFT — PUBLICATION GATE HARD — FOUNDER PROSE-PASS + DISPATCH AUTHORIZATION REQUIRED]**
