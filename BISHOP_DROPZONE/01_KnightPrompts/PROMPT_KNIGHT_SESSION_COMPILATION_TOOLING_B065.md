# KNIGHT SESSION: Document Compilation Tooling

## MISSION
Build a compilation engine that reads multiple versions of the same document, identifies what's unique in each, and produces ONE canonical compiled version. Bishop has already content-hashed all 9,839 files and identified 352 document families with genuinely different variants. Knight builds the tool; Bishop and Pawn handle the intellectual compilation.

## CONTEXT
- SP-3 Classifier has categorized 15,597 files into 10 canonical sections
- SP-10 Content Reader has read 9,839 files and stored content locally in `librarian-mcp/stitchpunks/data/content_archive/`
- Content archive index: `librarian-mcp/stitchpunks/data/content_archive_index.json`
- Each archived file: `data/content_archive/{hash}.json` with full `content_markdown`
- 1,717 families are identical copies (no work needed)
- 352 families have genuinely different variants needing compilation
- Biggest categories: Letters (152), Written (55), Patent Bags (39), Blueprints (26)

## WHAT TO BUILD

### 1. Migration: compiled_documents table

Create: `supabase/migrations/YYYYMMDD000001_compiled_documents.sql`

```sql
CREATE TABLE IF NOT EXISTS compiled_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  family_name TEXT NOT NULL,           -- base name that groups variants
  section TEXT,                        -- SP-3 section (01_BLUEPRINTS, etc.)
  category TEXT,                       -- cephas category
  section_librarian INTEGER,
  compiled_markdown TEXT,              -- THE compiled output
  source_count INTEGER DEFAULT 0,     -- how many source files went into this
  source_files JSONB DEFAULT '[]',    -- array of {path, filename, content_hash, chars}
  unique_variants INTEGER DEFAULT 0,  -- how many were genuinely different
  compilation_notes TEXT,             -- what was merged, what was superseded, what corrections applied
  compiled_by TEXT,                    -- 'BISHOP', 'PAWN', 'KNIGHT'
  compiled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'canonical', 'superseded')),
  supersedes TEXT[],                  -- slugs of documents this replaces
  superseded_by TEXT,                 -- slug of document that replaces this
  founder_corrections_applied TEXT[], -- which corrections from memory were applied
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE compiled_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read compiled_documents" ON compiled_documents FOR SELECT USING (true);
CREATE POLICY "Auth insert compiled_documents" ON compiled_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update compiled_documents" ON compiled_documents FOR UPDATE USING (true);

CREATE INDEX idx_compiled_documents_family ON compiled_documents (family_name);
CREATE INDEX idx_compiled_documents_section ON compiled_documents (section);
CREATE INDEX idx_compiled_documents_status ON compiled_documents (status);
```

### 2. Edge Function: compile-document

Create: `supabase/functions/compile-document/index.ts`

Receives a compiled document and upserts it. Simple CRUD.

```typescript
// Input: { slug, title, family_name, section, category, section_librarian,
//          compiled_markdown, source_count, source_files, unique_variants,
//          compilation_notes, compiled_by, founder_corrections_applied }
// Upserts into compiled_documents on slug
```

### 3. Page: CompilationDashboardPage

Create: `platform/src/pages/CompilationDashboardPage.tsx`
Route: `/admin/compilation` (add to dashboard.tsx routes, behind ProtectedRoute)

This page shows:
- **Summary stats**: Total families, compiled so far, remaining
- **Tabs**: "Needs Compilation" | "Compiled" | "Canonical" | "Superseded"
- **"Needs Compilation" tab**:
  - Query compiled_documents where status != 'canonical' OR where family_name not yet in compiled_documents
  - For families not yet compiled: show family_name, variant count, total KB, section badge
  - Sort by unique_variants DESC (highest variant count = most work needed)
- **"Compiled" tab**:
  - Shows compiled documents with status='draft' or 'reviewed'
  - Each card: title, compiled_markdown preview (first 500 chars), source_count, compilation_notes
  - Buttons: "Mark Canonical" (sets status='canonical') | "Edit" | "View Sources"
- **"Canonical" tab**:
  - The finished products. Status='canonical'. Read-only view with full rendered markdown.

### 4. Enhancement: LibrarianDashboardPage

Add a "Compiled" count to the stats bar at top (alongside In Queue, Resolved, Questions, Sections).
Query: `SELECT COUNT(*) FROM compiled_documents WHERE status = 'canonical'`

### 5. Python: compilation_helper.py

Create: `librarian-mcp/stitchpunks/compilation_helper.py`

This script helps Bishop and Pawn do the intellectual work:

```python
# Usage:
#   python compilation_helper.py --family "letter-warren-buffett"   # show all variants for a family
#   python compilation_helper.py --diff "letter-warren-buffett"     # show diffs between variants
#   python compilation_helper.py --list                             # list all families needing compilation
#   python compilation_helper.py --list --section 10_LETTERS        # filter by section
#   python compilation_helper.py --submit "letter-warren-buffett" compiled.md  # submit compiled version

# --family: reads all archived files for that family, prints them side by side with diff markers
# --diff: uses difflib to show what's unique in each variant (not what's shared)
# --list: reads content_archive_index.json, groups by family, shows variant counts
# --submit: reads compiled.md, POSTs to compile-document edge function
```

Key implementation detail for --diff:
- Find the LONGEST variant as the "base"
- For each other variant, compute the diff against the base
- Show ONLY the lines that are UNIQUE to each variant (additions, not shared content)
- This tells Bishop/Pawn exactly what's new in each version without reading the whole thing

### 6. Deploy

1. Apply migration: `npx supabase db push`
2. Deploy edge function: `npx supabase functions deploy compile-document --no-verify-jwt`
3. Build and deploy frontend: `cd platform && npm run build && firebase deploy --only hosting`

---

## TABLES TOUCHED
- `compiled_documents` — NEW

## EDGE FUNCTIONS CREATED
- `compile-document` — Upsert compiled documents

## PAGES CREATED/MODIFIED
- `CompilationDashboardPage.tsx` — NEW
- `LibrarianDashboardPage.tsx` — Add compiled count to stats
- `dashboard.tsx` — Add route

## VERIFICATION
1. Run `python compilation_helper.py --list` — should show 352 families
2. Run `python compilation_helper.py --family "letter-warren-buffett"` — should show 10 variants
3. Run `python compilation_helper.py --diff "letter-warren-buffett"` — should show unique lines per variant
4. Open `/admin/compilation` — should show "Needs Compilation" tab with 352 families
