-- ============================================================================
-- Session 83: Bounties + Coverage Minutes tables
-- ============================================================================

-- ── Bounties ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bounties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  difficulty TEXT DEFAULT 'intermediate',
  required_skills TEXT[] DEFAULT '{}',

  reward_credits INTEGER DEFAULT 0,
  reward_marks INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  reward_joules INTEGER DEFAULT 0,

  stamp_criteria JSONB DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',

  status TEXT NOT NULL DEFAULT 'open',
  max_claimants INTEGER DEFAULT 3,

  crew_id UUID,
  crew_table_id UUID,
  storefront_id UUID,

  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bounty_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bounty_id UUID REFERENCES public.bounties(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role_level TEXT NOT NULL DEFAULT 'primary',
  status TEXT NOT NULL DEFAULT 'claimed',
  submission_notes TEXT,
  submission_url TEXT,
  stamp_rating INTEGER,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(bounty_id, user_id)
);

ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open bounties" ON public.bounties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create bounties" ON public.bounties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator or admin can update bounties" ON public.bounties FOR UPDATE USING (auth.uid() = created_by OR public.is_admin());

ALTER TABLE public.bounty_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view claims" ON public.bounty_claims FOR SELECT USING (true);
CREATE POLICY "Authenticated users can claim" ON public.bounty_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Claimant can update own claim" ON public.bounty_claims FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can update all claims" ON public.bounty_claims FOR UPDATE USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_bounties_category ON public.bounties(category);
CREATE INDEX IF NOT EXISTS idx_bounties_status ON public.bounties(status);
CREATE INDEX IF NOT EXISTS idx_bounty_claims_bounty ON public.bounty_claims(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_claims_user ON public.bounty_claims(user_id);

-- ── Seed 7 HexIsle Engineering Bounties ─────────────────────────────────────

INSERT INTO public.bounties (title, subtitle, description, category, priority, difficulty, required_skills, reward_credits, reward_marks, reward_xp, stamp_criteria, deliverables, status) VALUES
(
  'Hydraulic Seal Design',
  'Swan Neck Waterproof Seal at Production Scale',
  'Design hydraulic seal mechanism for the football wave generation port. Swan Neck inter-Hexel connector must maintain watertight seal at 2.17 PSI across 420 connection points.',
  'hexisle_engineering', 'critical', 'expert',
  ARRAY['CAD', 'Fluid Dynamics', 'Seal Design'],
  2000, 50, 200,
  '{"1":"Seal concept only","2":"Basic CAD model","3":"Tested prototype design","4":"Pressure-rated design with materials spec","5":"Production-ready with test data"}'::jsonb,
  ARRAY['CAD model', 'Materials specification', 'Pressure test protocol', 'Assembly instructions'],
  'open'
),
(
  '42→60mm Dimensional Port',
  'Football / Wave Generator Area Port',
  'Engineer the dimensional scaling from 42mm to 60mm flat-to-flat preserving cam follower geometry, rocking base clearance, and variable amplitude behavior.',
  'hexisle_engineering', 'high', 'advanced',
  ARRAY['CAD', 'Mechanical Engineering', 'Tolerance Analysis'],
  3000, 75, 300,
  '{"1":"Concept sketch","2":"Basic scaling model","3":"Tolerance analysis complete","4":"Full engineering drawings","5":"Prototype-validated with test results"}'::jsonb,
  ARRAY['Engineering drawings', 'Tolerance stack-up analysis', 'Material recommendations', 'Prototype validation report'],
  'open'
),
(
  'Tesla Valve Optimization',
  'Golden Lotus Geometry Validation for Injection Molding',
  'Optimize Tesla valve design for improved flow control in Hexel channels. Validate Golden Lotus cups for injection mold tooling.',
  'hexisle_engineering', 'high', 'expert',
  ARRAY['Fluid Dynamics', 'CFD', 'CAD'],
  2500, 60, 250,
  '{"1":"Literature review only","2":"Basic CFD simulation","3":"Optimized geometry with CFD validation","4":"Prototype tested","5":"Production-ready with flow data"}'::jsonb,
  ARRAY['CFD simulation results', 'Optimized valve geometry', 'Flow rate data', 'Comparison to baseline'],
  'open'
),
(
  'Reservoir Pressure Testing',
  'Y/Z Reservoir Oscillation Test Protocol',
  'Develop pressure testing protocol for Hexel reservoir components. Critical weight relationship Y+Z > X must be validated.',
  'hexisle_engineering', 'medium', 'intermediate',
  ARRAY['Testing', 'QA', 'Pressure Systems'],
  1500, 40, 150,
  '{"1":"Test plan outline","2":"Basic test procedure","3":"Full protocol with safety","4":"Validated with sample data","5":"Production QA standard with fixtures"}'::jsonb,
  ARRAY['Test protocol document', 'Safety checklist', 'Sample test data', 'Pass/fail criteria'],
  'open'
),
(
  'Ouralis Gear Train QC',
  'Quality Control Spec for 20-Tooth Gear at SLS/Injection Scale',
  'Build quality control system for Ouralis gear train assembly. Production operators need measurable criteria without engineering expertise.',
  'hexisle_engineering', 'medium', 'intermediate',
  ARRAY['QC', 'Metrology', 'Gear Systems'],
  2000, 50, 200,
  '{"1":"Inspection checklist","2":"Go/no-go gauging plan","3":"Full QC process with SPC","4":"Automated inspection concept","5":"Production QC line with statistical controls"}'::jsonb,
  ARRAY['QC checklist', 'Gauge R&R study', 'SPC chart templates', 'Accept/reject criteria'],
  'open'
),
(
  'Compliant Mechanism Durability',
  'SlottedTop Flex-Grip Snap Lock Fatigue Testing',
  'Test compliant mechanism components for fatigue life and durability. SlottedTop arms must survive thousands of cycles.',
  'hexisle_engineering', 'medium', 'advanced',
  ARRAY['Materials Science', 'Fatigue Testing', 'FEA'],
  1500, 40, 150,
  '{"1":"Test plan only","2":"Basic fatigue data","3":"Full S-N curve with FEA correlation","4":"Life prediction model","5":"Accelerated life test with field correlation"}'::jsonb,
  ARRAY['Fatigue test data', 'S-N curve', 'FEA validation', 'Life prediction model'],
  'open'
),
(
  'Pneumatic Plant Growth',
  'Telescoping Ratchet Prototype for Pneumatic Palm Tree',
  'Design pneumatic actuation system for plant growth simulation in Hexel. Nested segments extending under air pressure with ratchet-click locking.',
  'hexisle_engineering', 'low', 'expert',
  ARRAY['Pneumatics', 'Bio-Mechanics', 'Control Systems'],
  2500, 60, 250,
  '{"1":"Concept sketch","2":"Basic pneumatic circuit","3":"Controlled actuation demo","4":"Integrated with plant growth model","5":"Self-regulating bio-pneumatic system"}'::jsonb,
  ARRAY['Pneumatic circuit diagram', 'Control logic', 'Growth simulation data', 'Integration guide'],
  'open'
);

-- ── Coverage Minutes ────────────────────────────────────────────────────────
-- Tables already exist from migration 20260307100000 (member_id schema).
-- Also a simpler `coverage_minutes` table from 20260319000019 (user_id schema).
-- We use the existing tables — no new creation needed here.
-- The DB service in coverageMinutesDB.ts bridges to the existing `coverage_minutes` table.
