CREATE OR REPLACE FUNCTION public.get_user_role(user_id_input uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$