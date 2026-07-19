begin;

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('candidate', 'employer')),
  status text not null default 'new' check (
    status in ('new', 'review', 'contacted', 'interview', 'presented', 'completed', 'rejected')
  ),
  source text not null default 'website',
  locale text not null default 'tm' check (locale in ('tm', 'ru')),
  fields jsonb not null default '{}'::jsonb,
  cv_metadata jsonb,
  submitter_id uuid,
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists submitter_id uuid;

create index if not exists applications_created_at_idx
  on public.applications (created_at desc);

create index if not exists applications_audience_status_idx
  on public.applications (audience, status);

create index if not exists applications_submitter_idx
  on public.applications (submitter_id)
  where submitter_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

revoke all on table public.applications from anon, authenticated;
grant select, update, delete on table public.applications to authenticated;
grant all on table public.applications to service_role;

drop policy if exists "Public can submit applications" on public.applications;

drop policy if exists "HR admins can read applications" on public.applications;
create policy "HR admins can read applications"
on public.applications
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

drop policy if exists "HR admins can update applications" on public.applications;
create policy "HR admins can update applications"
on public.applications
for update
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
)
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

drop policy if exists "HR admins can delete applications" on public.applications;
create policy "HR admins can delete applications"
on public.applications
for delete
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

comment on table public.applications is
  'Candidate applications and employer recruitment requests submitted through the protected IDEGLI Edge Function.';

comment on column public.applications.fields is
  'Sanitized form payload. Personal data is protected by row level security.';

comment on column public.applications.cv_metadata is
  'Private Storage bucket, path, filename, size and MIME type for the candidate CV.';

comment on column public.applications.submitter_id is
  'Legacy optional submitter reference. New public submissions are created by the protected Edge Function.';

commit;
