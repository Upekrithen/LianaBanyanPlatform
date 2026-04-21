-- Create clans table
CREATE TABLE public.clans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  custom_name TEXT,
  display_name TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  stake_amount NUMERIC NOT NULL DEFAULT 0,
  lb_fee_paid NUMERIC NOT NULL DEFAULT 0,
  charter_id UUID
);

-- Create clan_members table
CREATE TABLE public.clan_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(clan_id, user_id)
);

-- Create clan_charters table
CREATE TABLE public.clan_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE NOT NULL,
  charter_name TEXT NOT NULL,
  charter_document TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT false
);

-- Create clan_member_agreements table for benefits between members
CREATE TABLE public.clan_member_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  agreement_type TEXT NOT NULL, -- 'discount', 'priority_access', 'auto_contract'
  discount_percentage NUMERIC,
  applies_to TEXT, -- 'all_members', 'specific_members'
  specific_member_ids UUID[],
  terms JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add foreign key for charter_id in clans table
ALTER TABLE public.clans
ADD CONSTRAINT fk_clan_charter
FOREIGN KEY (charter_id) REFERENCES public.clan_charters(id);

-- Enable RLS
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_member_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clans
CREATE POLICY "Anyone can view active clans"
ON public.clans FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create clans"
ON public.clans FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Clan creators can update own clans"
ON public.clans FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all clans"
ON public.clans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clan_members
CREATE POLICY "Anyone can view clan members"
ON public.clan_members FOR SELECT
USING (true);

CREATE POLICY "Users can join clans"
ON public.clan_members FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clan members can view own membership"
ON public.clan_members FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for clan_charters
CREATE POLICY "Anyone can view active charters"
ON public.clan_charters FOR SELECT
USING (is_active = true);

CREATE POLICY "Clan members can create charters"
ON public.clan_charters FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clan_members
    WHERE clan_id = clan_charters.clan_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all charters"
ON public.clan_charters FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clan_member_agreements
CREATE POLICY "Clan members can view agreements"
ON public.clan_member_agreements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clan_members
    WHERE clan_id = clan_member_agreements.clan_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Clan members can create agreements"
ON public.clan_member_agreements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clan_members
    WHERE clan_id = clan_member_agreements.clan_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Agreement creators can update own agreements"
ON public.clan_member_agreements FOR UPDATE
USING (created_by = auth.uid());

-- Add updated_at trigger for clans
CREATE TRIGGER update_clans_updated_at
BEFORE UPDATE ON public.clans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for clan_charters
CREATE TRIGGER update_clan_charters_updated_at
BEFORE UPDATE ON public.clan_charters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
