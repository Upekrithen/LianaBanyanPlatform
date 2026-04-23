-- ============================================================================
-- FOOD ECOSYSTEM PHASE 4: DELIVERY JOBS
-- ============================================================================
-- Micro-local delivery system with:
-- - Job posting when aggregated orders reach threshold
-- - Worker pickup and delivery tracking
-- - Stripe payment authorization and reimbursement
-- - Reputation points for successful deliveries
-- ============================================================================

-- ============================================================================
-- 1. GROCERY DELIVERY JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS grocery_delivery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  micro_local_area TEXT NOT NULL, -- Zip code or neighborhood
  pickup_location TEXT NOT NULL,
  pickup_address TEXT,
  pickup_coordinates POINT,

  -- Aggregated order reference
  aggregated_order_id UUID, -- Reference to LGS aggregated order
  shopping_list_ids UUID[] DEFAULT '{}', -- Shopping lists included

  -- Worker assignment
  worker_id UUID REFERENCES auth.users(id),
  worker_accepted_at TIMESTAMPTZ,

  -- Delivery details
  delivery_count INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  total_weight_lbs NUMERIC,

  -- Payment
  total_order_value NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0, -- Base fee
  tip_amount NUMERIC DEFAULT 0,
  total_reimbursement NUMERIC GENERATED ALWAYS AS (delivery_fee + COALESCE(tip_amount, 0)) STORED,

  -- Status
  status TEXT DEFAULT 'posted' CHECK (status IN (
    'posted', -- Waiting for worker
    'accepted', -- Worker accepted
    'picking_up', -- Worker at pickup location
    'in_transit', -- Deliveries in progress
    'completed', -- All deliveries done
    'cancelled' -- Job cancelled
  )),

  -- Timestamps
  posted_at TIMESTAMPTZ DEFAULT now(),
  pickup_started_at TIMESTAMPTZ,
  pickup_completed_at TIMESTAMPTZ,
  first_delivery_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_jobs_area ON grocery_delivery_jobs(micro_local_area);
CREATE INDEX IF NOT EXISTS idx_delivery_jobs_status ON grocery_delivery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_delivery_jobs_worker ON grocery_delivery_jobs(worker_id);
CREATE INDEX IF NOT EXISTS idx_delivery_jobs_posted ON grocery_delivery_jobs(posted_at DESC) WHERE status = 'posted';

-- ============================================================================
-- 2. GROCERY DELIVERY RECIPIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS grocery_delivery_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES grocery_delivery_jobs(id) ON DELETE CASCADE NOT NULL,

  -- Recipient
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  shopping_list_id UUID REFERENCES family_shopping_lists(id),

  -- Delivery address
  delivery_address TEXT NOT NULL,
  delivery_instructions TEXT,
  delivery_coordinates POINT,

  -- Order details
  item_count INTEGER DEFAULT 0,
  order_amount NUMERIC NOT NULL DEFAULT 0,

  -- Stripe payment
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_authorized BOOLEAN DEFAULT false,
  payment_authorized_at TIMESTAMPTZ,
  payment_captured BOOLEAN DEFAULT false,
  payment_captured_at TIMESTAMPTZ,
  amount_charged NUMERIC,

  -- Delivery status
  delivery_order INTEGER DEFAULT 0, -- Order in delivery route
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', -- Waiting for delivery
    'en_route', -- Worker heading to location
    'arrived', -- Worker at location
    'delivered', -- Confirmed delivered
    'failed' -- Delivery failed
  )),
  delivered_at TIMESTAMPTZ,
  delivery_photo_url TEXT, -- Proof of delivery

  -- Confirmation
  recipient_confirmed BOOLEAN DEFAULT false,
  recipient_confirmed_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_recipients_job ON grocery_delivery_recipients(job_id);
CREATE INDEX IF NOT EXISTS idx_delivery_recipients_user ON grocery_delivery_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_recipients_status ON grocery_delivery_recipients(status);

-- ============================================================================
-- 3. WORKER DELIVERY STATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_worker_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),

  -- Totals
  total_jobs_completed INTEGER DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  total_tips NUMERIC DEFAULT 0,

  -- Averages
  average_rating NUMERIC,
  average_delivery_time_minutes NUMERIC,

  -- Current period
  jobs_this_week INTEGER DEFAULT 0,
  earnings_this_week NUMERIC DEFAULT 0,
  jobs_this_month INTEGER DEFAULT 0,
  earnings_this_month NUMERIC DEFAULT 0,

  -- Badges (will be linked to badge system)
  delivery_badge_level INTEGER DEFAULT 0,
  is_verified_driver BOOLEAN DEFAULT false,

  -- Last activity
  last_job_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. MICRO-LOCAL AREAS TABLE
-- ============================================================================
-- Defines micro-local delivery zones
CREATE TABLE IF NOT EXISTS micro_local_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  area_code TEXT UNIQUE NOT NULL, -- Zip code or custom area ID
  name TEXT NOT NULL,
  description TEXT,

  -- Boundaries (simplified)
  zip_codes TEXT[] DEFAULT '{}',
  city TEXT,
  state TEXT,

  -- Volume discount thresholds
  min_orders_for_job INTEGER DEFAULT 3, -- Minimum orders to create job
  volume_discount_tiers JSONB DEFAULT '[
    {"min_orders": 5, "discount_percent": 10},
    {"min_orders": 10, "discount_percent": 15},
    {"min_orders": 20, "discount_percent": 20}
  ]',

  -- Delivery settings
  base_delivery_fee NUMERIC DEFAULT 5.00,
  per_mile_fee NUMERIC DEFAULT 0.50,
  max_delivery_radius_miles NUMERIC DEFAULT 10,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_micro_local_active ON micro_local_areas(is_active) WHERE is_active = true;

-- ============================================================================
-- 5. AGGREGATION WINDOWS TABLE
-- ============================================================================
-- Tracks aggregation windows for building delivery jobs
CREATE TABLE IF NOT EXISTS delivery_aggregation_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  micro_local_area_id UUID REFERENCES micro_local_areas(id),

  -- Timing
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time_slot TEXT, -- 'morning', 'afternoon', 'evening'

  -- Aggregation status
  order_count INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  shopping_list_ids UUID[] DEFAULT '{}',

  -- Result
  job_id UUID REFERENCES grocery_delivery_jobs(id),
  job_created_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'job_created', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aggregation_windows_area ON delivery_aggregation_windows(micro_local_area_id);
CREATE INDEX IF NOT EXISTS idx_aggregation_windows_open ON delivery_aggregation_windows(status) WHERE status = 'open';

-- ============================================================================
-- 6. FUNCTIONS
-- ============================================================================

-- Function to create delivery job from aggregation window
CREATE OR REPLACE FUNCTION create_delivery_job_from_window(p_window_id UUID)
RETURNS UUID AS $$
DECLARE
  v_window RECORD;
  v_area RECORD;
  v_job_id UUID;
BEGIN
  -- Get window details
  SELECT * INTO v_window FROM delivery_aggregation_windows WHERE id = p_window_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aggregation window not found';
  END IF;

  -- Get area details
  SELECT * INTO v_area FROM micro_local_areas WHERE id = v_window.micro_local_area_id;

  -- Create job
  INSERT INTO grocery_delivery_jobs (
    micro_local_area,
    pickup_location,
    shopping_list_ids,
    total_order_value,
    delivery_fee,
    status
  ) VALUES (
    v_area.area_code,
    v_area.name, -- Pickup location TBD
    v_window.shopping_list_ids,
    v_window.total_value,
    v_area.base_delivery_fee,
    'posted'
  ) RETURNING id INTO v_job_id;

  -- Update window
  UPDATE delivery_aggregation_windows SET
    job_id = v_job_id,
    job_created_at = now(),
    status = 'job_created'
  WHERE id = p_window_id;

  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a delivery job
CREATE OR REPLACE FUNCTION accept_delivery_job(p_job_id UUID, p_worker_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Check current status
  SELECT status INTO v_current_status FROM grocery_delivery_jobs WHERE id = p_job_id;

  IF v_current_status != 'posted' THEN
    RETURN FALSE;
  END IF;

  -- Accept job
  UPDATE grocery_delivery_jobs SET
    worker_id = p_worker_id,
    worker_accepted_at = now(),
    status = 'accepted',
    updated_at = now()
  WHERE id = p_job_id AND status = 'posted';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a delivery
CREATE OR REPLACE FUNCTION complete_delivery(
  p_recipient_id UUID,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_job_id UUID;
  v_all_delivered BOOLEAN;
BEGIN
  -- Update recipient
  UPDATE grocery_delivery_recipients SET
    status = 'delivered',
    delivered_at = now(),
    delivery_photo_url = p_photo_url
  WHERE id = p_recipient_id
  RETURNING job_id INTO v_job_id;

  -- Check if all recipients delivered
  SELECT NOT EXISTS (
    SELECT 1 FROM grocery_delivery_recipients
    WHERE job_id = v_job_id AND status != 'delivered'
  ) INTO v_all_delivered;

  -- Update job if all done
  IF v_all_delivered THEN
    UPDATE grocery_delivery_jobs SET
      status = 'completed',
      completed_at = now(),
      updated_at = now()
    WHERE id = v_job_id;

    -- Update worker stats
    UPDATE delivery_worker_stats SET
      total_jobs_completed = total_jobs_completed + 1,
      last_job_at = now(),
      updated_at = now()
    WHERE user_id = (SELECT worker_id FROM grocery_delivery_jobs WHERE id = v_job_id);
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE grocery_delivery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_delivery_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_worker_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_local_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_aggregation_windows ENABLE ROW LEVEL SECURITY;

-- Jobs: Workers can see posted jobs, own accepted jobs, recipients can see their jobs
CREATE POLICY "delivery_jobs_select" ON grocery_delivery_jobs
  FOR SELECT USING (
    status = 'posted' -- Anyone can see posted jobs
    OR worker_id = auth.uid() -- Worker sees their jobs
    OR id IN ( -- Recipients see their jobs
      SELECT job_id FROM grocery_delivery_recipients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "delivery_jobs_update" ON grocery_delivery_jobs
  FOR UPDATE USING (worker_id = auth.uid());

-- Recipients: Users see their own deliveries
CREATE POLICY "delivery_recipients_select" ON grocery_delivery_recipients
  FOR SELECT USING (
    user_id = auth.uid()
    OR job_id IN (SELECT id FROM grocery_delivery_jobs WHERE worker_id = auth.uid())
  );

CREATE POLICY "delivery_recipients_update" ON grocery_delivery_recipients
  FOR UPDATE USING (
    user_id = auth.uid()
    OR job_id IN (SELECT id FROM grocery_delivery_jobs WHERE worker_id = auth.uid())
  );

-- Worker stats: Users see their own
CREATE POLICY "worker_stats_select" ON delivery_worker_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "worker_stats_update" ON delivery_worker_stats
  FOR UPDATE USING (user_id = auth.uid());

-- Micro-local areas: Public read
CREATE POLICY "micro_local_select" ON micro_local_areas
  FOR SELECT USING (is_active = true);

-- Aggregation windows: Members can see active
CREATE POLICY "aggregation_windows_select" ON delivery_aggregation_windows
  FOR SELECT USING (status IN ('open', 'job_created'));

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================
COMMENT ON TABLE grocery_delivery_jobs IS 'Delivery jobs created from aggregated shopping orders in micro-local areas';
COMMENT ON TABLE grocery_delivery_recipients IS 'Individual recipients in a delivery job with Stripe payment tracking';
COMMENT ON TABLE delivery_worker_stats IS 'Cumulative statistics for delivery workers';
COMMENT ON TABLE micro_local_areas IS 'Geographic areas for micro-local delivery aggregation';
COMMENT ON FUNCTION accept_delivery_job IS 'Worker accepts an available delivery job';
COMMENT ON FUNCTION complete_delivery IS 'Marks a delivery as complete and updates job status';
