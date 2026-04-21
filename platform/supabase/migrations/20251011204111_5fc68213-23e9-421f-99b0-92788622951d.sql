-- ============================================
-- SUBDOMAIN STORAGE SYSTEM - DATABASE SETUP
-- ============================================

-- 1. Portal Configuration Table
-- Manages the three portal types: .com (Marketplace), .biz (Member Services), .org (Non-Profit)
CREATE TABLE IF NOT EXISTS public.portal_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_domain TEXT NOT NULL UNIQUE, -- e.g., 'lianabanyan.com', 'lianabanyan.biz', 'lianabanyan.org'
  portal_type TEXT NOT NULL CHECK (portal_type IN ('marketplace', 'member_services', 'nonprofit')),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Industry Pricing Data Table
-- Stores production run quantities and volume pricing from Industry.LianaBanyan.com
CREATE TABLE IF NOT EXISTS public.industry_pricing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  production_run_id TEXT NOT NULL, -- External run identifier
  units_in_run INTEGER NOT NULL,
  volume_discount_percentage NUMERIC(5,2) DEFAULT 0,
  calculated_unit_price NUMERIC(10,2) NOT NULL,
  run_start_date TIMESTAMPTZ,
  run_end_date TIMESTAMPTZ,
  data_source TEXT DEFAULT 'industry_subdomain',
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, production_run_id)
);

-- 3. Subdomain Lockbox Configurations
-- Manages secure lockbox structure for each project subdomain
CREATE TABLE IF NOT EXISTS public.subdomain_lockbox_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  lockbox_path TEXT NOT NULL, -- Virtual path for lockbox (e.g., '/lockbox')
  xml_storage_bucket TEXT DEFAULT 'xml-modules',
  cors_origins TEXT[], -- Allowed origins for CORS
  security_policy JSONB DEFAULT '{
    "require_api_key": true,
    "rate_limit_per_hour": 1000,
    "allowed_methods": ["GET", "HEAD"]
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Project Domain Mappings
-- Maps custom domains to projects (e.g., hexisle.com -> hexisle project)
CREATE TABLE IF NOT EXISTS public.project_domain_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  custom_domain TEXT NOT NULL UNIQUE, -- e.g., 'hexisle.com', 'the2ndsecond.com'
  subdomain_target TEXT NOT NULL, -- e.g., 'hexisle.projects.lianabanyan.com'
  dns_verified BOOLEAN DEFAULT false,
  ssl_provisioned BOOLEAN DEFAULT false,
  verification_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. XML Module Metadata Table
-- Enhanced tracking for XML modules in the lockbox system
CREATE TABLE IF NOT EXISTS public.xml_module_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.project_modules(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  lockbox_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  content_hash TEXT, -- SHA-256 hash for integrity verification
  includes_pricing_data BOOLEAN DEFAULT false,
  pricing_data_source TEXT,
  last_pricing_sync TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_industry_pricing_product ON public.industry_pricing_data(product_id);
CREATE INDEX IF NOT EXISTS idx_industry_pricing_run ON public.industry_pricing_data(production_run_id);
CREATE INDEX IF NOT EXISTS idx_industry_pricing_sync ON public.industry_pricing_data(last_sync_at);
CREATE INDEX IF NOT EXISTS idx_lockbox_project ON public.subdomain_lockbox_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_domain_mappings_project ON public.project_domain_mappings(project_id);
CREATE INDEX IF NOT EXISTS idx_domain_mappings_domain ON public.project_domain_mappings(custom_domain);
CREATE INDEX IF NOT EXISTS idx_xml_metadata_project ON public.xml_module_metadata(project_id);
CREATE INDEX IF NOT EXISTS idx_xml_metadata_module ON public.xml_module_metadata(module_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Portal Configs - Public read for active portals
ALTER TABLE public.portal_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active portal configs"
ON public.portal_configs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage portal configs"
ON public.portal_configs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Industry Pricing Data - Public read, project owners can update
ALTER TABLE public.industry_pricing_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view industry pricing data"
ON public.industry_pricing_data FOR SELECT
USING (true);

CREATE POLICY "Project owners can manage pricing data"
ON public.industry_pricing_data FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects proj ON proj.id = p.project_id
    WHERE p.id = industry_pricing_data.product_id
    AND proj.owner_id = auth.uid()
  )
);

-- Subdomain Lockbox Configs - Project owners manage
ALTER TABLE public.subdomain_lockbox_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active lockbox configs"
ON public.subdomain_lockbox_configs FOR SELECT
USING (is_active = true);

CREATE POLICY "Project owners can manage lockbox configs"
ON public.subdomain_lockbox_configs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = subdomain_lockbox_configs.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Project Domain Mappings - Project owners manage
ALTER TABLE public.project_domain_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified domain mappings"
ON public.project_domain_mappings FOR SELECT
USING (dns_verified = true);

CREATE POLICY "Project owners can manage domain mappings"
ON public.project_domain_mappings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_domain_mappings.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- XML Module Metadata - Public read for active modules
ALTER TABLE public.xml_module_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view xml module metadata"
ON public.xml_module_metadata FOR SELECT
USING (true);

CREATE POLICY "Project owners can manage xml module metadata"
ON public.xml_module_metadata FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = xml_module_metadata.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to sync pricing data from industry source
CREATE OR REPLACE FUNCTION public.sync_industry_pricing_data(
  _product_id UUID,
  _production_run_id TEXT,
  _units INTEGER,
  _discount_pct NUMERIC,
  _unit_price NUMERIC,
  _run_start TIMESTAMPTZ,
  _run_end TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pricing_id UUID;
BEGIN
  INSERT INTO public.industry_pricing_data (
    product_id,
    production_run_id,
    units_in_run,
    volume_discount_percentage,
    calculated_unit_price,
    run_start_date,
    run_end_date,
    last_sync_at
  ) VALUES (
    _product_id,
    _production_run_id,
    _units,
    _discount_pct,
    _unit_price,
    _run_start,
    _run_end,
    now()
  )
  ON CONFLICT (product_id, production_run_id)
  DO UPDATE SET
    units_in_run = EXCLUDED.units_in_run,
    volume_discount_percentage = EXCLUDED.volume_discount_percentage,
    calculated_unit_price = EXCLUDED.calculated_unit_price,
    run_start_date = EXCLUDED.run_start_date,
    run_end_date = EXCLUDED.run_end_date,
    last_sync_at = now()
  RETURNING id INTO _pricing_id;

  RETURN _pricing_id;
END;
$$;

-- Function to generate lockbox XML with pricing data
CREATE OR REPLACE FUNCTION public.generate_lockbox_xml(_project_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  xml_output TEXT;
  project_data RECORD;
  product_record RECORD;
  pricing_record RECORD;
BEGIN
  -- Get project data
  SELECT * INTO project_data
  FROM public.projects
  WHERE id = _project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  -- Build XML header
  xml_output := '<?xml version="1.0" encoding="UTF-8"?>' || chr(10);
  xml_output := xml_output || '<LockboxModule>' || chr(10);
  xml_output := xml_output || '  <ProjectSKU>' || COALESCE(project_data.project_sku, 'PENDING') || '</ProjectSKU>' || chr(10);
  xml_output := xml_output || '  <ProjectName>' || xmlescape(project_data.name) || '</ProjectName>' || chr(10);
  xml_output := xml_output || '  <Products>' || chr(10);

  -- Loop through products
  FOR product_record IN
    SELECT * FROM public.products WHERE project_id = _project_id
  LOOP
    xml_output := xml_output || '    <Product>' || chr(10);
    xml_output := xml_output || '      <ProductSKU>' || COALESCE(product_record.product_sku, 'PENDING') || '</ProductSKU>' || chr(10);
    xml_output := xml_output || '      <Name>' || xmlescape(product_record.name) || '</Name>' || chr(10);
    xml_output := xml_output || '      <Description>' || xmlescape(COALESCE(product_record.description, '')) || '</Description>' || chr(10);

    -- Add industry pricing data if available
    xml_output := xml_output || '      <IndustryPricing>' || chr(10);
    FOR pricing_record IN
      SELECT * FROM public.industry_pricing_data
      WHERE product_id = product_record.id
      ORDER BY created_at DESC
      LIMIT 5
    LOOP
      xml_output := xml_output || '        <PricingRun>' || chr(10);
      xml_output := xml_output || '          <RunID>' || pricing_record.production_run_id || '</RunID>' || chr(10);
      xml_output := xml_output || '          <Units>' || pricing_record.units_in_run || '</Units>' || chr(10);
      xml_output := xml_output || '          <VolumeDiscount>' || pricing_record.volume_discount_percentage || '%</VolumeDiscount>' || chr(10);
      xml_output := xml_output || '          <UnitPrice>' || pricing_record.calculated_unit_price || '</UnitPrice>' || chr(10);
      xml_output := xml_output || '        </PricingRun>' || chr(10);
    END LOOP;
    xml_output := xml_output || '      </IndustryPricing>' || chr(10);

    xml_output := xml_output || '    </Product>' || chr(10);
  END LOOP;

  xml_output := xml_output || '  </Products>' || chr(10);
  xml_output := xml_output || '</LockboxModule>';

  RETURN xml_output;
END;
$$;

-- Function to initialize lockbox for a project
CREATE OR REPLACE FUNCTION public.initialize_project_lockbox(_project_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lockbox_id UUID;
  _project_name TEXT;
BEGIN
  -- Get project name for subdomain
  SELECT name INTO _project_name FROM public.projects WHERE id = _project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  -- Create lockbox config
  INSERT INTO public.subdomain_lockbox_configs (
    project_id,
    lockbox_path,
    cors_origins,
    security_policy
  ) VALUES (
    _project_id,
    '/lockbox',
    ARRAY['*'], -- Will be restricted later
    '{
      "require_api_key": true,
      "rate_limit_per_hour": 1000,
      "allowed_methods": ["GET", "HEAD"]
    }'::jsonb
  )
  ON CONFLICT (project_id) DO UPDATE
  SET updated_at = now()
  RETURNING id INTO _lockbox_id;

  RETURN _lockbox_id;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_subdomain_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_portal_configs_timestamp
BEFORE UPDATE ON public.portal_configs
FOR EACH ROW EXECUTE FUNCTION public.update_subdomain_timestamp();

CREATE TRIGGER update_lockbox_configs_timestamp
BEFORE UPDATE ON public.subdomain_lockbox_configs
FOR EACH ROW EXECUTE FUNCTION public.update_subdomain_timestamp();

CREATE TRIGGER update_domain_mappings_timestamp
BEFORE UPDATE ON public.project_domain_mappings
FOR EACH ROW EXECUTE FUNCTION public.update_subdomain_timestamp();

-- Auto-initialize lockbox when project is created
CREATE OR REPLACE FUNCTION public.auto_initialize_lockbox()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.initialize_project_lockbox(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_lockbox_on_project
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.auto_initialize_lockbox();

-- Insert initial portal configurations
INSERT INTO public.portal_configs (portal_domain, portal_type, metadata)
VALUES
  ('lianabanyan.com', 'marketplace', '{"description": "Main Marketplace Portal", "subdomains": ["projects", "industry"]}'::jsonb),
  ('lianabanyan.biz', 'member_services', '{"description": "Member Services Portal"}'::jsonb),
  ('lianabanyan.org', 'nonprofit', '{"description": "Non-Profit Division Portal"}'::jsonb)
ON CONFLICT (portal_domain) DO NOTHING;
