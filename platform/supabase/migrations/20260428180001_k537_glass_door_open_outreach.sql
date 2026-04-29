-- K537 / B131 — Glass Door Open Outreach state machine + Six-Degrees flag
-- Adds: locked, pre_responded, formally_dispatched states to outreach_letters
-- Adds: six_degrees_flag + wave_label to outreach schema
-- Adds: lock_outreach_letter() helper function

-- C.1: Extend state check constraint on outreach_letters
ALTER TABLE "public"."outreach_letters"
  DROP CONSTRAINT IF EXISTS "outreach_letters_state_check";

ALTER TABLE "public"."outreach_letters"
  ADD CONSTRAINT "outreach_letters_state_check"
  CHECK ("state" = ANY (ARRAY[
    'draft'::"text",
    'locked'::"text",
    'proposed'::"text",
    'scheduled'::"text",
    'dispatched'::"text",
    'pre_responded'::"text",
    'formally_dispatched'::"text",
    'acknowledged'::"text",
    'answered'::"text",
    'no_response'::"text",
    'withdrawn'::"text",
    'retracted'::"text"
  ]));

-- C.1: Add wave_label column (e.g. "Wave 1", "Wave 2", etc.) for dispatch-window display
ALTER TABLE "public"."outreach_letters"
  ADD COLUMN IF NOT EXISTS "wave_label" "text";

-- C.2: Add six_degrees_flag to outreach_letter_votes
ALTER TABLE "public"."outreach_letter_votes"
  ADD COLUMN IF NOT EXISTS "six_degrees_flag" boolean DEFAULT false;

-- C.1: Helper function — Founder transitions draft → locked (or locked → proposed)
CREATE OR REPLACE FUNCTION "public"."lock_outreach_letter"(
  "p_letter_id" uuid,
  "p_target_state" text DEFAULT 'locked'
)
RETURNS "public"."outreach_letters"
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_letter public.outreach_letters;
  v_allowed_transitions text[][] := ARRAY[
    ARRAY['draft', 'locked'],
    ARRAY['locked', 'proposed'],
    ARRAY['proposed', 'scheduled'],
    ARRAY['dispatched', 'pre_responded'],
    ARRAY['pre_responded', 'formally_dispatched']
  ];
  v_pair text[];
  v_allowed boolean := false;
BEGIN
  SELECT * INTO v_letter FROM public.outreach_letters WHERE letter_id = p_letter_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Letter % not found', p_letter_id;
  END IF;

  -- Check transition is allowed
  FOREACH v_pair SLICE 1 IN ARRAY v_allowed_transitions LOOP
    IF v_letter.state = v_pair[1] AND p_target_state = v_pair[2] THEN
      v_allowed := true;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid transition: % → % (not permitted)', v_letter.state, p_target_state;
  END IF;

  UPDATE public.outreach_letters
    SET state = p_target_state,
        updated_at = now()
    WHERE letter_id = p_letter_id
    RETURNING * INTO v_letter;

  RETURN v_letter;
END;
$$;

-- Grant to authenticated users (admin check enforced in calling layer)
GRANT EXECUTE ON FUNCTION "public"."lock_outreach_letter"(uuid, text) TO "authenticated";

-- C.3: View for Six-Degrees fan-out — members who flagged a given letter
CREATE OR REPLACE VIEW "public"."outreach_six_degrees_flaggers" AS
SELECT
  olv.letter_id,
  olv.member_id,
  m.email,
  m.raw_user_meta_data->>'full_name' AS full_name,
  olv.voted_at AS flagged_at
FROM public.outreach_letter_votes olv
JOIN auth.users m ON m.id = olv.member_id
WHERE olv.six_degrees_flag = true;

GRANT SELECT ON "public"."outreach_six_degrees_flaggers" TO "service_role";

-- C.3: Aggregate counts view for letter summary
CREATE OR REPLACE VIEW "public"."outreach_letter_engagement" AS
SELECT
  letter_id,
  COUNT(*) FILTER (WHERE vote_type = 'approve') AS amplify_count,
  COUNT(*) FILTER (WHERE six_degrees_flag = true) AS six_degrees_count,
  COUNT(*) AS total_votes
FROM public.outreach_letter_votes
GROUP BY letter_id;

GRANT SELECT ON "public"."outreach_letter_engagement" TO "authenticated", "anon";
