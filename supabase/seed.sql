-- Seed completa para WIN Sales CRM.
-- Ejecutar despues de supabase/schema.sql.
-- Usuarios demo: cualquier password aqui es "password123" para pruebas locales/Supabase.

create extension if not exists "pgcrypto";

do $$
begin
  if to_regclass('auth.users') is null then
    raise exception 'No existe auth.users. Ejecuta esta seed dentro de un proyecto Supabase.';
  end if;
end $$;

delete from public.historial_estados
where venta_id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000012',
  '10000000-0000-0000-0000-000000000013',
  '10000000-0000-0000-0000-000000000014',
  '10000000-0000-0000-0000-000000000015',
  '10000000-0000-0000-0000-000000000016',
  '10000000-0000-0000-0000-000000000017',
  '10000000-0000-0000-0000-000000000018'
);

delete from public.ventas
where id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000012',
  '10000000-0000-0000-0000-000000000013',
  '10000000-0000-0000-0000-000000000014',
  '10000000-0000-0000-0000-000000000015',
  '10000000-0000-0000-0000-000000000016',
  '10000000-0000-0000-0000-000000000017',
  '10000000-0000-0000-0000-000000000018'
);

delete from auth.identities
where user_id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007'
);

delete from auth.users
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007'
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@win.pe', crypt('password123', gen_salt('bf')), '2026-05-20 09:00:00-05', '{"provider":"email","providers":["email"]}', '{"name":"Ariana Torres"}', '2026-05-20 09:00:00-05', '2026-05-20 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'backoffice@win.pe', crypt('password123', gen_salt('bf')), '2026-05-21 09:00:00-05', '{"provider":"email","providers":["email"]}', '{"name":"Marco Salinas"}', '2026-05-21 09:00:00-05', '2026-05-21 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'camila.rios@win.pe', crypt('password123', gen_salt('bf')), '2026-05-22 09:00:00-05', '{"provider":"email","providers":["email"]}', '{"name":"Camila Rios"}', '2026-05-22 09:00:00-05', '2026-05-22 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'luis.medina@win.pe', crypt('password123', gen_salt('bf')), '2026-05-23 09:00:00-05', '{"provider":"email","providers":["email"]}', '{"name":"Luis Medina"}', '2026-05-23 09:00:00-05', '2026-05-23 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'valeria.castro@win.pe', crypt('password123', gen_salt('bf')), '2026-05-24 09:00:00-05', '{"provider":"email","providers":["email"]}', '{"name":"Valeria Castro"}', '2026-05-24 09:00:00-05', '2026-05-24 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pedro.gomez@win.pe', crypt('password123', gen_salt('bf')), '2026-05-25 09:00:00-05', '{"provider":"email","providers":["email"]}', '{"name":"Pedro Gomez"}', '2026-05-25 09:00:00-05', '2026-05-25 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana.torres@win.pe', crypt('password123', gen_salt('bf')), '2026-05-26 09:00:00-05', '{"provider":"email","providers":["email"]}', '{"name":"Ana Torres"}', '2026-05-26 09:00:00-05', '2026-05-26 09:00:00-05');

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values
  ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@win.pe"}', 'email', 'admin@win.pe', '2026-06-03 09:18:00-05', '2026-05-20 09:00:00-05', '2026-06-03 09:18:00-05'),
  ('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub":"00000000-0000-0000-0000-000000000002","email":"backoffice@win.pe"}', 'email', 'backoffice@win.pe', '2026-06-03 09:18:00-05', '2026-05-21 09:00:00-05', '2026-06-03 09:18:00-05'),
  ('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub":"00000000-0000-0000-0000-000000000003","email":"camila.rios@win.pe"}', 'email', 'camila.rios@win.pe', '2026-06-02 10:40:00-05', '2026-05-22 09:00:00-05', '2026-06-02 10:40:00-05'),
  ('90000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub":"00000000-0000-0000-0000-000000000004","email":"luis.medina@win.pe"}', 'email', 'luis.medina@win.pe', '2026-06-03 08:42:00-05', '2026-05-23 09:00:00-05', '2026-06-03 08:42:00-05'),
  ('90000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub":"00000000-0000-0000-0000-000000000005","email":"valeria.castro@win.pe"}', 'email', 'valeria.castro@win.pe', '2026-06-02 17:30:00-05', '2026-05-24 09:00:00-05', '2026-06-02 17:30:00-05'),
  ('90000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '{"sub":"00000000-0000-0000-0000-000000000006","email":"pedro.gomez@win.pe"}', 'email', 'pedro.gomez@win.pe', '2026-06-01 15:10:00-05', '2026-05-25 09:00:00-05', '2026-06-01 15:10:00-05'),
  ('90000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '{"sub":"00000000-0000-0000-0000-000000000007","email":"ana.torres@win.pe"}', 'email', 'ana.torres@win.pe', '2026-06-03 11:05:00-05', '2026-05-26 09:00:00-05', '2026-06-03 11:05:00-05');

insert into public.perfiles (
  id,
  nombres,
  correo,
  correo_recuperacion,
  rol,
  activo,
  created_at
) values
  ('00000000-0000-0000-0000-000000000001', 'Ariana Torres', 'admin@win.pe', 'ariana.torres.personal@gmail.com', 'ADMIN', true, '2026-05-20 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000002', 'Marco Salinas', 'backoffice@win.pe', 'marco.salinas.personal@gmail.com', 'BACK', true, '2026-05-21 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000003', 'Camila Rios', 'camila.rios@win.pe', 'camila.rios.personal@gmail.com', 'SUPERVISOR', true, '2026-05-22 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000004', 'Luis Medina', 'luis.medina@win.pe', 'luis.medina.personal@gmail.com', 'ASESOR', true, '2026-05-23 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000005', 'Valeria Castro', 'valeria.castro@win.pe', 'valeria.castro.personal@gmail.com', 'ASESOR', true, '2026-05-24 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000006', 'Pedro Gomez', 'pedro.gomez@win.pe', 'pedro.gomez.personal@gmail.com', 'SUPERVISOR', true, '2026-05-25 09:00:00-05'),
  ('00000000-0000-0000-0000-000000000007', 'Ana Torres', 'ana.torres@win.pe', 'ana.torres.personal@gmail.com', 'ASESOR', true, '2026-05-26 09:00:00-05');

alter table public.ventas disable trigger ventas_validate_write;
alter table public.ventas disable trigger ventas_audit_estado;

insert into public.ventas (
  id,
  estado,
  asesor_id,
  supervisor_id,
  creado_por,
  nombres_cliente,
  tipo_documento,
  numero_documento,
  fecha_nacimiento,
  lugar_nacimiento,
  correo_cliente,
  celular_principal,
  celular_referencia,
  titular_linea,
  direccion,
  coordenadas,
  tipo_vivienda,
  distrito,
  referencia,
  plan_contratar,
  mesh,
  win_box,
  observaciones,
  observaciones_back,
  foto_dni,
  foto_recibo,
  foto_selfie,
  created_at,
  updated_at
) values
  ('10000000-0000-0000-0000-000000000001', 'PENDIENTE_GRABACION', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Diego Fernandez Molina', 'DNI', '73451289', '1991-03-18', 'Trujillo', 'diego.fernandez@example.com', '987654321', '976543210', 'Diego Fernandez', 'Jiron Pablo Picasso Mz E Lt 15', '-8.111763,-79.028686', 'Casa', 'Trujillo', 'Frente a parque principal', '750 MBPS + WINTV PREMIUM', 1, 1, 'Cliente solicita instalacion por la tarde.', '', '', '', '', '2026-06-03 12:01:00-05', '2026-06-03 12:01:00-05'),
  ('10000000-0000-0000-0000-000000000002', 'PROGRAMADO_GRABACION', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Sofia Herrera Vega', 'DNI', '70124566', '1988-10-02', 'La Esperanza', 'sofia.herrera@example.com', '912345678', '923456789', 'Sofia Herrera', 'Av. America Norte 1520 dpto 401', '-8.101235,-79.036982', 'Multifamiliar', 'La Esperanza', 'Edificio con fachada azul', '1000 MBPS + DGO FULL', 2, 2, 'Validar cobertura en piso 4.', 'Grabacion programada para 6pm.', '', '', '', '2026-05-31 11:15:00-05', '2026-06-01 16:40:00-05'),
  ('10000000-0000-0000-0000-000000000003', 'GRABADO', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'Ricardo Salazar Leon', 'DNI', '44219876', '1979-08-12', 'Moche', 'ricardo.salazar@example.com', '998877665', '977665544', 'Ricardo Salazar', 'Calle Los Jazmines 744', '-8.171345,-79.010456', 'Casa', 'Moche', 'A media cuadra del colegio', '550 MBPS SOLO INTERNET', 0, 0, '', 'Documentos validados.', '', '', '', '2026-05-29 10:00:00-05', '2026-06-01 10:00:00-05'),
  ('10000000-0000-0000-0000-000000000004', 'PROGRAMADO_INSTALACION', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Maria Fernandez Ruiz', 'DNI', '74235867', '1994-05-20', 'Surco', 'maria.fernandez@example.com', '987654321', '965432187', 'Maria Fernandez', 'Av. Los Proceres 123', '-12.143210,-76.991034', 'Casa', 'Surco', 'Porton negro', '550 MBPS + WINTV PREMIUM', 1, 0, '', 'Instalacion programada.', '', '', '', '2026-05-20 10:30:00-05', '2026-06-02 14:15:00-05'),
  ('10000000-0000-0000-0000-000000000005', 'INSTALADO', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Juan Perez Castillo', 'DNI', '77345806', '1986-07-11', 'San Miguel', 'juan.perez@example.com', '923456789', '934567891', 'Juan Perez', 'Calle Grau 550', '-12.077100,-77.092210', 'Multifamiliar', 'San Miguel', 'Torre B piso 5', '750 MBPS + WINTV PREMIUM', 1, 1, '', 'Instalado sin incidencias.', '', '', '', '2026-05-18 09:30:00-05', '2026-05-24 15:20:00-05'),
  ('10000000-0000-0000-0000-000000000006', 'RECHAZADO', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'Ana Torres Prado', 'DNI', '76251242', '1990-02-09', 'Miraflores', 'ana.torres.cliente@example.com', '933462789', '922145678', 'Ana Torres', 'Jr. Arica 214', '-12.121145,-77.029771', 'Casa', 'Miraflores', 'Casa con jardin', '550 MBPS SOLO INTERNET', 0, 0, 'Cliente no acepta condiciones.', 'Rechazado por validacion comercial.', '', '', '', '2026-04-17 13:15:00-05', '2026-04-20 17:45:00-05'),
  ('10000000-0000-0000-0000-000000000007', 'CANCELADO', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'Carlos Gomez Paredes', 'DNI', '80012345', '1982-09-14', 'San Isidro', 'carlos.gomez@example.com', '987123456', '976111222', 'Carlos Gomez', 'Av. Republica 802', '-12.097560,-77.037210', 'Casa', 'San Isidro', 'Al costado de botica', '1000 MBPS + DGO FULL', 2, 1, 'Cliente postergo compra.', 'Cancelado por solicitud del cliente.', '', '', '', '2026-04-15 16:20:00-05', '2026-04-18 12:00:00-05'),
  ('10000000-0000-0000-0000-000000000008', 'INSTALADO', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Lucia Ramirez Soto', 'DNI', '72589641', '1993-12-01', 'Magdalena', 'lucia.ramirez@example.com', '946815123', '934812456', 'Lucia Ramirez', 'Av. Brasil 1201', '-12.091520,-77.067455', 'Multifamiliar', 'Magdalena', 'Frente a grifo', '550 MBPS SOLO INTERNET', 0, 1, '', 'Cliente instalado.', '', '', '', '2026-03-13 08:40:00-05', '2026-03-18 11:20:00-05'),
  ('10000000-0000-0000-0000-000000000009', 'INSTALADO', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'Empresa ABC SAC', 'CE', '206001234567', '1980-01-01', 'Lima', 'contacto@abc.com', '987654987', '955123123', 'Empresa ABC SAC', 'Av. Industrial 301', '-12.046374,-77.042793', 'Casa', 'Lima', 'Oficina administrativa', '1000 MBPS + DGO FULL', 3, 2, 'Cliente empresarial.', 'Instalacion prioritaria completa.', '', '', '', '2026-03-12 09:10:00-05', '2026-03-15 12:00:00-05'),
  ('10000000-0000-0000-0000-000000000010', 'PENDIENTE_GRABACION', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Pedro Sanchez Mora', 'DNI', '71456987', '1987-06-27', 'Barranco', 'pedro.sanchez@example.com', '923145678', '976145678', 'Pedro Sanchez', 'Jr. Union 552', '-12.149360,-77.021750', 'Casa', 'Barranco', 'Casa de dos pisos', '750 MBPS + WINTV PREMIUM', 1, 0, 'Pendiente de validar datos.', '', '', '', '', '2026-02-10 15:50:00-05', '2026-02-10 15:50:00-05'),
  ('10000000-0000-0000-0000-000000000011', 'PROGRAMADO_GRABACION', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Rosa Mendoza Gil', 'DNI', '70451236', '1996-04-04', 'Comas', 'rosa.mendoza@example.com', '911222333', '944555666', 'Rosa Mendoza', 'Av. Tupac Amaru 1800', '-11.942450,-77.057980', 'Multifamiliar', 'Comas', 'Mercado cercano', '550 MBPS + WINTV PREMIUM', 0, 1, '', 'Grabacion agendada.', '', '', '', '2026-02-08 12:35:00-05', '2026-02-09 09:10:00-05'),
  ('10000000-0000-0000-0000-000000000012', 'GRABADO', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'Miguel Alvarez Rios', 'DNI', '75395146', '1992-11-30', 'Los Olivos', 'miguel.alvarez@example.com', '999111222', '933111222', 'Miguel Alvarez', 'Calle Las Gardenias 404', '-11.987230,-77.072360', 'Casa', 'Los Olivos', 'Reja blanca', '750 MBPS + WINTV PREMIUM', 1, 1, '', 'Grabacion aprobada.', '', '', '', '2026-01-22 10:05:00-05', '2026-01-24 13:45:00-05'),
  ('10000000-0000-0000-0000-000000000013', 'INSTALADO', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Patricia Vega Leon', 'DNI', '72987654', '1985-03-23', 'Surco', 'patricia.vega@example.com', '988776655', '977665544', 'Patricia Vega', 'Calle Las Begonias 111', '-12.135222,-76.994221', 'Casa', 'Surco', 'Cerca a parque', '1000 MBPS + DGO FULL', 2, 2, '', 'Instalado.', '', '', '', '2026-01-12 09:30:00-05', '2026-01-18 16:20:00-05'),
  ('10000000-0000-0000-0000-000000000014', 'INSTALADO', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Jorge Huaman Flores', 'DNI', '71654329', '1977-10-10', 'San Borja', 'jorge.huaman@example.com', '956789123', '945678912', 'Jorge Huaman', 'Av. Aviacion 2500', '-12.102334,-77.003123', 'Multifamiliar', 'San Borja', 'Edificio frente a estacion', '550 MBPS SOLO INTERNET', 0, 0, '', 'Instalado.', '', '', '', '2025-12-18 14:00:00-05', '2025-12-22 10:30:00-05'),
  ('10000000-0000-0000-0000-000000000015', 'INSTALADO', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'Claudia Nunez Salas', 'DNI', '79876543', '1989-01-19', 'Pueblo Libre', 'claudia.nunez@example.com', '934567890', '912345987', 'Claudia Nunez', 'Jr. Bolivar 780', '-12.075100,-77.064300', 'Casa', 'Pueblo Libre', 'Casa amarilla', '750 MBPS + WINTV PREMIUM', 1, 0, '', 'Instalado.', '', '', '', '2025-11-16 09:15:00-05', '2025-11-19 12:20:00-05'),
  ('10000000-0000-0000-0000-000000000016', 'RECHAZADO', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Roberto Castillo Diaz', 'DNI', '76665544', '1984-06-06', 'Jesus Maria', 'roberto.castillo@example.com', '966555444', '944333222', 'Roberto Castillo', 'Av. Salaverry 1440', '-12.085910,-77.048200', 'Casa', 'Jesus Maria', 'Frente a minimarket', '550 MBPS SOLO INTERNET', 0, 0, 'No pasa validacion.', 'Rechazado por deuda previa.', '', '', '', '2025-10-10 11:30:00-05', '2025-10-12 17:00:00-05'),
  ('10000000-0000-0000-0000-000000000017', 'CANCELADO', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Elena Paredes Castro', 'DNI', '75554433', '1995-08-08', 'La Molina', 'elena.paredes@example.com', '955444333', '922333444', 'Elena Paredes', 'Av. La Molina 700', '-12.082900,-76.928400', 'Casa', 'La Molina', 'Condominio privado', '1000 MBPS + DGO FULL', 2, 1, 'Cliente cancela por mudanza.', 'Cancelado.', '', '', '', '2025-09-09 16:10:00-05', '2025-09-11 09:45:00-05'),
  ('10000000-0000-0000-0000-000000000018', 'INSTALADO', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'Fernando Lujan Ortiz', 'DNI', '73332211', '1981-02-14', 'Lince', 'fernando.lujan@example.com', '944333222', '933222111', 'Fernando Lujan', 'Av. Arequipa 2100', '-12.087420,-77.034240', 'Multifamiliar', 'Lince', 'Piso 8', '750 MBPS + WINTV PREMIUM', 1, 1, '', 'Instalado.', '', '', '', '2025-08-15 10:45:00-05', '2025-08-18 15:10:00-05');

alter table public.ventas enable trigger ventas_validate_write;
alter table public.ventas enable trigger ventas_audit_estado;

insert into public.historial_estados (
  id,
  venta_id,
  usuario_id,
  estado_anterior,
  estado_nuevo,
  comentario,
  created_at
) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'PENDIENTE_GRABACION', 'PROGRAMADO_GRABACION', 'Grabacion programada para el mismo dia.', '2026-06-01 16:40:00-05'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'PENDIENTE_GRABACION', 'PROGRAMADO_GRABACION', 'Se confirma disponibilidad del cliente.', '2026-05-30 11:10:00-05'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'PROGRAMADO_GRABACION', 'GRABADO', 'Grabacion aprobada.', '2026-06-01 10:00:00-05'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'PENDIENTE_GRABACION', 'PROGRAMADO_GRABACION', 'Cliente confirma llamada.', '2026-05-20 12:00:00-05'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'PROGRAMADO_GRABACION', 'GRABADO', 'Documentacion validada.', '2026-05-20 14:15:00-05'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'GRABADO', 'PROGRAMADO_INSTALACION', 'Instalacion coordinada con tecnico.', '2026-06-02 14:15:00-05'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'PENDIENTE_GRABACION', 'PROGRAMADO_GRABACION', 'Grabacion programada.', '2026-05-18 11:00:00-05'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'PROGRAMADO_GRABACION', 'GRABADO', 'Grabacion aprobada.', '2026-05-19 10:30:00-05'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'GRABADO', 'PROGRAMADO_INSTALACION', 'Cuadrilla asignada.', '2026-05-22 09:00:00-05'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'PROGRAMADO_INSTALACION', 'INSTALADO', 'Tecnico confirma instalacion.', '2026-05-24 15:20:00-05'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'PENDIENTE_GRABACION', 'RECHAZADO', 'Cliente no acepta condiciones comerciales.', '2026-04-20 17:45:00-05'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'PENDIENTE_GRABACION', 'CANCELADO', 'Cancelado por solicitud del cliente.', '2026-04-18 12:00:00-05'),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'PROGRAMADO_INSTALACION', 'INSTALADO', 'Instalacion cerrada.', '2026-03-18 11:20:00-05'),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'PROGRAMADO_INSTALACION', 'INSTALADO', 'Instalacion prioritaria completa.', '2026-03-15 12:00:00-05'),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000002', 'PROGRAMADO_INSTALACION', 'INSTALADO', 'Servicio activo.', '2026-01-18 16:20:00-05');
