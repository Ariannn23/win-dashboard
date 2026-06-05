create table if not exists public.planes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.planes enable row level security;

drop policy if exists "planes_select" on public.planes;
drop policy if exists "planes_insert" on public.planes;
drop policy if exists "planes_update" on public.planes;

create policy "planes_select" on public.planes for select to authenticated using (activo = true or public.current_user_role() = 'ADMIN');
create policy "planes_insert" on public.planes for insert to authenticated with check (public.current_user_role() = 'ADMIN');
create policy "planes_update" on public.planes for update to authenticated using (public.current_user_role() = 'ADMIN') with check (public.current_user_role() = 'ADMIN');

drop policy if exists "perfiles_insert_admin" on public.perfiles;
drop policy if exists "perfiles_insert_admin_supervisor" on public.perfiles;

create policy "perfiles_insert_admin_supervisor" on public.perfiles for insert to authenticated with check (
  public.current_user_role() = 'ADMIN' 
  or (public.current_user_role() = 'SUPERVISOR' and rol = 'ASESOR')
);
