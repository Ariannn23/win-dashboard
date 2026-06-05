ALTER TABLE public.planes
ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'Residencial',
ADD COLUMN IF NOT EXISTS velocidad numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS precio_mensual numeric DEFAULT 89.90,
ADD COLUMN IF NOT EXISTS instalacion numeric DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS beneficios text[] DEFAULT '{}';
