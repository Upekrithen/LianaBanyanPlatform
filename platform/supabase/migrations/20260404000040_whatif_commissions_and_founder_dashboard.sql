-- B076 / Session 290: What-If Commissions + Founder Contact Dashboard
-- Crown Jewel infrastructure for pre-drafted commissions and call-prep workflow.

-- Ensure a staff_members table exists for founder scheduling/OAuth metadata.
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_access_token TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_calendar_token_iv TEXT;

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'staff_members'
      AND policyname = 'Users can read own staff member row'
  ) THEN
    CREATE POLICY "Users can read own staff member row"
      ON public.staff_members
      FOR SELECT
      USING (auth.uid() = user_id OR public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'staff_members'
      AND policyname = 'Admins manage staff members'
  ) THEN
    CREATE POLICY "Admins manage staff members"
      ON public.staff_members
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_staff_members_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_staff_members_updated_at ON public.staff_members;
CREATE TRIGGER trg_staff_members_updated_at
BEFORE UPDATE ON public.staff_members
FOR EACH ROW
EXECUTE FUNCTION public.touch_staff_members_updated_at();

CREATE OR REPLACE FUNCTION public.user_is_founder_for_contacts()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('founder', 'owner', 'admin')
  ) THEN
    RETURN true;
  END IF;

  IF to_regclass('public.staff_members') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.staff_members sm
      WHERE sm.user_id = auth.uid()
        AND lower(coalesce(sm.role, '')) IN ('founder', 'owner', 'admin')
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- Pre-drafted commission templates.
CREATE TABLE IF NOT EXISTS public.whatif_commission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN (
    'guild_sub_leader', 'captain_scoped', 'business_onboarder',
    'research_advisor', 'maker_prime', 'portal_steward', 'custom'
  )),
  domain_scope TEXT NOT NULL,
  authority_description TEXT NOT NULL,
  duration_default TEXT,
  platform_routing_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  guild_memberships_granted TEXT[] DEFAULT ARRAY[]::text[],
  red_carpet_template_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_whatif_templates_active
  ON public.whatif_commission_templates(is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatif_templates_type
  ON public.whatif_commission_templates(commission_type);

ALTER TABLE public.whatif_commission_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatif_commission_templates'
      AND policyname = 'Anyone can read active whatif templates'
  ) THEN
    CREATE POLICY "Anyone can read active whatif templates"
      ON public.whatif_commission_templates
      FOR SELECT
      USING (is_active = true OR public.user_is_founder_for_contacts());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatif_commission_templates'
      AND policyname = 'Founder manages whatif templates'
  ) THEN
    CREATE POLICY "Founder manages whatif templates"
      ON public.whatif_commission_templates
      FOR ALL
      USING (public.user_is_founder_for_contacts())
      WITH CHECK (public.user_is_founder_for_contacts());
  END IF;
END $$;

-- Founder's contact roster with scheduling metadata.
CREATE TABLE IF NOT EXISTS public.founder_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_handle TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_user_id UUID REFERENCES auth.users(id),
  source_table TEXT,
  source_ref_id TEXT,
  relationship_stage TEXT NOT NULL DEFAULT 'prospect' CHECK (relationship_stage IN (
    'prospect', 'introduced', 'first_call_scheduled', 'in_discussion',
    'commissioned', 'active_partner', 'declined', 'dormant'
  )),
  next_action_summary TEXT,
  red_carpet_entry_id UUID REFERENCES public.red_carpet_recipients(id),
  treasure_map_ids UUID[] DEFAULT ARRAY[]::uuid[],
  applicable_commission_template_ids UUID[] DEFAULT ARRAY[]::uuid[],
  notes TEXT,
  google_calendar_event_id TEXT,
  last_contacted_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founder_contacts_next
  ON public.founder_contacts(next_scheduled_at);

CREATE INDEX IF NOT EXISTS idx_founder_contacts_stage
  ON public.founder_contacts(relationship_stage);

CREATE INDEX IF NOT EXISTS idx_founder_contacts_email
  ON public.founder_contacts(lower(contact_email));

ALTER TABLE public.founder_contacts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'founder_contacts'
      AND policyname = 'Founder manages own contacts'
  ) THEN
    CREATE POLICY "Founder manages own contacts"
      ON public.founder_contacts
      FOR ALL
      USING (public.user_is_founder_for_contacts())
      WITH CHECK (public.user_is_founder_for_contacts());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_founder_contacts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_founder_contacts_updated_at ON public.founder_contacts;
CREATE TRIGGER trg_founder_contacts_updated_at
BEFORE UPDATE ON public.founder_contacts
FOR EACH ROW
EXECUTE FUNCTION public.touch_founder_contacts_updated_at();

-- Issued commissions.
CREATE TABLE IF NOT EXISTS public.whatif_commissions_issued (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.whatif_commission_templates(id),
  recipient_name TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  recipient_email TEXT,
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_in_conversation_id UUID REFERENCES public.founder_contacts(id),
  commitment_time TEXT,
  commitment_scope_limit TEXT,
  commitment_project_bounds TEXT,
  commitment_decision_level TEXT,
  status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN (
    'offered', 'accepted', 'declined', 'active', 'completed', 'withdrawn'
  )),
  accepted_at TIMESTAMPTZ,
  signed_contract_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatif_issued_recipient
  ON public.whatif_commissions_issued(recipient_user_id);

CREATE INDEX IF NOT EXISTS idx_whatif_issued_status
  ON public.whatif_commissions_issued(status);

CREATE INDEX IF NOT EXISTS idx_whatif_issued_conversation
  ON public.whatif_commissions_issued(granted_in_conversation_id);

ALTER TABLE public.whatif_commissions_issued ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatif_commissions_issued'
      AND policyname = 'Founder manages issued commissions'
  ) THEN
    CREATE POLICY "Founder manages issued commissions"
      ON public.whatif_commissions_issued
      FOR ALL
      USING (public.user_is_founder_for_contacts())
      WITH CHECK (public.user_is_founder_for_contacts());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatif_commissions_issued'
      AND policyname = 'Recipients can read own issued commissions'
  ) THEN
    CREATE POLICY "Recipients can read own issued commissions"
      ON public.whatif_commissions_issued
      FOR SELECT
      USING (auth.uid() = recipient_user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_whatif_issued_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'accepted' AND NEW.accepted_at IS NULL THEN
    NEW.accepted_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatif_issued_updated_at ON public.whatif_commissions_issued;
CREATE TRIGGER trg_whatif_issued_updated_at
BEFORE UPDATE ON public.whatif_commissions_issued
FOR EACH ROW
EXECUTE FUNCTION public.touch_whatif_issued_updated_at();

-- Optional member_roles table for scope metadata when commissions are accepted.
CREATE TABLE IF NOT EXISTS public.member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  source_ref_id UUID,
  scope_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_key, source, source_ref_id)
);

ALTER TABLE public.member_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'member_roles'
      AND policyname = 'Users read own member roles'
  ) THEN
    CREATE POLICY "Users read own member roles"
      ON public.member_roles
      FOR SELECT
      USING (auth.uid() = user_id OR public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'member_roles'
      AND policyname = 'Founder manages member roles'
  ) THEN
    CREATE POLICY "Founder manages member roles"
      ON public.member_roles
      FOR ALL
      USING (public.user_is_founder_for_contacts())
      WITH CHECK (public.user_is_founder_for_contacts());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_whatif_commission_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template public.whatif_commission_templates;
  v_role_key TEXT;
  v_member_role_id UUID;
  v_guild_id UUID;
BEGIN
  IF NOT (NEW.status = 'accepted' AND COALESCE(OLD.status, '') <> 'accepted') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_template
  FROM public.whatif_commission_templates
  WHERE id = NEW.template_id;

  v_role_key := COALESCE(v_template.commission_type, 'custom');

  IF NEW.recipient_user_id IS NOT NULL THEN
    INSERT INTO public.member_roles (
      user_id,
      role_key,
      source,
      source_ref_id,
      scope_metadata,
      created_by
    )
    VALUES (
      NEW.recipient_user_id,
      v_role_key,
      'whatif_commission',
      NEW.id,
      jsonb_build_object(
        'template_id', NEW.template_id,
        'domain_scope', v_template.domain_scope,
        'authority_description', v_template.authority_description,
        'commitment_scope_limit', NEW.commitment_scope_limit,
        'commitment_project_bounds', NEW.commitment_project_bounds,
        'commitment_decision_level', NEW.commitment_decision_level
      ),
      NEW.granted_by
    )
    ON CONFLICT (user_id, role_key, source, source_ref_id)
    DO UPDATE SET
      status = 'active',
      scope_metadata = EXCLUDED.scope_metadata
    RETURNING id INTO v_member_role_id;
  END IF;

  IF to_regclass('public.guild_memberships') IS NOT NULL AND NEW.recipient_user_id IS NOT NULL THEN
    FOREACH v_role_key IN ARRAY COALESCE(v_template.guild_memberships_granted, ARRAY[]::text[])
    LOOP
      BEGIN
        v_guild_id := v_role_key::uuid;
        INSERT INTO public.guild_memberships (guild_id, member_id, role, is_active)
        VALUES (v_guild_id, NEW.recipient_user_id, 'member', true)
        ON CONFLICT (guild_id, member_id)
        DO UPDATE SET is_active = true;
      EXCEPTION WHEN invalid_text_representation THEN
        -- Ignore non-UUID guild markers.
        CONTINUE;
      END;
    END LOOP;
  END IF;

  IF NEW.granted_in_conversation_id IS NOT NULL THEN
    UPDATE public.founder_contacts
    SET relationship_stage = 'commissioned',
        last_contacted_at = now(),
        updated_at = now()
    WHERE id = NEW.granted_in_conversation_id;
  END IF;

  IF to_regclass('public.notifications') IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.granted_by,
      'whatif_commission',
      'Commission accepted',
      format('%s accepted "%s".', NEW.recipient_name, COALESCE(v_template.title, 'Commission')),
      '/staff/founder-contacts'
    );

    IF NEW.recipient_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (
        NEW.recipient_user_id,
        'whatif_commission',
        format('Welcome aboard: %s', COALESCE(v_template.title, 'New commission')),
        'Your commission has been accepted. Start with your onboarding Treasure Map and Red Carpet materials.',
        '/treasure-maps'
      );
    END IF;
  END IF;

  IF to_regclass('public.calendar_events') IS NOT NULL THEN
    INSERT INTO public.calendar_events (
      owner_id,
      calendar_type,
      title,
      description,
      start_time,
      end_time,
      all_day,
      source_type,
      metadata
    )
    VALUES (
      NEW.granted_by,
      'business',
      format('Commission follow-up: %s', NEW.recipient_name),
      COALESCE(v_template.title, 'What-If Commission follow-up'),
      COALESCE(NEW.accepted_at, now()) + interval '3 days',
      COALESCE(NEW.accepted_at, now()) + interval '3 days 30 minutes',
      false,
      'manual',
      jsonb_build_object(
        'kind', 'whatif_commission_followup',
        'commission_id', NEW.id,
        'recipient_name', NEW.recipient_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatif_commission_accepted ON public.whatif_commissions_issued;
CREATE TRIGGER trg_whatif_commission_accepted
AFTER UPDATE ON public.whatif_commissions_issued
FOR EACH ROW
EXECUTE FUNCTION public.handle_whatif_commission_accepted();

CREATE OR REPLACE FUNCTION public.create_whatif_followup_event_on_issue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template_title TEXT;
BEGIN
  IF to_regclass('public.calendar_events') IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT title INTO v_template_title
  FROM public.whatif_commission_templates
  WHERE id = NEW.template_id;

  INSERT INTO public.calendar_events (
    owner_id,
    calendar_type,
    title,
    description,
    start_time,
    end_time,
    all_day,
    source_type,
    metadata
  )
  VALUES (
    NEW.granted_by,
    'business',
    format('Commission follow-up: %s', NEW.recipient_name),
    COALESCE(v_template_title, 'What-If Commission follow-up'),
    NEW.granted_at + interval '2 days',
    NEW.granted_at + interval '2 days 30 minutes',
    false,
    'manual',
    jsonb_build_object(
      'kind', 'whatif_commission_issue_followup',
      'commission_id', NEW.id,
      'recipient_name', NEW.recipient_name,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatif_followup_on_issue ON public.whatif_commissions_issued;
CREATE TRIGGER trg_whatif_followup_on_issue
AFTER INSERT ON public.whatif_commissions_issued
FOR EACH ROW
EXECUTE FUNCTION public.create_whatif_followup_event_on_issue();

-- Seed starter templates.
INSERT INTO public.whatif_commission_templates
  (title, commission_type, domain_scope, authority_description, duration_default)
VALUES
  ('Desktop Injection Facilitator', 'custom', 'Canister System - desktop injection mold program',
   'Lead desktop injection-molding R&D for Canister System. Authority to source equipment, test molds, publish findings to Makers Guild.',
   'Project-scoped'),
  ('Makers Guild Sub-Discipline Lead', 'guild_sub_leader', '3D Makers Guild - craft discipline',
   'Lead a specific craft discipline within 3D Makers Guild (SLA, CNC, FDM, laser, ceramics). Set standards, approve work, mentor members.',
   'Open-ended'),
  ('Business Onboarder', 'business_onboarder', 'Up to 10 businesses',
   'Onboard new businesses onto LB commerce portals. Authority over Cost+20% configuration, Guild placement, Captain assignment for assigned businesses.',
   'Open-ended'),
  ('Research Advisor', 'research_advisor', 'Specific research domain',
   'Advise on specific research area (cooperative economics, mechanical design, community trust architecture, etc.). Veto authority on published claims in domain.',
   'Open-ended'),
  ('Maker Prime (Tier 1)', 'maker_prime', 'One of the Factor-y 47 makers',
   'Represent a single Tier 1 maker brand across LB commerce portals. Coordinate production runs, author custom business plan updates.',
   'Ongoing'),
  ('Portal Steward', 'portal_steward', 'One portal (.com/.biz/.net/2ndsecond/hexisle/upekrithen)',
   'Operational steward for one commercial portal. Reports to Portal Crown if assigned. Deputy to Crown when no Crown holder seated.',
   'Project-scoped')
ON CONFLICT DO NOTHING;
