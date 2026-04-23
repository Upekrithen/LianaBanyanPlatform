-- K180: Bounty Photography Network (Innovation #2100)
-- Zero-storage, dual-channel photography system.
-- LB stores ~850 bytes of metadata per claim. Photos live on Instagram/TikTok/etc.
-- Named photo_bounties / photo_bounty_claims to avoid collision with existing bounties table.

CREATE TABLE IF NOT EXISTS photo_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  business_name TEXT NOT NULL,
  business_address TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  bounty_type TEXT NOT NULL DEFAULT 'photography' CHECK (bounty_type IN ('photography', 'video', 'review')),
  marks_reward INTEGER NOT NULL DEFAULT 2,
  max_claims INTEGER NOT NULL DEFAULT 10,
  claims_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired')),
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photo_bounty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bounty_id UUID REFERENCES photo_bounties(id) ON DELETE SET NULL,
  social_url TEXT NOT NULL,
  social_platform TEXT NOT NULL CHECK (social_platform IN ('instagram', 'tiktok', 'facebook', 'x')),
  business_name TEXT NOT NULL,
  business_id UUID,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  description TEXT,
  marks_awarded INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photo_bounties_status ON photo_bounties(status);
CREATE INDEX IF NOT EXISTS idx_photo_bounties_business ON photo_bounties(business_id);
CREATE INDEX IF NOT EXISTS idx_photo_bounty_claims_member ON photo_bounty_claims(member_id);
CREATE INDEX IF NOT EXISTS idx_photo_bounty_claims_bounty ON photo_bounty_claims(bounty_id);
CREATE INDEX IF NOT EXISTS idx_photo_bounty_claims_status ON photo_bounty_claims(status);
CREATE INDEX IF NOT EXISTS idx_photo_bounty_claims_platform ON photo_bounty_claims(social_platform);

-- RLS
ALTER TABLE photo_bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_bounty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photo_bounties_select" ON photo_bounties FOR SELECT USING (true);
CREATE POLICY "photo_bounties_insert" ON photo_bounties FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "photo_bounties_update" ON photo_bounties FOR UPDATE
  USING (posted_by = auth.uid() OR public.is_admin());

CREATE POLICY "photo_claims_select" ON photo_bounty_claims FOR SELECT
  USING (member_id = auth.uid() OR status = 'verified' OR public.is_admin());
CREATE POLICY "photo_claims_insert" ON photo_bounty_claims FOR INSERT
  WITH CHECK (member_id = auth.uid());
CREATE POLICY "photo_claims_update" ON photo_bounty_claims FOR UPDATE
  USING (member_id = auth.uid() OR public.is_admin());

-- Auto-increment claims_count when a claim is verified
CREATE OR REPLACE FUNCTION increment_photo_bounty_claims_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    UPDATE photo_bounties
    SET claims_count = claims_count + 1,
        status = CASE WHEN claims_count + 1 >= max_claims THEN 'filled' ELSE status END
    WHERE id = NEW.bounty_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_photo_bounty_claims_verified
  AFTER INSERT OR UPDATE ON photo_bounty_claims
  FOR EACH ROW
  EXECUTE FUNCTION increment_photo_bounty_claims_count();

-- Award Marks on verified claim via shadow_marks_ledger
CREATE OR REPLACE FUNCTION award_photography_marks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    INSERT INTO shadow_marks_ledger (user_id, amount, reason, source_type, source_id)
    VALUES (
      NEW.member_id,
      NEW.marks_awarded,
      'Photography bounty: ' || NEW.business_name,
      'bounty_claim',
      NEW.id
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_award_photography_marks
  AFTER INSERT OR UPDATE ON photo_bounty_claims
  FOR EACH ROW
  EXECUTE FUNCTION award_photography_marks();

-- Seed sample photography bounties
INSERT INTO photo_bounties (business_name, business_address, bounty_type, marks_reward, max_claims, status)
VALUES
  ('Rosa''s Bakery', '123 Main St', 'photography', 2, 10, 'active'),
  ('Miguel''s Taco Truck', '456 Oak Ave', 'photography', 2, 10, 'active'),
  ('Westside Food Bank', '789 Elm Dr', 'photography', 3, 5, 'active'),
  ('Neighbor Care Network', '321 Pine Rd', 'photography', 2, 10, 'active'),
  ('Downtown Coffee Co.', '100 Center St', 'photography', 2, 10, 'active');
