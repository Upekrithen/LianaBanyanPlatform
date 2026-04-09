# Knight Session 41 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 40 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

---

## TASK A: Ghost World Store Integration (Ghost World Mall)

### Context

Ghost World is the risk-free practice realm where members can experiment without real currency at stake. It already exists at `/ghost-world` and `/ghost` (see `src/pages/GhostWorld.tsx`).

Key Ghost World rules:
- **"If it fits, it sits"** — the root lock (canonical phrase)
- **Time dilation**: 1 hour real time = 10 hours ghost time
- **Risk-free**: No real Credits, Marks, or Joules at stake — Ghost Credits only
- **Store placement**: Stores claim locations by sign-up order (`storefront.created_at ASC`) — first registered gets first pick

This task integrates Main Square storefronts into Ghost World as a practice shopping district.

### What to build:

1. **Create migration** for `ghost_world_locations` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `storefront_id` (uuid, FK to storefronts, NOT NULL, UNIQUE)
   - `zone` (text, NOT NULL, CHECK in ('market_row', 'artisan_alley', 'tech_quarter', 'food_court', 'garden_path', 'health_hub', 'academy_lane'))
   - `position_x` (integer)
   - `position_y` (integer)
   - `claimed_at` (timestamptz, default now())

2. **Create migration** for `ghost_transactions` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `storefront_id` (uuid, FK to storefronts)
   - `product_id` (uuid, FK to storefront_products, nullable)
   - `ghost_credits_spent` (numeric, NOT NULL)
   - `created_at` (timestamptz, default now())

3. **RLS policies**:
   - `ghost_world_locations`: All authenticated users can SELECT. Only the storefront owner can INSERT their own location (`storefront.user_id = auth.uid()`). No UPDATE/DELETE for now.
   - `ghost_transactions`: Users can SELECT/INSERT their own rows (`auth.uid() = user_id`). No UPDATE/DELETE.

4. **Seed data**: Insert ghost world locations for the 8 sample stores already seeded in `storefronts`, distributing them across zones:
   - market_row: 2 stores
   - artisan_alley: 2 stores
   - tech_quarter: 1 store
   - food_court: 1 store
   - garden_path: 1 store
   - health_hub: 1 store

5. **Create `src/pages/GhostWorldMall.tsx`** at route `/ghost-world/mall`:

   **Map View:**
   - 2D visual map of the Ghost World commercial district
   - Seven named zones rendered as distinct colored areas on the map (use CSS grid or SVG — check codebase for existing map patterns)
   - Zone labels: Market Row, Artisan Alley, Tech Quarter, Food Court, Garden Path, Health Hub, Academy Lane
   - Store locations shown as clickable tiles within their zones
   - Each tile shows: store name, category icon, open/closed badge
   - Stores arranged within zones by `claimed_at` ASC (first come, first placed)

   **Ghost Store Detail** (click a store tile):
   - Modal or slide-out panel showing the store's full product catalog
   - All products displayed with prices in Ghost Credits (mirror real prices but labeled as Ghost Credits)
   - "Practice Buy" button on each product — deducts from Ghost Credit wallet, inserts into `ghost_transactions`
   - "Make It Real" button — navigates to the actual store in Main Square (`/main-square` or storefront detail)
   - Purchase confirmation: "Ghost purchase complete! No real currency spent."

   **Ghost Credit Wallet:**
   - Displayed in the page header or sidebar
   - Every member starts with 1,000 Ghost Credits
   - "Refill Wallet" button — resets to 1,000 instantly, no cost, unlimited refills
   - Wallet balance is client-side state (or stored in localStorage) — this is practice currency, no need for server-side ledger beyond the transaction log
   - Running total deducted by summing `ghost_transactions` for display

   **Visual style:**
   - Ghost World aesthetic — slightly ethereal, muted/translucent color palette
   - Consistent with existing `GhostWorld.tsx` styling

6. **Add route** to `App.tsx`: `/ghost-world/mall` → `GhostWorldMall`
7. **Add navigation link** from existing Ghost World page to the Mall, and add sidebar entry under Ghost World section

---

## TASK B: Member Agreement Page

### Context

Bishop wrote a full Member Agreement draft at `BISHOP_DROPZONE/MEMBER_AGREEMENT_DRAFT.md`. This task builds it as a proper, interactive legal document page with acceptance tracking.

### Steps:

1. **Create migration** for `member_agreement_acceptances` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `agreement_version` (text, NOT NULL)
   - `accepted_at` (timestamptz, default now())
   - `ip_address` (text, nullable)

2. **RLS policies**:
   - Users can SELECT their own acceptance records (`auth.uid() = user_id`)
   - Users can INSERT their own acceptance records (`auth.uid() = user_id`)
   - No UPDATE or DELETE (acceptance is permanent record)

3. **Read `BISHOP_DROPZONE/MEMBER_AGREEMENT_DRAFT.md`** for the full agreement content to embed in the component.

4. **Create `src/pages/MemberAgreement.tsx`** at route `/member-agreement`:

   **Layout:**
   - Two-column on desktop: sticky Table of Contents sidebar (left) + scrollable agreement content (right)
   - Single column on mobile: collapsible ToC at the top, then content below
   - Clean, readable typography — legal document feel but not intimidating

   **Table of Contents:**
   - Auto-generated from section headings in the agreement
   - Each entry is an anchor link that smooth-scrolls to the section
   - Active section highlighted as user scrolls (intersection observer)
   - Collapsible on mobile with a "Table of Contents" toggle

   **Agreement Content:**
   - Render the full markdown content from the draft file
   - Each major section as a distinct block with clear headings and adequate spacing
   - Anchor IDs on each section for ToC linking
   - Version number displayed at the top: "Member Agreement v1.0"
   - Effective date displayed

   **Acceptance Section** (bottom of the agreement):
   - Checkbox: "I have read and understand this Member Agreement"
   - Checkbox must be checked to enable the confirmation button
   - "As You Wish" button (the canonical transaction confirmation phrase) — disabled until checkbox is checked
   - On click: INSERT into `member_agreement_acceptances` with `agreement_version = '1.0'`
   - After acceptance: show confirmation message "Welcome to the cooperative. Your acceptance has been recorded."
   - If user has already accepted this version (check on page load), show "You accepted this agreement on [date]" instead of the checkbox/button

   **Print styles:**
   - `@media print` CSS: hide sidebar, hide acceptance section, show full content in single column
   - Clean, professional print output

5. **Add route** to `App.tsx`: `/member-agreement` → `MemberAgreement`
6. **Add sidebar navigation** entry — likely under Settings or Legal section

---

## Migration Numbering

Continue sequentially from Knight 40's latest migration number. Check `supabase/migrations/` for the current highest number before creating new files.

## Standard Instructions

- **Build check**: `npm run build` before committing
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md`
- **Commits**: Separate commits for Task A and Task B
- **Deploy**: Deploy to Firebase when both tasks complete
- **Patterns**: Follow existing codebase patterns. Check `GhostWorld.tsx` for Ghost World styling conventions. Check `DemandSignaling.tsx` for Supabase-with-fallback pattern.

## Priority

**Task A first** (Ghost World Mall), **then Task B** (Member Agreement page).

---

**FOR THE KEEP!**
