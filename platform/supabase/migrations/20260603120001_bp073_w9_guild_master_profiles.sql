-- BP073 W9 Scope 1 -- Harper Guild: guild_master_profiles
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── guild_master_profiles ───────────────────────────────────────────────────
create table if not exists guild_master_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade unique,
  display_name      text not null,
  specialty         text not null,
  experience_years  integer not null default 0,
  linkedin_url      text,
  linkedin_verified boolean not null default false,
  rating            numeric(3,2) default 0.00,
  bio               text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table guild_master_profiles enable row level security;

create policy "guild_master_profiles_select_all"
  on guild_master_profiles for select
  using (true);

create policy "guild_master_profiles_insert_own"
  on guild_master_profiles for insert
  with check (auth.uid() = user_id);

create policy "guild_master_profiles_update_own"
  on guild_master_profiles for update
  using (auth.uid() = user_id);
