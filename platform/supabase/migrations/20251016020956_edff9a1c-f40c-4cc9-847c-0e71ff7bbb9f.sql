-- Create medallion_designs table for project-specific medallion customization
CREATE TABLE IF NOT EXISTS public.medallion_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  
  -- Design details
  design_type TEXT NOT NULL CHECK (design_type IN ('default', 'custom')),
  design_name TEXT NOT NULL,
  design_notes TEXT,
  logo_url TEXT,
  background_style TEXT DEFAULT 'hexagon',
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'in_production', 'completed')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id)
);

-- Create medallion_production_orders table for tracking physical production
CREATE TABLE IF NOT EXISTS public.medallion_production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.medallion_designs(id) ON DELETE SET NULL,
  
  -- Order details
  order_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  
  -- Production status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'design_approval',
    'die_creation',
    'production',
    'quality_check',
    'shipping',
    'delivered',
    'cancelled'
  )),
  
  -- Shipping & tracking
  tracking_number TEXT,
  shipping_carrier TEXT,
  estimated_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.medallion_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medallion_production_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medallion_designs
CREATE POLICY "Anyone can view approved designs"
  ON public.medallion_designs
  FOR SELECT
  USING (status = 'approved' OR status = 'completed');

CREATE POLICY "Project owners can manage designs"
  ON public.medallion_designs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = medallion_designs.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all designs"
  ON public.medallion_designs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for medallion_production_orders
CREATE POLICY "Anyone can view production orders"
  ON public.medallion_production_orders
  FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage production orders"
  ON public.medallion_production_orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = medallion_production_orders.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all production orders"
  ON public.medallion_production_orders
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_medallion_designs_project ON public.medallion_designs(project_id);
CREATE INDEX idx_medallion_designs_status ON public.medallion_designs(status);
CREATE INDEX idx_production_orders_project ON public.medallion_production_orders(project_id);
CREATE INDEX idx_production_orders_status ON public.medallion_production_orders(status);

-- Add updated_at trigger
CREATE TRIGGER update_medallion_designs_updated_at
  BEFORE UPDATE ON public.medallion_designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at
  BEFORE UPDATE ON public.medallion_production_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();