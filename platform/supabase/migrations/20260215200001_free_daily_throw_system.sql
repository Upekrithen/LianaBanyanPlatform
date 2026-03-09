-- ═══════════════════════════════════════════════════════════════
-- FREE DAILY THROW SYSTEM
-- "Try fully before you commit" — One free throw per day for everyone
-- ═══════════════════════════════════════════════════════════════
-- 
-- Philosophy: Rich kids get unlimited throws. We're giving everyone
-- at least ONE free throw per day. $5 members get unlimited.
--
-- This addresses the Canada 40K concern: any subscription requirement
-- on a business incubator feels prohibitive. Free daily throw removes
-- that barrier while preserving value for paid members.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- TABLE: Free Daily Usage Tracking
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.free_daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who used it (can be member or ghost)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT, -- For non-logged-in users
    ip_hash TEXT, -- Hashed IP for abuse prevention
    
    -- What they used
    feature_type TEXT NOT NULL CHECK (feature_type IN (
        'hexisle_simulation',
        'business_simulator', 
        'thought_experiment',
        'recipe_simulation',
        'marketplace_preview',
        'guild_preview',
        'position_preview'
    )),
    
    -- When
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    first_used_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ DEFAULT now(),
    
    -- Tracking
    usage_count INTEGER DEFAULT 1, -- How many within the day
    session_duration_seconds INTEGER,
    
    -- Conversion tracking
    converted_to_member BOOLEAN DEFAULT FALSE,
    conversion_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique index using expression (COALESCE not allowed in CONSTRAINT)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_usage 
ON public.free_daily_usage (
    COALESCE(user_id::TEXT, device_fingerprint, ip_hash),
    feature_type,
    usage_date
);

-- Index for fast daily lookup
CREATE INDEX IF NOT EXISTS idx_free_daily_date ON public.free_daily_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_free_daily_user ON public.free_daily_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_free_daily_fingerprint ON public.free_daily_usage(device_fingerprint);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: Free Daily Limits Configuration
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.free_daily_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    feature_type TEXT NOT NULL UNIQUE,
    
    -- Limits
    free_daily_limit INTEGER NOT NULL DEFAULT 1, -- Non-members get this many per day
    member_daily_limit INTEGER, -- NULL = unlimited for $5 members
    
    -- Feature metadata
    feature_name TEXT NOT NULL,
    feature_description TEXT,
    cta_text TEXT DEFAULT 'Get unlimited access for $5/year',
    upgrade_url TEXT DEFAULT '/join',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the free daily limits
INSERT INTO public.free_daily_limits (feature_type, free_daily_limit, member_daily_limit, feature_name, feature_description, cta_text) VALUES
('hexisle_simulation', 1, NULL, 'HexIsle Business Simulator', 
 'Practice running a business with your crew. Free once per day, unlimited for members.',
 'Get unlimited throws for $5/year'),
 
('business_simulator', 1, NULL, 'Thought Experiment', 
 'Test your business idea against real market data. Free once per day, unlimited for members.',
 'Unlimited experiments for $5/year'),
 
('thought_experiment', 1, NULL, 'Business Thought Experiment', 
 'Run what-if scenarios for your business concept. Free once per day.',
 'Unlimited for $5/year'),
 
('recipe_simulation', 3, NULL, 'Recipe Cost Simulation', 
 'Calculate meal costs and pricing. 3 free per day, unlimited for members.',
 'Unlimited recipes for $5/year'),
 
('marketplace_preview', 5, NULL, 'Marketplace Preview', 
 'Browse the marketplace before joining. 5 views per day, unlimited for members.',
 'Full access for $5/year'),
 
('guild_preview', 3, NULL, 'Guild Preview', 
 'Explore guilds before joining. 3 previews per day, unlimited for members.',
 'Full guild access for $5/year'),
 
('position_preview', 5, NULL, 'Position Preview', 
 'View available positions. 5 per day, unlimited for members.',
 'Apply for positions with $5 membership')
ON CONFLICT (feature_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- FUNCTION: Check if user can use free daily feature
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_free_daily_access(
    p_user_id UUID,
    p_device_fingerprint TEXT,
    p_ip_hash TEXT,
    p_feature_type TEXT
)
RETURNS TABLE (
    can_access BOOLEAN,
    is_member BOOLEAN,
    uses_today INTEGER,
    daily_limit INTEGER,
    remaining_uses INTEGER,
    upgrade_message TEXT
) AS $$
DECLARE
    v_is_member BOOLEAN := FALSE;
    v_uses_today INTEGER := 0;
    v_daily_limit INTEGER := 1;
    v_member_limit INTEGER;
    v_cta_text TEXT;
BEGIN
    -- Check if user is a paid member
    IF p_user_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = p_user_id 
            AND is_active = TRUE
            AND (membership_expires_at IS NULL OR membership_expires_at > now())
        ) INTO v_is_member;
    END IF;
    
    -- Get limits for this feature
    SELECT 
        l.free_daily_limit,
        l.member_daily_limit,
        l.cta_text
    INTO v_daily_limit, v_member_limit, v_cta_text
    FROM public.free_daily_limits l
    WHERE l.feature_type = p_feature_type
    AND l.is_active = TRUE;
    
    -- Default if not configured
    IF v_daily_limit IS NULL THEN
        v_daily_limit := 1;
    END IF;
    
    -- Members get unlimited (or member_limit if set)
    IF v_is_member THEN
        IF v_member_limit IS NULL THEN
            -- Unlimited
            RETURN QUERY SELECT 
                TRUE::BOOLEAN,
                TRUE::BOOLEAN,
                0::INTEGER,
                -1::INTEGER, -- -1 indicates unlimited
                -1::INTEGER,
                NULL::TEXT;
            RETURN;
        ELSE
            v_daily_limit := v_member_limit;
        END IF;
    END IF;
    
    -- Count today's usage
    SELECT COALESCE(SUM(usage_count), 0)::INTEGER INTO v_uses_today
    FROM public.free_daily_usage
    WHERE usage_date = CURRENT_DATE
    AND feature_type = p_feature_type
    AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id)
        OR (p_device_fingerprint IS NOT NULL AND device_fingerprint = p_device_fingerprint)
        OR (p_ip_hash IS NOT NULL AND ip_hash = p_ip_hash)
    );
    
    -- Return access status
    RETURN QUERY SELECT 
        (v_uses_today < v_daily_limit)::BOOLEAN,
        v_is_member,
        v_uses_today,
        v_daily_limit,
        GREATEST(0, v_daily_limit - v_uses_today)::INTEGER,
        CASE WHEN v_uses_today >= v_daily_limit 
             THEN COALESCE(v_cta_text, 'Get unlimited access for $5/year')
             ELSE NULL 
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- FUNCTION: Record free daily usage
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.record_free_daily_usage(
    p_user_id UUID,
    p_device_fingerprint TEXT,
    p_ip_hash TEXT,
    p_feature_type TEXT,
    p_session_duration INTEGER DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    uses_today INTEGER,
    remaining_uses INTEGER,
    upgrade_message TEXT
) AS $$
DECLARE
    v_access_result RECORD;
    v_uses INTEGER;
    v_remaining INTEGER;
    v_message TEXT;
BEGIN
    -- Check access first
    SELECT * INTO v_access_result
    FROM public.check_free_daily_access(p_user_id, p_device_fingerprint, p_ip_hash, p_feature_type);
    
    -- If unlimited (member), just return success
    IF v_access_result.daily_limit = -1 THEN
        RETURN QUERY SELECT TRUE, 0, -1, NULL::TEXT;
        RETURN;
    END IF;
    
    -- If no access left, return failure
    IF NOT v_access_result.can_access THEN
        RETURN QUERY SELECT 
            FALSE, 
            v_access_result.uses_today, 
            0, 
            v_access_result.upgrade_message;
        RETURN;
    END IF;
    
    -- Record the usage (check if exists first, then insert or update)
    -- Using manual upsert since COALESCE in ON CONFLICT not supported
    IF EXISTS (
        SELECT 1 FROM public.free_daily_usage
        WHERE usage_date = CURRENT_DATE
        AND feature_type = p_feature_type
        AND (
            (p_user_id IS NOT NULL AND user_id = p_user_id)
            OR (p_user_id IS NULL AND p_device_fingerprint IS NOT NULL AND device_fingerprint = p_device_fingerprint)
            OR (p_user_id IS NULL AND p_device_fingerprint IS NULL AND ip_hash = p_ip_hash)
        )
    ) THEN
        -- Update existing record
        UPDATE public.free_daily_usage SET
            usage_count = usage_count + 1,
            last_used_at = now(),
            session_duration_seconds = COALESCE(session_duration_seconds, 0) + COALESCE(p_session_duration, 0)
        WHERE usage_date = CURRENT_DATE
        AND feature_type = p_feature_type
        AND (
            (p_user_id IS NOT NULL AND user_id = p_user_id)
            OR (p_user_id IS NULL AND p_device_fingerprint IS NOT NULL AND device_fingerprint = p_device_fingerprint)
            OR (p_user_id IS NULL AND p_device_fingerprint IS NULL AND ip_hash = p_ip_hash)
        );
    ELSE
        -- Insert new record
        INSERT INTO public.free_daily_usage (
            user_id,
            device_fingerprint,
            ip_hash,
            feature_type,
            usage_date,
            usage_count,
            session_duration_seconds
        ) VALUES (
            p_user_id,
            p_device_fingerprint,
            p_ip_hash,
            p_feature_type,
            CURRENT_DATE,
            1,
            p_session_duration
        );
    END IF;
    
    -- Get updated counts
    v_uses := v_access_result.uses_today + 1;
    v_remaining := GREATEST(0, v_access_result.daily_limit - v_uses);
    
    IF v_remaining = 0 THEN
        v_message := v_access_result.upgrade_message;
    ELSE
        v_message := NULL;
    END IF;
    
    RETURN QUERY SELECT TRUE, v_uses, v_remaining, v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- VIEW: Daily usage analytics
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.free_daily_analytics AS
SELECT 
    usage_date,
    feature_type,
    COUNT(DISTINCT COALESCE(user_id::TEXT, device_fingerprint, ip_hash)) as unique_users,
    SUM(usage_count) as total_uses,
    COUNT(DISTINCT user_id) as logged_in_users,
    COUNT(*) FILTER (WHERE device_fingerprint IS NOT NULL AND user_id IS NULL) as anonymous_users,
    SUM(CASE WHEN converted_to_member THEN 1 ELSE 0 END) as conversions,
    ROUND(100.0 * SUM(CASE WHEN converted_to_member THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as conversion_rate
FROM public.free_daily_usage
GROUP BY usage_date, feature_type
ORDER BY usage_date DESC, feature_type;

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.free_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_daily_limits ENABLE ROW LEVEL SECURITY;

-- Users can see their own usage
CREATE POLICY "Users can view own free daily usage"
ON public.free_daily_usage FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Anyone can check limits (read-only)
CREATE POLICY "Anyone can view free daily limits"
ON public.free_daily_limits FOR SELECT
TO anon, authenticated
USING (is_active = TRUE);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.check_free_daily_access TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_free_daily_usage TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Comments
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE public.free_daily_usage IS 
'Tracks free daily feature usage. Non-members get limited throws; $5 members get unlimited.
Philosophy: "Rich kids get unlimited throws. We give everyone at least one free throw per day."';

COMMENT ON TABLE public.free_daily_limits IS
'Configuration for free daily limits per feature type.';

COMMENT ON FUNCTION public.check_free_daily_access IS
'Check if a user can access a feature with free daily limits.
Returns can_access, is_member, uses_today, daily_limit, remaining_uses, upgrade_message.';

COMMENT ON FUNCTION public.record_free_daily_usage IS
'Record usage of a free daily feature. Returns success status and remaining uses.';
