-- K316 (B080): Tribe Directory V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K316',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K316'
  )
where page_name = 'Tribe Directory'
  and not ('K316' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K316',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K316 Tribe Directory V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K316 Tribe Directory V2 complete'
    else notes || ' | K316 Tribe Directory V2 complete'
  end
where page_name = 'Tribe Directory';
