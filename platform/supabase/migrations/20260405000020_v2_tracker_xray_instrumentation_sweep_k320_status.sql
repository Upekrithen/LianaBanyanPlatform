-- K320 (B080): X-Ray Instrumentation Sweep status progression.

insert into public.v2_redesign_tracker (
  page_name,
  page_route,
  pawn_batch,
  spec_file,
  status,
  assignee,
  notes,
  started_at,
  updated_at,
  session_history
)
values (
  'X-Ray Instrumentation Sweep',
  '/v2-instrumentation/xray',
  'B080',
  'BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_SESSION_320_XRAY_INSTRUMENTATION_SWEEP_B080.md',
  'in_progress',
  'K320',
  'K320 started: data-xray-id instrumentation across V2 page landmarks and glossary backfill.',
  now(),
  now(),
  array['K320']::text[]
)
on conflict (page_name) do update
set
  status = 'in_progress',
  assignee = 'K320',
  started_at = coalesce(public.v2_redesign_tracker.started_at, now()),
  updated_at = now(),
  session_history = case
    when 'K320' = any(coalesce(public.v2_redesign_tracker.session_history, '{}'::text[]))
      then coalesce(public.v2_redesign_tracker.session_history, '{}'::text[])
    else array_append(coalesce(public.v2_redesign_tracker.session_history, '{}'::text[]), 'K320')
  end;

update public.v2_redesign_tracker
set
  status = 'review',
  assignee = 'K320',
  updated_at = now(),
  notes = case
    when coalesce(notes, '') ilike '%K320 X-Ray instrumentation sweep complete%' then notes
    when coalesce(notes, '') = '' then 'K320 X-Ray instrumentation sweep complete'
    else notes || ' | K320 X-Ray instrumentation sweep complete'
  end
where page_name = 'X-Ray Instrumentation Sweep';
