-- BP073 W7 Scope 1 -- Let's Make Dinner: dinner_groups, dinner_contributions, dinner_group_guests
-- search_path locked; RLS enabled + policy inline; security_invoker view

set search_path = public;

-- ── dinner_groups ───────────────────────────────────────────────────────────
create table if not exists dinner_groups (
  id               uuid primary key default gen_random_uuid(),
  host_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  dinner_date      date not null,
  max_guests       integer not null default 8,
  location         text,
  status           text not null default 'open' check (status in ('open','full','completed','cancelled')),
  description      text,
  marks_for_host   integer not null default 50,
  created_at       timestamptz not null default now()
);

alter table dinner_groups enable row level security;

create policy "dinner_groups_select_all"
  on dinner_groups for select
  using (true);

create policy "dinner_groups_insert_own"
  on dinner_groups for insert
  with check (auth.uid() = host_id);

create policy "dinner_groups_update_own"
  on dinner_groups for update
  using (auth.uid() = host_id);

create policy "dinner_groups_delete_own"
  on dinner_groups for delete
  using (auth.uid() = host_id);

-- ── dinner_contributions ────────────────────────────────────────────────────
create table if not exists dinner_contributions (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid not null references dinner_groups(id) on delete cascade,
  contributor_id  uuid not null references auth.users(id) on delete cascade,
  slot_label      text not null,
  ingredient      text not null,
  quantity        text,
  notes           text,
  status          text not null default 'pledged' check (status in ('pledged','confirmed','cancelled')),
  marks_reward    integer not null default 15,
  created_at      timestamptz not null default now(),
  unique (group_id, contributor_id, slot_label)
);

alter table dinner_contributions enable row level security;

create policy "dinner_contributions_select_all"
  on dinner_contributions for select
  using (true);

create policy "dinner_contributions_insert_own"
  on dinner_contributions for insert
  with check (auth.uid() = contributor_id);

create policy "dinner_contributions_update_own"
  on dinner_contributions for update
  using (auth.uid() = contributor_id);

create policy "dinner_contributions_delete_own"
  on dinner_contributions for delete
  using (auth.uid() = contributor_id);

-- ── dinner_group_guests ─────────────────────────────────────────────────────
create table if not exists dinner_group_guests (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references dinner_groups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  unique (group_id, user_id)
);

alter table dinner_group_guests enable row level security;

create policy "dinner_group_guests_select_all"
  on dinner_group_guests for select
  using (true);

create policy "dinner_group_guests_insert_own"
  on dinner_group_guests for insert
  with check (auth.uid() = user_id);

create policy "dinner_group_guests_delete_own"
  on dinner_group_guests for delete
  using (auth.uid() = user_id);

-- ── security_invoker view: open dinner groups with host profile ──────────────
create or replace view v_dinner_groups_open
  with (security_invoker = true)
as
select
  dg.id,
  dg.host_id,
  dg.title,
  dg.dinner_date,
  dg.max_guests,
  dg.location,
  dg.status,
  dg.description,
  dg.marks_for_host,
  dg.created_at,
  p.display_name  as host_name,
  p.avatar_url    as host_avatar,
  count(dgg.id)::int as guest_count
from dinner_groups dg
left join profiles p on p.user_id = dg.host_id
left join dinner_group_guests dgg on dgg.group_id = dg.id
where dg.status = 'open'
group by dg.id, p.display_name, p.avatar_url;
