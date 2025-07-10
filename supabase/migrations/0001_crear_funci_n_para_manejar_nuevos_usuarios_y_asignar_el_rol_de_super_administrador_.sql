-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  super_admin_role_id BIGINT;
  employee_role_id BIGINT;
BEGIN
  -- Crear perfil para el nuevo usuario
  INSERT INTO public.profiles (id, display_name, profile_image_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);

  -- Comprobar si es el primer usuario
  IF (SELECT count(*) FROM auth.users) = 1 THEN
    -- Es el primer usuario, asignarle el rol de Super Administrador
    INSERT INTO public.roles (name, description)
    VALUES ('Super Administrador', 'Acceso total a todas las funcionalidades del sistema.')
    RETURNING id INTO super_admin_role_id;

    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, super_admin_role_id);
  ELSE
    -- No es el primer usuario, asignarle el rol de Empleado
    SELECT id INTO employee_role_id FROM public.roles WHERE name = 'Empleado';
    
    IF employee_role_id IS NULL THEN
      INSERT INTO public.roles (name, description)
      VALUES ('Empleado', 'Acceso básico a las funcionalidades de la aplicación.')
      RETURNING id INTO employee_role_id;
    END IF;

    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, employee_role_id);
  END IF;
  
  RETURN new;
END;
$$;

-- Disparador que ejecuta la función cuando un nuevo usuario se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();