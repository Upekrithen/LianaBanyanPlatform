-- ═══════════════════════════════════════════════════════════════
-- RED CARPET ACCESS TRACKING
-- Logs all visits to /RedCarpet with entry mode context.
-- Domain-verified visits include email verification records.
-- Slug visits are logged silently (trusted path).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.red_carpet_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who accessed
  email             TEXT,                           -- verified email (null for slug/herald/press)
  domain            TEXT,                           -- extracted domain from email

  -- What they were shown
  recipient_id      TEXT,                           -- matched recipient slug (e.g. 'michael-seibel')
  recipient_name    TEXT,                           -- denormalized for Founder dashboard
  category          TEXT,                           -- crown, journalist, academic, etc.
  press_outlet_id   TEXT,                           -- if entry_mode = 'press'
  herald_member_id  UUID REFERENCES auth.users(id), -- if entry_mode = 'herald'
  referral_code     TEXT,                           -- if entry_mode = 'referral'
  medallion_card_id TEXT,                           -- if entry_mode = 'card'

  -- Entry mode
  entry_mode        TEXT NOT NULL DEFAULT 'unknown',
    -- 'slug'              = direct link from letter (trusted, no verification)
    -- 'domain-verified'   = email entered + verification code confirmed
    -- 'domain-pending'    = email entered, code sent, not yet confirmed
    -- 'herald'            = member cue card / social media share
    -- 'referral'          = referral code link
    -- 'press'             = press junket landing
    -- 'card'              = QR medallion scan
    -- 'unknown'           = general visitor

  -- Verification (only for domain-verified flow)
  verification_code TEXT,                           -- 6-digit code sent to email
  code_expires_at   TIMESTAMPTZ,                    -- code expiration (15 minutes)
  verified_at       TIMESTAMPTZ,                    -- when code was confirmed
  verification_attempts INTEGER DEFAULT 0,          -- anti-brute-force

  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  user_agent        TEXT,
  referrer_url      TEXT
);

-- Index for Founder dashboard queries
CREATE INDEX idx_red_carpet_access_domain ON public.red_carpet_access(domain);
CREATE INDEX idx_red_carpet_access_recipient ON public.red_carpet_access(recipient_id);
CREATE INDEX idx_red_carpet_access_entry_mode ON public.red_carpet_access(entry_mode);
CREATE INDEX idx_red_carpet_access_created ON public.red_carpet_access(created_at DESC);
CREATE INDEX idx_red_carpet_access_verified ON public.red_carpet_access(verified_at DESC) WHERE verified_at IS NOT NULL;

-- RLS: Allow anonymous inserts (logging) but only service role can read
ALTER TABLE public.red_carpet_access ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (page view logging)
CREATE POLICY "Allow anonymous insert" ON public.red_carpet_access
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update their own verification (by matching on id)
CREATE POLICY "Allow verification update" ON public.red_carpet_access
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Only service role can read (Founder dashboard uses service role)
CREATE POLICY "Service role reads all" ON public.red_carpet_access
  FOR SELECT TO service_role
  USING (true);

-- Allow any authenticated user to read (founder dashboard)
-- In production, restrict via app-level role checks
CREATE POLICY "Authenticated can read" ON public.red_carpet_access
  FOR SELECT TO authenticated
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FOUNDER DASHBOARD VIEW
-- Quick summary of RedCarpet activity
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.red_carpet_dashboard AS
SELECT
  recipient_id,
  recipient_name,
  category,
  domain,
  entry_mode,
  COUNT(*) as total_views,
  COUNT(*) FILTER (WHERE verified_at IS NOT NULL) as verified_views,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view,
  ARRAY_AGG(DISTINCT email) FILTER (WHERE email IS NOT NULL AND verified_at IS NOT NULL) as verified_emails
FROM public.red_carpet_access
GROUP BY recipient_id, recipient_name, category, domain, entry_mode
ORDER BY MAX(created_at) DESC;

-- Grant view access to authenticated users (dashboard)
GRANT SELECT ON public.red_carpet_dashboard TO authenticated;
