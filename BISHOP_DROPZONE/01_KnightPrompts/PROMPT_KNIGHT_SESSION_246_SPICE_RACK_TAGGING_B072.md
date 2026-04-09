# KNIGHT SESSION 246 — Spice Rack Content Tagging System
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: HIGH — Content categorization + audience filtering

---

## MISSION

Implement The Spice Rack (#2142): content tagging system using ten culinary spice categories, plus spice filtering on the Viewing Schedule and Cue Card profiles.

---

## CONTEXT (READ FIRST)

### A&A Formal
- `BISHOP_DROPZONE/AA_FORMAL_2142_THE_SPICE_RACK_B072.md`

### The Ten Spices
| Spice | Skill Domain | Emoji |
|-------|-------------|-------|
| Salt | Operations / Everyday Work | 🧂 |
| Garlic | Accounting / Finance | 🧄 |
| Sugar | Marketing / Outreach | 🍬 |
| Cinnamon | Design / UX | ✨ |
| Pepper | Legal / Compliance | 🌶️ |
| Ginger | Innovation / R&D | 🫚 |
| Cumin | Engineering / Technical | 🟤 |
| Paprika | Leadership / Vision | 🔴 |
| Basil | Creative / Content | 🌿 |
| Oregano | Project Management / Coordination | 🫒 |

---

## IMPLEMENTATION

### 1. Migration: Spice Tags

File: `platform/supabase/migrations/20260404000007_spice_rack.sql`

```sql
-- Spice type enum
CREATE TYPE public.spice_type AS ENUM (
  'salt', 'garlic', 'sugar', 'cinnamon', 'pepper',
  'ginger', 'cumin', 'paprika', 'basil', 'oregano'
);

-- Add spice tags to content tables
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS primary_spice public.spice_type;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS secondary_spices public.spice_type[] DEFAULT '{}';

-- Spice reference table for UI rendering
CREATE TABLE IF NOT EXISTS public.spice_rack (
  spice public.spice_type PRIMARY KEY,
  display_name TEXT NOT NULL,
  skill_domain TEXT NOT NULL,
  emoji TEXT NOT NULL,
  metaphor_description TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

INSERT INTO public.spice_rack VALUES
  ('salt', 'Salt', 'Operations / Everyday Work', '🧂', 'Essential. Preserves everything. Salt of the earth.', 1),
  ('garlic', 'Garlic', 'Accounting / Finance', '🧄', 'Vital, strong. Keeps vampires (extractors) away.', 2),
  ('sugar', 'Sugar', 'Marketing / Outreach', '🍬', 'Sweetens the deal. Makes things attractive.', 3),
  ('cinnamon', 'Cinnamon', 'Design / UX', '✨', 'Warm, inviting. Makes things feel like home.', 4),
  ('pepper', 'Pepper', 'Legal / Compliance', '🌶️', 'A little heat. Keeps things honest.', 5),
  ('ginger', 'Ginger', 'Innovation / R&D', '🫚', 'Sharp, surprising, medicinal. Heals what is broken.', 6),
  ('cumin', 'Cumin', 'Engineering / Technical', '🟤', 'Earthy, foundational. The building block.', 7),
  ('paprika', 'Paprika', 'Leadership / Vision', '🔴', 'Color, warmth. Defines the whole dish.', 8),
  ('basil', 'Basil', 'Creative / Content', '🌿', 'Fresh, fragrant. The signature ingredient.', 9),
  ('oregano', 'Oregano', 'Project Management', '🫒', 'Ties everything together. Works with anything.', 10);

ALTER TABLE public.spice_rack ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read spice rack" ON public.spice_rack FOR SELECT USING (true);

-- Index for filtered queries
CREATE INDEX IF NOT EXISTS idx_crewman_episodes_spice ON public.crewman_episodes (primary_spice);
```

### 2. Edge Function: Tag Content with Spices

File: `platform/supabase/functions/tag-spice/index.ts`

Accepts:
```json
{
  "episode_id": "uuid",
  "primary_spice": "garlic",
  "secondary_spices": ["salt", "pepper"]
}
```

Logic: Update episode with spice tags. Max 1 primary + 2 secondary.

### 3. Edge Function: Bulk Auto-Tag by Keywords

File: `platform/supabase/functions/auto-tag-spices/index.ts`

Accepts:
```json
{
  "chapter_id": "uuid"
}
```

Logic: For each untagged episode in chapter, analyze content text for keyword → spice mapping:
- "cost", "price", "margin", "$", "83.3%", "revenue" → garlic
- "design", "UI", "layout", "interface", "visual" → cinnamon
- "patent", "legal", "compliance", "policy", "SEC" → pepper
- "built", "code", "table", "function", "migration", "deploy" → cumin
- "veteran", "children", "founded", "vision", "enlisted" → paprika
- "innovation", "diagnostic", "blizzard", "vapor", "invention" → ginger
- "article", "paper", "journal", "publication", "wrote" → basil
- "coordinate", "librarian", "dispatch", "schedule", "session" → oregano
- "market", "outreach", "campaign", "letter", "pitch" → sugar
- "member", "daily", "process", "operations", "system" → salt

Set primary from strongest keyword match, secondary from 2nd and 3rd. Return tagging results.

### 4. Spice Filter Component

File: `platform/src/components/SpiceFilter.tsx`

Renders ten spice buttons (emoji + name). Toggle on/off. Filters any content list by spice tag. Used on Viewing Schedule page and content browsing pages.

### 5. Spice Badge Component

File: `platform/src/components/SpiceBadge.tsx`

Renders a spice tag inline: emoji + name + optional skill domain tooltip. Used in episode cards, Spoonful displays, Viewing Schedule grid cells.

### 6. Wire into Viewing Schedule

Update `ViewingSchedulePage.tsx` (from K245) to include SpiceFilter. Grid cells show SpiceBadge for each scheduled post.

---

## VALIDATION CHECKLIST

- [ ] Migration applies cleanly
- [ ] Manual tagging works
- [ ] Auto-tagging produces reasonable results
- [ ] SpiceFilter toggles filter content lists
- [ ] SpiceBadge renders correctly
- [ ] Viewing Schedule shows spice tags
- [ ] `npm run build` succeeds
- [ ] Session logged via Librarian (K246)
