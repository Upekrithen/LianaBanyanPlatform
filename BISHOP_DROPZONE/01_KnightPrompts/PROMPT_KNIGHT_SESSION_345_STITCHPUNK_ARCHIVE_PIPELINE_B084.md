# K345: Stitchpunk Pipeline Integration with Archive Source Content
# Priority: HIGH — enables automated distribution of founding documents
# Bishop: B084 | Date: 2026-04-06

## THE PROBLEM

The Stitchpunk Corps (SP-1 through SP-12) distributes puddings, papers, and BST episodes through the Battery Dispatch system. But it cannot distribute archive source content — the Galactic Empire, the Senate Architecture, the Founder's Journals. These founding documents are some of the most compelling content in the platform, but the pipeline doesn't know they exist.

K344 ingests trunk documents into `compiled_documents`. This prompt wires the Stitchpunk pipeline to pull from that table and distribute archive content alongside puddings and papers.

## OBJECTIVE

Enable the Stitchpunk Corps to generate and distribute content from the `compiled_documents` archive — Spoonfuls (micro-posts), Skipping Stones (teasers linking to papers), and BST-style episodes.

## PHASE 1: Content Pipeline Source Expansion

The `content_pipeline` table tracks what content is available for distribution. Add archive documents as a source:

```sql
-- Add compiled_documents as a pipeline source
INSERT INTO content_pipeline (source_type, source_table, source_id, title, content_preview, status, distribution_channels)
SELECT
  'archive_document',
  'compiled_documents',
  cd.id::text,
  cd.title,
  LEFT(cd.compiled_markdown, 280),
  'queued',
  ARRAY['social', 'cephas', 'bst']
FROM compiled_documents cd
WHERE cd.status = 'published'
  AND cd.category IN ('founding_document', 'journal', 'economic_treatise', 'creative_lore', 'academic_document')
ON CONFLICT DO NOTHING;
```

If `content_pipeline` doesn't have these columns, adapt to match the existing schema.

## PHASE 2: Spoonful Generator for Archive Content

The Spoonfuls system (Innovation #2140) atomizes articles into 5-8 micro-posts (~280 chars) for social distribution. Extend the generator to handle compiled_documents:

Create `librarian-mcp/stitchpunks/sp13_archive_spoonful_generator.py`:

```python
# SP-13: Archive Spoonful Generator
# Reads compiled_documents with status='published'
# Extracts 5-8 compelling quotes/passages per document
# Formats as Spoonfuls: ~280 chars, links to /cephas/archive/:slug
# Outputs to Battery Dispatch queue

# For each compiled_document:
# 1. Split into sections
# 2. Score sections by innovation density (cross-ref content_source_links)
# 3. Extract top passages
# 4. Format: "[quote]... — from [title] | Read more: lianabanyan.com/cephas/archive/[slug]"
# 5. Insert into dispatch queue with appropriate channel tags
```

## PHASE 3: Skipping Stones for Archive Documents

Skipping Stones (Innovation #2139) are four-layer depth teasers: Stone → Pudding → Paper → Source. Archive documents are the deepest layer — the SOURCE. Wire them as Stone destinations:

```sql
-- For each archive document that is a source for an innovation that has a pudding:
-- Create a Skipping Stone path: social teaser → pudding → innovation → archive document
-- This is the complete four-layer content depth

-- Add archive_document_slug to any existing skipping_stones table or create mapping
ALTER TABLE content_source_links ADD COLUMN IF NOT EXISTS skipping_stone_depth INTEGER DEFAULT 0;

-- Archive sources are depth 4 (deepest):
UPDATE content_source_links SET skipping_stone_depth = 4 WHERE source_type = 'upekrithen_trunk';
-- Papers are depth 3:
UPDATE content_source_links SET skipping_stone_depth = 3 WHERE target_type = 'paper';
-- Puddings are depth 2:
UPDATE content_source_links SET skipping_stone_depth = 2 WHERE target_type = 'pudding';
-- Spoonfuls/social are depth 1:
UPDATE content_source_links SET skipping_stone_depth = 1 WHERE link_type = 'references' AND source_type = 'archive_file';
```

## PHASE 4: BST Episode Generation from Archive

The Battery Dispatch system (Innovation #2140, BST) generates hourly episodes. Add a content source that pulls from archive documents:

In the BST episode generator (likely in `librarian-mcp/stitchpunks/` or `platform/src/lib/`):

1. Query `compiled_documents` WHERE `status = 'published'`
2. For each document, generate 3-5 BST episodes:
   - Episode format: "From the Archives: [title] — [key excerpt]. [Innovation count] innovations trace back to this document."
   - Link to `/cephas/archive/:slug`
3. Add to BST scheduling queue with appropriate time slots

## PHASE 5: Concurrent Distribution Grid Integration

The CDG (Innovation #2141, CJ) schedules ~24 posts/day across all social channels. Add archive content to the grid rotation:

- Archive documents enter the CDG as a new content category
- Frequency: 2-3 archive posts per day (mixed with pudding Spoonfuls and BST episodes)
- Ensure ~50-day rotation before repeat (93 documents × 5-8 spoonfuls each = 465-744 pieces)
- This means archive content alone can sustain ~7-10 days of the CDG rotation

## VALIDATION

1. `content_pipeline` has entries for published compiled_documents
2. SP-13 generates Spoonfuls from archive content
3. Skipping Stone paths trace: social → pudding → innovation → archive document
4. BST episodes reference archive documents
5. CDG includes archive content in scheduling rotation

## REFERENCE

- Stitchpunk Corps: `librarian-mcp/stitchpunks/` (SP-1 through SP-12)
- Battery Dispatch: production system (K160)
- CDG: Innovation #2141 (CJ)
- Spoonfuls: Innovation #2140 (CJ)
- Skipping Stones: Innovation #2139 (CJ)
- compiled_documents: migration `20260403000002_compiled_documents.sql`
- content_source_links: migration `20260406200004_k343_source_linking_integration_b084.sql`
