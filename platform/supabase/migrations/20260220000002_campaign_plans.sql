-- ═══════════════════════════════════════════════════════════════════════════
-- CAMPAIGN PLANS — Sellable Social Media Schedules
-- Applied: Feb 20, 2026 to ruuxzilgmuwddcofqecc (LianaBanyan direct Supabase)
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Create campaign_plans table
CREATE TABLE IF NOT EXISTS public.campaign_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- e.g., 'launch', 'awareness', 'holiday', 'engagement'
  tags TEXT[] DEFAULT '{}',
  
  -- Plan content (JSON array of scheduled cards)
  plan_data JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ day: 1, hour: 9, template_id: 'uuid', custom_text: '...', platforms: ['twitter', 'linkedin'] }, ...]
  
  -- Duration and scheduling
  duration_days INTEGER NOT NULL DEFAULT 7,
  posts_per_day INTEGER DEFAULT 3,
  total_posts INTEGER GENERATED ALWAYS AS (
    COALESCE(jsonb_array_length(plan_data), 0)
  ) STORED,
  
  -- Marketplace listing
  is_public BOOLEAN DEFAULT false,
  price_credits INTEGER DEFAULT 0, -- 0 = free
  
  -- Stats
  times_purchased INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Shirley Temple categories
  content_categories TEXT[] DEFAULT ARRAY['family_safe'],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 2: Create campaign_plan_purchases table
CREATE TABLE IF NOT EXISTS public.campaign_plan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.campaign_plans(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Purchase details
  price_paid INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  
  -- Usage tracking
  times_deployed INTEGER DEFAULT 0,
  last_deployed_at TIMESTAMPTZ,
  
  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  UNIQUE(plan_id, buyer_id)
);

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_plans_creator ON public.campaign_plans(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_plans_public ON public.campaign_plans(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_campaign_plans_category ON public.campaign_plans(category);
CREATE INDEX IF NOT EXISTS idx_campaign_plan_purchases_buyer ON public.campaign_plan_purchases(buyer_id);

-- STEP 4: Enable RLS
ALTER TABLE public.campaign_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_plan_purchases ENABLE ROW LEVEL SECURITY;

-- STEP 5: RLS Policies for campaign_plans
CREATE POLICY "Users can view their own plans"
  ON public.campaign_plans FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can view public plans"
  ON public.campaign_plans FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Anon can view public plans"
  ON public.campaign_plans FOR SELECT
  TO anon
  USING (is_public = true);

CREATE POLICY "Users can create their own plans"
  ON public.campaign_plans FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own plans"
  ON public.campaign_plans FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete their own plans"
  ON public.campaign_plans FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- STEP 6: RLS Policies for campaign_plan_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.campaign_plan_purchases FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Plan creators can view purchases of their plans"
  ON public.campaign_plan_purchases FOR SELECT
  TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.campaign_plans WHERE creator_id = auth.uid())
  );

CREATE POLICY "Users can purchase plans"
  ON public.campaign_plan_purchases FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their own purchases (for rating)"
  ON public.campaign_plan_purchases FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid());

-- STEP 7: Function to update plan stats on purchase
CREATE OR REPLACE FUNCTION update_plan_purchase_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campaign_plans
  SET 
    times_purchased = times_purchased + 1,
    updated_at = now()
  WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Trigger for purchase stats
DROP TRIGGER IF EXISTS on_plan_purchase ON public.campaign_plan_purchases;
CREATE TRIGGER on_plan_purchase
  AFTER INSERT ON public.campaign_plan_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_purchase_stats();

-- STEP 9: Function to update average rating
CREATE OR REPLACE FUNCTION update_plan_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campaign_plans
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.campaign_plan_purchases
      WHERE plan_id = NEW.plan_id AND rating IS NOT NULL
    ),
    updated_at = now()
  WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 10: Trigger for rating updates
DROP TRIGGER IF EXISTS on_plan_rating ON public.campaign_plan_purchases;
CREATE TRIGGER on_plan_rating
  AFTER UPDATE OF rating ON public.campaign_plan_purchases
  FOR EACH ROW
  WHEN (NEW.rating IS DISTINCT FROM OLD.rating)
  EXECUTE FUNCTION update_plan_rating();

-- STEP 11: Comments
COMMENT ON TABLE public.campaign_plans IS 'Sellable social media campaign plans with scheduled cue cards';
COMMENT ON TABLE public.campaign_plan_purchases IS 'Tracks who purchased which campaign plans';
COMMENT ON COLUMN public.campaign_plans.plan_data IS 'JSON array of scheduled posts: [{day, hour, template_id, custom_text, platforms}]';
COMMENT ON COLUMN public.campaign_plans.content_categories IS 'Shirley Temple content categories for filtering';
