# KNIGHT SESSION 275 — Initiatives Table Crown Reconciliation
## Bishop B076 | April 4, 2026
## Priority: Data hygiene — DB is out of sync with canonical crown assignments

---

## Mission

The live `initiatives` table in Supabase is significantly out of sync with the canonical crown assignments (verified in B076 against `platform/src/data/redCarpetRecipients.ts`, crown letters in `20260329000002_seed_cephas_letters_pitches.sql`, and Founder confirmation). Reconcile the DB to canonical state.

Current drift (confirmed by direct query):
- Most crown holders show as `vacant` when they're actually offered/pending
- #15 is labeled "International" — should be "Power to the People"
- #6 is labeled "LifeLine Medications" — should be "Tatiana Schlossberg Health Accords"
- Table has ~26 rows including duplicates with NULL `initiative_number`; canonical is 16
- Several initiatives have MULTIPLE Crowns that the current schema may not support

---

## Required Changes

### Part 1 — Schema inspection + potential extension

Inspect the current `public.initiatives` table schema. Current columns known:
- `id`, `name`, `initiative_number`, `initiative_slug`, `category`, `crown_name`, `crown_status`, `tagline`, `icon`, `description`, etc.

**Problem**: `crown_name` is a single field, but these initiatives have MULTIPLE Crowns:
- **#5 The Family Table** — 3 Crowns (Household Steward, Age Champion, Bridge Builder)
- **#15 Power to the People** — 4 Crowns (celebrity/political/advocate/next-gen voices)

**Decision needed**: either
- **(A)** Add a `crowns` JSONB column alongside `crown_name` (array of `{name, title, status}`), OR
- **(B)** Create a new `initiative_crowns` junction table with FK to `initiatives`

**Recommendation**: Option (B) — junction table is cleaner, supports unlimited crowns per initiative, preserves history. Schema:

```sql
CREATE TABLE IF NOT EXISTS public.initiative_crowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id TEXT NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  crown_name TEXT NOT NULL,
  crown_title TEXT NOT NULL,  -- e.g. "Household Steward", "Harper Prime"
  crown_status TEXT NOT NULL DEFAULT 'pending' CHECK (crown_status IN ('vacant','pending','offered','accepted','declined','active')),
  crown_order INTEGER NOT NULL DEFAULT 1,  -- ordering when multiple crowns
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (initiative_id, crown_name)
);

CREATE INDEX idx_initiative_crowns_initiative ON public.initiative_crowns(initiative_id);
CREATE INDEX idx_initiative_crowns_status ON public.initiative_crowns(crown_status);

ALTER TABLE public.initiative_crowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read initiative crowns" ON public.initiative_crowns FOR SELECT USING (true);
```

Keep `crown_name` and `crown_status` on `initiatives` as a derived convenience field (first/primary crown) — maintained by trigger from the junction table.

### Part 2 — Deduplicate `initiatives` table

Current state has duplicate rows (26 total; should be 16). Rows with `initiative_number IS NULL` appear to be duplicates of numbered rows.

- Identify the canonical row for each of the 16 initiatives (the one with `initiative_number` set).
- Delete rows with `initiative_number IS NULL` that duplicate a canonical row by `name`.
- Also delete the legacy `Defense Claws` row (#8 should be "Defense Klaus" only).

### Part 3 — Fix name drift

```sql
-- #6 rename
UPDATE public.initiatives
  SET name = 'Tatiana Schlossberg Health Accords'
  WHERE initiative_number = 6;

-- #15 rename
UPDATE public.initiatives
  SET name = 'Power to the People',
      initiative_slug = 'power-to-the-people'
  WHERE initiative_number = 15;
```

### Part 4 — Seed canonical Crown assignments

Insert into `initiative_crowns` for the 16 initiatives (verified against multiple sources):

| # | Initiative | Crown Name | Crown Title | Status |
|---|------------|------------|-------------|--------|
| 1 | Let's Make Dinner | Maneet Chauhan | Crown (Grand Chef) | offered |
| 2 | Let's Get Groceries | — | — | vacant |
| 3 | Let's Go Shopping | Mary Beth Laughton | Crown | offered |
| 4 | Household Concierge | — | — | vacant |
| **5** | **The Family Table** | **Ai-jen Poo** | **Household Steward** | **pending** |
| **5** | **The Family Table** | **Ashton Applewhite** | **Age Champion** | **pending** |
| **5** | **The Family Table** | **Dr. Marc Freedman** | **Bridge Builder** | **pending** |
| 6 | Tatiana Schlossberg Health Accords | — | — | vacant |
| 7 | MSA | — | — | vacant |
| 8 | Defense Klaus | Robert Kaiser | First Shield UK | pending |
| 9 | Rally Group | Kimberly A. Williams | Crown | offered |
| 10 | VSL | Cathie Mahon | Crown | offered |
| 11 | Let's Make Bread | — | — | vacant |
| 12 | Harper Guild | Brené Brown | Harper Prime | pending |
| 13 | Jukebox | — | — | vacant |
| 14 | Didasko | Sal Khan | Chancellor | offered |
| **15** | **Power to the People** | **Arnold Schwarzenegger** | **Crown** | **pending** |
| **15** | **Power to the People** | **Sandra Bullock** | **Crown** | **pending** |
| **15** | **Power to the People** | **Keanu Reeves** | **Crown** | **pending** |
| **15** | **Power to the People** | **Alexandria Ocasio-Cortez** | **Crown** | **pending** |
| 16 | Brass Tacks | Dale Dougherty | Maker Mentor, Lord Banyan of Brass Tacks | pending |

Use `crown_order` to preserve order: Poo=1, Applewhite=2, Freedman=3 for Family Table; Schwarzenegger=1, Bullock=2, Reeves=3, AOC=4 for PTTP.

### Part 5 — Trigger to sync primary crown back to `initiatives`

```sql
CREATE OR REPLACE FUNCTION public.sync_primary_crown_to_initiative()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.initiatives
  SET crown_name = (
    SELECT crown_name FROM public.initiative_crowns
    WHERE initiative_id = COALESCE(NEW.initiative_id, OLD.initiative_id)
    ORDER BY crown_order ASC, created_at ASC
    LIMIT 1
  ),
  crown_status = (
    SELECT crown_status FROM public.initiative_crowns
    WHERE initiative_id = COALESCE(NEW.initiative_id, OLD.initiative_id)
    ORDER BY crown_order ASC, created_at ASC
    LIMIT 1
  )
  WHERE id = COALESCE(NEW.initiative_id, OLD.initiative_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_primary_crown ON public.initiative_crowns;
CREATE TRIGGER sync_primary_crown
  AFTER INSERT OR UPDATE OR DELETE ON public.initiative_crowns
  FOR EACH ROW EXECUTE FUNCTION public.sync_primary_crown_to_initiative();
```

### Part 6 — Query helper views

```sql
-- Multi-crown initiatives (for UI that displays all crowns)
CREATE OR REPLACE VIEW public.initiatives_with_all_crowns AS
SELECT
  i.id, i.initiative_number, i.name, i.initiative_slug, i.category, i.tagline,
  json_agg(
    json_build_object(
      'name', ic.crown_name,
      'title', ic.crown_title,
      'status', ic.crown_status,
      'order', ic.crown_order
    ) ORDER BY ic.crown_order, ic.created_at
  ) FILTER (WHERE ic.id IS NOT NULL) AS crowns
FROM public.initiatives i
LEFT JOIN public.initiative_crowns ic ON ic.initiative_id = i.id
WHERE i.initiative_number IS NOT NULL
GROUP BY i.id
ORDER BY i.initiative_number;
```

---

## Deliverables

1. **New migration file**: `platform/supabase/migrations/20260404000020_initiative_crowns_reconciliation.sql` containing:
   - `initiative_crowns` table + indexes + RLS
   - Deduplication of `initiatives` table
   - Name corrections (#6 and #15)
   - Seed data for all canonical Crown assignments (Part 4 table above)
   - Sync trigger (Part 5)
   - Helper view (Part 6)

2. **Push migration** to production via `supabase db push`.

3. **Verification queries** (run and report results):
   - `SELECT COUNT(*) FROM public.initiatives WHERE initiative_number IS NOT NULL;` — should be 16
   - `SELECT initiative_number, name, crown_name, crown_status FROM public.initiatives WHERE initiative_number IS NOT NULL ORDER BY initiative_number;` — should show primary crown per initiative
   - `SELECT initiative_number, name, json_array_length(crowns) AS crown_count FROM public.initiatives_with_all_crowns;` — #5 should show 3 crowns, #15 should show 4, others 1 or 0
   - `SELECT initiative_id, crown_name, crown_title FROM public.initiative_crowns WHERE initiative_id IN (SELECT id FROM public.initiatives WHERE initiative_number = 5 OR initiative_number = 15) ORDER BY initiative_id, crown_order;` — should list Poo/Applewhite/Freedman for Family Table and Schwarzenegger/Bullock/Reeves/AOC for PTTP

4. **Report back** via session log with counts, any unexpected rows encountered, and confirmation all 7 canonical crown assignments verified present.

---

## Canonical Sources (for Knight's reference during verification)

- **Crown assignments**: `platform/src/data/redCarpetRecipients.ts` (Brené Brown, Robert Kaiser, etc.)
- **Family Table trio letters**: `platform/supabase/migrations/20260329000002_seed_cephas_letters_pitches.sql` (search for "The Family Table — Household Steward", "Age Champion", "Bridge Builder")
- **Bishop memory**: `.claude/projects/.../memory/project_sweet_sixteen_crowns.md` (comprehensive registry)
- **Bishop B076 canonical context block**: `BISHOP_DROPZONE/PAWN_B47_CANONICAL_CONTEXT_BLOCK_B076.md` (full authoritative source)

## Why This Matters

The DB is the source of truth UI reads from for:
- Initiative pages on Cephas
- Crown Letter landing pages
- Staff dashboards / V2 redesign tracker
- Red Carpet onboarding

Stale crown data in the DB means stale crown data everywhere downstream. This reconciliation makes the DB match canonical before next Easter launch content goes live.

---

*Knight: execute end-to-end — migration file, DB push, verification queries, session log. FOR THE KEEP.*
