-- Knight Session 294 (B079): mark all V2 redesign rows as foundation-ready.
update public.v2_redesign_tracker
set
  notes = case
    when coalesce(notes, '') ilike '%Foundation available K294%' then notes
    when coalesce(notes, '') = '' then 'Foundation available K294'
    else notes || ' | Foundation available K294'
  end,
  updated_at = now();
