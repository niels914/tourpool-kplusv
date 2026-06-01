-- ============================================================
-- Tourpool KplusV 2026 — Initieel schema
-- ============================================================

-- Profielen (gekoppeld aan Supabase Auth)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  email text not null,
  is_admin boolean not null default false,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Renners (startlijst Tour 2026)
create table public.riders (
  id uuid primary key default gen_random_uuid(),
  bib_number integer not null unique,
  bib_digit integer generated always as (bib_number % 10) stored,
  full_name text not null,
  team_name text not null,
  nationality text,
  pcs_slug text,
  is_dns boolean not null default false,
  is_dnf boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ploegkeuzes per deelnemer (8 renners, één per eindcijfer 1-8)
create table public.team_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  rider_id uuid not null references public.riders(id),
  bib_slot integer not null check (bib_slot between 1 and 8),
  created_at timestamptz not null default now(),
  unique(user_id, rider_id),
  unique(user_id, bib_slot)
);

-- Etappe types en statussen
create type public.stage_type as enum ('rit', 'ttt', 'itt');
create type public.stage_status as enum ('scheduled', 'live', 'results_pending', 'locked');

-- Etappes
create table public.stages (
  id uuid primary key default gen_random_uuid(),
  stage_number integer not null unique,
  stage_date date not null,
  stage_type public.stage_type not null default 'rit',
  departure text,
  arrival text,
  distance_km numeric(5,1),
  status public.stage_status not null default 'scheduled',
  pcs_stage_url text,
  locked_at timestamptz,
  locked_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Resultaattypes voor etappes
create type public.result_type as enum (
  'stage_finish',
  'gc_standing',
  'mountain_standing',
  'sprint_standing',
  'white_standing'
);

-- Etapperesultaten (top-10 finish + klassementsposities)
create table public.stage_results (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  rider_id uuid not null references public.riders(id),
  result_type public.result_type not null,
  position integer not null,
  created_at timestamptz not null default now(),
  unique(stage_id, result_type, position)
);

-- Eindklassementen (bonuspunten na Tour)
create type public.final_result_type as enum (
  'final_gc',
  'final_mountain',
  'final_sprint',
  'final_white'
);

create table public.final_results (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.riders(id),
  result_type public.final_result_type not null,
  position integer not null,
  unique(result_type, position)
);

-- Configuratie (deadline, etc.)
create table public.config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Seed: registratiedeadline
insert into public.config (key, value) values
  ('registration_deadline', '2026-07-04T10:01:00Z'),
  ('pool_name', 'KplusV Tourpool 2026'),
  ('entry_fee', '5');

-- Uitnodigingen
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text,
  token uuid not null unique default gen_random_uuid(),
  used_at timestamptz,
  used_by uuid references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Trigger: profiel aanmaken bij nieuwe user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
