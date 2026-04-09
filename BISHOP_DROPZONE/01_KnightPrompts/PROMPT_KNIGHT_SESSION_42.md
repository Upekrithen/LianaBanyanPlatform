# Knight Session 42 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 41 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is now branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. Add "Powered by NotCents™" in the site footer if not already present. All currency displays throughout the platform should use the Anvil symbol where appropriate.

---

## TASK A: BandWagon System UI

### Context

The BandWagon system lets members back projects with Marks. Successful backing earns increased Service Allocation Authority (SAA). This is NOT investment return — it is earned authority to allocate cooperative resources based on demonstrated judgment. The system uses positive-only QA: promotes, doesn't ding. Absence of backing is sufficient signal.

### Steps:

1. **Create migration** `20260319000007_bandwagon_backings.sql` for `bandwagon_backings` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `project_id` (uuid, NOT NULL)
   - `marks_pledged` (numeric, NOT NULL)
   - `backed_at` (timestamptz, default now())
   - `status` (text, NOT NULL, CHECK in ('active', 'released', 'absorbed'))
   - `saa_earned` (numeric, default 0)

2. **Create migration** `20260319000008_taste_ranger_profiles.sql` for `taste_ranger_profiles` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL, UNIQUE)
   - `tier` (text, NOT NULL, CHECK in ('scout', 'ranger', 'curator', 'tastemaker', 'patron', 'luminary'), default 'scout')
   - `total_saa` (numeric, default 0)
   - `successful_backings` (integer, default 0)
   - `trust_chain_links` (jsonb, default '[]')

3. **RLS policies**:
   - `bandwagon_backings`: Users can SELECT/INSERT/UPDATE their own rows (`auth.uid() = user_id`). All authenticated users can SELECT aggregate project stats (a view or policy allowing reads on all rows is fine). No DELETE.
   - `taste_ranger_profiles`: Users can SELECT/INSERT/UPDATE their own profile (`auth.uid() = user_id`). All authenticated users can SELECT all profiles (public leaderboard). No DELETE.

4. **Seed data**: Insert 5 sample projects into a `bandwagon_projects` view or use existing `projects` table if available. Insert sample backing data across multiple users showing various statuses. Include at least one project with 100+ backings to demonstrate the First-100 Rule.

5. **Create `src/pages/BandWagon.tsx`** at route `/bandwagon`:

   **Header:**
   - "BandWagon — Back What You Believe In"
   - Subtitle explaining the BandWagon concept in one line

   **Active Projects Grid:**
   - Card grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
   - Each project card shows:
     - Project name and short description
     - Steward name (the person managing the project)
     - Funding progress bar: Backed Marks / Goal (use shadcn Progress component)
     - Time remaining (countdown or "X days left")
     - Number of backers with First-100 Rule indicator: if < 100 backers, show "Early Backer — proportional influence!" badge; if >= 100, show "100+ backers — influence pool full"
     - "Back This Project" button

   **Backing Dialog:**
   - Opens when "Back This Project" is clicked
   - Mark amount input (numeric, with Anvil symbol Ↄ‖ prefix)
   - Current balance display
   - "As You Wish" confirm button (this is the universal transaction confirmation phrase — use it exactly)
   - Cancel button

   **Your Backed Projects Section:**
   - Table or card list showing projects you've backed
   - Columns: Project Name, Marks Pledged (Ↄ‖), Backed Date, Status (Active / Succeeded / Failed)
   - Status badges: Active = blue, Succeeded = green, Failed = amber

   **Service Allocation Authority Display:**
   - Your current SAA level (numeric)
   - Allocation budget: how many Backed Marks you can allocate to projects
   - Visual meter or progress indicator

   **Taste Ranger Progression:**
   - Horizontal stepper or badge display: Scout → Ranger → Curator → TasteMaker → Patron → Luminary
   - Current tier highlighted, next tier shown with requirements to advance
   - Tooltips on each tier explaining what it unlocks

   **TasteMaker Trust Chain Visualization:**
   - Simple tree/graph showing recommendation chains (who recommended what to whom)
   - Max 5 links deep (attributed recommendation daisy chain: originator → first follower → chain follower)
   - Visual connectors between nodes

   **Business Swoop Indicator:**
   - If user is Patron or Luminary tier, show "Business Swoop Available" badge
   - Explanation: "You can fully fund a project using your accumulated allocation authority"

6. **Add route** to `App.tsx`: `/bandwagon` → `BandWagon`
7. **Add sidebar navigation** entry under appropriate section
8. **Footer**: Ensure "Powered by NotCents™" appears in the site footer. If there's a shared footer/layout component, add it there.

---

## TASK B: Steward Dashboard Wiring

### Context

The Steward manages campaigns end-to-end. They pledge their own Marks (skin in the game) and manage the tri-source funding model: Steward Pledged Marks + BandWagon Backed Marks + LB Allocation Pool. "The Pizza Oven" = if you heated the oven for one pizza, cook more while it's hot — Stewards batch-manage campaigns at lower marginal cost.

### Steps:

1. **Create migration** `20260319000009_steward_profiles.sql` for `steward_profiles` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL, UNIQUE)
   - `tier` (text, NOT NULL, CHECK in ('apprentice', 'journeyman', 'master_steward', 'grand_steward'), default 'apprentice')
   - `total_pledged` (numeric, default 0)
   - `total_released` (numeric, default 0)
   - `total_absorbed` (numeric, default 0)
   - `campaigns_completed` (integer, default 0)

2. **Create migration** `20260319000010_steward_campaigns.sql` for `steward_campaigns` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `steward_id` (uuid, FK to steward_profiles, NOT NULL)
   - `project_id` (uuid, NOT NULL)
   - `pledged_marks` (numeric, NOT NULL)
   - `backed_marks_received` (numeric, default 0)
   - `lb_pool_allocation` (numeric, default 0)
   - `status` (text, NOT NULL, CHECK in ('active', 'completed', 'failed'))
   - `deferred_compensation` (numeric, default 0)
   - `created_at` (timestamptz, default now())

3. **RLS policies**:
   - `steward_profiles`: Users can SELECT/INSERT/UPDATE their own profile (`auth.uid() = user_id`). All authenticated users can SELECT all profiles (public). No DELETE.
   - `steward_campaigns`: Steward can CRUD own campaigns (join on steward_profiles.user_id = auth.uid()). All authenticated users can SELECT all campaigns. No DELETE.

4. **Check if `src/pages/StewardDashboard.tsx` exists.** If yes, wire it to Supabase with the new tables. If no, create it at route `/steward-dashboard`.

5. **Steward Dashboard page content:**

   **Header:**
   - "Steward Dashboard — Your Campaigns, Your Commitment"

   **Steward Profile Card:**
   - Steward tier badge: Apprentice → Journeyman → Master Steward → Grand Steward
   - Total Pledged / Released / Absorbed stats
   - Campaigns completed count

   **Active Campaigns Table:**
   - Campaign name, project link
   - Pledged Marks (Ↄ‖) by steward
   - Backed Marks received from BandWagon backers
   - LB Pool allocation
   - Tri-Source Funding pie chart or stacked bar per campaign (Steward Pledged / BandWagon Backed / LB Pool)
   - Status badge
   - Deferred compensation amount (proportional to pledge ratio: pledge 80% → earn proportionally more, LB covers only 20%)

   **The Pizza Oven Section:**
   - Batch campaign view: campaigns that share infrastructure or can piggyback on each other
   - Visual grouping of related campaigns
   - "If you heated the oven for one pizza, cook more while it's hot" as the section tagline
   - Show marginal cost savings when batching

   **Deferred Compensation Calculator:**
   - Input: Pledged amount, total campaign budget, estimated success probability
   - Output: Expected deferred compensation
   - Formula display: compensation scales proportionally with commitment ratio
   - Note: "This is deferred compensation for services rendered — NOT investment return"

6. **Add route** to `App.tsx` if creating new: `/steward-dashboard` → `StewardDashboard`
7. **Add sidebar navigation** entry

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000007.
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
