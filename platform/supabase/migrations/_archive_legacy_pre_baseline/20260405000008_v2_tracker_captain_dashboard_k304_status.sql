-- K304 (B079): Captain Dashboard V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K304',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K304'
  )
where page_name = 'Captain Dashboard'
  and not ('K304' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K304',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K304 Captain Dashboard V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K304 Captain Dashboard V2 complete'
    else notes || ' | K304 Captain Dashboard V2 complete'
  end
where page_name = 'Captain Dashboard';
