create extension if not exists "pgcrypto";

create type public.user_role as enum ('ADMIN', 'BACK', 'SUPERVISOR', 'ASESOR');
create type public.sale_status as enum (
  'PENDIENTE_GRABACION',
  'PROGRAMADO_GRABACION',
  'GRABADO',
  'PROGRAMADO_INSTALACION',
  'INSTALADO',
  'RECHAZADO',
  'CANCELADO'
);
create type public.document_type as enum ('DNI', 'CE', 'PASAPORTE');
create type public.housing_type as enum ('Casa', 'Multifamiliar');

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombres text not null,
  correo text not null unique,
  correo_recuperacion text not null default '',
  rol public.user_role not null default 'ASESOR',
  activo boolean not null default true,
  supervisor_id uuid references public.perfiles(id),
  created_at timestamptz not null default now()
);

create table public.planes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  tipo text not null default 'Residencial',
  velocidad numeric not null default 100,
  precio_mensual numeric not null default 89.90,
  instalacion numeric not null default 50.00,
  beneficios text[] not null default '{}',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.ventas (
  id uuid primary key default gen_random_uuid(),
  estado public.sale_status not null default 'PENDIENTE_GRABACION',
  asesor_id uuid not null references public.perfiles(id),
  supervisor_id uuid not null references public.perfiles(id),
  creado_por uuid not null references public.perfiles(id) default auth.uid(),
  nombres_cliente text not null,
  tipo_documento public.document_type not null default 'DNI',
  numero_documento varchar(15) not null,
  fecha_nacimiento date not null,
  lugar_nacimiento text not null,
  correo_cliente text not null,
  celular_principal varchar(20) not null,
  celular_referencia varchar(20) not null,
  titular_linea text not null,
  direccion text not null,
  coordenadas varchar(100) not null,
  tipo_vivienda public.housing_type not null,
  distrito text not null,
  referencia text not null,
  plan_contratar text not null,
  mesh integer not null default 0 check (mesh >= 0),
  win_box integer not null default 0 check (win_box >= 0),
  observaciones text not null default '',
  observaciones_back text not null default '',
  foto_dni text not null default '',
  foto_recibo text not null default '',
  foto_selfie text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ventas_coordenadas_formato check (
    coordenadas ~ '^-?[0-9]{1,2}(\.[0-9]+)?,\s*-?[0-9]{1,3}(\.[0-9]+)?$'
  )
);

create table public.historial_estados (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references public.ventas(id) on delete cascade,
  usuario_id uuid not null references public.perfiles(id),
  estado_anterior public.sale_status not null,
  estado_nuevo public.sale_status not null,
  comentario text not null default '',
  created_at timestamptz not null default now()
);

create index ventas_estado_idx on public.ventas(estado);
create index ventas_asesor_idx on public.ventas(asesor_id);
create index ventas_supervisor_idx on public.ventas(supervisor_id);
create index ventas_documento_idx on public.ventas(numero_documento);
create index ventas_cliente_idx on public.ventas using gin (to_tsvector('spanish', nombres_cliente));
create index historial_venta_idx on public.historial_estados(venta_id, created_at desc);

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.perfiles where id = auth.uid() and activo = true;
$$;

create or replace function public.is_admin_or_back()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() in ('ADMIN', 'BACK');
$$;

create or replace function public.next_status_allowed(
  old_status public.sale_status,
  new_status public.sale_status
)
returns boolean
language plpgsql
immutable
as $$
begin
  if new_status in ('RECHAZADO', 'CANCELADO') and old_status not in ('INSTALADO', 'RECHAZADO', 'CANCELADO') then
    return true;
  end if;

  return (
    (old_status = 'PENDIENTE_GRABACION' and new_status = 'PROGRAMADO_GRABACION') or
    (old_status = 'PROGRAMADO_GRABACION' and new_status = 'GRABADO') or
    (old_status = 'GRABADO' and new_status = 'PROGRAMADO_INSTALACION') or
    (old_status = 'PROGRAMADO_INSTALACION' and new_status = 'INSTALADO') or
    old_status = new_status
  );
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ventas_set_updated_at
before update on public.ventas
for each row execute function public.set_updated_at();

create or replace function public.validate_venta_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.user_role;
begin
  select rol into actor_role from public.perfiles where id = auth.uid() and activo = true;

  if actor_role is null then
    raise exception 'usuario_sin_perfil';
  end if;

  if tg_op = 'INSERT' then
    if actor_role not in ('ADMIN', 'SUPERVISOR', 'ASESOR') then
      raise exception 'solo_admin_supervisor_o_asesor_crea_ventas';
    end if;

    if new.estado <> 'PENDIENTE_GRABACION' then
      raise exception 'estado_inicial_invalido';
    end if;

    if actor_role = 'SUPERVISOR' and new.creado_por <> auth.uid() then
      raise exception 'supervisor_solo_crea_sus_ventas';
    end if;

    if actor_role = 'ASESOR' and (new.creado_por <> auth.uid() or new.asesor_id <> auth.uid()) then
      raise exception 'asesor_solo_crea_sus_ventas';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    if actor_role = 'ASESOR' then
      raise exception 'asesor_no_edita_ventas';
    end if;

    if actor_role = 'SUPERVISOR' then
      if old.creado_por <> auth.uid() or old.estado <> 'PENDIENTE_GRABACION' or new.estado <> old.estado then
        raise exception 'supervisor_no_puede_procesar_ventas';
      end if;
    end if;

    if new.estado <> old.estado then
      if actor_role not in ('ADMIN', 'BACK') then
        raise exception 'solo_back_admin_cambia_estados';
      end if;

      if not public.next_status_allowed(old.estado, new.estado) then
        raise exception 'flujo_estado_invalido';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger ventas_validate_write
before insert or update on public.ventas
for each row execute function public.validate_venta_write();

create or replace function public.audit_estado_venta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  comment_text text;
begin
  if new.estado is distinct from old.estado then
    comment_text := coalesce(nullif(current_setting('app.estado_comentario', true), ''), 'Cambio de estado');

    insert into public.historial_estados (
      venta_id,
      usuario_id,
      estado_anterior,
      estado_nuevo,
      comentario
    ) values (
      new.id,
      auth.uid(),
      old.estado,
      new.estado,
      comment_text
    );
  end if;

  return new;
end;
$$;

create trigger ventas_audit_estado
after update of estado on public.ventas
for each row execute function public.audit_estado_venta();

create or replace function public.cambiar_estado_venta(
  p_venta_id uuid,
  p_estado public.sale_status,
  p_comentario text default ''
)
returns public.ventas
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.ventas;
begin
  if not public.is_admin_or_back() then
    raise exception 'solo_back_admin_cambia_estados';
  end if;

  perform set_config('app.estado_comentario', coalesce(p_comentario, ''), true);

  update public.ventas
  set estado = p_estado
  where id = p_venta_id
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'venta_no_encontrada';
  end if;

  return updated_row;
end;
$$;

alter table public.perfiles enable row level security;
alter table public.ventas enable row level security;
alter table public.historial_estados enable row level security;
alter table public.planes enable row level security;

create policy "perfiles_select_autenticados"
on public.perfiles for select
to authenticated
using (activo = true or public.current_user_role() = 'ADMIN' or id = auth.uid());

create policy "perfiles_insert_admin_supervisor"
on public.perfiles for insert
to authenticated
with check (
  public.current_user_role() = 'ADMIN' 
  or (public.current_user_role() = 'SUPERVISOR' and rol = 'ASESOR')
);

create policy "perfiles_update_admin"
on public.perfiles for update
to authenticated
using (public.current_user_role() = 'ADMIN')
with check (public.current_user_role() = 'ADMIN');

create policy "planes_select"
on public.planes for select
to authenticated
using (activo = true or public.current_user_role() = 'ADMIN');

create policy "planes_insert"
on public.planes for insert
to authenticated
with check (public.current_user_role() = 'ADMIN');

create policy "planes_update"
on public.planes for update
to authenticated
using (public.current_user_role() = 'ADMIN')
with check (public.current_user_role() = 'ADMIN');

create policy "ventas_select_por_rol"
on public.ventas for select
to authenticated
using (
  public.current_user_role() in ('ADMIN', 'BACK')
  or (public.current_user_role() = 'SUPERVISOR' and (creado_por = auth.uid() or supervisor_id = auth.uid()))
  or (public.current_user_role() = 'ASESOR' and asesor_id = auth.uid())
);

create policy "ventas_insert_admin_supervisor"
on public.ventas for insert
to authenticated
with check (
  public.current_user_role() in ('ADMIN', 'SUPERVISOR', 'ASESOR')
);

create policy "ventas_update_por_rol"
on public.ventas for update
to authenticated
using (
  public.current_user_role() in ('ADMIN', 'BACK')
  or (public.current_user_role() = 'SUPERVISOR' and creado_por = auth.uid() and estado = 'PENDIENTE_GRABACION')
)
with check (
  public.current_user_role() in ('ADMIN', 'BACK', 'SUPERVISOR')
);

create policy "historial_select_visible"
on public.historial_estados for select
to authenticated
using (
  exists (
    select 1
    from public.ventas v
    where v.id = historial_estados.venta_id
      and (
        public.current_user_role() in ('ADMIN', 'BACK')
        or (public.current_user_role() = 'SUPERVISOR' and (v.creado_por = auth.uid() or v.supervisor_id = auth.uid()))
        or (public.current_user_role() = 'ASESOR' and v.asesor_id = auth.uid())
      )
  )
);

create policy "historial_insert_trigger"
on public.historial_estados for insert
to authenticated
with check (public.current_user_role() in ('ADMIN', 'BACK'));

insert into storage.buckets (id, name, public)
values ('venta-documentos', 'venta-documentos', true)
on conflict (id) do nothing;

create policy "venta_documentos_select"
on storage.objects for select
to authenticated
using (bucket_id = 'venta-documentos');

create policy "venta_documentos_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'venta-documentos');

create policy "venta_documentos_update_admin_back"
on storage.objects for update
to authenticated
using (bucket_id = 'venta-documentos' and public.current_user_role() in ('ADMIN', 'BACK', 'SUPERVISOR'))
with check (bucket_id = 'venta-documentos' and public.current_user_role() in ('ADMIN', 'BACK', 'SUPERVISOR'));
