# Knight Build Prompt — Session 12: BandWagon Implementation
# FOR KNIGHT: Build the BandWagon taste-prediction influence system

**Date:** March 14, 2026
**Source:** Bishop (from Founder's BandWagon design, Session 11B)
**Design doc:** `BISHOP_DROPZONE/BANDWAGON_DESIGN_DOCUMENT.md`

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

## Task 1: BandWagon Schema Migration

Create migration: `20260314000002_bandwagon_taste_prediction_system.sql`

### Table 1: `taste_ranger_profiles`
```sql
CREATE TABLE IF NOT EXISTS public.taste_ranger_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  ranger_tier TEXT NOT NULL DEFAULT 'scout'
    CHECK (ranger_tier IN ('scout', 'ranger', 'curator', 'tastemaker', 'patron', 'luminary')),
  saa_score NUMERIC(12,2) NOT NULL DEFAULT 0.00,  -- Service Allocation Authority
  total_backings INTEGER NOT NULL DEFAULT 0,
  successful_backings INTEGER NOT NULL DEFAULT 0,
  trust_score NUMERIC(5,4) DEFAULT 0.0000,  -- 0.0000 to 1.0000
  allocation_budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,  -- Backed Marks available to allocate
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taste_ranger_user ON taste_ranger_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_taste_ranger_tier ON taste_ranger_profiles(ranger_tier);
ALTER TABLE public.taste_ranger_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON taste_ranger_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON taste_ranger_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public read for leaderboard" ON taste_ranger_profiles FOR SELECT USING (true);
```

### Table 2: `backed_marks_ledger`
```sql
CREATE TABLE IF NOT EXISTS public.backed_marks_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  source TEXT NOT NULL CHECK (source IN ('saa_allocation', 'backing_spent', 'backing_refund', 'surplus_distribution')),
  reference_id UUID,  -- project_backings.id or other reference
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backed_marks_user ON backed_marks_ledger(user_id);
ALTER TABLE public.backed_marks_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ledger" ON backed_marks_ledger FOR SELECT USING (auth.uid() = user_id);
```

### Table 3: `project_backings`
```sql
CREATE TABLE IF NOT EXISTS public.project_backings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,  -- polymorphic: any initiative project
  project_type TEXT NOT NULL,  -- 'lmd_meal', 'lmb_venture', 'bounty', etc.
  amount_backed NUMERIC(12,2) NOT NULL CHECK (amount_backed > 0),
  currency_type TEXT NOT NULL DEFAULT 'backed_marks' CHECK (currency_type IN ('backed_marks')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'succeeded', 'failed', 'withdrawn')),
  backer_sequence INTEGER,  -- 1-100 for first-100 rule; NULL if after 100
  backed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  saa_earned NUMERIC(12,2) DEFAULT 0.00  -- SAA earned when project succeeds
);

CREATE INDEX IF NOT EXISTS idx_backings_backer ON project_backings(backer_id);
CREATE INDEX IF NOT EXISTS idx_backings_project ON project_backings(project_id, project_type);
CREATE INDEX IF NOT EXISTS idx_backings_status ON project_backings(status);
ALTER TABLE public.project_backings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own backings" ON project_backings FOR SELECT USING (auth.uid() = backer_id);
CREATE POLICY "Public read for project stats" ON project_backings FOR SELECT USING (true);
```

### Table 4: `trust_chains`
```sql
CREATE TABLE IF NOT EXISTS public.trust_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  originator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  project_type TEXT NOT NULL,
  chain_depth INTEGER NOT NULL DEFAULT 1 CHECK (chain_depth >= 1 AND chain_depth <= 5),
  parent_link_id UUID REFERENCES trust_chains(id),  -- NULL for originator
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attribution_share NUMERIC(5,4) NOT NULL,  -- decaying share (0.40, 0.25, 0.15, 0.10, 0.10)
  follow_type TEXT NOT NULL DEFAULT 'direct' CHECK (follow_type IN ('direct', 'branch')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, project_type, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_trust_chains_originator ON trust_chains(originator_id);
CREATE INDEX IF NOT EXISTS idx_trust_chains_follower ON trust_chains(follower_id);
CREATE INDEX IF NOT EXISTS idx_trust_chains_project ON trust_chains(project_id, project_type);
ALTER TABLE public.trust_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own chains" ON trust_chains FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = originator_id);
CREATE POLICY "Public read for trust display" ON trust_chains FOR SELECT USING (true);
```

### DNA Lock entries
```sql
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('bandwagon_first_100_threshold', '100', 'integer', false, 'SYSTEM', 'Number of early backers who share influence proportionally', 'bandwagon'),
  ('bandwagon_trust_chain_max_depth', '5', 'integer', false, 'SYSTEM', 'Max links in a TasteMaker Trust Chain', 'bandwagon'),
  ('bandwagon_attribution_decay', '0.40,0.25,0.15,0.10,0.10', 'text', false, 'SYSTEM', 'Attribution shares by chain depth (originator, 1st follower, 2nd, 3rd, 4th+)', 'bandwagon'),
  ('bandwagon_saa_base_per_success', '10', 'integer', false, 'SYSTEM', 'Base SAA points earned per successful project backing', 'bandwagon'),
  ('bandwagon_tier_thresholds', '0,50,200,500,1500,5000', 'text', false, 'SYSTEM', 'SAA thresholds for Scout/Ranger/Curator/TasteMaker/Patron/Luminary', 'bandwagon'),
  ('bandwagon_backed_marks_pct_of_surplus', '20', 'integer', false, 'SYSTEM', 'Percent of operational surplus allocated to Backed Marks pool', 'bandwagon')
ON CONFLICT (parameter_key) DO NOTHING;
```

### Fix: Palate Guild seed

The Palate Guild seed in migration 000012 was skipped due to guilds table schema mismatch on remote. The `guilds` table has a CHECK constraint on `guild_type` and requires columns that don't match the original schema. **Investigate the remote `guilds` table schema and fix the Palate Guild insert.** You may need to:
1. Check what values `guild_type` CHECK constraint allows on remote
2. Add 'skill' to the CHECK if needed, or use an existing valid value
3. Insert with all required NOT NULL columns

---

## Task 2: Taste Ranger Dashboard Component

Create `src/components/bandwagon/TasteRangerDashboard.tsx`

Display:
- Current tier with badge icon (Scout → Luminary)
- SAA score with progress bar to next tier
- Allocation budget (available Backed Marks)
- Success rate (successful_backings / total_backings)
- Trust score
- Active backings list
- Recent trust chain activity

Use shadcn/ui Card, Progress, Badge components. Follow existing component patterns.

---

## Task 3: Project Backing Flow Component

Create `src/components/bandwagon/ProjectBackingFlow.tsx`

Features:
- "Back This Project" button (only appears if user has Backed Marks allocation)
- Amount input (capped at user's allocation_budget)
- Backer sequence display ("You'd be backer #47 of 100 in the early pool")
- Trust chain attribution: if user followed a recommendation, show the chain
- Confirmation with "As You Wish" button
- Post-backing: show updated allocation budget

---

## Task 4: Fantasy League Bridge

Create `src/components/bandwagon/FantasyBridge.tsx`

Display:
- User's Fantasy League prediction accuracy
- "Bridge" status: locked / unlocking / unlocked
- Threshold to unlock real Backed Marks allocation
- If unlocked: link to Project Backing Flow
- If locked: show what accuracy they need and how close they are

---

## Task 5: Positive-Only QA Display

In any project listing or leaderboard that uses BandWagon data:
- Show ONLY backing count and total backed amount
- NO thumbs down, NO negative ratings, NO rejection indicators
- Absence of backing = sufficient signal (just shows low/zero numbers)
- Sort by backing magnitude, not by rating

---

## Task 6: Verify Innovation Count

After all changes, verify:
- `innovation_log` table has exactly 1,622 rows
- Run: `SELECT COUNT(*) FROM innovation_log;`
- If not 1,622, investigate and fix

---

## Task 7: Commit

```
feat: implement BandWagon taste-prediction influence system (Session 12)

- Add taste_ranger_profiles, backed_marks_ledger, project_backings, trust_chains tables
- Add BandWagon dna_lock configuration entries
- Create TasteRangerDashboard, ProjectBackingFlow, FantasyBridge components
- Implement positive-only quality display (no negative ratings)
- All SEC-safe language verified

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## References

- Design doc: `BISHOP_DROPZONE/BANDWAGON_DESIGN_DOCUMENT.md`
- Innovations: #1615-#1622 (threshed, in DB)
- LMD integration: `CONTEXT_MANAGEMENT/LMD_PIPELINE_AND_REPUTATION_DESIGN.md` Section 8
- SEC rules: `MEMORY.md` SEC-Safe Language Rules section
- Existing schema: `platform/supabase/migrations/` (check for conflicts)
- Palate Guild fix needed: migration `20260313000012` line "Palate Guild seed skipped due to schema mismatch"

---

*Prepared by Bishop. March 14, 2026.*
*FOR THE KEEP.*
