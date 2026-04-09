# Knight Build Prompt — Session 16: LB-Native Creator Showcase, Modular Manufacturing, Crew Call
# FOR KNIGHT: Build the launch-ready creator showcase and manufacturing recruitment system

**Date:** March 14, 2026
**Source:** Bishop (Founder's modular manufacturing concept + Creator Showcase launch requirement)

---

## IMPORTANT: SEC Language Rules

Throughout ALL code, comments, UI text, and variable names:
- "investment return" → "earned allocation authority" / "Service Allocation Authority (SAA)"
- "collateral" → "allocation budget" / "backing authority"
- "profit" / "dividend" → "operational surplus" / "service margin"
- "equity" → "participation" / "service allocation"
- "invest" → "sponsor" / "contribute" / "back"

The cooperative OWNS Joules. Members earn authority to DIRECT them, not own them.

---

## Task 1: LB-Native Creator Showcase Page

**FOUNDER DIRECTIVE**: This must be ready FROM LAUNCH, not Phase 2. Creators see their work showcased natively on LB from day one.

Create `src/pages/CreatorShowcasePage.tsx`

### Route: `/creators` (ExplorerRoute — public)

### Requirements:
1. **Grid view** of all creators who have signed up with `creator_type` set
2. Each creator card shows:
   - Creator name, avatar, creator type badge (Physical, Art, Food, Music, Business)
   - Sample product images (from their LB product listings if any, placeholder otherwise)
   - Cost+20 pricing indicator
   - Medallion tier badge (if applicable)
   - "View Creator" link → individual creator profile
   - "Back this Creator" button (links to ProjectBackingFlow)
3. **Filter bar**: by creator type (All / Physical / Art / Food / Music / Business)
4. **Sort**: by newest, most backed, alphabetical
5. **"Join as Creator"** CTA banner at top for unauthenticated users → `/join/creator`
6. **"Invite a Creator"** cue card at bottom → InviteCreatorCard

### Individual Creator Profile: `/creators/:username`
- Creator bio and avatar
- "See their work" external link (Instagram/Etsy/portfolio)
- Product grid (LB-native listings with Cost+20 pricing)
- BandWagon stats (if they have backings)
- "Back this Creator" button
- Referral info: "Brought to LB by [referrer]" if applicable

---

## Task 2: Modular Manufacturing Schema

Create migration: `20260314000010_modular_manufacturing_system.sql`

### Table 1: `manufacturing_process_modules`
```sql
CREATE TABLE IF NOT EXISTS public.manufacturing_process_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_name TEXT NOT NULL UNIQUE,
  process_type TEXT NOT NULL
    CHECK (process_type IN ('additive', 'subtractive', 'casting', 'molding', 'assembly', 'finishing', 'other')),
  description TEXT,
  equipment_needed TEXT[],
  skill_level TEXT NOT NULL DEFAULT 'intermediate'
    CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.manufacturing_process_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read process modules" ON manufacturing_process_modules FOR SELECT USING (true);
CREATE POLICY "Admin manage process modules" ON manufacturing_process_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'steward'))
);

-- Seed initial process modules
INSERT INTO manufacturing_process_modules (process_name, process_type, description, equipment_needed, skill_level)
VALUES
  ('SLA 3D Printing', 'additive', 'Stereolithography resin printing for high-detail parts', ARRAY['SLA Printer', 'Wash Station', 'Cure Station'], 'intermediate'),
  ('SLS 3D Printing', 'additive', 'Selective Laser Sintering for functional nylon parts', ARRAY['SLS Printer', 'Powder Recovery System'], 'advanced'),
  ('FDM/FFF 3D Printing', 'additive', 'Fused Deposition Modeling for prototypes and functional parts', ARRAY['FDM Printer', 'Build Plate'], 'beginner'),
  ('Slip Casting', 'casting', 'Ceramic slip casting with plaster molds', ARRAY['Molds', 'Slip Mixer', 'Kiln'], 'intermediate'),
  ('Sand Casting', 'casting', 'Metal casting using sand molds', ARRAY['Sand Molds', 'Furnace', 'Safety Equipment'], 'advanced'),
  ('Injection Molding', 'molding', 'Plastic injection molding for production runs', ARRAY['Injection Mold Machine', 'Mold Tooling'], 'expert'),
  ('Desktop Extrusion', 'molding', 'Small-scale plastic extrusion for custom profiles', ARRAY['Desktop Extruder', 'Die Set'], 'intermediate'),
  ('CNC Milling', 'subtractive', 'Computer-controlled milling for precision parts', ARRAY['CNC Mill', 'Tooling Set', 'CAM Software'], 'advanced'),
  ('Laser Cutting', 'subtractive', 'Laser cutting for sheet materials', ARRAY['Laser Cutter', 'Ventilation System'], 'intermediate'),
  ('Hand Assembly', 'assembly', 'Manual assembly of multi-part products', ARRAY['Workbench', 'Hand Tools'], 'beginner')
ON CONFLICT (process_name) DO NOTHING;
```

### Table 2: `crew_call_assignments`
```sql
CREATE TABLE IF NOT EXISTS public.crew_call_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_module_id UUID NOT NULL REFERENCES manufacturing_process_modules(id) ON DELETE CASCADE,
  role_level TEXT NOT NULL DEFAULT 'backup'
    CHECK (role_level IN ('primary', 'secondary', 'backup')),
  is_process_pioneer BOOLEAN DEFAULT FALSE,
  pioneer_recognized_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, process_module_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_call_user ON crew_call_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_call_process ON crew_call_assignments(process_module_id);
CREATE INDEX IF NOT EXISTS idx_crew_call_role ON crew_call_assignments(role_level);
ALTER TABLE public.crew_call_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own assignments" ON crew_call_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own assignments" ON crew_call_assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own assignments" ON crew_call_assignments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public read for crew display" ON crew_call_assignments FOR SELECT USING (true);
```

### Table 3: `process_pioneer_ledger`
```sql
CREATE TABLE IF NOT EXISTS public.process_pioneer_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_module_id UUID NOT NULL REFERENCES manufacturing_process_modules(id) ON DELETE CASCADE,
  pioneer_type TEXT NOT NULL DEFAULT 'first_mover'
    CHECK (pioneer_type IN ('first_mover', 'innovator', 'scale_pioneer', 'quality_pioneer')),
  recognition_description TEXT,
  recognized_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(process_module_id, pioneer_type)
);

ALTER TABLE public.process_pioneer_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pioneer ledger" ON process_pioneer_ledger FOR SELECT USING (true);
CREATE POLICY "Admin manage pioneer ledger" ON process_pioneer_ledger FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'steward'))
);
```

### DNA Lock entries
```sql
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('crew_call_max_primary_per_process', '3', 'integer', false, 'SYSTEM', 'Maximum Primary operators per process module', 'manufacturing'),
  ('crew_call_max_secondary_per_process', '5', 'integer', false, 'SYSTEM', 'Maximum Secondary operators per process module', 'manufacturing'),
  ('crew_call_backup_unlimited', 'true', 'boolean', false, 'SYSTEM', 'Whether Backup slots are unlimited', 'manufacturing'),
  ('process_pioneer_marks_reward', '25', 'integer', false, 'SYSTEM', 'Marks reward for being recognized as a Process Pioneer', 'manufacturing'),
  ('cue_card_deck_annual_price_credits', '5', 'integer', false, 'SYSTEM', '$5/year Viral Cue Card Deck membership price in Credits', 'marketing')
ON CONFLICT (parameter_key) DO NOTHING;
```

---

## Task 3: Crew Call UI Components

### 3a. Create `src/pages/CrewCallPage.tsx`

Route: `/crew-call` (protected, auth required)

Display:
1. Hero: "We Need You To Do What You're Already Good At"
2. Grid of all manufacturing process modules showing:
   - Process name, type badge, skill level indicator
   - Current crew: # Primary, # Secondary, # Backup assigned
   - Vacancy indicators (green = open slots, yellow = could use more backup)
   - Process Pioneer badge (if someone has claimed pioneer status)
3. For each process, user can:
   - "Claim Primary" / "Claim Secondary" / "Sign Up as Backup" buttons
   - See who else is on the crew (names + avatars)
   - If they're first to claim Primary → auto-recognized as Process Pioneer
4. Bottom: "Know a maker with these skills? Send them a Cue Card" → InviteCreatorCard

### 3b. Create `src/components/cue-cards/WeNeedYouCard.tsx`

- Card text: "We Need You To Do What You're Already Good At"
- Shows: list of process modules with open Primary/Secondary slots
- "Join the Crew" CTA → `/crew-call`
- Placement: CreatorPitchPage, ManufacturingStore, Dashboard

### 3c. Create `src/components/manufacturing/ProcessModuleCard.tsx`

Reusable card for displaying a single process module:
- Process name + type icon
- Skill level badge
- Equipment needed (expandable list)
- Crew roster (Primary/Secondary/Backup with avatars)
- Pioneer badge if claimed
- Role claim buttons

---

## Task 4: Cue Card Deck Component

Create `src/components/cue-cards/CueCardDeck.tsx`

The $5/year Viral Cue Card Deck — displays ALL available cue cards as a browsable collection:
- Card carousel or grid view
- Each cue card is a mini-preview of the full card
- "Get Your Deck" CTA for $5/year (Credits purchase)
- Cards included: InviteCreatorCard, BecomeAStewardCard, GetFamousCard, IDontWantYourMoneyCard, WeNeedYouCard
- "Share a Card" button on each → generates shareable link with `?ref=USERNAME`

Route: Add to `/membership` or `/benefits` if exists, otherwise `/cue-cards`

---

## Task 5: Navigation Updates

- Add "Creators" to UnifiedNavigation → `/creators` (visible to all)
- Add "Crew Call" to UnifiedNavigation → `/crew-call` (visible to authenticated users)
- Add "Cue Cards" as sub-nav item under user menu → `/cue-cards`
- Update CreatorPitchPage to include WeNeedYouCard at bottom

---

## Task 6: Innovation Migration

Create `20260314000011_innovation_log_session_11b_batch6_modular_mfg.sql`

Insert innovations #1640–#1647:
1. #1640 Modular Manufacturing Process Path System (Bag 8)
2. #1641 Crew Call Maker Recruitment Protocol (Bag 8)
3. #1642 Process Pioneer IP Ledger Recognition (Bag 8)
4. #1643 Primary/Secondary/Backup Role Assignment (Bag 7)
5. #1644 "We Need You" Cue Card for Process Recruitment (Bag 8)
6. #1645 $5/Year Viral Cue Card Deck Membership Benefit (Bag 8)
7. #1646 Benefits Card Red Carpet Integration (Bag 8)
8. #1647 Modular Vertical Integration with Substitutable Process Modules (Bag 9)

Update innovation count to **1,647** in all platform locations.

---

## Task 7: Verify & Commit

- `npx tsc --noEmit` passes
- Innovation count = 1,647 everywhere
- Commit:

```
feat: LB-native Creator Showcase, Crew Call, modular manufacturing system (Session 16)

- Create CreatorShowcasePage with grid view and individual creator profiles
- Create modular manufacturing schema (process_modules, crew_call, pioneer_ledger)
- Create CrewCallPage for maker recruitment with Primary/Secondary/Backup roles
- Create WeNeedYouCard and CueCardDeck components
- Create ProcessModuleCard for reusable manufacturing UI
- Add Creators and Crew Call to navigation
- Thresh 8 innovations (#1640-#1647), count to 1,647
- All SEC-safe language verified

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## References

- ManufacturingStore: `src/pages/ManufacturingStore.tsx`
- Manufacturing pipeline: `src/lib/manufacturingPipeline.ts`
- CreatorPitchPage: `src/pages/CreatorPitchPage.tsx`
- CreatorShowcase component: `src/components/creator/CreatorShowcase.tsx`
- InviteCreatorCard: `src/components/cue-cards/InviteCreatorCard.tsx`
- Existing cue cards: `src/components/cue-cards/*`
- BandWagon: `src/components/bandwagon/*`
- SEC rules: MEMORY.md
- Founder Corrections: MEMORY.md

---

*Prepared by Bishop. March 14, 2026.*
*FOR THE KEEP.*
