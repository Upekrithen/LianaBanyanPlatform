-- K359: Mark Vehicle domain V2 pages as completed in the tracker (23/23 domains migrated)
-- Inserts the 5 new vehicle V2 pages as completed entries

INSERT INTO v2_redesign_tracker (page_name, page_route, pawn_batch, status, assignee, notes, started_at, completed_at, updated_at)
VALUES
  ('VehicleWheelsV2Page', '/v2/wheels', 'K359', 'completed', 'Knight', 'Vehicle hub with 4 tabs: Find a Ride, Offer a Ride, Buy/Sell Vehicle, Local Wheels. K359 session.', NOW(), NOW(), NOW()),
  ('RideshareRoutesV2', '/v2/rideshare', 'K359', 'completed', 'Knight', 'Rideshare route creation, browser with city/day filters, match request flow. Credits Cost+20% and Marks pricing.', NOW(), NOW(), NOW()),
  ('RouteDetailPage', '/v2/rideshare/:routeId', 'K359', 'completed', 'Knight', 'Single route detail with join request dialog, Cost+20% breakdown, rider request management.', NOW(), NOW(), NOW()),
  ('LemonLotV2', '/v2/lemon-lot', 'K359', 'completed', 'Knight', 'Vehicle listings grid with search, Certified by Crew badge, Cost+20% credit breakdown.', NOW(), NOW(), NOW()),
  ('VehicleListingDetail', '/v2/lemon-lot/:listingId', 'K359', 'completed', 'Knight', 'Single vehicle detail with photos, features, pricing breakdown, contact seller.', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;
