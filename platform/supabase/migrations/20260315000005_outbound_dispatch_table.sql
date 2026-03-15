-- ============================================================================
-- OUTBOUND DISPATCH TABLE — Persistent queue for all outbound content
-- Session 24: Wires the dispatch pipeline to real DB storage
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.outbound_dispatch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT NOT NULL DEFAULT 'normal',
  recipient_name TEXT,
  recipient_org TEXT,
  recipient_contact TEXT,
  content_body TEXT NOT NULL,
  content_summary TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  reviewed_by UUID,
  stamped_at TIMESTAMPTZ,
  stamp_phrase TEXT,
  response_received_at TIMESTAMPTZ,
  response_notes TEXT,
  follow_up_date TIMESTAMPTZ,
  campaign_id UUID,
  content_pipeline_id UUID,
  innovation_numbers INTEGER[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE outbound_dispatch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read dispatch queue"
  ON outbound_dispatch FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin manages dispatch queue"
  ON outbound_dispatch FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Seed initial dispatch items
INSERT INTO outbound_dispatch (title, type, status, priority, content_body, content_summary, channels, created_by, tags) VALUES
(
  'Dead Internet Defense — Medium Article',
  'publication',
  'draft',
  'high',
  'See Cephas/cephas-hugo/content/articles/dead-internet-defense.md',
  'Medium-formatted article: Digg died because engagement was free. Four layers of bot defense built into LB economic DNA.',
  ARRAY['medium', 'cephas'],
  'bishop',
  ARRAY['dead-internet', 'security', 'medium', 'article']
),
(
  'Outreach — Moo Business Services (API Access Request)',
  'partnership_proposal',
  'draft',
  'high',
  'API access request to Moo Business Services for Luxe stock variable-data QR business cards. Volume pricing and batch ordering.',
  'Request API access from Moo Business Services team for Luxe stock QR business cards with variable data.',
  ARRAY['email'],
  'bishop',
  ARRAY['moo', 'vendor', 'business-cards', 'outreach']
),
(
  'Outreach — Coins For Anything (Gear-Shaped QR Coin Quote)',
  'partnership_proposal',
  'draft',
  'high',
  'Quote request for gear-shaped challenge coins with QR laser engraving. 100/500/1000 units. Veteran-owned vendor.',
  'Quote request to Coins For Anything for gear-shaped medallion challenge coins with QR laser engraving.',
  ARRAY['email'],
  'bishop',
  ARRAY['coins-for-anything', 'vendor', 'challenge-coins', 'outreach']
);
