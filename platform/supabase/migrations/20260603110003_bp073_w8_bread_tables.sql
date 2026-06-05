-- BP073 W8 Scope 3 -- Let's Make Bread: bread_bounties, bread_bounty_bids, bread_skill_sessions,
--                                         bread_skill_registrations, bread_recipes,
--                                         bread_group_buy_listings, bread_group_buy_orders
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── bread_bounties ──────────────────────────────────────────────────────────
create table if not exists bread_bounties (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  amount      numeric(10,2) not null default 0,
  currency    text not null default 'marks',
  deadline    timestamptz,
  category    text not null default 'baking'
                check (category in ('baking','art','writing','music','research','other')),
  status      text not null default 'open'
                check (status in ('open','awarded','closed')),
  bid_count   integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table bread_bounties enable row level security;

create policy "bread_bounties_select_all"
  on bread_bounties for select
  using (true);

create policy "bread_bounties_insert_own"
  on bread_bounties for insert
  with check (auth.uid() = creator_id);

create policy "bread_bounties_update_own"
  on bread_bounties for update
  using (auth.uid() = creator_id);

-- ── bread_bounty_bids ───────────────────────────────────────────────────────
create table if not exists bread_bounty_bids (
  id         uuid primary key default gen_random_uuid(),
  bounty_id  uuid not null references bread_bounties(id) on delete cascade,
  member_id  uuid not null references auth.users(id) on delete cascade,
  bid_price  numeric(10,2) not null,
  notes      text,
  status     text not null default 'pending'
               check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique (bounty_id, member_id)
);

alter table bread_bounty_bids enable row level security;

create policy "bread_bounty_bids_select_all"
  on bread_bounty_bids for select
  using (true);

create policy "bread_bounty_bids_insert_own"
  on bread_bounty_bids for insert
  with check (auth.uid() = member_id);

create policy "bread_bounty_bids_update_owner"
  on bread_bounty_bids for update
  using (
    auth.uid() = member_id
    or exists (
      select 1 from bread_bounties bb
      where bb.id = bread_bounty_bids.bounty_id
        and bb.creator_id = auth.uid()
    )
  );

-- ── bread_skill_sessions ────────────────────────────────────────────────────
create table if not exists bread_skill_sessions (
  id                    uuid primary key default gen_random_uuid(),
  instructor_id         uuid not null references auth.users(id) on delete cascade,
  title                 text not null,
  skill_category        text not null default 'baking',
  description           text,
  max_participants      integer not null default 10,
  scheduled_at          timestamptz,
  duration_minutes      integer not null default 60,
  marks_for_instructor  integer not null default 100,
  marks_for_attendee    integer not null default 25,
  registration_count    integer not null default 0,
  status                text not null default 'open'
                          check (status in ('open','full','completed','cancelled')),
  created_at            timestamptz not null default now()
);

alter table bread_skill_sessions enable row level security;

create policy "bread_skill_sessions_select_all"
  on bread_skill_sessions for select
  using (true);

create policy "bread_skill_sessions_insert_own"
  on bread_skill_sessions for insert
  with check (auth.uid() = instructor_id);

create policy "bread_skill_sessions_update_own"
  on bread_skill_sessions for update
  using (auth.uid() = instructor_id);

-- ── bread_skill_registrations ───────────────────────────────────────────────
create table if not exists bread_skill_registrations (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references bread_skill_sessions(id) on delete cascade,
  member_id   uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (session_id, member_id)
);

alter table bread_skill_registrations enable row level security;

create policy "bread_skill_registrations_select_all"
  on bread_skill_registrations for select
  using (true);

create policy "bread_skill_registrations_insert_own"
  on bread_skill_registrations for insert
  with check (auth.uid() = member_id);

create policy "bread_skill_registrations_delete_own"
  on bread_skill_registrations for delete
  using (auth.uid() = member_id);

-- ── bread_recipes ────────────────────────────────────────────────────────────
create table if not exists bread_recipes (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  category         text not null default 'bread'
                     check (category in ('bread','pastry','sourdough','cake','savory','other')),
  body             text not null,
  tags             text[] default '{}',
  harper_verified  boolean not null default false,
  marks_reward     integer not null default 30,
  created_at       timestamptz not null default now()
);

alter table bread_recipes enable row level security;

create policy "bread_recipes_select_all"
  on bread_recipes for select
  using (true);

create policy "bread_recipes_insert_own"
  on bread_recipes for insert
  with check (auth.uid() = author_id);

create policy "bread_recipes_update_own"
  on bread_recipes for update
  using (auth.uid() = author_id);

-- ── bread_group_buy_listings ─────────────────────────────────────────────────
create table if not exists bread_group_buy_listings (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  description     text,
  category        text not null default 'ingredient',
  min_quantity    integer not null default 5,
  target_quantity integer not null default 20,
  unit_price      numeric(10,2) not null,
  currency        text not null default 'USD',
  deadline        timestamptz,
  order_count     integer not null default 0,
  status          text not null default 'open'
                    check (status in ('open','funded','closed','cancelled')),
  created_at      timestamptz not null default now()
);

alter table bread_group_buy_listings enable row level security;

create policy "bread_group_buy_listings_select_all"
  on bread_group_buy_listings for select
  using (true);

create policy "bread_group_buy_listings_insert_own"
  on bread_group_buy_listings for insert
  with check (auth.uid() = creator_id);

create policy "bread_group_buy_listings_update_own"
  on bread_group_buy_listings for update
  using (auth.uid() = creator_id);

-- ── bread_group_buy_orders ───────────────────────────────────────────────────
create table if not exists bread_group_buy_orders (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references bread_group_buy_listings(id) on delete cascade,
  member_id   uuid not null references auth.users(id) on delete cascade,
  quantity    integer not null default 1,
  total_cost  numeric(10,2) not null,
  created_at  timestamptz not null default now(),
  unique (listing_id, member_id)
);

alter table bread_group_buy_orders enable row level security;

create policy "bread_group_buy_orders_select_own"
  on bread_group_buy_orders for select
  using (auth.uid() = member_id);

create policy "bread_group_buy_orders_insert_own"
  on bread_group_buy_orders for insert
  with check (auth.uid() = member_id);

create policy "bread_group_buy_orders_delete_own"
  on bread_group_buy_orders for delete
  using (auth.uid() = member_id);
