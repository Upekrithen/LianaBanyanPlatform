---
name: Parallel Preload Multilingual Retrieval Architecture
description: A multilingual LLM retrieval architecture organizing content as sibling preload files per language with canonical-fact invariance rules enforced across languages, including mandatory lang_fallback declaration and deliberate breach of locale formatting for numeric canonical values.
type: aa_formal
innovation_id: "2274"
ratification_session: B117
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - parallel preload multilingual retrieval
  - sibling preload files multilingual
  - canonical fact invariance across languages
  - lang fallback mandatory declaration
  - locale formatting breach canonical consistency
  - multilingual retrieval architecture
  - aa formal 2274
  - cross language retrieval canonical numbers
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A Formal #2274 — Parallel Preload Multilingual Retrieval Architecture

**Innovation #:** 2274
**Category:** AI Infrastructure / Multilingual / Canonical-Memory Invariance
**Crown Jewel:** **CANDIDATE** — recommend YES. The canonical-facts-invariance property is the specific patentable contribution.
**Bishop Session:** B117 (Formal draft). Originated: K435 Chapter 2 Mellon dispatch design during B116 (4-phase prompt). Empirically validated by K435 Phase C multilingual Eyewitness probe: ES-HOT 96.7% / EN-HOT 94.5% / gap +2.2pp (802/1,200 calls before budget truncation).
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh.
**Related:** R9 base preload architecture (the substrate this extends), #2270 (Scribes Cathedral — future multilingual extension), K435 dispatch (the implementation path).
**Implementation artifact:** `librarian-mcp-public/preload/r9v2_base.md` (English canonical) + `librarian-mcp-public/preload/r9v2_base_es.md` (Spanish sibling), shipped in `librarian-mcp` 0.3.0 (K435, tag `v0.3.0-mellon`). MCP tool `librarian_context(intent=..., lang="es")` exposed.

---

## TL;DR (2 lines)

Each language is a **sibling preload file** on disk (`r9v2_base.md`, `r9v2_base_es.md`, `r9v2_base_zh.md`), not a translation-at-query-time pipeline. `librarian_context(intent=..., lang="es")` resolves sibling files by language code with **explicit English-fallback reporting** (`lang_fallback` response field names the paths that fell back). Canonical numbers are preserved verbatim across languages (Arabic digits); proper nouns preserved with first-occurrence native-language gloss. Novel over real-time translation: **invariance of canonical facts across language versions**.

---

## The Problem

Multilingual LLM retrieval systems today handle non-English queries via one of two patterns, both flawed:

1. **Translate-at-query-time.** Translate the user's query to English, retrieve English content, translate the retrieval context + model response back. Problems: translation drift accumulates; canonical numbers can round-trip corrupt (86.1 → "eighty-six point one" → "86.10" or "86,1" depending on locale); proper nouns get paraphrased on each pass; latency triples.
2. **Vector-search-across-languages.** Build vector embeddings that place semantically-similar content from different languages near each other in embedding space. Problems: canonical facts that must be expressed identically across languages (like numeric results from a benchmark) get averaged with paraphrases during training; the system has no way to *forbid* rephrasing for canonical values.

The gap: a multilingual retrieval pattern that (a) guarantees canonical-fact invariance across languages, (b) reports fallback-to-English transparently rather than silently paraphrasing, (c) avoids translation latency, and (d) is auditable at per-language per-file granularity.

---

## Mechanism

### Sibling preload files

Each language gets its own preload file at a declared path following the convention `<base>_<lang>.md`:

- `r9v2_base.md` — English (canonical source-of-truth)
- `r9v2_base_es.md` — Spanish
- `r9v2_base_zh.md` — Chinese (future)
- `r9v2_base_fr.md` — French (future)

Sibling files contain the same intent-scoped content as the base, translated by humans or reviewed-machine, with the following invariance guarantees:

**Canonical numbers preserved verbatim.** 86.1 in English is 86.1 in Spanish (not 86,1 per Spanish locale convention). This is a deliberate breach of locale formatting in favor of cross-language canonical consistency. Rationale: "86.1 pp mean accuracy lift" is a scientific result; locale formatting would make it a different datum per region.

**Proper nouns preserved with first-occurrence gloss.** "Liana Banyan" in English stays "Liana Banyan" in Spanish, with first-occurrence parenthetical "(Liana Banyan — nombre de la plataforma cooperativa)" on first mention. Subsequent mentions are untranslated. Rationale: the brand is the brand; translation would dilute IP protection and search consistency.

**Founder-voice keystones preserved in source language with translation gloss.** "Veteran of no particular note" in English stays in English in the Spanish file, with translation gloss. Rationale: the phrase is canonically English; translating it loses the Founder's voice.

### `librarian_context(lang=)` tool behavior

```
librarian_context(intent="outreach", lang="es")
```

Tool resolution logic:

1. For each file that base (English) resolution would return, check for sibling file at the matching `_<lang>` path.
2. If sibling exists: serve the sibling.
3. If sibling does NOT exist: serve the English base AND include the file path in the `lang_fallback` response field.
4. If the `intent` itself has no mapped files in the base: return empty with a `intent_unknown` error, same as English behavior.

The `lang_fallback` response field is mandatory — the tool MUST declare fallback, never silently serve English and claim to have served Spanish.

### Empirical parity verification

K435 Phase C ran a multilingual Eyewitness probe: ES-HOT 96.7% / EN-HOT 94.5% / gap +2.2pp across 802 (budget-truncated from 1,200) calls. Spanish HOT accuracy was actually *higher* than English HOT accuracy — evidence that the sibling-file approach doesn't degrade retrieval quality when the translation is well-executed.

The 85% cross-language parity threshold (Spanish HOT ≥ 85% of English HOT accuracy) is the declared PASS criterion. Results cleared it substantially.

### Audit surface

Per-language per-file content is inspectable by filesystem walk. No hidden state. No embedding indirection. A reviewer can open `r9v2_base_es.md` and compare it to `r9v2_base.md` directly. This is the audit surface that translation-at-query-time and vector-search-across-languages architecturally cannot provide.

---

## Novelty Analysis

### Prior art and gaps

| Prior art | What it does | What it misses |
|---|---|---|
| Google Translate / DeepL | Translate-at-query-time | Translation drift; canonical-value corruption; no invariance guarantees |
| Multilingual vector embeddings (LaBSE, XLM-RoBERTa) | Cross-language semantic similarity | Paraphrases canonical values during training; no way to forbid rephrasing |
| i18n resource bundles (gettext, ICU) | Per-locale string tables | Application-layer only; not retrieval-corpus-organized; not audited at canonical-value-invariance level |
| Multilingual knowledge bases (Wikidata) | Structured multilingual facts | Schema-heavy; not prose preload; not LLM-context-oriented |
| MT-for-RAG wrappers | Translate query + retrieval-chunks on the fly | Round-trip drift; latency multiplication; no invariance property |

### Novel combination

1. **Sibling preload files** (one file per language, same intent structure) as the organizational primitive — not embedding-based cross-language retrieval.
2. **Canonical-fact invariance as a declared property** (canonical numbers verbatim; proper nouns preserved; Founder-voice keystones source-language + gloss). These rules are NOT enforced by standard translation tooling — they must be declared and checked at sibling-file-write time.
3. **`lang_fallback` response field as first-class output.** The retrieval tool MUST declare when it fell back to English. No silent paraphrase.
4. **Locale-formatting breach in favor of cross-language consistency.** 86.1 stays 86.1, not 86,1 — a deliberate design decision that most i18n systems would never make.
5. **Per-file per-language audit surface.** Reviewers compare files directly; no embedding indirection.

### What we are NOT claiming

- Multilingual content is not novel.
- Per-language files are not novel.
- RAG is not novel.
- **What is novel is the specific combination: (sibling-file preload organization) + (canonical-fact invariance rules as declared properties) + (mandatory lang_fallback declaration) + (locale-formatting breach for cross-language consistency) + (per-file per-language audit surface), applied to LLM retrieval corpus multilingualization.**

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for multilingual LLM retrieval from a canonical corpus, comprising:

(a) organizing the corpus as a set of sibling files, wherein for each base file representing canonical content in a first language, zero or more sibling files exist representing the same content in additional languages, each sibling file named according to a declared convention encoding its language code;

(b) serving a retrieval request accompanied by a declared target-language parameter by: (i) resolving each base file the request would return; (ii) for each base file, checking for the existence of a sibling file in the target language via the declared naming convention; (iii) returning the sibling file's content when it exists, or the base file's content otherwise; and (iv) returning, in a declared response field, the set of base-file paths that fell back due to sibling non-existence;

(c) enforcing a set of canonical-fact invariance properties across sibling files, comprising at least: (i) numeric canonical values rendered identically across languages regardless of locale-formatting conventions; (ii) declared proper-nouns preserved in source-language form with first-occurrence translation gloss; (iii) declared source-language keystone phrases preserved in source language with translation gloss.

**Claim 2 (Apparatus).** A system comprising: a corpus module organized per Claim 1(a); a retrieval tool implementing Claim 1(b); a canonical-invariance validator implementing Claim 1(c) applied at sibling-file-write time or as a pre-publish gate; and a benchmark module configured to measure cross-language retrieval accuracy parity.

### Dependent claims

- **Claim 3.** The method of Claim 1 wherein the naming convention of Claim 1(a) is `<base-name>_<ISO-639-language-code>.md`, enabling filesystem-level enumeration of language coverage.
- **Claim 4.** The method of Claim 1 wherein the response field of Claim 1(b)(iv) is named `lang_fallback` and contains an array of file paths, and wherein a non-empty `lang_fallback` array is treated as first-class information by downstream consumers rather than as an error.
- **Claim 5.** The method of Claim 1 wherein the canonical numeric value rendering of Claim 1(c)(i) uses Arabic digits and Western decimal notation across all languages regardless of target locale, as a declared breach of locale-formatting convention in favor of cross-language canonical consistency.
- **Claim 6.** The method of Claim 1 wherein the proper-nouns preservation of Claim 1(c)(ii) is enforced by a lookup table of declared proper nouns, and wherein first-occurrence translation gloss is optional per declared locale but subsequent occurrences are preserved source-language verbatim.
- **Claim 7.** The method of Claim 2 wherein the benchmark module measures per-language HOT accuracy against a declared parity threshold, and reports fail when target-language HOT accuracy falls below a declared fraction of source-language HOT accuracy.
- **Claim 8.** The method of Claim 1 wherein the retrieval tool is exposed as an MCP tool callable as `librarian_context(intent, lang)`, enabling any MCP-capable agent to request language-specific retrieval.
- **Claim 9.** The method of Claim 1 further comprising a per-file per-language review status field, enabling downstream consumers to distinguish reviewed-translation siblings from machine-translated siblings awaiting human review.

---

## Implementation evidence

- **Preload files:**
  - `librarian-mcp-public/preload/r9v2_base.md` (English canonical)
  - `librarian-mcp-public/preload/r9v2_base_es.md` (Spanish sibling; translator-note REVIEW STATUS: unreviewed)
- **MCP tool:** `librarian_context(intent=..., lang="es")` registered in `librarian-mcp-public/` package, shipped in `librarian-mcp` 0.3.0 (tag `v0.3.0-mellon`)
- **Tests:** 4 new tests covering `lang` parameter behavior, bringing total to 38/38 green
- **Empirical validation:** K435 Phase C multilingual Eyewitness probe — 802 calls (budget-truncated from 1,200); ES-HOT 96.7%, EN-HOT 94.5%, gap +2.2pp; cleared 85% parity threshold substantially

---

## Cross-References

1. **R9 base preload** — the substrate this extends; `r9v2_base.md` is the English canonical source
2. **#2270 Scribes Cathedral** — future multilingual extension candidate; member Cathedrals may grow sibling tablets per member language
3. **#2272 Cost-Slasher Claim Ladder** — the Cost-Slasher table must preserve numeric values verbatim across languages per Claim 5
4. **K435 Chapter 2 Mellon** — the implementing Knight dispatch; shipped B116
5. **R10 Eyewitness Benchmark** — the benchmark methodology Claim 7 references for parity measurement

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [x] Cross-reference from `PROV_14_DRAFT.md` Section 2 #2274 entry
- [ ] Update `PROV_14_DRAFT.md` to note A&A Formal file path for #2274
- [ ] Counsel review — Claim 5's "deliberate breach of locale-formatting" phrasing is unusual; confirm whether it's defensible as a method step or should be recharacterized
- [ ] `r9v2_base_es.md` currently flagged unreviewed (translator-note REVIEW STATUS: unreviewed) — schedule a Spanish-native reviewer pass before Chapter 3 ships; tie review completion to Claim 9 review-status field
- [ ] Optional: add `r9v2_base_zh.md` (Chinese) or `r9v2_base_fr.md` (French) as next-language candidates; each file is a standalone deliverable

---

**Innovation count:** no change (this formalizes #2274 which was already counted in B116).
**Crown Jewels:** candidate — Founder ratification needed. Recommend YES.
**Claims:** +9 claims (2 independent, 7 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Seventh and final A&A Formal of the Prov 14 Section-2 thresh (after #2273, #2272, #2271, #2268, #2269, #2270). Canonical-fact invariance across languages — the property that makes R9 defensibly multilingual, not just translated.*

**FOR THE KEEP.**
