-- Production Schedule Manager Tables
CREATE TABLE IF NOT EXISTS public.machine_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_name TEXT NOT NULL,
  node_location TEXT NOT NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('short', 'long')),
  available_from TIMESTAMPTZ NOT NULL,
  available_until TIMESTAMPTZ NOT NULL,
  is_reserved BOOLEAN DEFAULT false,
  reserved_for_product_id UUID REFERENCES public.products(id),
  maintenance_day INTEGER CHECK (maintenance_day BETWEEN 0 AND 6),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.production_value_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  value_score NUMERIC NOT NULL DEFAULT 0,
  node_availability_score NUMERIC NOT NULL DEFAULT 0,
  priority_boost NUMERIC NOT NULL DEFAULT 1.0,
  demand_factor NUMERIC NOT NULL DEFAULT 0,
  cycle_fit_score NUMERIC NOT NULL DEFAULT 0,
  ghost_data_weight NUMERIC NOT NULL DEFAULT 0,
  preorder_count INTEGER NOT NULL DEFAULT 0,
  never_produced BOOLEAN DEFAULT true,
  days_since_last_production INTEGER DEFAULT NULL,
  estimated_next_run_date TIMESTAMPTZ,
  queue_position INTEGER,
  calculation_details JSONB,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.production_queue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  queue_position INTEGER NOT NULL,
  value_score NUMERIC NOT NULL,
  preorder_count INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_value_ratings_product ON public.production_value_ratings(product_id);
CREATE INDEX idx_value_ratings_score ON public.production_value_ratings(value_score DESC);
CREATE INDEX idx_machine_schedules_available ON public.machine_schedules(available_from, available_until) WHERE NOT is_reserved;
CREATE INDEX idx_queue_history_product_time ON public.production_queue_history(product_id, recorded_at DESC);

-- RLS Policies
ALTER TABLE public.machine_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_value_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_queue_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view machine schedules"
  ON public.machine_schedules FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage machine schedules"
  ON public.machine_schedules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view value ratings"
  ON public.production_value_ratings FOR SELECT
  USING (true);

CREATE POLICY "System can update value ratings"
  ON public.production_value_ratings FOR ALL
  USING (true);

CREATE POLICY "Anyone can view queue history"
  ON public.production_queue_history FOR SELECT
  USING (true);

CREATE POLICY "System can insert queue history"
  ON public.production_queue_history FOR INSERT
  WITH CHECK (true);

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_value_rating_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_value_rating_timestamp
  BEFORE UPDATE ON public.production_value_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_value_rating_timestamp();

-- Function to log queue position changes
CREATE OR REPLACE FUNCTION public.log_queue_position_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.queue_position IS DISTINCT FROM NEW.queue_position) OR TG_OP = 'INSERT' THEN
    INSERT INTO public.production_queue_history (product_id, queue_position, value_score, preorder_count)
    VALUES (NEW.product_id, NEW.queue_position, NEW.value_score, NEW.preorder_count);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_queue_changes
  AFTER INSERT OR UPDATE ON public.production_value_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_queue_position_change();