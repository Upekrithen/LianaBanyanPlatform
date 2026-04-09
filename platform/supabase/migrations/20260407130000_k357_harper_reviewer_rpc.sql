-- ============================================================================
-- K357B: Harper Guild Reviewer RPC + RLS for Trunk Mirror Reviews
-- Allows reviewers/admins to update trunk_mirror_submissions they don't own.
-- ============================================================================

-- =====================
-- 1. RPC: review_trunk_mirror_submission (SECURITY DEFINER)
-- =====================
CREATE OR REPLACE FUNCTION review_trunk_mirror_submission(
  p_submission_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
  v_new_status TEXT;
  v_reviewer UUID := auth.uid();
BEGIN
  SELECT status INTO v_current_status
  FROM trunk_mirror_submissions
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission % not found', p_submission_id;
  END IF;

  CASE p_action
    WHEN 'start_review' THEN
      IF v_current_status NOT IN ('submitted') THEN
        RAISE EXCEPTION 'Can only start review on submitted items (current: %)', v_current_status;
      END IF;
      v_new_status := 'under_review';

    WHEN 'approve' THEN
      IF v_current_status NOT IN ('submitted', 'under_review') THEN
        RAISE EXCEPTION 'Can only approve submitted/under_review items (current: %)', v_current_status;
      END IF;
      v_new_status := 'approved';

    WHEN 'reject' THEN
      IF v_current_status NOT IN ('submitted', 'under_review') THEN
        RAISE EXCEPTION 'Can only reject submitted/under_review items (current: %)', v_current_status;
      END IF;
      v_new_status := 'rejected';

    WHEN 'deploy' THEN
      IF v_current_status NOT IN ('approved') THEN
        RAISE EXCEPTION 'Can only deploy approved items (current: %)', v_current_status;
      END IF;
      v_new_status := 'deployed';

    ELSE
      RAISE EXCEPTION 'Unknown action: %. Use start_review, approve, reject, or deploy', p_action;
  END CASE;

  UPDATE trunk_mirror_submissions
  SET status = v_new_status,
      reviewer_id = v_reviewer,
      reviewer_notes = COALESCE(p_notes, reviewer_notes),
      reviewed_at = CASE WHEN p_action IN ('approve', 'reject') THEN now() ELSE reviewed_at END,
      updated_at = now()
  WHERE id = p_submission_id;

  -- If approved, apply theme/CSS to the neighborhood
  IF v_new_status = 'deployed' THEN
    UPDATE neighborhoods n
    SET theme_config = COALESCE(tms.theme_config_draft, n.theme_config),
        custom_css = COALESCE(tms.custom_css_draft, n.custom_css)
    FROM trunk_mirror_submissions tms
    WHERE tms.id = p_submission_id AND n.id = tms.neighborhood_id;
  END IF;
END;
$$;
