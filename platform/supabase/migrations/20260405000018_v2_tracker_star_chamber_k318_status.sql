-- K318 (B080): Star Chamber V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K318',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K318'
  )
where page_name = 'Star Chamber'
  and not ('K318' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K318',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K318 Star Chamber V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K318 Star Chamber V2 complete'
    else notes || ' | K318 Star Chamber V2 complete'
  end
where page_name = 'Star Chamber';
