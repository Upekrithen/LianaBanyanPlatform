-- ============================================
-- K120: Credit Purchase Tracking
-- Records of credit purchases via Stripe
-- (Stripe Connect tables already exist from K98)
-- ============================================

CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_credits INT NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  package_size TEXT,
  bonus_pct NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_credit_purchases_user ON credit_purchases(user_id, created_at DESC);
CREATE INDEX idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX idx_credit_purchases_stripe ON credit_purchases(stripe_session_id);

-- RLS
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own purchases" ON credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin manages all purchases" ON credit_purchases
  FOR ALL USING (public.is_admin());
