-- BP073 Wave 3 · Scopes 5, 11 · WAN ASN cache + address history
-- ============================================================
-- Scope 5:  wan_connection_fingerprints -- ASN lookup cache
--           Keyed on sha256(IP); stores resolved ASN with 1-hour TTL.
-- Scope 11: wan_address_history -- stores every derived WAN soccerball
--           address for a member, used by address-history and lookup-by-email.
--
-- Security:
--   - RLS enabled on both tables.
--   - wan_connection_fingerprints: service role only (IP hashes are sensitive).
--   - wan_address_history: member can read own rows; service role writes.
--   - search_path locked to public per §4 discipline.
--
-- EMPIRICAL STATUS (BP073-W3):
--   WORKS: migration syntax compatible with Postgres 15 / Supabase
--   WORKS: RLS policies grant correct access
--   NOT YET: BGP feed integration (asn column stores ip-api.com result,
--            not a real-time BGP lookup)
--
-- Authored: 2026-06-03 · Knight BP073-W3
-- ============================================================

set search_path = public;

-- ─── Scope 5: wan_connection_fingerprints ─────────────────────────────────────

create table if not exists public.wan_connection_fingerprints (
  ip_hash          text        primary key,   -- sha256(ip) -- raw IP never stored
  asn              text        not null,       -- e.g. "AS7922"
  created_at       timestamptz not null default now()
);

comment on table public.wan_connection_fingerprints is
  'BP073-W3 Scope 5 -- ASN cache keyed on sha256(IP). '
  'Raw IP addresses are never stored. TTL: 1 hour (enforced in edge function).';

alter table public.wan_connection_fingerprints enable row level security;

-- Only service role can read or write fingerprints
create policy "wan_fingerprints_service_only"
  on public.wan_connection_fingerprints
  for all
  to service_role
  using (true)
  with check (true);

-- ─── Scope 11: wan_address_history ────────────────────────────────────────────

create table if not exists public.wan_address_history (
  id                  uuid        primary key default gen_random_uuid(),
  member_id           uuid        not null references auth.users(id) on delete cascade,
  peer_id             text        not null,
  email_hash          text        not null,     -- sha256(email:epoch) -- raw email never stored
  session_nonce       text        not null,     -- sha256(asn:timestamp_floor)
  cooperative_epoch   integer     not null,
  wan_soccerball_id   text        not null,
  asn_used            text        not null default 'AS0000',
  minted_at           timestamptz not null default now(),
  expires_at          timestamptz not null,
  published           boolean     not null default false,
  created_at          timestamptz not null default now()
);

comment on table public.wan_address_history is
  'BP073-W3 Scope 11 -- WAN soccerball address history per member. '
  'Raw email and IP are never stored. email_hash rotates daily with cooperative epoch.';

create index if not exists wan_address_history_member_id_idx
  on public.wan_address_history (member_id);
create index if not exists wan_address_history_epoch_idx
  on public.wan_address_history (cooperative_epoch);
create index if not exists wan_address_history_email_hash_idx
  on public.wan_address_history (email_hash);
create index if not exists wan_address_history_wan_id_idx
  on public.wan_address_history (wan_soccerball_id);

alter table public.wan_address_history enable row level security;

-- Members can read their own address history
create policy "wan_history_member_read"
  on public.wan_address_history
  for select
  to authenticated
  using (member_id = auth.uid());

-- Service role can write (the edge function inserts on derivation)
create policy "wan_history_service_insert"
  on public.wan_address_history
  for insert
  to service_role
  with check (true);

create policy "wan_history_service_update"
  on public.wan_address_history
  for update
  to service_role
  using (true)
  with check (true);
