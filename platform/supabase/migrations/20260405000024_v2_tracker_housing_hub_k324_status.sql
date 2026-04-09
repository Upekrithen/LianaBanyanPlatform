-- K324 (B080): Housing Hub V2 status progression.

update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K324',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K324'
  )
where page_name = 'Housing Hub'
  and not ('K324' = any(coalesce(session_history, '{}'::text[])));

update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K324',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K324 Housing Hub V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K324 Housing Hub V2 complete.'
    else notes || E'\nK324 Housing Hub V2 complete.'
  end
where page_name = 'Housing Hub';
