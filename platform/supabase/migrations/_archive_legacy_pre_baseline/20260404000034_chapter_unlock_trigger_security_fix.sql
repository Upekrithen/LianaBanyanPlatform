CREATE OR REPLACE FUNCTION public.check_chapter_unlock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config public.chapter_unlock_config;
  v_weighted NUMERIC;
BEGIN
  SELECT * INTO v_config
  FROM public.chapter_unlock_config
  WHERE chapter_id = NEW.chapter_id;

  IF v_config.unlocked THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(
    CASE event_type
      WHEN 'like' THEN event_count * v_config.like_weight
      WHEN 'comment' THEN event_count * v_config.comment_weight
      WHEN 'share' THEN event_count * v_config.share_weight
      WHEN 'save' THEN event_count * v_config.save_weight
      ELSE 0
    END
  ), 0) INTO v_weighted
  FROM public.chapter_engagement_events
  WHERE chapter_id = NEW.chapter_id
    AND event_type != 'view';

  IF v_weighted >= v_config.engagement_threshold THEN
    UPDATE public.chapter_unlock_config
    SET unlocked = true,
        unlocked_at = COALESCE(unlocked_at, now()),
        updated_at = now()
    WHERE chapter_id = NEW.chapter_id;
  ELSE
    UPDATE public.chapter_unlock_config
    SET updated_at = now()
    WHERE chapter_id = NEW.chapter_id;
  END IF;

  RETURN NEW;
END;
$$;

WITH weighted AS (
  SELECT
    cfg.chapter_id,
    COALESCE(SUM(
      CASE e.event_type
        WHEN 'like' THEN e.event_count * cfg.like_weight
        WHEN 'comment' THEN e.event_count * cfg.comment_weight
        WHEN 'share' THEN e.event_count * cfg.share_weight
        WHEN 'save' THEN e.event_count * cfg.save_weight
        ELSE 0
      END
    ), 0) AS weighted_engagement,
    cfg.engagement_threshold
  FROM public.chapter_unlock_config cfg
  LEFT JOIN public.chapter_engagement_events e
    ON e.chapter_id = cfg.chapter_id
   AND e.event_type != 'view'
  GROUP BY cfg.chapter_id, cfg.engagement_threshold
)
UPDATE public.chapter_unlock_config cfg
SET unlocked = true,
    unlocked_at = COALESCE(cfg.unlocked_at, now()),
    updated_at = now()
FROM weighted w
WHERE cfg.chapter_id = w.chapter_id
  AND w.weighted_engagement >= w.engagement_threshold
  AND cfg.unlocked = false;
