# KNIGHT SESSION 85 — Lemon Lot + Local Wheels + Rideshare Routes
## Bishop 025 | March 22, 2026
## Innovation Count: 1,935
## Innovations Referenced: #1922 (Lemon Lot), #1923 (Rideshare Routes), #1924 (Vehicle Contribution Onboarding), #1925 (Rally Group Transport Bundle), #1926 (Safety Ledger)

---

## MISSION

Build the vehicle systems under Rally Group. Three features:
1. **Lemon Lot** — peer-to-peer vehicle sharing (TURO alternative, named after army base used-car lots)
2. **Local Wheels** — LB fleet vehicles with Earn-Down to payoff
3. **Rideshare Routes** — recurring commute matching

All Cost+20%. Member-owned, member-insured. LB is marketplace only.

---

## TASK 1: Vehicle Database Tables

Create migration `20260322000016_vehicle_systems.sql`:

```sql
-- Lemon Lot: Peer-to-peer vehicle sharing
CREATE TABLE lemon_lot_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT,
  vin TEXT,
  mileage INTEGER,
  daily_rate NUMERIC(10,2) NOT NULL, -- Cost+20% floor applies
  weekly_rate NUMERIC(10,2),
  monthly_rate NUMERIC(10,2),
  photos TEXT[] DEFAULT '{}', -- storage URLs
  description TEXT,
  features TEXT[] DEFAULT '{}', -- 'ac', 'bluetooth', '4wd', etc.
  insurance_verified BOOLEAN DEFAULT false,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  location_city TEXT,
  location_state TEXT,
  location_zip TEXT,
  availability_status TEXT DEFAULT 'available', -- 'available', 'rented', 'maintenance', 'unlisted'
  total_rentals INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lemon Lot rentals
CREATE TABLE lemon_lot_rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES lemon_lot_vehicles(id) NOT NULL,
  renter_id UUID REFERENCES auth.users(id) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_rate NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL, -- 13.3% of total
  owner_payout NUMERIC(10,2) NOT NULL, -- 83.3% of total
  gleaners_share NUMERIC(10,2) NOT NULL, -- 3.3% of total
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'active', 'completed', 'cancelled'
  pickup_location TEXT,
  return_location TEXT,
  renter_rating INTEGER, -- 1-5
  owner_rating INTEGER, -- 1-5
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Local Wheels: Fleet vehicles with Earn-Down
CREATE TABLE local_wheels_fleet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES lemon_lot_vehicles(id), -- can link to Lemon Lot listing
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  purchase_price NUMERIC(10,2) NOT NULL,
  remaining_balance NUMERIC(10,2) NOT NULL,
  earn_down_percentage NUMERIC(5,2) DEFAULT 20.0, -- 20% of earnings go to payoff
  driver_percentage NUMERIC(5,2) DEFAULT 80.0, -- 80% to driver
  assigned_driver_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'available', -- 'available', 'assigned', 'in_use', 'maintenance'
  total_earned NUMERIC(10,2) DEFAULT 0,
  total_earn_down NUMERIC(10,2) DEFAULT 0,
  payoff_date TIMESTAMPTZ, -- estimated or actual
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rideshare Routes: Recurring commute matching
CREATE TABLE rideshare_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES auth.users(id) NOT NULL,
  origin_address TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_zip TEXT NOT NULL,
  origin_lat NUMERIC(10,7),
  origin_lng NUMERIC(10,7),
  destination_address TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_zip TEXT NOT NULL,
  destination_lat NUMERIC(10,7),
  destination_lng NUMERIC(10,7),
  departure_time TIME NOT NULL,
  return_time TIME,
  days_available TEXT[] DEFAULT '{}', -- ['monday', 'tuesday', ...]
  seats_available INTEGER DEFAULT 3,
  cost_per_ride NUMERIC(10,2), -- split gas cost, NOT a fare
  vehicle_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rideshare_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES rideshare_routes(id) NOT NULL,
  rider_id UUID REFERENCES auth.users(id) NOT NULL,
  pickup_address TEXT,
  pickup_lat NUMERIC(10,7),
  pickup_lng NUMERIC(10,7),
  days_requested TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'active', 'ended'
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, rider_id)
);

-- Safety Ledger: Photos of driver + passenger with timestamps/GPS
CREATE TABLE safety_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_type TEXT NOT NULL, -- 'lemon_lot', 'local_wheels', 'rideshare'
  trip_id UUID NOT NULL, -- references rental/route/match ID
  driver_id UUID REFERENCES auth.users(id) NOT NULL,
  passenger_id UUID REFERENCES auth.users(id),
  driver_photo_url TEXT,
  passenger_photo_url TEXT,
  start_location_lat NUMERIC(10,7),
  start_location_lng NUMERIC(10,7),
  end_location_lat NUMERIC(10,7),
  end_location_lng NUMERIC(10,7),
  start_timestamp TIMESTAMPTZ DEFAULT NOW(),
  end_timestamp TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for all tables
ALTER TABLE lemon_lot_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available vehicles" ON lemon_lot_vehicles FOR SELECT USING (true);
CREATE POLICY "Owner manages own vehicles" ON lemon_lot_vehicles FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admin manages all" ON lemon_lot_vehicles FOR ALL USING (public.is_admin());

ALTER TABLE lemon_lot_rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view" ON lemon_lot_rentals FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = owner_id OR public.is_admin());
CREATE POLICY "Renter can create" ON lemon_lot_rentals FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Participants can update" ON lemon_lot_rentals FOR UPDATE USING (auth.uid() = renter_id OR auth.uid() = owner_id OR public.is_admin());

ALTER TABLE local_wheels_fleet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view fleet" ON local_wheels_fleet FOR SELECT USING (true);
CREATE POLICY "Admin manages fleet" ON local_wheels_fleet FOR ALL USING (public.is_admin());

ALTER TABLE rideshare_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active routes" ON rideshare_routes FOR SELECT USING (is_active = true OR auth.uid() = driver_id);
CREATE POLICY "Driver manages own routes" ON rideshare_routes FOR ALL USING (auth.uid() = driver_id);

ALTER TABLE rideshare_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view matches" ON rideshare_matches FOR SELECT USING (auth.uid() = rider_id OR auth.uid() IN (SELECT driver_id FROM rideshare_routes WHERE id = route_id));
CREATE POLICY "Rider can request match" ON rideshare_matches FOR INSERT WITH CHECK (auth.uid() = rider_id);

ALTER TABLE safety_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view" ON safety_ledger FOR SELECT USING (auth.uid() = driver_id OR auth.uid() = passenger_id OR public.is_admin());
CREATE POLICY "Driver or passenger can create" ON safety_ledger FOR INSERT WITH CHECK (auth.uid() = driver_id OR auth.uid() = passenger_id);
CREATE POLICY "Admin can view all" ON safety_ledger FOR SELECT USING (public.is_admin());
```

---

## TASK 2: Lemon Lot Page

Create `src/pages/LemonLot.tsx`:

1. **Browse View** — Grid of available vehicles with photos, make/model/year, daily rate, location, rating
2. **List Your Vehicle** button → form: photos, make/model/year, description, features checkboxes, daily/weekly/monthly rates, insurance info
3. **Vehicle Detail** view — full photos, description, availability calendar, "Request Rental" button
4. **My Vehicles** tab — owner's listed vehicles with rental history and earnings

Route: `/lemon-lot`

Follow the PortalPageLayout pattern. Use the Marketplace card style for vehicle cards.

---

## TASK 3: Local Wheels Dashboard

Create `src/pages/LocalWheels.tsx`:

1. **Fleet Overview** — cards showing each fleet vehicle with Earn-Down progress bar (remaining_balance / purchase_price)
2. **Driver Assignment** — admin can assign drivers to vehicles
3. **Earnings Tracker** — total earned, total earn-down applied, projected payoff date
4. **Apply to Drive** button for members — creates a crew_call-style application

Route: `/local-wheels`

---

## TASK 4: Rideshare Routes Page

Create `src/pages/RideshareRoutes.tsx`:

1. **Browse Routes** — list of active routes with origin → destination, departure time, days, seats available
2. **Post a Route** — form: origin, destination, departure time, return time, days (checkboxes), seats, vehicle description
3. **Request Match** — rider clicks "Request Ride" on a route, driver approves/rejects
4. **My Routes** tab — driver's posted routes with match requests
5. **My Rides** tab — rider's matched routes

Route: `/rideshare-routes`

Important: This is person-to-person, own insurance. LB is a matching service only. Display this clearly.

---

## TASK 5: Safety Ledger Integration

In all three vehicle systems, when a trip begins:

1. Prompt both driver and passenger to take a selfie (camera API or file upload)
2. Capture GPS coordinates
3. Create `safety_ledger` entry with photos, location, timestamp
4. When trip ends, update with end location and timestamp

This is for evidentiary purposes — protect both parties. Display a clear notice: "For your safety, photos and location are recorded at trip start and end."

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260322000016_vehicle_systems.sql` | All vehicle tables + RLS |
| `src/pages/LemonLot.tsx` | P2P vehicle sharing marketplace |
| `src/pages/LocalWheels.tsx` | Fleet vehicles + Earn-Down dashboard |
| `src/pages/RideshareRoutes.tsx` | Commute matching |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes: `/lemon-lot`, `/local-wheels`, `/rideshare-routes` |

---

## DEPLOY CHECKLIST

1. `npx supabase db push --linked`
2. Test: List a vehicle on Lemon Lot → see it in browse view
3. Test: Post a rideshare route → see it in route list
4. Test: Safety Ledger photo capture at trip start
5. Deploy to Firebase

---

## SUCCESS CRITERIA

- [ ] Lemon Lot: list vehicle, browse, request rental, owner earnings
- [ ] Local Wheels: fleet view, Earn-Down progress, driver assignment
- [ ] Rideshare Routes: post route, request match, driver approval
- [ ] Safety Ledger: photos + GPS at trip start/end
- [ ] All tables have proper RLS (owner sees own, public sees available)
- [ ] Cost+20% floor enforced on Lemon Lot rates

---

**Three vehicle systems. One Rally Group. The road opens.**

**FOR THE KEEP.**
