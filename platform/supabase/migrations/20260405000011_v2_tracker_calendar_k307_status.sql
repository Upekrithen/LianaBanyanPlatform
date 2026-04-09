-- K307 (B080): Calendar V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K307',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K307'
  )
where page_name = 'Calendar'
  and not ('K307' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K307',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K307 Calendar V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K307 Calendar V2 complete'
    else notes || ' | K307 Calendar V2 complete'
  end
where page_name = 'Calendar';
