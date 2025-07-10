CREATE POLICY "Los administradores pueden gestionar las políticas de ausencia."
ON public.time_off_policies
FOR ALL
USING (get_user_role(auth.uid()) = 'Super Administrador')
WITH CHECK (get_user_role(auth.uid()) = 'Super Administrador');