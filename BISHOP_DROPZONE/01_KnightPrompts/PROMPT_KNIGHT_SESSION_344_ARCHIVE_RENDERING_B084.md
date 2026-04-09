# K344: Archive Source Documents → Readable Cephas Content
# Priority: CRITICAL — closes the biggest integration gap
# Bishop: B084 | Date: 2026-04-06

## THE PROBLEM

The Upekrithen-Trunk contains 93 .md source documents across 10 categories (Sacred Texts, Founders Journals, Economic Philosophy, HexIsle Creative, etc.). These are the FOUNDING DOCUMENTS of the platform — the Galactic Empire, the Senate Architecture, the Chronicler's Hall, the Business Plan, the handwritten notes. They are the source material from which 2,222 innovations were extracted.

But no member can read them. They sit as raw .md files in a directory. K343 created `content_source_links` so innovation detail pages can reference these documents by path — but clicking a path leads nowhere.

## OBJECTIVE

Make every Upekrithen-Trunk source document readable on a platform surface.

## APPROACH: compiled_documents → Cephas Archive Reader

The `compiled_documents` table already exists with:
- `slug`, `title`, `family_name`, `section`, `category`
- `compiled_markdown` (TEXT — the content)
- `source_files` (JSONB — array of source file paths)
- `source_count`, `unique_variants`, `compilation_notes`
- `status` (draft/review/published/archived)

### Phase 1: Ingest Trunk Documents into compiled_documents

Write a script or migration that reads each of the 93 .md files from `Upekrithen-Trunk/` and inserts them into `compiled_documents`:

```
Categories to ingest (EXCLUDE CONFIDENTIAL, INTERNAL_ONLY, PLATFORM):
- SACRED_TEXTS/ (including SECRET_PLANS/) — ~25 files
- FOUNDERS_JOURNALS/ — ~28 files (Journals 01-15 + compiled versions + master index)
- FOUNDERS_LORE/ — ~19 files
- ECONOMIC_PHILOSOPHY/ — ~5 files
- HEXISLE_CREATIVE/ — ~2 files
- MASTERS_ACADEMIC/ — ~11 files
- GAME_DEVELOPMENT/ — 1 file
- ORDINARY_WORLDS/ — 2 files (book fragments — may be sensitive, mark as draft)
- VIDEO_SCRIPTS/ — check for .md files
```

For each file:
- `slug`: kebab-case of filename (e.g., `the-galactic-empire-of-liana-banyan`)
- `title`: Extract from first `#` heading or use filename
- `family_name`: trunk category (e.g., `SACRED_TEXTS`)
- `section`: subcategory if applicable (e.g., `SECRET_PLANS`)
- `category`: map to content type (`founding_document`, `journal`, `economic_treatise`, `creative_lore`, `academic_document`)
- `compiled_markdown`: full file content
- `source_files`: `[{"path": "Upekrithen-Trunk/SACRED_TEXTS/THE_SENATE_ARCHITECTURE.md", "role": "primary"}]`
- `status`: `'published'` for most, `'draft'` for ORDINARY_WORLDS (creative fiction)

### Phase 2: Archive Reader Component

Create `ArchiveDocumentReader.tsx`:

```tsx
// Route: /cephas/archive/:slug
// Reads from compiled_documents WHERE slug = :slug
// Renders compiled_markdown as formatted content
// Shows metadata: family_name, section, category, source_files
// Shows "Innovations sourced from this document" via content_source_links WHERE source_path LIKE '%filename%'
// Shows "Related Puddings" and "Related Papers" via innovation cross-links
```

### Phase 3: Archive Index Page

Create `ArchiveIndex.tsx`:

```tsx
// Route: /cephas/archive
// Lists all compiled_documents WHERE category IN ('founding_document', 'journal', 'economic_treatise', 'creative_lore', 'academic_document')
// Grouped by family_name (Sacred Texts, Founders Journals, etc.)
// Each entry shows: title, category, word count, innovation count sourced from it
// Filterable by category
// Links to /cephas/archive/:slug
```

### Phase 4: Wire InnovationSourceLinks to Archive Reader

Update K343's `InnovationSourceLinks.tsx`:
- Source document paths become clickable links to `/cephas/archive/:slug`
- The slug is derived from the source_path filename
- Member can now: see innovation → click source doc → read the original founding document

### Phase 5: Wire CephasContentDetailPage

On pudding/paper detail pages:
- "Source Material" links now route to `/cephas/archive/:slug` instead of showing raw paths
- The chain is complete: Pudding → Innovation → Source Document (all clickable, all readable)

## VALIDATION

1. Navigate to `/cephas/archive` — see all 93 documents grouped by category
2. Click any document — see full rendered content with innovation cross-links
3. Navigate to an innovation detail — source docs are clickable links to archive reader
4. Navigate to a pudding — "Source Material" links through to readable archive pages
5. `npm run build` passes

## REFERENCE FILES

- Trunk location: `Upekrithen-Trunk/` (93 .md files across 10 categories)
- compiled_documents schema: migration `20260403000002_compiled_documents.sql`
- content_source_links: migration `20260406200004_k343_source_linking_integration_b084.sql`
- InnovationSourceLinks component: `platform/src/components/cephas/InnovationSourceLinks.tsx`
- CephasContentDetailPage: `platform/src/pages/CephasContentDetailPage.tsx`

## SEC NOTE

All trunk documents should have been SEC-cleaned in the B084 archive cleanup passes (23,753 replacements). However, run a quick scan on any document before publishing. If flags remain, fix before setting status to 'published'.
