-- K298 (B058): HexIsle Landing V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K298',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K298'
  )
where page_name = 'HexIsle Landing'
  and not ('K298' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K298',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K298 HexIsle Landing V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K298 HexIsle Landing V2 complete'
    else notes || ' | K298 HexIsle Landing V2 complete'
  end
where page_name = 'HexIsle Landing';
