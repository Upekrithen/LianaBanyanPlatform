# Knight Build Prompt — Session 17: Delegation Protocol, XP Scoring, Trickle Onboarding, STAMP Verification
# FOR KNIGHT: Build the vouched-by delegation chain, XP accomplishment system, cohort onboarding, and STAMP sign-off

**Date:** March 14, 2026
**Source:** Bishop (Founder's delegation protocol + XP multiplicative scoring + controlled onboarding design)

---

## IMPORTANT: SEC Language Rules

Throughout ALL code, comments, UI text, and variable names:
- "investment return" → "earned allocation authority" / "Service Allocation Authority (SAA)"
- "collateral" → "allocation budget" / "backing authority"
- "profit" / "dividend" → "operational surplus" / "service margin"
- "equity" → "participation" / "service allocation"
- "invest" → "sponsor" / "contribute" / "back"
- "revenue share" → "deferred payment for design services rendered"

The cooperative OWNS Joules. Members earn authority to DIRECT them, not own them.

---

## Task 1: Vouched By / Recommended By Schema & UI

Create migration: `20260314000015_vouched_by_delegation.sql`

### Table: `delegation_actions`
```sql
CREATE TABLE IF NOT EXISTS public.delegation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL, -- references the crown letter/invitation
  actor_id UUID REFERENCES auth.users(id), -- person taking the action (may be NULL for external)
  actor_name TEXT, -- for non-platform actors
  actor_email TEXT, -- for non-platform actors
  action_type TEXT NOT NULL CHECK (action_type IN ('accept', 'vouch_for', 'recommend', 'pass_along', 'delegate_staff', 'delegate_protege', 'advisory')),
  target_name TEXT, -- who they're vouching for / recommending
  target_email TEXT,
  target_expertise TEXT, -- what skill/expertise they bring
  is_unknown_need BOOLEAN DEFAULT FALSE, -- "you'll also need a shipping expert"
  unknown_need_description TEXT, -- description of the discovered need
  parent_delegation_id UUID REFERENCES delegation_actions(id), -- chain tracking
  chain_depth INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE delegation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/steward full access" ON delegation_actions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'steward'))
);

CREATE POLICY "Actors see own actions" ON delegation_actions FOR SELECT USING (auth.uid() = actor_id);
```

### UI: Delegation Response Buttons

Add delegation response buttons to Crown Letter recipient view:
- **Accept** — recipient accepts the invitation directly
- **Vouch For** — recipient vouches for someone else (enters target name, email, expertise)
- **Recommend** — lighter endorsement, suggests someone who might be interested
- **Pass Along** — forwards the invitation without personal endorsement
- **Advisory** — "You'll also need a [role]" — flags an unknown need without nominating anyone

Each action creates a `delegation_actions` row with appropriate `action_type` and chain tracking via `parent_delegation_id`.

Display the delegation chain visually: who vouched for whom, depth of chain, any unknown needs discovered.

---

## Task 2: XP Score Schema & Display

Create migration: `20260314000016_xp_score_system.sql`

### Table: `xp_scores`
```sql
CREATE TABLE IF NOT EXISTS public.xp_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  bounties_completed INTEGER DEFAULT 0,
  average_accomplishment_score NUMERIC(3,2) DEFAULT 0.00,
  highest_single_xp INTEGER DEFAULT 0,
  founding_status BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE xp_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read xp scores" ON xp_scores FOR SELECT USING (true);
CREATE POLICY "System manage xp scores" ON xp_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'steward'))
);
```

### Table: `xp_transactions`
```sql
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_type TEXT NOT NULL DEFAULT 'bounty' CHECK (xp_type IN ('bounty', 'product', 'production')),
  bounty_id UUID, -- references the bounty (for bounty XP)
  bounty_points INTEGER, -- for bounty XP: bounty point value; for production XP: points per unit
  accomplishment_score NUMERIC(3,2) NOT NULL CHECK (accomplishment_score BETWEEN 0.5 AND 5.0),
  xp_earned INTEGER NOT NULL, -- computed: depends on xp_type (see formulas below)
  stamped_by UUID REFERENCES auth.users(id), -- client/sponsor who STAMP-verified
  stamp_timestamp TIMESTAMPTZ,
  -- Product creator XP fields:
  preorder_volume INTEGER, -- for product XP: number of preorders locked at production start
  unit_price NUMERIC(10,2), -- for product XP: price per unit
  production_run_id UUID, -- for production XP: links to the production run
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP FORMULAS BY TYPE:
-- bounty:     xp_earned = bounty_points * accomplishment_score
-- product:    xp_earned = unit_price * preorder_volume * (accomplishment_score / 5.0)
-- production: xp_earned = bounty_points * preorder_volume * (accomplishment_score / 5.0)
--   (for production, bounty_points = points per unit, preorder_volume = units stamped)

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own xp transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage xp transactions" ON xp_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'steward'))
);
```

### UI: XP Display Component

Create `src/components/profile/XPScoreDisplay.tsx`:
- Total XP displayed using **box notation** (see logic below)
- Bounties completed count
- Average accomplishment score (star rating or numeric)
- Highest single XP earned
- XP type breakdown: bounty XP vs. product XP vs. production XP
- Founding Status badge (if applicable)
- Tier color indicator (Bronze/Silver/Gold/Platinum/Diamond/Obsidian)

**Box Notation Display Logic:**
```typescript
function formatXPBox(totalXP: number): { display: string; tier: string; color: string } {
  if (totalXP >= 99_999_999) {
    return { display: 'Solid Box', tier: 'Generational', color: 'obsidian' };
  }
  const boxes = Math.floor(totalXP / 10_000);
  const remainder = totalXP % 10_000;
  if (boxes === 0) {
    return { display: totalXP.toLocaleString(), tier: 'Building', color: 'bronze' };
  }
  let tier: string;
  let color: string;
  if (boxes <= 9) { tier = 'Established'; color = 'silver'; }
  else if (boxes <= 99) { tier = 'Proven'; color = 'gold'; }
  else if (boxes <= 999) { tier = 'Exceptional'; color = 'platinum'; }
  else { tier = 'Legendary'; color = 'diamond'; }
  return {
    display: `Box [${boxes}] ${remainder.toLocaleString().padStart(4, '0')}`,
    tier,
    color
  };
}
```

**Tier Colors:**
- Bronze (0-9,999): no box yet, building phase
- Silver (Box [1]-[9]): established, first milestones
- Gold (Box [10]-[99]): proven creator/worker
- Platinum (Box [100]-[999]): exceptional achievement
- Diamond (Box [1000]-[9999]): legendary
- Obsidian (Solid Box, 99,999,999+): generational, maxed out

**Product Creator XP Path:**
- When `xp_type = 'product'`: XP = unit_price x preorder_volume x (accomplishment_score / 5.0)
- Quality score is a REDUCER (fraction of 5.0), not a direct multiplier
- Preorder volume locks at production start — cannot inflate post-production
- XP awarded only AFTER production complete AND STAMP-verified

**Production Labor XP Path:**
- When `xp_type = 'production'`: XP = bounty_points_per_unit x units_stamped x (accomplishment_score / 5.0)
- "bounty_points" field = points per unit; "preorder_volume" field = units stamped
- Quality score from QC inspection of manufactured output
- Workers who STAMP production runs earn XP alongside designers

Add XPScoreDisplay to member profile pages.

**IMPORTANT:** XP is SEPARATE from the five-category reputation system. XP = cumulative accomplishment metric. Reputation = behavioral quality metric. Both appear on profiles but are distinct systems.

---

## Task 3: Trickle Incentive Onboarding Flow

Create migration: `20260314000017_trickle_onboarding.sql`

### Table: `onboarding_cohorts`
```sql
CREATE TABLE IF NOT EXISTS public.onboarding_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_number INTEGER NOT NULL UNIQUE,
  max_members INTEGER NOT NULL DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'expanded', 'closed')),
  testing_goals_met BOOLEAN DEFAULT FALSE,
  expansion_trigger TEXT, -- 'time' or 'goals'
  expand_after_days INTEGER DEFAULT 3,
  next_cohort_size INTEGER DEFAULT 100,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expanded_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

ALTER TABLE onboarding_cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cohorts" ON onboarding_cohorts FOR SELECT USING (true);
CREATE POLICY "Admin manage cohorts" ON onboarding_cohorts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'steward'))
);
```

### Table: `cohort_members`
```sql
CREATE TABLE IF NOT EXISTS public.cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES onboarding_cohorts(id),
  is_founding_status BOOLEAN DEFAULT FALSE,
  has_testing_goals BOOLEAN DEFAULT FALSE,
  testing_goals_completed INTEGER DEFAULT 0,
  testing_goals_total INTEGER DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cohort_id)
);

ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own cohort membership" ON cohort_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage cohort members" ON cohort_members FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'steward'))
);
```

### UI: Onboarding Components

Create `src/pages/OnboardingStatusPage.tsx` or integrate into existing onboarding flow:
- **Active cohort member view:** "You're in the first [50]!" with celebration styling
- **Waitlist view:** "You're signed up — active testing begins when the next cohort opens"
- **Founding Status badge** on profiles for first cohort members (permanent designation, not a separate role)
- **Testing progress tracker** (X-ray Goggles view): shows testing_goals_completed / testing_goals_total
- Cohort expansion countdown or status indicator

---

## Task 4: STAMP Verification Component

Create `src/components/bounty/STAMPVerification.tsx`

### Requirements:
1. Modal/form for client/bounty sponsor to rate completed work
2. Accomplishment score: 0.5 to 5.0 with half-step increments (0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
3. Score display: visual stars or slider with numeric readout
4. XP calculation preview: "This bounty is worth [X] points. At score [Y], [member] earns [X * Y] XP"
5. "Sign Off" button that creates the STAMP (writes to xp_transactions)
6. Confirmation message: "Your STAMP awards [X] XP to [member name]"
7. **CRITICAL:** Cannot STAMP your own work. The `stamped_by` user must be different from the `user_id` on the xp_transaction. Enforce in UI (hide/disable button if viewer is the worker) AND in RLS policy.
8. Integrates with `xp_transactions` table and triggers update to `xp_scores` aggregate

---

## Task 5: POLLINATION — Innovation Count Update

Update ALL files containing innovation counts from **1,647 → 1,662**.

Search for these patterns and update:
- `"1,647"` → `"1,662"`
- `"1647"` → `"1662"`
- Any reference to total innovation count

Files likely needing updates (Knight should grep to find all):
- `package.json` description
- README files
- Landing page / about page components
- Any stats displays or dashboard widgets
- Supabase seed data
- Patent references
- Footer or dashboard stats

Also update any "Session 11B" references to include the latest batch info where appropriate.

---

## Task 6: dna_lock Entries for New Features

Create entries in the appropriate migration (can append to `20260314000017_trickle_onboarding.sql` or create a separate migration):

```sql
INSERT INTO dna_lock (feature_key, display_name, description, is_active) VALUES
  ('vouched_by_delegation', 'Vouched By / Recommended By', 'Crown letter delegation protocol with unknown needs discovery', true),
  ('xp_score_system', 'XP Score System', 'Multiplicative accomplishment scoring (bounty points x accomplishment score)', true),
  ('trickle_onboarding', 'Trickle Incentive Onboarding', 'Controlled cohort onboarding with Founding Status and testing goals', true),
  ('stamp_verification', 'STAMP Verification', 'Client/sponsor sign-off on completed work quality before XP award', true),
  ('founding_status', 'Founding Status', 'Permanent designation for first onboarding cohort members', true)
ON CONFLICT (feature_key) DO NOTHING;
```

**NOTE:** If `dna_lock` uses `parameter_key` instead of `feature_key`, adapt the column names to match the existing schema. Check the existing `dna_lock` table structure first.

---

## Task 7: Verify & Commit

- `npx tsc --noEmit` passes
- Innovation count = 1,662 everywhere
- All SEC-safe language verified
- Commit:

```
feat: delegation protocol, XP scoring, trickle onboarding, STAMP verification (Session 17)

- Create delegation_actions schema for vouched-by/recommended-by chain tracking
- Create XP score system with multiplicative accomplishment scoring
- Create trickle onboarding with cohorts, Founding Status, and testing goals
- Create STAMPVerification component for client sign-off on completed work
- Add dna_lock entries for all new features
- Update innovation count 1,647 → 1,662
- All SEC-safe language verified

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## DEPLOYMENT

Standard deploy process:
1. `npx supabase db push` (Bishop handles migrations — Knight creates files only)
2. `npm run build` — fix any TypeScript errors
3. `firebase deploy --only hosting` to all 8 targets
4. Verify at hexisle.com and other domains

---

## Notes for Knight

- Bishop has already pushed migrations through 000014. Knight creates 000015+ files, Bishop will push.
- Innovation count is NOW **1,662** (was 1,647 after Session 16). Update everywhere.
- "Founding Status" is a permanent badge, not a separate role. It's an attribute on the profile.
- XP is SEPARATE from the five-category reputation system. XP = cumulative accomplishment metric. Reputation = behavioral quality metric. Both appear on profiles but are distinct.
- STAMP cannot be self-applied. The `stamped_by` user must be different from the `xp_transaction` `user_id`. Enforce in BOTH UI and RLS.
- The delegation chain supports arbitrary depth via `parent_delegation_id` and `chain_depth`. Display this as a visual tree or chain.
- The `is_unknown_need` flag on delegation_actions is for the "Advisory" action type — when someone says "you'll also need a shipping expert" without nominating a specific person.
- Trickle onboarding doubles each cohort: 50 → 100 → 200 → 400. The `next_cohort_size` field on `onboarding_cohorts` controls this.

---

## References

- Crown Letters: check existing invitation/letter components in `src/components/`
- Bounty system: `src/components/bounty/*`
- Profile pages: `src/pages/ProfilePage.tsx` or similar
- DNA Lock: check existing `dna_lock` table schema in prior migrations
- BandWagon: `src/components/bandwagon/*`
- Existing cue cards: `src/components/cue-cards/*`
- SEC rules: MEMORY.md
- Founder Corrections: MEMORY.md

---

*Prepared by Bishop. March 14, 2026.*
*FOR THE KEEP.*
