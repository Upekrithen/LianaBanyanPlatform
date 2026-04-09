# KNIGHT SESSION 86 — Design Pipeline: Arena → Emporium → Marketplace
## Bishop 026 | March 22, 2026
## Innovation Count: 1,935
## Based on: Session 70 spec (updated for K81-K85 state)

---

## MISSION

Wire the creative economy pipeline. Designers upload work to the Arena. STAMP reviewers approve it. Approved work flows to the Emporium where businesses browse and buy. Design Battles auto-trigger when 2+ submissions land in the same category. The "you didn't lose" mechanic ensures every submission remains available — winners get the pot and trophy, everyone gets a permanent portfolio listing.

**Note:** Migration files `20260322000001_arena_submissions.sql` and `20260322000002_crew_tables.sql` may already exist. Check first — if they exist, verify the schema matches the spec below and skip creation. If they don't exist, create them.

---

## CONTEXT: WHAT EXISTS

| Component | Route | Status |
|-----------|-------|--------|
| DesignBattleArena.tsx | `/design-battle` | ✅ LIVE (battle UI, no upload flow) |
| Maker Spotlight | Homepage | ✅ LIVE (rotation, 47 makers) |
| Storefront Builder | `/tools/storefront-builder` | ✅ LIVE |
| Commerce Engine | Full loop | ✅ LIVE (K80) |
| BandWagon | `/bandwagon` | ✅ LIVE |
| Treasure Maps | `/treasure-maps` | ✅ LIVE with progression (K81) |
| Calendar | `/calendar` | ✅ LIVE with plugs (K82) |
| MoneyPenny | `/moneypenny` | ✅ LIVE with AI (K84) |

---

## TASK 1: Arena Upload Flow

Add a "Submit Design" section to the existing Arena page (`DesignBattleArena.tsx` or create `ArenaUpload.tsx`):

### 1A: Upload Form

```
Fields:
- Upload image (PNG/SVG/PDF) — Supabase Storage bucket: 'arena-designs'
- Category: select from ['loteria_card', 'cue_card_template', 'business_card_template', 'logo', 'menu_template', 'coalition_brand', 'other']
- Title (required)
- Description (optional)
- Tags (comma-separated)
- Price: Credits amount (optional — null if bounty submission, set if template for sale)
  - Minimum price enforcement: Cost+20% floor
```

### 1B: Arena Submissions Table

Check if `20260322000001_arena_submissions.sql` exists. If not, create migration:

```sql
CREATE TABLE IF NOT EXISTS arena_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'pending_review',
  -- status values: pending_review, approved, rejected, in_battle, in_emporium
  stamp_reviewer_id UUID REFERENCES auth.users(id),
  stamp_rating DECIMAL(3,1),
  stamp_date TIMESTAMPTZ,
  battle_id UUID,
  royalty_uses INT DEFAULT 0,
  royalty_earnings DECIMAL(10,2) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE arena_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved submissions" ON arena_submissions
  FOR SELECT USING (status IN ('approved', 'in_battle', 'in_emporium') OR auth.uid() = creator_id);
CREATE POLICY "Creators manage own submissions" ON arena_submissions
  FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Admin manages all submissions" ON arena_submissions
  FOR ALL USING (public.is_admin());
```

### 1C: STAMP Review Queue

Add an admin-only section (check `is_admin()`) showing pending submissions:
- Grid of pending designs with thumbnail, title, creator, date
- Approve button → sets `status = 'approved'`, `stamp_reviewer_id`, `stamp_date`
- Reject button → sets `status = 'rejected'` with optional reason
- Rating: 1-5 stars (saved to `stamp_rating`)

---

## TASK 2: Design Battle Auto-Trigger

### 2A: Battle Creation Logic

When a submission is approved (`status` changes to `'approved'`):

1. Count approved submissions in the same `category` from the last 7 days
2. If count >= 2 AND no active battle exists for that category:
   - Create a Design Battle (use existing battle infrastructure in `DesignBattleArena.tsx`)
   - Pull all qualifying submissions into the battle (`battle_id` set, `status = 'in_battle'`)
   - Set voting period: 48 hours from creation
3. If a battle already exists for that category and is still in voting period:
   - Add the new submission to the existing battle

Implementation: Do this as a client-side check after approval (in the STAMP review handler). Don't need an edge function for this — keep it simple.

### 2B: Battle Resolution

When voting period ends (check on page load or via a simple timer):

1. **Winner**: Highest votes → `status = 'in_emporium'`, gets Crow Feather trophy badge
2. **Non-winners**: `status = 'approved'` (back to approved, NOT rejected)
   - Their work REMAINS browsable in the Emporium with tag: "Arena Submission"
   - They can still earn royalties if businesses use their designs
   - **THIS IS THE "YOU DIDN'T LOSE" MECHANIC** — the only difference between winning and not winning is the pot + trophy

### 2C: The "You Didn't Lose" Display

On non-winner submissions, show a card:
```
Your design is still available in the Emporium.
Businesses can browse and commission you anytime.
[View in Emporium] [Share Portfolio Link]
```

---

## TASK 3: Emporium Template Gallery

### Route: `/emporium` (new page)

Create `src/pages/Emporium.tsx`:

### 3A: Browse View

- Grid of all designs with `status IN ('approved', 'in_emporium')`
- Each card: thumbnail, title, designer name, category badge, price (or "Commission"), rating, uses count
- Filter bar: Category dropdown, Price range, Sort (newest/popular/rating)
- Search by title/tags

### 3B: Design Detail View

Click a card → modal or sub-route with:
- Full-size image preview
- Designer profile (name, avatar, XP, completed tables count)
- Price + "Use This Template" button (if priced)
- "Commission This Designer" button (if no price — opens a message/request)
- Royalty counter: "Used by X businesses"
- If the design won a battle: Crow Feather badge displayed

### 3C: "Use This Template" Flow

1. Member clicks "Use This Template"
2. System charges Credits (price amount)
3. 83.3% → designer (`arena_submissions.royalty_earnings += amount * 0.833`)
4. 16.7% → LB operations
5. `royalty_uses += 1`
6. Download link provided (the image/PDF)
7. Toast: "Template purchased! Designer earned X Credits."

### 3D: Ghost Credit Browsing (Non-Members)

- Non-logged-in users can browse freely
- "Use This Template" button shows: "Join LB ($5/year) to purchase"
- Add a ghost counter in localStorage: track how many designs they've browsed
- At 3+ browsed designs, show banner: "You've found 3 designs you like. Join to unlock them."

---

## TASK 4: Crew Table Interface

### 4A: Crew Tables Table

Check if `20260322000002_crew_tables.sql` exists. If not, create migration:

```sql
CREATE TABLE IF NOT EXISTS crew_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  template_type TEXT DEFAULT 'custom',
  -- 'new_business_starter', 'coalition_brand', 'event_launch', 'custom'
  treasure_map_ref TEXT,
  stage_current INT DEFAULT 1, -- 1=PREP, 2=BUILD, 3=DELIVER
  stage_1_items JSONB DEFAULT '[]',
  stage_2_items JSONB DEFAULT '[]',
  stage_3_items JSONB DEFAULT '[]',
  min_seats_to_activate INT DEFAULT 3,
  is_active BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crew_table_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES crew_tables(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  slot_type TEXT NOT NULL DEFAULT 'primary',
  member_id UUID REFERENCES auth.users(id),
  seated_at TIMESTAMPTZ,
  payment_amount DECIMAL(10,2),
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crew_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_table_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tables" ON crew_tables FOR SELECT USING (true);
CREATE POLICY "Creators manage own tables" ON crew_tables FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Admin manages tables" ON crew_tables FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view seats" ON crew_table_seats FOR SELECT USING (true);
CREATE POLICY "Members can claim open seats" ON crew_table_seats
  FOR UPDATE USING (member_id IS NULL OR auth.uid() = member_id);
CREATE POLICY "Admin manages seats" ON crew_table_seats FOR ALL USING (public.is_admin());
```

### 4B: Crew Table Page

Add to BandWagon page as a new tab/section: "Crew Tables"

OR create `src/pages/CrewTables.tsx` at `/crew-tables`

**Open Tables view:**
- Cards showing: title, template type, seats filled/total, roles needed, "Join" buttons
- Each open role slot has a "Join as [Role]" button

**Create Table form:**
- Title, description
- Template selector (dropdown with presets):
  - New Business Starter: Designer, Photographer, Writer, Printer (3 of 4 to activate)
  - Coalition Brand Package: Lead Designer, Photographer, Writer, Printer, Coordinator (4 of 5)
  - Event Launch: Designer, Photographer, Coordinator, 2× Runners (3 of 5)
  - Custom: add your own roles
- For each role: name, slot_type (primary/secondary), payment amount
- Min seats to activate

**Join flow:**
1. Member clicks "Join as [Role]"
2. `crew_table_seats` updated: `member_id = auth.uid()`, `seated_at = now()`
3. Check if `min_seats_to_activate` reached → if yes, set `is_active = true`
4. Toast: "You've joined the table! [X] more seats needed to activate."

### 4C: Active Table View (Stage Tracker)

When a table is active, show the 3-stage card stack:
- Tab layout: PREP | BUILD | DELIVER
- Current stage highlighted
- Each stage has checklist items (from `stage_X_items` JSONB)
- Checkboxes save state back to the JSONB
- When all items in a stage complete → auto-advance `stage_current`
- When Stage 3 completes → `completed_at = now()`, show celebration

---

## TASK 5: Wire Storefront → Emporium

After storefront creation in the Storefront Builder success screen, add:

```
Your storefront is live! 🎉

Want to attract customers? You'll need:
📇 Cue Card — [Browse Designs] → /emporium?category=cue_card_template
🎨 Logo — [Browse Designers] → /emporium?category=logo
💼 Business Card — [Browse Templates] → /emporium?category=business_card_template

Or get everything at once:
📦 New Business Starter Package — [Create Crew Table]
```

The "Create Crew Table" button auto-creates a table using the `new_business_starter` template with the business name in the title.

---

## TASK 6: Innovation Count

Update `useCanonicalStats.ts` DEFAULTS to innovation count: **1,935**

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/pages/Emporium.tsx` | Template gallery + design detail |
| `src/pages/CrewTables.tsx` (or add to BandWagon) | Crew Table browse + create + join + stage tracker |
| Migration (if not existing) | arena_submissions + crew_tables + crew_table_seats |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/pages/DesignBattleArena.tsx` | Add upload form, STAMP review queue, battle auto-trigger |
| `src/pages/App.tsx` | Add routes: /emporium, /crew-tables |
| Storefront Builder success screen | Add Emporium links + Crew Table auto-create |
| `useCanonicalStats.ts` | Innovation count → 1,935 |

## DO NOT TOUCH

- `makerSpotlightService.ts` — Spotlight rotation works, leave it alone for now
- `TreasureMapGame.tsx` — 52-card game is separate
- `Calendar.tsx` — Already wired in K82
- `MoneyPenny*.tsx` — Already has AI in K84

---

## BUILD ORDER

```
Task 1 (Arena Upload + STAMP) → FIRST (everything depends on submissions existing)
Task 3 (Emporium Gallery) → after Task 1 (needs submissions to display)
Task 2 (Battle Auto-Trigger) → after Task 1 (triggers on approval)
Task 4 (Crew Tables) → PARALLEL with Tasks 2-3 (independent)
Task 5 (Storefront Wiring) → after Tasks 3+4 (links to both)
Task 6 (Count) → anytime
```

---

## DEPLOY CHECKLIST

1. Push migration if new tables created: `npx supabase db push --linked`
2. Create Supabase Storage bucket: `arena-designs` (public read, authenticated write)
3. Deploy frontend to Firebase
4. Test: Upload a design → approve via STAMP → see it in Emporium
5. Test: Upload 2 designs in same category → Design Battle auto-triggers
6. Test: Create a Crew Table → join seats → table activates at threshold
7. Test: Create storefront → see Emporium links on success screen

---

## SUCCESS CRITERIA

- [ ] Designers can upload work to the Arena with image + category + price
- [ ] Admin STAMP review queue shows pending submissions with approve/reject
- [ ] Approved designs appear in the Emporium gallery with filters
- [ ] "Use This Template" charges Credits and pays designer 83.3%
- [ ] Design Battles auto-trigger when 2+ approved submissions in same category within 7 days
- [ ] Battle non-winners retain "approved" status (you didn't lose mechanic)
- [ ] Crew Tables can be created with role slots and templates
- [ ] Members can join open seats; table activates when minimum filled
- [ ] Active tables show 3-stage checklist tracker
- [ ] Storefront creation links to Emporium + Crew Table auto-create
- [ ] Non-logged-in users can browse Emporium (ghost browsing)

---

**Designers upload. Reviewers approve. Businesses browse. Teams assemble. The creative economy engine starts turning.**

**FOR THE KEEP.**
