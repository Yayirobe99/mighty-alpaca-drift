-- Función auxiliar para obtener el rol de un usuario de forma segura.
CREATE OR REPLACE FUNCTION get_user_role(user_id_input UUID)
RETURNS TEXT AS $$
DECLARE
  role_name_result TEXT;
BEGIN
  SELECT r.name INTO role_name_result
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_id_input
  LIMIT 1;
  RETURN role_name_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para que los Managers vean las solicitudes de su equipo.
CREATE POLICY "Los managers pueden ver las solicitudes de su equipo."
ON public.time_off_requests FOR SELECT
USING (
  employee_id IN (SELECT id FROM public.profiles WHERE manager_id = auth.uid())
);

-- Política para que los Administradores (RR.HH.) vean todas las solicitudes.
CREATE POLICY "Los administradores pueden ver todas las solicitudes."
ON public.time_off_requests FOR SELECT
USING (get_user_role(auth.uid()) = 'Super Administrador');

-- Política para que los Managers vean los balances de su equipo.
CREATE POLICY "Los managers pueden ver los balances de su equipo."
ON public.user_time_off_balances FOR SELECT
USING (
  employee_id IN (SELECT id FROM public.profiles WHERE manager_id = auth.uid())
);

-- Política para que los Administradores (RR.HH.) vean todos los balances.
CREATE POLICY "Los administradores pueden ver todos los balances."
ON public.user_time_off_balances FOR SELECT
USING (get_user_role(auth.uid()) = 'Super Administrador');

-- Política para que Managers y Administradores puedan aprobar/rechazar solicitudes.
CREATE POLICY "Los managers y administradores pueden actualizar solicitudes."
ON public.time_off_requests FOR UPDATE
USING (
  (employee_id IN (SELECT id FROM public.profiles WHERE manager_id = auth.uid()))
  OR
  (get_user_role(auth.uid()) = 'Super Administrador')
);