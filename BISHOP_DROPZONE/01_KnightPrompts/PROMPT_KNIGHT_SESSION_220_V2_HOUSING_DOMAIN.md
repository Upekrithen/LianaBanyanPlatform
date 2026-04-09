# KNIGHT SESSION 220 — v2 Housing Domain Migration
## Priority: MEDIUM | Source: Bishop B057 Domain Audit
## Prerequisite: K209 (Currency — escrow for roommate stamps), K219 (Reputation — STAMP verification)

---

## CONTEXT

Housing is the 13th v2 domain — cooperative housing, roommate accountability, vacation network, and local wheels. It covers housing properties (contribution-based), the WaterWheel revenue model (30/40/15/15 split), roommate agreements with 3-level appeal, vacation listings with priority tiers, and vehicle services (Local Wheels earn-down, Lemon Lot P2P, Rideshare Routes).

---

## V1 INVENTORY (from B056 deep audit)

### Tables (14 across 4 migrations)
**Housing (6):**
- `housing_properties` (21 cols) — property definitions
- `housing_contributions` (11 cols) — member contributions (6 types)
- `housing_occupancy` (10 cols) — occupancy tracking
- `housing_waterwheel` (13 cols) — revenue tracking with 30/40/15/15 split
- `vacation_listings` (9 cols) — vacation network
- `vacation_bookings` (8 cols) — booking records

**Roommate (4):**
- `roommate_applications` (15 cols) — commitment tiers
- `roommate_agreements` (17 cols) — escrow tracking
- `roommate_stamps` (17 cols) — photo-based verification
- `roommate_stamp_appeals` (6 cols) — 3-level appeal process

**Vehicle (4):**
- `local_wheels_fleet` (11 cols) — earn-down fleet vehicles
- `lemon_lot_vehicles` — P2P vehicle listings
- `lemon_lot_rentals` — rental records (Cost+20% split)
- `rideshare_routes` + `rideshare_matches` — commute matching

### Edge Functions (2)
- `housing-manage` — CRUD for contributions/properties
- `process-roommate-escrow` — weekly pg_cron (K158)

### Pages (3)
Housing (5-tab hub: Properties, My Housing, Contribute, Housing Fund, Roommate), LocalWheels, StewardStampDashboard

### Components (5)
ContributionForm (6 types, WaterWheel 2.23x multiplier), PropertyCard, RoommateTab (stamp categories, commitment tiers), VacationNetwork (priority tiers, Cost+20%), WaterWheelDashboard (30/40/15/15)

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/housing/
├── pages/
│   ├── HousingPage.tsx             # Hub with tabs (AppShell)
│   ├── PropertyDetailPage.tsx      # Individual property (AppShell)
│   ├── ContributionPage.tsx        # Make a housing contribution (AppShell)
│   ├── RoommatePage.tsx            # Roommate matching + agreements (AppShell)
│   ├── VacationNetworkPage.tsx     # Vacation listings (AppShell)
│   ├── LocalWheelsPage.tsx         # Earn-down fleet (AppShell)
│   ├── LemonLotPage.tsx            # P2P vehicle marketplace (AppShell)
│   └── RideshareRoutesPage.tsx     # Commute matching (AppShell)
├── components/
│   ├── housing/
│   │   ├── PropertyCard.tsx         # Property listing card
│   │   ├── ContributionForm.tsx     # 6 contribution types
│   │   ├── WaterWheelDashboard.tsx  # 30/40/15/15 revenue visualization
│   │   └── HousingFundTracker.tsx   # Fund balance + growth
│   ├── roommate/
│   │   ├── RoommateApplication.tsx  # Application with commitment tiers
│   │   ├── RoommateAgreement.tsx    # Agreement display + escrow status
│   │   ├── RoommateStamp.tsx        # Photo-based stamp verification
│   │   └── StampAppeal.tsx          # 3-level appeal: Steward → Ombudsperson → AAA
│   ├── vacation/
│   │   ├── VacationListing.tsx      # Listing card with priority tier
│   │   └── VacationBooking.tsx      # Booking flow (Cost+20%)
│   └── vehicle/
│       ├── FleetVehicle.tsx         # Earn-down vehicle card
│       ├── LemonLotListing.tsx      # P2P rental listing
│       └── RideshareMatch.tsx       # Route match card
├── hooks/
│   ├── useHousing.ts               # Properties + contributions
│   ├── useWaterWheel.ts            # Revenue tracking
│   ├── useRoommate.ts              # Applications + agreements + stamps
│   ├── useVacation.ts              # Listings + bookings
│   └── useVehicles.ts              # Fleet + rentals + rideshare
├── lib/
│   ├── housingTypes.ts             # Types
│   ├── waterWheelRules.ts          # 30% AirBnB, 40% Tenant Subsidy, 15% Maintenance, 15% Cooperative Fund. 2.23x multiplier.
│   ├── contributionTypes.ts        # 6 contribution types
│   ├── roommateRules.ts            # Commitment tiers + escrow rules
│   ├── appealProcess.ts            # 3-level: Steward Review → Ombudsperson → AAA Arbitration
│   ├── vacationPriority.ts         # property_contributor > any_contributor > member > public
│   └── vehicleRules.ts             # Earn-down: 20% platform / 80% driver. Lemon Lot: $15/day minimum.
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **WaterWheel Revenue Split**: 30% AirBnB Share, 40% Tenant Subsidy, 15% Maintenance, 15% Cooperative Fund. The 2.23x multiplier applies to contribution matching. This is hardcoded, not configurable.

2. **Roommate 3-Level Appeal**: Steward Review → Ombudsperson → AAA Arbitration. Stamps are photo-based verification. Escrow processed weekly via pg_cron.

3. **Vacation Priority Tiers**: property_contributor > any_contributor > member > public. Cost+20% floor applies.

4. **Local Wheels Earn-Down**: Members earn vehicle ownership over time. Default split: 20% platform / 80% driver.

5. **Lemon Lot**: P2P vehicle marketplace. $15/day minimum rental. Cost+20% split.

6. **Rideshare Routes**: Recurring commute matching. Members post routes with days_available and cost_per_ride. Cost+20% applies.

7. **Housing + Vehicle in one domain.** The B056 audit combined them because they share location-based logic and serve the same user need (housing infrastructure). Vehicle sub-pages can split later if needed.

8. **All pages AppShell** — housing is member-facing operations.

---

## BUILD STEPS

1. Use Librarian: `get_schema("housing_properties")`, `get_schema("housing_contributions")`, `get_schema("housing_waterwheel")`, `get_schema("roommate_agreements")`, `get_schema("local_wheels_fleet")`
2. Build HousingPage hub with 5 tabs
3. Build WaterWheel dashboard + contribution form
4. Build roommate flow (application → agreement → stamps → appeal)
5. Build vehicle pages (LocalWheels, LemonLot, Rideshare)
6. Wire routes, export API, register in AppRouter

---

## IMPORTS FROM OTHER DOMAINS

```tsx
import { useMembership } from '../membership';
import { useEscrow } from '../currency';
// Roommate escrow uses currency domain's escrow hooks
```

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/housing` shows 5-tab hub
3. WaterWheel dashboard shows 30/40/15/15 split
4. Roommate stamp flow works with photo upload
5. Vacation priority tiers display correctly
6. `/local-wheels` shows earn-down fleet
7. `get_migration_status("housing")` shows v2 pages > 0
8. Librarian indexes rebuilt

---

*Bishop B057 — v2 Housing Domain*
*WaterWheel + Roommate Accountability + Vacation + Local Wheels + Lemon Lot + Rideshare*
*FOR THE KEEP!*
