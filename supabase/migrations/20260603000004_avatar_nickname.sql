alter table public.profiles
  add column if not exists avatar_id smallint not null default 1,
  add column if not exists nickname text unique;
