-- ═══════════════════════════════════════════════════════════════════════════════
-- ATTI CAMPAIGN — Innovation #1555
-- Physical-to-Digital Marketing Infrastructure
-- "All That That Implies"
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Card Designs (Bifrost card builder)
CREATE TABLE IF NOT EXISTS atti_card_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL DEFAULT 'default',
  initiative TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'business' CHECK (format IN ('business', 'postcard')),
  headline TEXT NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  color_scheme TEXT NOT NULL DEFAULT 'platform',
  back_text TEXT,
  referrer_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  quantity_ordered INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'printed', 'distributed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Campaign Scans (QR code scan tracking)
CREATE TABLE IF NOT EXISTS atti_campaign_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES atti_card_designs(id) ON DELETE SET NULL,
  referrer_code TEXT,
  session_id TEXT NOT NULL,
  device_type TEXT,
  initiative TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  registered_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ
);

-- 3. Engagement Clicks (meaningful interaction tracking)
CREATE TABLE IF NOT EXISTS atti_engagement_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  scan_id UUID REFERENCES atti_campaign_scans(id) ON DELETE CASCADE,
  click_type TEXT NOT NULL CHECK (click_type IN ('explore', 'interact', 'share', 'co_adjust', 'quiz', 'section_view')),
  section_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Engagement Progress (locks, candle bursts — per session)
CREATE TABLE IF NOT EXISTS atti_engagement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  scan_id UUID REFERENCES atti_campaign_scans(id) ON DELETE CASCADE,
  meaningful_clicks INT NOT NULL DEFAULT 0,
  locks_earned INT NOT NULL DEFAULT 0,
  candle_burst_triggered BOOLEAN NOT NULL DEFAULT false,
  candle_burst_at TIMESTAMPTZ,
  funnel_stage TEXT NOT NULL DEFAULT 'scan' CHECK (funnel_stage IN ('scan', 'explore', 'engage', 'ignite', 'transact')),
  registered_at TIMESTAMPTZ,
  first_transaction_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_click_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Referral Chains (daisy chain tracking)
CREATE TABLE IF NOT EXISTS atti_referral_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES atti_card_designs(id) ON DELETE SET NULL,
  chain_depth INT NOT NULL DEFAULT 1 CHECK (chain_depth BETWEEN 1 AND 3),
  marks_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_atti_scans_session ON atti_campaign_scans(session_id);
CREATE INDEX IF NOT EXISTS idx_atti_scans_referrer ON atti_campaign_scans(referrer_code);
CREATE INDEX IF NOT EXISTS idx_atti_clicks_session ON atti_engagement_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_atti_progress_session ON atti_engagement_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_atti_cards_creator ON atti_card_designs(creator_id);
CREATE INDEX IF NOT EXISTS idx_atti_referrals_referrer ON atti_referral_chains(referrer_id);

-- ── RLS Policies ──
ALTER TABLE atti_card_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE atti_campaign_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE atti_engagement_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE atti_engagement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE atti_referral_chains ENABLE ROW LEVEL SECURITY;

-- Card Designs: creators can CRUD their own designs
CREATE POLICY "Users can read own card designs"
  ON atti_card_designs FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create card designs"
  ON atti_card_designs FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own card designs"
  ON atti_card_designs FOR UPDATE
  USING (auth.uid() = creator_id);

-- Campaign Scans: public insert (QR scans from anonymous users), user reads own
CREATE POLICY "Anyone can create scans"
  ON atti_campaign_scans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read scans linked to them"
  ON atti_campaign_scans FOR SELECT
  USING (registered_user_id = auth.uid());

-- Engagement Clicks: public insert (anonymous tracking), no reads needed
CREATE POLICY "Anyone can create engagement clicks"
  ON atti_engagement_clicks FOR INSERT
  WITH CHECK (true);

-- Engagement Progress: public insert/update (session-based), no user reads
CREATE POLICY "Anyone can create engagement progress"
  ON atti_engagement_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update engagement progress"
  ON atti_engagement_progress FOR UPDATE
  USING (true);

-- Referral Chains: users can read their own chains
CREATE POLICY "Users can read own referral chains"
  ON atti_referral_chains FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Admin policies (Founder access)
CREATE POLICY "Admin full access card designs"
  ON atti_card_designs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin full access scans"
  ON atti_campaign_scans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin full access clicks"
  ON atti_engagement_clicks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin full access progress"
  ON atti_engagement_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin full access referrals"
  ON atti_referral_chains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );
