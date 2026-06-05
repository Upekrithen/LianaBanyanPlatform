-- W12 Governance Real: member dashboard + governance real
-- Wave 12 / Phase beta / BP073
-- Scopes: reputation_score column, governance_audit_log (append-only),
--         member_activity_feed view, admin_governance_overrides,
--         cast_vote_with_cap_check RPC (5% cap server-side),
--         refresh_reputation_score function.
-- Securities-clean: votes = governance participation, not financial instruments.
-- search_path locked on all functions; security_invoker on views.

-- ─── 1. member_profiles: add reputation_score ────────────────────────────────

ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS reputation_score integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS governance_flags text[] DEFAULT '{}' NOT NULL;

COMMENT ON COLUMN public.member_profiles.reputation_score IS
  'Composite cooperative standing score. Higher = more participation activity. NOT a financial metric.';

-- ─── 2. governance_audit_log — immutable append-only table ───────────────────

CREATE TABLE IF NOT EXISTS public.governance_audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type  text NOT NULL CHECK (action_type IN (
    'vote', 'council_vote', 'appeal', 'election', 'letter_ratification',
    'governance_decision', 'ip_ledger', 'admin_override', 'reputation_refresh'
  )),
  summary      text NOT NULL,
  actor_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reference_id uuid,
  metadata     jsonb DEFAULT '{}',
  created_at   timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.governance_audit_log ENABLE ROW LEVEL SECURITY;

-- Read: all authenticated users may read
CREATE POLICY gal_read_authenticated ON public.governance_audit_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Anon read allowed for transparency
CREATE POLICY gal_read_anon ON public.governance_audit_log
  FOR SELECT USING (true);

-- Insert: authenticated members + service_role
CREATE POLICY gal_insert_authenticated ON public.governance_audit_log
  FOR INSERT WITH CHECK (true);

-- NO UPDATE policy: entries are immutable. Any UPDATE attempt is rejected by RLS.
-- NO DELETE policy: entries cannot be removed.

CREATE INDEX IF NOT EXISTS idx_gal_created_at   ON public.governance_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gal_actor_id      ON public.governance_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_gal_action_type   ON public.governance_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_gal_reference_id  ON public.governance_audit_log(reference_id);

GRANT SELECT ON public.governance_audit_log TO anon, authenticated;
GRANT INSERT ON public.governance_audit_log TO authenticated;

COMMENT ON TABLE public.governance_audit_log IS
  'Immutable append-only log of all governance actions. No UPDATE or DELETE '
  'policies exist; entries cannot be modified once recorded.';

-- ─── 3. admin_governance_overrides — admin actions with mandatory audit ───────

CREATE TABLE IF NOT EXISTS public.admin_governance_overrides (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id       uuid NOT NULL REFERENCES auth.users(id),
  override_type  text NOT NULL CHECK (override_type IN (
    'vote_reversal', 'audit_annotation', 'cap_waiver', 'case_escalation',
    'cycle_close', 'reputation_manual_set'
  )),
  target_id      uuid,
  reason         text NOT NULL,
  previous_value jsonb,
  new_value      jsonb,
  created_at     timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_governance_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY ago_read_admin ON public.admin_governance_overrides
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('service_role', 'admin'));

CREATE POLICY ago_insert_admin ON public.admin_governance_overrides
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE INDEX IF NOT EXISTS idx_ago_admin_id   ON public.admin_governance_overrides(admin_id);
CREATE INDEX IF NOT EXISTS idx_ago_created_at ON public.admin_governance_overrides(created_at DESC);

GRANT SELECT ON public.admin_governance_overrides TO authenticated;
GRANT INSERT ON public.admin_governance_overrides TO authenticated;

COMMENT ON TABLE public.admin_governance_overrides IS
  'Admin overrides on governance actions. Every override requires a reason '
  'and is appended to governance_audit_log automatically via trigger.';

-- Trigger: every override automatically writes to governance_audit_log
CREATE OR REPLACE FUNCTION public.fn_ago_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.governance_audit_log
    (action_type, summary, actor_id, reference_id, metadata)
  VALUES (
    'admin_override',
    'Admin override: ' || NEW.override_type || ' - ' || NEW.reason,
    NEW.admin_id,
    NEW.target_id,
    jsonb_build_object(
      'override_type',   NEW.override_type,
      'previous_value',  NEW.previous_value,
      'new_value',       NEW.new_value
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trig_ago_audit ON public.admin_governance_overrides;
CREATE TRIGGER trig_ago_audit
  AFTER INSERT ON public.admin_governance_overrides
  FOR EACH ROW EXECUTE FUNCTION public.fn_ago_audit();

-- ─── 4. refresh_reputation_score — computes from real participation data ──────

CREATE OR REPLACE FUNCTION public.refresh_reputation_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_marks_score    integer := 0;
  v_bounty_score   integer := 0;
  v_ip_score       integer := 0;
  v_vote_score     integer := 0;
  v_total          integer;
  v_profile_id     uuid;
BEGIN
  -- Marks earned (participation credits)
  SELECT COALESCE(SUM(amount), 0) / 10
  INTO v_marks_score
  FROM public.shadow_marks_ledger
  WHERE user_id = p_user_id AND amount > 0;

  -- Verified bounty completions: 5 points each
  SELECT COALESCE(COUNT(*), 0) * 5
  INTO v_bounty_score
  FROM public.bounty_claims
  WHERE user_id = p_user_id AND status = 'verified';

  -- IP ledger entries: 2 points each
  SELECT COALESCE(COUNT(*), 0) * 2
  INTO v_ip_score
  FROM public.ip_ledger
  WHERE user_id = p_user_id;

  -- Vote allocations cast: 1 point each (governance participation)
  SELECT COALESCE(COUNT(*), 0)
  INTO v_vote_score
  FROM public.vote_allocations
  WHERE member_id = p_user_id;

  -- Cap at 9999 to keep as reasonable integer
  v_total := LEAST(v_marks_score + v_bounty_score + v_ip_score + v_vote_score, 9999);

  -- Update member_profiles
  UPDATE public.member_profiles
  SET reputation_score = v_total,
      updated_at       = now()
  WHERE user_id = p_user_id;

  -- Audit trail
  INSERT INTO public.governance_audit_log
    (action_type, summary, actor_id, metadata)
  VALUES (
    'reputation_refresh',
    'Reputation score refreshed for user',
    p_user_id,
    jsonb_build_object('new_score', v_total)
  );

  RETURN v_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_reputation_score(uuid) TO authenticated;

COMMENT ON FUNCTION public.refresh_reputation_score IS
  'Recalculates and persists reputation_score for a member. '
  'Draws from shadow_marks_ledger, bounty_claims, ip_ledger, and vote_allocations. '
  'NOT a financial metric.';

-- ─── 5. cast_vote_with_cap_check RPC — 5% cap enforced server-side ───────────

CREATE OR REPLACE FUNCTION public.cast_vote_with_cap_check(
  p_item_id    uuid,
  p_vote_class text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id  uuid := auth.uid();
  v_total      integer;
  v_mine       integer;
  v_new_id     uuid;
  CAP_PCT      numeric := 0.05;  -- 5% hard cap
  CAP_MIN_TOTAL integer := 20;   -- cap only enforced once >= 20 total votes cast
BEGIN
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to cast a vote';
  END IF;

  IF p_vote_class NOT IN ('support', 'abstain', 'reject') THEN
    RAISE EXCEPTION 'Invalid vote class: must be support, abstain, or reject';
  END IF;

  -- Check for duplicate vote
  IF EXISTS (
    SELECT 1 FROM public.vote_allocations
    WHERE votable_item_id = p_item_id AND member_id = v_member_id
  ) THEN
    RAISE EXCEPTION 'You have already cast a vote on this item';
  END IF;

  -- Count current totals
  SELECT COUNT(*) INTO v_total
  FROM public.vote_allocations
  WHERE votable_item_id = p_item_id;

  SELECT COUNT(*) INTO v_mine
  FROM public.vote_allocations
  WHERE votable_item_id = p_item_id AND member_id = v_member_id;

  -- 5% cap check: only enforced once >= CAP_MIN_TOTAL votes exist
  -- After this vote: my count = v_mine + 1, total = v_total + 1
  IF v_total >= CAP_MIN_TOTAL
    AND (v_mine + 1)::numeric / (v_total + 1)::numeric > CAP_PCT
  THEN
    RAISE EXCEPTION
      'Vote rejected: 5%% participation cap would be exceeded. '
      'No single member may represent more than 5%% of total votes on any governance item.';
  END IF;

  -- Cast the vote
  INSERT INTO public.vote_allocations (votable_item_id, member_id, vote_class, credits_allocated)
  VALUES (p_item_id, v_member_id, p_vote_class, 1)
  RETURNING id INTO v_new_id;

  -- Append to immutable audit log
  INSERT INTO public.governance_audit_log
    (action_type, summary, actor_id, reference_id, metadata)
  VALUES (
    'vote',
    'Governance vote cast: ' || p_vote_class,
    v_member_id,
    p_item_id,
    jsonb_build_object('vote_class', p_vote_class, 'item_id', p_item_id)
  );

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_vote_with_cap_check(uuid, text) TO authenticated;

COMMENT ON FUNCTION public.cast_vote_with_cap_check IS
  'Casts a governance vote with server-side 5% participation cap enforcement. '
  'Raises an error if cap would be exceeded. Appends to governance_audit_log.';

-- ─── 6. cast_council_vote_with_cap_check RPC ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.cast_council_vote_with_cap_check(
  p_cycle_id         uuid,
  p_candidate_crown  uuid,
  p_vote_class       text DEFAULT 'support'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          uuid := auth.uid();
  v_member_id    uuid;
  v_total        integer;
  v_mine         integer;
  v_new_id       uuid;
  CAP_PCT        numeric := 0.05;
  CAP_MIN_TOTAL  integer := 20;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_vote_class NOT IN ('support', 'abstain', 'reject') THEN
    RAISE EXCEPTION 'Invalid vote class';
  END IF;

  -- Resolve member_profiles.id from auth.uid()
  SELECT id INTO v_member_id
  FROM public.member_profiles
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'No member profile found for current user';
  END IF;

  -- Duplicate check
  IF EXISTS (
    SELECT 1 FROM public.council_votes
    WHERE cycle_id = p_cycle_id
      AND voter_member_id = v_member_id
      AND candidate_crown_id = p_candidate_crown
  ) THEN
    RAISE EXCEPTION 'Duplicate vote: you have already voted on this candidate in this cycle';
  END IF;

  -- 5% cap check
  SELECT COUNT(*) INTO v_total
  FROM public.council_votes WHERE cycle_id = p_cycle_id;

  SELECT COUNT(*) INTO v_mine
  FROM public.council_votes
  WHERE cycle_id = p_cycle_id AND voter_member_id = v_member_id;

  IF v_total >= CAP_MIN_TOTAL
    AND (v_mine + 1)::numeric / (v_total + 1)::numeric > CAP_PCT
  THEN
    RAISE EXCEPTION 'Vote rejected: 5%% participation cap exceeded for this council cycle';
  END IF;

  INSERT INTO public.council_votes
    (cycle_id, voter_member_id, candidate_crown_id, vote_class)
  VALUES (p_cycle_id, v_member_id, p_candidate_crown, p_vote_class)
  RETURNING id INTO v_new_id;

  INSERT INTO public.governance_audit_log
    (action_type, summary, actor_id, reference_id, metadata)
  VALUES (
    'council_vote',
    'Council vote cast: ' || p_vote_class,
    v_uid,
    p_cycle_id,
    jsonb_build_object('cycle_id', p_cycle_id, 'candidate', p_candidate_crown, 'vote_class', p_vote_class)
  );

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_council_vote_with_cap_check(uuid, uuid, text) TO authenticated;

-- ─── 7. member_activity_feed VIEW — aggregates real participation data ────────

CREATE OR REPLACE VIEW public.member_activity_feed
WITH (security_invoker = on)
AS
SELECT
  concat('marks-', m.id::text)          AS feed_id,
  m.user_id,
  'marks_earned'::text                  AS activity_type,
  COALESCE(m.reason, m.mark_type)       AS description,
  m.amount::text                        AS quantity,
  m.created_at
FROM public.shadow_marks_ledger m
WHERE m.amount > 0

UNION ALL

SELECT
  concat('vote-', v.id::text)           AS feed_id,
  v.member_id                           AS user_id,
  'vote_cast'::text                     AS activity_type,
  'Governance vote: ' || v.vote_class   AS description,
  '1'                                   AS quantity,
  v.created_at
FROM public.vote_allocations v

UNION ALL

SELECT
  concat('bounty-', b.id::text)         AS feed_id,
  b.user_id,
  'bounty_completed'::text              AS activity_type,
  'Bounty verified: ' || b.bounty_id   AS description,
  COALESCE(b.marks_awarded::text, '0') AS quantity,
  b.verified_at                         AS created_at
FROM public.bounty_claims b
WHERE b.status = 'verified'
  AND b.verified_at IS NOT NULL

UNION ALL

SELECT
  concat('ip-', i.id::text)             AS feed_id,
  i.user_id,
  'ip_ledger_entry'::text               AS activity_type,
  'IP Ledger #' || i.sequence_number::text || ': ' || i.entry_type AS description,
  '1'                                   AS quantity,
  i.created_at
FROM public.ip_ledger i
WHERE i.user_id IS NOT NULL;

GRANT SELECT ON public.member_activity_feed TO authenticated;

COMMENT ON VIEW public.member_activity_feed IS
  'Aggregated member participation activity feed. Read-only view over '
  'shadow_marks_ledger, vote_allocations, bounty_claims, and ip_ledger.';

-- ─── 8. Indexes to support governance standing queries ────────────────────────

CREATE INDEX IF NOT EXISTS idx_vote_alloc_member_id
  ON public.vote_allocations(member_id);

CREATE INDEX IF NOT EXISTS idx_vote_alloc_item_id
  ON public.vote_allocations(votable_item_id);

CREATE INDEX IF NOT EXISTS idx_shadow_marks_user_created
  ON public.shadow_marks_ledger(user_id, created_at DESC);

COMMENT ON FUNCTION public.cast_vote_with_cap_check IS
  'W12 server-side 5% cap enforcement. Idempotent: duplicate votes raise error. '
  'Appends immutable record to governance_audit_log on every cast.';
