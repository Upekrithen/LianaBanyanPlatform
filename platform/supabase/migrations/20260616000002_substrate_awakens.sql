-- Substrate Awakens · BP084
-- Registration, replicator slots, and peer presence for the first live mesh event.

-- ── Registration table ──────────────────────────────────────────────────────
create table if not exists public.substrate_awakens_registrations (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  display_name      text,
  ram_tier          text check (ram_tier in ('unknown','lightweight','standard','premium','heavy')),
  heartbeat_token   text not null,
  token_issued_at   timestamptz default now(),
  token_used_at     timestamptz,
  slot_number       int,   -- Founding Replicator slot (1–100); null until first result arrives
  created_at        timestamptz default now()
);

-- ── Replicator roster ───────────────────────────────────────────────────────
create table if not exists public.substrate_awakens_replicators (
  slot_number        serial primary key,
  registration_id    uuid not null references public.substrate_awakens_registrations(id),
  first_result_at    timestamptz,
  marks_awarded      int default 100,
  crow_feather_awarded boolean default false
);

-- ── Peer presence table ─────────────────────────────────────────────────────
-- Heartbeat-attested by the MnemosyneC client. Each row = one live peer.
-- Updated by the app on every checkpoint (every 10 questions).
create table if not exists public.peer_presence (
  id            uuid primary key default gen_random_uuid(),
  node_id       text not null unique,
  display_name  text,
  domain        text,
  current_q     int  default 0,
  total_q       int  default 0,
  accuracy      numeric(5,2) default 0,
  quarantined   int  default 0,
  eta           text,
  state         text default 'active' check (state in ('active','quarantine','dropped')),
  heartbeat_at  timestamptz default now(),
  created_at    timestamptz default now()
);

-- ── RLS policies ────────────────────────────────────────────────────────────
alter table public.substrate_awakens_registrations enable row level security;
alter table public.substrate_awakens_replicators enable row level security;
alter table public.peer_presence enable row level security;

-- Registrations: only service role writes; anon can check own registration by token
create policy "service_role_only_write_registrations"
  on public.substrate_awakens_registrations
  for all
  using (auth.role() = 'service_role');

-- Replicators: service role write; anyone can read (public leaderboard)
create policy "anyone_read_replicators"
  on public.substrate_awakens_replicators
  for select
  using (true);

create policy "service_role_only_write_replicators"
  on public.substrate_awakens_replicators
  for all
  using (auth.role() = 'service_role');

-- Peer presence: anyone can read (live dashboard); only service role writes
create policy "anyone_read_peer_presence"
  on public.peer_presence
  for select
  using (true);

create policy "service_role_only_write_peer_presence"
  on public.peer_presence
  for all
  using (auth.role() = 'service_role');

-- ── Realtime publication ─────────────────────────────────────────────────────
-- Enable realtime for live dashboard WebSocket subscriptions.
-- FOUNDER: run in Supabase dashboard → Database → Replication → Tables to enable.
-- alter publication supabase_realtime add table public.peer_presence;
-- alter publication supabase_realtime add table public.substrate_awakens_registrations;

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_peer_presence_state       on public.peer_presence (state);
create index if not exists idx_peer_presence_heartbeat   on public.peer_presence (heartbeat_at desc);
create index if not exists idx_sa_registrations_email    on public.substrate_awakens_registrations (email);
create index if not exists idx_sa_registrations_token    on public.substrate_awakens_registrations (heartbeat_token);
