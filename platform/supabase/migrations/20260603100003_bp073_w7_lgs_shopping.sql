-- BP073 W7 Scope 3 -- Let's Go Shopping: shared_shopping_lists, bring_a_friend_bounties
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── shared_shopping_lists ───────────────────────────────────────────────────
create table if not exists shared_shopping_lists (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  is_shared   boolean not null default false,
  items       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table shared_shopping_lists enable row level security;

create policy "shared_shopping_lists_select"
  on shared_shopping_lists for select
  using (owner_id = auth.uid() or is_shared = true);

create policy "shared_shopping_lists_insert_own"
  on shared_shopping_lists for insert
  with check (auth.uid() = owner_id);

create policy "shared_shopping_lists_update_own"
  on shared_shopping_lists for update
  using (auth.uid() = owner_id);

create policy "shared_shopping_lists_delete_own"
  on shared_shopping_lists for delete
  using (auth.uid() = owner_id);

-- updated_at trigger
create or replace function update_shared_shopping_list_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_shared_shopping_lists_updated_at
  before update on shared_shopping_lists
  for each row execute function update_shared_shopping_list_updated_at();

-- ── bring_a_friend_bounties ─────────────────────────────────────────────────
create table if not exists bring_a_friend_bounties (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  referral_code  text not null unique default substring(gen_random_uuid()::text from 1 for 8),
  friend_user_id uuid references auth.users(id) on delete set null,
  rewarded       boolean not null default false,
  marks_reward   integer not null default 25,
  created_at     timestamptz not null default now()
);

alter table bring_a_friend_bounties enable row level security;

create policy "bring_a_friend_bounties_select_own"
  on bring_a_friend_bounties for select
  using (auth.uid() = user_id);

create policy "bring_a_friend_bounties_insert_own"
  on bring_a_friend_bounties for insert
  with check (auth.uid() = user_id);

-- ── shopping_participants (join-shopping aggregation) ───────────────────────
create table if not exists shopping_participants (
  id             uuid primary key default gen_random_uuid(),
  aggregation_id uuid,
  user_id        uuid not null references auth.users(id) on delete cascade,
  item_requests  jsonb not null default '[]'::jsonb,
  joined_at      timestamptz not null default now(),
  unique (aggregation_id, user_id)
);

alter table shopping_participants enable row level security;

create policy "shopping_participants_select_own"
  on shopping_participants for select
  using (auth.uid() = user_id);

create policy "shopping_participants_insert_own"
  on shopping_participants for insert
  with check (auth.uid() = user_id);

create policy "shopping_participants_delete_own"
  on shopping_participants for delete
  using (auth.uid() = user_id);
