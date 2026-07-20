begin;

create table if not exists public.portal_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('candidate', 'employer')),
  full_name text not null default '',
  company text,
  phone text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists applications_owner_created_idx
  on public.applications (owner_id, created_at desc)
  where owner_id is not null;

create index if not exists portal_profiles_account_type_idx
  on public.portal_profiles (account_type);

drop trigger if exists portal_profiles_set_updated_at on public.portal_profiles;
create trigger portal_profiles_set_updated_at
before update on public.portal_profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_portal_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_type text;
begin
  requested_type := new.raw_user_meta_data ->> 'account_type';

  if requested_type in ('candidate', 'employer') then
    insert into public.portal_profiles (id, account_type, full_name, company)
    values (
      new.id,
      requested_type,
      left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 160),
      nullif(left(coalesce(new.raw_user_meta_data ->> 'company', ''), 200), '')
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_portal_profile on auth.users;
create trigger on_auth_user_created_portal_profile
after insert on auth.users
for each row execute function public.handle_new_portal_user();

alter table public.portal_profiles enable row level security;

revoke all on table public.portal_profiles from anon, authenticated;
grant select on table public.portal_profiles to authenticated;
grant update (full_name, company, phone, city) on table public.portal_profiles to authenticated;
grant all on table public.portal_profiles to service_role;

drop policy if exists "Portal users can read own profile" on public.portal_profiles;
create policy "Portal users can read own profile"
on public.portal_profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Portal users can update own profile" on public.portal_profiles;
create policy "Portal users can update own profile"
on public.portal_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "HR team can read portal profiles" on public.portal_profiles;
create policy "HR team can read portal profiles"
on public.portal_profiles
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

drop policy if exists "Portal users can read own applications" on public.applications;
create policy "Portal users can read own applications"
on public.applications
for select
to authenticated
using (
  (select auth.uid()) is not null
  and owner_id = (select auth.uid())
);

comment on table public.portal_profiles is
  'Candidate and employer self-service portal profiles linked to Supabase Auth users.';

comment on column public.portal_profiles.account_type is
  'Immutable portal account category used to match candidate or employer submissions.';

comment on column public.applications.owner_id is
  'Optional Supabase Auth owner. Public guest submissions remain null.';

commit;
