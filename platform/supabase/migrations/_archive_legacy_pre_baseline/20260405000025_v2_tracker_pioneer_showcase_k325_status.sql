-- K325 (B080): Pioneer Showcase V2 status progression.

update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K325',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K325'
  )
where page_name = 'Pioneer Showcase'
  and not ('K325' = any(coalesce(session_history, '{}'::text[])));

update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K325',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K325 Pioneer Showcase V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K325 Pioneer Showcase V2 complete.'
    else notes || E'\nK325 Pioneer Showcase V2 complete.'
  end
where page_name = 'Pioneer Showcase';
