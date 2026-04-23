-- K305 (B079): Marketplace V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K305',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K305'
  )
where page_name = 'Marketplace'
  and not ('K305' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K305',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K305 Marketplace V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K305 Marketplace V2 complete'
    else notes || ' | K305 Marketplace V2 complete'
  end
where page_name = 'Marketplace';
