# KNIGHT SESSION 259 — Push Compiled Documents to DB + Fix Sentinel Canonical Values
## Bishop B075 | April 4, 2026

---

## MISSION

Two infrastructure tasks:

1. **Push all 38 existing COMPILED_* files** from BISHOP_DROPZONE into the `compiled_documents` Supabase table via the `compile-document` edge function
2. **Fix SP-5 Sentinel** to read canonical values from Supabase `platform_canonical` table instead of hardcoded values

---

## TASK 1: Bulk Compilation Ingestion

### Context

38 COMPILED_*.md files exist in BISHOP_DROPZONE. The `compiled_documents` table is deployed (migration `20260403000002_compiled_documents.sql`). The `compile-document` edge function is LIVE. But nobody has pushed the compiled files into the database yet. The `/admin/compilation` dashboard likely shows zero rows.

### Implementation

Write a script `platform/scripts/push-compilations.ts` that:

1. Scans `BISHOP_DROPZONE/` for all files matching `COMPILED_*.md`
2. For each file, parses:
   - `title` from the first `# ` heading
   - `slug` from the filename (lowercase, hyphens)
   - `section` from content keywords (pudding, journal, paper, letter, article, aa-formal, cephas)
   - `category` from the section
   - `compiled_markdown` = full file content
   - `source_count` = count of source files referenced (parse from content)
   - `compiled_by` = 'bishop'
   - `status` = 'canonical'
3. Also finds matching `HISTORY_*.md` and `BLUEPRINT_*.md` companion files if they exist, and stores their content in a `compilation_notes` JSONB field
4. Calls the `compile-document` edge function for each, OR does a direct Supabase insert
5. Reports: inserted count, skipped count (already exists), error count

### Run

```bash
cd platform
node --experimental-strip-types scripts/push-compilations.ts
```

### Verify

```sql
SELECT COUNT(*) FROM compiled_documents;
-- Expected: ~38

SELECT section, COUNT(*) FROM compiled_documents GROUP BY section;
-- Should show distribution across pudding, journal, paper, letter, article, etc.
```

---

## TASK 2: Fix SP-5 Sentinel Dynamic Canonical

### Context

`librarian-mcp/stitchpunks/sp5_sentinel.py` has HARDCODED canonical values:
- `innovations: 2130` (should be 2,144)
- `crown_jewels: 168` (should be 182)
- Various other stale numbers

The Dynamic Stats Template System is LIVE (K170). The `platform_canonical` table contains current values. Sentinel should read from Supabase instead of hardcoded values.

### Implementation

In `librarian-mcp/stitchpunks/sp5_sentinel.py`:

1. Add a Supabase client (use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from env)
2. Replace the hardcoded `CANONICAL_VALUES` dict with a function that queries:
```sql
SELECT key, value FROM platform_canonical
WHERE key IN ('innovation_count', 'crown_jewel_count', 'formal_claims_count',
              'provisional_count', 'production_systems_count', 'pudding_count',
              'bst_episode_count', 'spoonfuls_count', 'membership_cost');
```
3. Fall back to hardcoded values if Supabase is unreachable (with a warning log)
4. Update the sentinel report output to show "source: supabase" vs "source: hardcoded_fallback"

### Verify

```bash
cd librarian-mcp
python stitchpunks/sp5_sentinel.py
```

Should show current canonical values (2,144 innovations, 182 CJ, etc.) with "source: supabase".

---

## ACCEPTANCE CRITERIA

- [ ] ~38 compiled documents inserted into `compiled_documents` table
- [ ] `/admin/compilation` dashboard shows populated rows
- [ ] SP-5 Sentinel reads from Supabase dynamically
- [ ] Sentinel report shows correct current values
- [ ] `npm run build` passes (if any platform code changed)

## DO NOT

- Modify any COMPILED_*.md source files
- Delete any files from BISHOP_DROPZONE
- Change the compiled_documents table schema
