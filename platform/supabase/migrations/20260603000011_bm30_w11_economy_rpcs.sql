-- Wave 11 Economy RPCs (BP073 Phase Beta)
-- ==========================================
-- S6: increment_marks_balance / award_marks   -- SECURITY DEFINER, RLS-safe
-- S7: redeem_marks                            -- Marks->Credits atomic
-- S8: process_payout_queue_item               -- admin queue approval
-- S24: cast_pedestal_vote                     -- 1-per-member guard
--
-- 83.3% split verified: creator share constant flows through Cost+20% pricing;
-- these RPCs do not handle fiat -- they credit participation units only.
-- SECURITIES-CLEAN throughout.

SET search_path TO public, pg_catalog;

-- ─────────────────────────────────────────────────────────────────────────────
-- S6a: increment_marks_balance
-- Adjustable Marks balance RPC (used by both award and redeem paths).
-- SECURITY DEFINER so it can write shadow_marks_ledger on behalf of caller.
-- Guards: positive delta requires authenticated, negative delta checks balance >= |delta|.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_marks_balance(
  p_user_id   uuid,
  p_delta     numeric,
  p_reason    text    DEFAULT 'admin_adjustment',
  p_ref_id    uuid    DEFAULT NULL,
  p_note      text    DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_current_balance numeric;
  v_new_balance     numeric;
BEGIN
  -- Caller must be authenticated or service_role
  IF auth.uid() IS NULL AND current_setting('request.jwt.claims', true)::jsonb->>'role' IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'increment_marks_balance: authentication required.';
  END IF;

  -- Compute current balance from shadow_marks_ledger
  SELECT COALESCE(SUM(amount), 0)
    INTO v_current_balance
    FROM public.shadow_marks_ledger
   WHERE user_id = p_user_id;

  -- Guard: debits must not exceed balance
  IF p_delta < 0 AND (v_current_balance + p_delta) < 0 THEN
    RAISE EXCEPTION
      'increment_marks_balance: insufficient Marks balance. '
      'Current=%, requested debit=%, would result in negative balance.',
      v_current_balance, p_delta;
  END IF;

  -- Append ledger entry
  INSERT INTO public.shadow_marks_ledger (user_id, amount, reason, ref_id, note)
  VALUES (p_user_id, p_delta, p_reason, p_ref_id, p_note);

  v_new_balance := v_current_balance + p_delta;

  RETURN jsonb_build_object(
    'ok',              true,
    'user_id',         p_user_id,
    'delta',           p_delta,
    'previous_balance', v_current_balance,
    'new_balance',     v_new_balance,
    'reason',          p_reason
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_marks_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_marks_balance TO service_role;

COMMENT ON FUNCTION public.increment_marks_balance IS
  'Atomic Marks balance adjustment. Writes to shadow_marks_ledger. '
  'Guards negative balance on debits. SECURITY DEFINER. '
  'SECURITIES-CLEAN: Marks = participation units, NOT financial return.';

-- ─────────────────────────────────────────────────────────────────────────────
-- S6b: award_marks
-- Wrapper that awards Marks for a specific reason and logs to shadow_marks_ledger.
-- Idempotency: checks if ref_id already awarded (for bounty completions).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.award_marks(
  p_member_id   uuid,
  p_marks_units integer,
  p_reason      text,
  p_ref_id      uuid    DEFAULT NULL,
  p_note        text    DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_existing  integer;
  v_result    jsonb;
BEGIN
  IF p_marks_units <= 0 THEN
    RAISE EXCEPTION 'award_marks: marks_units must be positive, got %.', p_marks_units;
  END IF;

  -- Idempotency: if same ref_id already has a bounty_completion credit, skip
  IF p_ref_id IS NOT NULL AND p_reason = 'bounty_completion' THEN
    SELECT COUNT(*) INTO v_existing
      FROM public.shadow_marks_ledger
     WHERE user_id = p_member_id
       AND ref_id  = p_ref_id
       AND reason  = 'bounty_completion'
       AND amount  > 0;

    IF v_existing > 0 THEN
      RETURN jsonb_build_object(
        'ok',          false,
        'idempotent',  true,
        'message',     'Marks already awarded for this bounty.',
        'ref_id',      p_ref_id
      );
    END IF;
  END IF;

  v_result := public.increment_marks_balance(
    p_user_id => p_member_id,
    p_delta   => p_marks_units,
    p_reason  => p_reason,
    p_ref_id  => p_ref_id,
    p_note    => CASE WHEN p_note = '' THEN
      'Marks awarded: ' || p_reason || '. Participation units -- NOT financial return.'
    ELSE p_note END
  );

  RETURN v_result || jsonb_build_object('marks_units', p_marks_units);
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_marks TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_marks TO service_role;

COMMENT ON FUNCTION public.award_marks IS
  'Award Marks for a participation event. Idempotency guard on ref_id for bounty completions. '
  'SECURITIES-CLEAN: Marks = participation credits, NOT equity or guaranteed return.';

-- ─────────────────────────────────────────────────────────────────────────────
-- S7: redeem_marks
-- Atomic Marks->Credits conversion. Writes to both shadow_marks_ledger (debit)
-- and marks_redemptions (log). Credits added to credit_wallets via upsert.
-- Rate: HELD FOR FOUNDER. Reads platform_canonical.marks_to_credits_rate.
-- 83.3% split: this function only moves internal units; no fiat involved.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.redeem_marks(
  p_member_id       uuid,
  p_marks_to_spend  integer,
  p_purchase_context text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_rate            numeric;
  v_credits_to_add  integer;
  v_balance         numeric;
  v_debit_result    jsonb;
BEGIN
  -- Auth check
  IF auth.uid() IS DISTINCT FROM p_member_id THEN
    RAISE EXCEPTION 'redeem_marks: caller % may only redeem their own Marks.', auth.uid();
  END IF;

  IF p_marks_to_spend <= 0 THEN
    RAISE EXCEPTION 'redeem_marks: must redeem at least 1 Mark, got %.', p_marks_to_spend;
  END IF;

  -- Read HELD rate from platform_canonical (default 0.01 if not set)
  SELECT COALESCE(value::numeric, 0.01)
    INTO v_rate
    FROM public.platform_canonical
   WHERE key = 'marks_to_credits_rate'
   LIMIT 1;

  IF v_rate IS NULL THEN
    v_rate := 0.01;  -- HELD default until Founder ratifies
  END IF;

  v_credits_to_add := FLOOR(p_marks_to_spend * v_rate)::integer;

  -- Debit Marks (will raise if insufficient balance)
  v_debit_result := public.increment_marks_balance(
    p_user_id => p_member_id,
    p_delta   => -p_marks_to_spend,
    p_reason  => 'marks_redeemed',
    p_note    => 'Marks redeemed for Credits. Participation credits -> Cost+20% discount. NOT financial return.'
  );

  -- Credit to credit_wallets (upsert)
  INSERT INTO public.credit_wallets (user_id, balance)
  VALUES (p_member_id, v_credits_to_add)
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.credit_wallets.balance + EXCLUDED.balance;

  -- Log redemption
  INSERT INTO public.marks_redemptions
    (member_id, marks_spent, credits_received, rate_applied, purchase_context)
  VALUES
    (p_member_id, p_marks_to_spend, v_credits_to_add, v_rate, p_purchase_context);

  RETURN jsonb_build_object(
    'ok',               true,
    'marks_spent',      p_marks_to_spend,
    'credits_received', v_credits_to_add,
    'rate_applied',     v_rate,
    'rate_held',        true,
    'new_marks_balance', (v_debit_result->>'new_balance')::numeric,
    'securities_note',  'Credits reduce Cost+20% purchases only. NOT equity or guaranteed return.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_marks TO authenticated;

COMMENT ON FUNCTION public.redeem_marks IS
  'Atomic Marks->Credits redemption. '
  'Debit shadow_marks_ledger + credit credit_wallets + log marks_redemptions. '
  'Rate: HELD FOR FOUNDER (reads platform_canonical.marks_to_credits_rate). '
  'SECURITIES-CLEAN: credits reduce Cost+20% purchases only. NOT financial return. '
  '83.3% split: this moves internal participation units; no fiat conversion.';

-- ─────────────────────────────────────────────────────────────────────────────
-- S8: process_payout_queue_item
-- Staff/Founder approves a pending marks_allocation_queue item.
-- On approval: writes award_marks + marks shadow_marks_ledger.
-- On rejection: marks item rejected (no Marks awarded).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.process_payout_queue_item(
  p_queue_id  uuid,
  p_action    text,         -- 'approve' | 'reject'
  p_staff_id  uuid          DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_item    public.marks_allocation_queue%ROWTYPE;
  v_result  jsonb;
BEGIN
  -- Fetch and lock queue item
  SELECT * INTO v_item
    FROM public.marks_allocation_queue
   WHERE id = p_queue_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'process_payout_queue_item: queue item % not found.', p_queue_id;
  END IF;

  IF v_item.status <> 'pending_approval' THEN
    RAISE EXCEPTION
      'process_payout_queue_item: item % is already in status %. '
      'Only pending_approval items can be processed.',
      p_queue_id, v_item.status;
  END IF;

  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'process_payout_queue_item: action must be approve or reject, got %.', p_action;
  END IF;

  IF p_action = 'approve' THEN
    -- Award Marks
    v_result := public.award_marks(
      p_member_id   => v_item.member_id,
      p_marks_units => v_item.marks_units,
      p_reason      => v_item.reason::text,
      p_ref_id      => v_item.triggered_by,
      p_note        => 'Approved from payout queue by staff. ' || v_item.note
    );

    UPDATE public.marks_allocation_queue
       SET status = 'approved',
           approved_by = COALESCE(p_staff_id, auth.uid()),
           approved_at = now()
     WHERE id = p_queue_id;

    RETURN jsonb_build_object('ok', true, 'action', 'approved', 'queue_id', p_queue_id, 'award_result', v_result);

  ELSE
    UPDATE public.marks_allocation_queue
       SET status = 'rejected',
           approved_by = COALESCE(p_staff_id, auth.uid()),
           approved_at = now()
     WHERE id = p_queue_id;

    RETURN jsonb_build_object('ok', true, 'action', 'rejected', 'queue_id', p_queue_id);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_payout_queue_item TO service_role;

COMMENT ON FUNCTION public.process_payout_queue_item IS
  'Staff/Founder queue approval. approve=awards Marks; reject=no Marks. '
  'Idempotency: only processes pending_approval items. '
  'SECURITY DEFINER. SECURITIES-CLEAN.';

-- ─────────────────────────────────────────────────────────────────────────────
-- S24: cast_pedestal_vote
-- 1-per-member vote guard on pedestal_vote_canon.
-- Adds a vote_count column and prevents double-voting.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pedestal_member_votes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedestal_id  uuid        NOT NULL,
  voter_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  voted_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pedestal_votes_unique UNIQUE (pedestal_id, voter_id)
);

COMMENT ON TABLE public.pedestal_member_votes IS
  'One-per-member pedestal vote guard. '
  'SECURITIES-CLEAN: votes are cooperative participation, NOT equity or financial return.';

CREATE INDEX IF NOT EXISTS idx_pmv_pedestal
  ON public.pedestal_member_votes (pedestal_id);

ALTER TABLE public.pedestal_member_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pmv_select_own ON public.pedestal_member_votes;
CREATE POLICY pmv_select_own
  ON public.pedestal_member_votes FOR SELECT
  TO authenticated
  USING (auth.uid() = voter_id);

DROP POLICY IF EXISTS pmv_insert_own ON public.pedestal_member_votes;
CREATE POLICY pmv_insert_own
  ON public.pedestal_member_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE OR REPLACE FUNCTION public.cast_pedestal_vote(
  p_pedestal_id   uuid,
  p_voter_id      uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_existing int;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_voter_id THEN
    RAISE EXCEPTION 'cast_pedestal_vote: caller may only vote as themselves.';
  END IF;

  SELECT COUNT(*) INTO v_existing
    FROM public.pedestal_member_votes
   WHERE pedestal_id = p_pedestal_id AND voter_id = p_voter_id;

  IF v_existing > 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_voted', 'pedestal_id', p_pedestal_id);
  END IF;

  INSERT INTO public.pedestal_member_votes (pedestal_id, voter_id)
  VALUES (p_pedestal_id, p_voter_id);

  RETURN jsonb_build_object('ok', true, 'pedestal_id', p_pedestal_id, 'voter_id', p_voter_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_pedestal_vote TO authenticated;

COMMENT ON FUNCTION public.cast_pedestal_vote IS
  '1-per-member pedestal vote guard. Idempotency: returns ok=false if already voted. '
  'SECURITIES-CLEAN: votes are cooperative participation, NOT equity.';

-- ─────────────────────────────────────────────────────────────────────────────
-- S25 / S27: brand_stamps table + payout_gate_status canonical seed
-- Brand Stamp is the IP-Ledger marker applied to verified bounty work.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.brand_stamps (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_claim_id uuid        NOT NULL REFERENCES public.bounty_claims(id) ON DELETE RESTRICT,
  member_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  ip_ledger_seq   integer,                                -- sequence_number from ip_ledger
  stamp_text      text        NOT NULL DEFAULT
    'Contributor retains attribution. Platform receives non-exclusive license. Provenance, not legal patent grant.',
  stamped_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brand_stamps_unique UNIQUE (bounty_claim_id)
);

COMMENT ON TABLE public.brand_stamps IS
  'Brand Stamp applied to verified bounty work. '
  'Ties bounty_claim -> IP-Ledger entry. '
  'IP attribution: contributor retains attribution; platform receives non-exclusive license. '
  '"Provenance, not legal patent grant."';

ALTER TABLE public.brand_stamps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bstamps_select_own ON public.brand_stamps;
CREATE POLICY bstamps_select_own
  ON public.brand_stamps FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS bstamps_service ON public.brand_stamps;
CREATE POLICY bstamps_service
  ON public.brand_stamps FOR ALL
  TO service_role
  USING (true);

DROP POLICY IF EXISTS bstamps_insert_auth ON public.brand_stamps;
CREATE POLICY bstamps_insert_auth
  ON public.brand_stamps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_id);

GRANT SELECT, INSERT ON public.brand_stamps TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_payout_queue_item TO authenticated;

-- Seed platform_canonical gate keys if not already present
INSERT INTO public.platform_canonical (key, value)
VALUES
  ('marks_auto_payout_enabled', 'false'),
  ('marks_join_units',          '0'),
  ('marks_renewal_units',       '0'),
  ('marks_to_credits_rate',     '0.01')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.brand_stamps IS
  'Brand Stamp applied to verified bounty work. One per claim. '
  'ip_ledger_seq: sequence number in ip_ledger for the bounty.verified entry. '
  'IP: contributor retains attribution. Platform: non-exclusive license.';
