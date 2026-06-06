alter table public.perfiles
add column supervisor_id uuid references public.perfiles(id);
