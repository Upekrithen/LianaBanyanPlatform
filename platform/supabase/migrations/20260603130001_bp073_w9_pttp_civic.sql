-- BP073 W9 Scope 6 -- Power to the People: civic tracking tables
-- search_path locked; RLS enabled + policy inline; security_invoker views

set search_path = public;

-- ── pttp_representative_tracking ────────────────────────────────────────────
create table if not exists pttp_representative_tracking (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  rep_name         text not null,
  rep_district     text not null,
  rep_level        text not null check (rep_level in ('local','state','federal')),
  note             text,
  created_at       timestamptz not null default now()
);

alter table pttp_representative_tracking enable row level security;

create policy "pttp_rep_tracking_select_own"
  on pttp_representative_tracking for select
  using (auth.uid() = user_id);

create policy "pttp_rep_tracking_insert_own"
  on pttp_representative_tracking for insert
  with check (auth.uid() = user_id);

create policy "pttp_rep_tracking_delete_own"
  on pttp_representative_tracking for delete
  using (auth.uid() = user_id);

-- ── pttp_civic_scorecard ─────────────────────────────────────────────────────
create table if not exists pttp_civic_scorecard (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade unique,
  total_xp         integer not null default 0,
  sessions_read    integer not null default 0,
  bills_tracked    integer not null default 0,
  reps_contacted   integer not null default 0,
  marks_earned     integer not null default 0,
  updated_at       timestamptz not null default now()
);

alter table pttp_civic_scorecard enable row level security;

create policy "pttp_civic_scorecard_select_own"
  on pttp_civic_scorecard for select
  using (auth.uid() = user_id);

create policy "pttp_civic_scorecard_upsert_own"
  on pttp_civic_scorecard for insert
  with check (auth.uid() = user_id);

create policy "pttp_civic_scorecard_update_own"
  on pttp_civic_scorecard for update
  using (auth.uid() = user_id);

-- ── v_pttp_civic_leaderboard (security_invoker) ──────────────────────────────
create or replace view v_pttp_civic_leaderboard
  with (security_invoker = true)
  as
  select
    user_id,
    total_xp,
    sessions_read,
    bills_tracked,
    marks_earned
  from pttp_civic_scorecard
  order by total_xp desc;
