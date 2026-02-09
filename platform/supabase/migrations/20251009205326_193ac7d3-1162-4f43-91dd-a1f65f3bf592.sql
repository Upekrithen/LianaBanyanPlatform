-- Create table for subdomain configurations
CREATE TABLE public.project_subdomains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subdomain TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for access credentials (secure lockbox)
CREATE TABLE public.xml_access_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  credential_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  allowed_origins TEXT[], -- Array of allowed domains
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  UNIQUE(project_id, credential_name)
);

-- Create table for access logs
CREATE TABLE public.xml_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES public.xml_access_credentials(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  origin TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.project_subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xml_access_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xml_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_subdomains
CREATE POLICY "Anyone can view active subdomains"
  ON public.project_subdomains FOR SELECT
  USING (is_active = true);

CREATE POLICY "Project owners can manage subdomains"
  ON public.project_subdomains FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_subdomains.project_id
    AND projects.owner_id = auth.uid()
  ));

-- RLS Policies for xml_access_credentials
CREATE POLICY "Project owners can view own credentials"
  ON public.xml_access_credentials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = xml_access_credentials.project_id
    AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Project owners can manage credentials"
  ON public.xml_access_credentials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = xml_access_credentials.project_id
    AND projects.owner_id = auth.uid()
  ));

-- RLS Policies for xml_access_logs
CREATE POLICY "Project owners can view access logs"
  ON public.xml_access_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = xml_access_logs.project_id
    AND projects.owner_id = auth.uid()
  ));

-- Function to generate secure API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'xml_' || encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Function to validate API key and check access
CREATE OR REPLACE FUNCTION public.validate_xml_access(
  _api_key TEXT,
  _origin TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  project_id UUID,
  credential_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _credential RECORD;
BEGIN
  -- Find credential
  SELECT * INTO _credential
  FROM public.xml_access_credentials
  WHERE api_key = _api_key
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check origin if specified
  IF _credential.allowed_origins IS NOT NULL 
     AND array_length(_credential.allowed_origins, 1) > 0 
     AND NOT (_origin = ANY(_credential.allowed_origins)) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;
  
  -- Update usage stats
  UPDATE public.xml_access_credentials
  SET usage_count = usage_count + 1,
      last_used_at = now()
  WHERE id = _credential.id;
  
  RETURN QUERY SELECT true, _credential.project_id, _credential.id;
END;
$$;

-- Create storage bucket for XML files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'xml-modules',
  'xml-modules',
  false,
  5242880, -- 5MB limit
  ARRAY['text/xml', 'application/xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for XML files
CREATE POLICY "Authenticated users can upload XML"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'xml-modules' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Project owners can manage their XML files"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'xml-modules'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE owner_id = auth.uid()
    )
  );