-- ============================================================================
-- MoneyPenny Gatekeeper — AI Receptionist for Inbound Contact Screening
-- Innovation #2021 | Knight Session 134
-- ============================================================================

-- 1. Gatekeeper contacts — every inbound message, AI-triaged
CREATE TABLE IF NOT EXISTS public.gatekeeper_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sender_name TEXT,
  sender_email TEXT,
  sender_phone TEXT,
  sender_organization TEXT,
  sender_title TEXT,
  subject TEXT,
  message_body TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'contact_form',
  tier INTEGER NOT NULL DEFAULT 3,
  relevance_score NUMERIC,
  claude_summary TEXT,
  claude_category TEXT,
  is_public_figure BOOLEAN DEFAULT false,
  public_figure_context TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'responded', 'archived', 'blocked')),
  reviewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  founder_notes TEXT,
  sms_sent BOOLEAN DEFAULT false,
  sms_sent_at TIMESTAMPTZ
);

-- 2. Whitelist / blacklist / priority keywords
CREATE TABLE IF NOT EXISTS public.gatekeeper_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_type TEXT NOT NULL CHECK (list_type IN ('whitelist', 'blacklist', 'priority_keywords')),
  value TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Auto-response templates per tier
CREATE TABLE IF NOT EXISTS public.gatekeeper_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier INTEGER NOT NULL,
  template_name TEXT NOT NULL,
  subject_line TEXT,
  body_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE gatekeeper_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatekeeper_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatekeeper_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only access (Founder + support)
DO $$ BEGIN
  CREATE POLICY "Admin gatekeeper contacts" ON gatekeeper_contacts
    FOR ALL USING (
      auth.jwt() ->> 'email' IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin gatekeeper lists" ON gatekeeper_lists
    FOR ALL USING (
      auth.jwt() ->> 'email' IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin gatekeeper templates" ON gatekeeper_templates
    FOR ALL USING (
      auth.jwt() ->> 'email' IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role bypass (Edge Functions)
DO $$ BEGIN
  CREATE POLICY "Service role gatekeeper contacts" ON gatekeeper_contacts
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role gatekeeper lists" ON gatekeeper_lists
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role gatekeeper templates" ON gatekeeper_templates
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gatekeeper_contacts_tier_status
  ON gatekeeper_contacts (tier, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gatekeeper_contacts_email
  ON gatekeeper_contacts (sender_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gatekeeper_lists_type
  ON gatekeeper_lists (list_type, value);

-- Seed whitelist: Crown Letter recipients
INSERT INTO gatekeeper_lists (list_type, value, label) VALUES
  ('whitelist', 'maneet chauhan', 'Crown: Maneet Chauhan — Let''s Make Dinner'),
  ('whitelist', 'mary beth laughton', 'Crown: Mary Beth Laughton — Let''s Go Shopping'),
  ('whitelist', 'kimberly williams', 'Crown: Kimberly A. Williams — Rally Group'),
  ('whitelist', 'cathie mahon', 'Crown: Cathie Mahon — VSL'),
  ('whitelist', 'marc freedman', 'Crown: Marc Freedman'),
  ('whitelist', 'jessica jackley', 'Crown: Jessica Jackley'),
  ('whitelist', 'jose andres', 'Crown: José Andrés'),
  ('whitelist', 'muhammad yunus', 'Crown: Muhammad Yunus'),
  ('whitelist', 'brene brown', 'Crown: Brené Brown'),
  ('whitelist', 'sallie krawcheck', 'Crown: Sallie Krawcheck'),
  ('whitelist', 'taylor swift', 'Crown: Taylor Swift'),
  ('whitelist', 'marie kondo', 'Crown: Marie Kondo'),
  ('whitelist', 'ashton applewhite', 'Crown: Ashton Applewhite'),
  ('whitelist', 'dale dougherty', 'Crown: Dale Dougherty'),
  ('whitelist', 'ai-jen poo', 'Crown: Ai-jen Poo'),
  ('whitelist', 'alex oshmyansky', 'Crown: Alex Oshmyansky'),
  ('whitelist', 'michael seibel', 'Crown: Michael Seibel'),
  ('whitelist', 'sal khan', 'Crown: Sal Khan'),
  ('whitelist', 'ruth glenn', 'Crown: Ruth Glenn'),
  ('whitelist', 'robert kaiser', 'Crown: Robert Kaiser'),
  ('whitelist', 'molly hemstreet', 'Crown: Molly Hemstreet'),
  ('whitelist', 'mariaelena huambachano', 'Crown: Mariaelena Huambachano'),
  ('whitelist', 'sandra bullock', 'Crown: Sandra Bullock'),
  ('whitelist', 'keanu reeves', 'Crown: Keanu Reeves'),
  ('whitelist', 'arnold schwarzenegger', 'Crown: Arnold Schwarzenegger'),
  ('whitelist', 'alexandria ocasio-cortez', 'Crown: AOC'),
  ('whitelist', 'mackenzie scott', 'Crown: MacKenzie Scott')
ON CONFLICT DO NOTHING;

-- Seed priority keywords
INSERT INTO gatekeeper_lists (list_type, value, label) VALUES
  ('priority_keywords', 'patent', 'Patent-related inquiry'),
  ('priority_keywords', 'investment', 'Investment inquiry — flag + note LB does not take VC'),
  ('priority_keywords', 'press', 'Press inquiry'),
  ('priority_keywords', 'partnership', 'Partnership inquiry'),
  ('priority_keywords', 'collaboration', 'Collaboration request'),
  ('priority_keywords', 'media', 'Media inquiry'),
  ('priority_keywords', 'government', 'Government outreach')
ON CONFLICT DO NOTHING;

-- Seed auto-response templates
INSERT INTO gatekeeper_templates (tier, template_name, subject_line, body_text, is_active) VALUES
  (2, 'Priority Flagged', 'Your message to Liana Banyan has been flagged for priority review',
   'Thank you for reaching out to Liana Banyan. Your message has been flagged for priority review by our team. We take every communication seriously and you can expect a personal response within 48 hours.

Best regards,
MoneyPenny — AI Assistant to the Founder
Liana Banyan Corporation
"Help each other, help ourselves."', true),

  (3, 'Received and Queued', 'Your message to Liana Banyan has been received',
   'Thank you for contacting Liana Banyan. Your message has been received and will be reviewed by our team. We receive many communications and appreciate your patience.

If your message is time-sensitive, please note that in your subject line.

Best regards,
MoneyPenny — AI Assistant to the Founder
Liana Banyan Corporation
"Help each other, help ourselves."', true)
ON CONFLICT DO NOTHING;
