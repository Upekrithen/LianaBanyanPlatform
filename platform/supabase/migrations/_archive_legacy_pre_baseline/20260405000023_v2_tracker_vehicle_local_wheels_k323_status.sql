-- K323 (B080): Vehicle / Local Wheels V2 status progression.

update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K323',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K323'
  )
where page_name = 'Vehicle / Local Wheels'
  and not ('K323' = any(coalesce(session_history, '{}'::text[])));

update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K323',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K323 Vehicle / Local Wheels V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K323 Vehicle / Local Wheels V2 complete.'
    else notes || E'\nK323 Vehicle / Local Wheels V2 complete.'
  end
where page_name = 'Vehicle / Local Wheels';
