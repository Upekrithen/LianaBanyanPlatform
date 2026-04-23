-- K314 (B080): Family Table Hub V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K314',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K314'
  )
where page_name = 'Family Table Hub'
  and not ('K314' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K314',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K314 Family Table Hub V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K314 Family Table Hub V2 complete'
    else notes || ' | K314 Family Table Hub V2 complete'
  end
where page_name = 'Family Table Hub';
