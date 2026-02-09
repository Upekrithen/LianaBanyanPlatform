-- Create portal access requests table
CREATE TABLE IF NOT EXISTS public.portal_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  portal_type TEXT NOT NULL CHECK (portal_type IN ('marketplace', 'business', 'nonprofit', 'network')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  request_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, portal_type)
);

-- Enable RLS
ALTER TABLE public.portal_access_requests ENABLE ROW LEVEL SECURITY;

-- Users can view own requests
CREATE POLICY "Users can view own access requests"
  ON public.portal_access_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create access requests
CREATE POLICY "Users can create access requests"
  ON public.portal_access_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all requests
CREATE POLICY "Admins can view all access requests"
  ON public.portal_access_requests
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update requests
CREATE POLICY "Admins can update access requests"
  ON public.portal_access_requests
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_portal_access_requests_updated_at
  BEFORE UPDATE ON public.portal_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();