-- K355: The Luis Test — End-to-End Wiring
-- Schema additions to connect storefronts → checkout → escrow → subscriptions → crew

-- 0. Extend storefronts first (needed by policies below)
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS hiring_enabled BOOLEAN DEFAULT false;
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);

-- 1. Extend storefront_orders for service escrow + photo proof
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'none'
  CHECK (escrow_status IN ('none', 'held', 'released', 'disputed', 'auto_released'));
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS escrow_amount NUMERIC;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS before_photo_url TEXT;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS after_photo_url TEXT;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS customer_confirmed_at TIMESTAMPTZ;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS service_scheduled_at TIMESTAMPTZ;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS provider_notes TEXT;

-- 2. Extend subscription_tiers for storefront services
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS storefront_id UUID REFERENCES storefronts(id);
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS service_frequency TEXT
  CHECK (service_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly'));
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS service_description TEXT;

-- 3. Storefront subscription enrollments
CREATE TABLE IF NOT EXISTS storefront_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  subscriber_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES subscription_tiers(id),
  frequency TEXT NOT NULL DEFAULT 'monthly'
    CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  price_per_cycle NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'credits'
    CHECK (payment_method IN ('credits', 'stripe')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  next_service_date DATE,
  total_cycles_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(storefront_id, subscriber_user_id, tier_id)
);

ALTER TABLE storefront_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON storefront_subscriptions
  FOR SELECT USING (subscriber_user_id = auth.uid());

CREATE POLICY "Storefront owners can view subscriptions" ON storefront_subscriptions
  FOR SELECT USING (
    storefront_id IN (SELECT id FROM storefronts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own subscriptions" ON storefront_subscriptions
  FOR ALL USING (subscriber_user_id = auth.uid());

-- 4. Service routes (auto-generated from subscriptions)
CREATE TABLE IF NOT EXISTS service_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_user_id UUID NOT NULL REFERENCES auth.users(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  route_date DATE NOT NULL,
  neighborhood_slug TEXT,
  stop_count INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers see own routes" ON service_routes
  FOR SELECT USING (provider_user_id = auth.uid());

-- 5. Service route stops
CREATE TABLE IF NOT EXISTS service_route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES service_routes(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES storefront_subscriptions(id),
  order_index INTEGER NOT NULL DEFAULT 0,
  address_hint TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'skipped', 'rescheduled')),
  completed_at TIMESTAMPTZ,
  before_photo_url TEXT,
  after_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Route stop access via route owner" ON service_route_stops
  FOR ALL USING (
    route_id IN (SELECT id FROM service_routes WHERE provider_user_id = auth.uid())
  );

-- 6. (storefronts extended in step 0 above)

-- 7. Extend crew_call_roles for storefront association
ALTER TABLE crew_call_roles ADD COLUMN IF NOT EXISTS storefront_id UUID REFERENCES storefronts(id);
ALTER TABLE crew_call_roles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE crew_call_roles ADD COLUMN IF NOT EXISTS schedule_description TEXT;

-- 8. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_storefront_orders_buyer ON storefront_orders(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_storefront_orders_storefront ON storefront_orders(storefront_id);
CREATE INDEX IF NOT EXISTS idx_storefront_subscriptions_subscriber ON storefront_subscriptions(subscriber_user_id);
CREATE INDEX IF NOT EXISTS idx_storefront_subscriptions_storefront ON storefront_subscriptions(storefront_id);
CREATE INDEX IF NOT EXISTS idx_service_routes_provider_date ON service_routes(provider_user_id, route_date);
CREATE INDEX IF NOT EXISTS idx_crew_call_roles_storefront ON crew_call_roles(storefront_id);
