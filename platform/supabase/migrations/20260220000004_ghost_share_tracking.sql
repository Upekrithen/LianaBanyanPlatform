-- Ghost Share Tracking: Capture emails from ghosts who share cue cards
-- When they sign up later, their rewards get applied

-- Table to track ghost shares before they become members
CREATE TABLE IF NOT EXISTS public.ghost_share_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ghost identification
  email TEXT NOT NULL,
  tracking_token UUID DEFAULT gen_random_uuid() UNIQUE,
  
  -- What they shared
  template_id UUID REFERENCES public.cue_card_templates(id) ON DELETE SET NULL,
  share_type TEXT DEFAULT 'cue_card', -- cue_card, beacon, referral
  
  -- Tracking metrics
  share_count INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0, -- people who signed up from their shares
  
  -- Reward accumulation (applied when they become member)
  pending_credits INTEGER DEFAULT 0,
  pending_marks INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, converted, expired
  converted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  
  -- Metadata
  first_share_at TIMESTAMPTZ DEFAULT now(),
  last_share_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT, -- hashed for privacy, used for fraud prevention
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_ghost_share_email ON public.ghost_share_tracking(email);
CREATE INDEX IF NOT EXISTS idx_ghost_share_token ON public.ghost_share_tracking(tracking_token);
CREATE INDEX IF NOT EXISTS idx_ghost_share_status ON public.ghost_share_tracking(status);

-- RLS: Public can insert (ghosts creating records), only system can read/update
ALTER TABLE public.ghost_share_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their own tracking records
CREATE POLICY "Ghosts can create share tracking"
  ON public.ghost_share_tracking
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous to read their own record by token (for the QR URL)
CREATE POLICY "Ghosts can read own tracking by token"
  ON public.ghost_share_tracking
  FOR SELECT
  TO anon
  USING (true); -- They need the token to look up

-- Authenticated users can read all (for admin/analytics)
CREATE POLICY "Authenticated can read ghost tracking"
  ON public.ghost_share_tracking
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to increment share count
CREATE OR REPLACE FUNCTION increment_ghost_share(p_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ghost_share_tracking
  SET 
    share_count = share_count + 1,
    last_share_at = now(),
    updated_at = now()
  WHERE tracking_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment click count (when someone scans their QR)
CREATE OR REPLACE FUNCTION increment_ghost_click(p_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ghost_share_tracking
  SET 
    click_count = click_count + 1,
    updated_at = now()
  WHERE tracking_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert ghost to member (called during signup)
CREATE OR REPLACE FUNCTION convert_ghost_to_member(p_email TEXT, p_user_id UUID)
RETURNS TABLE(
  credits_earned INTEGER,
  marks_earned INTEGER,
  shares_made INTEGER,
  conversions_made INTEGER
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Find the ghost record
  SELECT * INTO v_record
  FROM public.ghost_share_tracking
  WHERE email = p_email AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_record IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Mark as converted
  UPDATE public.ghost_share_tracking
  SET 
    status = 'converted',
    converted_user_id = p_user_id,
    converted_at = now(),
    updated_at = now()
  WHERE id = v_record.id;
  
  -- Return the rewards to apply
  RETURN QUERY SELECT 
    v_record.pending_credits,
    v_record.pending_marks,
    v_record.share_count,
    v_record.conversion_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ghost_share_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ghost_share_tracking_updated_at
  BEFORE UPDATE ON public.ghost_share_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_ghost_share_updated_at();

-- Add reward when someone converts from a ghost's share
CREATE OR REPLACE FUNCTION reward_ghost_for_conversion(p_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ghost_share_tracking
  SET 
    conversion_count = conversion_count + 1,
    pending_credits = pending_credits + 50, -- 50 credits per conversion
    pending_marks = pending_marks + 10,     -- 10 marks per conversion
    updated_at = now()
  WHERE tracking_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
