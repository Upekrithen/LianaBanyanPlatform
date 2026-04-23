-- Add kickstarter sync tracking table
CREATE TABLE IF NOT EXISTS public.kickstarter_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running', -- running, success, failed
  pledges_synced INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kickstarter_sync_log ENABLE ROW LEVEL SECURITY;

-- Admins can view sync logs
CREATE POLICY "Admins can view sync logs"
  ON public.kickstarter_sync_log
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert sync logs
CREATE POLICY "System can insert sync logs"
  ON public.kickstarter_sync_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can update sync logs
CREATE POLICY "System can update sync logs"
  ON public.kickstarter_sync_log
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add index for faster queries
CREATE INDEX idx_kickstarter_sync_log_created_at ON public.kickstarter_sync_log(created_at DESC);
