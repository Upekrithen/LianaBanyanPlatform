-- BP073 W8 Scope 2 -- VSL (Vouch & Secure Links): vsl_vouch_requests, vsl_vouches, member_trust_scores
-- search_path locked; RLS enabled + policy inline

set search_path = public;

-- ── vsl_vouch_requests ──────────────────────────────────────────────────────
create table if not exists vsl_vouch_requests (
  id               uuid primary key default gen_random_uuid(),
  member_id        uuid not null references auth.users(id) on delete cascade,
  need_description text not null,
  context          text,
  status           text not null default 'open'
                     check (status in ('open','fulfilled','closed')),
  created_at       timestamptz not null default now()
);

alter table vsl_vouch_requests enable row level security;

create policy "vsl_vouch_requests_select_all"
  on vsl_vouch_requests for select
  using (true);

create policy "vsl_vouch_requests_insert_own"
  on vsl_vouch_requests for insert
  with check (auth.uid() = member_id);

create policy "vsl_vouch_requests_update_own"
  on vsl_vouch_requests for update
  using (auth.uid() = member_id);

-- ── vsl_vouches ─────────────────────────────────────────────────────────────
create table if not exists vsl_vouches (
  id          uuid primary key default gen_random_uuid(),
  voucher_id  uuid not null references auth.users(id) on delete cascade,
  vouchee_id  uuid not null references auth.users(id) on delete cascade,
  request_id  uuid references vsl_vouch_requests(id) on delete set null,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (voucher_id, vouchee_id, request_id)
);

alter table vsl_vouches enable row level security;

create policy "vsl_vouches_select_all"
  on vsl_vouches for select
  using (true);

create policy "vsl_vouches_insert_own"
  on vsl_vouches for insert
  with check (auth.uid() = voucher_id);

-- ── member_trust_scores ─────────────────────────────────────────────────────
create table if not exists member_trust_scores (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade unique,
  score        integer not null default 0 check (score >= 0 and score <= 100),
  components   jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

alter table member_trust_scores enable row level security;

create policy "member_trust_scores_select_all"
  on member_trust_scores for select
  using (true);

create policy "member_trust_scores_update_own"
  on member_trust_scores for update
  using (auth.uid() = user_id);

-- ── security_invoker view: vouch requests with member profiles ───────────────
create or replace view v_vsl_vouch_requests_public
  with (security_invoker = true)
as
select
  vr.id,
  vr.member_id,
  vr.need_description,
  vr.context,
  vr.status,
  vr.created_at,
  p.display_name      as member_name,
  p.avatar_url        as member_avatar,
  coalesce(mts.score, 0) as trust_score,
  count(v.id)::int    as vouch_count
from vsl_vouch_requests vr
left join profiles p on p.user_id = vr.member_id
left join member_trust_scores mts on mts.user_id = vr.member_id
left join vsl_vouches v on v.vouchee_id = vr.member_id
where vr.status = 'open'
group by vr.id, p.display_name, p.avatar_url, mts.score;
