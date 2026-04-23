create table if not exists public.canister_configurator_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary_work text not null,
  current_tools text not null,
  strength_need text not null,
  material_need text not null,
  batch_need text not null,
  constraints text[] not null default '{}',
  node_ambition text not null,
  recommended_kit text not null,
  recommendation_payoff text not null,
  completed_steps integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.canister_configurator_sessions enable row level security;

create policy "Users can insert their configurator sessions"
on public.canister_configurator_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view their configurator sessions"
on public.canister_configurator_sessions
for select
to authenticated
using (auth.uid() = user_id);
