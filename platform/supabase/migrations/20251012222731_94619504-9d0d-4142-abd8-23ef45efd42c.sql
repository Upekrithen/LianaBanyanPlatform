-- Create blockchain gas costs tracking table
CREATE TABLE IF NOT EXISTS public.blockchain_gas_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'contract_deploy', 'batch_mint', 'transfer', 'metadata_update'
  transaction_hash TEXT,
  gas_used NUMERIC NOT NULL DEFAULT 0,
  gas_price_gwei NUMERIC NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC NOT NULL DEFAULT 0,
  funded_from_pool BOOLEAN DEFAULT true,
  network TEXT NOT NULL DEFAULT 'base', -- 'base', 'base-sepolia' (testnet)
  block_number BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create index for project lookups
CREATE INDEX idx_gas_costs_project ON public.blockchain_gas_costs(project_id);
CREATE INDEX idx_gas_costs_tx_type ON public.blockchain_gas_costs(transaction_type);

-- Add blockchain fields to LB funding pool
ALTER TABLE public.lb_funding_pool
ADD COLUMN IF NOT EXISTS allocated_to_gas NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS gas_budget_percentage NUMERIC NOT NULL DEFAULT 1.0; -- 1% of pool for gas

-- Add blockchain fields to medallion_eligibility
ALTER TABLE public.medallion_eligibility
ADD COLUMN IF NOT EXISTS token_contract_address TEXT,
ADD COLUMN IF NOT EXISTS token_id INTEGER,
ADD COLUMN IF NOT EXISTS minted_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS minted_block_number BIGINT,
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Create function to allocate gas from pool
CREATE OR REPLACE FUNCTION public.allocate_gas_from_pool(
  _project_id UUID,
  _transaction_type TEXT,
  _gas_cost_usd NUMERIC,
  _tx_hash TEXT DEFAULT NULL,
  _notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _gas_record_id UUID;
  _available_gas_budget NUMERIC;
BEGIN
  -- Check available gas budget
  SELECT (total_pool_amount * gas_budget_percentage / 100.0) - allocated_to_gas
  INTO _available_gas_budget
  FROM public.lb_funding_pool
  LIMIT 1;

  IF _available_gas_budget < _gas_cost_usd THEN
    RAISE EXCEPTION 'Insufficient gas budget. Available: %, Requested: %', _available_gas_budget, _gas_cost_usd;
  END IF;

  -- Record gas cost
  INSERT INTO public.blockchain_gas_costs (
    project_id,
    transaction_type,
    transaction_hash,
    total_cost_usd,
    funded_from_pool,
    notes
  ) VALUES (
    _project_id,
    _transaction_type,
    _tx_hash,
    _gas_cost_usd,
    true,
    _notes
  )
  RETURNING id INTO _gas_record_id;

  -- Update pool allocation
  UPDATE public.lb_funding_pool
  SET
    allocated_to_gas = allocated_to_gas + _gas_cost_usd,
    updated_at = now();

  RETURN _gas_record_id;
END;
$$;

-- RLS Policies for blockchain_gas_costs
ALTER TABLE public.blockchain_gas_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gas costs"
  ON public.blockchain_gas_costs
  FOR SELECT
  USING (true);

CREATE POLICY "Project owners can insert gas costs"
  ON public.blockchain_gas_costs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = blockchain_gas_costs.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage gas costs"
  ON public.blockchain_gas_costs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
