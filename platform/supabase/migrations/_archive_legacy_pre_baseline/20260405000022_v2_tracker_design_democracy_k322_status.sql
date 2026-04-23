-- K322 (B080): Design Democracy V2 status progression.

update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K322',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K322'
  )
where page_name = 'Design Democracy'
  and not ('K322' = any(coalesce(session_history, '{}'::text[])));

update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K322',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K322 Design Democracy V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K322 Design Democracy V2 complete'
    else notes || ' | K322 Design Democracy V2 complete'
  end
where page_name = 'Design Democracy';
