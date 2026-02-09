-- Task 23: External Service Integration (Fixed)
-- Member service platform links with rate monitoring
CREATE TABLE IF NOT EXISTS public.member_service_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_platform TEXT NOT NULL CHECK (service_platform IN ('fiverr', 'etsy', 'guru', 'upwork', 'freelancer', 'toptal', 'other')),
  platform_profile_url TEXT NOT NULL,
  platform_username TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'flagged')),
  
  -- Rate monitoring
  advertised_rate_min NUMERIC,
  advertised_rate_max NUMERIC,
  lb_rate_category TEXT,
  rate_differential_flagged BOOLEAN DEFAULT false,
  
  -- Compliance tracking
  lb_contracts_completed INTEGER DEFAULT 0,
  external_contracts_completed INTEGER DEFAULT 0,
  violations_count INTEGER DEFAULT 0,
  last_violation_date TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LB member-to-member hiring enforcement
CREATE TABLE IF NOT EXISTS public.lb_member_hiring_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiring_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hired_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_link_id UUID REFERENCES public.member_service_links(id) ON DELETE SET NULL,
  
  -- Contract details
  agreed_rate NUMERIC NOT NULL,
  lb_scale_rate NUMERIC NOT NULL,
  rate_compliant BOOLEAN NOT NULL,
  
  -- If non-compliant
  violation_severity TEXT CHECK (violation_severity IN ('minor', 'major', 'severe')),
  reputation_penalty INTEGER,
  
  contract_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_service_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lb_member_hiring_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_service_links
CREATE POLICY "Users can view their own service links"
  ON public.member_service_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service links"
  ON public.member_service_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service links"
  ON public.member_service_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service links"
  ON public.member_service_links FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all service links"
  ON public.member_service_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policies for lb_member_hiring_log
CREATE POLICY "Users can view their own hiring records"
  ON public.lb_member_hiring_log FOR SELECT
  USING (auth.uid() = hiring_member_id OR auth.uid() = hired_member_id);

CREATE POLICY "Users can create hiring records"
  ON public.lb_member_hiring_log FOR INSERT
  WITH CHECK (auth.uid() = hiring_member_id);

CREATE POLICY "Admins can view all hiring records"
  ON public.lb_member_hiring_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_member_service_links_user ON public.member_service_links(user_id);
CREATE INDEX idx_member_service_links_platform ON public.member_service_links(service_platform);
CREATE INDEX idx_member_service_links_active ON public.member_service_links(is_active);
CREATE INDEX idx_lb_hiring_log_hiring_member ON public.lb_member_hiring_log(hiring_member_id);
CREATE INDEX idx_lb_hiring_log_hired_member ON public.lb_member_hiring_log(hired_member_id);
CREATE INDEX idx_lb_hiring_log_compliant ON public.lb_member_hiring_log(rate_compliant);

-- Trigger for updated_at
CREATE TRIGGER update_member_service_links_updated_at
  BEFORE UPDATE ON public.member_service_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();