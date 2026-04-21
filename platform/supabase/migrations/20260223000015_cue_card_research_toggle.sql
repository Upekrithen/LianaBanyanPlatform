-- ═══════════════════════════════════════════════════════════════════════════════
-- CUE CARD RESEARCH TOGGLE SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════
-- Pre-decision commitment system for reciprocal research sharing.
-- Users decide to share data BEFORE launching campaigns, not after.
--
-- Key Innovation: Commitment Lock
-- - If you access research but don't send a campaign, toggle stays ON
-- - Prevents "peek and retreat" behavior
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── RESEARCH COMMITMENT LOCKS ───
-- Tracks when users access research and whether they fulfilled their commitment

CREATE TABLE IF NOT EXISTS public.research_commitment_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),

  -- Lock state
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  satisfied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '72 hours',

  -- What triggered the lock
  reason TEXT DEFAULT 'accessed_research_without_sending',
  research_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  campaign_sent_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_locks_user ON public.research_commitment_locks(user_id);
CREATE INDEX idx_research_locks_active ON public.research_commitment_locks(user_id, is_active) WHERE is_active = true;

-- ─── CUE CARD CAMPAIGNS ───
-- Extends cue card tracking with research commitment fields

CREATE TABLE IF NOT EXISTS public.cue_card_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),

  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  template_ids UUID[] DEFAULT '{}',  -- Which templates are in this campaign

  -- Research commitment (THE KEY INNOVATION)
  research_commitment BOOLEAN DEFAULT false,
  research_commitment_set_at TIMESTAMPTZ,
  research_pool_accessed BOOLEAN DEFAULT false,
  research_pool_accessed_at TIMESTAMPTZ,
  commitment_satisfied BOOLEAN DEFAULT false,
  commitment_satisfied_at TIMESTAMPTZ,

  -- Expiration settings (project owner controlled)
  default_expiration_hours INTEGER DEFAULT 24,
  expiration_type TEXT DEFAULT 'pass_through',  -- pass_through | first_time | referral | campaign

  -- Campaign status
  status TEXT DEFAULT 'draft',  -- draft | scheduled | active | completed | cancelled
  scheduled_at TIMESTAMPTZ,
  launched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Performance metrics (shared if research_commitment = true)
  cards_sent INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user ON public.cue_card_campaigns(user_id);
CREATE INDEX idx_campaigns_project ON public.cue_card_campaigns(project_id);
CREATE INDEX idx_campaigns_research ON public.cue_card_campaigns(research_commitment) WHERE research_commitment = true;
CREATE INDEX idx_campaigns_status ON public.cue_card_campaigns(status);

-- ─── TEMPLATE ATTRIBUTION ───
-- Tracks when templates are used and awards Marks to creators

CREATE TABLE IF NOT EXISTS public.template_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The template and its creator
  template_id UUID NOT NULL REFERENCES public.cue_card_templates(id),
  creator_id UUID NOT NULL REFERENCES auth.users(id),

  -- Who used it
  user_id UUID NOT NULL REFERENCES auth.users(id),
  campaign_id UUID REFERENCES public.cue_card_campaigns(id),

  -- Attribution events
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  -- Performance (for Marks calculation)
  clicks_generated INTEGER DEFAULT 0,
  conversions_generated INTEGER DEFAULT 0,

  -- Marks awarded
  marks_for_selection INTEGER DEFAULT 1,
  marks_for_send INTEGER DEFAULT 0,
  marks_for_clicks DECIMAL(10,2) DEFAULT 0,
  marks_for_conversions INTEGER DEFAULT 0,
  marks_for_derivative INTEGER DEFAULT 0,
  total_marks_awarded DECIMAL(10,2) DEFAULT 1,
  marks_paid_at TIMESTAMPTZ,

  -- Was this a derivative (copied and modified)?
  is_derivative BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attribution_template ON public.template_attribution(template_id);
CREATE INDEX idx_attribution_creator ON public.template_attribution(creator_id);
CREATE INDEX idx_attribution_user ON public.template_attribution(user_id);
CREATE INDEX idx_attribution_campaign ON public.template_attribution(campaign_id);

-- ─── RESEARCH POOL AGGREGATES ───
-- Pre-computed aggregates for the research pool (anonymized)

CREATE TABLE IF NOT EXISTS public.research_pool_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Grouping dimensions
  template_type TEXT,
  initiative_slug TEXT,
  expiration_hours INTEGER,
  day_of_week INTEGER,  -- 0-6
  hour_of_day INTEGER,  -- 0-23

  -- Aggregated metrics (no individual identification)
  campaign_count INTEGER DEFAULT 0,
  total_cards_sent INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  avg_conversion_rate DECIMAL(5,4) DEFAULT 0,

  -- Time frame effectiveness
  avg_time_to_first_click_minutes INTEGER,
  avg_time_to_conversion_minutes INTEGER,

  -- Last updated
  computed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(template_type, initiative_slug, expiration_hours, day_of_week, hour_of_day)
);

CREATE INDEX idx_research_pool_type ON public.research_pool_aggregates(template_type);
CREATE INDEX idx_research_pool_initiative ON public.research_pool_aggregates(initiative_slug);

-- ─── COMPARISON FRAME SLOTS ───
-- The 6-slot comparison frame for analyzing templates

CREATE TABLE IF NOT EXISTS public.comparison_frame_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Slot position (1-6)
  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 6),

  -- What's in the slot
  template_id UUID REFERENCES public.cue_card_templates(id),

  -- Notes
  user_notes TEXT,

  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, slot_number)
);

CREATE INDEX idx_comparison_user ON public.comparison_frame_slots(user_id);

-- ─── EXPIRATION PRESETS ───
-- Allowed expiration windows by benefit type

CREATE TABLE IF NOT EXISTS public.expiration_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  benefit_type TEXT NOT NULL UNIQUE,  -- pass_through | first_time | referral | campaign
  display_name TEXT NOT NULL,

  -- Allowed range
  min_hours INTEGER NOT NULL,
  max_hours INTEGER NOT NULL,
  default_hours INTEGER NOT NULL,

  -- Description
  description TEXT,
  urgency_note TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default presets
INSERT INTO public.expiration_presets (benefit_type, display_name, min_hours, max_hours, default_hours, description, urgency_note)
VALUES
  ('pass_through', 'Pass-Through Discount', 1, 72, 24, 'Discount for customers coming through your cue card', 'Creates urgency for immediate action'),
  ('first_time', 'First-Time Bonus', 24, 168, 48, 'Special offer for new users', 'Gives newcomers time to explore'),
  ('referral', 'Referral Credit', 24, 720, 168, 'Credit for bringing in new members', 'Allows relationship building'),
  ('campaign', 'Campaign Offer', 1, 72, 24, 'Standard marketing campaign', 'Standard urgency window')
ON CONFLICT (benefit_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Check if user has active commitment lock ───
CREATE OR REPLACE FUNCTION public.has_active_commitment_lock(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.research_commitment_locks
    WHERE user_id = p_user_id
      AND is_active = true
      AND satisfied_at IS NULL
      AND expires_at > NOW()
  );
END;
$$;

-- ─── Create commitment lock when accessing research ───
CREATE OR REPLACE FUNCTION public.create_commitment_lock(
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lock_id UUID;
BEGIN
  -- Check if already has active lock
  IF public.has_active_commitment_lock(p_user_id) THEN
    -- Return existing lock
    SELECT id INTO v_lock_id
    FROM public.research_commitment_locks
    WHERE user_id = p_user_id AND is_active = true AND satisfied_at IS NULL
    LIMIT 1;
    RETURN v_lock_id;
  END IF;

  -- Create new lock
  INSERT INTO public.research_commitment_locks (user_id, project_id)
  VALUES (p_user_id, p_project_id)
  RETURNING id INTO v_lock_id;

  RETURN v_lock_id;
END;
$$;

-- ─── Satisfy commitment lock when campaign is sent ───
CREATE OR REPLACE FUNCTION public.satisfy_commitment_lock(
  p_user_id UUID,
  p_campaign_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark lock as satisfied
  UPDATE public.research_commitment_locks
  SET
    satisfied_at = NOW(),
    campaign_sent_at = NOW(),
    is_active = false
  WHERE user_id = p_user_id
    AND is_active = true
    AND satisfied_at IS NULL;

  -- Mark campaign commitment as satisfied
  UPDATE public.cue_card_campaigns
  SET
    commitment_satisfied = true,
    commitment_satisfied_at = NOW()
  WHERE id = p_campaign_id;

  RETURN true;
END;
$$;

-- ─── Award Marks to template creator ───
CREATE OR REPLACE FUNCTION public.award_template_marks(
  p_attribution_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attribution RECORD;
  v_total_marks DECIMAL := 0;
BEGIN
  -- Get attribution record
  SELECT * INTO v_attribution
  FROM public.template_attribution
  WHERE id = p_attribution_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate marks
  v_total_marks := v_attribution.marks_for_selection;  -- 1 mark for selection

  IF v_attribution.sent_at IS NOT NULL THEN
    v_total_marks := v_total_marks + 2;  -- 2 marks for send
  END IF;

  v_total_marks := v_total_marks + (v_attribution.clicks_generated * 0.1);  -- 0.1 per click
  v_total_marks := v_total_marks + v_attribution.conversions_generated;  -- 1 per conversion

  IF v_attribution.is_derivative THEN
    v_total_marks := v_total_marks + 5;  -- 5 marks for derivative (highest honor)
  END IF;

  -- Update attribution record
  UPDATE public.template_attribution
  SET
    marks_for_send = CASE WHEN sent_at IS NOT NULL THEN 2 ELSE 0 END,
    marks_for_clicks = clicks_generated * 0.1,
    marks_for_conversions = conversions_generated,
    marks_for_derivative = CASE WHEN is_derivative THEN 5 ELSE 0 END,
    total_marks_awarded = v_total_marks,
    marks_paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_attribution_id;

  -- Award marks to creator (add to their marks balance)
  UPDATE public.member_profiles
  SET marks = COALESCE(marks, 0) + v_total_marks
  WHERE user_id = v_attribution.creator_id;

  RETURN v_total_marks;
END;
$$;

-- ─── Update research pool aggregates ───
CREATE OR REPLACE FUNCTION public.update_research_pool_aggregates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear and rebuild aggregates from committed campaigns
  DELETE FROM public.research_pool_aggregates;

  INSERT INTO public.research_pool_aggregates (
    template_type,
    initiative_slug,
    expiration_hours,
    day_of_week,
    hour_of_day,
    campaign_count,
    total_cards_sent,
    total_clicks,
    total_conversions,
    avg_conversion_rate,
    computed_at
  )
  SELECT
    t.template_type,
    t.initiative_slug,
    c.default_expiration_hours,
    EXTRACT(DOW FROM c.launched_at)::INTEGER,
    EXTRACT(HOUR FROM c.launched_at)::INTEGER,
    COUNT(DISTINCT c.id),
    SUM(c.cards_sent),
    SUM(c.total_clicks),
    SUM(c.total_conversions),
    CASE
      WHEN SUM(c.total_clicks) > 0
      THEN SUM(c.total_conversions)::DECIMAL / SUM(c.total_clicks)
      ELSE 0
    END,
    NOW()
  FROM public.cue_card_campaigns c
  JOIN public.cue_card_templates t ON t.id = ANY(c.template_ids)
  WHERE c.research_commitment = true
    AND c.commitment_satisfied = true
    AND c.status = 'completed'
  GROUP BY
    t.template_type,
    t.initiative_slug,
    c.default_expiration_hours,
    EXTRACT(DOW FROM c.launched_at),
    EXTRACT(HOUR FROM c.launched_at);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.research_commitment_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cue_card_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_pool_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_frame_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expiration_presets ENABLE ROW LEVEL SECURITY;

-- Users manage their own locks
CREATE POLICY "Users view own locks" ON public.research_commitment_locks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users manage their own campaigns
CREATE POLICY "Users manage own campaigns" ON public.cue_card_campaigns
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Attribution: creators can see their earnings, users can see their usage
CREATE POLICY "Users view own attribution" ON public.template_attribution
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = creator_id);

-- Research pool: only accessible to those with commitment
CREATE POLICY "Research pool for committed users" ON public.research_pool_aggregates
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cue_card_campaigns
      WHERE user_id = auth.uid()
        AND research_commitment = true
        AND commitment_satisfied = true
    )
    OR
    public.has_active_commitment_lock(auth.uid())
  );

-- Comparison frame: users manage their own
CREATE POLICY "Users manage own comparison" ON public.comparison_frame_slots
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Expiration presets: everyone can read
CREATE POLICY "Anyone can read presets" ON public.expiration_presets
  FOR SELECT TO authenticated USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_campaign_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_timestamp
  BEFORE UPDATE ON public.cue_card_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_timestamp();

CREATE TRIGGER update_attribution_timestamp
  BEFORE UPDATE ON public.template_attribution
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_timestamp();

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.research_commitment_locks IS
'Tracks when users access research pool and whether they fulfilled commitment by sending a campaign';

COMMENT ON TABLE public.cue_card_campaigns IS
'Cue card campaigns with research commitment toggle - the key innovation is pre-decision commitment';

COMMENT ON TABLE public.template_attribution IS
'Tracks template usage and awards Marks to creators - minor but meaningful attribution';

COMMENT ON TABLE public.research_pool_aggregates IS
'Anonymized aggregates for research pool - only accessible to committed contributors';

COMMENT ON FUNCTION public.has_active_commitment_lock IS
'Check if user has outstanding commitment to share data';

COMMENT ON FUNCTION public.create_commitment_lock IS
'Creates lock when user accesses research - must send campaign to satisfy';

COMMENT ON FUNCTION public.satisfy_commitment_lock IS
'Marks commitment as satisfied when campaign is actually sent';
