-- K299 (B058): Red Carpet Landing V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K299',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K299'
  )
where page_name = 'Red Carpet Landing'
  and not ('K299' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K299',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K299 Red Carpet Landing V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K299 Red Carpet Landing V2 complete'
    else notes || ' | K299 Red Carpet Landing V2 complete'
  end
where page_name = 'Red Carpet Landing';
