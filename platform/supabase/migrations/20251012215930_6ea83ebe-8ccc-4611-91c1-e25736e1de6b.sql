-- Create service categories enum
CREATE TYPE public.service_category_type AS ENUM (
  'crowdfunding_launch',
  'crowdfunding_platform',
  'equity_crowdfunding',
  'manufacturing_crowdfunding',
  'marketing',
  'legal',
  'accounting',
  'design',
  'manufacturing',
  'logistics',
  'customer_service',
  'technology',
  'consulting',
  'other'
);

-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_type service_category_type NOT NULL,
  category_name TEXT NOT NULL,
  category_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create service providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_description TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project selected services table
CREATE TABLE public.project_selected_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  assigned_position_id UUID REFERENCES public.contract_position_templates(id) ON DELETE SET NULL,
  selection_notes TEXT,
  status TEXT DEFAULT 'selected',
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, service_provider_id)
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_selected_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_categories
CREATE POLICY "Anyone can view service categories"
  ON public.service_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage service categories"
  ON public.service_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for service_providers
CREATE POLICY "Anyone can view active service providers"
  ON public.service_providers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage service providers"
  ON public.service_providers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for project_selected_services
CREATE POLICY "Anyone can view project selected services"
  ON public.project_selected_services FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage their project services"
  ON public.project_selected_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_selected_services.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Stewards can manage project services"
  ON public.project_selected_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_selected_services.project_id
        AND project_member_contracts.member_id = auth.uid()
        AND project_member_contracts.status = 'active'
        AND LOWER(project_member_contracts.contract_title) = 'steward'
    )
  );

-- Seed service categories
INSERT INTO public.service_categories (category_type, category_name, category_description) VALUES
  ('crowdfunding_launch', 'Crowdfunding Launch Services', 'Services that help create and launch crowdfunding campaigns'),
  ('crowdfunding_platform', 'Crowdfunding Platforms', 'Platforms where campaigns are hosted'),
  ('equity_crowdfunding', 'Equity Crowdfunding', 'Platforms for equity-based crowdfunding'),
  ('manufacturing_crowdfunding', 'Manufacturing Crowdfunding', 'Our manufacturing-focused crowdfunding platform'),
  ('marketing', 'Marketing Services', 'Marketing, PR, and advertising services'),
  ('legal', 'Legal Services', 'Legal counsel and compliance services'),
  ('accounting', 'Accounting Services', 'Bookkeeping, tax, and financial services'),
  ('design', 'Design Services', 'Product design, branding, and creative services'),
  ('manufacturing', 'Manufacturing Services', 'Production and manufacturing services'),
  ('logistics', 'Logistics Services', 'Shipping, fulfillment, and supply chain'),
  ('customer_service', 'Customer Service', 'Customer support and community management'),
  ('technology', 'Technology Services', 'Software development and IT services'),
  ('consulting', 'Consulting Services', 'Business strategy and advisory services');

-- Seed service providers
INSERT INTO public.service_providers (category_id, provider_name, provider_description, website_url)
SELECT
  sc.id,
  'LaunchBoom',
  'Crowdfunding campaign launch service specializing in Kickstarter and Indiegogo campaigns. Provides end-to-end campaign management, marketing, and optimization.',
  'https://launchboom.com'
FROM public.service_categories sc WHERE sc.category_type = 'crowdfunding_launch';

INSERT INTO public.service_providers (category_id, provider_name, provider_description, website_url)
SELECT
  sc.id,
  provider_name,
  provider_description,
  website_url
FROM public.service_categories sc
CROSS JOIN (
  VALUES
    ('Kickstarter', 'Rewards-based crowdfunding platform for creative projects', 'https://kickstarter.com'),
    ('Indiegogo', 'Global crowdfunding platform for innovative products and causes', 'https://indiegogo.com'),
    ('Gamefound', 'Crowdfunding platform focused on tabletop games', 'https://gamefound.com'),
    ('BackerKit Crowdfunding', 'Crowdfunding platform with integrated backer management', 'https://crowdfunding.backerkit.com')
) AS providers(provider_name, provider_description, website_url)
WHERE sc.category_type = 'crowdfunding_platform';

INSERT INTO public.service_providers (category_id, provider_name, provider_description, website_url)
SELECT
  sc.id,
  provider_name,
  provider_description,
  website_url
FROM public.service_categories sc
CROSS JOIN (
  VALUES
    ('Wefunder', 'Equity crowdfunding platform for startups', 'https://wefunder.com'),
    ('Republic', 'Investment platform for startups and growth companies', 'https://republic.com'),
    ('StartEngine', 'Equity crowdfunding and securities platform', 'https://startengine.com')
) AS providers(provider_name, provider_description, website_url)
WHERE sc.category_type = 'equity_crowdfunding';

INSERT INTO public.service_providers (category_id, provider_name, provider_description, website_url)
SELECT
  sc.id,
  'LianaBanyan Manufacturing Platform',
  'Our manufacturing-focused crowdfunding platform with equity, credit, and time-commitment options',
  NULL
FROM public.service_categories sc WHERE sc.category_type = 'manufacturing_crowdfunding';

-- Create trigger for updated_at
CREATE TRIGGER update_project_selected_services_updated_at
  BEFORE UPDATE ON public.project_selected_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
