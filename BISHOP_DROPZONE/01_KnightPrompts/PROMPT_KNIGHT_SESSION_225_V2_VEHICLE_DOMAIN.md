# KNIGHT SESSION 225 — v2 Vehicle Domain Migration
## Priority: LOW | Complexity: LOW (2 sessions)
## NOTE: Housing domain (K220) already covers Local Wheels, Lemon Lot, and Rideshare. This session handles any vehicle-specific tables/logic NOT covered by K220.

---

## V1 INVENTORY
- **Tables**: rideshare_routes (20 cols — origin/dest lat/lng, days_available, cost_per_ride), rideshare_matches (10 cols), lemon_lot_vehicles, lemon_lot_rentals, local_wheels_fleet (11 cols, earn-down)
- **Edge Functions**: 0
- **Pages (3)**: RideshareRoutes, LocalWheels, LemonLot

## STATUS CHECK
If K220 (Housing) already built these pages, this session becomes a VERIFICATION + ENHANCEMENT session:
1. Verify vehicle pages from K220 are complete
2. Add any missing vehicle-specific features (safety_ledger, insurance tracking)
3. Ensure earn-down calculations are correct (20% platform / 80% driver)
4. Ensure Lemon Lot minimum ($15/day) is enforced
5. Ensure Rideshare Routes uses Cost+20%

If K220 did NOT build vehicle pages, build them following housing domain patterns.

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
