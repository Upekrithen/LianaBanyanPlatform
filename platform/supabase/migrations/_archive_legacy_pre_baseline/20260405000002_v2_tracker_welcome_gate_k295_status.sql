-- K295 (B079): Welcome Gate V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K295',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K295'
  )
where page_name = 'Welcome Gate'
  and not ('K295' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K295',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K295 Welcome Gate V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K295 Welcome Gate V2 complete'
    else notes || ' | K295 Welcome Gate V2 complete'
  end
where page_name = 'Welcome Gate';
