# KNIGHT SESSION 83 — Crew Call Real Dispatch + Bounty Backend
## Bishop 025 | March 22, 2026
## Innovation Count: 1,935 (unchanged — wiring session)

---

## MISSION

Wire the bounty system with a real backend, connect Crew Call formation to OOB auto-dispatch (when a crew needs members, auto-post to social), and connect Coverage Minutes in Round Tables to the database. The Crew Call micro-cooperatives and manufacturing roles are fully built — what's missing is the bounty tracking and the automatic "help wanted" broadcasts.

---

## CONTEXT: WHAT EXISTS

| Component | Status | Notes |
|-----------|--------|-------|
| Crew micro-cooperatives | ✅ LIVE | Full lifecycle: form → back → deliver → complete |
| Manufacturing Crew Call | ✅ LIVE | 10 processes, role claiming, Process Pioneer tracking |
| HexIsle Bounties | ⚠️ UI ONLY | 7 bounties hardcoded in CrewCallPage.tsx, no backend |
| Round Table Chat | ✅ LIVE | Realtime via Supabase, system messages supported |
| Coverage Minutes (Muffled Rule) | ⚠️ MOCK ONLY | roundTables.ts has logic, no DB persistence |
| OOB Auto-Post | ✅ LIVE (K78) | pg_cron, social-post edge function, 7 platforms |
| Outbound Dispatch | ✅ LIVE | 18 articles seeded, status tracking |

---

## TASK 1: Bounty Backend

Create migration `20260322000011_bounties.sql`:

```sql
-- General-purpose bounty system (not just HexIsle)
CREATE TABLE bounties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hexisle_engineering', 'crew_call', 'design', 'delivery', 'general'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  difficulty TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
  required_skills TEXT[] DEFAULT '{}',
  
  -- Rewards
  reward_credits INTEGER DEFAULT 0,
  reward_marks INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  reward_joules INTEGER DEFAULT 0,
  
  -- STAMP criteria
  stamp_criteria JSONB DEFAULT '{}', -- { "1": "Minimal", "2": "Basic", ..., "5": "Outstanding" }
  deliverables TEXT[] DEFAULT '{}', -- what must be submitted
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'claimed', 'in_progress', 'submitted', 'completed', 'cancelled'
  max_claimants INTEGER DEFAULT 3, -- primary/secondary/backup
  
  -- Associations
  crew_id UUID REFERENCES crews(id),
  crew_table_id UUID REFERENCES crew_tables(id),
  storefront_id UUID REFERENCES storefronts(id),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bounty_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bounty_id UUID REFERENCES bounties(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role_level TEXT NOT NULL DEFAULT 'primary', -- 'primary', 'secondary', 'backup'
  status TEXT NOT NULL DEFAULT 'claimed', -- 'claimed', 'working', 'submitted', 'approved', 'rejected'
  submission_notes TEXT,
  submission_url TEXT,
  stamp_rating INTEGER, -- 1-5 from reviewer
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(bounty_id, user_id)
);

-- RLS
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open bounties" ON bounties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create bounties" ON bounties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator or admin can update" ON bounties FOR UPDATE USING (auth.uid() = created_by OR public.is_admin());

ALTER TABLE bounty_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view claims" ON bounty_claims FOR SELECT USING (true);
CREATE POLICY "Authenticated users can claim" ON bounty_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Claimant can update own" ON bounty_claims FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can update all claims" ON bounty_claims FOR UPDATE USING (public.is_admin());

-- Seed the 7 HexIsle bounties from the hardcoded data in CrewCallPage.tsx
INSERT INTO bounties (title, subtitle, description, category, priority, difficulty, required_skills, reward_credits, reward_marks, reward_xp, stamp_criteria, deliverables, status) VALUES
('Hydraulic Seal Design', 'Football Wave Generation Port', 'Design hydraulic seal mechanism for the football wave generation port', 'hexisle_engineering', 'critical', 'expert', ARRAY['CAD', 'Fluid Dynamics', 'Seal Design'], 2000, 50, 200, '{"1":"Seal concept only","2":"Basic CAD model","3":"Tested prototype design","4":"Pressure-rated design with materials spec","5":"Production-ready with test data"}', ARRAY['CAD model', 'Materials specification', 'Pressure test protocol', 'Assembly instructions'], 'open'),
('42→60mm Dimensional Port', 'Scale-Up Engineering', 'Engineer the dimensional scaling from 42mm to 60mm flat-to-flat', 'hexisle_engineering', 'high', 'advanced', ARRAY['CAD', 'Mechanical Engineering', 'Tolerance Analysis'], 3000, 75, 300, '{"1":"Concept sketch","2":"Basic scaling model","3":"Tolerance analysis complete","4":"Full engineering drawings","5":"Prototype-validated with test results"}', ARRAY['Engineering drawings', 'Tolerance stack-up analysis', 'Material recommendations', 'Prototype validation report'], 'open'),
('Tesla Valve Optimization', 'Flow Control Enhancement', 'Optimize Tesla valve design for improved flow control in Hexel channels', 'hexisle_engineering', 'high', 'advanced', ARRAY['Fluid Dynamics', 'CFD', 'CAD'], 2500, 60, 250, '{"1":"Literature review only","2":"Basic CFD simulation","3":"Optimized geometry with CFD validation","4":"Prototype tested","5":"Production-ready with flow data"}', ARRAY['CFD simulation results', 'Optimized valve geometry', 'Flow rate data', 'Comparison to baseline'], 'open'),
('Reservoir Pressure Testing', 'Quality Assurance Protocol', 'Develop pressure testing protocol for Hexel reservoir components', 'hexisle_engineering', 'medium', 'intermediate', ARRAY['Testing', 'QA', 'Pressure Systems'], 1500, 40, 150, '{"1":"Test plan outline","2":"Basic test procedure","3":"Full protocol with safety","4":"Validated with sample data","5":"Production QA standard with fixtures"}', ARRAY['Test protocol document', 'Safety checklist', 'Sample test data', 'Pass/fail criteria'], 'open'),
('Ouralis Gear Train QC', 'Quality Control System', 'Build quality control system for Ouralis gear train assembly', 'hexisle_engineering', 'medium', 'intermediate', ARRAY['QC', 'Metrology', 'Gear Systems'], 2000, 50, 200, '{"1":"Inspection checklist","2":"Go/no-go gauging plan","3":"Full QC process with SPC","4":"Automated inspection concept","5":"Production QC line with statistical controls"}', ARRAY['QC checklist', 'Gauge R&R study', 'SPC chart templates', 'Accept/reject criteria'], 'open'),
('Compliant Mechanism Durability', 'Fatigue & Lifecycle Testing', 'Test compliant mechanism components for fatigue life and durability', 'hexisle_engineering', 'medium', 'advanced', ARRAY['Materials Science', 'Fatigue Testing', 'FEA'], 1500, 40, 150, '{"1":"Test plan only","2":"Basic fatigue data","3":"Full S-N curve with FEA correlation","4":"Life prediction model","5":"Accelerated life test with field correlation"}', ARRAY['Fatigue test data', 'S-N curve', 'FEA validation', 'Life prediction model'], 'open'),
('Pneumatic Plant Growth', 'Bio-Mechanical Integration', 'Design pneumatic actuation system for plant growth simulation in Hexel', 'hexisle_engineering', 'low', 'expert', ARRAY['Pneumatics', 'Bio-Mechanics', 'Control Systems'], 2500, 60, 250, '{"1":"Concept sketch","2":"Basic pneumatic circuit","3":"Controlled actuation demo","4":"Integrated with plant growth model","5":"Self-regulating bio-pneumatic system"}', ARRAY['Pneumatic circuit diagram', 'Control logic', 'Growth simulation data', 'Integration guide'], 'open');
```

---

## TASK 2: Wire Bounties into CrewCallPage

Replace the 7 hardcoded bounties in `CrewCallPage.tsx` with live data from the `bounties` table:

1. **Fetch bounties** from Supabase where `category = 'hexisle_engineering'` and `status != 'cancelled'`
2. **Add Claim button** on each bounty card:
   - Check if user already has a claim (disable if so)
   - Create `bounty_claims` row with role_level based on slot availability (first = primary, second = secondary, third = backup)
   - Show current claimants on the card
3. **Add Submit button** for claimants:
   - Text field for submission notes
   - URL field for submission link (Google Drive, GitHub, etc.)
   - Updates claim status to 'submitted'
4. **Add Review section** (admin only):
   - Show submitted claims
   - STAMP rating slider (1-5)
   - Approve/Reject buttons
   - On approve: update claim status, award Credits/Marks/XP to user, check for Process Pioneer
5. Keep the existing bounty card UI — just wire it to real data instead of hardcoded objects

---

## TASK 3: Crew Call → OOB Auto-Dispatch

When a new crew is created (in `CrewNewPage.tsx` or wherever crews INSERT happens):

1. **Auto-create an OOB dispatch item**:
   - Insert into `outbound_dispatch`:
     - `title: 'Crew Forming: ${crewName} — ${focus}'`
     - `type: 'crew_call'`
     - `status: 'stamped'` (auto-approved for crew calls)
     - `content_body`: Generated from crew details — name, focus, city, slots remaining
     - `channels: ['reddit', 'discord']` (default social channels)
     - `tags: ['crew_call', 'help_wanted', crew.focus]`
   - This feeds into the existing pg_cron `process-scheduled-posts` job

2. **Auto-post format**:
   ```
   🤝 Crew Forming: [Crew Name]
   📍 [City, State]
   🎯 [Focus]
   👥 [X/12 members] — [Y slots remaining]
   
   Join: lianabanyan.com/crew/[id]/invite
   ```

3. When crew reaches 8 members (activation threshold), auto-create a follow-up dispatch:
   - `title: 'Crew Active: ${crewName} — accepting final members'`
   - `status: 'stamped'`

4. When crew completes (10+ orders fulfilled), auto-create celebration dispatch:
   - `title: 'Crew Complete: ${crewName} — Run #1 finished!'`

Wire these as database triggers or in the existing crew status update handlers.

---

## TASK 4: Coverage Minutes → Database

In `src/lib/discourse/coverageMinutes.ts` and `RoundTableContext.tsx`, the Coverage Minutes system currently uses mock data. Wire it to the database:

1. Create migration additions (add to the bounties migration file):

```sql
CREATE TABLE coverage_minute_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  balance_minutes NUMERIC(10,2) DEFAULT 0,
  total_earned NUMERIC(10,2) DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_transaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coverage_minute_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL, -- positive = earned, negative = spent
  transaction_type TEXT NOT NULL, -- 'earned_speaking', 'spent_voting', 'earned_referral', 'bonus'
  source_id UUID, -- reference to round_table, design_battle, etc.
  source_type TEXT, -- 'round_table', 'design_battle', 'bounty'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coverage_minute_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own account" ON coverage_minute_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update" ON coverage_minute_accounts FOR ALL USING (public.is_admin());

ALTER TABLE coverage_minute_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own transactions" ON coverage_minute_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert" ON coverage_minute_transactions FOR INSERT WITH CHECK (true);
```

2. Update `coverageMinutes.ts` to read/write from these tables instead of mock data
3. Update Design Battle voting to deduct 1 Coverage Minute per vote (currently mentioned in UI but not enforced)

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260322000011_bounties.sql` | Bounty tables + Coverage Minute tables + seed data |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/pages/CrewCallPage.tsx` | Replace hardcoded bounties with DB fetch, add claim/submit/review |
| `src/pages/CrewNewPage.tsx` or crew creation handler | Auto-create OOB dispatch on crew formation |
| `src/lib/discourse/coverageMinutes.ts` | Wire to coverage_minute_accounts table |
| `src/contexts/RoundTableContext.tsx` | Fetch real Coverage Minutes balance |
| `src/pages/DesignBattleArena.tsx` | Enforce Coverage Minute deduction on vote |

---

## DEPLOY CHECKLIST

1. `npx supabase db push --linked` (migration)
2. Verify 7 HexIsle bounties seeded
3. Test: Claim a bounty → see claim in DB
4. Test: Create a crew → see OOB dispatch item auto-created
5. Test: Coverage Minutes balance loads from DB
6. Deploy to Firebase

---

## SUCCESS CRITERIA

- [ ] Bounties load from database (not hardcoded)
- [ ] Users can claim bounties (primary/secondary/backup slots)
- [ ] Claimants can submit work (notes + URL)
- [ ] Admins can review + STAMP rate + approve/reject claims
- [ ] New crew creation auto-posts to OOB (Reddit/Discord)
- [ ] Crew activation (8 members) auto-posts follow-up
- [ ] Coverage Minutes tracked in database, not mock
- [ ] Design Battle voting deducts 1 Coverage Minute

---

**Every bounty tracked. Every crew call broadcast. Every minute counted.**

**FOR THE KEEP.**
