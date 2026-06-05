-- KN088 / BP009 — Bounty Poster Framework
-- Creates bounties + bounty_submissions tables.
-- Bounty Posters ship inside LB Frame v1 to crowdsource empirical anchors
-- that Path B requires before Wave 1 enterprise outreach.
-- Composes with: #2299 Published R&D Battery, #2295 Aggregate Bounty,
--               Stance on Competition (Kallistra template),
--               Furnace gear-tooth-fit verification (KN044).

-- Bounty reward currency enum
DO $$ BEGIN
  CREATE TYPE public.bounty_currency AS ENUM ('Marks', 'Credits');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Bounty status enum
DO $$ BEGIN
  CREATE TYPE public.bounty_status AS ENUM (
    'open',
    'in_progress',
    'under_review',
    'awarded',
    'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Submission status enum
DO $$ BEGIN
  CREATE TYPE public.bounty_submission_status AS ENUM (
    'pending',
    'furnace_verifying',
    'furnace_passed',
    'furnace_failed',
    'awarded',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Bounties table
CREATE TABLE IF NOT EXISTS public.bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  empirical_anchor TEXT NOT NULL,       -- What provisional/claim this anchors
  enterprise_cohort TEXT,               -- NSA/DARPA/Anthropic/Sony etc.
  reward_marks NUMERIC(10,2) NOT NULL DEFAULT 0,
  reward_currency public.bounty_currency NOT NULL DEFAULT 'Marks',
  license_scope TEXT NOT NULL DEFAULT 'AGPL',  -- AGPL | Apache | Both
  status public.bounty_status NOT NULL DEFAULT 'open',
  featured_in_lb_frame BOOLEAN NOT NULL DEFAULT FALSE,
  featured_order INTEGER,              -- Display order in LB Frame featured list
  verification_method TEXT NOT NULL,   -- Human-readable: "Furnace + video Shutterbug receipt"
  submission_requirements TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bounties_status ON public.bounties(status);
CREATE INDEX IF NOT EXISTS idx_bounties_featured ON public.bounties(featured_in_lb_frame, featured_order)
  WHERE featured_in_lb_frame = TRUE;

ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bounties publicly readable" ON public.bounties FOR SELECT USING (TRUE);
CREATE POLICY "Only service role inserts/updates bounties" ON public.bounties
  FOR ALL USING (auth.role() = 'service_role');

-- Bounty submissions table
CREATE TABLE IF NOT EXISTS public.bounty_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID NOT NULL REFERENCES public.bounties(id) ON DELETE CASCADE,
  submitter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,                   -- Video / GitHub / external link
  evidence_notes TEXT,
  hardware_platform TEXT,              -- e.g. "Raspberry Pi 4B", "NVIDIA H100", "Apple M4"
  status public.bounty_submission_status NOT NULL DEFAULT 'pending',
  furnace_score NUMERIC(5,2),          -- gear-tooth-fit score from KN044 Furnace
  furnace_notes TEXT,
  marks_awarded NUMERIC(10,2),
  awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bounty_submissions_bounty ON public.bounty_submissions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_submissions_submitter ON public.bounty_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_bounty_submissions_status ON public.bounty_submissions(status);

ALTER TABLE public.bounty_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Submitters view own submissions" ON public.bounty_submissions
  FOR SELECT USING (auth.uid() = submitter_id);
CREATE POLICY "Anyone can view awarded submissions" ON public.bounty_submissions
  FOR SELECT USING (status = 'awarded');
CREATE POLICY "Authenticated users submit" ON public.bounty_submissions
  FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "Service role updates submissions" ON public.bounty_submissions
  FOR UPDATE USING (auth.role() = 'service_role');

-- Seed the six featured Bounties shipped in LB Frame v1 (BP009 Founder direction)
INSERT INTO public.bounties (
  slug, title, tagline, description, empirical_anchor, enterprise_cohort,
  reward_marks, reward_currency, license_scope, status,
  featured_in_lb_frame, featured_order, verification_method, submission_requirements
) VALUES
(
  'raspberry-pi-led-hardware-control',
  'Raspberry Pi LED Hardware Control',
  'Prove cheap AI + LB substrate can reliably operate physical hardware.',
  'Demonstrate substrate-routed hardware control on a Raspberry Pi: use LB Frame (Haiku-tier AI + Wrasse pre-injection + Furnace verification) to control LED or servo output with >99% command reliability. Prove the Robotics Provisional empirical claim: cheaper AI + LB substrate = reliable hardware control without a frontier model.',
  'Robotics Provisional (Prov-17/18+) — claim 1: method for controlling physical hardware via AI executing pre-assembled canonical circuits',
  'NSA/DARPA/Sony/Boston Dynamics/Tesla Optimus',
  1000,
  'Marks',
  'Both',
  'open',
  TRUE, 1,
  'Furnace gear-tooth-fit score ≥ 0.90 + video Shutterbug receipt showing hardware actuation + hardware log transcript',
  'Video (≥ 60s) showing Raspberry Pi receiving commands from LB Frame with LB substrate visible. Hardware log showing >20 successful actuations. GitHub repo link with reproducible setup. State which AI tier (Haiku/Sonnet/Opus) was used and the cost per command.'
),
(
  'cross-silicon-benchmark',
  'Cross-Silicon Benchmark: Apple Silicon vs NVIDIA H100 vs Cerebras',
  'Run LB substrate across three hardware platforms and report comparative cost/quality.',
  'Replicate the KN042 substrate-routed memory expansion test on at least two of: Apple Silicon (M3/M4), NVIDIA H100, Cerebras CS-2/CS-3, Groq LPU, AMD MI300X. Report: (1) tokens/second, (2) cost per token, (3) Caithedral Effect quality gain vs cold-start baseline, (4) Conductor model-tier routing savings. Each approved silicon variant earns full reward.',
  'Chip-maker Wave 1 cohort empirical anchor — NVIDIA/AMD/Intel/Cerebras/Groq/Sambanova/Apple outreach',
  'NVIDIA/AMD/Intel/Cerebras/Groq/Sambanova/Apple',
  1000,
  'Marks',
  'Both',
  'open',
  TRUE, 2,
  'Catechist verification of methodology + KN042 replication protocol + substrate-savings telemetry output',
  'Submit a structured JSON report per silicon: {platform, model_tier, tokens_per_sec, cost_per_token_usd, cathedral_effect_delta_pct, conductor_savings_pct}. Include raw log files. Each unique silicon platform reviewed earns the full reward independently.'
),
(
  'hardware-control-safety-case',
  'Hardware-Control Safety Case',
  'Write a cyber-physical safety case using Slow Blade V2 + Furnace on an LB-Frame-controlled device.',
  'Produce a structured safety case document demonstrating Slow Blade V2 adversarial defense + Furnace gear-tooth-fit verification protecting a hardware control loop. Map each substrate primitive to an IEC 62443 / NIST SP 800-82 control. Include at least one red-team attempt (attempted injection) and show the defense firing.',
  'USCYBERCOM/CISA hardware safety + AI safety standards body conversation',
  'USCYBERCOM/CISA/NIST',
  500,
  'Marks',
  'Both',
  'open',
  TRUE, 3,
  'Slow Blade V2 defense log + Furnace gear-tooth-fit score ≥ 0.85 + structured safety case document peer-reviewed by two community members',
  'Submit: (1) safety case PDF/MD per standard template, (2) red-team log showing at least one adversarial command attempt intercepted, (3) Furnace verification transcript, (4) IEC 62443 / NIST 800-82 mapping table. Two community members must co-sign the review.'
),
(
  'nist-ai-rmf-mapping',
  'NIST AI RMF Mapping',
  'Map every LB substrate primitive to the NIST AI Risk Management Framework.',
  'Produce a complete cross-reference mapping every substrate primitive (Wrasse, Conductor''s Baton, Caithedral Effect, Augur, Furnace, Slow Blade, Pheromone, Stone Tablet, CheckBook Suite, Catechist) to the relevant NIST AI RMF 1.0 function, category, and subcategory. Verified by Catechist for completeness.',
  'NIST AI standards-body conversation — establishing substrate as empirical standards primitive (#2299)',
  'NIST/DARPA/Anthropic Wave 1 cohort',
  500,
  'Marks',
  'Both',
  'open',
  TRUE, 4,
  'Catechist verification of completeness across all R01-R10 primitives + cross-reference table reviewed by Founder',
  'Submit a structured mapping table (CSV or MD): rows = substrate primitives, columns = NIST AI RMF Function / Category / Subcategory / Gap-or-Gap-free / Evidence. Must cover all 10 substrate primitives. Catechist will score completeness.'
),
(
  'mikey-uk-discord-demo',
  'Mikey UK Discord Demo',
  'First international LB Frame Handshake + Cue Card send from the UK.',
  'Complete a full LB Frame Handshake on a UK-based machine, send at least one Cue Card via the one-button mechanic, and document the onboarding chain (sender → recipient → recipient''s own Handshake if possible). This is the first Federation member outside the US — Pied Piper recursion empirical receipt.',
  'International Federation member tier-1 onboarding — Pied Piper recursion chain (Mikey UK, Discord)',
  'International Federation — UK',
  250,
  'Marks',
  'AGPL',
  'open',
  TRUE, 5,
  'LB Frame Handshake Phase 5 receipt artifact from UK machine + Cue Card send confirmation + creator_referrals row in DB',
  'Submit: (1) Phase 5 Handshake receipt artifact (HANDSHAKE_RECEIPT_<session>_<date>.md), (2) screenshot of Cue Card send confirmation, (3) referral DB row showing handshake_vesting_state = HANDSHAKE_COMPLETED. Bonus: recipient also completes Handshake → full Pied Piper chain receipt.'
),
(
  'anthropic-compatible-lb-frame-demo',
  'Anthropic-Compatible LB Frame Demo',
  'Demonstrate LB substrate amplifying Claude Haiku to near-Sonnet quality on the R10 cross-vendor benchmark.',
  'Run the Caithedral Effect R10/R11 benchmark with LB substrate on Anthropic Claude Haiku (or equivalent entry-level tier), demonstrating it achieves quality scores within 10% of Sonnet on knowledge-retrieval questions. This is the empirical anchor for the Anthropic partner-lane Wave 1 conversation.',
  'Anthropic partner-lane Wave 1 cohort empirical anchor',
  'Anthropic/Partner Wave 1',
  500,
  'Marks',
  'Both',
  'open',
  TRUE, 6,
  'R10/R11 benchmark protocol results + Catechist scoring + substrate-savings telemetry showing model tier used',
  'Submit: (1) R10 or R11 benchmark results JSON per standard protocol, (2) model tier log (must show Haiku or equivalent, NOT Sonnet/Opus), (3) Catechist score ≥ 8/10 on knowledge-retrieval questions, (4) cost comparison vs cold-start Sonnet equivalent showing savings ≥ 30%.'
)
ON CONFLICT (slug) DO NOTHING;
