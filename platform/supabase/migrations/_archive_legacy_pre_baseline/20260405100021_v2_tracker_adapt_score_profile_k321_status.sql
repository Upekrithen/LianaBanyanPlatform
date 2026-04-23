-- K321 (B080): ADAPT Score Profile V2 status progression.

update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K321',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K321'
  )
where page_name = 'ADAPT Score Profile'
  and not ('K321' = any(coalesce(session_history, '{}'::text[])));

update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K321',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K321 ADAPT Score Profile V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K321 ADAPT Score Profile V2 complete'
    else notes || ' | K321 ADAPT Score Profile V2 complete'
  end
where page_name = 'ADAPT Score Profile';
