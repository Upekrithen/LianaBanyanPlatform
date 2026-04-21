-- Fix all functions to have immutable search_path = ''
-- All references must be fully qualified with schema names

-- 1. Update sync_industry_pricing_data function
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
SET search_path = ''
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

-- 2. Update generate_lockbox_xml function
CREATE OR REPLACE FUNCTION public.generate_lockbox_xml(_project_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  xml_output := xml_output || '  <ProjectName>' || public.xmlescape(project_data.name) || '</ProjectName>' || chr(10);
  xml_output := xml_output || '  <Products>' || chr(10);

  -- Loop through products
  FOR product_record IN
    SELECT * FROM public.products WHERE project_id = _project_id
  LOOP
    xml_output := xml_output || '    <Product>' || chr(10);
    xml_output := xml_output || '      <ProductSKU>' || COALESCE(product_record.product_sku, 'PENDING') || '</ProductSKU>' || chr(10);
    xml_output := xml_output || '      <Name>' || public.xmlescape(product_record.name) || '</Name>' || chr(10);
    xml_output := xml_output || '      <Description>' || public.xmlescape(COALESCE(product_record.description, '')) || '</Description>' || chr(10);

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

-- 3. Update initialize_project_lockbox function
CREATE OR REPLACE FUNCTION public.initialize_project_lockbox(_project_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- 4. Update auto_initialize_lockbox trigger function (already updated but ensure it's correct)
DROP FUNCTION IF EXISTS public.auto_initialize_lockbox() CASCADE;

CREATE OR REPLACE FUNCTION public.auto_initialize_lockbox()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.initialize_project_lockbox(NEW.id);
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER auto_create_lockbox_on_project
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.auto_initialize_lockbox();

-- 5. Update update_subdomain_timestamp function
CREATE OR REPLACE FUNCTION public.update_subdomain_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
