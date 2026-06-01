-- ============================================================
-- Row Level Security policies
-- ============================================================

alter table public.profiles enable row level security;
alter table public.riders enable row level security;
alter table public.team_picks enable row level security;
alter table public.stages enable row level security;
alter table public.stage_results enable row level security;
alter table public.final_results enable row level security;
alter table public.config enable row level security;
alter table public.invitations enable row level security;

-- Helper: is huidige user admin?
create or replace function public.is_admin()
returns boolean
language sql security definer as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Helper: is registratie nog open?
create or replace function public.registration_open()
returns boolean
language sql security definer as $$
  select (
    (select value from public.config where key = 'registration_deadline')::timestamptz > now()
  );
$$;

-- PROFILES
create policy "Profielen leesbaar voor ingelogde gebruikers"
  on public.profiles for select to authenticated using (true);

create policy "Eigen profiel aanmaken"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Eigen profiel bijwerken"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

create policy "Admin kan alle profielen beheren"
  on public.profiles for all to authenticated
  using (public.is_admin());

-- RIDERS
create policy "Renners leesbaar voor iedereen"
  on public.riders for select using (true);

create policy "Admin beheert renners"
  on public.riders for all to authenticated
  using (public.is_admin());

-- TEAM_PICKS
create policy "Eigen keuzes altijd leesbaar"
  on public.team_picks for select to authenticated
  using (user_id = auth.uid());

create policy "Alle keuzes leesbaar na deadline"
  on public.team_picks for select to authenticated
  using (not public.registration_open());

create policy "Keuze aanmaken voor deadline"
  on public.team_picks for insert to authenticated
  with check (user_id = auth.uid() and public.registration_open());

create policy "Keuze wijzigen voor deadline"
  on public.team_picks for update to authenticated
  using (user_id = auth.uid() and public.registration_open());

create policy "Keuze verwijderen voor deadline"
  on public.team_picks for delete to authenticated
  using (user_id = auth.uid() and public.registration_open());

create policy "Admin beheert alle keuzes"
  on public.team_picks for all to authenticated
  using (public.is_admin());

-- STAGES
create policy "Etappes leesbaar voor iedereen"
  on public.stages for select using (true);

create policy "Admin beheert etappes"
  on public.stages for all to authenticated
  using (public.is_admin());

-- STAGE_RESULTS
create policy "Etapperesultaten leesbaar voor ingelogde gebruikers"
  on public.stage_results for select to authenticated using (true);

create policy "Admin beheert etapperesultaten"
  on public.stage_results for all to authenticated
  using (public.is_admin());

-- FINAL_RESULTS
create policy "Eindresultaten leesbaar voor ingelogde gebruikers"
  on public.final_results for select to authenticated using (true);

create policy "Admin beheert eindresultaten"
  on public.final_results for all to authenticated
  using (public.is_admin());

-- CONFIG
create policy "Config leesbaar voor iedereen"
  on public.config for select using (true);

create policy "Admin beheert config"
  on public.config for all to authenticated
  using (public.is_admin());

-- INVITATIONS
create policy "Admin ziet uitnodigingen"
  on public.invitations for select to authenticated
  using (public.is_admin());

create policy "Iedereen kan token verifiëren"
  on public.invitations for select
  using (true);

create policy "Admin maakt uitnodigingen aan"
  on public.invitations for insert to authenticated
  with check (public.is_admin());

create policy "Admin verwijdert uitnodigingen"
  on public.invitations for delete to authenticated
  using (public.is_admin());

create policy "Uitnodiging gebruiken bij registratie"
  on public.invitations for update
  using (used_at is null);
