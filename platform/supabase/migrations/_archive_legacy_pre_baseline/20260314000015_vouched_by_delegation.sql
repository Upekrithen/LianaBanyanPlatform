-- Vouched By / Recommended By delegation chain (Session 17)

CREATE TABLE IF NOT EXISTS public.crown_letter_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_slug TEXT NOT NULL UNIQUE
);

ALTER TABLE public.crown_letter_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read crown letter invitations" ON public.crown_letter_invitations FOR SELECT USING (true);
CREATE POLICY "Insert crown letter invitation" ON public.crown_letter_invitations FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.delegation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  actor_email TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('accept', 'vouch_for', 'recommend', 'pass_along', 'delegate_staff', 'delegate_protege', 'advisory')),
  target_name TEXT,
  target_email TEXT,
  target_expertise TEXT,
  is_unknown_need BOOLEAN DEFAULT FALSE,
  unknown_need_description TEXT,
  parent_delegation_id UUID REFERENCES public.delegation_actions(id),
  chain_depth INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delegation_actions_invitation ON public.delegation_actions(invitation_id);
CREATE INDEX IF NOT EXISTS idx_delegation_actions_actor ON public.delegation_actions(actor_id);
CREATE INDEX IF NOT EXISTS idx_delegation_actions_parent ON public.delegation_actions(parent_delegation_id);

ALTER TABLE public.delegation_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/steward full access" ON public.delegation_actions;
CREATE POLICY "Service role full access delegation" ON public.delegation_actions FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Actors see own actions" ON public.delegation_actions;
CREATE POLICY "Actors see own actions" ON public.delegation_actions FOR SELECT USING (auth.uid() = actor_id);

-- Allow insert: authenticated as actor, or external (actor_id null) for Crown letter responses
CREATE POLICY "Authenticated or external insert delegation" ON public.delegation_actions FOR INSERT WITH CHECK (actor_id IS NULL OR auth.uid() = actor_id);
