# Knight Session K333 — Lode Chunked Compilation System
## Bishop B081 | April 5, 2026

---

## MISSION

Build a "Hicken" batch processing system that handles the 28+ Lode document families that fail standard compilation due to payload size. These are the platform's MOST VALUABLE content — they failed because they're BIG, not because they're broken.

## CONTEXT

- B081 compiled 1,130 document families via `compile-document` edge function
- 28 families failed with HTTP 500 due to oversized payloads
- The `compiled_documents` table can hold unlimited text — the bottleneck is the HTTP payload to the edge function
- These Lodes include: patent bag indexes (1,136 variants), AI synthesis documents (165 variants), Bishop handoff collections (103 variants), Crown Letter families (24-28 variants each)

## WHAT TO BUILD

### 1. Chunked Compile Edge Function
Create `platform/supabase/functions/compile-document-chunked/index.ts`:
- Accepts: `{ slug, title, family_name, section, chunk_index, chunk_total, chunk_content, source_files?, ... }`
- First chunk (`chunk_index: 0`): Creates/upserts the `compiled_documents` row with metadata + first chunk as `compiled_markdown`
- Subsequent chunks (`chunk_index: 1+`): Appends `chunk_content` to existing `compiled_markdown` via SQL concatenation
- Final chunk (`chunk_index == chunk_total - 1`): Sets `status` to `draft` and `compilation_notes` to include total size

### 2. Hicken Batch Script
Create `librarian-mcp/stitchpunks/hicken_lode_processor.py`:
- Reads the content archive index
- Identifies all families with 2+ variants where best variant content > 200KB
- For each Lode family:
  - Loads the best (longest) variant's full content from archive
  - Chunks content into 200KB segments
  - POSTs each chunk sequentially to `compile-document-chunked`
  - Logs success/failure
- Supports `--dry-run` and `--family <name>` for single-family testing

### 3. Migration
Create migration: `20260405000027_compile_document_chunked_support.sql`
- No schema change needed — `compiled_markdown` is already TEXT (unlimited)
- Add `content_size_bytes` INTEGER column to `compiled_documents` for tracking Lode sizes
- Add `is_lode` BOOLEAN DEFAULT false — marks families identified as Lodes
- Add index on `is_lode` for Staff dashboard filtering

## CONSTRAINTS

- Do NOT modify the existing `compile-document` edge function — it works for normal families
- The chunked function is a separate endpoint for Lodes only
- Chunk size: 200KB per chunk (well under Supabase edge function limits)
- Rate limit: 1 second between chunks within a family, 2 seconds between families
- Must handle resume: if a family is partially chunked, continue from where it left off

## VALIDATION

- Run `hicken_lode_processor.py --dry-run` to see the Lode queue
- Run `hicken_lode_processor.py --family "index"` to test the largest Lode (1,136 variants, 6.7MB)
- Verify in Supabase that `compiled_documents` row has full content
- Run `npm run build` — no platform code changes needed (edge function only)

## FOUNDER VERNACULAR

- **Lode**: Large, high-value content file. Failed compilation = signal of VALUE, not error.
- **MotherLode**: Exceptionally large Lode. The biggest knowledge deposits.
- **Hicken**: Headless batch worker script. "Suit of Armor" — you set up the muscles (script), then embody it with brain (direction).

---

*FOR THE KEEP!*
