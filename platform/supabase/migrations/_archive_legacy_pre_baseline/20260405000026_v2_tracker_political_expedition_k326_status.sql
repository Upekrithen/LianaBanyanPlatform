-- K326 (B080): Political Expedition V2 status progression.

update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K326',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K326'
  )
where page_name = 'Political Expedition'
  and not ('K326' = any(coalesce(session_history, '{}'::text[])));

update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K326',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K326 Political Expedition V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K326 Political Expedition V2 complete.'
    else notes || E'\nK326 Political Expedition V2 complete.'
  end
where page_name = 'Political Expedition';
