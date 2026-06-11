-- SEG-WAN-1 · WAN Relay PeanutRoll storage
-- ============================================================
-- Stores PeanutRoll entries keyed by SID (32-char hex).
-- Raw email, memberId, and IP are NEVER stored.
-- TTL: cooperative epoch boundary (next midnight UTC).
--
-- Authored: 2026-06-11 · Knight SEG-WAN-1
-- ============================================================

set search_path = public;

create table if not exists public.wan_relay_records (
  sid               text        primary key check (sid ~ '^[0-9a-f]{32}$'),
  peanut_roll       jsonb       not null,
  cooperative_epoch integer     not null,
  expires_at        timestamptz not null,
  published_at      timestamptz not null default now(),
  ip_hash           text
);

comment on table public.wan_relay_records is
  'SEG-WAN-1 — PeanutRoll WAN relay records keyed by SID. '
  'Stores SID + PeanutRoll only; no plaintext email, memberId, or IP. '
  'Expires at cooperative epoch boundary (next midnight UTC).';

create index if not exists idx_wan_relay_expires_at
  on public.wan_relay_records (expires_at);

alter table public.wan_relay_records enable row level security;

-- Service role only — relay server uses service role key
create policy "wan_relay_records_service_only"
  on public.wan_relay_records
  for all
  to service_role
  using (true)
  with check (true);
