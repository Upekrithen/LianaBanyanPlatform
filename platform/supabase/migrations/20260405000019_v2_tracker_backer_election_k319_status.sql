-- K319: Backer Election V2 tracker transition
update public.v2_redesign_tracker
set assignee = 'K319',
    status = 'in_progress',
    notes = coalesce(notes, '') || E'\nK319 started: Backer Election V2 implementation.'
where page_name = 'Backer Election';

update public.v2_redesign_tracker
set assignee = 'K319',
    status = 'review',
    notes = coalesce(notes, '') || E'\nK319 ready for review: route + v2 components + governance flow.'
where page_name = 'Backer Election';
