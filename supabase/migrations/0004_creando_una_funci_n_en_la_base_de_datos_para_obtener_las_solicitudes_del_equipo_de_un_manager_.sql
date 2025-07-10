CREATE OR REPLACE FUNCTION get_team_requests()
RETURNS TABLE(
  request_id BIGINT,
  employee_name TEXT,
  policy_name TEXT,
  start_date DATE,
  end_date DATE,
  total_days NUMERIC,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tor.id,
    p.display_name,
    top.policy_name,
    tor.start_date,
    tor.end_date,
    tor.total_days,
    tor.status
  FROM
    public.time_off_requests tor
  JOIN
    public.profiles p ON tor.employee_id = p.id
  JOIN
    public.time_off_policies top ON tor.policy_id = top.id
  WHERE
    p.manager_id = auth.uid() AND tor.status = 'solicitado';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;