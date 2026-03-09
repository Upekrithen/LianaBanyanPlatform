-- ================================================================
-- ANALYTICS EVENTS — Lightweight privacy-first event tracking
-- ================================================================
-- No PII in events. No third-party trackers. No cross-site tracking.
-- All data stays within the Liana Banyan cooperative.
-- Innovation #1545 — Platform Analytics System (Session 8A)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  page_path TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.analytics_events(session_id);

-- Partition by month for performance (events table grows fast)
-- Note: This comment serves as documentation. Actual partitioning
-- should be set up by the DBA when the table reaches significant size.

-- RLS: Events are insert-only for authenticated users, read by admins
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can insert events
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Only the user can see their own events
CREATE POLICY "Users can view own analytics"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Aggregate views for admin dashboards (no PII exposure)
CREATE OR REPLACE VIEW public.analytics_daily_summary AS
SELECT
  DATE(created_at) AS event_date,
  event_type,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT session_id) AS unique_sessions
FROM public.analytics_events
GROUP BY DATE(created_at), event_type
ORDER BY event_date DESC, event_count DESC;

CREATE OR REPLACE VIEW public.analytics_page_views AS
SELECT
  DATE(created_at) AS view_date,
  page_path,
  COUNT(*) AS view_count,
  COUNT(DISTINCT user_id) AS unique_viewers,
  COUNT(DISTINCT session_id) AS unique_sessions
FROM public.analytics_events
WHERE event_type = 'page_view'
GROUP BY DATE(created_at), page_path
ORDER BY view_date DESC, view_count DESC;

-- Auto-cleanup: Delete events older than 90 days (privacy)
-- Run via pg_cron or scheduled function
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM public.analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
