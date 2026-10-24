-- Draft for a future iteration. DO NOT run as-is as a production migration.
-- This intentionally avoids any direct public journey access; actual account signup/claims
-- and moderator privileges need careful, audited security design.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);
create table if not exists public.stations (
  id text primary key,
  name text not null,
  line text not null,
  network text not null default 'pune'
);
create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin_station_id text not null references public.stations(id),
  destination_station_id text not null references public.stations(id),
  started_at timestamptz not null,
  source text not null check (source in ('manual','assisted','verified')),
  created_at timestamptz not null default now(),
  check (origin_station_id <> destination_station_id)
);
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null
);
create table if not exists public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (community_id,user_id)
);
alter table public.profiles enable row level security;
alter table public.stations enable row level security;
alter table public.journeys enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;

create policy "profile is owner readable" on public.profiles for select to authenticated using (user_id=auth.uid());
create policy "profile is owner insertable" on public.profiles for insert to authenticated with check (user_id=auth.uid());
create policy "profile is owner updateable" on public.profiles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "stations readable" on public.stations for select to authenticated using (true);
create policy "journey owner select" on public.journeys for select to authenticated using (user_id=auth.uid());
create policy "journey owner insert" on public.journeys for insert to authenticated with check (user_id=auth.uid() and source in ('manual','assisted'));
create policy "journey owner delete" on public.journeys for delete to authenticated using (user_id=auth.uid());
create policy "community readable" on public.communities for select to authenticated using (true);
create policy "members own select" on public.community_members for select to authenticated using (user_id=auth.uid());
create policy "members own join" on public.community_members for insert to authenticated with check (user_id=auth.uid());
create policy "members own leave" on public.community_members for delete to authenticated using (user_id=auth.uid());
-- Any 'verified' source MUST be assigned by a trusted server function, never by the client.
