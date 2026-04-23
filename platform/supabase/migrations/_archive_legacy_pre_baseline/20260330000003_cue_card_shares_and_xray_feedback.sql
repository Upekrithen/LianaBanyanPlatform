-- K169: Cue Card Shares + X-Ray Feedback (DD-3 Critical Path)

-- ============================================================
-- 1. cue_card_shares — personalized Cue Card share tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS cue_card_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  campaign_id UUID REFERENCES cue_card_campaigns(id),
  short_code TEXT UNIQUE NOT NULL,
  recipient_name TEXT,
  personal_message TEXT,
  featured_project_id UUID,
  call_to_action TEXT DEFAULT 'Check This Out',
  views INT DEFAULT 0,
  signups INT DEFAULT 0,
  projects_created INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cue_card_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator manages own shares" ON cue_card_shares FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Anyone can view for landing" ON cue_card_shares FOR SELECT USING (true);
CREATE INDEX idx_cue_card_shares_code ON cue_card_shares (short_code);
CREATE INDEX idx_cue_card_shares_creator ON cue_card_shares (creator_id);

-- ============================================================
-- 2. xray_feedback — pin-drop page feedback system
-- ============================================================
CREATE TABLE IF NOT EXISTS xray_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  page_url TEXT NOT NULL,
  page_title TEXT,
  category TEXT NOT NULL CHECK (category IN ('bug', 'question', 'suggestion', 'correction', 'praise')),
  message TEXT NOT NULL,
  pin_x FLOAT,
  pin_y FLOAT,
  screenshot_url TEXT,
  viewport_width INT,
  viewport_height INT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'wontfix')),
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE xray_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users submit own feedback" ON xray_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own feedback" ON xray_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin views all feedback" ON xray_feedback FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin updates feedback" ON xray_feedback FOR UPDATE USING (public.is_admin());

CREATE INDEX idx_xray_feedback_page ON xray_feedback (page_url);
CREATE INDEX idx_xray_feedback_status ON xray_feedback (status);
CREATE INDEX idx_xray_feedback_user ON xray_feedback (user_id);

-- ============================================================
-- 3. cue_card_attribution — tracks ONE-LEVEL referral chain
-- ============================================================
CREATE TABLE IF NOT EXISTS cue_card_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES cue_card_shares(id) NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('signup', 'project_created', 'project_backed')),
  marks_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(share_id, referred_user_id, action_type)
);

ALTER TABLE cue_card_attribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator views own attributions" ON cue_card_attribution FOR SELECT USING (
  EXISTS (SELECT 1 FROM cue_card_shares WHERE id = share_id AND creator_id = auth.uid())
);
CREATE POLICY "System inserts attributions" ON cue_card_attribution FOR INSERT WITH CHECK (true);
