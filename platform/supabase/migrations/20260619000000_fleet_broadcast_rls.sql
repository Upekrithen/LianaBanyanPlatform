-- BP087 I10.5 · fleet_broadcast + fleet_broadcast_ack RLS policies
-- Issue: tables had RLS enabled but no policies → default-deny for anon role
-- Symptom: desktop v0.5.8 listeners (anon key) silently failed to read broadcasts or write acks
-- Root cause confirmed via Bishop §14 probe-i10 + probe-i10b (gadget-verified)
-- Truth-Always: this enacts the v0.5.7-era design (unsigned channel); I8 adds Ed25519 verification on top

-- 1. Ensure RLS is enabled (no-op if already on)
alter table public.fleet_broadcast enable row level security;
alter table public.fleet_broadcast_ack enable row level security;

-- 2. anon read of ACTIVE broadcasts only, last 10 min (limits exposure surface)
drop policy if exists anon_read_active_recent_broadcasts on public.fleet_broadcast;
create policy anon_read_active_recent_broadcasts
  on public.fleet_broadcast
  for select
  to anon
  using (
    status = 'active'
    and created_at > now() - interval '10 minutes'
  );

-- 3. anon INSERT acks (write-only; no select required)
drop policy if exists anon_insert_acks on public.fleet_broadcast_ack;
create policy anon_insert_acks
  on public.fleet_broadcast_ack
  for insert
  to anon
  with check (true);

-- 4. anon UPDATE acks (for ON CONFLICT merge-duplicates pattern the listener uses)
drop policy if exists anon_update_acks on public.fleet_broadcast_ack;
create policy anon_update_acks
  on public.fleet_broadcast_ack
  for update
  to anon
  using (true)
  with check (true);

-- Verification:
--   select policyname, cmd, roles from pg_policies where tablename in ('fleet_broadcast','fleet_broadcast_ack');
--   -- expect 3 rows: anon_read_active_recent_broadcasts (select), anon_insert_acks (insert), anon_update_acks (update)
