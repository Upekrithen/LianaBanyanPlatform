# Knight Session K359 — Vehicle Domain V2 Migration (Last Domain)
# Bishop B086 | Priority: HIGH | Depends on: None

## CONTEXT
Vehicle is the LAST unmigrated domain (22/23 migrated, vehicle = not_started). This session completes the full V2 migration to achieve 23/23 — every domain migrated.

Current vehicle domain:
- **Tables**: rideshare_routes (21 cols), rideshare_matches (10 cols)
- **Pages**: RideshareRoutes, LocalWheels, LemonLot
- **Edge Functions**: none
- **Migration**: 20260322000016_vehicle_systems.sql

## WHAT TO BUILD

### 1. V2 Pages (FocusShell Pattern)
Create V2 versions of all 3 pages following the established V2 FocusShell pattern:

**WheelsV2Page** (`/v2/wheels`) — already exists as stub, needs full implementation:
- Hero section with Rideshare Routes + Local Wheels + Lemon Lot sections
- Tab navigation: "Find a Ride" | "Offer a Ride" | "Buy/Sell Vehicle" | "Local Wheels"
- Search by city/state, distance radius
- Map placeholder (grid of matching routes)

**RideshareRoutesV2** (`/v2/rideshare`):
- Route creation form: origin, destination, schedule (recurring/one-time), seats available, price (Credits or Marks)
- Route browser with filters: city, day of week, time range
- Match system: request to join a route → notification to driver → accept/decline
- Cost+20% applied to any Credits pricing
- Marks pricing: effort-differential only

**LemonLotV2** (`/v2/lemon-lot`):
- Vehicle listings: photo, make/model/year, price, condition, location
- "Certified by Crew" badge if a local crew member has inspected
- Contact seller (in-platform messaging placeholder)
- Price in Credits (with Cost+20% breakdown)

### 2. V2 Components
- `VehicleSearchBar.tsx` — shared search with city/distance/type filters
- `RouteCard.tsx` — compact card for rideshare route (origin → destination, time, seats, price)
- `VehicleListingCard.tsx` — card for Lemon Lot vehicle
- `RideMatchDialog.tsx` — request to join a route modal
- `VehicleCertBadge.tsx` — crew certification badge

### 3. Route Registration
Add to V2 routes:
```tsx
{ path: '/v2/wheels', element: <WheelsV2Page /> },
{ path: '/v2/rideshare', element: <RideshareRoutesV2 /> },
{ path: '/v2/rideshare/:routeId', element: <RouteDetailPage /> },
{ path: '/v2/lemon-lot', element: <LemonLotV2 /> },
{ path: '/v2/lemon-lot/:listingId', element: <VehicleListingDetail /> },
```

### 4. Sidebar Integration
Under "Services" section in sidebar:
- "Local Wheels" → /v2/wheels
- "Rideshare" → /v2/rideshare
- "Lemon Lot" → /v2/lemon-lot

### 5. Migration Tracker Update
Update V2 migration tracker to show vehicle as 'migrated' — achieving 23/23.

## FILES TO CREATE
- `platform/src/pages/v2/vehicle/WheelsV2Page.tsx`
- `platform/src/pages/v2/vehicle/RideshareRoutesV2.tsx`
- `platform/src/pages/v2/vehicle/RouteDetailPage.tsx`
- `platform/src/pages/v2/vehicle/LemonLotV2.tsx`
- `platform/src/pages/v2/vehicle/VehicleListingDetail.tsx`
- `platform/src/components/vehicle/VehicleSearchBar.tsx`
- `platform/src/components/vehicle/RouteCard.tsx`
- `platform/src/components/vehicle/VehicleListingCard.tsx`
- `platform/src/components/vehicle/RideMatchDialog.tsx`
- `platform/src/components/vehicle/VehicleCertBadge.tsx`

## CONSTRAINTS
- FocusShell pattern (consistent with all V2 pages)
- Credits pricing: Cost+20% breakdown always visible
- Marks pricing: differential value only, never dollar-equivalent
- RLS on rideshare_routes: creator manages own routes; public reads active routes
- No new tables needed — existing schema sufficient
- All mock/demo data client-side only

## DONE WHEN
- [ ] All 3 V2 pages render with real Supabase data
- [ ] Route creation + match request flow works
- [ ] Lemon Lot listing + contact flow works
- [ ] Sidebar links work
- [ ] V2 migration tracker shows 23/23 (100%)
- [ ] Build passes clean
