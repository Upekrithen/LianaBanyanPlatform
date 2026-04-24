---
knight_session: K474
bishop_session: B122
bridle_version: 10
predecessor_gate: K473 (v-mj-routing-residual-fix-K473) ✓ — MJ MISS% 75%→0%, overall 88% HOT on anthropic_haiku_bishop
target_tag: v-self-indexing-scribes-K474
task_class: medium — architectural change to Scribe keyword sourcing + re-validation of Cathedral Effect empirics under clean (auto-only) conditions (2-3 hr)
estimated_model: Sonnet 4.6
scope_size: medium
budget_cap_usd: 8 (expected ~$3-4; two verification runs at ~$0.60-1 each)
publication_hold: IN FORCE until Prov 14 receipt
---

# K474 — Self-Indexing Scribes: Corpus-Derived Distinctiveness Keywords

## B122, 2026-04-24

**THE BRIDLE** — standard discipline per K472/K473.

## Context

K472 + K473 closed AM and MJ routing gaps by hand-adding R11-exclusive terms (e.g. "Reference Architecture", "Reference Onboarding Framework", "Cooperative Principles Assessment", "exit interview completion rate") to R11/KnightR11 registry keywords. The pattern worked — MJ MISS% went 75%→0%, overall HOT% 84%→88%.

**The structural concern**: that approach is teach-to-the-test. Every new Scribe corpus, every new question bank, requires another hand-sweep of "which rare tokens does the sealed bank reference?" and another K-session to patch the registry. A skeptic can reasonably ask whether the reported Cathedral Effect HOT% is the *architecture* or the *operator who hand-tuned keywords between K472 and K473 knowing the bank contents*.

**K474's mandate**: make each Scribe self-index from its own corpus, so distinctiveness keywords are corpus-derived rather than hand-curated. Then re-run the K471 bank under auto-only keyword conditions to produce the **empirically-clean Cathedral Effect number** — the number that belongs in public claims.

This is also an A&A candidate (Crown Jewel #2291 — "Self-Indexing Scribes / Corpus-Derived Distinctiveness") for Prov 14. Founder extended the filing window explicitly for thresh-as-we-go threshing of this class of innovation.

## Architectural approach

### Keyword sources become two-tier

- **Tier 1 — Concept keywords (hand-curated, retained)**: the `keywords:` field in `registry.yaml` stays. These capture semantic/conceptual anchors that may not appear lexically in the corpus (synonyms, aliases, cross-reference hooks). Domain experts should still be able to annotate.
- **Tier 2 — Distinctiveness keywords (auto-derived, new)**: a corpus-derived set of n-grams (1-4) that appear frequently in *this* Scribe's corpus and rarely/never in others. Stored in a sidecar file `stitchpunks/scribes/auto_keywords/<scribe_id>.yaml`.

At Lachesis-scoring time, the rarity map and keyword haystack are built from the **union** of Tier 1 and Tier 2. Rare-token bonus logic is unchanged — it still fires on keywords that appear in only one Scribe's merged keyword set.

### Extraction algorithm (TF-IDF with exclusivity floor)

For each Scribe S with declared `canonical_keepers`:

1. Resolve each keeper path. Support globs (e.g. `AA_FORMAL_2273*.md`). Read plain text out of `.md`, `.txt`, `.json` (deep text extraction), `.jsonl` (line-by-line text-field extraction). If a path is missing or unreadable, log a warning and continue; do not fail the run.
2. Tokenize into 1-4 grams. Lowercase. Strip punctuation. Drop stopwords (standard English list, ~150 words) and drop n-grams that are entirely numeric or entirely non-alpha.
3. Compute `tf_S(t)` = count of t in S's corpus.
4. After processing all Scribes, compute `df(t)` = number of Scribes containing t.
5. `distinctiveness_S(t) = tf_S(t) / (df(t) ** 1.5)`.
6. Select keywords per S meeting ALL of:
   - `tf_S(t) ≥ 2` (min corpus frequency; avoids typos and single mentions)
   - `df(t) ≤ ceil(num_scribes / 2)` (distinctiveness ceiling — a term in most Scribes is not distinctive)
   - `distinctiveness_S(t)` is in top-K per S (start with K=150, tune if needed)
   - ALWAYS include n-grams where `df(t) == 1` AND `tf_S(t) ≥ 2` regardless of top-K cut (corpus-exclusive rare tokens — the highest-signal class)
7. Emit to `stitchpunks/scribes/auto_keywords/<scribe_id>.yaml` with metadata (generation timestamp, source files hash, extractor version).

## Deliverables

### Deliverable 1 — Auto-extraction module

- New file: `librarian-mcp/src/scribes/autoExtract.ts`
  - Exports `extractAutoKeywords(scribeId, keeperPaths): KeywordList`
  - Exports `extractAllAutoKeywords(registry): Map<scribeId, KeywordList>`
  - Pure deterministic given same inputs (for reproducibility of the empirical claim)
  - Handles missing files gracefully (warning + skip)
- New file: `librarian-mcp/scripts/rebuild_auto_keywords.mjs`
  - CLI: reads registry, runs extraction, writes sidecar YAMLs, prints summary
  - Idempotent: safe to re-run
- Unit tests: `librarian-mcp/tests/test_auto_extract.mjs`
  - Synthetic 3-Scribe fixture; assert distinctiveness ranking, exclusive-token inclusion, stopword filtering, n-gram handling
  - Assert deterministic output across two runs

### Deliverable 2 — Registry loader wires in auto keywords

- Modify `librarian-mcp/src/scribes/registry.ts`:
  - After loading `registry.yaml`, load sidecar `auto_keywords/<scribe_id>.yaml` for each Scribe if present
  - Merge auto keywords into the `keywords` array (dedupe; preserve order of hand-curated first, auto second)
  - Respect env var `LIBRARIAN_KEYWORDS_MODE`:
    - `union` (default): hand-curated + auto-derived
    - `auto-only`: auto-derived only (hand-curated `keywords:` ignored)
    - `hand-only`: hand-curated only (auto sidecar ignored) — legacy behavior for regression testing
  - All three modes should round-trip through `computeKeywordRarityMap()` and `scoreScribe()` unchanged

- Modify the handful of tests that assert on the `keywords` array to set `LIBRARIAN_KEYWORDS_MODE=hand-only` for stability, so K474 doesn't cascade-break K472/K473 tests

### Deliverable 3 — Run extraction for all current Scribes

Run `rebuild_auto_keywords.mjs` once to populate sidecar files for:
- All 9 Scribes in the Bishop registry (R9, BRIDLE, Landing, Prov14, Vault, Architecture, Decisions, FounderVoice, R11)
- All Scribes in the Knight Cathedral registry

Commit the sidecar files so the empirical claim is reproducible.

Report in the handoff: per-Scribe count of auto-derived keywords, top-5 by distinctiveness, any Scribes that came up empty (corpus unreachable).

### Deliverable 4 — Clean-Cathedral-Effect benchmark (the empirical gate)

Two verification runs on K471 bank, 50 questions each, `anthropic_haiku_bishop` condition (same as K473 for direct comparison):

- **Phase B: auto-only** — `LIBRARIAN_KEYWORDS_MODE=auto-only`, and **additionally remove the K472+K473 hand-added keywords from registry.yaml** (so the concept-keyword list is what it was before K472 hand-curation). Record HOT% per category and overall. Results path: `librarian-mcp/r10_cross_vendor/results_r11_k474_auto_only/`

  **This is the Clean Cathedral Effect number** — what the architecture earns without operator-tuning to the sealed bank.

- **Phase C: union** — `LIBRARIAN_KEYWORDS_MODE=union`, keep K472+K473 hand-added keywords (shipping configuration). Record HOT% per category and overall. Results path: `librarian-mcp/r10_cross_vendor/results_r11_k474_union/`

  **This is the shipping number** — what real operation produces.

### Deliverable 5 — Interpretation and handoff

In the handoff report, lay out three scenarios and which one Phase B landed in:

- **Architecture-earned**: Phase B HOT% ≥ 88% (matches or beats K473). The Cathedral Effect claim is clean; public claims can cite Phase B.
- **Architecture-mostly-earned**: Phase B HOT% in [80%, 88%). Still strong; describe the system honestly as "auto-extraction primary, expert annotations supplementary" and cite Phase B as the architecture floor.
- **Architecture-thin**: Phase B HOT% < 80%. The K472/K473 hand-curation was doing more work than expected. Report this honestly — do not paper over — and recommend whether to (a) tune the extractor (K475), (b) expand canonical_keepers for under-performing Scribes, or (c) keep hand-curation in the loop and reframe the claim accordingly.

No matter the outcome: the empirical truth lands in the handoff, full stop. Founder rule: "Prove it first. Product it second." This IS the proving-first step.

### Deliverable 6 — A&A draft for CJ #2291

Draft `BISHOP_DROPZONE/00_FOUNDER_REVIEW/AA_FORMAL_2291_SELF_INDEXING_SCRIBES_B122.md` following the pattern of AA_FORMAL_2278 (The Cathedral Effect):

- Innovation statement (what's novel): corpus-derived distinctiveness keywords computed via TF-IDF-with-exclusivity-floor, two-tier keyword architecture (concept + distinctiveness), self-regenerating on corpus change
- Prior art acknowledgment: standard TF-IDF is well-known; novelty is in the application to Scribe routing within a Cathedral retrieval architecture, the exclusivity-floor variant, and the union with hand-curated concept keywords
- Embodiment: reference K474 implementation
- Exhibit A: extraction algorithm spec
- Exhibit B: Phase B vs Phase C empirical comparison (the clean-vs-union HOT% table)
- Exhibit C: cross-Scribe distinctiveness examples (top-5 auto-keywords per Scribe)
- Claim skeleton: draft 4-6 claims covering the extraction method, the two-tier architecture, the exclusivity-floor variant, and the regeneration-on-corpus-change protocol

Leave this in FOUNDER_REVIEW for Founder ratification. Do NOT move to FOUNDER_APPROVED without Founder's explicit say-so.

### Deliverable 7 — Tests and commit

- Extend `test_lachesis_rarity_boost.mjs`: add tests exercising auto-derived keywords in synthetic corpus (distinctiveness routing works the same way as hand-curated rarity)
- Full test suite green (no regressions on K472/K473 tests; hand-only mode is the stability anchor)
- Rebuild green
- Handoff report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K474_B122_SELF_INDEXING_SCRIBES.md`
- Single commit covering: new modules, sidecar YAMLs, registry changes, tests, A&A draft, handoff, benchmark results
- Tag `v-self-indexing-scribes-K474`

## Constraints

- Do NOT remove the hand-curated K472/K473 keywords from registry.yaml in the shipped configuration — they stay in Phase C / union mode. Phase B runs with a *temporarily-pruned* registry for benchmark purposes only; restore before commit.
- Do NOT touch R11 corpus content, canonical_values.yaml, or any Stone-Tablet-class canonical source
- Do NOT run the full 9-condition matrix (K502 territory)
- Do NOT move the A&A draft to FOUNDER_APPROVED — leave in FOUNDER_REVIEW
- Publication hold applies
- The extractor must be deterministic (same inputs → same outputs) so the empirical claim is reproducible
- Do NOT fail the extractor if a canonical_keeper path is missing — warn and continue; architectural robustness matters more than strict completeness

## Success criteria

- Extractor runs on all current Scribes, produces sidecar YAMLs, reproducible across re-runs
- Phase B (auto-only, K472/K473 hand-adds removed) HOT% recorded honestly
- Phase C (union) HOT% ≥ K473 baseline (no regression on shipping config)
- Interpretation scenario documented per Deliverable 5
- A&A draft #2291 in FOUNDER_REVIEW
- Tests pass; rebuild green; single commit; tagged; handoff filed

## Why this matters (context Knight should carry)

The Cathedral Effect is the keystone empirical claim underwriting:
- R11-v3 public-claim gate
- Cost-Slasher marketing (50%+ / up to 95%)
- The Pedestal Stake prefunding thesis ("prove it first, product it second")

If the lift is hand-curated keywords rather than architecture, external critics can (rightly) dismiss the claim. K474 turns the lift into an architectural property that regenerates as the corpus grows. A skeptic running the benchmark on a new corpus should see the same architectural pattern produce the same kind of lift — *without any operator in the loop*.

This is the gate. Land it cleanly and the Cathedral Effect is defensible. Report it honestly even if the clean number disappoints — the architecture is more valuable long-term than the headline.

**Estimated wall time: 2-3 hours. $3-4 spend.**
