-- KN-H5 (Pod-H #5 of 5) — Tier-Change Audit Log + RPC
-- BP017 Three-Tier Sovereignty canon. Pod-H finalization.
-- FORK doctrine compliance: change_cost is Marks-class only; NEVER bridged to fiat.
-- BRIDLE Rule 4: failure cases surface error; no silent state mutation.
-- Composes with KN-H1 lb_frame_resource_config_tier (enum + set/get RPCs).

-- ── Step 1: lb_frame_tier_change_log table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lb_frame_tier_change_log (
  id                 BIGSERIAL PRIMARY KEY,
  member_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_tier      public.lb_frame_resource_tier,             -- NULL on first-ever pick
  new_tier           public.lb_frame_resource_tier NOT NULL,
  changed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- FORK doctrine compliance (project_mark_backing_oneway.md BP017 extension):
  -- change_cost is Marks-class only. One-way-ratchet: Marks debited NEVER cash-out.
  -- LB-currency-system stays separate from fiat. This column may be non-zero only
  -- if a future Founder-ratified decision adds Marks-cost to tier change.
  -- Default = 0 (FREE per Bishop-recommend anti-extraction structural form).
  change_cost_marks  INTEGER     NOT NULL DEFAULT 0
    CHECK (change_cost_marks >= 0),

  -- FORK SAFETY: fiat_cents column INTENTIONALLY ABSENT.
  -- No fiat-bridge column is present by design to enforce the one-way-ratchet
  -- at the schema level. Adding one in a future migration requires explicit
  -- Founder ratification + FORK-doctrine review. See BP017 extension.
  notes              TEXT        -- optional; free-text context (e.g. "WildFire Tour demo reset")
);

COMMENT ON TABLE public.lb_frame_tier_change_log IS
  'Audit log of LB Frame resource-config tier changes. '
  'Anti-extraction by structural form: no fiat-bridge column (FORK doctrine). '
  'Change cost is Marks-class only; defaults to 0 (FREE, anti-extraction). '
  'Per KN-H5 / BP017 Three-Tier Sovereignty canon.';

COMMENT ON COLUMN public.lb_frame_tier_change_log.change_cost_marks IS
  'Marks cost for this tier-change event. Default 0 = FREE (Bishop-recommend anti-extraction). '
  'Alternative Marks-cost pending Founder ratification at fire-time. '
  'FORK doctrine: this column is Marks-class only; no fiat-bridge permitted.';

-- ── Step 2: indexes for analytics + member history queries ───────────────────
CREATE INDEX IF NOT EXISTS idx_tier_change_log_member
  ON public.lb_frame_tier_change_log(member_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_tier_change_log_new_tier
  ON public.lb_frame_tier_change_log(new_tier);

-- ── Step 3: function: log_lb_frame_tier_change ───────────────────────────────
-- Called immediately after set_lb_frame_resource_config_tier succeeds.
-- Writes an audit entry. BRIDLE Rule 4: caller must handle errors; this RPC
-- does NOT silently swallow failures.
CREATE OR REPLACE FUNCTION public.log_lb_frame_tier_change(
  p_member_id      UUID,
  p_previous_tier  public.lb_frame_resource_tier DEFAULT NULL,
  p_new_tier       public.lb_frame_resource_tier DEFAULT NULL,
  p_changed_at     TIMESTAMPTZ                   DEFAULT NOW(),
  p_cost_marks     INTEGER                       DEFAULT 0,
  p_notes          TEXT                          DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id BIGINT;
BEGIN
  IF p_new_tier IS NULL THEN
    RAISE EXCEPTION 'log_lb_frame_tier_change: p_new_tier must not be NULL';
  END IF;

  INSERT INTO public.lb_frame_tier_change_log
    (member_id, previous_tier, new_tier, changed_at, change_cost_marks, notes)
  VALUES
    (p_member_id, p_previous_tier, p_new_tier, p_changed_at, p_cost_marks, p_notes)
  RETURNING id INTO v_log_id;

  RETURN jsonb_build_object(
    'ok',            true,
    'log_id',        v_log_id,
    'member_id',     p_member_id,
    'previous_tier', p_previous_tier::TEXT,
    'new_tier',      p_new_tier::TEXT,
    'changed_at',    p_changed_at,
    'cost_marks',    p_cost_marks
  );
END;
$$;

-- ── Step 4: function: get_lb_frame_tier_change_history ───────────────────────
-- Returns full tier-change history for a member (chronological).
-- Queryable for T7 verification: member-id + tier-history per member.
CREATE OR REPLACE FUNCTION public.get_lb_frame_tier_change_history(
  p_member_id UUID,
  p_limit     INTEGER DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  v_rows JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'log_id',        id,
      'previous_tier', previous_tier::TEXT,
      'new_tier',      new_tier::TEXT,
      'changed_at',    changed_at,
      'cost_marks',    change_cost_marks,
      'notes',         notes
    ) ORDER BY changed_at DESC
  )
  INTO v_rows
  FROM public.lb_frame_tier_change_log
  WHERE member_id = p_member_id
  LIMIT p_limit;

  RETURN jsonb_build_object(
    'member_id',    p_member_id,
    'change_count', COALESCE(jsonb_array_length(v_rows), 0),
    'history',      COALESCE(v_rows, '[]'::JSONB)
  );
END;
$$;

-- ── Step 5: RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.lb_frame_tier_change_log ENABLE ROW LEVEL SECURITY;

-- Members read only their own history
CREATE POLICY "Members read own tier change log"
  ON public.lb_frame_tier_change_log
  FOR SELECT
  USING (auth.uid() = member_id);

-- Members cannot directly INSERT/UPDATE/DELETE; only via SECURITY DEFINER RPCs
CREATE POLICY "No direct insert — use log_lb_frame_tier_change RPC"
  ON public.lb_frame_tier_change_log
  FOR INSERT
  WITH CHECK (false);

-- ── Step 6: grants ────────────────────────────────────────────────────────────
GRANT SELECT ON public.lb_frame_tier_change_log TO authenticated;

GRANT EXECUTE ON FUNCTION public.log_lb_frame_tier_change(
  UUID, public.lb_frame_resource_tier, public.lb_frame_resource_tier,
  TIMESTAMPTZ, INTEGER, TEXT
) TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_lb_frame_tier_change_history(UUID, INTEGER)
  TO authenticated, anon, service_role;
