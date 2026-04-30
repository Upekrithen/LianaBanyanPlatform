-- KN006 / BP002 / 2026-04-29
-- Cephas Pre-Submission Voting + Marks-Stake + Acceptance Rewards (#2288)
-- Innovation #2288 — Cooperative content-amplification with Marks-stake voting +
--   Six-Degrees activation + acceptance-reward funded from 10% global sponsor pool
-- Toolsmith log: TS-CEPHAS-PRESUBMISSION-KN006-BP002
--
-- Composing: Glass Door Open Outreach (#2262/#2327) + Six Degrees (B131) +
--   Marks currency (project_mark_backing_oneway) + IP 60/20/10/10 allocation
-- STONE TABLET: no edits to existing outreach_letters / outreach_letter_votes
-- ONE LEVEL ONLY: attribution limited to single level (feedback_attribution_one_level.md)

-- ── Table 1: pre_submissions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "public"."pre_submissions" (
  "id"                  uuid DEFAULT gen_random_uuid() NOT NULL,
  "title"               text NOT NULL,
  "content_type"        text NOT NULL,  -- 'paper' | 'op_ed' | 'substack' | 'pitch' | 'pudding'
  "status"              text NOT NULL DEFAULT 'PRE_SUBMISSION_OPEN',
  "created_by"          uuid NOT NULL,
  "target_publications" jsonb NOT NULL DEFAULT '[]',
  -- Array of {name: string, url: string, audience: string} objects
  "top_voted_target"    text,           -- denormalized from vote tallies; null until votes arrive
  "submitted_to"        text,           -- which target was actually submitted to
  "submitted_at"        timestamptz,
  "accepted_at"         timestamptz,
  "rejected_at"         timestamptz,
  "published_at"        timestamptz,
  "votes_open_until"    timestamptz,    -- null = open indefinitely until Founder fires
  "reward_distributed"  boolean DEFAULT false,
  "created_at"          timestamptz DEFAULT now() NOT NULL,
  "updated_at"          timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "pre_submissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pre_submissions_status_check" CHECK ("status" = ANY (ARRAY[
    'PRE_SUBMISSION_OPEN'::"text",
    'SUBMITTED'::"text",
    'ACCEPTED'::"text",
    'PUBLISHED_EXTERNAL'::"text",
    'REJECTED'::"text"
  ])),
  CONSTRAINT "pre_submissions_content_type_check" CHECK ("content_type" = ANY (ARRAY[
    'paper'::"text",
    'op_ed'::"text",
    'substack'::"text",
    'pitch'::"text",
    'pudding'::"text",
    'other'::"text"
  ]))
);

ALTER TABLE "public"."pre_submissions" OWNER TO "postgres";
CREATE INDEX "idx_pre_submissions_status" ON "public"."pre_submissions" USING btree ("status");
CREATE INDEX "idx_pre_submissions_created_by" ON "public"."pre_submissions" USING btree ("created_by");

-- ── Table 2: pre_submission_votes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "public"."pre_submission_votes" (
  "id"                  uuid DEFAULT gen_random_uuid() NOT NULL,
  "pre_submission_id"   uuid NOT NULL,
  "member_id"           uuid NOT NULL,
  "target_publication"  text NOT NULL,  -- which target they're voting for
  "marks_staked"        integer NOT NULL,
  "six_degrees_flag"    boolean DEFAULT false,
  "six_degrees_network_note" text,      -- member's note on HOW they know the editor (auditable)
  "voted_at"            timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "pre_submission_votes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pre_submission_votes_marks_range_check" CHECK ("marks_staked" >= 1 AND "marks_staked" <= 100),
  CONSTRAINT "pre_submission_votes_unique_member_target"
    UNIQUE ("pre_submission_id", "member_id", "target_publication")
  -- One vote per member per target per pre_submission (member can vote for multiple targets)
);

ALTER TABLE "public"."pre_submission_votes" OWNER TO "postgres";
CREATE INDEX "idx_psv_pre_submission" ON "public"."pre_submission_votes" USING btree ("pre_submission_id");
CREATE INDEX "idx_psv_member" ON "public"."pre_submission_votes" USING btree ("member_id");
CREATE INDEX "idx_psv_target" ON "public"."pre_submission_votes" USING btree ("pre_submission_id", "target_publication");
CREATE INDEX "idx_psv_six_degrees" ON "public"."pre_submission_votes" USING btree ("pre_submission_id") WHERE "six_degrees_flag" = true;

-- ── Table 3: pre_submission_marks_escrow ─────────────────────────────────────
-- Marks held in escrow from vote until status resolves
CREATE TABLE IF NOT EXISTS "public"."pre_submission_marks_escrow" (
  "id"                  uuid DEFAULT gen_random_uuid() NOT NULL,
  "pre_submission_id"   uuid NOT NULL,
  "member_id"           uuid NOT NULL,
  "target_publication"  text NOT NULL,
  "marks_staked"        integer NOT NULL,
  "status"              text NOT NULL DEFAULT 'held',
  -- 'held' = escrowed, awaiting resolution
  -- 'rewarded' = target accepted; member received 2x reward
  -- 'consumed' = target rejected; stake consumed (skin-in-the-game)
  -- 'returned' = submission withdrawn or voided by Founder
  "reward_multiplier"   numeric(4,2) DEFAULT 2.00,
  "marks_rewarded"      integer,        -- set on distribution; = marks_staked * multiplier
  "escrowed_at"         timestamptz DEFAULT now() NOT NULL,
  "resolved_at"         timestamptz,
  CONSTRAINT "pre_submission_marks_escrow_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "psme_marks_positive" CHECK ("marks_staked" > 0),
  CONSTRAINT "psme_status_check" CHECK ("status" = ANY (ARRAY[
    'held'::"text",
    'rewarded'::"text",
    'consumed'::"text",
    'returned'::"text"
  ])),
  CONSTRAINT "psme_unique_member_target"
    UNIQUE ("pre_submission_id", "member_id", "target_publication")
);

ALTER TABLE "public"."pre_submission_marks_escrow" OWNER TO "postgres";
CREATE INDEX "idx_psme_pre_submission" ON "public"."pre_submission_marks_escrow" USING btree ("pre_submission_id");
CREATE INDEX "idx_psme_member_held" ON "public"."pre_submission_marks_escrow" USING btree ("member_id") WHERE "status" = 'held';

-- ── Table 4: pre_submission_reward_log (Stone Tablet — append-only) ──────────
CREATE TABLE IF NOT EXISTS "public"."pre_submission_reward_log" (
  "id"                  uuid DEFAULT gen_random_uuid() NOT NULL,
  "pre_submission_id"   uuid NOT NULL,
  "member_id"           uuid NOT NULL,
  "marks_staked"        integer NOT NULL,
  "marks_rewarded"      integer NOT NULL,
  "reward_multiplier"   numeric(4,2) NOT NULL,
  "target_publication"  text NOT NULL,
  "funding_source"      text NOT NULL DEFAULT 'global_sponsor_pool_10pct',
  "log_ts"              timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "pre_submission_reward_log_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."pre_submission_reward_log" OWNER TO "postgres";
CREATE INDEX "idx_psrl_member" ON "public"."pre_submission_reward_log" USING btree ("member_id");
CREATE INDEX "idx_psrl_pre_submission" ON "public"."pre_submission_reward_log" USING btree ("pre_submission_id");

-- ── Foreign keys ─────────────────────────────────────────────────────────────
ALTER TABLE "public"."pre_submission_votes"
  ADD CONSTRAINT "psv_pre_submission_fkey"
  FOREIGN KEY ("pre_submission_id") REFERENCES "public"."pre_submissions"("id") ON DELETE CASCADE;

ALTER TABLE "public"."pre_submission_votes"
  ADD CONSTRAINT "psv_member_fkey"
  FOREIGN KEY ("member_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."pre_submission_marks_escrow"
  ADD CONSTRAINT "psme_pre_submission_fkey"
  FOREIGN KEY ("pre_submission_id") REFERENCES "public"."pre_submissions"("id") ON DELETE CASCADE;

ALTER TABLE "public"."pre_submission_marks_escrow"
  ADD CONSTRAINT "psme_member_fkey"
  FOREIGN KEY ("member_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."pre_submission_reward_log"
  ADD CONSTRAINT "psrl_pre_submission_fkey"
  FOREIGN KEY ("pre_submission_id") REFERENCES "public"."pre_submissions"("id") ON DELETE CASCADE;

-- ── Views ────────────────────────────────────────────────────────────────────
-- Vote tally per target per pre_submission
CREATE OR REPLACE VIEW "public"."pre_submission_vote_tallies" AS
SELECT
  psv.pre_submission_id,
  psv.target_publication,
  SUM(psv.marks_staked) AS total_marks_staked,
  COUNT(*) AS vote_count,
  COUNT(*) FILTER (WHERE psv.six_degrees_flag = true) AS six_degrees_count
FROM public.pre_submission_votes psv
GROUP BY psv.pre_submission_id, psv.target_publication;

GRANT SELECT ON "public"."pre_submission_vote_tallies" TO "authenticated", "anon";

-- Six-Degrees flaggers for activation fan-out
CREATE OR REPLACE VIEW "public"."pre_submission_six_degrees_flaggers" AS
SELECT
  psv.pre_submission_id,
  psv.member_id,
  u.email,
  u.raw_user_meta_data->>'full_name' AS full_name,
  psv.target_publication,
  psv.six_degrees_network_note,
  psv.voted_at AS flagged_at
FROM public.pre_submission_votes psv
JOIN auth.users u ON u.id = psv.member_id
WHERE psv.six_degrees_flag = true;

GRANT SELECT ON "public"."pre_submission_six_degrees_flaggers" TO "service_role";

-- ── Function: cast_presubmission_vote ────────────────────────────────────────
-- Validates vote, enforces 100-Marks cap, checks self-vote prevention,
-- deducts Marks from member balance, records vote + escrow.
CREATE OR REPLACE FUNCTION "public"."cast_presubmission_vote"(
  "p_pre_submission_id"  uuid,
  "p_member_id"          uuid,
  "p_target_publication" text,
  "p_marks_stake"        integer,
  "p_six_degrees_flag"   boolean DEFAULT false,
  "p_six_degrees_note"   text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pre_sub         public.pre_submissions;
  v_member_marks    integer;
  v_existing_stake  integer;
  v_result          jsonb;
BEGIN
  -- 1. Load + validate pre_submission exists + is open
  SELECT * INTO v_pre_sub FROM public.pre_submissions
    WHERE id = p_pre_submission_id FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pre-submission % not found.', p_pre_submission_id;
  END IF;

  IF v_pre_sub.status != 'PRE_SUBMISSION_OPEN' THEN
    RAISE EXCEPTION 'Pre-submission % is not open for voting (status: %).', p_pre_submission_id, v_pre_sub.status;
  END IF;

  -- 2. Self-vote prevention (creator cannot vote on their own work)
  IF v_pre_sub.created_by = p_member_id THEN
    RAISE EXCEPTION 'Self-vote prohibited: creator cannot vote on their own pre-submission (ONE LEVEL ONLY + anti-gaming).';
  END IF;

  -- 3. Validate target_publication is in the pre_submission's list
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_pre_sub.target_publications) elem
    WHERE elem->>'name' = p_target_publication
  ) THEN
    RAISE EXCEPTION 'Target publication % is not in the candidate list for pre-submission %.', p_target_publication, p_pre_submission_id;
  END IF;

  -- 4. Per-member cap: sum existing stakes across all targets for this pre_submission
  SELECT COALESCE(SUM(marks_staked), 0) INTO v_existing_stake
  FROM public.pre_submission_votes
  WHERE pre_submission_id = p_pre_submission_id AND member_id = p_member_id;

  IF (v_existing_stake + p_marks_stake) > 100 THEN
    RAISE EXCEPTION 'Per-member cap exceeded: member already has % Marks staked; adding % would exceed 100-Mark cap.',
      v_existing_stake, p_marks_stake;
  END IF;

  -- 5. Check member has sufficient Marks balance
  SELECT COALESCE(current_marks_balance, 0) INTO v_member_marks
  FROM public.profiles WHERE id = p_member_id;

  IF v_member_marks < p_marks_stake THEN
    RAISE EXCEPTION 'Insufficient Marks balance: member has %, vote requires %.', v_member_marks, p_marks_stake;
  END IF;

  -- 6. Deduct Marks from member balance
  UPDATE public.profiles
    SET current_marks_balance = current_marks_balance - p_marks_stake,
        updated_at = now()
  WHERE id = p_member_id;

  -- 7. Record vote
  INSERT INTO public.pre_submission_votes
    (pre_submission_id, member_id, target_publication, marks_staked, six_degrees_flag, six_degrees_network_note)
  VALUES
    (p_pre_submission_id, p_member_id, p_target_publication, p_marks_stake, p_six_degrees_flag, p_six_degrees_note)
  ON CONFLICT (pre_submission_id, member_id, target_publication)
  DO UPDATE SET
    marks_staked = pre_submission_votes.marks_staked + EXCLUDED.marks_staked,
    six_degrees_flag = pre_submission_votes.six_degrees_flag OR EXCLUDED.six_degrees_flag,
    six_degrees_network_note = COALESCE(EXCLUDED.six_degrees_network_note, pre_submission_votes.six_degrees_network_note);

  -- 8. Record Marks escrow
  INSERT INTO public.pre_submission_marks_escrow
    (pre_submission_id, member_id, target_publication, marks_staked, status)
  VALUES
    (p_pre_submission_id, p_member_id, p_target_publication, p_marks_stake, 'held')
  ON CONFLICT (pre_submission_id, member_id, target_publication)
  DO UPDATE SET
    marks_staked = pre_submission_marks_escrow.marks_staked + EXCLUDED.marks_staked;

  -- 9. Update denormalized top_voted_target
  UPDATE public.pre_submissions
    SET top_voted_target = (
      SELECT target_publication FROM public.pre_submission_vote_tallies
      WHERE pre_submission_id = p_pre_submission_id
      ORDER BY total_marks_staked DESC
      LIMIT 1
    ),
    updated_at = now()
  WHERE id = p_pre_submission_id;

  v_result := jsonb_build_object(
    'success', true,
    'pre_submission_id', p_pre_submission_id,
    'member_id', p_member_id,
    'target_publication', p_target_publication,
    'marks_staked', p_marks_stake,
    'six_degrees_flag', p_six_degrees_flag,
    'total_stake_this_member', (v_existing_stake + p_marks_stake)
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."cast_presubmission_vote"(uuid, uuid, text, integer, boolean, text) TO "authenticated";

-- ── Function: transition_presubmission_state ──────────────────────────────────
-- Founder-only state machine. Triggers Six-Degrees fan-out on SUBMITTED.
-- Triggers distribute_acceptance_rewards on ACCEPTED.
CREATE OR REPLACE FUNCTION "public"."transition_presubmission_state"(
  "p_pre_submission_id"  uuid,
  "p_target_state"       text,
  "p_submitted_to"       text DEFAULT NULL,
  "p_founder_id"         uuid DEFAULT NULL
)
RETURNS "public"."pre_submissions"
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pre_sub   public.pre_submissions;
  v_allowed   boolean := false;
  v_allowed_transitions text[][] := ARRAY[
    ARRAY['PRE_SUBMISSION_OPEN', 'SUBMITTED'],
    ARRAY['SUBMITTED', 'ACCEPTED'],
    ARRAY['SUBMITTED', 'REJECTED'],
    ARRAY['ACCEPTED', 'PUBLISHED_EXTERNAL'],
    ARRAY['REJECTED', 'PRE_SUBMISSION_OPEN']  -- re-target allowed
  ];
  v_pair      text[];
BEGIN
  SELECT * INTO v_pre_sub FROM public.pre_submissions
    WHERE id = p_pre_submission_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pre-submission % not found.', p_pre_submission_id;
  END IF;

  -- Validate transition
  FOREACH v_pair SLICE 1 IN ARRAY v_allowed_transitions LOOP
    IF v_pre_sub.status = v_pair[1] AND p_target_state = v_pair[2] THEN
      v_allowed := true;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid transition: % → % not permitted.', v_pre_sub.status, p_target_state;
  END IF;

  -- Update state
  UPDATE public.pre_submissions SET
    status        = p_target_state,
    submitted_to  = CASE WHEN p_target_state = 'SUBMITTED' THEN COALESCE(p_submitted_to, top_voted_target) ELSE submitted_to END,
    submitted_at  = CASE WHEN p_target_state = 'SUBMITTED' THEN now() ELSE submitted_at END,
    accepted_at   = CASE WHEN p_target_state = 'ACCEPTED' THEN now() ELSE accepted_at END,
    rejected_at   = CASE WHEN p_target_state = 'REJECTED' THEN now() ELSE rejected_at END,
    published_at  = CASE WHEN p_target_state = 'PUBLISHED_EXTERNAL' THEN now() ELSE published_at END,
    updated_at    = now()
  WHERE id = p_pre_submission_id
  RETURNING * INTO v_pre_sub;

  -- On ACCEPTED: auto-distribute rewards
  IF p_target_state = 'ACCEPTED' THEN
    PERFORM public.distribute_acceptance_rewards(p_pre_submission_id, v_pre_sub.submitted_to);
  END IF;

  -- On REJECTED: consume escrowed stakes for the submitted_to target
  IF p_target_state = 'REJECTED' THEN
    UPDATE public.pre_submission_marks_escrow
      SET status = 'consumed', resolved_at = now()
    WHERE pre_submission_id = p_pre_submission_id
      AND target_publication = v_pre_sub.submitted_to
      AND status = 'held';
  END IF;

  RETURN v_pre_sub;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."transition_presubmission_state"(uuid, text, text, uuid) TO "service_role";

-- ── Function: distribute_acceptance_rewards ──────────────────────────────────
-- When target ACCEPTS: distribute 2× marks_staked to all YES voters for that target.
-- Funded from global_sponsor_pool_10pct (IP 60/20/10/10 allocation).
-- ONE LEVEL ONLY: direct reward only; no downstream attribution chain.
CREATE OR REPLACE FUNCTION "public"."distribute_acceptance_rewards"(
  "p_pre_submission_id"   uuid,
  "p_accepted_target"     text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pre_sub        public.pre_submissions;
  v_escrow_row     public.pre_submission_marks_escrow;
  v_total_rewards  integer := 0;
  v_voter_count    integer := 0;
  v_result         jsonb;
BEGIN
  SELECT * INTO v_pre_sub FROM public.pre_submissions
    WHERE id = p_pre_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pre-submission % not found.', p_pre_submission_id;
  END IF;

  IF v_pre_sub.reward_distributed THEN
    RAISE EXCEPTION 'Rewards already distributed for pre-submission %.', p_pre_submission_id;
  END IF;

  -- Distribute 2× to each voter who staked on the accepted target
  FOR v_escrow_row IN
    SELECT * FROM public.pre_submission_marks_escrow
    WHERE pre_submission_id = p_pre_submission_id
      AND target_publication = p_accepted_target
      AND status = 'held'
    FOR UPDATE
  LOOP
    DECLARE
      v_reward integer := v_escrow_row.marks_staked * 2;
    BEGIN
      -- Credit 2× to member's Marks balance
      UPDATE public.profiles
        SET current_marks_balance = current_marks_balance + v_reward,
            updated_at = now()
      WHERE id = v_escrow_row.member_id;

      -- Update escrow record
      UPDATE public.pre_submission_marks_escrow
        SET status          = 'rewarded',
            marks_rewarded  = v_reward,
            resolved_at     = now()
      WHERE id = v_escrow_row.id;

      -- Append reward log (Stone Tablet — append-only)
      INSERT INTO public.pre_submission_reward_log
        (pre_submission_id, member_id, marks_staked, marks_rewarded, reward_multiplier, target_publication, funding_source)
      VALUES
        (p_pre_submission_id, v_escrow_row.member_id, v_escrow_row.marks_staked, v_reward, 2.00, p_accepted_target, 'global_sponsor_pool_10pct');

      v_total_rewards := v_total_rewards + v_reward;
      v_voter_count   := v_voter_count + 1;
    END;
  END LOOP;

  -- Return non-accepted-target held stakes as 'consumed'
  UPDATE public.pre_submission_marks_escrow
    SET status = 'consumed', resolved_at = now()
  WHERE pre_submission_id = p_pre_submission_id
    AND target_publication != p_accepted_target
    AND status = 'held';

  -- Mark pre_submission as rewards distributed
  UPDATE public.pre_submissions
    SET reward_distributed = true, updated_at = now()
  WHERE id = p_pre_submission_id;

  v_result := jsonb_build_object(
    'success', true,
    'pre_submission_id', p_pre_submission_id,
    'accepted_target', p_accepted_target,
    'voters_rewarded', v_voter_count,
    'total_marks_distributed', v_total_rewards,
    'funding_source', 'global_sponsor_pool_10pct',
    'multiplier', 2
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."distribute_acceptance_rewards"(uuid, text) TO "service_role";

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE "public"."pre_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pre_submission_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pre_submission_marks_escrow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pre_submission_reward_log" ENABLE ROW LEVEL SECURITY;

-- pre_submissions: public read, authenticated write (for Founder creates)
CREATE POLICY "pre_submissions_read_all" ON "public"."pre_submissions"
  FOR SELECT USING (true);

CREATE POLICY "pre_submissions_insert_authenticated" ON "public"."pre_submissions"
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "pre_submissions_update_service_role" ON "public"."pre_submissions"
  FOR UPDATE USING (true);  -- enforced via transition function / service_role

-- pre_submission_votes: members see all votes (transparency); insert own
CREATE POLICY "psv_select_all" ON "public"."pre_submission_votes"
  FOR SELECT USING (true);

CREATE POLICY "psv_insert_own" ON "public"."pre_submission_votes"
  FOR INSERT WITH CHECK (auth.uid() = member_id);

-- escrow: members see own escrow only
CREATE POLICY "psme_select_own" ON "public"."pre_submission_marks_escrow"
  FOR SELECT USING (auth.uid() = member_id);

-- reward log: members see own rewards; service_role sees all
CREATE POLICY "psrl_select_own" ON "public"."pre_submission_reward_log"
  FOR SELECT USING (auth.uid() = member_id);

GRANT SELECT ON "public"."pre_submissions" TO "authenticated", "anon";
GRANT INSERT ON "public"."pre_submissions" TO "authenticated";
GRANT SELECT ON "public"."pre_submission_votes" TO "authenticated", "anon";
GRANT INSERT ON "public"."pre_submission_votes" TO "authenticated";
GRANT SELECT ON "public"."pre_submission_marks_escrow" TO "authenticated";
GRANT SELECT ON "public"."pre_submission_reward_log" TO "authenticated";

-- service_role gets full access for Founder state-machine functions
GRANT ALL ON "public"."pre_submissions" TO "service_role";
GRANT ALL ON "public"."pre_submission_votes" TO "service_role";
GRANT ALL ON "public"."pre_submission_marks_escrow" TO "service_role";
GRANT ALL ON "public"."pre_submission_reward_log" TO "service_role";

-- ── Comments ─────────────────────────────────────────────────────────────────
COMMENT ON TABLE "public"."pre_submissions" IS
  'Innovation #2288 — Cephas Pre-Submission for Publication: written works staged on Cephas before external submission. Members vote with Marks on target publication. Accepted works distribute 2x reward to YES voters from 10% global sponsor pool.';

COMMENT ON TABLE "public"."pre_submission_votes" IS
  'Member vote records. marks_staked: 1-100 per member per pre_submission (anti-whale cap). six_degrees_flag: member knows an editor at the target publication. ONE LEVEL ONLY attribution.';

COMMENT ON TABLE "public"."pre_submission_marks_escrow" IS
  'Marks held in escrow from vote until resolution. Held → Rewarded (2x on ACCEPTED) or Consumed (on REJECTED). Skin-in-the-game discipline: votes cost Marks.';

COMMENT ON TABLE "public"."pre_submission_reward_log" IS
  'Stone Tablet append-only reward log. Every Marks distribution on acceptance is permanently recorded with funding_source=global_sponsor_pool_10pct.';
