-- K306 (B079): Cephas Gateway V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K306',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K306'
  )
where page_name = 'Cephas Gateway'
  and not ('K306' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K306',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K306 Cephas Gateway V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K306 Cephas Gateway V2 complete'
    else notes || ' | K306 Cephas Gateway V2 complete'
  end
where page_name = 'Cephas Gateway';
