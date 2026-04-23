-- K404 (Open Water): Core Open Water Schema
-- Innovation #2240 (Crown Jewel). Bishop B097.
-- Seven tables: vessel_tier_catalog, patron_registrations, open_water_briefs,
-- patron_volunteers, patron_engagements, engagement_events, saa_ledger
-- + Founder seed data as first Patron

-- ══════════════════════════════════════════════════════════════
-- 1. vessel_tier_catalog — static reference, seven tiers
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vessel_tier_catalog (
  level_number INTEGER PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  operational_definition TEXT NOT NULL,
  example_industries TEXT[] NOT NULL,
  voucher_range_min_usd INTEGER NOT NULL,
  voucher_range_max_usd INTEGER
);

INSERT INTO vessel_tier_catalog (level_number, vessel_name, operational_definition, example_industries, voucher_range_min_usd, voucher_range_max_usd) VALUES
(0, 'Dinghy',    'The pre-start rung. Has an idea or intent but has NOT yet executed anything tangible. Needs a push to do the first tangible thing.',
  ARRAY['activation-advisory', 'any-industry-pre-start'], 0, 50),
(1, 'Rowboat',   'Started the thing. Solo. Smallest scale. First-step competence proven.',
  ARRAY['paper-route', 'first-etsy-sale', 'first-freelance-client', 'first-lawn-mowed'], 50, 500),
(2, 'Canoe',     'Scaled from 1 to 2 (or similar small multiple). Solo or family-scale.',
  ARRAY['2-paper-routes', '2-food-trucks', '2-5-freelance-clients'], 500, 5000),
(3, 'Skiff',     'First helper. First real systems. Owner-operator with minimal crew.',
  ARRAY['3-5-clients', 'first-hired-helper', 'first-payroll', 'proposal-created-role'], 5000, 15000),
(4, 'Sailboat',  'Real small business with real systems. Multi-employee.',
  ARRAY['small-team', 'real-marketing-budget', 'real-supply-chain', 'small-publishing'], 15000, 50000),
(5, 'Ship',      'Operational scale. Multi-location or multi-product. Post-product-market-fit.',
  ARRAY['regional-presence', 'wireless-isp', 'integrated-online-offline', 'real-infrastructure'], 50000, 500000),
(6, 'Yacht',     'National/international or platform scale. Fleet Admiral tier.',
  ARRAY['herjavec-group-level', 'cooperative-platform-architecture', 'multi-country-systems'], 500000, NULL)
ON CONFLICT (level_number) DO UPDATE SET
  vessel_name = EXCLUDED.vessel_name,
  operational_definition = EXCLUDED.operational_definition,
  example_industries = EXCLUDED.example_industries,
  voucher_range_min_usd = EXCLUDED.voucher_range_min_usd,
  voucher_range_max_usd = EXCLUDED.voucher_range_max_usd;

-- ══════════════════════════════════════════════════════════════
-- 2. patron_registrations
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS patron_registrations (
  patron_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_levels INTEGER[] NOT NULL,
  industry_tags TEXT[] NOT NULL,
  max_concurrent_engagements JSONB NOT NULL DEFAULT '{}',
  current_concurrent_engagements JSONB NOT NULL DEFAULT '{}',
  bio_summary TEXT,
  biography_source_reference TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patron_reg_user ON patron_registrations(user_id);

-- ══════════════════════════════════════════════════════════════
-- 3. open_water_briefs
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS open_water_briefs (
  brief_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL REFERENCES vessel_tier_catalog(level_number),
  target_level INTEGER NOT NULL REFERENCES vessel_tier_catalog(level_number),
  industry_pathway TEXT NOT NULL,
  industry_subtag TEXT,
  industry_freetext TEXT,
  growth_question TEXT NOT NULL,
  voucher_budget_credits NUMERIC DEFAULT 0,
  voucher_budget_marks NUMERIC DEFAULT 0,
  voucher_budget_joules NUMERIC DEFAULT 0,
  preferred_engagement_length_days INTEGER,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'matched', 'in_progress', 'resolved', 'terminated')),
  selected_patron_id UUID REFERENCES patron_registrations(patron_id),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_briefs_member ON open_water_briefs(member_id);
CREATE INDEX idx_briefs_status ON open_water_briefs(status, published_at DESC);
CREATE INDEX idx_briefs_level ON open_water_briefs(current_level, target_level);

-- ══════════════════════════════════════════════════════════════
-- 4. patron_volunteers
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS patron_volunteers (
  volunteer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES open_water_briefs(brief_id) ON DELETE CASCADE,
  patron_id UUID NOT NULL REFERENCES patron_registrations(patron_id) ON DELETE CASCADE,
  volunteered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn BOOLEAN NOT NULL DEFAULT FALSE,
  withdrawn_at TIMESTAMPTZ,
  UNIQUE (brief_id, patron_id)
);

-- ══════════════════════════════════════════════════════════════
-- 5. patron_engagements
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS patron_engagements (
  engagement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES open_water_briefs(brief_id) UNIQUE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patron_id UUID NOT NULL REFERENCES patron_registrations(patron_id) ON DELETE CASCADE,
  level_at_start INTEGER NOT NULL REFERENCES vessel_tier_catalog(level_number),
  target_level INTEGER NOT NULL REFERENCES vessel_tier_catalog(level_number),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contract_template_version TEXT NOT NULL DEFAULT 'v1-placeholder',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'resolved', 'terminated')),
  terminated_by TEXT CHECK (terminated_by IN ('member', 'patron', 'mutual')),
  termination_reason TEXT,
  resolved_at TIMESTAMPTZ,
  demonstrated_growth_metric JSONB
);

CREATE INDEX idx_engagements_member ON patron_engagements(member_id);
CREATE INDEX idx_engagements_patron ON patron_engagements(patron_id);
CREATE INDEX idx_engagements_status ON patron_engagements(status);

-- ══════════════════════════════════════════════════════════════
-- 6. engagement_events — append-only lifecycle ledger
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS engagement_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES patron_engagements(engagement_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('contract_signed', 'quarterly_checkin', 'milestone_reached',
                          'saa_accrued', 'ripple_committed', 'terminated', 'resolved')),
  event_data JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_events_engagement ON engagement_events(engagement_id, occurred_at DESC);

-- ══════════════════════════════════════════════════════════════
-- 7. saa_ledger — append-only SAA accrual across all mechanisms
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS saa_ledger (
  ledger_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL
    CHECK (source_type IN ('open_water_patron', 'open_water_ripple', 'pedestal_stake',
                           'sponsor_pool', 'crown_position', 'other')),
  source_reference_id UUID,
  amount NUMERIC NOT NULL,
  cap_applicable BOOLEAN NOT NULL DEFAULT TRUE,
  capped_and_reseeded BOOLEAN NOT NULL DEFAULT FALSE,
  reseed_destination_user_ids UUID[],
  accrued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saa_recipient ON saa_ledger(recipient_user_id, accrued_at DESC);
CREATE INDEX idx_saa_source ON saa_ledger(source_type, source_reference_id);

-- ══════════════════════════════════════════════════════════════
-- 8. RLS policies
-- ══════════════════════════════════════════════════════════════

-- vessel_tier_catalog: public read
ALTER TABLE vessel_tier_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vessel_tiers_public_read" ON vessel_tier_catalog FOR SELECT USING (true);

-- patron_registrations: public read (directory), authors manage own
ALTER TABLE patron_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patron_reg_public_read" ON patron_registrations FOR SELECT USING (true);
CREATE POLICY "patron_reg_owner_all" ON patron_registrations FOR ALL USING (auth.uid() = user_id);

-- open_water_briefs: members read own + patrons who volunteered
ALTER TABLE open_water_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "briefs_owner_read" ON open_water_briefs FOR SELECT
  USING (auth.uid() = member_id);
CREATE POLICY "briefs_open_read" ON open_water_briefs FOR SELECT
  USING (status = 'open');
CREATE POLICY "briefs_patron_volunteered_read" ON open_water_briefs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patron_volunteers pv
    JOIN patron_registrations pr ON pr.patron_id = pv.patron_id
    WHERE pv.brief_id = open_water_briefs.brief_id AND pr.user_id = auth.uid()
  ));
CREATE POLICY "briefs_owner_insert" ON open_water_briefs FOR INSERT
  WITH CHECK (auth.uid() = member_id);
CREATE POLICY "briefs_owner_update" ON open_water_briefs FOR UPDATE
  USING (auth.uid() = member_id);

-- patron_volunteers
ALTER TABLE patron_volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteers_read" ON patron_volunteers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM patron_registrations pr WHERE pr.patron_id = patron_volunteers.patron_id AND pr.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM open_water_briefs b WHERE b.brief_id = patron_volunteers.brief_id AND b.member_id = auth.uid())
  );
CREATE POLICY "volunteers_patron_insert" ON patron_volunteers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM patron_registrations pr WHERE pr.patron_id = patron_volunteers.patron_id AND pr.user_id = auth.uid()));

-- patron_engagements: member + patron read
ALTER TABLE patron_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engagements_member_read" ON patron_engagements FOR SELECT
  USING (auth.uid() = member_id);
CREATE POLICY "engagements_patron_read" ON patron_engagements FOR SELECT
  USING (EXISTS (SELECT 1 FROM patron_registrations pr WHERE pr.patron_id = patron_engagements.patron_id AND pr.user_id = auth.uid()));

-- engagement_events
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_participant_read" ON engagement_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patron_engagements pe
    WHERE pe.engagement_id = engagement_events.engagement_id
      AND (pe.member_id = auth.uid() OR EXISTS (SELECT 1 FROM patron_registrations pr WHERE pr.patron_id = pe.patron_id AND pr.user_id = auth.uid()))
  ));
CREATE POLICY "events_participant_insert" ON engagement_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM patron_engagements pe
    WHERE pe.engagement_id = engagement_events.engagement_id
      AND (pe.member_id = auth.uid() OR EXISTS (SELECT 1 FROM patron_registrations pr WHERE pr.patron_id = pe.patron_id AND pr.user_id = auth.uid()))
  ));

-- saa_ledger: recipients read own
ALTER TABLE saa_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saa_owner_read" ON saa_ledger FOR SELECT
  USING (auth.uid() = recipient_user_id);

-- ══════════════════════════════════════════════════════════════
-- 9. Seed: Founder as first Patron
-- ══════════════════════════════════════════════════════════════
INSERT INTO patron_registrations (user_id, registered_levels, industry_tags, max_concurrent_engagements, current_concurrent_engagements, bio_summary, biography_source_reference)
SELECT
  u.id,
  ARRAY[0,1,2,3,4,5,6],
  ARRAY['food', 'service', 'local_business', 'paper_route_delivery', 'lawn_mowing_outdoor', 'web_development', 'it_consulting', 'platform_architecture', 'rural_infrastructure', 'publishing_local', 'real_estate_tech', 'proposal_created_roles', 'activation_advisory_any'],
  '{"0": 10, "1": 3, "2": 3, "3": 2, "4": 2, "5": 2, "6": 1}'::jsonb,
  '{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0}'::jsonb,
  'Founder of Liana Banyan. Active Patron at multiple levels. Paper routes, lawn mowing, IT, web dev, rural infrastructure, international platform architecture. Walks the ladder in public.',
  'BISHOP_DROPZONE/FOUNDER_BIOGRAPHY_SOURCES_B097.md'
FROM auth.users u
WHERE u.email = 'upekrithen@gmail.com'
LIMIT 1;
