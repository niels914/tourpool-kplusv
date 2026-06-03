-- ============================================================
-- Chat (berichten) en verslagen (posts)
-- ============================================================

-- Chat berichten
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select"
  on public.messages for select
  to authenticated
  using (true);

create policy "messages_insert"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "messages_delete"
  on public.messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- Index voor sortering
create index messages_created_at_idx on public.messages (created_at desc);

-- ============================================================
-- Wedstrijdverslagen
-- ============================================================

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts_select"
  on public.posts for select
  using (true);

create policy "posts_insert"
  on public.posts for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "posts_update"
  on public.posts for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "posts_delete"
  on public.posts for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Index
create index posts_created_at_idx on public.posts (created_at desc);
