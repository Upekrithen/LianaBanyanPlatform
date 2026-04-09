-- K297 (B079): Ghost Browse V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K297',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K297'
  )
where page_name = 'Ghost Browse'
  and not ('K297' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K297',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K297 Ghost Browse V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K297 Ghost Browse V2 complete'
    else notes || ' | K297 Ghost Browse V2 complete'
  end
where page_name = 'Ghost Browse';
