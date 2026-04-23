-- K111: B2B Contracts for .net network portal
CREATE TABLE IF NOT EXISTS b2b_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT CHECK (contract_type IN ('production','supply','service','coalition')),
  terms JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','proposed','active','completed','cancelled')),
  start_date DATE,
  end_date DATE,
  total_value_cents BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE b2b_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contract parties see own" ON b2b_contracts FOR SELECT USING (provider_id = auth.uid() OR client_id = auth.uid());
CREATE POLICY "Either party manages" ON b2b_contracts FOR ALL USING (provider_id = auth.uid() OR client_id = auth.uid());
