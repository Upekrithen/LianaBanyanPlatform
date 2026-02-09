-- Add custom guild naming and user creation capabilities
ALTER TABLE public.guilds 
  ADD COLUMN custom_name TEXT, -- User's preferred term: clan, tribe, family, etc.
  ADD COLUMN display_name TEXT, -- What they want to call it
  ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN is_official BOOLEAN NOT NULL DEFAULT false, -- LB-created vs user-created
  ADD COLUMN charter_id UUID; -- Link to charter if they have one

-- Guild charters (for resource pooling, B2B contracts, subsidiary agreements)
CREATE TABLE public.guild_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE UNIQUE,
  charter_name TEXT NOT NULL,
  charter_type TEXT NOT NULL CHECK (charter_type IN ('resource_pool', 'b2b_network', 'subsidiary', 'cooperative', 'trade_association')),
  
  -- Charter details
  charter_document TEXT NOT NULL, -- Legal/operational agreement
  resource_pooling_rules JSONB, -- How resources are shared
  profit_sharing_model JSONB, -- Revenue distribution
  governance_model JSONB, -- Decision-making structure
  
  -- Business entity formation
  can_form_entity BOOLEAN NOT NULL DEFAULT false,
  entity_relationship TEXT CHECK (entity_relationship IN ('subsidiary', 'affiliate', 'partner', 'cooperative')),
  
  -- Approval and activation
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business entities (separate but connected businesses under LB umbrella)
CREATE TABLE public.business_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  charter_id UUID REFERENCES public.guild_charters(id) ON DELETE CASCADE,
  
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('llc', 'cooperative', 'partnership', 'sole_proprietorship', 'nonprofit')),
  relationship_to_lb TEXT NOT NULL DEFAULT 'affiliate' CHECK (relationship_to_lb IN ('subsidiary', 'affiliate', 'partner', 'federated_member')),
  
  -- Legal and operational details
  registration_number TEXT,
  registration_state TEXT,
  ein TEXT, -- Employer Identification Number
  
  -- Financial pooling
  shared_revenue_account BOOLEAN NOT NULL DEFAULT false,
  profit_share_percentage NUMERIC CHECK (profit_share_percentage BETWEEN 0 AND 100),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inter-guild connections (branches between trunks in the .net framework)
CREATE TABLE public.guild_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  to_guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  
  connection_type TEXT NOT NULL CHECK (connection_type IN ('branch', 'collaboration', 'resource_share', 'b2b_contract', 'sister_guild')),
  connection_strength NUMERIC NOT NULL DEFAULT 1.0 CHECK (connection_strength BETWEEN 0 AND 10), -- Visual weight for network diagram
  
  -- Contract/Agreement details
  contract_terms JSONB,
  active_projects INTEGER NOT NULL DEFAULT 0,
  
  established_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE(from_guild_id, to_guild_id, connection_type)
);

-- Guild naming preferences (the list of acceptable terms)
CREATE TABLE public.guild_name_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_type TEXT NOT NULL UNIQUE, -- 'guild', 'clan', 'tribe', 'family', 'collective', etc.
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Charter signatories (members who agree to charter terms)
CREATE TABLE public.charter_signatories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charter_id UUID NOT NULL REFERENCES public.guild_charters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature_data JSONB, -- Digital signature info
  
  UNIQUE(charter_id, user_id)
);

-- Add foreign key constraint for guild charter_id
ALTER TABLE public.guilds 
  ADD CONSTRAINT fk_guilds_charter 
  FOREIGN KEY (charter_id) REFERENCES public.guild_charters(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_guild_charters_guild ON public.guild_charters(guild_id);
CREATE INDEX idx_business_entities_guild ON public.business_entities(guild_id);
CREATE INDEX idx_guild_connections_from ON public.guild_connections(from_guild_id);
CREATE INDEX idx_guild_connections_to ON public.guild_connections(to_guild_id);
CREATE INDEX idx_charter_signatories_charter ON public.charter_signatories(charter_id);
CREATE INDEX idx_charter_signatories_user ON public.charter_signatories(user_id);

-- Enable RLS
ALTER TABLE public.guild_charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_name_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charter_signatories ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Guild charters
CREATE POLICY "Anyone can view active charters" ON public.guild_charters 
  FOR SELECT USING (is_active = true);
CREATE POLICY "Guild members can create charters" ON public.guild_charters 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_id = guild_charters.guild_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Guild members can update own charters" ON public.guild_charters 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_id = guild_charters.guild_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage all charters" ON public.guild_charters 
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Business entities
CREATE POLICY "Anyone can view active entities" ON public.business_entities 
  FOR SELECT USING (is_active = true);
CREATE POLICY "Guild members can create entities" ON public.business_entities 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_id = business_entities.guild_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Guild members can manage entities" ON public.business_entities 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_id = business_entities.guild_id AND user_id = auth.uid()
    )
  );

-- Guild connections
CREATE POLICY "Anyone can view connections" ON public.guild_connections FOR SELECT USING (true);
CREATE POLICY "Guild members can create connections" ON public.guild_connections 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_id = guild_connections.from_guild_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Guild members can manage connections" ON public.guild_connections 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE (guild_id = guild_connections.from_guild_id OR guild_id = guild_connections.to_guild_id) 
        AND user_id = auth.uid()
    )
  );

-- Guild name types
CREATE POLICY "Anyone can view name types" ON public.guild_name_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage name types" ON public.guild_name_types FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Charter signatories
CREATE POLICY "Anyone can view signatories" ON public.charter_signatories FOR SELECT USING (true);
CREATE POLICY "Users can sign charters" ON public.charter_signatories 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update guilds RLS to allow user creation
DROP POLICY IF EXISTS "Admins can manage guilds" ON public.guilds;
CREATE POLICY "Users can create guilds" ON public.guilds 
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Guild creators can manage own guilds" ON public.guilds 
  FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Admins can manage all guilds" ON public.guilds 
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default guild name types
INSERT INTO public.guild_name_types (name_type, description) VALUES
  ('guild', 'Traditional craft or trade association'),
  ('clan', 'Family-based or kinship organization'),
  ('tribe', 'Community-focused collective'),
  ('family', 'Close-knit collaborative group'),
  ('collective', 'Democratic resource-sharing group'),
  ('cooperative', 'Worker-owned business structure'),
  ('alliance', 'Strategic partnership network'),
  ('syndicate', 'Professional association'),
  ('union', 'Labor organization'),
  ('consortium', 'Joint venture group'),
  ('federation', 'Autonomous units with common purpose'),
  ('circle', 'Peer network'),
  ('house', 'Noble house or lineage organization'),
  ('chapter', 'Local branch of larger organization');

-- Triggers
CREATE TRIGGER update_guild_charters_updated_at
  BEFORE UPDATE ON public.guild_charters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_entities_updated_at
  BEFORE UPDATE ON public.business_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();