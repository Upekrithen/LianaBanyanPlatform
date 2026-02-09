-- ============================================
-- AGENT ONBOARDING - KEIRSEY TEMPERAMENT SORTER
-- ============================================

-- Create Keirsey temperament types enum
CREATE TYPE public.keirsey_temperament AS ENUM ('guardian', 'artisan', 'idealist', 'rational');
CREATE TYPE public.keirsey_variant AS ENUM (
  'supervisor', 'inspector', 'provider', 'protector',
  'promoter', 'crafter', 'performer', 'composer',
  'teacher', 'counselor', 'champion', 'healer',
  'fieldmarshal', 'mastermind', 'inventor', 'architect'
);

-- Agent Onboarding Records
CREATE TABLE public.agent_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position_application_id UUID REFERENCES public.position_applications(id),
  
  -- Onboarding status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'assessment_complete', 'approved', 'rejected')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Keirsey Assessment
  keirsey_completed BOOLEAN DEFAULT false,
  keirsey_completed_at TIMESTAMPTZ,
  keirsey_temperament keirsey_temperament,
  keirsey_variant keirsey_variant,
  keirsey_assessment_url TEXT, -- Link to full results
  keirsey_score_summary JSONB, -- Detailed scores if provided
  
  -- HR Processing
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  hr_notes TEXT,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_review')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, position_application_id)
);

-- Agent Assessment Documents (for uploading results)
CREATE TABLE public.agent_assessment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES public.agent_onboarding(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL CHECK (document_type IN ('keirsey_results', 'keirsey_certificate', 'other_assessment')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size BIGINT,
  mime_type TEXT,
  
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_agent_onboarding_user ON public.agent_onboarding(user_id);
CREATE INDEX idx_agent_onboarding_status ON public.agent_onboarding(status);
CREATE INDEX idx_agent_onboarding_keirsey_temperament ON public.agent_onboarding(keirsey_temperament);

CREATE INDEX idx_agent_docs_onboarding ON public.agent_assessment_documents(onboarding_id);
CREATE INDEX idx_agent_docs_user ON public.agent_assessment_documents(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Agent Onboarding
ALTER TABLE public.agent_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding records"
  ON public.agent_onboarding FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own onboarding records"
  ON public.agent_onboarding FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own onboarding records"
  ON public.agent_onboarding FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "HR can view all onboarding records"
  ON public.agent_onboarding FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can update onboarding records"
  ON public.agent_onboarding FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Agent Assessment Documents
ALTER TABLE public.agent_assessment_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessment documents"
  ON public.agent_assessment_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload own assessment documents"
  ON public.agent_assessment_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "HR can view all assessment documents"
  ON public.agent_assessment_documents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can verify documents"
  ON public.agent_assessment_documents FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp
CREATE TRIGGER update_agent_onboarding_updated_at
  BEFORE UPDATE ON public.agent_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update assessment completion status
CREATE OR REPLACE FUNCTION public.update_keirsey_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.keirsey_temperament IS NOT NULL AND NEW.keirsey_variant IS NOT NULL THEN
    NEW.keirsey_completed := true;
    NEW.keirsey_completed_at := COALESCE(NEW.keirsey_completed_at, NOW());
    
    -- Update overall status
    IF NEW.status = 'pending' OR NEW.status = 'in_progress' THEN
      NEW.status := 'assessment_complete';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_keirsey_completion
  BEFORE INSERT OR UPDATE ON public.agent_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_keirsey_completion();