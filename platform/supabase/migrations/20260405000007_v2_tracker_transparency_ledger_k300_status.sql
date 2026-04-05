-- K300 (B057): Transparency Ledger V2 implementation status progression.

-- Start marker
update public.v2_redesign_tracker
set
  status = 'in_progress',
  assignee = 'K300',
  started_at = coalesce(started_at, now()),
  updated_at = now(),
  session_history = array_append(
    case when session_history is null then '{}'::text[] else session_history end,
    'K300'
  )
where page_name = 'Transparency Ledger'
  and not ('K300' = any(coalesce(session_history, '{}'::text[])));

-- End marker
update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K300',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K300 Transparency Ledger V2 complete%' then notes
    when coalesce(notes, '') = '' then 'K300 Transparency Ledger V2 complete'
    else notes || ' | K300 Transparency Ledger V2 complete'
  end
where page_name = 'Transparency Ledger';
