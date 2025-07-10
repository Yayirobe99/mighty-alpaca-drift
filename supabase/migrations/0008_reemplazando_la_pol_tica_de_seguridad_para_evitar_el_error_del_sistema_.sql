-- Primero, eliminamos la política existente para evitar conflictos.
DROP POLICY IF EXISTS "Los administradores pueden gestionar las políticas de ausencia." ON public.time_off_policies;

-- Ahora, creamos una nueva política más directa que no depende de la función.
CREATE POLICY "Los administradores pueden gestionar las políticas de ausencia"
ON public.time_off_policies
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Super Administrador'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Super Administrador'
  )
);