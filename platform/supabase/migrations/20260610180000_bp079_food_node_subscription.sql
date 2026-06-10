-- BP079 Wave B — Food Node Subscription Shape
-- 2026-06-10
-- SEG-RC-B-Subscription+Libs (Sonnet 4.6, Statute §3)
--
-- Creates food_node_subscriptions table for Let's Make Dinner food business subscriptions.
-- Decision: Option A (new table) chosen over Option B (extend excalibur_subscriptions)
-- Rationale: excalibur_subscriptions is tightly coupled to Excalibur Class commercial
-- product vertical (topic/category Scribe slices). Food node subscriptions are a distinct
-- business model (weekly meal deliveries with physical delivery logistics).

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 1 — food_node_subscriptions table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.food_node_subscriptions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_business_entity_id   uuid NOT NULL REFERENCES public.entity_memberships(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_subscription_id    text UNIQUE,
  stripe_customer_id        text,
  stripe_price_id           text,

  -- Subscription configuration
  weekly_intake             int NOT NULL DEFAULT 1 CHECK (weekly_intake >= 1 AND weekly_intake <= 7),
  delivery_day              text CHECK (delivery_day IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  delivery_address          jsonb NOT NULL DEFAULT '{}',

  -- State machine
  status                    text NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','active','paused','canceled','suspended')),

  -- Attribution (Red Carpet introducer tracking)
  introducer_user_id        uuid REFERENCES auth.users(id),

  -- Timestamps
  created_at                timestamptz DEFAULT now(),
  activated_at              timestamptz,
  paused_at                 timestamptz,
  canceled_at               timestamptz,
  suspended_at              timestamptz,

  -- Audit
  cancellation_reason       text,
  suspension_reason         text
);

COMMENT ON TABLE public.food_node_subscriptions IS
  'BP079/Wave-B — Food node weekly meal subscription state machine. '
  'Let''s Make Dinner / food business subscriptions with delivery logistics. '
  'Status: pending → active → paused | canceled | suspended. '
  'introducer_user_id tracks Red Carpet attribution for promotion_attributions.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_node_subscriptions_subscriber
  ON public.food_node_subscriptions(subscriber_user_id, status);

CREATE INDEX IF NOT EXISTS idx_food_node_subscriptions_business
  ON public.food_node_subscriptions(food_business_entity_id, status);

CREATE INDEX IF NOT EXISTS idx_food_node_subscriptions_introducer
  ON public.food_node_subscriptions(introducer_user_id)
  WHERE introducer_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_food_node_subscriptions_stripe_sub
  ON public.food_node_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_food_node_subscriptions_stripe_customer
  ON public.food_node_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_food_node_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Track state transition timestamps
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    NEW.activated_at = now();
  END IF;

  IF NEW.status = 'paused' AND OLD.status != 'paused' THEN
    NEW.paused_at = now();
  END IF;

  IF NEW.status = 'canceled' AND OLD.status != 'canceled' THEN
    NEW.canceled_at = now();
  END IF;

  IF NEW.status = 'suspended' AND OLD.status != 'suspended' THEN
    NEW.suspended_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER food_node_subscriptions_state_tracking
  BEFORE UPDATE ON public.food_node_subscriptions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_food_node_subscriptions_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 2 — Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.food_node_subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscribers can view their own subscriptions
CREATE POLICY "Subscribers view own food subscriptions"
  ON public.food_node_subscriptions
  FOR SELECT
  USING (auth.uid() = subscriber_user_id);

-- Food business owners can view subscriptions to their business
-- (via entity_memberships.user_id join)
CREATE POLICY "Food business owners view their subs"
  ON public.food_node_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.entity_memberships
      WHERE entity_memberships.id = food_node_subscriptions.food_business_entity_id
      AND entity_memberships.user_id = auth.uid()
    )
  );

-- Service role full access
CREATE POLICY "Service role full access to food node subs"
  ON public.food_node_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 3 — Stripe webhook metadata extraction helper (future use)
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.food_node_subscriptions.stripe_subscription_id IS
  'Stripe subscription ID. Webhook handler will match via this field. '
  'Metadata: { subscriber_user_id, food_business_entity_id, introducer_user_id, weekly_intake, delivery_day }';

COMMENT ON COLUMN public.food_node_subscriptions.stripe_price_id IS
  'Stripe Price ID (e.g., STRIPE_PRICE_FOOD_NODE_WEEKLY env var). '
  'Future: per-business custom pricing tiers.';

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
