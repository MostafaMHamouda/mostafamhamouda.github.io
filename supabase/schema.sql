-- Learnova Lost Map MVP schema
-- This setup is intentionally permissive for an event MVP.
-- Add proper authentication and stricter RLS before using in production.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  members_count integer not null default 0,
  pathfinder text,
  scanner text,
  score integer not null default 0,
  hints_used integer not null default 0,
  education_unlocked boolean not null default false,
  entrepreneurship_unlocked boolean not null default false,
  entertainment_unlocked boolean not null default false,
  exploration_unlocked boolean not null default false,
  final_gate_completed boolean not null default false,
  reveal_completed boolean not null default false,
  last_unlocked_world text,
  current_status text not null default 'in_progress',
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_completions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  completed_at timestamptz not null default now(),
  points_awarded integer not null default 0,
  constraint team_completions_unique unique (team_id, item_type, item_id)
);

create table if not exists public.team_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  event_type text not null,
  event_label text not null,
  points_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.game_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row
execute function public.set_updated_at();

drop trigger if exists game_settings_set_updated_at on public.game_settings;
create trigger game_settings_set_updated_at
before update on public.game_settings
for each row
execute function public.set_updated_at();

alter table public.teams enable row level security;
alter table public.team_completions enable row level security;
alter table public.team_events enable row level security;
alter table public.game_settings enable row level security;

drop policy if exists "mvp anonymous teams read" on public.teams;
create policy "mvp anonymous teams read"
on public.teams for select
to anon
using (true);

drop policy if exists "mvp anonymous teams insert" on public.teams;
create policy "mvp anonymous teams insert"
on public.teams for insert
to anon
with check (true);

drop policy if exists "mvp anonymous teams update" on public.teams;
create policy "mvp anonymous teams update"
on public.teams for update
to anon
using (true)
with check (true);

drop policy if exists "mvp anonymous teams delete" on public.teams;
create policy "mvp anonymous teams delete"
on public.teams for delete
to anon
using (true);

drop policy if exists "mvp anonymous completions read" on public.team_completions;
create policy "mvp anonymous completions read"
on public.team_completions for select
to anon
using (true);

drop policy if exists "mvp anonymous completions insert" on public.team_completions;
create policy "mvp anonymous completions insert"
on public.team_completions for insert
to anon
with check (true);

drop policy if exists "mvp anonymous completions update" on public.team_completions;
create policy "mvp anonymous completions update"
on public.team_completions for update
to anon
using (true)
with check (true);

drop policy if exists "mvp anonymous completions delete" on public.team_completions;
create policy "mvp anonymous completions delete"
on public.team_completions for delete
to anon
using (true);

drop policy if exists "mvp anonymous events read" on public.team_events;
create policy "mvp anonymous events read"
on public.team_events for select
to anon
using (true);

drop policy if exists "mvp anonymous events insert" on public.team_events;
create policy "mvp anonymous events insert"
on public.team_events for insert
to anon
with check (true);

drop policy if exists "mvp anonymous settings read" on public.game_settings;
create policy "mvp anonymous settings read"
on public.game_settings for select
to anon
using (true);

drop policy if exists "mvp anonymous settings insert" on public.game_settings;
create policy "mvp anonymous settings insert"
on public.game_settings for insert
to anon
with check (true);

drop policy if exists "mvp anonymous settings update" on public.game_settings;
create policy "mvp anonymous settings update"
on public.game_settings for update
to anon
using (true)
with check (true);

insert into public.game_settings (key, value)
values
  ('registrations_open', 'true'::jsonb),
  ('final_gate_open', 'true'::jsonb),
  ('game_started', 'true'::jsonb),
  ('game_paused', 'false'::jsonb),
  ('public_leaderboard_visible', 'false'::jsonb)
on conflict (key) do nothing;
