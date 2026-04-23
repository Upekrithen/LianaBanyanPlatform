CREATE OR REPLACE VIEW public.dispatch_schedule_admin_view AS
WITH episode_base AS (
  SELECT
    e.id,
    e.chapter_id,
    e.sequence_number,
    e.content,
    e.channel,
    e.platform,
    e.content_type,
    e.scheduled_for,
    e.status,
    CASE
      WHEN e.content_type LIKE 'platform:%' THEN lower(split_part(e.content_type, ':', 2))
      ELSE lower(COALESCE(e.platform, 'twitter'))
    END AS target_platform_raw
  FROM public.crewman_episodes e
),
episode_normalized AS (
  SELECT
    eb.*,
    CASE
      WHEN eb.target_platform_raw = 'x' THEN 'twitter'
      ELSE eb.target_platform_raw
    END AS target_platform,
    CASE
      WHEN eb.target_platform_raw = 'twitter' THEN 'x'
      ELSE eb.target_platform_raw
    END AS battery_platform
  FROM episode_base eb
)
SELECT
  en.id,
  en.chapter_id,
  en.sequence_number,
  en.content,
  en.channel,
  en.platform,
  en.content_type,
  en.target_platform,
  en.scheduled_for,
  en.status,
  cfg.role AS dispatch_role,
  cfg.preferred_windows,
  cfg.stagger_offset_minutes,
  cfg.weekday_only,
  cfg.tz AS dispatch_tz,
  CASE
    WHEN en.battery_platform = 'threads' THEN 'x'
    ELSE 'independent'
  END AS dispatch_staggered_from,
  win.window_used
FROM episode_normalized en
LEFT JOIN public.battery_dispatch_platform_config cfg
  ON cfg.platform = en.battery_platform
LEFT JOIN LATERAL (
  SELECT jsonb_build_object(
    'start', w.obj->>'start',
    'end', w.obj->>'end',
    'tz', COALESCE(cfg.tz, 'UTC')
  ) AS window_used
  FROM jsonb_array_elements(COALESCE(cfg.preferred_windows, '[]'::jsonb)) AS w(obj)
  WHERE en.scheduled_for IS NOT NULL
    AND ((en.scheduled_for AT TIME ZONE COALESCE(cfg.tz, 'UTC'))::time >= (w.obj->>'start')::time)
    AND ((en.scheduled_for AT TIME ZONE COALESCE(cfg.tz, 'UTC'))::time < (w.obj->>'end')::time)
  ORDER BY (w.obj->>'start')::time ASC
  LIMIT 1
) win ON true;
