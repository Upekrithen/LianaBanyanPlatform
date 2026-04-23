-- ============================================
-- PHASE 1: Portal Schema Separation
-- ============================================

-- Create separate schemas for each portal
CREATE SCHEMA IF NOT EXISTS marketplace;  -- .com public discovery
CREATE SCHEMA IF NOT EXISTS business;     -- .biz operations
CREATE SCHEMA IF NOT EXISTS nonprofit;    -- .org financial services
CREATE SCHEMA IF NOT EXISTS network;      -- .net B2B + lockbox

-- Grant usage on schemas
GRANT USAGE ON SCHEMA marketplace TO authenticator, anon, authenticated;
GRANT USAGE ON SCHEMA business TO authenticator, anon, authenticated;
GRANT USAGE ON SCHEMA nonprofit TO authenticator, anon, authenticated;
GRANT USAGE ON SCHEMA network TO authenticator, anon, authenticated;

-- ============================================
-- PHASE 2: Cost Tracking Infrastructure
-- ============================================

-- Project resource usage tracking
CREATE TABLE public.project_resource_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  portal TEXT NOT NULL CHECK (portal IN ('marketplace', 'business', 'nonprofit', 'network')),
  resource_type TEXT NOT NULL, -- 'db_reads', 'db_writes', 'api_calls', 'storage_bytes', 'gas_cost'
  usage_count INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,4) DEFAULT 0.00,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_resource_usage_project_period
  ON public.project_resource_usage(project_id, period_start, period_end);
CREATE INDEX idx_resource_usage_portal
  ON public.project_resource_usage(portal, period_start);

-- API usage tracking for .net portal
CREATE TABLE network.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  credential_id UUID REFERENCES public.xml_access_credentials(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  bytes_transferred BIGINT DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_usage_project_time
  ON network.api_usage_logs(project_id, created_at DESC);
CREATE INDEX idx_api_usage_credential
  ON network.api_usage_logs(credential_id, created_at DESC);

-- Cost attribution summary (materialized view for reporting)
CREATE TABLE public.project_cost_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  period_month DATE NOT NULL, -- First day of month
  total_cost_usd NUMERIC(10,4) DEFAULT 0.00,
  db_cost_usd NUMERIC(10,4) DEFAULT 0.00,
  api_cost_usd NUMERIC(10,4) DEFAULT 0.00,
  storage_cost_usd NUMERIC(10,4) DEFAULT 0.00,
  gas_cost_usd NUMERIC(10,4) DEFAULT 0.00,
  total_api_calls INTEGER DEFAULT 0,
  total_db_operations INTEGER DEFAULT 0,
  total_storage_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, period_month)
);

CREATE INDEX idx_cost_summary_project_month
  ON public.project_cost_summary(project_id, period_month DESC);

-- ============================================
-- PHASE 3: Cost Tracking Functions
-- ============================================

-- Function to log API usage
CREATE OR REPLACE FUNCTION network.log_api_usage(
  _project_id UUID,
  _credential_id UUID,
  _endpoint TEXT,
  _method TEXT,
  _status_code INTEGER,
  _response_time_ms INTEGER,
  _bytes_transferred BIGINT,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, network
AS $$
DECLARE
  _log_id UUID;
BEGIN
  -- Insert API usage log
  INSERT INTO network.api_usage_logs (
    project_id,
    credential_id,
    endpoint,
    method,
    status_code,
    response_time_ms,
    bytes_transferred,
    ip_address,
    user_agent
  ) VALUES (
    _project_id,
    _credential_id,
    _endpoint,
    _method,
    _status_code,
    _response_time_ms,
    _bytes_transferred,
    _ip_address,
    _user_agent
  ) RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;

-- Function to track resource usage
CREATE OR REPLACE FUNCTION public.track_resource_usage(
  _project_id UUID,
  _portal TEXT,
  _resource_type TEXT,
  _usage_count INTEGER DEFAULT 1,
  _cost_usd NUMERIC DEFAULT 0.00,
  _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _usage_id UUID;
  _period_start TIMESTAMPTZ;
  _period_end TIMESTAMPTZ;
BEGIN
  -- Calculate current period (hourly buckets)
  _period_start := date_trunc('hour', now());
  _period_end := _period_start + interval '1 hour';

  -- Insert or update resource usage
  INSERT INTO public.project_resource_usage (
    project_id,
    portal,
    resource_type,
    usage_count,
    cost_usd,
    period_start,
    period_end,
    metadata
  ) VALUES (
    _project_id,
    _portal,
    _resource_type,
    _usage_count,
    _cost_usd,
    _period_start,
    _period_end,
    _metadata
  )
  ON CONFLICT ON CONSTRAINT project_resource_usage_unique
  DO UPDATE SET
    usage_count = project_resource_usage.usage_count + _usage_count,
    cost_usd = project_resource_usage.cost_usd + _cost_usd,
    updated_at = now()
  RETURNING id INTO _usage_id;

  RETURN _usage_id;
END;
$$;

-- Add unique constraint for upsert
ALTER TABLE public.project_resource_usage
  ADD CONSTRAINT project_resource_usage_unique
  UNIQUE (project_id, portal, resource_type, period_start);

-- Function to calculate monthly cost summary
CREATE OR REPLACE FUNCTION public.calculate_project_costs(_project_id UUID, _month DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, network
AS $$
DECLARE
  _result JSONB;
  _api_calls INTEGER;
  _db_ops INTEGER;
  _storage_bytes BIGINT;
  _total_cost NUMERIC;
BEGIN
  -- Aggregate usage for the month
  SELECT
    COALESCE(SUM(CASE WHEN resource_type = 'api_calls' THEN usage_count ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN resource_type IN ('db_reads', 'db_writes') THEN usage_count ELSE 0 END), 0),
    COALESCE(MAX(CASE WHEN resource_type = 'storage_bytes' THEN usage_count ELSE 0 END), 0),
    COALESCE(SUM(cost_usd), 0)
  INTO _api_calls, _db_ops, _storage_bytes, _total_cost
  FROM public.project_resource_usage
  WHERE project_id = _project_id
    AND period_start >= _month
    AND period_start < (_month + interval '1 month');

  -- Add gas costs
  SELECT COALESCE(SUM(total_cost_usd), 0) INTO _total_cost
  FROM public.blockchain_gas_costs
  WHERE project_id = _project_id
    AND created_at >= _month
    AND created_at < (_month + interval '1 month');

  _result := jsonb_build_object(
    'total_cost_usd', _total_cost,
    'api_calls', _api_calls,
    'db_operations', _db_ops,
    'storage_bytes', _storage_bytes,
    'period', _month
  );

  RETURN _result;
END;
$$;

-- ============================================
-- PHASE 4: RLS Policies for New Tables
-- ============================================

-- Enable RLS on new tables
ALTER TABLE public.project_resource_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cost_summary ENABLE ROW LEVEL SECURITY;

-- Project owners can view their own resource usage
CREATE POLICY "Project owners view resource usage"
  ON public.project_resource_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_resource_usage.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Admins can view all resource usage
CREATE POLICY "Admins view all resource usage"
  ON public.project_resource_usage FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- System can insert resource usage
CREATE POLICY "System insert resource usage"
  ON public.project_resource_usage FOR INSERT
  WITH CHECK (true);

-- API usage logs - project owners can view
CREATE POLICY "Project owners view API logs"
  ON network.api_usage_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = api_usage_logs.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Admins can view all API logs
CREATE POLICY "Admins view all API logs"
  ON network.api_usage_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- System can insert API logs
CREATE POLICY "System insert API logs"
  ON network.api_usage_logs FOR INSERT
  WITH CHECK (true);

-- Cost summary policies
CREATE POLICY "Project owners view cost summary"
  ON public.project_cost_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_cost_summary.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins view all cost summaries"
  ON public.project_cost_summary FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- PHASE 5: Add portal tracking to existing tables
-- ============================================

-- Add portal column to relevant tables
ALTER TABLE public.project_modules
  ADD COLUMN IF NOT EXISTS api_calls_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_bytes BIGINT DEFAULT 0;

-- Update blockchain gas costs to track portal
ALTER TABLE public.blockchain_gas_costs
  ADD COLUMN IF NOT EXISTS portal TEXT DEFAULT 'network'
    CHECK (portal IN ('marketplace', 'business', 'nonprofit', 'network'));
