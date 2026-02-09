-- Create RPC function to access network schema API logs
CREATE OR REPLACE FUNCTION public.get_project_api_logs(
  _project_id UUID,
  _limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  id UUID,
  project_id UUID,
  credential_id UUID,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  bytes_transferred BIGINT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = network, public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.project_id,
    al.credential_id,
    al.endpoint,
    al.method,
    al.status_code,
    al.response_time_ms,
    al.bytes_transferred,
    al.ip_address,
    al.user_agent,
    al.created_at
  FROM network.api_usage_logs al
  WHERE al.project_id = _project_id
  ORDER BY al.created_at DESC
  LIMIT _limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_project_api_logs(UUID, INTEGER) TO authenticated;