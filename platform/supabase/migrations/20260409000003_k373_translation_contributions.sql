-- Migration: 20260409000003_k373_translation_contributions
-- MirrorMirror multilingual feature — Durin's Door friend-word submission tracking
-- Members submit the "friend" word in their language via the Mirror Mirror museum exhibit
-- Admins review and approve/reject submissions
-- NOTE: renamed from translation_contributions → mirror_word_contributions (BP071 scope 16)
-- to avoid collision with existing prod translation_contributions (member_id/source_lang/target_lang/page_route)
-- Apply with: supabase db push (Founder action required)

create table if not exists public.mirror_word_contributions (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  language_code text        not null,
  word          text        not null,       -- the "friend" word in this language
  submission    text        not null,       -- the submitted translation text
  status        text        not null default 'pending'
                            check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now()
);

-- Index for member lookups and admin review queues
create index if not exists mirror_word_contributions_user_id_idx
  on public.mirror_word_contributions (user_id);

create index if not exists mirror_word_contributions_status_idx
  on public.mirror_word_contributions (status);

create index if not exists mirror_word_contributions_language_code_idx
  on public.mirror_word_contributions (language_code);

-- Enable RLS
alter table public.mirror_word_contributions enable row level security;

-- Members can insert their own submissions
create policy "members_insert_own_mirror_word"
  on public.mirror_word_contributions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Members can read their own submissions
create policy "members_read_own_mirror_words"
  on public.mirror_word_contributions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can read all submissions
create policy "admins_read_all_mirror_words"
  on public.mirror_word_contributions
  for select
  to authenticated
  using (public.is_admin());

-- Admins can update status (approve/reject)
create policy "admins_update_mirror_word_status"
  on public.mirror_word_contributions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
