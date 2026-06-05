-- BP073 W7 Scope 2 -- Let's Get Groceries: grocery_circles, grocery_circle_items, grocery_circle_members
-- search_path locked; RLS enabled + policy inline; security_invoker view

set search_path = public;

-- ── grocery_circles ─────────────────────────────────────────────────────────
create table if not exists grocery_circles (
  id             uuid primary key default gen_random_uuid(),
  organizer_id   uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  neighborhood   text,
  description    text,
  max_members    integer not null default 12,
  status         text not null default 'active' check (status in ('forming','active','paused','closed')),
  marks_for_org  integer not null default 30,
  created_at     timestamptz not null default now()
);

alter table grocery_circles enable row level security;

create policy "grocery_circles_select_all"
  on grocery_circles for select
  using (true);

create policy "grocery_circles_insert_own"
  on grocery_circles for insert
  with check (auth.uid() = organizer_id);

create policy "grocery_circles_update_own"
  on grocery_circles for update
  using (auth.uid() = organizer_id);

-- ── grocery_circle_members ──────────────────────────────────────────────────
create table if not exists grocery_circle_members (
  id           uuid primary key default gen_random_uuid(),
  circle_id    uuid not null references grocery_circles(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  joined_at    timestamptz not null default now(),
  marks_earned integer not null default 0,
  unique (circle_id, user_id)
);

alter table grocery_circle_members enable row level security;

create policy "grocery_circle_members_select_all"
  on grocery_circle_members for select
  using (true);

create policy "grocery_circle_members_insert_own"
  on grocery_circle_members for insert
  with check (auth.uid() = user_id);

create policy "grocery_circle_members_update_own"
  on grocery_circle_members for update
  using (auth.uid() = user_id);

create policy "grocery_circle_members_delete_own"
  on grocery_circle_members for delete
  using (auth.uid() = user_id);

-- ── grocery_circle_items ────────────────────────────────────────────────────
create table if not exists grocery_circle_items (
  id              uuid primary key default gen_random_uuid(),
  circle_id       uuid not null references grocery_circles(id) on delete cascade,
  added_by        uuid not null references auth.users(id) on delete cascade,
  item_name       text not null,
  quantity        numeric,
  unit            text,
  estimated_cost  numeric(10,2),
  actual_cost     numeric(10,2),
  status          text not null default 'pending' check (status in ('pending','ordered','delivered','removed')),
  created_at      timestamptz not null default now()
);

alter table grocery_circle_items enable row level security;

create policy "grocery_circle_items_select_circle_member"
  on grocery_circle_items for select
  using (
    exists (
      select 1 from grocery_circle_members gcm
      where gcm.circle_id = grocery_circle_items.circle_id
        and gcm.user_id = auth.uid()
    )
    or exists (
      select 1 from grocery_circles gc
      where gc.id = grocery_circle_items.circle_id
        and gc.organizer_id = auth.uid()
    )
  );

create policy "grocery_circle_items_insert_member"
  on grocery_circle_items for insert
  with check (
    auth.uid() = added_by
    and (
      exists (
        select 1 from grocery_circle_members gcm
        where gcm.circle_id = grocery_circle_items.circle_id
          and gcm.user_id = auth.uid()
      )
      or exists (
        select 1 from grocery_circles gc
        where gc.id = grocery_circle_items.circle_id
          and gc.organizer_id = auth.uid()
      )
    )
  );

create policy "grocery_circle_items_delete_own"
  on grocery_circle_items for delete
  using (auth.uid() = added_by);

-- ── security_invoker view: circle summary ───────────────────────────────────
create or replace view v_grocery_circles_summary
  with (security_invoker = true)
as
select
  gc.id,
  gc.organizer_id,
  gc.name,
  gc.neighborhood,
  gc.description,
  gc.max_members,
  gc.status,
  gc.marks_for_org,
  gc.created_at,
  p.display_name    as organizer_name,
  count(distinct gcm.user_id)::int  as member_count,
  count(distinct gci.id)::int       as item_count
from grocery_circles gc
left join profiles p on p.user_id = gc.organizer_id
left join grocery_circle_members gcm on gcm.circle_id = gc.id
left join grocery_circle_items gci on gci.circle_id = gc.id
group by gc.id, p.display_name;
