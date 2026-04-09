-- K317 (B080): Guild Directory V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K317',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K317'
  )
where page_name = 'Guild Directory'
  and not ('K317' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K317',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K317 Guild Directory V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K317 Guild Directory V2 complete'
    else notes || ' | K317 Guild Directory V2 complete'
  end
where page_name = 'Guild Directory';
