# Knight Session 47 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 46 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: Santa Ever After / Jesper Gift Delivery System

### Context

Santa Ever After is the gift-giving system where the purchaser is NOT the deliverer. Named after the Nordic gift-bringer Jesper. The key innovation: you buy a gift for someone, but a trusted third party ("Captain Collateral") physically delivers it. This separates generosity from credit-seeking.

**Key mechanics:**
- The Oops Code: 9-9-9-9 — a panic button the recipient can trigger if something goes wrong with the delivery
- Captain Collateral: a delivery agent who stakes their own Marks as a guarantee of successful delivery. Serves as 1/3 of the delivery oracle (sender confirms purchase, captain confirms delivery, recipient confirms receipt)
- Three-party verification: sender, captain, recipient must all confirm for the gift cycle to complete

### Steps:

1. **Create migration** `20260319000026_santa_gifts.sql` for `santa_gifts` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `sender_user_id` (uuid, FK to auth.users, NOT NULL)
   - `recipient_name` (text, NOT NULL)
   - `recipient_contact` (text, NOT NULL)
   - `recipient_user_id` (uuid, FK to auth.users, nullable)
   - `product_id` (uuid, nullable)
   - `gift_description` (text, NOT NULL)
   - `amount_paid` (numeric, NOT NULL)
   - `currency_type` (text, NOT NULL, CHECK in ('credits', 'marks', 'joules'), default 'credits')
   - `captain_user_id` (uuid, FK to auth.users, nullable)
   - `captain_marks_staked` (numeric, NOT NULL, default 0)
   - `status` (text, NOT NULL, CHECK in ('pending', 'assigned', 'in_transit', 'delivered', 'oops_code', 'completed', 'cancelled'), default 'pending')
   - `oops_code_used` (boolean, NOT NULL, default false)
   - `sender_confirmed` (boolean, NOT NULL, default false)
   - `captain_confirmed` (boolean, NOT NULL, default false)
   - `recipient_confirmed` (boolean, NOT NULL, default false)
   - `created_at` (timestamptz, NOT NULL, default now())
   - `assigned_at` (timestamptz, nullable)
   - `delivered_at` (timestamptz, nullable)
   - `completed_at` (timestamptz, nullable)

2. **Create migration** `20260319000027_captain_collateral_profiles.sql` for `captain_collateral_profiles` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL, UNIQUE)
   - `display_name` (text, NOT NULL)
   - `total_staked` (numeric, NOT NULL, default 0)
   - `total_released` (numeric, NOT NULL, default 0)
   - `deliveries_completed` (integer, NOT NULL, default 0)
   - `deliveries_failed` (integer, NOT NULL, default 0)
   - `success_rate` (numeric, NOT NULL, default 100)
   - `rating` (numeric, NOT NULL, default 5.0)
   - `is_active` (boolean, NOT NULL, default true)
   - `created_at` (timestamptz, NOT NULL, default now())

3. **RLS policies**:
   - `santa_gifts`:
     - Sender can SELECT/INSERT/UPDATE gifts where `sender_user_id = auth.uid()`
     - Captain can SELECT/UPDATE gifts where `captain_user_id = auth.uid()`
     - Recipient can SELECT gifts where `recipient_user_id = auth.uid()` AND status in ('delivered', 'completed')
     - Admin can CRUD all
   - `captain_collateral_profiles`:
     - Owner can SELECT/UPDATE where `user_id = auth.uid()`
     - All authenticated users can SELECT (to browse available captains)
     - Admin can CRUD all

4. **Seed data**: Insert 5 sample gifts at various stages:
   - 1 pending (no captain assigned yet)
   - 1 assigned (captain staked, in transit)
   - 1 delivered (awaiting recipient confirmation)
   - 1 completed (all three parties confirmed)
   - 1 oops_code (delivery went wrong)
   - Insert 3 captain profiles with varying stats (new captain, experienced captain, one with a failed delivery)

5. **Build `src/pages/SantaEverAfter.tsx`** at route `/santa`:

   **Header:**
   - "Santa Ever After — Giving Without Getting Caught" with Gift icon (use Lucide `Gift`)
   - Subtitle: "Buy a gift. Someone else delivers it. Everyone wins."

   **"Send a Gift" Flow:**
   - Step-by-step card wizard:
     1. Recipient: name + contact info
     2. Gift: select from products or describe a custom gift + amount
     3. Currency: Credits, Marks, or Joules
     4. Captain: browse available captains (show rating, success rate, deliveries completed) or let system auto-assign
     5. Confirm & Send
   - On submit, creates a santa_gifts row with status 'pending'

   **Active Gifts Tracker:**
   - Two tabs: "Gifts I've Sent" and "Gifts I'm Receiving"
   - Card per gift showing: recipient/sender name, gift description, status badge (color-coded), captain name (if assigned), three-party confirmation checkmarks (sender/captain/recipient)
   - Status progression visual: Pending → Assigned → In Transit → Delivered → Completed

   **Captain Collateral Dashboard:**
   - Only visible if the logged-in user is a registered captain (has a captain_collateral_profiles row)
   - Stats: total deliveries, success rate, Marks currently staked, rating
   - Active deliveries list: gifts assigned to you, with "Confirm Delivery" button
   - "Become a Captain" button (if not already one) — creates a captain profile

   **The Oops Code Section:**
   - Prominent card: "Something went wrong? Enter 9-9-9-9"
   - Four-digit input styled as a security code entry
   - Triggers status change to 'oops_code' and alerts the sender + admin
   - Only available to recipients of in-transit or delivered gifts

   **"How It Works" Section:**
   - Collapsible explainer:
     - "You buy the gift — someone else delivers it"
     - "Captain Collateral stakes their own Marks as a guarantee"
     - "Three-party verification: you confirm purchase, captain confirms delivery, recipient confirms receipt"
     - "The Oops Code (9-9-9-9) is the panic button — use it if anything goes wrong"

6. **Add route** to `App.tsx`: `/santa` → `SantaEverAfter` (lazy loaded)
7. **Add sidebar navigation** entry

---

## TASK B: Node Captain Production System

### Context

Node Captains are local production campaign managers. They fund production runs using Backed Marks (which are collateralized by Joules held by the cooperative). They manage the end-to-end process: sourcing materials, coordinating makers, quality control, and delivery. The Cost+20% floor ensures all producers are fairly compensated.

The STAMP system: clients or bounty sponsors must formally sign off on quality before XP is awarded — no self-rating allowed.

### Steps:

1. **Create migration** `20260319000028_node_captain_profiles.sql` for `node_captain_profiles` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL, UNIQUE)
   - `node_name` (text, NOT NULL)
   - `node_location` (text, NOT NULL)
   - `bio` (text, nullable)
   - `campaigns_completed` (integer, NOT NULL, default 0)
   - `campaigns_active` (integer, NOT NULL, default 0)
   - `total_backed_marks_used` (numeric, NOT NULL, default 0)
   - `joules_collateralizing` (numeric, NOT NULL, default 0)
   - `total_units_produced` (integer, NOT NULL, default 0)
   - `average_quality_score` (numeric, NOT NULL, default 0)
   - `status` (text, NOT NULL, CHECK in ('active', 'inactive', 'probation'), default 'active')
   - `created_at` (timestamptz, NOT NULL, default now())

2. **Create migration** `20260319000029_production_campaigns.sql` for `production_campaigns` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `captain_user_id` (uuid, FK to auth.users, NOT NULL)
   - `product_name` (text, NOT NULL)
   - `product_description` (text, NOT NULL)
   - `units_target` (integer, NOT NULL)
   - `units_completed` (integer, NOT NULL, default 0)
   - `cost_per_unit` (numeric, NOT NULL)
   - `price_per_unit` (numeric, NOT NULL) — must be >= cost_per_unit * 1.20 (C+20 floor)
   - `backed_marks_allocated` (numeric, NOT NULL, default 0)
   - `joules_backing` (numeric, NOT NULL, default 0)
   - `quality_checkpoints` (jsonb, NOT NULL, default '[]')
   - `status` (text, NOT NULL, CHECK in ('planning', 'funded', 'in_production', 'quality_check', 'completed', 'cancelled'), default 'planning')
   - `started_at` (timestamptz, nullable)
   - `completed_at` (timestamptz, nullable)
   - `created_at` (timestamptz, NOT NULL, default now())

3. **Create migration** `20260319000030_production_stamps.sql` for `production_stamps` table (STAMP verification):
   - `id` (uuid, PK, default gen_random_uuid())
   - `campaign_id` (uuid, FK to production_campaigns, NOT NULL)
   - `stamper_user_id` (uuid, FK to auth.users, NOT NULL) — the person verifying quality (NOT the producer)
   - `units_verified` (integer, NOT NULL)
   - `quality_score` (numeric, NOT NULL, CHECK (quality_score >= 1 AND quality_score <= 5))
   - `notes` (text, nullable)
   - `xp_awarded` (numeric, NOT NULL, default 0)
   - `created_at` (timestamptz, NOT NULL, default now())

4. **RLS policies**:
   - `node_captain_profiles`: Owner can SELECT/UPDATE own. All authenticated can SELECT (browse captains). Admin CRUD all.
   - `production_campaigns`: Captain can CRUD own campaigns (`captain_user_id = auth.uid()`). All authenticated can SELECT (browse campaigns). Admin CRUD all.
   - `production_stamps`: Stamper can INSERT where `stamper_user_id = auth.uid()`. All authenticated can SELECT. No UPDATE/DELETE (immutable verification).

5. **Seed data**:
   - 3 node captain profiles: one active veteran (5 campaigns completed), one new (0 campaigns), one on probation
   - 4 production campaigns: 1 planning, 1 in_production, 1 quality_check, 1 completed
   - 3 stamps for the completed campaign with varied quality scores

6. **Build `src/pages/NodeCaptain.tsx`** at route `/node-captain`:

   **Header:**
   - "Node Captain — Pick Up The Tab" with Anchor icon (use Lucide `Anchor`)
   - Subtitle: "Fund production. Manage campaigns. Build the local economy."

   **How a Captain Funds Production:**
   - Visual explainer card:
     - "Captain secures Backed Marks (collateralized by cooperative-held Joules)"
     - "Backed Marks fund the production run at Cost+20% pricing"
     - "STAMP verification ensures quality before XP is awarded"
     - Arrow flow: Joules → Back Marks → Fund Campaign → Produce → STAMP → XP

   **Active Production Runs:**
   - Cards per campaign showing: product name, units target vs completed (progress bar), cost/price breakdown, status badge, quality checkpoints
   - C+20 breakdown visual per campaign:
     - Base cost: $X
     - C+20 price: $X * 1.20
     - Split: operational / steward / Gleaner's Corner

   **Production Queue:**
   - Table view: product name, units remaining, estimated completion, next quality checkpoint, captain name
   - Sortable by priority, completion date, units remaining

   **STAMP Verification Interface:**
   - For completed production batches awaiting verification
   - Form: select campaign, units verified, quality score (1-5 slider), notes
   - "Apply STAMP" button — creates a production_stamps row
   - Warning: "You cannot STAMP your own production runs"

   **"Become a Captain" Flow:**
   - If user is not a captain: application form with node name, location, bio
   - On submit, creates a node_captain_profiles row with status 'active'

   **Node Captains Directory:**
   - Grid of all active captains: name, location, campaigns completed, quality average, status badge

7. **Add route** to `App.tsx`: `/node-captain` → `NodeCaptain` (lazy loaded)
8. **Add sidebar navigation** entry

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000026 (Session 46 used 000021-000025).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
