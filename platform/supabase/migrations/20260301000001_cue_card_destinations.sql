-- ============================================================================
-- CUE CARD CONTEXTUAL DESTINATIONS
-- ============================================================================
-- Innovation #1355-#1362: Contextual Cue Card Routing
-- Your stamp, your identity — but configurable destination context
-- 
-- Integrates with:
-- - Slingshot Pass-Through (#1244-#1252) — Gravity well routing
-- - The Furnace (#1253-#1260) — Verification registry
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CUE CARD DESTINATIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cue_card_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Which Cue Card template this destination applies to (NULL = default for all)
  cue_card_template_id UUID REFERENCES cue_card_templates(id),
  
  -- Destination configuration
  destination_type TEXT NOT NULL CHECK (destination_type IN (
    'single_project',   -- Route to exactly one project
    'multi_project',    -- Show chooser with multiple projects
    'category',         -- Show all projects in a category
    'portfolio'         -- Show full portfolio (default behavior)
  )),
  
  -- For single_project or multi_project: which project(s)
  project_ids UUID[] DEFAULT '{}',
  
  -- For category: which category and filter
  category_slug TEXT,
  include_owned_only BOOLEAN DEFAULT false,  -- Only MY projects in category?
  
  -- For portfolio: optional filter
  portfolio_filter TEXT,
  
  -- Attribution tracking
  is_own_project BOOLEAN DEFAULT true,       -- Do I own these projects?
  promotion_credit_rate NUMERIC(5,2) DEFAULT 0,  -- % credit for promoting others
  
  -- Display metadata
  display_name TEXT,  -- "My Food Projects", "HexIsle Launch", etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Each user can have one destination config per template
  UNIQUE(user_id, cue_card_template_id)
);

-- Index for fast lookup by context ID (used in RedCarpet routing)
CREATE INDEX IF NOT EXISTS idx_cue_card_destinations_lookup 
  ON cue_card_destinations(id, user_id);

-- Index for user's destinations
CREATE INDEX IF NOT EXISTS idx_cue_card_destinations_user 
  ON cue_card_destinations(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PROMOTION ATTRIBUTION TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Tracks when someone promotes a project they don't own

CREATE TABLE IF NOT EXISTS promotion_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who promoted
  promoter_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- What was promoted
  project_id UUID NOT NULL,
  destination_id UUID REFERENCES cue_card_destinations(id),
  
  -- Who clicked
  clicker_id UUID REFERENCES auth.users(id),
  clicker_ghost_id TEXT,  -- For ghost users
  
  -- Attribution details
  click_source TEXT,  -- 'qr_scan', 'social_share', 'direct_link'
  platform TEXT,      -- 'tiktok', 'twitter', 'linkedin', etc.
  
  -- Credit awarded
  marks_awarded NUMERIC(10,2) DEFAULT 0,
  
  -- Conversion tracking
  converted_to_signup BOOLEAN DEFAULT false,
  converted_to_backer BOOLEAN DEFAULT false,
  conversion_value NUMERIC(12,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for promoter's attributions
CREATE INDEX IF NOT EXISTS idx_promotion_attributions_promoter 
  ON promotion_attributions(promoter_id);

-- Index for project attributions
CREATE INDEX IF NOT EXISTS idx_promotion_attributions_project 
  ON promotion_attributions(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. LEVIATHAN CUE CARD REGISTRY
-- ─────────────────────────────────────────────────────────────────────────────
-- Central registry for all Cue Cards (for Furnace verification)

CREATE TABLE IF NOT EXISTS leviathan_cue_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Card identification
  card_code TEXT UNIQUE NOT NULL,  -- e.g., "CC-2026-03-01-X9F2"
  
  -- Ownership
  stamp_owner_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Destination binding
  destination_id UUID REFERENCES cue_card_destinations(id),
  destination_type TEXT,
  bound_project_ids UUID[],
  
  -- Security
  payload_hash TEXT NOT NULL,  -- SHA-256 of signed payload
  signature TEXT NOT NULL,     -- HMAC signature for verification
  
  -- Verification status
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN (
    'verified', 'pending', 'suspicious', 'blocked'
  )),
  trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100),
  
  -- Usage statistics
  total_scans INTEGER DEFAULT 0,
  last_scan_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for verification lookups
CREATE INDEX IF NOT EXISTS idx_leviathan_cue_cards_code 
  ON leviathan_cue_cards(card_code);

CREATE INDEX IF NOT EXISTS idx_leviathan_cue_cards_hash 
  ON leviathan_cue_cards(payload_hash);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DNA LOCK PARAMETERS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES 
  ('promotion_click_marks', '1', 'numeric', true, 'SYSTEM', 'MARKS earned per click when promoting others projects', 'economics'),
  ('promotion_signup_marks', '5', 'numeric', true, 'SYSTEM', 'MARKS earned when promotion leads to signup', 'economics'),
  ('promotion_conversion_rate', '0.10', 'numeric', true, 'SYSTEM', 'Percentage of MARKS reward for backer conversion (10%)', 'economics'),
  ('promotion_financial_referral_rate', '0.05', 'numeric', true, 'SYSTEM', 'Percentage of financial backing as referral (5%)', 'economics'),
  ('cue_card_signature_secret_rotation_days', '90', 'numeric', true, 'SYSTEM', 'Days between signature secret rotation', 'security'),
  ('max_projects_per_destination', '10', 'numeric', true, 'SYSTEM', 'Maximum projects in a multi_project destination', 'limits')
ON CONFLICT (parameter_key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE cue_card_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leviathan_cue_cards ENABLE ROW LEVEL SECURITY;

-- Destinations: Users can manage their own
CREATE POLICY "Users can view own destinations" ON cue_card_destinations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own destinations" ON cue_card_destinations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own destinations" ON cue_card_destinations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own destinations" ON cue_card_destinations
  FOR DELETE USING (auth.uid() = user_id);

-- Promotion attributions: Users can view their own
CREATE POLICY "Users can view own promotions" ON promotion_attributions
  FOR SELECT USING (auth.uid() = promoter_id);

-- Leviathan: Public read for verification, owner write
CREATE POLICY "Anyone can verify cue cards" ON leviathan_cue_cards
  FOR SELECT USING (true);

CREATE POLICY "Owners can register cue cards" ON leviathan_cue_cards
  FOR INSERT WITH CHECK (auth.uid() = stamp_owner_id);

CREATE POLICY "Owners can update own cue cards" ON leviathan_cue_cards
  FOR UPDATE USING (auth.uid() = stamp_owner_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Generate a unique card code
CREATE OR REPLACE FUNCTION generate_cue_card_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := 'CC-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-' || 
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    SELECT EXISTS(SELECT 1 FROM leviathan_cue_cards WHERE card_code = code) INTO exists_check;
    
    IF NOT exists_check THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a destination and register in Leviathan
CREATE OR REPLACE FUNCTION create_cue_card_destination(
  p_user_id UUID,
  p_template_id UUID,
  p_destination_type TEXT,
  p_project_ids UUID[] DEFAULT '{}',
  p_category_slug TEXT DEFAULT NULL,
  p_include_owned_only BOOLEAN DEFAULT false,
  p_is_own_project BOOLEAN DEFAULT true,
  p_display_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_destination_id UUID;
  v_card_code TEXT;
  v_payload TEXT;
  v_payload_hash TEXT;
  v_signature TEXT;
BEGIN
  -- Create the destination
  INSERT INTO cue_card_destinations (
    user_id, cue_card_template_id, destination_type,
    project_ids, category_slug, include_owned_only,
    is_own_project, display_name
  ) VALUES (
    p_user_id, p_template_id, p_destination_type,
    p_project_ids, p_category_slug, p_include_owned_only,
    p_is_own_project, p_display_name
  )
  ON CONFLICT (user_id, cue_card_template_id) 
  DO UPDATE SET
    destination_type = EXCLUDED.destination_type,
    project_ids = EXCLUDED.project_ids,
    category_slug = EXCLUDED.category_slug,
    include_owned_only = EXCLUDED.include_owned_only,
    is_own_project = EXCLUDED.is_own_project,
    display_name = EXCLUDED.display_name,
    updated_at = NOW()
  RETURNING id INTO v_destination_id;
  
  -- Generate card code
  v_card_code := generate_cue_card_code();
  
  -- Create payload for hashing
  v_payload := p_user_id::TEXT || ':' || v_destination_id::TEXT || ':' || EXTRACT(EPOCH FROM NOW())::TEXT;
  v_payload_hash := ENCODE(SHA256(v_payload::BYTEA), 'hex');
  
  -- Simple signature (in production, use proper HMAC with secret)
  v_signature := ENCODE(SHA256((v_payload || ':secret')::BYTEA), 'hex');
  
  -- Register in Leviathan
  INSERT INTO leviathan_cue_cards (
    card_code, stamp_owner_id, destination_id, destination_type,
    bound_project_ids, payload_hash, signature
  ) VALUES (
    v_card_code, p_user_id, v_destination_id, p_destination_type,
    p_project_ids, v_payload_hash, v_signature
  )
  ON CONFLICT DO NOTHING;
  
  RETURN JSON_BUILD_OBJECT(
    'destination_id', v_destination_id,
    'card_code', v_card_code,
    'context_url', 'https://lianabanyan.com/RedCarpet?herald=' || p_user_id || '&ctx=' || v_destination_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify a cue card (for Furnace)
CREATE OR REPLACE FUNCTION verify_cue_card(
  p_herald_id UUID,
  p_context_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_destination RECORD;
  v_leviathan RECORD;
  v_owner RECORD;
  v_projects JSON;
BEGIN
  -- Fetch destination
  SELECT * INTO v_destination
  FROM cue_card_destinations
  WHERE id = p_context_id AND user_id = p_herald_id;
  
  IF NOT FOUND THEN
    RETURN JSON_BUILD_OBJECT(
      'valid', false,
      'error', 'Destination not found or does not belong to herald'
    );
  END IF;
  
  -- Fetch Leviathan record
  SELECT * INTO v_leviathan
  FROM leviathan_cue_cards
  WHERE destination_id = p_context_id;
  
  -- Fetch owner info
  SELECT display_name, full_name INTO v_owner
  FROM profiles
  WHERE id = p_herald_id;
  
  -- Fetch bound projects
  IF v_destination.destination_type IN ('single_project', 'multi_project') THEN
    SELECT JSON_AGG(JSON_BUILD_OBJECT('id', p.id, 'name', p.name))
    INTO v_projects
    FROM projects p
    WHERE p.id = ANY(v_destination.project_ids);
  END IF;
  
  -- Increment scan count
  UPDATE leviathan_cue_cards
  SET total_scans = total_scans + 1, last_scan_at = NOW()
  WHERE destination_id = p_context_id;
  
  RETURN JSON_BUILD_OBJECT(
    'valid', true,
    'verification_status', COALESCE(v_leviathan.verification_status, 'verified'),
    'trust_score', COALESCE(v_leviathan.trust_score, 100),
    'card_code', v_leviathan.card_code,
    'stamp_owner', COALESCE(v_owner.display_name, v_owner.full_name, 'Unknown'),
    'destination_type', v_destination.destination_type,
    'bound_projects', v_projects,
    'category_slug', v_destination.category_slug,
    'is_own_project', v_destination.is_own_project,
    'total_scans', COALESCE(v_leviathan.total_scans, 0) + 1,
    'created_at', v_destination.created_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record promotion attribution
CREATE OR REPLACE FUNCTION record_promotion_click(
  p_promoter_id UUID,
  p_project_id UUID,
  p_destination_id UUID,
  p_clicker_id UUID DEFAULT NULL,
  p_clicker_ghost_id TEXT DEFAULT NULL,
  p_click_source TEXT DEFAULT 'qr_scan',
  p_platform TEXT DEFAULT 'direct'
)
RETURNS JSON AS $$
DECLARE
  v_marks NUMERIC;
  v_attribution_id UUID;
BEGIN
  -- Get marks per click from DNA Lock
  SELECT COALESCE(param_value::NUMERIC, 1) INTO v_marks
  FROM dna_lock WHERE param_key = 'promotion_click_marks';
  
  -- Insert attribution
  INSERT INTO promotion_attributions (
    promoter_id, project_id, destination_id,
    clicker_id, clicker_ghost_id,
    click_source, platform, marks_awarded
  ) VALUES (
    p_promoter_id, p_project_id, p_destination_id,
    p_clicker_id, p_clicker_ghost_id,
    p_click_source, p_platform, v_marks
  )
  RETURNING id INTO v_attribution_id;
  
  -- Award marks to promoter
  UPDATE user_marks
  SET total_marks = total_marks + v_marks
  WHERE user_id = p_promoter_id;
  
  RETURN JSON_BUILD_OBJECT(
    'attribution_id', v_attribution_id,
    'marks_awarded', v_marks
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

-- User's destinations with project names
CREATE OR REPLACE VIEW v_user_cue_card_destinations AS
SELECT 
  d.*,
  t.title AS template_title,
  (
    SELECT JSON_AGG(JSON_BUILD_OBJECT('id', p.id, 'name', p.name))
    FROM projects p
    WHERE p.id = ANY(d.project_ids)
  ) AS bound_projects_detail
FROM cue_card_destinations d
LEFT JOIN cue_card_templates t ON t.id = d.cue_card_template_id;

-- Promotion leaderboard
CREATE OR REPLACE VIEW v_promotion_leaderboard AS
SELECT 
  promoter_id,
  COUNT(*) AS total_clicks,
  SUM(marks_awarded) AS total_marks_earned,
  COUNT(DISTINCT project_id) AS projects_promoted,
  SUM(CASE WHEN converted_to_signup THEN 1 ELSE 0 END) AS signups_generated,
  SUM(CASE WHEN converted_to_backer THEN 1 ELSE 0 END) AS backers_generated
FROM promotion_attributions
GROUP BY promoter_id
ORDER BY total_marks_earned DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION COMPLETE
-- ─────────────────────────────────────────────────────────────────────────────
-- Innovation #1355-#1362: Contextual Cue Card Routing
-- Integrates with Slingshot (#1244-#1252) and Furnace (#1253-#1260)
-- ─────────────────────────────────────────────────────────────────────────────
