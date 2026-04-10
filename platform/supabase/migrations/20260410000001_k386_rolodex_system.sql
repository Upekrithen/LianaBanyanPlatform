-- K386: The Rolodex — Tiered Reciprocal Promotion Network
-- Innovation #2233, Crown Jewel #207
-- Four levels: Open Book, Handshake, Pipeline, Coalition
-- Members curate recommendations, form tiered partnerships

BEGIN;

-- ═══ Rolodex Recommendations ═══
-- Members curate trusted recommendations (products, people, services)
CREATE TABLE IF NOT EXISTS public.rolodex_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  external_url text,
  storefront_id uuid,
  recommended_member_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rolodex_rec_curator ON public.rolodex_recommendations (curator_id);
CREATE INDEX idx_rolodex_rec_category ON public.rolodex_recommendations (category);

ALTER TABLE public.rolodex_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curators manage own recommendations"
  ON public.rolodex_recommendations FOR ALL
  USING (auth.uid() = curator_id)
  WITH CHECK (auth.uid() = curator_id);

CREATE POLICY "Authenticated users read recommendations"
  ON public.rolodex_recommendations FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ═══ Rolodex Connections ═══
-- Tiered partnerships between members (L1-L4)
CREATE TABLE IF NOT EXISTS public.rolodex_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level int NOT NULL CHECK (level BETWEEN 1 AND 4),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  started_at timestamptz,
  expires_at timestamptz,
  conditions_json jsonb DEFAULT '{}',
  auto_share boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, partner_id)
);

CREATE INDEX idx_rolodex_conn_member ON public.rolodex_connections (member_id);
CREATE INDEX idx_rolodex_conn_partner ON public.rolodex_connections (partner_id);
CREATE INDEX idx_rolodex_conn_status ON public.rolodex_connections (status);

ALTER TABLE public.rolodex_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own connections"
  ON public.rolodex_connections FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Partners read their connections"
  ON public.rolodex_connections FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "Partners update connection status"
  ON public.rolodex_connections FOR UPDATE
  USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);


-- ═══ Rolodex Subscriptions ═══
-- Follow another member's recommendations
CREATE TABLE IF NOT EXISTS public.rolodex_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, curator_id)
);

CREATE INDEX idx_rolodex_sub_subscriber ON public.rolodex_subscriptions (subscriber_id);
CREATE INDEX idx_rolodex_sub_curator ON public.rolodex_subscriptions (curator_id);

ALTER TABLE public.rolodex_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscribers manage own subscriptions"
  ON public.rolodex_subscriptions FOR ALL
  USING (auth.uid() = subscriber_id)
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Curators read their subscribers"
  ON public.rolodex_subscriptions FOR SELECT
  USING (auth.uid() = curator_id);

COMMIT;
