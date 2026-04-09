# Knight Session 43 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 42 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: Creator Draft Pick System

### Context

The Creator Draft Pick system recruits makers and creators from external platforms (Instagram, Etsy, etc.) to seed the cooperative marketplace. The Founder has an Instagram "Factor-y" collection of 47+ unique creators (3D printers, lamp designers, tool makers, game designers). Key rule: a Cue Card invitation must be sent BEFORE the maker signs up — timestamp-verified attribution ensures fair referral credit.

The six-tier referral reward system ensures EVERYONE gets something forever:
- Pioneer (members 1-100): 10 Marks per successful recruit
- Vanguard (101-500): 5 Marks
- Pathfinder (501-2,000): 3 Marks
- Trailblazer (2,000-10,000): 2 Marks
- Guide (10,000-50,000): 1.5 Marks
- Ambassador (50,000+): 1 Mark (universal floor)

### Steps:

1. **Create migration** `20260319000011_creator_draft_picks.sql` for `creator_draft_picks` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `recruiter_user_id` (uuid, FK to auth.users, NOT NULL)
   - `creator_name` (text, NOT NULL)
   - `creator_handle` (text)
   - `platform` (text — 'instagram', 'etsy', 'tiktok', 'youtube', 'website', 'other')
   - `specialty` (text — '3d_printing', 'lamp_design', 'tool_making', 'game_design', 'jewelry', 'woodworking', 'ceramics', 'textiles', 'electronics', 'other')
   - `status` (text, NOT NULL, CHECK in ('undrafted', 'invited', 'onboarded', 'active'), default 'undrafted')
   - `cue_card_sent_at` (timestamptz, nullable)
   - `signed_up_at` (timestamptz, nullable)
   - `referral_tier` (text, CHECK in ('pioneer', 'vanguard', 'pathfinder', 'trailblazer', 'guide', 'ambassador'), nullable)
   - `marks_rewarded` (numeric, default 0)
   - `created_at` (timestamptz, default now())

2. **RLS policies**:
   - Recruiters can SELECT/INSERT/UPDATE their own picks (`auth.uid() = recruiter_user_id`). No DELETE.
   - All authenticated users can SELECT aggregate stats (total drafted, total onboarded, etc.).
   - Admin role can SELECT all rows.

3. **Seed data**: Insert 10 sample creators with generic names (do NOT use real Instagram handles). Distribute across specialties and statuses. Example:
   - "Alex Rivera" — 3D Printing, Instagram, status: active
   - "Sam Chen" — Lamp Design, Etsy, status: onboarded
   - "Jordan Mills" — Tool Making, Instagram, status: invited
   - ... etc. (10 total, mix of statuses)

4. **Create `src/pages/CreatorDraftPick.tsx`** at route `/creator-draft-pick`:

   **Header:**
   - "Creator Draft Pick — Recruit the Makers"
   - Subtitle: "Get Famous. Make Money. Do Good."

   **Creator Discovery Grid:**
   - Responsive card grid (1/2/3 columns)
   - Each card shows:
     - Creator name and handle
     - Specialty badge (with icon per category)
     - Platform icon (Instagram, Etsy, etc.)
     - Draft status badge: Undrafted (gray), Invited (yellow), Onboarded (blue), Active (green)
     - "Draft This Creator" button (only for undrafted creators)
   - Filter bar: by specialty, by platform, by status
   - Search by name/handle

   **Draft Action:**
   - Clicking "Draft This Creator" opens a dialog:
     - Creator details (pre-filled)
     - "Generate Cue Card" button — creates a timestamp-verified invitation
     - Warning text: "The Cue Card must be sent BEFORE the maker signs up. This timestamp is your proof of attribution."
     - "Send Invitation" → updates status to 'invited', sets `cue_card_sent_at`

   **Six-Tier Referral Rewards Display:**
   - Visual table or card strip showing all six tiers
   - Current platform member count highlighted to show which tier new recruits fall into
   - Each tier shows: tier name, member range, Marks reward amount (with Ↄ‖ symbol)
   - Bottom note: "Everyone gets something. Forever. Even at 50,000+ members, every successful recruit earns you 1 Mark."

   **"Know a Maker?" CTA Card:**
   - Prominent card/banner at the top or bottom
   - "Know a Maker? Invite Them." headline
   - Link to Cue Card Studio (or modal) for custom invitation creation
   - Brief explanation of the referral reward system

   **Drafting Leaderboard:**
   - Top 10 recruiters by successful onboards
   - Columns: Rank, Recruiter Name, Creators Drafted, Creators Onboarded, Total Marks Earned (Ↄ‖)
   - Your position highlighted if you're on the board

5. **Add route** to `App.tsx`: `/creator-draft-pick` → `CreatorDraftPick`
6. **Add sidebar navigation** entry

---

## TASK B: Crew Call Page Enhancement

### Context

Crew Call is the film production-style recruitment system where makers claim manufacturing roles based on existing expertise. The tagline: "We Need You To Do What You're Already Good At." Roles follow a Primary/Secondary/Backup commitment tier system that creates natural mentorship chains. A Process Pioneer is recognized as the first mover in a specific manufacturing category — this is documented in the IP ledger (not exclusionary, just establishes expert status).

### Steps:

1. **Create migration** `20260319000012_crew_call_roles.sql` for `crew_call_roles` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `role_name` (text, NOT NULL)
   - `category` (text, NOT NULL — '3d_printing', 'cnc', 'laser_cutting', 'slip_casting', 'sand_casting', 'sls_sla', 'injection_molding', 'desktop_extrusion')
   - `description` (text)
   - `commitment_tier` (text, NOT NULL, CHECK in ('primary', 'secondary', 'backup'))
   - `claimed_by` (uuid, FK to auth.users, nullable)
   - `process_pioneer` (uuid, FK to auth.users, nullable)
   - `claimed_at` (timestamptz, nullable)
   - `created_at` (timestamptz, default now())

2. **RLS policies**:
   - All authenticated users can SELECT all roles (public board).
   - Users can UPDATE roles to claim them (set `claimed_by = auth.uid()` where `claimed_by IS NULL`).
   - No DELETE. Admin can INSERT new roles.

3. **Seed data**: Insert 16+ roles across all manufacturing categories. Each category should have at least Primary and Secondary tiers. Example:
   - 3D Printing — Lead Printer (primary), Support Printer (secondary), Backup Printer (backup)
   - CNC — Lead Machinist (primary), Support Machinist (secondary)
   - Laser Cutting — Lead Operator (primary), Support Operator (secondary)
   - Slip Casting — Lead Caster (primary), Support Caster (secondary)
   - Sand Casting — Lead Caster (primary), Backup Caster (backup)
   - SLS/SLA — Lead Technician (primary), Support Technician (secondary)
   - Injection Molding — Lead Molder (primary), Support Molder (secondary)
   - Desktop Extrusion — Lead Extruder (primary), Backup Extruder (backup)

4. **Check if `src/pages/CrewCallPage.tsx` exists.** If yes, enhance it with the features below. If no, create it at route `/crew-call`.

5. **Crew Call page content:**

   **Banner:**
   - "We Need You To Do What You're Already Good At"
   - Subtitle: "Crew Call — Claim Your Role on the Production Floor"

   **Role Board:**
   - Grouped by manufacturing category (collapsible sections or tabs)
   - Each category section shows:
     - Category name with icon
     - Available roles as cards:
       - Role name
       - Commitment tier badge: Primary (gold), Secondary (silver), Backup (bronze)
       - Description of what the role entails
       - Claimed status: "Open" (green border) or "Claimed by [name]" (muted)
       - "Claim This Role" button (only on unclaimed roles)
       - Process Pioneer badge if someone holds it (star icon + "Process Pioneer: [name]")

   **Primary → Secondary → Backup Mentorship Visual:**
   - For each category, show the commitment chain:
     - Primary: "You're the lead. You train Secondary."
     - Secondary: "You learn from Primary. You train Backup."
     - Backup: "You learn from Secondary. You step in when needed."
   - Visual connector lines or arrows between tiers
   - Brief explanation: "This creates natural mentorship chains. Knowledge flows downward, readiness flows upward."

   **Process Pioneer Section:**
   - List of current Process Pioneers by category
   - "Be the first to claim a Primary role in a category and earn Process Pioneer recognition"
   - Pioneer badge design: star icon with category name
   - Note: "Process Pioneer = first-mover recognition in the IP ledger. Not exclusionary — establishes expert status."

   **Claim Dialog:**
   - Opens when "Claim This Role" is clicked
   - Shows role details, commitment expectations, category
   - "I commit to this role" checkbox
   - "Claim Role" confirmation button

6. **Add route** to `App.tsx` if creating new: `/crew-call` → `CrewCallPage`
7. **Add sidebar navigation** entry

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000011 (Session 42 used 000007-000010).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
