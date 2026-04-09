# Knight Session 37 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: 92d117a (Knight 36, clean tree)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

---

## TASK A: Demand Signaling + Pledged Mark Voting — Supabase Wiring

### Context

- **Demand Signaling** exists at `/demand-signaling` — lets members signal interest in products/services before they exist.
- **Pledged Mark Voting** is the generalized escrow voting system where members pledge their own Marks on governance decisions for commitment-weighted influence.
- Both systems need to be wired to Supabase (currently may be UI-only or using local state).
- The BandWagon system backs projects with Marks; project success earns increased Service Allocation Authority.
- Stewards pledge their own Marks (skin in the game) to manage campaigns end-to-end.
- Pledged Marks are escrowed per-project, released on success + proportional surplus, absorbed on failure.

### Steps

1. **Create Supabase migration for `demand_signals` table** (if it does not already exist):
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `product_id` (uuid, NOT NULL)
   - `signal_type` (text, CHECK in ('want', 'need', 'would_buy'), NOT NULL)
   - `quantity` (integer, default 1)
   - `created_at` (timestamptz, default now())
   - `updated_at` (timestamptz, default now())

2. **Create Supabase migration for `pledged_mark_votes` table**:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `proposal_id` (uuid, NOT NULL)
   - `marks_pledged` (numeric, NOT NULL, CHECK > 0)
   - `vote_direction` (text, CHECK in ('for', 'against'), NOT NULL)
   - `created_at` (timestamptz, default now())
   - `status` (text, CHECK in ('active', 'released', 'absorbed'), default 'active')

3. **Add RLS policies for both tables**:
   - Users can SELECT, INSERT, UPDATE, DELETE their own rows (`auth.uid() = user_id`).
   - Aggregate counts (total signals per product, total pledged per proposal) should be publicly readable. Consider a view or RPC function for aggregates.
   - Enable RLS on both tables.

4. **Wire the Demand Signaling UI** at `/demand-signaling` to read/write from Supabase:
   - Follow established patterns in the codebase (grep for `supabase.from(` to find examples).
   - Replace any local state or mock data with real Supabase queries.

5. **Wire the Pledged Mark Voting UI** to Supabase:
   - Same approach — find the existing component, replace local/mock data with Supabase reads/writes.
   - Ensure vote status transitions (active -> released/absorbed) are handled.

6. **Migration numbering**: Continue from the latest migration number. Check `supabase/migrations/` for the highest existing number. Latest known: `20260319000003`.

---

## TASK B: Boise Business Cards Worked Example Page

### Context

A full worked example document lives at `BISHOP_DROPZONE/WORKED_EXAMPLE_BOISE_BUSINESS_CARDS.md`. It walks through the complete cooperative economy cycle using a Boise business card production run as the narrative thread. Read that file for the full content and numbers.

### The Seven Steps

1. **Buy Joules** — Surplus storage with "forever stamp" mechanic (locks exchange rate at purchase time)
2. **Back Marks** — Joule-collateralized Backed Marks allocated for project funding
3. **Create Campaign** — Node Captain creates a production campaign
4. **Community Response** — Members signal demand, BandWagon backing flows in
5. **Production Triggers** — Preorder threshold met, production begins
6. **Cards Ship / Everyone Paid** — Delivery, STAMP verification, XP awards
7. **Pizza Oven Effect** — Reuse heated capacity for more campaigns at lower marginal cost

### Currency Reference

- **Credits**: Purchased with fiat, $1 = 1 Credit, universal use, closed-loop (no cash-out)
- **Marks**: Effort-debt currency, restricted to essentials. Three subtypes:
  - *Earned Marks* — from differential only (NEVER granted as gifts)
  - *Backed Marks* — Joule-collateralized, spendable ONLY on project sponsorship
  - *Founder Marks* — giveaways (distinct from earned)
- **Joules**: Surplus storage. LB OWNS the Joules; members earn authority to direct them.
- All three equal value: 1 Credit = 1 Mark = 1 Joule
- **Pricing**: Sellers set prices. Market discovery. Cost+20% floor.
- **Currency symbol**: The Anvil (special symbol) is already implemented in `CreditSymbol.tsx` — use it for all currency displays.

### Steps

1. **Create a new page component** (e.g., `src/pages/WorkedExamplePage.tsx` or `src/pages/BoiseBusinessCardsExample.tsx`).

2. **Step-by-step walkthrough UI** with Previous/Next navigation between the 7 steps:
   - Use shadcn/ui Card, Button, Badge components.
   - Step indicator bar at the top showing progress (1 of 7, 2 of 7, etc.).

3. **Each step should include**:
   - Clear title and narrative description (pull from the markdown).
   - Visual representation — use cards, number callouts, or simple flow diagrams.
   - A ledger/table showing the financial state at that step (who holds what, how much moved).
   - Use the `CreditSymbol` component wherever currency amounts appear.

4. **Running ledger sidebar or bottom bar** showing cumulative state across all steps:
   - Track Joules held, Backed Marks allocated, Credits spent, Marks earned, XP awarded.
   - Update as user navigates forward/backward.

5. **Add the route** to the app router (check `src/App.tsx` or wherever routes are defined).

6. **Mobile-responsive** — test at mobile breakpoints. The step navigator should work on small screens.

7. **Read the full worked example** at `BISHOP_DROPZONE/WORKED_EXAMPLE_BOISE_BUSINESS_CARDS.md` for all the specific numbers, names, and narrative content.

---

## Standard Instructions

- **Build check**: Run `npm run build` before committing to catch type errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with session summary.
- **Commits**: Descriptive messages. Separate commits for Task A and Task B.
- **Deploy**: Deploy to Firebase if both tasks complete cleanly.
- **Patterns**: Check how similar pages are structured before building new ones. Grep for related terms if anything is unclear.
- **useCanonicalStats**: Hook reads from Supabase `platform_canonical` table with DEFAULTS fallback — use this pattern for any stats display.

## Priority

**Task A first** (Supabase wiring is infrastructure), **then Task B** (page component is presentation).

---

**FOR THE KEEP!**
