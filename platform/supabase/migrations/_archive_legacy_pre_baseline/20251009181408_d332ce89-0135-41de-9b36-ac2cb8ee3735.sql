-- Add SKU fields to projects and products
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS project_sku TEXT UNIQUE;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_sku TEXT UNIQUE;

-- Create project_modules table (blockchain ledger for IP protection)
CREATE TABLE IF NOT EXISTS public.project_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_version INTEGER NOT NULL DEFAULT 1,
  xml_data TEXT NOT NULL,
  funding_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, module_version)
);

-- Create user_project_subscriptions table (tracks which projects users voted for)
CREATE TABLE IF NOT EXISTS public.user_project_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS on new tables
ALTER TABLE public.project_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_modules (read-only ledger)
CREATE POLICY "Anyone can view project modules"
ON public.project_modules
FOR SELECT
USING (true);

CREATE POLICY "Project owners can create modules"
ON public.project_modules
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_modules.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- RLS policies for user_project_subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.user_project_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
ON public.user_project_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
ON public.user_project_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
ON public.user_project_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Function to auto-subscribe user when they vote
CREATE OR REPLACE FUNCTION public.auto_subscribe_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_id uuid;
BEGIN
  -- Get project_id from the vote
  SELECT products.project_id INTO _project_id
  FROM public.production_levels
  JOIN public.products ON products.id = production_levels.product_id
  WHERE production_levels.id = NEW.production_level_id;

  -- Insert subscription if not exists
  INSERT INTO public.user_project_subscriptions (user_id, project_id)
  VALUES (NEW.user_id, _project_id)
  ON CONFLICT (user_id, project_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to auto-subscribe on vote
DROP TRIGGER IF EXISTS trigger_auto_subscribe_on_vote ON public.user_votes;
CREATE TRIGGER trigger_auto_subscribe_on_vote
AFTER INSERT ON public.user_votes
FOR EACH ROW
EXECUTE FUNCTION public.auto_subscribe_on_vote();

-- Function to generate XML module data
CREATE OR REPLACE FUNCTION public.generate_project_module_xml(p_project_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  xml_output TEXT;
  project_data RECORD;
BEGIN
  -- Get comprehensive project data
  SELECT
    p.id,
    p.project_sku,
    p.name,
    p.description,
    p.detailed_description,
    p.created_at,
    json_agg(
      json_build_object(
        'product_id', prod.id,
        'product_sku', prod.product_sku,
        'name', prod.name,
        'description', prod.description,
        'details', prod.details,
        'production_levels', (
          SELECT json_agg(
            json_build_object(
              'level_number', pl.level_number,
              'level_name', pl.level_name,
              'units_count', pl.units_count,
              'unit_price', pl.unit_price,
              'votes_needed', pl.votes_needed,
              'current_votes', pl.current_votes
            )
          )
          FROM public.production_levels pl
          WHERE pl.product_id = prod.id
        )
      )
    ) as products
  INTO project_data
  FROM public.projects p
  LEFT JOIN public.products prod ON prod.project_id = p.id
  WHERE p.id = p_project_id
  GROUP BY p.id;

  -- Build XML structure
  xml_output := '<?xml version="1.0" encoding="UTF-8"?>' || chr(10);
  xml_output := xml_output || '<ProjectModule>' || chr(10);
  xml_output := xml_output || '  <ProjectSKU>' || COALESCE(project_data.project_sku, 'PENDING') || '</ProjectSKU>' || chr(10);
  xml_output := xml_output || '  <ProjectName>' || xmlescape(project_data.name) || '</ProjectName>' || chr(10);
  xml_output := xml_output || '  <Description>' || xmlescape(COALESCE(project_data.description, '')) || '</Description>' || chr(10);
  xml_output := xml_output || '  <DetailedDescription>' || xmlescape(COALESCE(project_data.detailed_description, '')) || '</DetailedDescription>' || chr(10);
  xml_output := xml_output || '  <CreatedAt>' || project_data.created_at::text || '</CreatedAt>' || chr(10);
  xml_output := xml_output || '  <Products>' || COALESCE(project_data.products::text, '[]') || '</Products>' || chr(10);
  xml_output := xml_output || '</ProjectModule>';

  RETURN xml_output;
END;
$$;

-- Helper function for XML escaping
CREATE OR REPLACE FUNCTION xmlescape(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(replace(replace(replace(replace(input, '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&apos;');
$$;
