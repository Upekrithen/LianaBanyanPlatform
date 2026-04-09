# Knight Build Prompt — Session 13: Onboarding Polish + System Integration
# FOR KNIGHT: Wire the new systems into the platform and polish the first-visit experience

**Date:** March 14, 2026
**Source:** Bishop (Session 11B continued)
**Goal:** Make the platform demo-ready for showing real people (Founder's MIL, friends, early adopters). Wire recently built systems (BandWagon, LMD Reviews, Steward) into discoverable navigation.

---

## IMPORTANT: SEC Language Rules

Throughout ALL code, comments, UI text, and variable names:
- "investment return" → "earned allocation authority" / "Service Allocation Authority (SAA)"
- "collateral" → "allocation budget" / "backing authority"
- "profit" / "dividend" → "operational surplus" / "service margin"
- "pick winners" → "identify and sponsor high-quality projects"
- "equity" → "participation" / "service allocation"
- "invest" → "sponsor" / "contribute" / "back"
- "ROI" / "returns" → "service value" / "utility benefit"
- "shares" / "ownership" → "membership participation" / "service units"

The cooperative OWNS Joules. Members earn authority to DIRECT them, not own them.

---

## CRITICAL: DO NOT TOUCH

- `src/components/WelcomeGate.tsx` — DO NOT MODIFY. Session 11, Founder+Rook approved. The three-tab system (Concept/Fable flipbook, Get Started/BLUF triage, More Detail/HEOHO) is locked.
- `src/lib/welcomeGateContent.ts` — DO NOT MODIFY the content variants. You may READ it to understand the gate flow.

---

## Task 1: Wire BandWagon into Main Navigation

The BandWagon components exist but need to be discoverable:

### 1a. Add "BandWagon" to the main navigation
- Add a nav item/link that routes to `/guilds/hub` (BandWagon tab)
- Icon suggestion: TrendingUp or Flame from lucide-react
- Should appear in the main sidebar/nav for authenticated users
- Label: "BandWagon" with subtitle "Back projects. Earn influence."

### 1b. Add BandWagon summary card to member dashboard
- If user has no `taste_ranger_profiles` row, show an invitation card:
  - "Become a Taste Ranger"
  - "Back projects you believe in. Earn Service Allocation Authority."
  - CTA: "Get Started" → `/guilds/hub`
- If user HAS a profile, show a compact stat card:
  - Tier badge, SAA score, active backings count
  - CTA: "View Dashboard" → `/guilds/hub`

### 1c. Cue Cards (prominent, like "Become an Influencer")
Create two new cue card components that appear in relevant locations (landing pages, dashboards, initiative pages):

**Card 1: `IDontWantYourMoneyCard.tsx`**
```
I don't want your $.
I want your
— Success —
```
Style: Bold, clean, high contrast. This is an anti-fundraising statement.

**Card 2: `BecomeAStewardCard.tsx`**
```
Become a Steward

Manage campaigns.
Pledge your Marks.
The oven's already hot —
cook more pizzas.
```
Style: Warm, inviting, action-oriented.

**Card 3: `GetFamousCard.tsx`**
```
Get Famous. Make Money. Do Good.
Put your service units where your mouth is.
```
Style: Aspirational, energetic.

Place these cards:
- `IDontWantYourMoneyCard` on ProfessionalLanding and ATTILanding
- `BecomeAStewardCard` on initiative detail pages and ColdStartDashboard
- `GetFamousCard` on ProfessionalLanding and the main member dashboard

---

## Task 2: Wire LMD Review System into Let's Make Dinner

The LMD Review components (LMDReviewForm, LMDReviewerDashboard, LMDReviewSubmitPage) exist and routes are in App.tsx. Make them discoverable:

### 2a. Add "Reviews" tab or section to the LMD initiative page
- If there are meals the user can review, show a badge/notification: "3 meals to review"
- Link to `/initiatives/lets-make-dinner/reviews`

### 2b. After ordering a meal, show a reminder
- After a meal order is placed, show a toast or card:
  - "Remember to review this meal within 72 hours to earn 5 Marks (service value for participation, not investment return)"
  - Link to the review page

---

## Task 3: Ghost Mode First-Visit Flow Audit

The Ghost World system (`src/lib/ghostWorld.ts`, `src/lib/ghostTasks.ts`) is substantial. The conversion flow (`src/lib/onboardMember.ts`) exists. But the first-time visitor experience needs to feel smooth and intentional.

### 3a. Audit the Ghost → Welcome → Explore → Convert flow
Read and trace the full path:
1. User arrives at site (no auth)
2. WelcomeGate fires (DO NOT MODIFY — just understand it)
3. User enters Ghost mode
4. Ghost tasks are available
5. User explores, earns ghost credits/feathers
6. Conversion incentive appears
7. User signs up → `onboardMember.ts` runs → ghost data migrates

**Identify and fix any broken links in this chain.** Common issues:
- Ghost mode not initializing correctly after WelcomeGate
- Ghost tasks referencing pages/routes that don't exist
- Conversion incentive not appearing when user has progress
- `onboardMember.ts` not running or failing silently
- Ghost leaderboard data not persisting

### 3b. Ensure Ghost Credit Balance is visible
- `GhostCreditBalance.tsx` exists — make sure it appears in the header/nav for unauthenticated users
- Should show feather count and a "What are these?" tooltip

### 3c. Ensure TreasureIsland page works
- Check `src/pages/TreasureIsland.tsx` renders correctly
- Check that treasure key embedding (`src/lib/treasureKeyEmbed.ts`) is wired to content pages
- At minimum, ensure the page loads without errors

---

## Task 4: Initiative Hub Navigation Consistency

All 16 initiatives should be browsable and each should show:
- Initiative name and description
- Current status (active, planned, etc.)
- Link to the initiative detail page
- If BandWagon-eligible: "Back this initiative" affordance
- If has a review system: review entry point

### 4a. Check that ColdStartDashboard.tsx shows all 16 initiatives
- Cross-reference with `SWEET_SIXTEEN_CANONICAL.md` if available in the codebase
- Ensure none are missing or mislabeled

### 4b. Check that the Founder Corrections are respected in all visible text
- VSL = "Voucher Short Loans" (NOT "Veteran/Volunteer Service")
- Let's Make Bread = Business Incubator (NOT literal baking)
- JukeBox = Music licensing / One Take Wonders (NOT "entertainment")
- Household Concierge = Shared Butler for YOUR household (NOT neighborhood)
- Initiative #15 = "Power to the People" / Political Expedition (NOT "International")

---

## Task 5: Steward System Schema Migration

Create migration: `20260314000005_steward_system.sql`

### Table: `steward_profiles`
```sql
CREATE TABLE IF NOT EXISTS public.steward_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  steward_tier TEXT NOT NULL DEFAULT 'apprentice'
    CHECK (steward_tier IN ('apprentice', 'journeyman', 'master_steward', 'grand_steward')),
  total_projects_managed INTEGER NOT NULL DEFAULT 0,
  successful_projects INTEGER NOT NULL DEFAULT 0,
  total_pledged NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  trust_score NUMERIC(5,4) DEFAULT 0.0000,
  concurrent_limit INTEGER NOT NULL DEFAULT 1,
  max_pledge_limit NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_steward_user ON steward_profiles(user_id);
ALTER TABLE public.steward_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own steward profile" ON steward_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own steward profile" ON steward_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public read for steward discovery" ON steward_profiles FOR SELECT USING (true);
```

### Table: `pledged_marks_escrow`
```sql
CREATE TABLE IF NOT EXISTS public.pledged_marks_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pledger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  project_type TEXT NOT NULL,
  amount_pledged NUMERIC(12,2) NOT NULL CHECK (amount_pledged > 0),
  status TEXT NOT NULL DEFAULT 'held'
    CHECK (status IN ('held', 'released', 'absorbed', 'partial_release')),
  pledged_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  released_amount NUMERIC(12,2) DEFAULT 0.00,
  surplus_share NUMERIC(12,2) DEFAULT 0.00,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_pledged_escrow_pledger ON pledged_marks_escrow(pledger_id);
CREATE INDEX IF NOT EXISTS idx_pledged_escrow_project ON pledged_marks_escrow(project_id, project_type);
CREATE INDEX IF NOT EXISTS idx_pledged_escrow_status ON pledged_marks_escrow(status);
ALTER TABLE public.pledged_marks_escrow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own pledges" ON pledged_marks_escrow FOR SELECT USING (auth.uid() = pledger_id);
CREATE POLICY "Public read for project transparency" ON pledged_marks_escrow FOR SELECT USING (true);
```

### DNA Lock entries
```sql
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('steward_apprentice_max_projects', '1', 'integer', false, 'SYSTEM', 'Max concurrent projects for Apprentice tier', 'steward'),
  ('steward_journeyman_max_projects', '3', 'integer', false, 'SYSTEM', 'Max concurrent projects for Journeyman tier', 'steward'),
  ('steward_master_max_projects', '5', 'integer', false, 'SYSTEM', 'Max concurrent projects for Master Steward tier', 'steward'),
  ('steward_grand_max_projects', '999', 'integer', false, 'SYSTEM', 'Max concurrent projects for Grand Steward (unlimited)', 'steward'),
  ('steward_apprentice_max_pledge', '500', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Apprentice', 'steward'),
  ('steward_journeyman_max_pledge', '2000', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Journeyman', 'steward'),
  ('steward_master_max_pledge', '10000', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Master Steward', 'steward'),
  ('steward_grand_max_pledge', '100000', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Grand Steward', 'steward'),
  ('steward_promotion_journeyman', '3', 'integer', false, 'SYSTEM', 'Successful projects needed for Journeyman', 'steward'),
  ('steward_promotion_master', '10', 'integer', false, 'SYSTEM', 'Successful projects needed for Master Steward (+ trust >= 0.80)', 'steward'),
  ('steward_promotion_grand', '25', 'integer', false, 'SYSTEM', 'Successful projects needed for Grand Steward (+ community nomination)', 'steward'),
  ('steward_surplus_share_pct', '100', 'integer', false, 'SYSTEM', 'Surplus share proportional to pledge ratio (100 = exact match)', 'steward'),
  ('pizza_oven_concurrent_bonus_pct', '5', 'integer', false, 'SYSTEM', 'Percent bonus to SAA for each concurrent project managed', 'steward')
ON CONFLICT (parameter_key) DO NOTHING;
```

---

## Task 6: Verify Innovation Count

After all changes:
- `SELECT COUNT(*) FROM innovation_log;` — expected **1,630**
- All platform UI locations should show **1,630**

---

## Task 7: Commit

```
feat: wire BandWagon, LMD reviews, cue cards into navigation + Steward schema + Ghost flow audit (Session 13)

- Add BandWagon to main nav and member dashboard
- Create IDontWantYourMoney, BecomeASteward, GetFamous cue cards
- Wire LMD review system into meal pages
- Audit and fix Ghost → Welcome → Explore → Convert flow
- Add steward_profiles and pledged_marks_escrow tables
- Add Steward dna_lock configuration
- All SEC-safe language verified

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## References

- BandWagon design: `BISHOP_DROPZONE/BANDWAGON_DESIGN_DOCUMENT.md`
- Steward design: `BISHOP_DROPZONE/STEWARD_PIZZA_OVEN_DESIGN_DOCUMENT.md`
- Existing Ghost system: `src/lib/ghostWorld.ts`, `src/lib/ghostTasks.ts`, `src/lib/onboardMember.ts`
- WelcomeGate (READ ONLY): `src/components/WelcomeGate.tsx`, `src/lib/welcomeGateContent.ts`
- Cold Start: `src/pages/ColdStartDashboard.tsx`, `src/components/cold-start/*`
- LMD Reviews: `src/components/lmd/LMDReviewForm.tsx`, `src/pages/LMDReviewerDashboard.tsx`
- SEC rules: MEMORY.md
- Founder Corrections: MEMORY.md (NEVER use wrong versions)

---

*Prepared by Bishop. March 14, 2026.*
*FOR THE KEEP.*
