-- Session 48A: Star Chamber v9.7 — AI Governance System
-- "Justice, Analyzed. Fairness, Enforced."

CREATE TABLE IF NOT EXISTS star_chamber_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number serial UNIQUE,
  case_type text NOT NULL CHECK (case_type IN ('dispute', 'complaint', 'violation', 'appeal')),
  title text NOT NULL,
  complainant_user_id uuid REFERENCES auth.users(id),
  respondent_user_id uuid REFERENCES auth.users(id),
  description text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]',
  oracle_analysis text,
  morpheus_analysis text,
  red_queen_analysis text,
  dredd_verdict text,
  recommended_action text,
  final_action text,
  founder_override boolean NOT NULL DEFAULT false,
  founder_override_reason text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'analysis_complete', 'verdict_reached', 'closed', 'appealed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- RLS
ALTER TABLE star_chamber_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "complainant_select_own" ON star_chamber_cases FOR SELECT USING (complainant_user_id = auth.uid());
CREATE POLICY "respondent_select_own" ON star_chamber_cases FOR SELECT USING (respondent_user_id = auth.uid());
CREATE POLICY "admin_all_cases" ON star_chamber_cases FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed: 5 sample cases (commented out — references fake user IDs not in auth.users)
-- INSERT INTO star_chamber_cases (id, case_type, title, complainant_user_id, respondent_user_id, description, evidence, oracle_analysis, morpheus_analysis, red_queen_analysis, dredd_verdict, recommended_action, final_action, severity, status) VALUES
--   ('f0000001-0048-0001-0001-000000000001', 'dispute', 'Bounty Completion Disagreement — Web Scraper', 'a0000001-0047-0001-0001-000000000001', 'a0000001-0047-0001-0002-000000000001',
--    'Sponsor claims bounty deliverable does not meet spec. Developer claims specification was ambiguous.',
--    '[{"type":"document","description":"Original bounty spec"},{"type":"screenshot","description":"Delivered output"}]',
--    'Pattern analysis: 73% of bounty disputes involve ambiguous acceptance criteria. Historical resolution favors clarification + partial payment.',
--    'Behavioral profile: Both parties have strong track records (complainant: 12 bounties sponsored, respondent: 8 completed). Low flight risk. Mediation recommended.',
--    'Rule check: Bounty Terms §4.2 requires "clear and measurable acceptance criteria." The original spec lacks quantitative metrics. Violation of §4.2 by sponsor.',
--    'Consensus among Oracle, Morpheus, and Red Queen. Dredd not required. Recommendation: 75% payment to developer + spec revision requirement for future bounties.',
--    '75% payment to developer. Sponsor must use structured acceptance criteria template for future bounties.', '75% payment released. Template requirement enforced.',
--    'high', 'verdict_reached'),
--
--   ('f0000001-0048-0001-0002-000000000001', 'complaint', 'Poor Quality Production — Ceramic Tiles', 'a0000001-0047-0001-0003-000000000001', 'a0000001-0047-0001-0001-000000000001',
--    'Received 50 ceramic tiles with visible glazing defects. 12 tiles cracked during water testing.',
--    '[{"type":"photo","description":"Cracked tiles"},{"type":"report","description":"Water test results"}]',
--    'Quality data suggests 24% defect rate — significantly above the 5% threshold for Tereno Certified products.',
--    'Producer has 4.6 average quality score. This batch is an outlier. Likely equipment calibration issue rather than negligence.',
--    NULL, NULL, NULL, NULL,
--    'medium', 'under_review'),
--
--   ('f0000001-0048-0001-0003-000000000001', 'violation', 'Self-STAMP Attempt — Leather Workshop', NULL, 'a0000001-0047-0001-0002-000000000001',
--    'System flagged: user attempted to STAMP their own production run. STAMP requires independent third-party verification.',
--    '[{"type":"system_log","description":"Audit trail showing self-stamp attempt"}]',
--    'First-time offense. No prior violations in 6 months of membership.',
--    'User profile indicates new member (3 months). Likely misunderstanding of STAMP rules rather than intentional fraud.',
--    'Clear violation of STAMP Protocol §2.1: "No producer may verify their own output." Warning issued. Educational materials required.',
--    'Warning + mandatory STAMP training module. No Marks penalty for first offense.',
--    NULL,
--    'low', 'analysis_complete'),
--
--   ('f0000001-0048-0001-0004-000000000001', 'appeal', 'Appeal: Coverage Minutes Penalty', 'a0000001-0047-0001-0001-000000000001', NULL,
--    'Member appeals 30-day coverage minute reduction. Claims technical issue prevented timely listening compliance.',
--    '[{"type":"technical","description":"Browser crash logs"}]',
--    NULL, NULL, NULL, NULL, NULL, NULL,
--    'low', 'open'),
--
--   ('f0000001-0048-0001-0005-000000000001', 'dispute', 'Referral Chain Attribution — Cue Card', 'a0000001-0047-0001-0002-000000000001', 'a0000001-0047-0001-0003-000000000001',
--    'Two members claim credit for referring the same new member. Cue card timestamp shows Member A sent card first, but Member B had prior relationship.',
--    '[{"type":"timestamp","description":"Cue card dispatch log"},{"type":"testimony","description":"New member statement"}]',
--    'Timestamp data is conclusive: Member A''s cue card was dispatched 48 hours before Member B''s.',
--    'Both members have good standing. Member B appears genuinely unaware of Member A''s prior outreach.',
--    'Cue Card Protocol §1.3: "Attribution follows timestamp-verified dispatch order." Member A has priority.',
--    NULL,
--    'Member A receives referral credit. Member B receives acknowledgment of independent effort. No penalty.', 'Founder agrees with recommendation. Cue Card timestamp rule upheld.',
--    'medium', 'closed')
-- ON CONFLICT DO NOTHING;
--
-- Update the closed case to have founder override (commented out — depends on seed data)
-- UPDATE star_chamber_cases SET founder_override = true, founder_override_reason = 'Affirmed AI recommendation. Timestamp rule is clear and must be consistently applied.', resolved_at = now() WHERE id = 'f0000001-0048-0001-0005-000000000001';
