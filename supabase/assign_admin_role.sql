-- Before running, replace the email and choose either admin or hr.
-- Run this only from Supabase Dashboard → SQL Editor as the project owner.

do $$
declare
  target_email text := 'CHANGE_ME@example.com';
  target_role text := 'admin';
  affected_rows integer;
begin
  if target_email = 'CHANGE_ME@example.com' then
    raise exception 'Replace target_email before running this script.';
  end if;

  if target_role not in ('admin', 'hr') then
    raise exception 'target_role must be admin or hr.';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', target_role)
  where lower(email) = lower(target_email);

  get diagnostics affected_rows = row_count;

  if affected_rows = 0 then
    raise exception 'No Supabase Auth user found for %', target_email;
  end if;
end;
$$;

-- The user must sign out and sign in again so the refreshed JWT contains app_metadata.role.
