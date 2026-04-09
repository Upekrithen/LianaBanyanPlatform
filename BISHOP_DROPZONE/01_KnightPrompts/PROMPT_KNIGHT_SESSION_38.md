# Knight Session 38 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: eeccfad (Knight 37, clean tree + Bishop pages deployed)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

---

## TASK A: Political Expedition Full Build (Initiative #15 — "Power to the People")

### Context

This is a **Founder directive priority** — the #1 item in the queue. Initiative #15 is the political engagement arm of the cooperative. It is called "Power to the People" / "Political Expedition."

Key principles:
- This is NOT a PAC, NOT partisan, NOT lobbying. It's civic engagement infrastructure.
- Members learn how government works, track legislation, participate in local governance
- "Patriotic Interdependentalist" is the Founder's political philosophy — individual agency preserved within cooperative interdependence
- Coverage Minutes / Muffled Rule applies: speaking is gated by listening (3-min chunks, 180-min cap, 90-day expiry)
- Senate/Pnyx already exists at `/senate` and `/pnyx` — this builds the broader civic engagement layer

### What exists already:
- `src/pages/PowerToThePeoplePage.tsx` — check current state, it may be a stub or partial
- `src/pages/Senate.tsx` — the hex-hub voting chamber
- `src/pages/PatrioticInterdependentalist.tsx` — philosophy page
- Check for any other political/civic pages in the codebase

### What to build:

1. **Political Expedition Hub** (`/political-expedition` or enhance existing PowerToThePeoplePage):
   - Header: "Power to the People" with civic/flag iconography
   - Dashboard showing: Your District, Your Representatives, Active Legislation, Community Priorities
   - "Know Your Government" section — educational cards about local/state/federal structure
   - "Expedition Map" — visual representation of civic engagement pathways
   - Link to Senate (`/senate`) for cooperative governance voting
   - Link to Pnyx for debate/discussion

2. **Legislation Tracker** (sub-component or section):
   - Cards showing legislation items relevant to cooperatives, small business, community
   - Status badges: Introduced, Committee, Floor Vote, Passed, Signed, Vetoed
   - "Watch This Bill" button (uses demand signaling pattern — track interest)
   - Community impact assessment for each bill

3. **Civic Engagement Scorecard** (sub-component):
   - Track member civic participation: votes cast, meetings attended, letters written
   - XP earned for civic engagement
   - Streak tracking (similar to Beacon Streak in Demand Signaling)

4. **Coverage Minutes integration**:
   - Display remaining coverage minutes for political discussion
   - Muffled Rule indicator — must listen before speaking
   - 3-minute chunk timer for debate participation

5. **Add route** if new page, or enhance existing route
6. **Add sidebar navigation** entry under appropriate section

### Sample Data:
- 3-5 sample legislation items (cooperative tax credits, small business act, local zoning reform)
- Sample civic scorecard data
- Sample district info (generic — "District 7, Boise, ID")

### IMPORTANT:
- NO partisan content. No party names, no candidate endorsements.
- This is civic INFRASTRUCTURE, not political messaging.
- Use sample/placeholder data — wire to Supabase in a future session.

---

## TASK B: Main Square Supabase Wiring

### Context

Bishop built `src/pages/MainSquare.tsx` in this session with sample data. It needs real Supabase tables and wiring.

### Steps:

1. **Create migration** for `storefronts` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `name` (text, NOT NULL)
   - `description` (text)
   - `category` (text, CHECK in ('food_drink', 'crafts_making', 'services', 'digital', 'home_garden', 'health', 'education'), NOT NULL)
   - `owner_name` (text, NOT NULL)
   - `is_open` (boolean, default true)
   - `xp_score` (integer, default 0)
   - `member_since` (date, default CURRENT_DATE)
   - `template_id` (uuid, nullable — for future Store Templates)
   - `created_at` (timestamptz, default now())
   - `updated_at` (timestamptz, default now())

2. **Create migration** for `storefront_products` table:
   - `id` (uuid, PK)
   - `storefront_id` (uuid, FK to storefronts, NOT NULL)
   - `name` (text, NOT NULL)
   - `price` (numeric, NOT NULL)
   - `currency_type` (text, CHECK in ('credit', 'mark', 'joule'), default 'credit')
   - `is_featured` (boolean, default false)
   - `created_at` (timestamptz, default now())

3. **RLS policies**:
   - Storefronts: owner can CRUD own; all authenticated users can SELECT
   - Products: storefront owner can CRUD; all authenticated users can SELECT

4. **Seed data**: Insert the 8 sample stores from MainSquare.tsx as seed data

5. **Wire MainSquare.tsx**: Replace `SAMPLE_STOREFRONTS` with Supabase queries. Keep sample data as fallback (same pattern as DemandSignaling.tsx).

6. **Migration numbering**: Continue from 20260319000006 (Knight 37's latest).

---

## Standard Instructions

- **Build check**: `npm run build` before committing
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md`
- **Commits**: Separate commits for Task A and Task B
- **Deploy**: Deploy to Firebase when both tasks complete
- **Patterns**: Follow Session 37 patterns (demand_pedestals as reference for new tables)

## Priority

**Task A first** (Founder directive — Political Expedition), **then Task B** (Main Square wiring).

---

**FOR THE KEEP!**
