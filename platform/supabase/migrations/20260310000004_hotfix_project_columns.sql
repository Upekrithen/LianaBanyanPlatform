-- HOTFIX: Add project funding columns that were missed
-- These ALTER TABLE statements are from 20260310000001_project_pledges.sql
-- which was recorded as applied but the ALTER statements didn't execute.
-- All use IF NOT EXISTS for idempotency.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS funding_goal NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS current_funding NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS backer_count INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS funding_deadline TIMESTAMPTZ;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS medallion_eligible BOOLEAN DEFAULT FALSE;

-- Also ensure project_pledges table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.project_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_credits NUMERIC NOT NULL CHECK (amount_credits > 0),
  wave_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'fulfilled', 'refunded')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  fulfilled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  transaction_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_project_pledges_project_id ON public.project_pledges(project_id);
CREATE INDEX IF NOT EXISTS idx_project_pledges_user_id ON public.project_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_project_pledges_status ON public.project_pledges(status);
CREATE INDEX IF NOT EXISTS idx_project_pledges_created ON public.project_pledges(created_at DESC);

-- RLS
ALTER TABLE public.project_pledges ENABLE ROW LEVEL SECURITY;

-- Policies (use DO blocks to check existence)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'project_pledges' AND policyname = 'Users can view own pledges'
  ) THEN
    CREATE POLICY "Users can view own pledges"
      ON public.project_pledges FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'project_pledges' AND policyname = 'Project owners can view project pledges'
  ) THEN
    CREATE POLICY "Project owners can view project pledges"
      ON public.project_pledges FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_pledges.project_id
          AND p.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'project_pledges' AND policyname = 'Users can create own pledges'
  ) THEN
    CREATE POLICY "Users can create own pledges"
      ON public.project_pledges FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'project_pledges' AND policyname = 'Users can cancel own pledges'
  ) THEN
    CREATE POLICY "Users can cancel own pledges"
      ON public.project_pledges FOR UPDATE
      USING (auth.uid() = user_id AND status = 'active')
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Aggregate view
CREATE OR REPLACE VIEW public.project_funding_summary AS
SELECT
  p.id AS project_id,
  p.name AS project_name,
  p.funding_goal,
  COALESCE(SUM(pp.amount_credits) FILTER (WHERE pp.status = 'active'), 0) AS total_pledged,
  COUNT(DISTINCT pp.user_id) FILTER (WHERE pp.status = 'active') AS unique_backers,
  CASE
    WHEN p.funding_goal > 0
    THEN ROUND((COALESCE(SUM(pp.amount_credits) FILTER (WHERE pp.status = 'active'), 0) / p.funding_goal) * 100, 1)
    ELSE 0
  END AS funding_percentage,
  p.funding_deadline,
  p.status AS project_status
FROM public.projects p
LEFT JOIN public.project_pledges pp ON pp.project_id = p.id
GROUP BY p.id, p.name, p.funding_goal, p.funding_deadline, p.status;

-- Funding update function
CREATE OR REPLACE FUNCTION public.update_project_funding()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects SET
    current_funding = COALESCE((
      SELECT SUM(amount_credits) FROM public.project_pledges
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'active'
    ), 0),
    backer_count = COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM public.project_pledges
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'active'
    ), 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_project_funding_trigger ON public.project_pledges;
CREATE TRIGGER update_project_funding_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.project_pledges
  FOR EACH ROW EXECUTE FUNCTION public.update_project_funding();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_pledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pledge_updated_at ON public.project_pledges;
CREATE TRIGGER set_pledge_updated_at
  BEFORE UPDATE ON public.project_pledges
  FOR EACH ROW EXECUTE FUNCTION public.update_pledge_updated_at();
