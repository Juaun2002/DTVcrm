-- Rode este arquivo uma vez no Supabase: SQL Editor > New query > colar > Run.
--
-- Cada usuário tem uma linha com todos os seus dados (leads, scripts, histórico)
-- em JSON. A segurança por linha (RLS) garante que cada um só vê o que é seu.

create table if not exists public.crm_data (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.crm_data enable row level security;

grant select, insert, update on public.crm_data to authenticated;

drop policy if exists "dono le" on public.crm_data;
create policy "dono le" on public.crm_data
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "dono insere" on public.crm_data;
create policy "dono insere" on public.crm_data
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "dono atualiza" on public.crm_data;
create policy "dono atualiza" on public.crm_data
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
