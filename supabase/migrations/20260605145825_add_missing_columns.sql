-- Agregar DNI a la tabla perfiles
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS dni text DEFAULT '';

-- Agregar columnas faltantes a la tabla planes
ALTER TABLE public.planes
ADD COLUMN IF NOT EXISTS tipo text,
ADD COLUMN IF NOT EXISTS velocidad integer,
ADD COLUMN IF NOT EXISTS precio_mensual numeric,
ADD COLUMN IF NOT EXISTS instalacion numeric,
ADD COLUMN IF NOT EXISTS beneficios text[];