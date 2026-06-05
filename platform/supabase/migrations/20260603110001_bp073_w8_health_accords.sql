-- BP073 W8 Scope 1 -- Health Accords: health_orders, health_savings_ledger, prescription_lookups
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── health_orders ───────────────────────────────────────────────────────────
create table if not exists health_orders (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references auth.users(id) on delete cascade,
  category        text not null default 'medication'
                    check (category in ('medication','supplement','device','service','other')),
  item_name       text not null,
  quantity        integer not null default 1,
  estimated_cost  numeric(10,2),
  actual_cost     numeric(10,2),
  group_buy_id    uuid,
  status          text not null default 'pending'
                    check (status in ('pending','ordered','shipped','delivered','cancelled')),
  marks_reward    integer not null default 10,
  created_at      timestamptz not null default now()
);

alter table health_orders enable row level security;

create policy "health_orders_select_own"
  on health_orders for select
  using (auth.uid() = member_id);

create policy "health_orders_insert_own"
  on health_orders for insert
  with check (auth.uid() = member_id);

create policy "health_orders_update_own"
  on health_orders for update
  using (auth.uid() = member_id);

-- ── health_savings_ledger ───────────────────────────────────────────────────
create table if not exists health_savings_ledger (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid not null references auth.users(id) on delete cascade,
  contribution_type text not null default 'annual'
                      check (contribution_type in ('annual','monthly','bonus','refund')),
  amount            numeric(10,2) not null,
  currency          text not null default 'USD',
  period_month      text,
  notes             text,
  created_at        timestamptz not null default now()
);

alter table health_savings_ledger enable row level security;

create policy "health_savings_ledger_select_own"
  on health_savings_ledger for select
  using (auth.uid() = member_id);

create policy "health_savings_ledger_insert_own"
  on health_savings_ledger for insert
  with check (auth.uid() = member_id);

-- ── prescription_lookups ────────────────────────────────────────────────────
create table if not exists prescription_lookups (
  id                 uuid primary key default gen_random_uuid(),
  member_id          uuid references auth.users(id) on delete set null,
  drug_name          text not null,
  ndc_code           text,
  retail_price       numeric(10,2),
  cooperative_price  numeric(10,2),
  savings_amount     numeric(10,2) generated always as (coalesce(retail_price,0) - coalesce(cooperative_price,0)) stored,
  created_at         timestamptz not null default now()
);

alter table prescription_lookups enable row level security;

create policy "prescription_lookups_select_all"
  on prescription_lookups for select
  using (true);

create policy "prescription_lookups_insert_authenticated"
  on prescription_lookups for insert
  with check (auth.uid() is not null);
