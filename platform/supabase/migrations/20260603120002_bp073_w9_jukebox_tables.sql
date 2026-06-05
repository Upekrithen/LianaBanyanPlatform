-- BP073 W9 Scope 2 -- Jukebox Initiative: jukebox_artist_profiles, jukebox_tracks
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── jukebox_artist_profiles ──────────────────────────────────────────────────
create table if not exists jukebox_artist_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade unique,
  artist_name          text not null,
  genre                text,
  bio                  text,
  total_streams        bigint not null default 0,
  total_fees_collected numeric(12,2) not null default 0,
  ip_ledger_seq        bigint,
  status               text not null default 'active'
                         check (status in ('active','lobbying','locked')),
  created_at           timestamptz not null default now()
);

alter table jukebox_artist_profiles enable row level security;

create policy "jukebox_artist_profiles_select_all"
  on jukebox_artist_profiles for select
  using (true);

create policy "jukebox_artist_profiles_insert_own"
  on jukebox_artist_profiles for insert
  with check (auth.uid() = user_id);

create policy "jukebox_artist_profiles_update_own"
  on jukebox_artist_profiles for update
  using (auth.uid() = user_id);

-- ── jukebox_tracks ────────────────────────────────────────────────────────────
create table if not exists jukebox_tracks (
  id             uuid primary key default gen_random_uuid(),
  artist_id      uuid not null references jukebox_artist_profiles(id) on delete cascade,
  title          text not null,
  genre          text,
  ipfs_hash      text,
  stream_count   bigint not null default 0,
  royalty_rate   numeric(6,4) not null default 0.0001,
  ip_ledger_seq  bigint,
  status         text not null default 'active'
                   check (status in ('active','archived')),
  created_at     timestamptz not null default now()
);

alter table jukebox_tracks enable row level security;

create policy "jukebox_tracks_select_all"
  on jukebox_tracks for select
  using (true);

create policy "jukebox_tracks_insert_own"
  on jukebox_tracks for insert
  with check (
    exists (
      select 1 from jukebox_artist_profiles jap
      where jap.id = jukebox_tracks.artist_id
        and jap.user_id = auth.uid()
    )
  );

create policy "jukebox_tracks_update_own"
  on jukebox_tracks for update
  using (
    exists (
      select 1 from jukebox_artist_profiles jap
      where jap.id = jukebox_tracks.artist_id
        and jap.user_id = auth.uid()
    )
  );
