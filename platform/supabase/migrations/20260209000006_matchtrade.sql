-- ═══════════════════════════════════════════════════════════════
-- MATCHTRADE — MARKS-for-MARKS Service Exchange
-- "Babysitting for plumbing. Guitar lessons for lawn care."
-- Credits back the guarantee. MARKS are the reputation price.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.matchtrade_offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offerer_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What I'm offering
  service_title   TEXT NOT NULL,
  service_description TEXT,
  category        TEXT NOT NULL,
  marks_price     NUMERIC NOT NULL CHECK (marks_price > 0),
  
  -- Joules collateral (from Bond Account — per Cephas spec)
  joules_collateral NUMERIC NOT NULL DEFAULT 0,
  collateral_locked BOOLEAN DEFAULT false,
  
  -- Geographic filter
  postal_code     TEXT,
  radius_miles    INTEGER DEFAULT 25,
  
  -- What I want in return
  seeking_category TEXT,
  seeking_description TEXT,
  
  -- Status
  status          TEXT DEFAULT 'open' CHECK (status IN ('open','matched','in_progress','delivered','disputed','cancelled','completed')),
  matched_with_offer_id UUID REFERENCES public.matchtrade_offers(id),
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  matched_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matchtrade_offerer ON public.matchtrade_offers(offerer_id);
CREATE INDEX idx_matchtrade_status ON public.matchtrade_offers(status);
CREATE INDEX idx_matchtrade_category ON public.matchtrade_offers(category);

-- MatchTrade matches (links two offers together)
CREATE TABLE IF NOT EXISTS public.matchtrade_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_a_id      UUID NOT NULL REFERENCES public.matchtrade_offers(id),
  offer_b_id      UUID NOT NULL REFERENCES public.matchtrade_offers(id),
  
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','a_delivered','b_delivered','completed','disputed')),
  
  -- Delivery tracking
  a_delivered_at  TIMESTAMPTZ,
  b_delivered_at  TIMESTAMPTZ,
  a_confirmed_by_b BOOLEAN DEFAULT false,
  b_confirmed_by_a BOOLEAN DEFAULT false,
  
  -- Completion
  completed_at    TIMESTAMPTZ,
  marks_transferred_a NUMERIC DEFAULT 0,
  marks_transferred_b NUMERIC DEFAULT 0,
  
  -- Dispute
  disputed_at     TIMESTAMPTZ,
  dispute_reason  TEXT,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_resolution TEXT,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Joules collateral ledger (tracks Joules locked from Bond Account for MatchTrade)
CREATE TABLE IF NOT EXISTS public.matchtrade_joules_collateral (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  offer_id        UUID NOT NULL REFERENCES public.matchtrade_offers(id),
  bond_account_id UUID REFERENCES public.bond_accounts(id),
  joules_locked   NUMERIC NOT NULL,
  status          TEXT DEFAULT 'locked' CHECK (status IN ('locked','released','forfeited')),
  locked_at       TIMESTAMPTZ DEFAULT NOW(),
  released_at     TIMESTAMPTZ,
  release_reason  TEXT
);

CREATE INDEX idx_collateral_user ON public.matchtrade_joules_collateral(user_id);
CREATE INDEX idx_collateral_offer ON public.matchtrade_joules_collateral(offer_id);

-- RLS
ALTER TABLE public.matchtrade_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchtrade_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_matchtrade_offers" ON public.matchtrade_offers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_matchtrade_matches" ON public.matchtrade_matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.matchtrade_joules_collateral ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_matchtrade_collateral" ON public.matchtrade_joules_collateral FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "anon_read_offers" ON public.matchtrade_offers FOR SELECT TO anon USING (status = 'open');
