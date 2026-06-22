-- BP091 M19 Block 1 — custom_orders table for variable-amount one-time payments
-- Bishop-direct per §15 BLOOD · Founder ratified R1-R7 + R8 (fire) 2026-06-22

CREATE TABLE IF NOT EXISTS public.custom_orders (
  id BIGSERIAL PRIMARY KEY,
  buyer_email TEXT,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  creator_stripe_account_id TEXT,
  product_label TEXT NOT NULL,
  description TEXT,
  items_json JSONB NOT NULL,
  total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents >= 100),
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded','cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS custom_orders_buyer_read ON public.custom_orders;
CREATE POLICY custom_orders_buyer_read ON public.custom_orders FOR SELECT
  USING (auth.uid() = buyer_user_id OR auth.uid() = creator_user_id);

DROP POLICY IF EXISTS custom_orders_service_role_all ON public.custom_orders;
CREATE POLICY custom_orders_service_role_all ON public.custom_orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_custom_orders_buyer_email ON public.custom_orders (buyer_email);
CREATE INDEX IF NOT EXISTS idx_custom_orders_buyer_user_id ON public.custom_orders (buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_creator_user_id ON public.custom_orders (creator_user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON public.custom_orders (status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_stripe_session_id ON public.custom_orders (stripe_session_id);
