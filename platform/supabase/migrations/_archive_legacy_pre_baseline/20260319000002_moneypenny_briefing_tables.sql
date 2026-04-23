-- Moneypenny Phase 1: Admin Briefing Dashboard Tables
-- Session 33 — March 19, 2026
-- "Generate a report... ACTUALLY like an administrative assistant"

-- 1. Inbox — inbound email/comms parsed by Edge Function
CREATE TABLE IF NOT EXISTS public.moneypenny_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email TEXT,
  sender_name TEXT,
  subject TEXT,
  body_preview TEXT,
  target_account TEXT,  -- which @lianabanyan.com account received it
  category TEXT DEFAULT 'unknown',  -- crown_response, press, member, support, unknown
  priority INT DEFAULT 4,  -- 1=Crown/Press, 2=Member, 3=Support, 4=Unknown
  status TEXT DEFAULT 'new',  -- new, read, needs-action, replied, archived
  action_notes TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Actions — to-do queue (auto-generated + manual)
CREATE TABLE IF NOT EXISTS public.moneypenny_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'manual',  -- auto, manual
  source_ref UUID,  -- links to inbox item or signal
  priority TEXT DEFAULT 'normal',  -- urgent, normal, low
  status TEXT DEFAULT 'pending',  -- pending, done, dismissed
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 3. Social Media Drafts — post queue for Founder approval
CREATE TABLE IF NOT EXISTS public.moneypenny_social_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT DEFAULT 'twitter',  -- twitter, linkedin, general
  content TEXT NOT NULL,
  content_source TEXT,  -- what triggered this draft
  status TEXT DEFAULT 'draft',  -- draft, approved, posted, rejected
  approved_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ideas — Founder idea capture + relay to agents
CREATE TABLE IF NOT EXISTS public.moneypenny_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  relay_to TEXT DEFAULT 'founder-review',  -- bishop, knight, rook, founder-review
  status TEXT DEFAULT 'captured',  -- captured, relayed, processed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Schedule — Calendar/deadline items
CREATE TABLE IF NOT EXISTS public.moneypenny_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  category TEXT DEFAULT 'general',  -- patent, deploy, outreach, personal, general
  status TEXT DEFAULT 'upcoming',  -- upcoming, done, overdue
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Red Carpet Signals — auto-trigger system for NoReply@
CREATE TABLE IF NOT EXISTS public.red_carpet_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitee_name TEXT,
  invitee_email TEXT,
  signal_type TEXT NOT NULL,  -- welcome, threshold_alert, crown_response_needed, milestone
  trigger_condition TEXT,
  template_id TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',  -- pending, sent, failed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Only authenticated users (Founder) can access Moneypenny tables
ALTER TABLE public.moneypenny_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moneypenny_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moneypenny_social_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moneypenny_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moneypenny_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.red_carpet_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage inbox" ON public.moneypenny_inbox
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage actions" ON public.moneypenny_actions
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage social drafts" ON public.moneypenny_social_drafts
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage ideas" ON public.moneypenny_ideas
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage schedule" ON public.moneypenny_schedule
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage signals" ON public.red_carpet_signals
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed schedule with known deadlines
INSERT INTO public.moneypenny_schedule (title, description, due_date, category) VALUES
  ('File 8th Provisional', '73 innovations (#1676-#1748), ~220 claims. Scaffold ready in BISHOP_DROPZONE.', '2026-03-25', 'patent'),
  ('Deploy Session 33', 'Moneypenny Phase 1 + TL;DR Tour', '2026-03-19', 'deploy'),
  ('First Crown Letter Send', 'MacKenzie Scott Board Chair letter — LOCKED02', '2026-03-31', 'outreach'),
  ('Kickstarter Campaign 1 Launch', 'HexIsle Founding Run — 19-Hexel starter', '2026-04-15', 'outreach')
ON CONFLICT DO NOTHING;
