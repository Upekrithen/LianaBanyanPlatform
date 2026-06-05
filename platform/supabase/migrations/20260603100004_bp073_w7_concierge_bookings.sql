-- BP073 W7 Scope 4 -- Household Concierge: concierge_bookings
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── concierge_bookings ──────────────────────────────────────────────────────
create table if not exists concierge_bookings (
  id                  uuid primary key default gen_random_uuid(),
  requester_id        uuid not null references auth.users(id) on delete cascade,
  provider_id         uuid references service_providers(id) on delete set null,
  provider_name       text not null,
  task_description    text not null,
  category            text not null,
  provider_cost       numeric(10,2) not null,
  platform_fee        numeric(10,2) not null,
  total_cost          numeric(10,2) not null,
  marks_on_completion integer not null default 20,
  status              text not null default 'pending'
                        check (status in ('pending','accepted','completed','cancelled')),
  scheduled_for       timestamptz,
  created_at          timestamptz not null default now()
);

alter table concierge_bookings enable row level security;

create policy "concierge_bookings_select_own"
  on concierge_bookings for select
  using (auth.uid() = requester_id);

create policy "concierge_bookings_insert_own"
  on concierge_bookings for insert
  with check (auth.uid() = requester_id);

create policy "concierge_bookings_update_own"
  on concierge_bookings for update
  using (auth.uid() = requester_id);

create policy "concierge_bookings_delete_own"
  on concierge_bookings for delete
  using (auth.uid() = requester_id);
