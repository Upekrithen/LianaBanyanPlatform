# KNIGHT SESSION 89 — Housing: Mission TWO
**Bishop Session**: 028
**Date**: March 23, 2026
**Innovation Count**: 1,935 (no change)
**Base**: K88 Ghost World (in progress)

---

## MISSION

Build the cooperative housing system — Mission TWO ("Everyone Has Shelter"). Members pool resources to acquire properties, share short-term rental revenue to subsidize long-term housing, and track the Housing WaterWheel multiplier effect. This is the platform's answer to the housing crisis: cooperative acquisition, not individual speculation.

Mission Sequence: ONE (food) ✅ LIVE → **TWO (shelter) ← THIS BUILD** → THREE (transport) ✅ LIVE

---

## PREVIOUS SESSION

K88 built Ghost World: HexIsle SVG hex grid map, island renderer, building cards, storefront placement flow, island detail panel, map controls. Migration `20260323000019_ghost_world.sql` (3 tables: `ghost_world_islands`, `ghost_world_buildings`, `ghost_world_popups`). 4 seed islands.

---

## CONTEXT: WHAT EXISTS

These existing systems connect to housing:

| System | Route/Table | Relevance | Session |
|--------|-------------|-----------|---------|
| Storefronts | `/tools/storefront-builder`, `storefronts` | Property listings could be storefronts | K63/K80 |
| Commerce Engine | Full earn loop | Contribution payments, distribution | K80 |
| WaterWheel paper | Academic paper (6 scenarios) | Housing WaterWheel = Scenario 6 | Bishop 026 |
| Onboarding Credits | `onboarding_credits` | 3% Backed Marks from property contributions | K80/#1897 |
| Steward Agreements | `steward_agreements` | 2% steward allocation for property managers | K80 |
| LB Card | Stripe Issuing (pending) | Housing payments via LB Card | K76/K80 |
| Local Wheels | `/local-wheels`, `local_wheels_fleet` | Transport to housing (Mission THREE link) | K85 |
| Coalitions | `coalitions`, `coalition_members` | Housing cooperatives as coalitions | K63 |
| Crew Call | `/crew-call`, `crew_calls` | Maintenance bounties for properties | K83 |
| Household Concierge | concept | AirBnB cleaning bounties | #1766 |
| LB Calendar | `/calendar` | Vacation availability via Housing Plug | K82 |
| Ghost World | `/ghost-world` | Housing properties as island buildings | K88 |
| Treasure Maps | `/treasure-maps` | Turnkey Real Estate map (#1933) | K81 |

### Innovation References

| # | Name | A&A Doc | Key Concept |
|---|------|---------|-------------|
| #1927 | Cooperative Housing Acquisition | 022B | LB Housing LLC holds title, crowdfunded, Cost+20% |
| #1928 | AirBnB Revenue Subsidy Model | 022B | Dual-use: STR revenue subsidizes cooperative housing |
| #1929 | Housing WaterWheel | 022B | Surplus funds next property, self-expanding portfolio |
| #1930 | Tenant-as-Contributor | 022C | AirBnB guest → $5 member → viral city replication |
| #1931 | Cooperative Commercial Real Estate | 022C | Same model for storefronts, warehouses, workshops |
| #1932 | Member Vacation Network | 022C | Cooperative properties available to members at Cost+20% |
| #1933 | Member Property Listing (Garage Scenario) | 022C | Members list OWN properties; LB is marketplace |
| #1934 | Unified Real Estate WaterWheel | 022C | Cross-fund between housing/commercial/industrial |
| #1935 | $5 Access Key | 022C | $5 membership unlocks entire real estate network |

---

## TASK 1: Housing Hub Page

**Route**: `/housing`
**File**: `src/pages/Housing.tsx`

Main housing dashboard with 4 tabs (use shadcn `Tabs`):

### Tab 1: Available Properties
- Grid of `PropertyCard` components (Task 3)
- Filter bar: property type dropdown (`residential` / `commercial` / `vacation` / `garage` / all), status dropdown, city search input
- Sort: newest, lowest rent, most occupancy
- Empty state: "No properties yet. Be the first to contribute." with CTA to Contribute tab

### Tab 2: My Housing
- **My Occupancy**: Current housing unit (if any) — property card with move-in date, monthly rate, role badge
- **My Contributions**: Table of all `housing_contributions` where `contributor_id = auth.uid()` — date, type, amount, property, verified status
- **My WaterWheel Impact**: Sum of all contributions × 2.23 multiplier = estimated cooperative value generated
- **My Vacation Bookings**: Upcoming and past bookings from `vacation_bookings`
- Empty states for each section with appropriate CTAs

### Tab 3: Contribute
- Render `ContributionForm` component (Task 4)
- Above the form, show context cards:
  - "How Housing Fund Works" — 3-step explainer: Contribute → Acquire → Subsidize
  - "Current Fund Balance" — sum of verified contributions (aggregated from `housing_contributions` where `verified = true`)
  - "Properties Acquired" — count of `housing_properties` where `status = 'owned'`

### Tab 4: Housing Fund
- Transparent view of cooperative housing fund:
  - Total contributions (sum, by type)
  - Properties in pipeline: cards for each property with `status IN ('proposed', 'acquiring')`
  - Properties owned: cards for each `status = 'owned'` with occupancy and revenue stats
  - WaterWheel dashboard inline (Task 5) showing aggregate flow
- Fund growth chart: monthly contribution totals as bar chart (use recharts, already in project)

**Page header**: Mission TWO banner:
- Dark green gradient background (green-900 to green-700)
- "Mission TWO" small label
- "Everyone Has Shelter" headline (text-3xl bold white)
- Subtitle: "Cooperative housing — built by members, owned by the cooperative, priced at Cost+20%"
- Mission sequence pills: `ONE ✅` → `TWO ←` → `THREE ✅` (current mission highlighted with ring animation)

---

## TASK 2: Data Model — Migration 20260323000020

**File**: `supabase/migrations/20260323000020_housing.sql`

```sql
-- ============================================
-- MISSION TWO: Cooperative Housing
-- Innovations #1927-#1935
-- ============================================

-- Cooperative Housing Properties
CREATE TABLE housing_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'US',
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial', 'vacation', 'garage')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'acquiring', 'owned', 'leased', 'listed')),
  acquisition_cost NUMERIC,
  current_value NUMERIC,
  monthly_revenue NUMERIC DEFAULT 0,
  monthly_expenses NUMERIC DEFAULT 0,
  airbnb_units INT DEFAULT 0,
  housing_units INT DEFAULT 0,
  max_occupants INT,
  contributed_by UUID REFERENCES auth.users(id),
  node_id UUID REFERENCES nodes(id),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Housing Fund Contributions
CREATE TABLE housing_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES auth.users(id),
  property_id UUID REFERENCES housing_properties(id),
  contribution_type TEXT NOT NULL CHECK (contribution_type IN (
    'property_donation', 'airbnb_revenue', 'maintenance_labor',
    'credit_allocation', 'mark_pledge', 'cash_contribution'
  )),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'credits' CHECK (currency IN ('credits', 'marks', 'backed_marks', 'usd')),
  description TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Housing Occupancy (who lives where)
CREATE TABLE housing_occupancy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES housing_properties(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'steward', 'contributor', 'caretaker')),
  monthly_rate NUMERIC,
  currency TEXT DEFAULT 'credits',
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, member_id, move_in_date)
);

-- Housing WaterWheel Tracking (per property, per period)
CREATE TABLE housing_waterwheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES housing_properties(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue NUMERIC NOT NULL DEFAULT 0,
  airbnb_share NUMERIC DEFAULT 0,
  tenant_subsidy NUMERIC DEFAULT 0,
  maintenance_fund NUMERIC DEFAULT 0,
  cooperative_fund NUMERIC DEFAULT 0,
  jobs_created INT DEFAULT 0,
  multiplier_effect NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Member Vacation Network (availability windows on cooperative properties)
CREATE TABLE vacation_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES housing_properties(id) ON DELETE CASCADE,
  available_from DATE NOT NULL,
  available_to DATE NOT NULL,
  nightly_rate NUMERIC NOT NULL,
  currency TEXT DEFAULT 'credits',
  max_guests INT DEFAULT 4,
  amenities TEXT[],
  house_rules TEXT,
  priority_tier TEXT DEFAULT 'member' CHECK (priority_tier IN ('property_contributor', 'any_contributor', 'member', 'public')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vacation Bookings
CREATE TABLE vacation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES vacation_listings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES auth.users(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_cost NUMERIC NOT NULL,
  currency TEXT DEFAULT 'credits',
  guests INT DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE housing_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_occupancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_waterwheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_bookings ENABLE ROW LEVEL SECURITY;

-- Properties: public read, admin manage, members propose
CREATE POLICY "Anyone can view properties" ON housing_properties
  FOR SELECT USING (true);
CREATE POLICY "Admins manage properties" ON housing_properties
  FOR ALL USING (is_admin());
CREATE POLICY "Members can propose properties" ON housing_properties
  FOR INSERT WITH CHECK (auth.uid() = contributed_by);

-- Contributions: members see own, admins see all
CREATE POLICY "Members view own contributions" ON housing_contributions
  FOR SELECT USING (auth.uid() = contributor_id OR is_admin());
CREATE POLICY "Members create contributions" ON housing_contributions
  FOR INSERT WITH CHECK (auth.uid() = contributor_id);
CREATE POLICY "Admins manage contributions" ON housing_contributions
  FOR ALL USING (is_admin());

-- Occupancy: occupants see own, admins see all
CREATE POLICY "Occupants view own" ON housing_occupancy
  FOR SELECT USING (auth.uid() = member_id OR is_admin());
CREATE POLICY "Admins manage occupancy" ON housing_occupancy
  FOR ALL USING (is_admin());

-- WaterWheel: public read (transparency), admins write
CREATE POLICY "Anyone can view waterwheel" ON housing_waterwheel
  FOR SELECT USING (true);
CREATE POLICY "Admins manage waterwheel" ON housing_waterwheel
  FOR ALL USING (is_admin());

-- Vacation listings: public read, admins manage
CREATE POLICY "Anyone can view vacation listings" ON vacation_listings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage listings" ON vacation_listings
  FOR ALL USING (is_admin());

-- Vacation bookings: members see own, members create, admins manage
CREATE POLICY "Members view own bookings" ON vacation_bookings
  FOR SELECT USING (auth.uid() = guest_id OR is_admin());
CREATE POLICY "Members create bookings" ON vacation_bookings
  FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "Admins manage bookings" ON vacation_bookings
  FOR ALL USING (is_admin());

-- ============================================
-- Seed Data: 3 proof-of-concept properties
-- ============================================
INSERT INTO housing_properties (title, description, city, state, property_type, status, acquisition_cost, max_occupants, airbnb_units, housing_units) VALUES
  ('Founders House', 'First cooperative residence — proof of concept. Dual-use: 2 AirBnB units subsidize 2 cooperative housing units.', 'San Antonio', 'TX', 'residential', 'proposed', 200000, 4, 2, 2),
  ('Maker Workshop Loft', 'Live-work space above shared workshop. Commercial ground floor, residential loft. Let''s Make Bread incubator space.', 'San Antonio', 'TX', 'commercial', 'proposed', 120000, 2, 0, 2),
  ('Ozarks Retreat Cabin', 'Member vacation property. Available to all members at Cost+20%. Priority to Housing Fund contributors.', 'Branson', 'MO', 'vacation', 'proposed', 150000, 6, 0, 0);

-- Seed vacation listing for the cabin
INSERT INTO vacation_listings (property_id, available_from, available_to, nightly_rate, max_guests, amenities, house_rules, priority_tier)
SELECT id, '2026-06-01', '2026-12-31', 64, 6,
  ARRAY['wifi', 'kitchen', 'fireplace', 'lake_access', 'parking'],
  'No smoking indoors. Quiet hours 10pm-7am. Check-in 3pm, check-out 11am.',
  'any_contributor'
FROM housing_properties WHERE title = 'Ozarks Retreat Cabin';

-- Seed WaterWheel projection for Founders House
INSERT INTO housing_waterwheel (property_id, period_start, period_end, gross_revenue, airbnb_share, tenant_subsidy, maintenance_fund, cooperative_fund, jobs_created, multiplier_effect, notes)
SELECT id, '2026-04-01', '2026-04-30', 4000, 3000, 400, 300, 300, 4, 2.23,
  'Projected Month 1: 2 AirBnB units at $1,500/mo + 2 housing units at $500/mo (Cost+20%). Jobs: cleaner, guest steward, maintenance, supply runner.'
FROM housing_properties WHERE title = 'Founders House';
```

---

## TASK 3: Property Card Component

**File**: `src/components/housing/PropertyCard.tsx`

Card showing:
- **Image area**: If `image_url` exists, show image. Otherwise, gradient placeholder based on type:
  - `residential` → green gradient (green-600 to green-800)
  - `commercial` → blue gradient (blue-600 to blue-800)
  - `vacation` → amber gradient (amber-500 to orange-600)
  - `garage` → slate gradient (slate-500 to slate-700)
- **Title** + city/state line
- **Property type badge**: colored pill matching the gradient theme
- **Status badge**: 
  - `proposed` → yellow outline
  - `acquiring` → blue pulse
  - `owned` → green solid
  - `leased` → purple solid
  - `listed` → orange outline
- **Financials** (if `status = 'owned'`):
  - Monthly revenue / expenses
  - Net surplus with green/red coloring
  - "Surplus → Housing Fund" label if positive
- **Dual-use display** (if `airbnb_units > 0` and `housing_units > 0`):
  - "{airbnb_units} AirBnB + {housing_units} Housing" with split icon
- **Occupancy**: "{current} of {max_occupants} occupied" with progress bar
  - Query active occupancy: `SELECT COUNT(*) FROM housing_occupancy WHERE property_id = ? AND is_active = true`
- **WaterWheel multiplier badge**: If `housing_waterwheel` row exists for this property, show "×{multiplier_effect}" in green badge
- **Action buttons**:
  - "View Details" → expands inline or navigates to detail view
  - "Contribute" → scrolls to or opens ContributionForm with this property pre-selected

---

## TASK 4: Contribution Flow

**File**: `src/components/housing/ContributionForm.tsx`

Multi-step form (use shadcn Stepper pattern or numbered tabs):

### Step 1: Contribution Type
Radio cards (large, descriptive):
- **Property Donation** — "Contribute a property you own to the cooperative"
- **AirBnB Revenue Share** — "Share a percentage of your rental income"
- **Maintenance Labor** — "Volunteer your time for property maintenance (Crew Call bounty)"
- **Credit Allocation** — "Spend Credits toward the Housing Fund"
- **Mark Pledge** — "Pledge eligible Marks toward a housing project"
- **Cash Contribution** — "Direct cash contribution to the Housing Fund"

### Step 2: Amount + Currency
- Number input for amount
- Currency selector (auto-set based on type: maintenance labor → marks, credit allocation → credits, cash → usd)
- If property donation: field for estimated property value instead of amount
- Optional: target a specific property (dropdown of `housing_properties`)
- If no property selected: contribution goes to general Housing Fund

### Step 3: Review + Confirm
- Summary card showing: type, amount, currency, target property (or "General Housing Fund")
- **WaterWheel impact estimate**:
  - Use the Neighborhood Node multiplier from the WaterWheel paper: **2.23x**
  - Display: "Your {amount} {currency} contribution will generate approximately {amount × 2.23} in cooperative housing value"
  - Footnote: "Based on WaterWheel Scenario 3 (Neighborhood Node) adjusted multiplier"
- Terms acknowledgment: "This is a housing access deposit, NOT an investment. You receive priority housing access, not financial returns."
- "Confirm Contribution" button

### Step 4: Success
- Celebration animation (confetti or checkmark)
- "Contribution Recorded" headline
- "Your contribution is pending verification by a cooperative steward."
- WaterWheel impact reiterated
- Next steps: "While you wait:" → links to browse properties, explore vacation network, join a Crew Call for maintenance

**Insert into `housing_contributions`** on confirm. Set `verified = false` (admin verifies later).

---

## TASK 5: Housing WaterWheel Dashboard

**File**: `src/components/housing/WaterWheelDashboard.tsx`

Visual display of the Housing WaterWheel revenue flow:

### Flow Diagram (SVG or styled divs)
Animated circular flow showing money path through the cooperative housing system:

```
     ┌──────────────────────────────────┐
     │         GROSS REVENUE            │
     │       ($4,000/mo example)        │
     └──────────┬───────────────────────┘
                │
    ┌───────────┼───────────────┐
    ▼           ▼               ▼
┌────────┐ ┌────────────┐ ┌──────────┐
│ AirBnB │ │  Tenant    │ │ Maint.   │
│ Share  │ │  Subsidy   │ │ Fund     │
│  30%   │ │   40%      │ │  15%     │
└────────┘ └────────────┘ └──────────┘
                                │
                          ┌─────┘
                          ▼
                    ┌──────────┐
                    │  Coop    │
                    │  Fund    │
                    │  15%     │
                    │    ↓     │
                    │ NEXT     │
                    │ PROPERTY │
                    └──────────┘
```

Render as 4 colored blocks with animated connecting arrows (CSS `@keyframes` flowing dots along paths):
- AirBnB Share (30%) → amber block — covers mortgage, insurance, taxes
- Tenant Subsidy (40%) → green block — keeps housing at Cost+20%
- Maintenance Fund (15%) → blue block — repairs, cleaning, upkeep
- Cooperative Fund (15%) → purple block — surplus for next property acquisition

The percentages are display defaults. Actual data comes from `housing_waterwheel` rows.

### Per-Property Stats
For each property with WaterWheel data:
- Property name + period
- Revenue breakdown bar (stacked horizontal bar: airbnb_share | tenant_subsidy | maintenance_fund | cooperative_fund)
- Jobs created badge: "{jobs_created} cooperative jobs"
- Multiplier badge: "×{multiplier_effect}"

### Aggregate Dashboard
- **Total monthly revenue** across all tracked properties
- **Total cooperative fund surplus** — running sum of `cooperative_fund` across all periods
- **Multiplier effect**: "Every $1 in housing revenue generates ${multiplier_effect} in cooperative value"
  - Use the weighted average of multiplier_effect across all waterwheel rows
  - Fallback: 2.23x if no data
- **Properties funded by WaterWheel**: Count of properties where acquisition was partially or fully funded by cooperative_fund surplus

### Growth Projection Chart
Bar chart (recharts `BarChart`) showing:
- X axis: months
- Y axis: dollars
- Stacked bars: AirBnB share, tenant subsidy, maintenance, cooperative fund
- Line overlay: cumulative cooperative fund balance
- If only seed data exists, show projected bars (dashed/lighter opacity) based on Founders House projections

---

## TASK 6: Vacation Network

**File**: `src/components/housing/VacationNetwork.tsx`

Browse vacation listings for cooperative properties:

### Listing Cards
Grid of vacation-available properties:
- Property image/gradient
- Location (city, state)
- Nightly rate in Credits + "Cost+20%" badge
- "Market rate: ~$150-200" comparison line (static estimate for now)
- Max guests
- Amenities as icon pills (wifi, kitchen, fireplace, lake_access, parking — use lucide icons)
- Availability dates
- Priority tier badge:
  - `property_contributor` → gold "Priority"
  - `any_contributor` → silver "Contributor Access"
  - `member` → green "Member"
  - `public` → gray "Open"

### Booking Flow
Click "Book" on a listing:
1. **Date picker**: check-in / check-out date inputs
   - Validate: check-in >= `available_from`, check-out <= `available_to`
   - Validate: no overlapping confirmed bookings (query `vacation_bookings` for conflicts)
2. **Guest count**: number input (max = `max_guests`)
3. **Cost calculation**: `(check_out - check_in) days × nightly_rate`
4. **Review**: listing summary + dates + total cost + house rules
5. **Confirm**: INSERT into `vacation_bookings` with `status = 'pending'`
6. **Success**: "Booking submitted! You'll receive confirmation shortly."

### Priority Display
Show explainer card above listings:
- "Member Vacation Network — stay at cooperative properties for Cost+20%"
- Priority tiers explained: Fund contributors for THIS property → any Fund contributor → any member → public (AirBnB fills gaps at market rate)

---

## TASK 7: Navigation Wiring

### `src/components/layout/Sidebar.tsx`
Add "Housing" link in the sidebar:
- Icon: `Home` from lucide-react
- Label: "Housing"
- Route: `/housing`
- Place under a "Missions" section or group with other mission links
- If a Missions section doesn't exist, create one with:
  - Mission ONE (link to food/Let's Make Dinner or similar existing route)
  - **Mission TWO: Housing** ← new
  - Mission THREE (link to `/local-wheels` or transport hub)

### `src/App.tsx`
Add route:
```tsx
<Route path="/housing" element={<Housing />} />
```
Import `Housing` from `src/pages/Housing`.

### `src/pages/Index.tsx`
Add Mission TWO card on the homepage in the features/explore section:
- Card with green gradient accent
- "Mission TWO" label
- "Everyone Has Shelter" headline
- "Explore cooperative housing — built by members, priced at Cost+20%"
- Link to `/housing`

Add or update Mission Sequence display (if one exists on homepage):
- `ONE ✅ Food` → `TWO ← Shelter` → `THREE ✅ Transport`
- Mission TWO highlighted as current/active

---

## TASK 8: Helm "My Progress" Card (K81 Gap Fix)

**File**: Modify `src/pages/TheHelm.tsx`

Add a "My Progress" card to the Helm dashboard. This was specified in K81 Task 2C (Treasure Map progression) but never built.

### Card Content
- **Title**: "My Progress"
- **Active Treasure Maps**: Query `treasure_map_progress` (or equivalent table from K81) where `user_id = auth.uid()`
- For each active map:
  - Map name (e.g., "Breakfast Runner", "New Business Starter")
  - Current level with badge (Starter / Apprentice / Journeyman / Network)
  - Progress bar showing completion percentage within current level
  - "Continue" link → `/treasure-maps?map={map_id}`
- **Empty state**: "No treasure maps started yet. Begin your journey." → link to `/treasure-maps`
- **Housing connection**: If the Turnkey Real Estate Treasure Map exists in the system, show a callout: "NEW: Turnkey Real Estate Map — list your property and start earning"

Place this card prominently (top row or second row) on the Helm page.

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/pages/Housing.tsx` | Main housing hub — 4 tabs, Mission TWO banner |
| `src/components/housing/PropertyCard.tsx` | Property display card with type/status badges |
| `src/components/housing/ContributionForm.tsx` | Multi-step contribution flow with WaterWheel estimate |
| `src/components/housing/WaterWheelDashboard.tsx` | Revenue flow visualization + aggregate stats |
| `src/components/housing/VacationNetwork.tsx` | Vacation listing browse + booking flow |
| `supabase/migrations/20260323000020_housing.sql` | 6 tables + RLS + seed data |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/housing` route |
| `src/components/layout/Sidebar.tsx` | Add Housing nav link under Missions |
| `src/pages/Index.tsx` | Add Mission TWO card + Mission Sequence display |
| `src/pages/TheHelm.tsx` | Add My Progress card (K81 gap fix) |

## DO NOT TOUCH

- Ghost World files (K88) — `ghost_world_*` tables, `GhostWorld.tsx`, `HexGrid.tsx`, etc.
- Arena/Emporium/Crew Tables (K87) — `arena_submissions`, `crew_tables`, `Emporium.tsx`, etc.
- Political Expedition (K86) — `political_expedition*` files
- Vehicle files (K85) — `lemon_lot_*`, `local_wheels_*`, `rideshare_*` tables and pages
- Star Chamber (K79) — `star_chamber_*` files
- Commerce Engine (K80) — `distribute-order-earnings`, `menu_orders` logic
- Calendar/Beacon wiring (K82)
- Crew Call dispatch (K83)
- MoneyPenny AI (K84)

---

## BUILD ORDER

```
Task 2 (migration — 6 tables + RLS + seed)
  → Task 3 (PropertyCard component)
    → Task 4 (ContributionForm) ← depends on PropertyCard for target selection
    → Task 5 (WaterWheelDashboard) [parallel with Task 4]
    → Task 6 (VacationNetwork) [parallel with Task 4]
      → Task 1 (Housing page wrapper — assembles all components)
        → Task 7 (nav wiring — sidebar, App.tsx, Index.tsx)
        → Task 8 (Helm My Progress — independent, can parallel with Task 7)
```

---

## DEPLOY CHECKLIST

1. Push migration: `npx supabase db push`
2. Verify 6 tables created with RLS:
   - `housing_properties` — 3 seed rows
   - `housing_contributions` — empty
   - `housing_occupancy` — empty
   - `housing_waterwheel` — 1 seed row (Founders House projection)
   - `vacation_listings` — 1 seed row (Ozarks cabin)
   - `vacation_bookings` — empty
3. `npm run build` — zero errors
4. `firebase deploy --only hosting:main`
5. Test paths:
   - `/housing` → see Mission TWO banner + 3 seed properties on Available tab
   - Click property → detail view with type/status badges
   - Switch to Contribute tab → multi-step form works
   - Submit a contribution → verify row in `housing_contributions` with `verified = false`
   - Contribution success shows WaterWheel estimate (amount × 2.23)
   - Switch to Housing Fund tab → WaterWheel dashboard renders with Founders House projection
   - Flow diagram shows animated revenue split (30/40/15/15)
   - Growth chart shows projected bars
   - Browse vacation listings → see Ozarks cabin with amenities + nightly rate
   - Book vacation → date picker → cost calculation → confirm → row in `vacation_bookings`
   - Sidebar: Housing link appears under Missions
   - Homepage: Mission TWO card visible with green accent
   - Homepage: Mission Sequence shows ONE ✅ → TWO ← → THREE ✅
   - Helm: My Progress card shows treasure map data (or empty state)
   - Mobile: all tabs, forms, and cards responsive

---

## SUCCESS CRITERIA

- [ ] 6 tables created with correct RLS policies
- [ ] 3 seed properties visible on Available tab
- [ ] Property cards render with type gradients, status badges, dual-use display
- [ ] WaterWheel multiplier badge shows on properties with tracking data
- [ ] Contribution flow works end-to-end (select type → amount → review → confirm)
- [ ] WaterWheel impact estimate displays on contribution review (amount × 2.23)
- [ ] Contribution inserts into DB with `verified = false`
- [ ] WaterWheel dashboard shows animated revenue split diagram
- [ ] Per-property and aggregate WaterWheel stats render
- [ ] Growth projection chart renders (seed data + projections)
- [ ] Vacation listings display with amenities, rate, priority tier
- [ ] Vacation booking flow works (dates → cost → confirm → DB insert)
- [ ] Navigation: sidebar link, homepage card, Mission Sequence display
- [ ] Helm My Progress card shows active treasure maps with progress bars
- [ ] Zero console errors on all housing paths
- [ ] Clean build, clean deploy

---

## ECONOMIC REFERENCE (from WaterWheel Paper — Scenario 6)

For the WaterWheel dashboard and contribution estimates, these are the canonical numbers:

**Founders House projection (4-unit building):**
| Item | Monthly |
|------|---------|
| 2 AirBnB units × $1,500 | $3,000 |
| 2 Housing units × $500 (Cost+20%) | $1,000 |
| **Gross revenue** | **$4,000** |
| Mortgage | -$2,000 |
| Insurance + taxes | -$600 |
| Maintenance reserve | -$200 |
| Property management | -$400 |
| **Monthly surplus → Housing Fund** | **$800** |

**WaterWheel growth timeline:**
- Year 2: $19,200 accumulated → Property 2 down payment
- Year 3.5: Combined surplus $1,600/mo → Property 3
- Year 4.5: Property 4 ($3,200/mo combined)
- Year 7: Self-sustaining (6+ properties, no new contributions needed)

**Long-term housing cost trajectory:**
- Year 1: $600/mo (Cost+20%)
- Year 10: $420/mo
- Year 30 (paid off): $180/mo (maintenance only)
- Market equivalent at Year 30: $2,200+

**Multiplier**: 2.23x (Neighborhood Node adjusted, from WaterWheel paper Scenario 3)

**Jobs created per property**: Cleaner (Household Concierge), Guest Steward, Maintenance (Crew Call), Supply Runner (Local Wheels) — 4 cooperative jobs minimum per dual-use property.

---

Mission TWO is the hardest promise. Food can be shared in a parking lot. Shelter requires capital, coordination, and trust. This page is where the cooperative proves it can do all three.

**FOR THE KEEP.**
