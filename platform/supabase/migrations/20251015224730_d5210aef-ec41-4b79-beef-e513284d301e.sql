-- Create peer member contracts table for member-to-member contracts
CREATE TABLE public.peer_member_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_title TEXT NOT NULL,
  contract_description TEXT,
  compensation_type TEXT NOT NULL DEFAULT 'equity' CHECK (compensation_type IN ('equity', 'cash', 'hybrid')),
  cash_amount NUMERIC DEFAULT 0,
  equity_percentage NUMERIC,
  time_commitment_days INTEGER NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  terms JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled')),
  contract_xml_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT different_parties CHECK (initiator_id != recipient_id)
);

-- Enable RLS
ALTER TABLE public.peer_member_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view contracts they're involved in"
  ON public.peer_member_contracts
  FOR SELECT
  USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create peer contracts"
  ON public.peer_member_contracts
  FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Initiators can update own contracts"
  ON public.peer_member_contracts
  FOR UPDATE
  USING (auth.uid() = initiator_id AND status = 'pending');

CREATE POLICY "Recipients can accept/reject contracts"
  ON public.peer_member_contracts
  FOR UPDATE
  USING (auth.uid() = recipient_id AND status = 'pending');

-- Create trigger for updated_at
CREATE TRIGGER update_peer_contracts_updated_at
  BEFORE UPDATE ON public.peer_member_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_peer_contracts_initiator ON public.peer_member_contracts(initiator_id);
CREATE INDEX idx_peer_contracts_recipient ON public.peer_member_contracts(recipient_id);
CREATE INDEX idx_peer_contracts_status ON public.peer_member_contracts(status);