# KNIGHT SESSION 106 — Calendar Infrastructure + Beacon System + Commerce Engine Enhancements

## Priority: HIGH — These are the next-wave features that connect the Commerce Engine (K68) to the innovations from Bishop 019.

---

## CONTEXT

Bishop 031 completed spec expansion for 142 innovations (#1755-#1896). Several of these describe systems that Knight should build next. The Commerce Engine loop is LIVE (storefront → menu → cart → Stripe → aggregation → provider dashboard → runner dashboard → cue card → treasure map → passive income). Now we wire in the supporting systems.

**Read first:**
- `BISHOP_DROPZONE/SPEC_EXPANSION_BAG_10_PART_1_1755_1821.md` (Section 6-7 for subscription specs)
- `BISHOP_DROPZONE/SPEC_EXPANSION_BAG_10_PART_2_1822_1896.md` (Sections 9-14 for treasure maps, calendar, beacons, arena)

**Canonical stats:** 1,979 innovations | 1,456 claims | 9 provisionals | 21 production systems | 7 portals

---

## DELIVERABLE 1: Midnight Aggregation Cutoff System (#1832)

The Commerce Engine processes orders but doesn't have the cutoff-and-consolidate mechanism yet.

**Build:**
1. Add `order_cutoff_time` field to `storefronts` table (default: midnight local time, configurable per storefront)
2. Create a Supabase edge function `aggregate-cutoff-orders` that:
   - Runs at the storefront's cutoff time (or on a cron every 15 minutes checking for passed cutoffs)
   - Collects all pending orders since last cutoff
   - Generates: itemized order list (GROUP BY product, SUM quantity), delivery manifest (sorted by destination), payment summary
   - Sends consolidated list to provider via email (and later MoneyPenny SMS when A2P clears)
   - Marks orders as `aggregated`
3. Add a countdown timer on the public `/menu/:slug` page showing "Order by [cutoff time] for tomorrow's delivery"
4. Add the consolidated order view to the Provider Dashboard (`/dashboard/provider`) — "Tomorrow's Orders" card

**Test:** Create a storefront with midnight cutoff, place 5 test orders, verify aggregation fires and provider sees consolidated list.

---

## DELIVERABLE 2: Beacon System — Bite 1 (#1861-#1864)

The Benefits Sheet exists. Denken exists. Wire them together with the beacon save-for-later system.

**Build:**
1. Create `beacons` table:
```sql
CREATE TABLE IF NOT EXISTS beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  beacon_type TEXT NOT NULL CHECK (beacon_type IN ('save', 'dismiss', 'share', 'important', 'permanent')),
  target_type TEXT NOT NULL, -- 'page', 'storefront', 'treasure_map', 'article', etc.
  target_id TEXT NOT NULL, -- URL path or entity UUID
  target_title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sleeping', 'picked_up', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ -- null for permanent beacons
);
```
2. Create `useBeacons` hook — drop, retrieve, update status, list by type
3. Create `BeaconButton` component — small colored circle button (💛 gold for save-for-later). Attachable to any page/component via `<BeaconButton targetType="page" targetId="/benefits" targetTitle="Membership Benefits" />`
4. Create `DenkenPanel` component — expandable side panel from the Denken icon showing beaconed items sorted by type with active/sleeping/picked-up states
5. Wire Bite 1 into the post-slideshow Benefits Sheet:
   - Denken peeks from right edge with speech bubble: "Want to save this for later? Drop a beacon."
   - Single 💛 button on Benefits Sheet
   - Click → Benefits Sheet slides toward Denken → Denken blinks gold → "Got it. Click me anytime."
   - Prompt: "Now you try" → user clicks Denken → sheet slides back
   - Two buttons: [OK Let's Roll] [Show Me Again]

**DO NOT build Bite 2 yet.** That comes when the user naturally encounters beacons elsewhere. Just ensure the `BeaconButton` component is reusable so we can drop it on any page later.

**Test:** Complete onboarding slideshow, see Bite 1, drop beacon, retrieve from Denken, verify database record.

---

## DELIVERABLE 3: Treasure Map Chest Page Enhancement (#1843)

The `/treasure-maps` page exists with 6 maps and 4 levels. Enhance it.

**Build:**
1. Add "Breakfast Runner" treasure map card (Level 1) linking to a new page `/treasure-maps/breakfast-runner` with the full Phase 1-4 steps from innovation #1829
2. Add revenue projections to each existing map card: "Estimated monthly revenue at steady state: $X"
3. Add `BeaconButton` to each treasure map card (so users can save maps for later)
4. Add Local Sheet demand signal display: if earmarked Credits exist for that map's category in the viewer's area, show "💰 $X in earmarked Credits waiting for the first [category] in your area"
   - This requires a query against `earmarked_credits` (or equivalent) filtered by category + area
   - If no earmarked data exists yet, show nothing (don't show $0)

**Test:** Visit `/treasure-maps`, see Breakfast Runner card with revenue projection, drop beacon, verify in Denken panel.

---

## DELIVERABLE 4: Onboarding Credit Tracking (#1848, #1851, #1856)

Wire the passive income infrastructure. This is the economic backbone of the Runner-to-Captain progression.

**Build:**
1. Create tables:
```sql
CREATE TABLE IF NOT EXISTS onboarding_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarder_id UUID NOT NULL REFERENCES auth.users(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  qualification_date DATE,
  credit_percentage DECIMAL(4,2) DEFAULT 3.00,
  is_qualified BOOLEAN DEFAULT false,
  orders_count INT DEFAULT 0,
  first_order_date DATE,
  is_active BOOLEAN DEFAULT true,
  paused_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS steward_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steward_id UUID NOT NULL REFERENCES auth.users(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  management_fee_percentage DECIMAL(4,2) DEFAULT 2.00,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
2. Create `useOnboardingCredits` hook — list credits, check qualification progress, calculate passive income
3. Add qualification tracking: when an order is placed through a storefront, increment `orders_count` on any pending onboarding_credit for that storefront. When count >= 10 AND days since first_order >= 30, set `is_qualified = true` and `qualification_date = now()`.
4. Add Passive Income card to Runner Dashboard (`/dashboard/runner`):
   - "Your Onboarding Credits" — list of businesses with qualification progress or active credit
   - Per-business: orders toward qualification (X/10), days active (X/30), or if qualified: monthly revenue × 3% = passive income
5. Add Steward Management card (future — just the table and hook for now, no UI needed yet)

**Test:** Create a storefront as User A, place 10 orders as User B, verify qualification triggers after 30 days (use a migration to backdate `first_order_date` for testing).

---

## BUILD + DEPLOY

```bash
cd platform
npm run build
firebase deploy --only hosting -P default
```

Deploy to all 8 targets. Update `MILESTONE_HANDOFF_MARCH_2026.md` with K106 section.

**Canonical stats remain:** 1,979 | 1,456 | 9 | 21 production systems (no new production system this session — these are infrastructure enhancements to existing systems).

---

## WHAT THIS UNLOCKS

After K106:
- Commerce Engine has proper cutoff aggregation (production-ready for real providers)
- Beacon system provides universal save-for-later (foundation for all future UX)
- Treasure Maps show real demand signals (cold start intelligence visible to prospective Captains)
- Onboarding Credits track qualification (the economic engine that makes Runner → Captain progression real)

**Next Knight sessions (Bishop will prompt):**
- K107: Calendar infrastructure (Cal.com fork or FullCalendar, plug architecture)
- K108: Ghost World storefront mapping (HexIsle island generation from Node data)
- K109: Arena → Emporium → Marketplace three-stage pipeline

---

**FOR THE KEEP.**
