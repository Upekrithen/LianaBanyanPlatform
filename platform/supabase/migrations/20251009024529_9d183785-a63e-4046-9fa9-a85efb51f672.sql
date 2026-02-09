-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create production levels table (6 levels per product)
CREATE TABLE public.production_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 6),
  level_name TEXT NOT NULL,
  units_count INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  votes_needed DECIMAL(12,2) GENERATED ALWAYS AS (units_count * unit_price) STORED,
  current_votes DECIMAL(12,2) DEFAULT 0,
  UNIQUE(product_id, level_number)
);

-- Create pledges/votes table
CREATE TABLE public.pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_level_id UUID REFERENCES public.production_levels(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('qr_code', 'kickstarter', 'direct')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project images table for carousel
CREATE TABLE public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product images table
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create QR codes table for vote tracking
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Create public read policies (crowdfunding platform should be viewable by all)
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view production levels" ON public.production_levels FOR SELECT USING (true);
CREATE POLICY "Anyone can view pledges" ON public.pledges FOR SELECT USING (true);
CREATE POLICY "Anyone can view project images" ON public.project_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view QR codes" ON public.qr_codes FOR SELECT USING (true);

-- Allow anyone to create pledges (for crowdfunding)
CREATE POLICY "Anyone can create pledges" ON public.pledges FOR INSERT WITH CHECK (true);

-- Create function to update production level votes
CREATE OR REPLACE FUNCTION public.update_production_level_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.production_levels
  SET current_votes = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.pledges
    WHERE production_level_id = NEW.production_level_id
  )
  WHERE id = NEW.production_level_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically update votes when pledge is created
CREATE TRIGGER update_votes_on_pledge_insert
  AFTER INSERT ON public.pledges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_production_level_votes();

-- Create indexes for better query performance
CREATE INDEX idx_products_project_id ON public.products(project_id);
CREATE INDEX idx_production_levels_product_id ON public.production_levels(product_id);
CREATE INDEX idx_pledges_production_level_id ON public.pledges(production_level_id);
CREATE INDEX idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_qr_codes_product_id ON public.qr_codes(product_id);