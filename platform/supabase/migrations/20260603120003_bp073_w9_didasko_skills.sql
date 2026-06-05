-- BP073 W9 Scope 3 -- Didasko Initiative: didasko_skills
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── didasko_skills ────────────────────────────────────────────────────────────
create table if not exists didasko_skills (
  id              uuid primary key default gen_random_uuid(),
  instructor_id   uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  category        text not null default 'economics',
  description     text,
  ip_ledger_ref   text,
  mnemosynec_tag  text,
  level           text not null default 'beginner'
                    check (level in ('beginner','intermediate','advanced','expert')),
  prereqs         jsonb not null default '[]'::jsonb,
  marks_reward    integer not null default 50,
  status          text not null default 'published'
                    check (status in ('draft','published','archived')),
  created_at      timestamptz not null default now()
);

alter table didasko_skills enable row level security;

create policy "didasko_skills_select_published"
  on didasko_skills for select
  using (status = 'published' or auth.uid() = instructor_id);

create policy "didasko_skills_insert_own"
  on didasko_skills for insert
  with check (auth.uid() = instructor_id);

create policy "didasko_skills_update_own"
  on didasko_skills for update
  using (auth.uid() = instructor_id);

create policy "didasko_skills_delete_own"
  on didasko_skills for delete
  using (auth.uid() = instructor_id);
