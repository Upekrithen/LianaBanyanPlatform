-- BP073 W7 Scope 5 -- Family Table: family_gatherings, family_gatherings_rsvp, family_shared_resources
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── family_gatherings ───────────────────────────────────────────────────────
-- family_members table already exists; gatherings are organized within a family
create table if not exists family_gatherings (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid,
  organizer_id  uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  event_date    timestamptz not null,
  location      text,
  description   text,
  max_attendees integer,
  marks_reward  integer not null default 20,
  created_at    timestamptz not null default now()
);

alter table family_gatherings enable row level security;

create policy "family_gatherings_select_all"
  on family_gatherings for select
  using (true);

create policy "family_gatherings_insert_own"
  on family_gatherings for insert
  with check (auth.uid() = organizer_id);

create policy "family_gatherings_update_own"
  on family_gatherings for update
  using (auth.uid() = organizer_id);

create policy "family_gatherings_delete_own"
  on family_gatherings for delete
  using (auth.uid() = organizer_id);

-- ── family_gatherings_rsvp ──────────────────────────────────────────────────
create table if not exists family_gatherings_rsvp (
  id           uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references family_gatherings(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  status       text not null default 'yes' check (status in ('yes','no','maybe')),
  created_at   timestamptz not null default now(),
  unique (gathering_id, user_id)
);

alter table family_gatherings_rsvp enable row level security;

create policy "family_gatherings_rsvp_select_all"
  on family_gatherings_rsvp for select
  using (true);

create policy "family_gatherings_rsvp_insert_own"
  on family_gatherings_rsvp for insert
  with check (auth.uid() = user_id);

create policy "family_gatherings_rsvp_update_own"
  on family_gatherings_rsvp for update
  using (auth.uid() = user_id);

-- ── family_shared_resources ─────────────────────────────────────────────────
create table if not exists family_shared_resources (
  id             uuid primary key default gen_random_uuid(),
  family_id      uuid,
  owner_id       uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  description    text,
  resource_type  text not null default 'item'
                   check (resource_type in ('item','space','skill','vehicle','tool','other')),
  is_available   boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table family_shared_resources enable row level security;

create policy "family_shared_resources_select_all"
  on family_shared_resources for select
  using (true);

create policy "family_shared_resources_insert_own"
  on family_shared_resources for insert
  with check (auth.uid() = owner_id);

create policy "family_shared_resources_update_own"
  on family_shared_resources for update
  using (auth.uid() = owner_id);

create policy "family_shared_resources_delete_own"
  on family_shared_resources for delete
  using (auth.uid() = owner_id);

-- ── security_invoker view: gathering with rsvp count ────────────────────────
create or replace view v_family_gatherings_with_rsvp
  with (security_invoker = true)
as
select
  fg.id,
  fg.organizer_id,
  fg.title,
  fg.event_date,
  fg.location,
  fg.description,
  fg.max_attendees,
  fg.marks_reward,
  fg.created_at,
  p.display_name  as organizer_name,
  count(case when rsvp.status = 'yes' then 1 end)::int as yes_count,
  count(case when rsvp.status = 'maybe' then 1 end)::int as maybe_count
from family_gatherings fg
left join profiles p on p.user_id = fg.organizer_id
left join family_gatherings_rsvp rsvp on rsvp.gathering_id = fg.id
group by fg.id, p.display_name;
