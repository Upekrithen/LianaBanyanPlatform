-- Wave-based production system
CREATE TABLE IF NOT EXISTS public.production_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  production_level_id UUID NOT NULL REFERENCES public.production_levels(id) ON DELETE CASCADE,
  wave_number INTEGER NOT NULL,
  wave_name TEXT,
  max_units_per_node INTEGER NOT NULL DEFAULT 15000,
  total_wave_capacity INTEGER NOT NULL,
  units_allocated INTEGER NOT NULL DEFAULT 0,
  units_reserved_fcfs INTEGER NOT NULL DEFAULT 0, -- first-come-first-serve slots (1/3)
  base_price_multiplier NUMERIC NOT NULL DEFAULT 1.0, -- 1.0 = standard, >1.0 = premium
  wave_start_date TIMESTAMPTZ,
  wave_end_date TIMESTAMPTZ,
  estimated_fulfillment_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'in_production', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, production_level_id, wave_number)
);

-- Node capacity and assignments
CREATE TABLE IF NOT EXISTS public.production_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL, -- e.g., '3d_printing', 'assembly', 'painting'
  max_capacity_per_wave INTEGER NOT NULL DEFAULT 15000,
  current_wave_allocation INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_from_premium_funds BOOLEAN NOT NULL DEFAULT false,
  funded_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wave node assignments
CREATE TABLE IF NOT EXISTS public.wave_node_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_id UUID NOT NULL REFERENCES public.production_waves(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.production_nodes(id) ON DELETE CASCADE,
  units_assigned INTEGER NOT NULL DEFAULT 0,
  assignment_status TEXT NOT NULL DEFAULT 'assigned' CHECK (assignment_status IN ('assigned', 'in_progress', 'completed', 'paused')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wave_id, node_id)
);

-- Wave preorder slots
CREATE TABLE IF NOT EXISTS public.wave_preorder_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_id UUID NOT NULL REFERENCES public.production_waves(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pledge_id UUID REFERENCES public.pledges(id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('premium', 'fcfs', 'standard')),
  units_reserved INTEGER NOT NULL DEFAULT 1,
  premium_paid NUMERIC DEFAULT 0,
  reservation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Premium fund allocation (impatience tax pool)
CREATE TABLE IF NOT EXISTS public.wave_premium_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_premium_collected NUMERIC NOT NULL DEFAULT 0,
  allocated_to_nodes NUMERIC NOT NULL DEFAULT 0,
  available_for_expansion NUMERIC NOT NULL DEFAULT 0,
  nodes_funded_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_production_waves_product ON public.production_waves(product_id);
CREATE INDEX IF NOT EXISTS idx_production_waves_level ON public.production_waves(production_level_id);
CREATE INDEX IF NOT EXISTS idx_production_waves_status ON public.production_waves(status);
CREATE INDEX IF NOT EXISTS idx_wave_node_assignments_wave ON public.wave_node_assignments(wave_id);
CREATE INDEX IF NOT EXISTS idx_wave_node_assignments_node ON public.wave_node_assignments(node_id);
CREATE INDEX IF NOT EXISTS idx_wave_preorder_slots_wave ON public.wave_preorder_slots(wave_id);
CREATE INDEX IF NOT EXISTS idx_wave_preorder_slots_user ON public.wave_preorder_slots(user_id);

-- Auto-update timestamps
CREATE TRIGGER update_production_waves_updated_at
  BEFORE UPDATE ON public.production_waves
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_nodes_updated_at
  BEFORE UPDATE ON public.production_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wave_node_assignments_updated_at
  BEFORE UPDATE ON public.wave_node_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wave_premium_funds_updated_at
  BEFORE UPDATE ON public.wave_premium_funds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.production_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wave_node_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wave_preorder_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wave_premium_funds ENABLE ROW LEVEL SECURITY;

-- Anyone can view production waves
CREATE POLICY "Anyone can view production waves"
  ON public.production_waves FOR SELECT
  USING (true);

-- Anyone can view production nodes
CREATE POLICY "Anyone can view production nodes"
  ON public.production_nodes FOR SELECT
  USING (true);

-- Anyone can view wave assignments
CREATE POLICY "Anyone can view wave node assignments"
  ON public.wave_node_assignments FOR SELECT
  USING (true);

-- Users can view own preorder slots
CREATE POLICY "Users can view own preorder slots"
  ON public.wave_preorder_slots FOR SELECT
  USING (auth.uid() = user_id OR true);

-- Users can create preorder slots
CREATE POLICY "Users can create preorder slots"
  ON public.wave_preorder_slots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can view premium funds
CREATE POLICY "Anyone can view premium funds"
  ON public.wave_premium_funds FOR SELECT
  USING (true);

-- Project owners can manage waves
CREATE POLICY "Project owners can manage waves"
  ON public.production_waves FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.projects pr ON pr.id = p.project_id
      WHERE p.id = production_waves.product_id
      AND pr.owner_id = auth.uid()
    )
  );

-- Admins can manage nodes
CREATE POLICY "Admins can manage nodes"
  ON public.production_nodes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Project owners can manage wave assignments
CREATE POLICY "Project owners can manage wave assignments"
  ON public.wave_node_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.production_waves pw
      JOIN public.products p ON p.id = pw.product_id
      JOIN public.projects pr ON pr.id = p.project_id
      WHERE pw.id = wave_node_assignments.wave_id
      AND pr.owner_id = auth.uid()
    )
  );

-- Project owners can manage premium funds
CREATE POLICY "Project owners can manage premium funds"
  ON public.wave_premium_funds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.projects pr ON pr.id = p.project_id
      WHERE p.id = wave_premium_funds.product_id
      AND pr.owner_id = auth.uid()
    )
  );