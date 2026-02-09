-- ═══════════════════════════════════════════════════════════════
-- HERALD SUBSCRIPTION SYSTEM
-- "Don't Break the Chain" — Inverted influencer model
-- Members PAY to promote (not paid to promote)
-- ═══════════════════════════════════════════════════════════════

-- ─── HERALD SUBSCRIPTIONS ───
CREATE TABLE IF NOT EXISTS public.herald_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tier: torch_bearer ($5), herald ($15), town_crier ($35)
  tier            TEXT NOT NULL CHECK (tier IN ('torch_bearer', 'herald', 'town_crier')),
  
  -- Pricing
  monthly_price   NUMERIC NOT NULL,
  
  -- Chain tracking
  chain_length    INTEGER NOT NULL DEFAULT 0,     -- consecutive months
  chain_started_at TIMESTAMPTZ,                   -- when chain began
  chain_frozen    BOOLEAN DEFAULT false,           -- $5 freeze active
  chain_freeze_month TEXT,                         -- which month was frozen (YYYY-MM)
  
  -- Multiplier (calculated from tier + chain)
  base_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  chain_bonus     NUMERIC NOT NULL DEFAULT 0.0,   -- accumulated chain bonus
  current_multiplier NUMERIC GENERATED ALWAYS AS (base_multiplier + chain_bonus) STORED,
  max_multiplier  NUMERIC NOT NULL DEFAULT 2.0,
  
  -- Post requirements
  required_posts_per_month INTEGER NOT NULL DEFAULT 2,
  posts_this_month INTEGER NOT NULL DEFAULT 0,
  current_month   TEXT,                            -- YYYY-MM for tracking
  
  -- Subscription status
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'frozen')),
  
  -- Stripe/payment
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at    TIMESTAMPTZ,
  
  UNIQUE(user_id)  -- one subscription per user
);

CREATE INDEX idx_herald_subs_user ON public.herald_subscriptions(user_id);
CREATE INDEX idx_herald_subs_status ON public.herald_subscriptions(status);
CREATE INDEX idx_herald_subs_tier ON public.herald_subscriptions(tier);

-- ─── HERALD POST LOG ───
-- Tracks each social media post a Herald makes
CREATE TABLE IF NOT EXISTS public.herald_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.herald_subscriptions(id),
  
  -- What was posted
  cue_card_id     UUID REFERENCES public.stamped_cue_cards(id),
  template_id     UUID REFERENCES public.cue_card_templates(id),
  post_text       TEXT NOT NULL,
  
  -- Where it was posted
  platform        TEXT NOT NULL,                   -- twitter, linkedin, facebook, etc.
  platform_post_id TEXT,                           -- ID from the platform
  post_url        TEXT,                            -- URL of the live post
  
  -- Scheduling
  scheduled_for   TIMESTAMPTZ,                     -- null = posted immediately
  posted_at       TIMESTAMPTZ,                     -- actual post time
  status          TEXT DEFAULT 'posted' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed', 'cancelled')),
  
  -- Performance
  click_count     INTEGER DEFAULT 0,
  signup_count    INTEGER DEFAULT 0,
  
  -- Chain credit
  counts_for_month TEXT,                           -- YYYY-MM this post counts toward
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_herald_posts_user ON public.herald_posts(user_id);
CREATE INDEX idx_herald_posts_status ON public.herald_posts(status);
CREATE INDEX idx_herald_posts_scheduled ON public.herald_posts(scheduled_for) WHERE status = 'scheduled';

-- ─── SCHEDULED POSTS QUEUE ───
-- For cron-based social media scheduling (all users, not just Heralds)
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  post_text       TEXT NOT NULL,
  post_image_url  TEXT,                            -- stamped cue card image
  share_url       TEXT,                            -- RedCarpet link
  
  -- Target
  platform        TEXT NOT NULL,
  plug_id         UUID REFERENCES public.social_media_plugs(id),
  
  -- Schedule
  scheduled_for   TIMESTAMPTZ NOT NULL,
  timezone        TEXT DEFAULT 'America/Chicago',
  
  -- Status
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posting', 'posted', 'failed', 'cancelled')),
  posted_at       TIMESTAMPTZ,
  error_message   TEXT,
  retry_count     INTEGER DEFAULT 0,
  
  -- Link to herald if applicable
  herald_post_id  UUID REFERENCES public.herald_posts(id),
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_posts_pending ON public.scheduled_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_scheduled_posts_user ON public.scheduled_posts(user_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.herald_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herald_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own herald sub" ON public.herald_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own herald posts" ON public.herald_posts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own scheduled posts" ON public.scheduled_posts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role can process scheduled posts
CREATE POLICY "Service processes scheduled" ON public.scheduled_posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- HERALD TIER CONFIGURATION (reference, not a table)
-- ═══════════════════════════════════════════════════════════════
-- Torch Bearer: $5/mo, 2 posts/mo, 1.25x base, +0.05x/mo chain, max 2.0x
-- Herald:       $15/mo, 4 posts/mo, 1.5x base, +0.10x/mo chain, max 3.0x  
-- Town Crier:   $35/mo, 8 posts/mo, 2.0x base, +0.15x/mo chain, max 4.0x
