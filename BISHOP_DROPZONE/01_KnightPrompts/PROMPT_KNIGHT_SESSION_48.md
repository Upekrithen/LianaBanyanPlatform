# Knight Session 48 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 47 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: Star Chamber Governance System

### Context

The Star Chamber is the platform's moderation and governance system featuring four AI judges. It handles disputes, complaints, rule violations, and appeals. Each case is analyzed independently by three AI personas, with a fourth serving as final arbiter when the first three disagree. The system has potential as a standalone SaaS product ("SCaaS" — Star Chamber as a Service, $5-$500/mo pricing tiers).

**The Four AI Judges:**
- **Oracle**: Predictive analysis and pattern detection. Looks at historical data to forecast outcomes and identify recurring issues.
- **Morpheus**: Member behavior modeling and risk assessment. Analyzes the behavioral profile of involved parties.
- **Red Queen**: Rule enforcement and compliance checks. Strictly evaluates against the cooperative's bylaws and policies.
- **Dredd**: Final arbitration. Only activates when Oracle, Morpheus, and Red Queen cannot reach consensus. Dredd's word is law (subject to Founder override).

### Steps:

1. **Check if** `src/pages/StarChamber.tsx` **already exists.** If it does, enhance it with the features below. If not, create it.

2. **Create migration** `20260319000031_star_chamber_cases.sql` for `star_chamber_cases` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `case_number` (serial, UNIQUE) — human-readable case number
   - `case_type` (text, NOT NULL, CHECK in ('dispute', 'complaint', 'violation', 'appeal'))
   - `title` (text, NOT NULL)
   - `complainant_user_id` (uuid, FK to auth.users, nullable)
   - `respondent_user_id` (uuid, FK to auth.users, nullable)
   - `description` (text, NOT NULL)
   - `evidence` (jsonb, NOT NULL, default '[]') — array of evidence items with type, description, url
   - `oracle_analysis` (text, nullable)
   - `morpheus_analysis` (text, nullable)
   - `red_queen_analysis` (text, nullable)
   - `dredd_verdict` (text, nullable) — only populated when the three disagree
   - `recommended_action` (text, nullable)
   - `final_action` (text, nullable) — set by admin or Founder override
   - `founder_override` (boolean, NOT NULL, default false)
   - `founder_override_reason` (text, nullable)
   - `severity` (text, NOT NULL, CHECK in ('low', 'medium', 'high', 'critical'), default 'medium')
   - `status` (text, NOT NULL, CHECK in ('open', 'under_review', 'analysis_complete', 'verdict_reached', 'closed', 'appealed'), default 'open')
   - `created_at` (timestamptz, NOT NULL, default now())
   - `resolved_at` (timestamptz, nullable)

3. **RLS policies**:
   - Complainant can SELECT cases where `complainant_user_id = auth.uid()`
   - Respondent can SELECT cases where `respondent_user_id = auth.uid()`
   - Admin can CRUD all cases
   - No public access to any case data

4. **Seed data**: Insert 5 sample cases:
   - 1 dispute (two members disagree on a bounty completion — status: verdict_reached, all four judges weighed in)
   - 1 complaint (member reports poor quality from a producer — status: under_review, Oracle and Morpheus have analyzed)
   - 1 violation (member attempted to self-STAMP — status: analysis_complete, Red Queen flagged it)
   - 1 appeal (member appealing a previous verdict — status: open)
   - 1 closed case with Founder override (demonstrates the override mechanism)

5. **Build `src/pages/StarChamber.tsx`** at route `/star-chamber`:

   **Header:**
   - "Star Chamber v9.7" with Scale icon (use Lucide `Scale`)
   - Subtitle: "Justice, Analyzed. Fairness, Enforced."

   **Four AI Judges Panel:**
   - Four cards in a row, each representing a judge:
     - **Oracle** (purple accent): Eye icon, "Pattern Detection & Prediction"
     - **Morpheus** (blue accent): Brain icon, "Behavior Modeling & Risk"
     - **Red Queen** (red accent): Crown icon, "Rule Enforcement & Compliance"
     - **Dredd** (dark/gold accent): Gavel icon, "Final Arbitration"
   - Each card shows: cases analyzed count, agreement rate with other judges, average time to analysis

   **Active Cases List:**
   - Table with columns: Case #, Type (badge), Title, Severity (color-coded), Status (badge), Filed date, Parties
   - Filters: by type, by severity, by status
   - Sort by: date, severity, status
   - Click a row to open Case Detail

   **Case Detail View** (modal or inline expansion):
   - Case header: number, type badge, severity badge, status badge
   - Description section
   - Evidence section: list of evidence items
   - AI Analysis panel — four columns/tabs:
     - Oracle's analysis (or "Awaiting analysis" placeholder)
     - Morpheus's analysis
     - Red Queen's analysis
     - Dredd's verdict (grayed out if not needed, or "Consensus reached — Dredd not required")
   - Recommended Action card
   - Final Action card (if set)
   - Founder Override indicator (if applicable, with reason)
   - Timeline: chronological progression of the case

   **File a Case Form:**
   - Case type selector: Dispute / Complaint / Violation / Appeal
   - Title (text input)
   - Description (textarea)
   - Respondent (user search/select, optional)
   - Evidence upload (description + optional URL, add multiple)
   - Severity self-assessment (low/medium/high/critical — subject to AI adjustment)
   - Submit button

   **Verdict History:**
   - List of closed cases with final verdicts
   - Stats: total cases resolved, average resolution time, override rate

   **SCaaS Teaser Section:**
   - Card at bottom: "Coming Soon: Star Chamber as a Service"
   - "Bring AI-powered governance to your cooperative, HOA, or organization"
   - "Pricing: $5/mo (community) to $500/mo (enterprise)"
   - "Join the waitlist" placeholder button

6. **Add route** to `App.tsx`: `/star-chamber` → `StarChamber` (lazy loaded)
7. **Add sidebar navigation** entry

---

## TASK B: C+20 Reciprocity Dashboard

### Context

C+20 (Cost Plus 20%) is the platform's universal pricing formula. Every product sold through the cooperative is priced at exactly 20% above cost. That 20% margin is split according to the platform's compensation model. This eliminates price gouging, ensures fair producer compensation, and creates transparent economics.

**Key concepts:**
- Cost+20% is the FLOOR — sellers set prices at or above this
- Gleaner's Corner split: 83.3% to creator, 13.3% to platform operations, 3.3% to Gleaner's Corner (community benefit fund)
- Toe-Dipping limits: per-product participation limits that prevent any single member from cornering supply
- Dollar-for-dollar margin sacrifice: the cooperative matches margin reduction with increased purchasing power for members
- The "20 Laws of C+20" are the canonical rules governing the system

### Steps:

1. **Create migration** `20260319000032_c20_pricing_examples.sql` for `c20_pricing_examples` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `product_name` (text, NOT NULL)
   - `category` (text, NOT NULL)
   - `base_cost` (numeric, NOT NULL)
   - `final_price` (numeric, NOT NULL)
   - `margin_amount` (numeric, NOT NULL) — the 20% portion
   - `creator_share` (numeric, NOT NULL) — 83.3% of margin
   - `platform_share` (numeric, NOT NULL) — 13.3% of margin
   - `gleaners_share` (numeric, NOT NULL) — 3.3% of margin
   - `steward_share` (numeric, NOT NULL, default 0) — if a Steward managed the campaign
   - `created_at` (timestamptz, NOT NULL, default now())

2. **RLS policies**:
   - All authenticated users can SELECT (educational/informational table)
   - Admin can CRUD all

3. **Seed data**: Insert 10 sample pricing examples across categories:
   - "Sarah's Sourdough Starter Kit" (food, $10 cost → $12 price)
   - "3D-Printed Phone Stand" (maker, $4 cost → $4.80 price)
   - "Hand-Carved Wooden Spoon" (craft, $15 cost → $18 price)
   - "Guitar Lesson (1hr)" (service, $40 cost → $48 price)
   - "Organic Honey Jar (16oz)" (food, $8 cost → $9.60 price)
   - "Custom Pet Portrait" (art, $25 cost → $30 price)
   - "Resume Review Service" (service, $20 cost → $24 price)
   - "Handmade Leather Wallet" (craft, $35 cost → $42 price)
   - "Kids Coding Workshop (2hr)" (education, $30 cost → $36 price)
   - "HexIsle Terrain Set (6-pack)" (game, $18 cost → $21.60 price)
   - Calculate all share amounts accurately using the 83.3/13.3/3.3 split on the margin

4. **Build `src/pages/CPlus20Dashboard.tsx`** at route `/c-plus-20`:

   **Header:**
   - "C+20 Reciprocity — Fair Pricing, Transparent Economics" with Scale icon (use Lucide `Scale`)
   - Subtitle: "Every product at Cost Plus 20%. Every penny accounted for."

   **Interactive Calculator:**
   - Large, prominent card at the top
   - Input: "Enter product cost" (numeric input with Anvil symbol Ↄ‖)
   - Real-time calculation display:
     - Base Cost: Ↄ‖ X.XX
     - C+20 Price: Ↄ‖ X.XX (cost × 1.20)
     - Margin: Ↄ‖ X.XX (the 20%)
     - Split breakdown with visual bar:
       - Creator (83.3%): Ↄ‖ X.XX — green segment
       - Platform (13.3%): Ↄ‖ X.XX — blue segment
       - Gleaner's Corner (3.3%): Ↄ‖ X.XX — amber segment
   - Stacked horizontal bar chart showing the split proportions
   - Optional: "Add Steward fee" toggle that shows how Steward compensation adjusts the split

   **Real Examples Section:**
   - Grid of cards, one per seeded example
   - Each card: product name, category badge, cost → price arrow, margin breakdown pie chart (small)
   - Click to expand and see full split amounts

   **"20 Laws of C+20" Accordion:**
   - Numbered accordion list, 1-20
   - Each law has a title and a 1-2 sentence explanation
   - Use placeholder text for laws not yet fully defined — mark them as "Details forthcoming"
   - If the 20 Laws are documented in the academic papers or vault, pull from there. Otherwise use these starters:
     1. The Floor: No product may be priced below Cost+20%
     2. Transparency: All cost components must be visible to the buyer
     3. The Gleaner's Share: 3.3% of every margin funds the Gleaner's Corner
     4. No Loss Leaders: Selling below cost to gain market share is prohibited
     5. Seller Sovereignty: Sellers set prices at or above the floor
     6. Cost Verification: Platform may audit cost claims for accuracy
     7. (Laws 7-20: "Details forthcoming — see academic paper for full specification")

   **Toe-Dipping Limits Explainer:**
   - Card with visual:
     - "Per-product participation limits prevent any single buyer from cornering supply"
     - Example: "If Sarah makes 50 sourdough starters, no single member can buy more than 10"
     - Sliding scale visual showing limit as a percentage of total supply

   **Dollar-for-Dollar Margin Sacrifice:**
   - Visual explainer:
     - "When the cooperative reduces its margin, that savings becomes YOUR increased purchasing power"
     - Example: "Cooperative reduces take from 13.3% to 10% → your credits stretch 3.3% further"
     - Before/after comparison card

   **Link to Academic Paper:**
   - Card: "Read the full academic paper: The 20 Laws of C+20 Reciprocity"
   - Link to the paper (check if it exists in the academic-papers directory; if so, link to it)

5. **Add route** to `App.tsx`: `/c-plus-20` → `CPlus20Dashboard` (lazy loaded)
6. **Add sidebar navigation** entry

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000031 (Session 47 used 000026-000030).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
