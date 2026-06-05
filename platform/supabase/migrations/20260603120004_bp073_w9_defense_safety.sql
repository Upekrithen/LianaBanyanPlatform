-- BP073 W9 Scope 4 -- Defense Klaus: defense_neighbor_safety_reports (community safety coordination)
-- search_path locked; RLS enabled + policy inline
-- Switzerland Policy: NO political content, no law enforcement advocacy

set search_path = public;

-- ── defense_neighbor_safety_reports ─────────────────────────────────────────
create table if not exists defense_neighbor_safety_reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references auth.users(id) on delete cascade,
  category      text not null default 'general'
                  check (category in ('hazard','outage','safety','missing_person','weather','general')),
  description   text not null,
  location      text,
  severity      text not null default 'low'
                  check (severity in ('low','medium','high','critical')),
  status        text not null default 'open'
                  check (status in ('open','acknowledged','resolved')),
  marks_reward  integer not null default 10,
  anonymous     boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table defense_neighbor_safety_reports enable row level security;

create policy "defense_neighbor_safety_reports_select_all"
  on defense_neighbor_safety_reports for select
  using (true);

create policy "defense_neighbor_safety_reports_insert_own"
  on defense_neighbor_safety_reports for insert
  with check (auth.uid() = reporter_id);

create policy "defense_neighbor_safety_reports_update_own"
  on defense_neighbor_safety_reports for update
  using (auth.uid() = reporter_id);

-- ── defense_safety_network_members ──────────────────────────────────────────
-- (defense_klaus_enrollments already exists; this tracks neighborhood network roles)
create table if not exists defense_safety_network_members (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade unique,
  role          text not null default 'neighbor'
                  check (role in ('neighbor','coordinator','first_responder_liaison')),
  neighborhood  text,
  marks_earned  integer not null default 0,
  joined_at     timestamptz not null default now()
);

alter table defense_safety_network_members enable row level security;

create policy "defense_safety_network_members_select_all"
  on defense_safety_network_members for select
  using (true);

create policy "defense_safety_network_members_insert_own"
  on defense_safety_network_members for insert
  with check (auth.uid() = user_id);

create policy "defense_safety_network_members_update_own"
  on defense_safety_network_members for update
  using (auth.uid() = user_id);
