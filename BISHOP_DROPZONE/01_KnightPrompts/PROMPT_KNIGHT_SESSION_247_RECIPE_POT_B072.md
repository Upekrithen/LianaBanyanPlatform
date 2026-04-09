# KNIGHT SESSION 247 — Recipe Pot: Project Skill-Matching via Spice Taxonomy
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: MEDIUM — Cooperative infrastructure, depends on K246 (Spice Rack)

---

## MISSION

Implement The Recipe Pot (#2143): project skill-matching where projects declare recipes (spice combinations needed) and members contribute by bringing their spice.

---

## CONTEXT (READ FIRST)

### A&A Formal
- `BISHOP_DROPZONE/AA_FORMAL_2143_THE_RECIPE_POT_B072.md`

### Dependencies
- K246 DONE (Spice Rack — spice_type enum, spice_rack table, tagging system)

---

## IMPLEMENTATION

### 1. Migration: Recipe Pot Tables

File: `platform/supabase/migrations/20260404000008_recipe_pot.sql`

```sql
-- Project recipes: what spices a project needs
CREATE TABLE IF NOT EXISTS public.project_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,  -- references the project/storefront/bridge
  project_name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  cold_start_pathway TEXT CHECK (cold_start_pathway IN ('food', 'manufacturing', 'service', 'local_business', 'guild', 'tribe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual spice slots in a recipe
CREATE TABLE IF NOT EXISTS public.recipe_spice_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.project_recipes(id) ON DELETE CASCADE,
  spice public.spice_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'owner')),
  filled_by UUID REFERENCES auth.users(id),
  filled_at TIMESTAMPTZ,
  description TEXT,  -- what this spice means for this project specifically
  UNIQUE(recipe_id, spice, filled_by)
);

-- Member spice profiles: what spices a member brings
CREATE TABLE IF NOT EXISTS public.member_spice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  spice public.spice_type NOT NULL,
  proficiency INTEGER NOT NULL DEFAULT 1 CHECK (proficiency BETWEEN 1 AND 5),
  projects_completed INTEGER NOT NULL DEFAULT 0,
  UNIQUE(member_id, spice)
);

-- RLS
ALTER TABLE public.project_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_spice_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_spice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read recipes" ON public.project_recipes FOR SELECT USING (true);
CREATE POLICY "Owners manage recipes" ON public.project_recipes FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public read slots" ON public.recipe_spice_slots FOR SELECT USING (true);
CREATE POLICY "Recipe owners manage slots" ON public.recipe_spice_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.project_recipes WHERE id = recipe_id AND owner_id = auth.uid()));
CREATE POLICY "Members read own profile" ON public.member_spice_profiles FOR SELECT USING (true);
CREATE POLICY "Members manage own profile" ON public.member_spice_profiles FOR ALL USING (auth.uid() = member_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipe_slots_open ON public.recipe_spice_slots (spice) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_member_spice ON public.member_spice_profiles (spice);

-- Default recipe blends per cold start pathway
CREATE TABLE IF NOT EXISTS public.default_recipe_blends (
  pathway TEXT PRIMARY KEY,
  default_spices public.spice_type[] NOT NULL
);

INSERT INTO public.default_recipe_blends VALUES
  ('food', ARRAY['salt', 'garlic', 'sugar', 'pepper']::public.spice_type[]),
  ('manufacturing', ARRAY['cumin', 'salt', 'pepper', 'garlic']::public.spice_type[]),
  ('service', ARRAY['cinnamon', 'sugar', 'salt', 'oregano']::public.spice_type[]),
  ('local_business', ARRAY['salt', 'sugar', 'cinnamon', 'garlic']::public.spice_type[]),
  ('guild', ARRAY['oregano', 'salt', 'basil']::public.spice_type[]),
  ('tribe', ARRAY['salt', 'cinnamon', 'oregano']::public.spice_type[]);
```

### 2. Edge Function: Create Recipe

File: `platform/supabase/functions/create-recipe/index.ts`

Accepts project info + optional pathway. Auto-populates default spice slots from default_recipe_blends if pathway provided. Owner fills their own spice slots automatically.

### 3. Edge Function: Join Pot (Contribute Spice)

File: `platform/supabase/functions/join-pot/index.ts`

Member offers their spice to an open recipe slot. Updates slot to 'filled'. Updates member's spice profile (projects_completed increments when project completes).

### 4. Edge Function: Browse Open Recipes by Spice

File: `platform/supabase/functions/browse-recipes/index.ts`

Returns open recipes that need a specific spice. "Show me all projects that need Garlic."

### 5. Recipe Pot UI

File: `platform/src/pages/RecipePotPage.tsx`

Route: `/bridge/recipe` (under Bridge — project control panel)

- Recipe editor: add/remove spice slots, set descriptions
- Pot status: visual of filled vs. open slots (spice emojis)
- "Offer your Spice" button for viewers

File: `platform/src/components/PotStatus.tsx`

Visual component: circle of spice emojis, filled ones solid, open ones outlined/grayed. Used in Recipe page and Crew Call listings.

### 6. Wire into Crew Call

Extend existing Crew Call listings to show spice tags: "Seeking 🧄 Garlic (Finance) and ✨ Cinnamon (Design)"

---

## VALIDATION CHECKLIST

- [ ] Migrations apply cleanly
- [ ] Default recipe blends auto-populate
- [ ] Join Pot fills slot correctly
- [ ] Browse by spice returns relevant open recipes
- [ ] Pot status visual renders correctly
- [ ] Crew Call shows spice tags
- [ ] `npm run build` succeeds
- [ ] Session logged via Librarian (K247)
