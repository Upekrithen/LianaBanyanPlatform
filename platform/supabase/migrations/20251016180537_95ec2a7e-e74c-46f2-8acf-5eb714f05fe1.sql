-- Create Liana Banyan platform project
-- First, get the first admin user (or first user) to be the owner
DO $$
DECLARE
  _owner_id UUID;
  _project_id UUID;
  _workstation_id UUID;
BEGIN
  -- Get first admin user, or first user if no admin exists
  SELECT user_id INTO _owner_id
  FROM public.user_roles
  WHERE role = 'admin'
  ORDER BY id
  LIMIT 1;
  
  IF _owner_id IS NULL THEN
    -- Fallback to first profile
    SELECT id INTO _owner_id
    FROM public.profiles
    ORDER BY created_at
    LIMIT 1;
  END IF;
  
  -- Only proceed if we have an owner
  IF _owner_id IS NOT NULL THEN
    -- Create Liana Banyan project
    INSERT INTO public.projects (
      name,
      description,
      detailed_description,
      owner_id,
      project_sku,
      created_at
    ) VALUES (
      'Liana Banyan',
      'Platform development and community growth initiative',
      'The Liana Banyan project encompasses platform-level content, community education, and ecosystem development. This includes video scripts explaining how the platform works, community guidelines, and marketing materials.',
      _owner_id,
      'LB-PLATFORM-001',
      now()
    )
    RETURNING id INTO _project_id;
    
    -- Create Campaign Production workstation
    INSERT INTO public.workstations (
      project_id,
      workstation_name,
      workstation_type,
      description,
      created_by
    ) VALUES (
      _project_id,
      'Campaign Production',
      'campaign_production',
      'Platform video scripts, business plans, and marketing content for Liana Banyan ecosystem',
      _owner_id
    )
    RETURNING id INTO _workstation_id;
    
    -- Enable Business Plan Generator feature
    INSERT INTO public.project_features (
      project_id,
      feature_name,
      is_enabled,
      enabled_at,
      enabled_by
    ) VALUES (
      _project_id,
      'business_plan_generator',
      true,
      now(),
      _owner_id
    );
    
    RAISE NOTICE 'Created Liana Banyan project with ID: %, workstation ID: %', _project_id, _workstation_id;
  ELSE
    RAISE NOTICE 'No users found - Liana Banyan project will be created when first user signs up';
  END IF;
END $$;