# KNIGHT SESSION 198 — Grand Tour Packages with Marks Earning
## Priority: HIGH — Engagement loop for new members
## Bishop B052
## Depends on: K197 (Trail Marker system) — build AFTER K197

---

## CONTEXT

K194 built the Guided Tour with 3 modes (Topic, Category, Full Tour) and 3 detail levels (Skipping Stones, Wading In, Deep Dive). K196 built the Feedback Tutorial. Now we package these into **themed tour "rides"** — like Disney World — where completing a package earns Marks toward the 100-mark milestone.

The Founder's vision: members don't just browse content — they **complete packaged tours** like rides at a theme park, earning progress and Marks along the way.

---

## TASK 1: Tour Package System

### Data Model

**New table: `tour_packages`**
```sql
CREATE TABLE tour_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT NOT NULL,          -- emoji or icon name
  category TEXT NOT NULL,      -- 'intro', 'economics', 'manufacturing', 'full'
  difficulty TEXT NOT NULL DEFAULT 'beginner',  -- beginner, intermediate, advanced
  estimated_minutes INT NOT NULL DEFAULT 15,
  marks_reward INT NOT NULL DEFAULT 10,
  stop_slugs TEXT[] NOT NULL,  -- ordered array of cephas_content_registry slugs
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track member progress through packages
CREATE TABLE tour_package_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  package_slug TEXT NOT NULL REFERENCES tour_packages(slug),
  current_stop_index INT DEFAULT 0,
  completed_stops TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  marks_awarded BOOLEAN DEFAULT false,
  UNIQUE(user_id, package_slug)
);

ALTER TABLE tour_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_package_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published packages" ON tour_packages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users manage own progress" ON tour_package_progress
  FOR ALL USING (auth.uid() = user_id);
```

### Seed Data — 4 Starter Packages

```sql
INSERT INTO tour_packages (slug, title, subtitle, icon, category, difficulty, estimated_minutes, marks_reward, stop_slugs, sort_order) VALUES
('the-fable-trail', 'The Fable Trail', 'Meet the Little Red Hen and learn why we exist', '🐔', 'intro', 'beginner', 10, 10,
  ARRAY['the-little-red-hen', 'help-each-other', 'cost-plus-twenty', 'no-effort-is-wasted'], 1),

('the-makers-walk', 'The Maker''s Walk', 'See how things get built — from idea to shelf', '🔩', 'manufacturing', 'intermediate', 20, 15,
  ARRAY['decentralized-factory', 'six-production-levels', 'canister-system', 'proteus-manufacturing'], 2),

('the-money-map', 'The Money Map', 'Understand Credits, Marks, and Joules', '💰', 'economics', 'intermediate', 15, 15,
  ARRAY['three-currency-system', 'cost-plus-twenty', 'marks-explained', 'joules-forever-stamps'], 3),

('the-founders-path', 'The Founder''s Path', 'The complete deep dive — every system, every innovation', '🗺️', 'full', 'advanced', 60, 25,
  ARRAY['the-little-red-hen', 'help-each-other', 'three-currency-system', 'cost-plus-twenty', 'six-production-levels', 'decentralized-factory', 'sixteen-initiatives', 'crown-jewels-overview'], 4);
```

---

## TASK 2: Tour Package Gallery Page

**New page:** `platform/src/pages/TourGalleryPage.tsx`
**Route:** `/tour/packages` (add to cephas routes)

**Design:** Grid of package cards, each showing:
- Package icon (large, centered)
- Title + subtitle
- Difficulty badge (beginner/intermediate/advanced)
- Estimated time
- Marks reward: "Earn X Marks"
- Progress bar (if started)
- CTA: "Start Tour" / "Continue" / "✓ Complete"

**Layout inspiration:** Theme park ride menu — each card is a "ride" to choose from.

---

## TASK 3: Tour Package Player

**Update:** `platform/src/pages/GuidedTourPage.tsx`

When navigated to with a package slug (`/tour?package=the-fable-trail`), the Guided Tour enters **Package Mode**:

1. **Header bar** shows package name + progress (Stop 2 of 4)
2. **Content** renders the current stop from the package's `stop_slugs` array
3. **Navigation**: Next Stop / Previous Stop buttons (not the full category navigation)
4. **On completion of last stop**: 
   - Mark package as completed in `tour_package_progress`
   - Award Marks (triggers K199 Milestone Popup if applicable)
   - Show completion card: "🎉 Package Complete! +X Marks earned"
   - CTA: "Choose another tour" → /tour/packages

---

## TASK 4: Integration with Trail Map (K197)

Tour package completions appear as trail stops in the Crow's Nest Trail Map:
- "Completed The Fable Trail" = filled stop
- "Complete The Money Map" = upcoming stop with CTA

The `trailStops.ts` config should include package completion checks.

---

## VERIFICATION

1. `/tour/packages` shows 4 tour package cards
2. Click "Start Tour" on The Fable Trail → enters package mode
3. Navigate through all 4 stops → shows completion card with Marks
4. Progress persists (refresh → "Continue" shows on card)
5. Completed packages show ✓ in gallery
6. Crow's Nest trail map reflects tour completions

---

## DEPLOY

```powershell
cd platform; npm run build; firebase deploy --only hosting -P default
```

---

*Knight Session 198 — Bishop B052*
*The Fable Trail. The Maker's Walk. The Money Map. The Founder's Path.*
*Choose your ride. Earn your Marks.*
*FOR THE KEEP!*
