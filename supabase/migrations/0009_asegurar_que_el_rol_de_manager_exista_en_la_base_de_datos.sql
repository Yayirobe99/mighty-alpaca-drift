INSERT INTO public.roles (name, description)
VALUES ('Manager', 'Puede aprobar solicitudes de su equipo y ver sus datos.')
ON CONFLICT (name) DO NOTHING;