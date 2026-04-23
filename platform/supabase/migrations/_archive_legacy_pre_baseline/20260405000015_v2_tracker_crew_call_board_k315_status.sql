-- K315 (B080): Crew Call Board V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K315',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K315'
  )
where page_name = 'Crew Call Board'
  and not ('K315' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K315',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K315 Crew Call Board V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K315 Crew Call Board V2 complete'
    else notes || ' | K315 Crew Call Board V2 complete'
  end
where page_name = 'Crew Call Board';
