-- ============================================================================
-- TRENING PRO — Supabase schema
-- Wykonaj w Supabase Dashboard → SQL Editor
-- ============================================================================

-- Workouts (już istnieje od pierwszej iteracji sync)
create table if not exists workouts (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, id)
);

alter table workouts enable row level security;

create policy "Users read own workouts" on workouts
  for select using (auth.uid() = user_id);
create policy "Users insert own workouts" on workouts
  for insert with check (auth.uid() = user_id);
create policy "Users update own workouts" on workouts
  for update using (auth.uid() = user_id);
create policy "Users delete own workouts" on workouts
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- Body log (nowa tabela)
-- ============================================================================
create table if not exists body_log (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, id)
);

alter table body_log enable row level security;

create policy "Users read own body" on body_log
  for select using (auth.uid() = user_id);
create policy "Users insert own body" on body_log
  for insert with check (auth.uid() = user_id);
create policy "Users update own body" on body_log
  for update using (auth.uid() = user_id);
create policy "Users delete own body" on body_log
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- User settings (1 wiersz per user, jsonb blob)
-- ============================================================================
create table if not exists user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table user_settings enable row level security;

create policy "Users read own settings" on user_settings
  for select using (auth.uid() = user_id);
create policy "Users insert own settings" on user_settings
  for insert with check (auth.uid() = user_id);
create policy "Users update own settings" on user_settings
  for update using (auth.uid() = user_id);
create policy "Users delete own settings" on user_settings
  for delete using (auth.uid() = user_id);
