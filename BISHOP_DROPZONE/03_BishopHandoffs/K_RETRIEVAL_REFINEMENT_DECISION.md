# K-Retrieval-Refinement — Architecture Decision D.1
**Session K546 / Bishop B133 — 2026-04-29**
**STATUS: AWAITING FOUNDER RATIFICATION**

---

## Confirmed Root Cause (Phase A Findings)

### A.1 — Retrieval Scoring Architecture

The `consult_scribes` system scores at **Scribe level** (not entry level). The query is matched against each Scribe's `keywords` array in `registry.yaml`. If a Scribe scores > 0, it is selected and returns its content:
- **Corpus-mode Scribe** (scribe R11): returns ALL entries (up to 200 with current max_entries cap) — the model gets every corpus fact
- **Observational-mode Scribes**: return most-recent N entries

**Implication**: For R11/MJ-07 to succeed, the Scribe R11 must score > 0 for the query. Once it does, all 150 corpus facts (including MJ-07) are delivered to the model. The alias issue is a **Scribe-selection problem**, not an entry-retrieval problem.

### A.2 — MJ-07 Corpus Entry

**Corpus entry**: `r11_canonical_corpus.md` §MJ-07 "Member Communication Channel Response SLA"

The entry body contains:
```
KEY FACT — Member Inquiry Acknowledgment SLA: official support channel acknowledgment within 4 business hours;
substantive response within 3 business days for standard inquiries...
Aliases: member support SLA, inquiry response time, official support channel SLA,
4hr acknowledgment, communication response window.
```

**The alias IS in the corpus observation**. The model CAN answer if R11 is consulted.

**Confirmed miss mechanism**:
- Query: "What is the acknowledgment SLA for member inquiries submitted through the official support channel?"
- "official support channel" → not in R11 Scribe keywords
- "acknowledgment SLA" → not in R11 Scribe keywords
- R11 Scribe scores 0 → not consulted
- Companion MJ-07b ("substantive response SLA for standard member inquiries") — uses "Reference Communication Standards" which IS in R11 keywords → R11 consulted → HOT

**Comparison showing the gap**: MJ-07 vs MJ-07b differ only in query phrasing. MJ-07b triggered R11 because it mentions "Reference Communication Standards" (an R11 keyword). MJ-07 uses the alias-phrasing without the canonical framework name.

---

## Three Architecture Options

### Option α — Registry-Level Keyword Extension (Knight default)

**Mechanism**: Add the alias terms from corpus observation bodies directly to the R11 Scribe's `keywords` list in `registry.yaml`.

**Specific change for MJ-07**:
```yaml
# In registry.yaml, R11 Scribe keywords:
- official support channel
- acknowledgment SLA
- 4 business hours
- member support SLA
- inquiry response time
- communication response window
```

**Implementation scope**:
- Audit all MJ corpus entries (MJ-01 through MJ-08) for query-term → keyword gaps
- Add alias terms to registry.yaml
- No code changes — registry change only
- Rebuild librarian-mcp: `npm run rebuild`

**Prior art**: K473 did exactly this for AM and MJ categories, adding "Reference Communication Standards", "exit interview", etc. That fix worked and cleared 21 of 22 then-failing questions. This is the same pattern.

**Pros**:
- Minimal blast radius (registry-only)
- Reversible (one YAML edit)
- No engine code changes
- Matches K473 precedent
- Fast: 30-minute implementation

**Cons**:
- Keyword list grows over time (maintainability concern for large corpus expansions)
- Keywords are not self-documenting (reader must trace back to corpus to understand why a keyword was added)
- Doesn't solve the structural problem for future corpus expansions

### Option α-full — Corpus-Level Alias Arrays + Engine Changes

**Mechanism**: Add `aliases: [...]` arrays to each scribe_R11.jsonl entry. Extend scoring engine to read corpus aliases at query time.

**Implementation scope**:
- Modify `scribe_R11.jsonl`: add `aliases` field to each of ~150 entries
- Modify `registry.ts` `scoreScribe()`: read corpus content + extract aliases for keyword matching
- Or: add a pre-processing step that generates a keyword sidecar from corpus aliases
- Rebuild + test

**Pros**:
- Self-documenting: aliases live next to the facts they describe
- Scales better for future corpus expansion
- Reduces registry.yaml sprawl

**Cons**:
- Engine code change required (reads corpus at scoring time — latency impact)
- Or requires pre-processing pipeline (added complexity)
- Much larger implementation: 2-4 hours vs 30 minutes
- Higher risk of regression in existing consult behavior

### Option β — Embedding-Based Fuzzy Matching

**Mechanism**: At retrieval time, compute embeddings of the query and each Scribe's description/keywords. Score via cosine similarity instead of (or in addition to) token overlap.

**Pros**:
- Handles arbitrary paraphrase (would catch "official support channel" ≡ "member communication channel")
- Most general solution

**Cons**:
- Requires embedding model at query time (latency: 30-80ms per query, per K539 AM-06 data)
- Adds external dependency (embedding API or local model)
- Significant scope expansion: entire scoring pipeline changes
- Could disrupt existing working conditions (R9 HOT rate, AM/RC/HP/EG categories)
- Not implementable within K546 budget (~3-5 hr)

### Option γ — Manual Alias Dictionary at Engine Layer

**Mechanism**: Maintain a static `alias_dictionary.yaml` at engine level mapping query-phrasing aliases to their canonical Scribe/entry identifiers.

**Pros**:
- Engine stays clean; aliases managed separately from both registry and corpus
- Can be applied across all Scribes, not just R11

**Cons**:
- Third file to maintain (registry + corpus + alias dictionary)
- Same keyword-drift problem as option α but with even more indirection
- No material advantage over option α for this specific fix

---

## Knight Recommendation

**Option α (Registry-Level Keyword Extension)** — same mechanism as K473 Fix, confirmed working.

**Rationale**:
1. K473 added 4 MJ keywords and cleared 21 of 22 failing questions — this is the same pattern
2. The corpus already has the aliases; propagating them to the registry is the minimal correct fix
3. Scope is bounded: audit ~8 MJ entries, add ~8-12 keywords
4. Zero engine code risk
5. Consistent with Stone Tablet Imperative (append-only, small reversible changes)

**Specific keywords to add (MJ-07 minimum)**:
- `official support channel`
- `acknowledgment SLA`
- `4 business hours` (already present in registry — confirm)
- `4hr acknowledgment`

**Full audit scope (Phase B.1)**: review MJ-01 through MJ-08 corpus entries to identify any other alias gaps similar to MJ-07.

---

## BISHOP PAUSE — DO NOT PROCEED TO PHASE B

Per K546 scope: "Bishop pauses Knight; surfaces to Founder before Phase B."

Founder must ratify:
1. Which option (α recommended)
2. Whether to audit ALL MJ entries (full audit) or minimum (MJ-07 only)
3. Whether to extend audit to other categories (RC, HP, EG, CS, AM) — low risk, but outside current scope

**If α ratified**: Knight implements in ~30 minutes, reruns 33q MJ panel, expects 33/33 HOT.
**Budget**: ~$0.05-0.15 vendor API for partial refire.

---

*K546 / B133 / 2026-04-29 — Phase A complete. Awaiting Founder ratification.*
