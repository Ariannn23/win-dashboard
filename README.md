# WIN CRM Ventas

Sistema web de gestion de ventas para servicios de internet, construido con React, Vite, TypeScript, TailwindCSS, React Router, React Hook Form, Zod y Supabase.

## Ejecutar

```bash
npm install
npm run dev
```

La app funciona en modo demo si no existen variables de Supabase. Para conectar Supabase, copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## Usuarios demo

| Rol | Correo |
| --- | --- |
| ADMIN | admin@win.pe |
| BACK | backoffice@win.pe |
| SUPERVISOR | supervisor@win.pe |
| ASESOR | asesor@win.pe |

En modo demo cualquier contrasena es aceptada.

## Base de datos

Ejecuta `supabase/schema.sql` en Supabase SQL Editor. Incluye tablas, tipos, indices, triggers, Storage bucket y politicas RLS.

## Estructura

```text
src/
  app/              Arranque, rutas y providers globales
  pages/            Pantallas conectadas al router
  features/         Componentes propios de cada dominio
  shared/ui/        Componentes visuales reutilizables
  shared/layout/    Layout principal de la aplicacion
  shared/lib/       Constantes, permisos y formateadores
  shared/validation Esquemas Zod y tipos de formularios
  services/         Clientes externos y funciones de consumo
  mocks/            Datos demo para trabajar sin Supabase
```

Los imports usan el alias `@/`, por ejemplo `@/shared/ui/StatCard`.
