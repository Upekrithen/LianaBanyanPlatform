-- Create default Campaign Production workstations for existing projects (only those with valid owners)
INSERT INTO public.workstations (project_id, workstation_name, workstation_type, description, created_by)
SELECT
  p.id,
  'Campaign Production',
  'campaign_production',
  'Main campaign production workstation for video scripts, business plans, and marketing materials',
  p.owner_id
FROM public.projects p
WHERE p.owner_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.workstations w
  WHERE w.project_id = p.id
  AND w.workstation_type = 'campaign_production'
);

-- Enable Business Plan Generator for all projects with valid owners
INSERT INTO public.project_features (project_id, feature_name, is_enabled, enabled_at, enabled_by)
SELECT
  p.id,
  'business_plan_generator',
  true,
  now(),
  p.owner_id
FROM public.projects p
WHERE p.owner_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.project_features pf
  WHERE pf.project_id = p.id
  AND pf.feature_name = 'business_plan_generator'
)
ON CONFLICT (project_id, feature_name)
DO UPDATE SET
  is_enabled = true,
  enabled_at = now();
