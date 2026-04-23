-- K188: Cooperative Purchases — Group buying from Pearl Diver tips
-- Pearl Diver → Group Buy → Freezer Node → Family Table chain

CREATE TABLE IF NOT EXISTS cooperative_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id UUID REFERENCES resource_board_tips(id),
  initiator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  store_name TEXT,
  store_location TEXT,
  unit_price_retail NUMERIC,
  unit_price_cooperative NUMERIC,
  savings_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN unit_price_retail > 0
    THEN ROUND((1 - unit_price_cooperative / unit_price_retail) * 100, 1)
    ELSE 0 END
  ) STORED,
  target_quantity INTEGER NOT NULL,
  threshold_quantity INTEGER NOT NULL DEFAULT 5,
  current_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'gathering'
    CHECK (status IN ('gathering', 'threshold_met', 'ordered', 'delivered', 'canceled', 'expired')),
  participants JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cooperative_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active purchases"
  ON cooperative_purchases FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create purchases"
  ON cooperative_purchases FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Initiator can update own purchases"
  ON cooperative_purchases FOR UPDATE
  USING (auth.uid() = initiator_id);

CREATE POLICY "Participants can update joined purchases"
  ON cooperative_purchases FOR UPDATE
  USING (
    participants::jsonb @> jsonb_build_array(jsonb_build_object('member_id', auth.uid()::text))
  );

CREATE INDEX idx_cooperative_purchases_status ON cooperative_purchases(status);
CREATE INDEX idx_cooperative_purchases_tip ON cooperative_purchases(tip_id);
CREATE INDEX idx_cooperative_purchases_initiator ON cooperative_purchases(initiator_id);
CREATE INDEX idx_cooperative_purchases_expires ON cooperative_purchases(expires_at) WHERE status = 'gathering';

-- Innovation log
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (
  2111,
  'Cooperative Purchasing Chain',
  'Cross-role purchasing pipeline: Pearl Diver finds deals → members group-buy at volume discounts → Freezer Nodes source ingredients from cooperative purchases → batch-cook meals → meals appear in Family Table planner. Uses existing bulk pricing tiers (5+: 5%, 10+: 10%, 20+: 15%, 40+: 20%). Cost+20% pricing, creators keep 83.3%.',
  'commerce',
  'provisional'
) ON CONFLICT (innovation_number) DO NOTHING;
