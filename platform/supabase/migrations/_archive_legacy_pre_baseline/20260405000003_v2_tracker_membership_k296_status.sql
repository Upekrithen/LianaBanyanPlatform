-- K296 (B079): Membership V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K296',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K296'
  )
where page_name = 'Membership'
  and not ('K296' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K296',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K296 Membership V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K296 Membership V2 complete'
    else notes || ' | K296 Membership V2 complete'
  end
where page_name = 'Membership';
