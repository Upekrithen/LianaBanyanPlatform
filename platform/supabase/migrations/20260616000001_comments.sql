-- BP084: Comments system migration
-- Thread-based, member-gated, soft-deletable, HMAC-signed
-- Threads: gemma-main, how-it-works-gemma-section, substrate-main

create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  thread_slug   text not null,
  parent_id     uuid references public.comments(id) on delete cascade,
  member_id     uuid not null references public.members(id) on delete cascade,
  body          text not null check (char_length(body) between 1 and 8000),
  body_html     text,
  created_at    timestamptz default now(),
  edited_at     timestamptz,
  deleted_at    timestamptz,
  flagged_count int default 0,
  heartbeat_sig text not null,
  upvotes       int default 0,
  downvotes     int default 0
);

create index comments_thread_idx on public.comments(thread_slug, created_at desc) where deleted_at is null;

create table public.comment_votes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  member_id  uuid not null references public.members(id) on delete cascade,
  vote       int  not null check (vote in (-1, 1)),
  created_at timestamptz default now(),
  primary key (comment_id, member_id)
);

alter table public.comments enable row level security;
create policy "comments_read_public" on public.comments for select using (deleted_at is null);
create policy "comments_insert_member" on public.comments for insert with check (member_id = auth.uid());
create policy "comments_update_author" on public.comments for update using (member_id = auth.uid());

alter table public.comment_votes enable row level security;
create policy "comment_votes_read_public" on public.comment_votes for select using (true);
create policy "comment_votes_insert_member" on public.comment_votes for insert with check (member_id = auth.uid());
create policy "comment_votes_upsert_member" on public.comment_votes for update using (member_id = auth.uid());
