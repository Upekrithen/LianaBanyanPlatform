# KNIGHT SESSION 282 — Fix Duplicate Migration + Populate compilation_status
## Bishop B075 | April 4, 2026

---

## MISSION

Two quick fixes surfaced by K268 execution:
1. Resolve duplicate migration version `20260404000010` (two files share it)
2. Populate empty `compilation_status` table so `/admin/compilation` dashboard shows data

---

## TASK 1: Renumber Duplicate Migration

### Current State
Two migration files share version `20260404000010`:
- `platform/supabase/migrations/20260404000010_distribution_news_slots.sql` (from K260)
- `platform/supabase/migrations/20260404000010_viewing_schedule_access.sql` (from K252)

This blocks `npx supabase db push` from running normally.

### Fix
Keep the K252 file at `20260404000010` (it's older, already applied to production per K254). Rename the K260 file:

```bash
cd platform/supabase/migrations
mv 20260404000010_distribution_news_slots.sql 20260404000016_distribution_news_slots.sql
```

Why 000016: subsequent migrations in the same batch used 000011-000015. Using 000016 places news_slots AFTER the compilation_status and preface tables without affecting their ordering.

### Verify
```bash
ls platform/supabase/migrations/20260404* | sort
```

Should show unique version numbers, no duplicates.

Then verify `npx supabase migration list` works clean.

---

## TASK 2: Populate compilation_status Table

### Current State
- `compilation_status` table exists in production (K261 migration deployed)
- Table has 0 rows
- `/admin/compilation` dashboard shows empty

### Fix
Run the populate script from K261:

```bash
cd platform
npx tsx scripts/populate-compilation-status.ts
```

This script:
1. Loads family data from `librarian-mcp/stitchpunks/data/archivist_report.json`
2. For each family with 2+ variants, inserts into `compilation_status`
3. Checks for matching `COMPILED_*.md` files in BISHOP_DROPZONE → marks those families as `compiled`
4. Cross-references with `compiled_documents` table → links via `compiled_document_id`
5. Reports: total families, compiled, pending, by section

### Then Verify
```sql
SELECT status, COUNT(*) FROM compilation_status GROUP BY status;
-- Should show: pending X, compiled Y, etc.

SELECT section, status, COUNT(*) FROM compilation_status GROUP BY section, status ORDER BY section;
-- Should show breakdown by section
```

Visit `/admin/compilation` — should now display populated data.

---

## TASK 3: Also Populate B075 Compilations

Bishop B075 produced 19 NEW compiled families during this session that may not yet be in compilation_status. If the populate script runs automatically, check that:

```sql
SELECT COUNT(*) FROM compilation_status
WHERE status = 'compiled'
AND updated_at >= '2026-04-04';
-- Should reflect B075 compilations
```

B075 compilations include (19 families):
- Patent Bags 5-7 physical systems
- Patent Bags 8-10 initiative systems
- Patent Bags 21-26 Rook expansion
- Kickstarter Campaigns 1-7
- Pitch Templates & Media Outreach
- Crown-Tier Letters (media + CEO)
- Blueprints (Master + Handoffs)
- Technical Specs (Architecture + Legal)
- Reference Materials (Fable Arc + Media)
- Press Articles (founder profiles)
- Circle Letters (79 files)
- Standalone Articles + Business Plans
- Cephas Articles (full)
- Inbox for Synthesis (survey)
- Master References + Founder Context
- Partnership Letters
- Crown Letters master inventory
- A&A Formals survey
- Pudding Articles vault audit

If any missing, manually insert via:
```sql
INSERT INTO compilation_status (family_name, section, status, updated_at)
VALUES
  ('patent_bags_5_7_physical_systems', 'patent_bags', 'compiled', NOW()),
  ('patent_bags_8_10_initiative_systems', 'patent_bags', 'compiled', NOW()),
  ... etc
ON CONFLICT (family_name) DO UPDATE SET status = 'compiled', updated_at = NOW();
```

---

## ACCEPTANCE CRITERIA

- [ ] No duplicate migration version numbers in platform/supabase/migrations/
- [ ] `npx supabase migration list` runs clean
- [ ] `compilation_status` table populated with at least 100+ rows
- [ ] `/admin/compilation` dashboard displays data
- [ ] B075's 19 compiled families reflected with status='compiled'
- [ ] `npm run build` passes

## DO NOT

- Delete or modify the K252 viewing_schedule_access migration (already applied to prod)
- Rename migrations already applied to production
- Drop rows from compiled_documents table
- Skip the populate script (it's how K261's dashboard gets data)
