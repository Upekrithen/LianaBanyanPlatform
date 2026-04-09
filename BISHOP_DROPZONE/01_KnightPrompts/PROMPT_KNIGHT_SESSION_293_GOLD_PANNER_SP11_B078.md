# PROMPT_KNIGHT_SESSION_293 — Gold Panner (SP-11)
## Bishop B078 | April 4, 2026
## Mission: Read the archive. Surface the gold.

---

## CONTEXT

The Corps has 9,653 files archived to Supabase (`content_archive`) with full content. Classifier (SP-3), Archivist (SP-2), Cross-Referrer (SP-4), and Pipeline Bridge (SP-10) all operate on filename + path + shallow keyword matches. **Nobody is reading the content to find gold.**

The Founder's concern: *"That was the problem a long time ago. Not knowing what gold was actually in there."*

This session builds **SP-11: The Gold Panner** — a content-reading script that surfaces buried innovations, quotable passages, themes, contradictions, and unprospected names/orgs from 9,653 files.

---

## WORKING DIRECTORY

- **New script:** `librarian-mcp/stitchpunks/sp11_gold_panner.py`
- **Data source:** `content_archive` table in Supabase (9,653 rows with full text)
- **Outputs:** `librarian-mcp/stitchpunks/data/gold/`
  - `candidate_innovations_b078.json`
  - `quotable_passages_b078.json`
  - `theme_map_b078.json`
  - `contradiction_log_b078.json`
  - `name_org_extraction_b078.json`
  - `gold_panner_state.json` (resume-from-state)
- **Report:** `BISHOP_DROPZONE/99_Misc/GOLD_PANNER_REPORT_B078.md`

---

## PHASES

### Phase 1: Build SP-11 Scaffold

Create `sp11_gold_panner.py` with:
- Supabase client (same pattern as `sp10_content_reader.py`)
- Batched reader (pull content_archive in chunks of 200)
- State file checkpointing every batch (resume-from-state)
- Output directory creation
- Logging per-batch with file counts + passage counts

### Phase 2: Innovation Candidate Detection (top 200)

**Heuristics:**
- Phrases containing: "innovation", "I invented", "new system", "we call this", "this is called", "novel approach", "first of its kind"
- Numbered innovation references (#NNNN pattern, where NNNN is 4 digits)
- "Crown Jewel" mentions
- Patent-adjacent language: "claims", "embodiments", "prior art", "method comprising"
- Architectural patterns: "the X system", "the X mechanism", "when X happens, Y occurs"

**Scoring:**
- Higher score if multiple heuristics trigger in same passage
- Boost passages in papers/patent_bags over Bishop handoffs (dedupe noise)
- Penalize passages already tied to known innovations (#1-#2150) via `innovation_log` cross-check

**Output:** `candidate_innovations_b078.json`
```json
{
  "candidates": [
    {
      "score": 0.87,
      "passage": "...",
      "source_file": "path/to/file.md",
      "source_slug": "...",
      "context_before": "...",
      "context_after": "...",
      "matched_heuristics": ["innovation-keyword", "architectural-pattern"],
      "already_known_innovation": null
    }
  ],
  "total_candidates": 200,
  "source_files_scanned": 9653
}
```

### Phase 3: Quotable Passage Harvesting (top 500)

**Heuristics:**
- Passages 15–50 words
- Contains rhetorical patterns: "What if", "Imagine", "The truth is", "This is why", "Consider:"
- Quotable markers: starts with capital, ends with period/?/!
- High signal-to-noise ratio (penalize boilerplate, lists, URLs)
- Metaphor density: food metaphors (pudding/soup/spice), railroad, crown, medallion

**Scoring:**
- Higher for passages with named concepts (Liana Banyan, Crown, Pudding, HexIsle, etc.)
- Higher for first-person Founder voice
- Boost if passage is unique across archive (not repeated boilerplate)

**Output:** `quotable_passages_b078.json`
```json
{
  "passages": [
    {
      "score": 0.92,
      "quote": "We'd rather check on you 100 times for nothing than miss the one time you need us.",
      "source_file": "...",
      "word_count": 19,
      "metaphor_tags": ["railroad"],
      "named_concepts": ["Rally Group"]
    }
  ],
  "total_passages": 500
}
```

### Phase 4: Theme Mapping

**Build cross-archive theme frequency map:**
- Define ~30 canonical themes (Cost+20%, 83.3%, cooperative, closed-loop, railroad, medallion, Sweet Sixteen, etc.)
- For each theme, count mentions across files, track files, track session IDs (B-codes)
- Identify orphan themes (mentioned < 3 times) and oversaturated themes (> 500 mentions)

**Output:** `theme_map_b078.json`
```json
{
  "themes": {
    "cost_plus_20": {
      "mention_count": 1247,
      "file_count": 389,
      "session_span": ["B001", "B078"],
      "sample_passages": ["...", "...", "..."]
    }
  }
}
```

### Phase 5: Contradiction Detection

**Approach:**
- For each theme, pull all passages mentioning it
- Group passages that contain numbers/percentages/names
- Flag conflicting statements (e.g., "83%" vs "83.3%" vs "84%")
- Flag conflicting attributions (Crown assignments, initiative counts)

**Output:** `contradiction_log_b078.json`
```json
{
  "contradictions": [
    {
      "topic": "creator_keep_percentage",
      "canonical": "83.3%",
      "conflicting_statements": [
        {"value": "83%", "file": "...", "session": "B012"},
        {"value": "84%", "file": "...", "session": "B034"}
      ],
      "severity": "high"
    }
  ]
}
```

### Phase 6: Name/Org Extraction

**Extract all proper nouns from archive:**
- People names (First + Last pattern)
- Organizations (Inc/Corp/LLC/Company patterns, known foundation names)
- Filter out known Crown Letter recipients + canonical names
- Output candidates for new outreach

**Output:** `name_org_extraction_b078.json`
```json
{
  "people": [
    {
      "name": "Jane Doe",
      "mention_count": 7,
      "context_samples": ["..."],
      "is_known_crown_candidate": false,
      "sessions_mentioned": ["B045", "B067"]
    }
  ],
  "organizations": [...]
}
```

### Phase 7: Summary Report

Write `GOLD_PANNER_REPORT_B078.md` with:
- Top 20 candidate innovations ranked
- Top 50 quotable passages
- Theme frequency heatmap (top 30)
- Top 10 contradictions needing reconciliation
- Top 20 new name/org outreach candidates
- Links to full JSON outputs

---

## ACCEPTANCE CRITERIA

- `sp11_gold_panner.py` exists and runs to completion from content_archive
- All 5 output JSONs produced, properly formatted
- Summary report written to dropzone
- Resume-from-state works (kill mid-run, restart, continues)
- At minimum 100 candidate innovations, 250 quotable passages surfaced
- At least 5 contradictions flagged (there are known ones: 83% vs 83.3%, 14 vs 16 initiatives, etc.)
- Build + lint clean on any TypeScript/Python touched

---

## SCOPE DISCIPLINE

- **Do NOT** modify source files. Read-only.
- **Do NOT** auto-file things into innovation_log or Crown Jewel lists — Founder reviews + approves.
- **Do NOT** call external LLM APIs for scoring — use local heuristics (keyword + pattern matching + regex).
- If using embeddings, use a local model (sentence-transformers) — no API costs, no data leaving env.
- Idempotent: running twice should not duplicate results; state file dedupes.

---

## WHAT THIS UNBLOCKS

Once Gold Panner runs:
- Founder can review candidate innovations and promote Crown Jewels
- Pawn can compile Puddings from top quotable passages
- Contradiction log feeds Sentinel (SP-5) for canonical cleanup
- Name/org extraction feeds Pawn B47+ Crown Letter pipeline
- Theme map informs Spice Rack taxonomy + Recipe Pot routing

**This is the missing step between "we have all the files" and "we know what's in them."**

---

*Bishop B078. SP-11 Gold Panner. Read the archive. Surface the gold. Non-destructive. Resume-from-state. Local heuristics only.*
