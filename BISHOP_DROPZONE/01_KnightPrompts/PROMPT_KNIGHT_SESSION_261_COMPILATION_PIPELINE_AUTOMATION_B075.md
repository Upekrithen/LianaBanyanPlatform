# KNIGHT SESSION 261 — Compilation Pipeline Automation
## Bishop B075 | April 4, 2026

---

## MISSION

Build automation to grind through the remaining uncompiled document families. The compilation pipeline needs to process ~250 remaining families from the 9,837-file content archive. Currently, compilation requires manual Bishop/Pawn sessions per family. This session builds the tooling to batch-process families automatically.

---

## CONTEXT

### What exists:
- `librarian-mcp/stitchpunks/compilation_helper.py` — CLI for listing families, extracting variants, submitting compiled docs
- `librarian-mcp/stitchpunks/extract_for_pawn.py` — Extracts source material per family
- `librarian-mcp/stitchpunks/gen_pawn_prompts.py` — Generates per-family Pawn prompts with embedded content
- `compiled_documents` table in Supabase
- `compile-document` edge function
- `/admin/compilation` dashboard page

### What's missing:
- No way to see which families are compiled vs. pending
- No batch processing — each family requires a manual session
- No progress tracking across the pipeline
- The compilation dashboard likely shows zero rows (K259 will fix that)

### Family breakdown (from B065 dedup analysis):
- 352 genuine variant families needing compilation
- ~100 compiled so far
- ~250 remaining: Patent Bags (39), Blueprints (26), Campaign/Press (80), remaining Letters (137+), misc

---

## STEP 1: Compilation Status Tracker

Add a `compilation_status` table to track which families have been processed:

```sql
CREATE TABLE IF NOT EXISTS compilation_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL UNIQUE,
  section TEXT, -- e.g., 'letters', 'papers', 'patent_bags', 'blueprints'
  variant_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'in_progress' | 'compiled' | 'skipped'
  compiled_document_id UUID REFERENCES compiled_documents(id),
  assigned_to TEXT, -- 'bishop' | 'pawn' | 'auto'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compilation_status_status ON compilation_status(status);
CREATE INDEX idx_compilation_status_section ON compilation_status(section);
```

---

## STEP 2: Populate Status Tracker from Archive

Write a script `platform/scripts/populate-compilation-status.ts` that:

1. Reads the archivist report (`librarian-mcp/stitchpunks/data/archivist_report.json`) for family listings
2. For each family with 2+ variants:
   - Inserts into `compilation_status` with family_name, section, variant_count
   - Checks if a matching `COMPILED_*.md` exists in BISHOP_DROPZONE → marks as 'compiled'
   - Checks if a matching row exists in `compiled_documents` table → links it
3. Reports: total families, compiled, pending, by section

---

## STEP 3: Auto-Compiler for Simple Families

Write a script `platform/scripts/auto-compile.ts` that handles simple compilation cases automatically:

**Auto-compilable** (no human judgment needed):
- Families where all variants are identical (true duplicates) → pick the newest, mark compiled
- Families where one variant is clearly a superset of the others (contains all content + more) → pick the superset
- Single-version documents that need no compilation → mark as 'skipped' (already canonical)

**Requires human review** (flag for Bishop/Pawn):
- Families with genuine content differences between variants
- Patent Bags (IP-sensitive, Bishop-only)
- Letters with substantive version changes

The script should:
1. Query `compilation_status WHERE status = 'pending'`
2. For each family, load all variants from the content archive
3. Apply auto-compilation rules
4. For auto-compilable: generate compiled doc, push to DB, update status
5. For human-review: update status to 'needs_review', add notes explaining why
6. Report: auto-compiled count, needs-review count, by section

---

## STEP 4: Update Compilation Dashboard

Enhance `platform/src/pages/admin/CompilationDashboardPage.tsx`:

1. Add a summary bar: total families / compiled / pending / needs review
2. Add section filter (letters, papers, patent_bags, etc.)
3. Add status filter (pending / compiled / needs_review / skipped)
4. Show family cards with: family_name, variant_count, section, status, assigned_to
5. "Auto-Compile" button that triggers the auto-compile script for selected families
6. "View Compiled" link to see the compiled document content

---

## STEP 5: Verify

```sql
SELECT status, COUNT(*) FROM compilation_status GROUP BY status;
-- Should show breakdown of pending, compiled, skipped, needs_review

SELECT section, status, COUNT(*) FROM compilation_status GROUP BY section, status ORDER BY section;
-- Should show per-section breakdown
```

---

## ACCEPTANCE CRITERIA

- [ ] `compilation_status` table created and populated
- [ ] Auto-compiler handles true duplicates and supersets
- [ ] Remaining families flagged as 'needs_review' with explanatory notes
- [ ] Dashboard shows real status data with filters
- [ ] `npm run build` passes

## DO NOT

- Auto-compile Patent Bag families (IP-sensitive, Bishop-only)
- Delete any source files or variants
- Modify any existing compiled documents
- Skip the 'needs_review' flagging for ambiguous families
