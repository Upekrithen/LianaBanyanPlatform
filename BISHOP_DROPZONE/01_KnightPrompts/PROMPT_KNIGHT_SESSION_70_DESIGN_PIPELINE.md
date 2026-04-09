# Knight Session 70 Prompt — Design Pipeline + Crew Table + Arena→Emporium Wiring
## Connect Existing Systems Into the Creative Services Engine
## Innovation Count: 1,896 (Bishop 019 produced 86 unfiled innovations since 1,810)
## Priority: HIGH — Designers need a path to earn. Businesses need design services.

---

> **What exists (already built):**
> - DesignBattleArena.tsx — Design Battle UI with voting
> - Maker Spotlight system — rotating slideshow, 47 makers, 3 tiers, 3-min intervals
> - Treasure Map Chest — `/treasure-maps` with 6 maps
> - Storefront Builder — `/tools/storefront-builder`
> - QR Cue Card Generator — `/tools/cue-card-generator`
> - BandWagon — proposal/discovery board
> - Commerce Engine — full scan→order→pay→deliver→earn loop
>
> **What needs WIRING (not building from scratch):**
> - Arena upload → STAMP review → Emporium listing pipeline
> - Design Battle auto-trigger when 2+ submissions in same category
> - Maker Spotlight rotation for Design Battle voting periods
> - Crew Table assembly interface on BandWagon
> - "Become an LB Designer" treasure map added to Chest
> - Onboarding Design Prompt after storefront creation
> - Template Gallery with royalty tracking

---

## Task 1: Arena Upload Flow

**What exists:** `DesignBattleArena.tsx` — has battle UI but no general upload flow.

**Build:**
1. Add "Submit Design" form to Arena page:
   - Upload image (PNG/SVG/PDF)
   - Category: `loteria_card`, `cue_card_template`, `business_card_template`, `logo`, `menu_template`, `coalition_brand`
   - Title, description, tags
   - Price (if selling as template): Credits amount
2. Create migration `20260322000001_arena_submissions.sql`:

```sql
CREATE TABLE IF NOT EXISTS arena_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(10,2), -- null if bounty submission, set if template for sale
  status TEXT DEFAULT 'pending_review', -- pending_review, approved, rejected, in_battle, in_emporium
  stamp_reviewer_id UUID REFERENCES auth.users(id),
  stamp_rating DECIMAL(3,1),
  stamp_date TIMESTAMPTZ,
  battle_id UUID, -- set if pulled into a Design Battle
  royalty_uses INT DEFAULT 0,
  royalty_earnings DECIMAL(10,2) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE arena_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved submissions" ON arena_submissions
  FOR SELECT USING (status IN ('approved', 'in_battle', 'in_emporium'));
CREATE POLICY "Creators manage own submissions" ON arena_submissions
  FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Admin manages all submissions" ON arena_submissions
  FOR ALL USING (public.is_admin());
```

3. STAMP review queue: admin or designated reviewers see pending submissions → approve/reject

---

## Task 2: Design Battle Auto-Trigger (#1237)

**What exists:** Design Battle UI. But no AUTO-TRIGGER when 2+ submissions land in the same category.

**Build:**
1. Database trigger or edge function: when a new `arena_submissions` row is inserted with status `approved`:
   - Count approved submissions in same category within last 7 days
   - If count >= 2: auto-create a Design Battle
   - Pull all qualifying submissions into the battle
   - Set battle voting period: 48 hours
   - Notify all participants
2. Battle winner: status → `in_emporium` (goes to template gallery)
3. Battle non-winners: status stays `approved` — **still browsable, still commissionable**
   - Their work appears in the Emporium with tag: "Arena Submission — available for commission"
   - THIS is the "you didn't lose" mechanic: your design is still for sale, still in your portfolio, still earns royalties if businesses use it

---

## Task 3: Maker Spotlight Integration for Voting

**What exists:** Maker Spotlight rotation (3-min intervals, midnight rotation).

**Wire:**
1. When a Design Battle is active, the Maker Spotlight on the homepage shows battle entries in rotation
2. Add a "Vote" button on each spotlight slide during active battles
3. Voting costs Coverage Minutes (existing mechanic)
4. Vote tallies feed into the battle resolution
5. After battle ends, spotlight reverts to normal maker rotation

**Implementation:** Add a `spotlight_mode` field: `normal` | `battle_{battle_id}`. When in battle mode, the spotlight service pulls from `arena_submissions` where `battle_id = X` instead of from `maker_spotlights`.

---

## Task 4: Emporium / Template Gallery Page

**Route:** `/emporium/templates` (or `/emporium/designs`)

**What it shows:**
- Browsable grid of approved designs (Lotería cards, Cue Card templates, logo portfolio pieces)
- Filter by category, price, rating, designer
- Each card shows: thumbnail, title, designer name, price (or "Bounty submission"), rating, uses count
- Click → detail page with full preview + "Use This Template" or "Commission This Designer"

**"Use This Template" flow:**
1. Member selects template
2. System auto-customizes (insert business name, QR code, colors from storefront)
3. Preview → Download PDF
4. Designer earns royalty: 5 Credits per use
5. Royalty tracked in `arena_submissions.royalty_uses` and `royalty_earnings`

**Ghost Credit browsing:**
- Non-members (Users) can browse the Emporium freely
- "Ghost buy" button on each template: registers interest without payment
- Ghost credit counter visible: "You have X items waiting. Join to unlock."
- Conversion prompt at 3+ ghost credits (Innovation #1894)

---

## Task 5: Crew Table Interface on BandWagon

**Route:** Add to existing BandWagon page as a new section: "Crew Tables"

**Build:**
1. Create migration `20260322000002_crew_tables.sql`:

```sql
CREATE TABLE IF NOT EXISTS crew_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  template_type TEXT, -- 'new_business_starter', 'coalition_brand', 'event_launch', 'custom'
  treasure_map_ref TEXT, -- which treasure map this table follows
  stage_current INT DEFAULT 1, -- 1=PREP, 2=BUILD, 3=DELIVER
  stage_1_items JSONB DEFAULT '[]', -- [{task, assigned_to, completed}]
  stage_2_items JSONB DEFAULT '[]',
  stage_3_items JSONB DEFAULT '[]',
  min_seats_to_activate INT DEFAULT 3,
  is_active BOOLEAN DEFAULT false, -- activates when min seats filled
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crew_table_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES crew_tables(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL, -- 'designer', 'photographer', 'writer', 'printer', 'runner'
  slot_type TEXT NOT NULL DEFAULT 'primary', -- 'primary', 'secondary', 'tertiary'
  member_id UUID REFERENCES auth.users(id), -- null if open
  seated_at TIMESTAMPTZ,
  payment_amount DECIMAL(10,2), -- agreed payment for this role
  is_required BOOLEAN DEFAULT true, -- primary = required, secondary/tertiary = optional
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crew_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_table_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active tables" ON crew_tables FOR SELECT USING (true);
CREATE POLICY "Creators manage own tables" ON crew_tables FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Anyone can view seats" ON crew_table_seats FOR SELECT USING (true);
CREATE POLICY "Members can join open seats" ON crew_table_seats
  FOR UPDATE USING (member_id IS NULL OR auth.uid() = member_id);
CREATE POLICY "Admin manages tables" ON crew_tables FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manages seats" ON crew_table_seats FOR ALL USING (public.is_admin());
```

2. Visual: Round Table layout with seats around edge, 3-tab card stack in center
3. BandWagon section: "Open Crew Tables Near You" — shows tables with open primary seats
4. Click "Join Seat" → member fills the role → table checks if min_seats_to_activate reached → if yes, table activates

---

## Task 6: Onboarding Design Prompt

**Where:** After storefront creation in StorefrontBuilder.tsx, on the success/confirmation screen.

**Add a section:**
```
Your storefront is live! 🎉

Want to attract customers? You'll need:
📇 Cue Card — [Browse Designs] → links to /emporium/templates?category=cue_card
🎨 Logo — [Browse Designers] → links to /emporium/templates?category=logo
💼 Business Card — [Browse Templates] → links to /emporium/templates?category=business_card

Or get everything at once:
📦 New Business Starter Package — [Create Crew Table] → auto-creates table with designer/photographer/writer/printer seats
```

The "Create Crew Table" button auto-creates a table using the `new_business_starter` template (#1890).

---

## Task 7: "Become an LB Designer" Treasure Map

**Add to Treasure Map Chest** (`/treasure-maps`):

New card:
- Title: "Become an LB Designer"
- Level: 1 (anyone can start)
- Startup cost: $0
- Revenue estimate: $500-5,000/month
- Icon: 🎨 paintbrush + Lotería card
- "Start This Map" → step-by-step page with Level 1-4 progression from A&A 019H

---

## Task 8: Innovation Count → 1,896

Update `useCanonicalStats.ts` DEFAULTS.

Note: Bishop 019 produced 86 innovations (#1811-#1896) across 9 A&A documents. These are unfiled — in the Innovation Bag at `Asteroid-ProofVault/03_PATENT_BAGS/from20Mar2026/INNOVATION_BAG_from20Mar2026.md`.

---

## Task 9: Passive Income Dashboard (if not completed in Session 68)

**Route:** `/dashboard/onboarder`

Shows: qualified onboarding credits (3% each), steward agreements (2% each), per-business revenue, total passive income. See A&A 019E for full mockup.

---

## Build Order

```
Task 1 (Arena Upload) + Task 7 (Designer Treasure Map) + Task 8 (Count) → PARALLEL
Task 2 (Battle Auto-Trigger) → after Task 1
Task 3 (Spotlight Integration) → after Task 2
Task 4 (Emporium/Gallery) → after Task 1
Task 5 (Crew Tables) → independent, can parallel with Tasks 2-4
Task 6 (Onboarding Prompt) → after Tasks 4+5
Task 9 (Passive Dashboard) → if not done, independent
```

---

## A&A Reference Documents

| Document | Innovations |
|----------|------------|
| `AA_SESSION_019H_LOTERIA_DECK_DESIGNER_BOUNTY.md` | #1876-#1885 |
| `AA_SESSION_019I_ARENA_CREW_TABLE_GHOST_MARKS.md` | #1886-#1896 |
| `SPEC_EXPANSION_BATCH_04A_1228_1370.md` | #1237 Design Battle, #1238 Mixed Ante |
| `SPEC_EXPANSION_BATCH_03_1141_1227.md` | #1157 Crow Feather system |
| Existing code: `DesignBattleArena.tsx`, `makerSpotlightService.ts` | Already built |

---

## The "You Didn't Lose" Mechanic (Explicit for Knight)

When a Design Battle ends:
- **Winner:** status → `in_emporium`, 50% pot, Crow Feather trophy, manufacturing pipeline
- **Non-winners:** status stays `approved`, design REMAINS in Emporium, still browsable, still commissionable, still earns royalties if businesses use it, IP Ledger entry permanent, portfolio piece forever

**"Your Work Is Never Wasted"** — the losing design didn't lose. It got:
1. Front-page exposure during the battle voting period
2. A permanent Emporium listing
3. An IP Ledger entry (provenance)
4. Portfolio visibility (future commissions)
5. The battle ITSELF was marketing for the designer's skills

**The only difference between winning and not winning is the pot + trophy.** The design itself is equally available to businesses either way.

---

**FOR THE KEEP.**
