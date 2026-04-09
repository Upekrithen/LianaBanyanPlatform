# Knight Session 44 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 43 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: XP Score Display System

### Context

XP is the platform's universal experience metric. It is aggregate and cumulative — it NEVER decreases. XP is earned, not given. The STAMP system (client/sponsor must formally sign off on quality score) prevents self-rating. All members start at reputation 100; XP adds on top as EXPERIENCE.

**XP Formulas:**
- Bounty XP = Accomplishment Score × Bounty Points (e.g., bounty 40 pts, score 3.5 = 140 XP)
- Product Creator XP = price × preorder_volume × (quality_score / 5.0) — quality as fraction ensures total is always LESS than price × volume
- Production Labor XP = bounty_points_per_unit × units_stamped × quality_fraction

**Box Notation Display:**
- Every 10,000 XP = 1 filled box (■)
- Remainder shown in brackets: [■■■]-[4200] = 34,200 XP
- Tier colors:
  - Bronze: 0–9,999 (amber-700)
  - Silver: 10,000–99,999 (slate-400)
  - Gold: 100,000–999,999 (yellow-400)
  - Platinum: 1,000,000–9,999,999 (blue-300)
  - Diamond: 10,000,000–99,999,999 (cyan-300)
  - Obsidian: 100,000,000+ (slate-800)

### Steps:

1. **Create migration** `20260319000013_xp_scores.sql` for `xp_scores` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL, UNIQUE)
   - `total_xp` (numeric, default 0)
   - `tier` (text, default 'bronze')
   - `bounty_xp` (numeric, default 0)
   - `creator_xp` (numeric, default 0)
   - `production_xp` (numeric, default 0)
   - `civic_xp` (numeric, default 0)
   - `last_updated` (timestamptz, default now())

2. **Create migration** `20260319000014_xp_events.sql` for `xp_events` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `event_type` (text, NOT NULL — 'bounty_complete', 'product_sale', 'production_stamp', 'civic_action')
   - `xp_earned` (numeric, NOT NULL)
   - `details` (jsonb)
   - `stamped_by` (uuid, FK to auth.users, nullable — who verified the quality)
   - `created_at` (timestamptz, default now())

3. **RLS policies**:
   - `xp_scores`: Users can SELECT their own row. All authenticated users can SELECT all rows (public leaderboard). Users can INSERT/UPDATE their own. No DELETE.
   - `xp_events`: Users can SELECT their own events. INSERT allowed (system/edge function will typically do this). No UPDATE/DELETE.

4. **Seed data**: Insert 20 sample XP entries across various tiers. Ensure at least:
   - 5 Bronze tier members (under 10K XP)
   - 5 Silver tier (10K–99K)
   - 4 Gold tier (100K–999K)
   - 3 Platinum tier (1M–9.9M)
   - 2 Diamond tier (10M–99M)
   - 1 Obsidian tier (100M+)
   - Include corresponding xp_events for each member

5. **Create `src/components/XPBoxDisplay.tsx`**:

   **Props:**
   - `xp` (number, required) — total XP value
   - `size` ('sm' | 'md' | 'lg', default 'md')
   - `showLabel` (boolean, default true) — show tier name label

   **Rendering:**
   - Calculate boxes: `Math.floor(xp / 10000)`
   - Calculate remainder: `xp % 10000`
   - Render filled boxes (■) in tier color, then remainder in brackets
   - Size variants:
     - sm: text-xs, box size 12px
     - md: text-sm, box size 16px
     - lg: text-base, box size 20px
   - Hover tooltip: exact XP number + tier name (e.g., "34,200 XP — Silver Tier")
   - Animated fill on mount: boxes fill in sequentially with a brief delay (CSS transition or framer-motion if available)
   - Tier color applied to boxes and label text

6. **Create `src/pages/XPLeaderboard.tsx`** at route `/xp-leaderboard`:

   **Header:**
   - "XP Leaderboard — Earned, Not Given"

   **Leaderboard Table:**
   - Columns: Rank, Member Name, XP (rendered via XPBoxDisplay), Tier, Top Accomplishment
   - Sortable by XP (default descending)
   - Paginated (20 per page)

   **Filters:**
   - Role filter: All, Creators, Stewards, Backers
   - Time filter: All Time, This Month, This Week
   - Search by member name

   **"How XP Works" Explainer Section:**
   - Collapsible accordion or card below the leaderboard
   - Three formula cards:
     - Bounty XP: "Accomplishment Score × Bounty Points"
     - Creator XP: "Price × Preorder Volume × (Quality Score / 5.0)"
     - Production XP: "Bounty Points Per Unit × Units Stamped × (Quality Score / 5.0)"
   - STAMP explanation: "Your client or bounty sponsor must formally sign off on your quality score before XP is awarded. You cannot self-rate."
   - "XP never decreases. It is always cumulative. Starting reputation: 100 for all members."
   - Founding Status callout: "First onboarding cohort gets a permanent Founding Status badge."

7. **Refactor existing XP displays**: Search the codebase for any inline XP displays (check `MainSquare.tsx` and any other pages that show XP or experience). Replace those inline displays with the new `XPBoxDisplay` component for consistency.

8. **Add route** to `App.tsx`: `/xp-leaderboard` → `XPLeaderboard`
9. **Add sidebar navigation** entry

---

## TASK B: Trickle Incentive Onboarding System

### Context

Trickle Incentive Onboarding is the controlled rollout strategy. The first 50 members are the active feedback cohort with full testing goals, X-ray Goggles (internal visibility tools), and Intercom access. All others can sign up but are NOT in the active feedback cohort until expansion. Expansion trigger: sooner of 3 days OR testing goals completion. Then expand to 100, and so on. Every tester's name is ascribed as Founding Status — permanent recognition.

### Steps:

1. **Create migration** `20260319000015_onboarding_cohorts.sql` for `onboarding_cohorts` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `cohort_number` (integer, NOT NULL, UNIQUE)
   - `max_members` (integer, NOT NULL)
   - `opened_at` (timestamptz, default now())
   - `expansion_trigger_met` (boolean, default false)
   - `goals_completion_pct` (numeric, default 0)

2. **Create migration** `20260319000016_onboarding_members.sql` for `onboarding_members` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `cohort_id` (uuid, FK to onboarding_cohorts, NOT NULL)
   - `founding_status` (boolean, default true)
   - `testing_goals` (jsonb, default '{"profile_complete": false, "browsed_main_square": false, "visited_3_stores": false, "used_demand_signaling": false, "sent_cue_card": false, "provided_feedback": false}')
   - `joined_at` (timestamptz, default now())
   - `goals_completed_at` (timestamptz, nullable)

3. **RLS policies**:
   - `onboarding_cohorts`: All authenticated users can SELECT. Admin can INSERT/UPDATE.
   - `onboarding_members`: Users can SELECT/UPDATE their own row (`auth.uid() = user_id`). Admin can SELECT all. No DELETE.

4. **Seed data**: Insert cohort 1 (max_members: 50, opened_at: now). Insert 8 sample onboarding members with varying testing goal completion levels. At least 2 should have all goals complete.

5. **Create `src/pages/TrickleOnboarding.tsx`** at route `/onboarding/trickle`:

   **Admin View** (check user role — if admin, show management panel):

   - **Cohort Status Card:**
     - Current cohort number and size
     - Members enrolled: X / 50
     - Overall goals completion: Y%
     - Expansion trigger: "Expands when: sooner of 3 days from open OR testing goals 100% complete"
     - Time since cohort opened (countdown to 3-day auto-expand)
     - "Expand to 100" button — locked until trigger conditions met. Show which condition is closer.

   - **Member Progress Table:**
     - Columns: Member Name, Joined Date, Goals Completed (X/6), Progress Bar, Status
     - Each row expandable to show individual goal checkboxes
     - Color coding: all complete = green row, in progress = default, no progress = amber

   - **Testing Goals Checklist** (the standard goals every tester must complete):
     - Signed up and completed profile
     - Browsed Main Square
     - Visited at least 3 stores
     - Used Demand Signaling
     - Sent or received a Cue Card
     - Provided feedback via Intercom

   **Member View** (non-admin, enrolled tester):

   - **"You're in the First 50!" Celebration Card:**
     - Confetti-style visual or celebratory badge
     - "Welcome, Founding Member. Your feedback shapes everything."
     - Founding Status badge preview (what it will look like permanently)

   - **Your Testing Goals:**
     - Interactive checklist matching the 6 goals above
     - Each goal is a link/button that navigates to the relevant feature (e.g., "Browse Main Square" links to `/main-square`)
     - Progress ring or bar: X/6 complete
     - When all 6 complete: celebration animation + "All goals complete! You've earned your Founding Status."

   - **Tools Available:**
     - X-ray Goggles: "See behind the curtain — internal metrics and system state visible to you"
     - Intercom: "Direct line to the team — report bugs, suggest features, ask questions"
     - Fly on the Wall: "Watch how other testers interact (anonymized)"
     - Under the Hood: "Technical details about how the platform works"
     - Each tool links to its respective page/feature

   - **Feedback Submission Form:**
     - Text area for general feedback
     - Category dropdown: Bug Report, Feature Suggestion, Usability Issue, Praise, Other
     - Priority: Low, Medium, High
     - Submit button
     - Previous feedback list (your submissions)

6. **Add route** to `App.tsx`: `/onboarding/trickle` → `TrickleOnboarding`
7. **Add sidebar navigation** entry (admin section for admin view, member section for member view)

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000013 (Session 42 used 000007-000010, Session 43 used 000011-000012).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
